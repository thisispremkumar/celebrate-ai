import { describe, it, expect } from 'vitest';
import {
  extractJsonFromText,
  analyzeBudget,
  fetchPersonalizedIdeas,
  generateVendorRfp,
  sendChatMessage,
} from '../services/aiService';
import { weddingEvent, birthdayEvent } from '../data/defaultEvents';

describe('aiService and Generative Engine', () => {
  describe('extractJsonFromText', () => {
    it('should parse direct JSON strings', () => {
      const json = '{"foo": "bar", "val": 42}';
      const result = extractJsonFromText(json, {});
      expect(result).toEqual({ foo: 'bar', val: 42 });
    });

    it('should extract JSON from markdown code blocks', () => {
      const md = 'Here is your ideas list:\n```json\n[{"title": "Sparkler Send-Off"}]\n```\nHope you like it!';
      const result = extractJsonFromText(md, []);
      expect(result).toEqual([{ title: 'Sparkler Send-Off' }]);
    });

    it('should return fallback if input contains completely invalid text', () => {
      const invalid = 'Not a json at all';
      const fallback = { status: 'fallback' };
      const result = extractJsonFromText(invalid, fallback);
      expect(result).toEqual(fallback);
    });
  });

  describe('analyzeBudget', () => {
    it('should accurately calculate budget status and totals for Wedding event', () => {
      const analysis = analyzeBudget(weddingEvent);
      expect(analysis.totalPlanned).toBeGreaterThan(0);
      expect(analysis.pctAllocated).toBeGreaterThan(0);
      expect(analysis.remainingUnallocated).toBeDefined();
      expect(['healthy', 'warning', 'critical']).toContain(analysis.status);
      expect(analysis.tips.length).toBeGreaterThan(0);
    });

    it('should flag critical status when expenses exceed 105% of total budget', () => {
      const overBudgetEvent = {
        ...birthdayEvent,
        details: { ...birthdayEvent.details, totalBudget: 1000 },
        budget: [
          {
            id: 'b-over',
            category: 'Venue' as const,
            title: 'Expensive Hall',
            estimatedCost: 2000,
            actualCost: 2000,
            paidAmount: 1000,
            status: 'deposit_paid' as const,
          },
        ],
      };

      const analysis = analyzeBudget(overBudgetEvent);
      expect(analysis.status).toBe('critical');
      expect(analysis.headline).toContain('Alert');
    });
  });

  describe('fetchPersonalizedIdeas', () => {
    it('should generate personalized ideas tailored to wedding event type', async () => {
      const ideas = await fetchPersonalizedIdeas(weddingEvent);
      expect(ideas.length).toBeGreaterThan(0);
      expect(ideas[0]).toHaveProperty('title');
      expect(ideas[0]).toHaveProperty('description');
      expect(ideas[0]).toHaveProperty('costImpact');
    });

    it('should filter ideas by category when requested', async () => {
      const menuIdeas = await fetchPersonalizedIdeas(weddingEvent, 'menu');
      expect(menuIdeas.every((i) => i.category === 'menu')).toBe(true);
    });
  });

  describe('generateVendorRfp', () => {
    it('should draft a complete, professional RFP referencing event venue and date', async () => {
      const vendor = weddingEvent.vendors[0];
      const rfp = await generateVendorRfp(weddingEvent, vendor);

      expect(rfp).toContain(weddingEvent.details.title);
      expect(rfp).toContain(weddingEvent.details.date);
      expect(rfp).toContain(vendor.category);
    });
  });

  describe('sendChatMessage', () => {
    it('should return contextual response with suggested actions for budget queries', async () => {
      const response = await sendChatMessage(weddingEvent, [], 'How can I save budget?');
      expect(response.sender).toBe('assistant');
      expect(response.text.toLowerCase()).toContain('budget');
      expect(response.suggestedActions).toBeDefined();
    });

    it('should provide cocktail suggestions when user asks about drinks', async () => {
      const response = await sendChatMessage(birthdayEvent, [], 'What drinks should we serve?');
      expect(response.text.toLowerCase()).toMatch(/cocktail|drink|spritz|botanist/);
    });
  });
});
