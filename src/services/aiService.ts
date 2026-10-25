import type {
  CelebrationEvent,
  PersonalizedIdea,
  VendorItem,
  IdeaCategory,
  ChatMessage,
} from '../types/event';

// Storage key for user provided Gemini API Key
const API_KEY_STORAGE = 'celebrate_ai_gemini_key';
const MODEL_STORAGE = 'celebrate_ai_gemini_model';

export const getStoredApiKey = (): string => {
  return localStorage.getItem(API_KEY_STORAGE) || import.meta.env.VITE_GEMINI_API_KEY || '';
};

export const setStoredApiKey = (key: string): void => {
  if (key) {
    localStorage.setItem(API_KEY_STORAGE, key.trim());
  } else {
    localStorage.removeItem(API_KEY_STORAGE);
  }
};

export const getStoredModel = (): string => {
  return localStorage.getItem(MODEL_STORAGE) || 'gemini-1.5-flash';
};

export const setStoredModel = (model: string): void => {
  localStorage.setItem(MODEL_STORAGE, model);
};

// Safe JSON extractor that handles backticks, prose, and trailing commas
export function extractJsonFromText<T>(text: string, fallback: T): T {
  try {
    // 1. Direct parse attempt
    return JSON.parse(text) as T;
  } catch {
    // 2. Try extracting from markdown code block ```json ... ```
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch && codeBlockMatch[1]) {
      try {
        return JSON.parse(codeBlockMatch[1].trim()) as T;
      } catch {
        // continue to object matching
      }
    }

    // 3. Try finding bracket or brace matching
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      try {
        const potentialJson = text.substring(firstBrace, lastBrace + 1);
        return JSON.parse(potentialJson) as T;
      } catch {
        // ignore
      }
    }

    const firstBracket = text.indexOf('[');
    const lastBracket = text.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      try {
        const potentialJson = text.substring(firstBracket, lastBracket + 1);
        return JSON.parse(potentialJson) as T;
      } catch {
        // ignore
      }
    }

    return fallback;
  }
}

interface GeminiRequestBody {
  contents: Array<{
    parts: Array<{ text: string }>;
  }>;
  generationConfig: {
    temperature: number;
    maxOutputTokens: number;
  };
  systemInstruction?: {
    parts: Array<{ text: string }>;
  };
}

interface GeminiErrorResponse {
  error?: {
    message?: string;
  };
}

interface GeminiResponseData {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
}

// Low-level caller to Google Gemini API
async function callGemini(
  prompt: string,
  systemInstruction: string = ''
): Promise<string> {
  const apiKey = getStoredApiKey();
  if (!apiKey) {
    throw new Error('NO_API_KEY');
  }

  const model = getStoredModel();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const body: GeminiRequestBody = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048,
    },
  };

  if (systemInstruction) {
    body.systemInstruction = {
      parts: [{ text: systemInstruction }],
    };
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as GeminiErrorResponse;
    const message = errorData?.error?.message || `HTTP ${response.status} ${response.statusText}`;
    throw new Error(`Gemini API Error: ${message}`);
  }

  const data = (await response.json()) as GeminiResponseData;
  const candidate = data.candidates?.[0];
  const text = candidate?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Empty response received from Gemini.');
  }

  return text;
}

// -------------------------------------------------------------
// INTELLIGENT LOCAL GENERATION ENGINE (Fallback & Instant Mode)
// -------------------------------------------------------------

function generateLocalPersonalizedIdeas(
  event: CelebrationEvent,
  categoryFilter?: IdeaCategory
): PersonalizedIdea[] {
  const { details } = event;
  const type = details.type;

  const catalog: Array<{
    category: IdeaCategory;
    title: string;
    description: string;
    costImpact: 'budget_saver' | 'low' | 'medium' | 'high';
    tags: string[];
    appliesTo: string[];
  }> = [
    // Weddings
    {
      category: 'menu',
      title: 'Artisanal Grazing Table & Local Honeycomb',
      description: `A 10-foot lush spread of artisanal cured meats, aged cheeses, fresh figs, honeycomb, and heirloom sourdough to greet ${details.guestCount} guests during twilight hour.`,
      costImpact: 'low',
      tags: ['Farm-to-Table', 'Appetizer', 'Social'],
      appliesTo: ['wedding'],
    },
    {
      category: 'decor',
      title: 'Suspended Fairy Light Canopy & Olive Branch Runners',
      description: `Create an enchanting starry night overhead with warm micro-LED filaments and fragrance-rich fresh olive branches matching ${details.theme}.`,
      costImpact: 'medium',
      tags: ['Romantic', 'Lighting', 'Atmosphere'],
      appliesTo: ['wedding'],
    },
    {
      category: 'entertainment',
      title: 'Live Painter Capturing the Vow Exchange',
      description: `An artist sets up an easel to paint your ceremony live on canvas, creating both an interactive attraction for guests and an heirloom keepsake.`,
      costImpact: 'medium',
      tags: ['Live Art', 'Keepsake', 'Bespoke'],
      appliesTo: ['wedding'],
    },
    {
      category: 'cost_saving',
      title: 'Seasonal Floral Substitution Strategy',
      description: `Replace imported out-of-season peonies with fluffy garden roses and dahlias in ${details.colorPalette[0] || 'crimson'}, cutting floral costs by ~30% with zero visual compromise.`,
      costImpact: 'budget_saver',
      tags: ['Budget Hack', 'Florals', 'Smart Savings'],
      appliesTo: ['wedding'],
    },
    {
      category: 'favor',
      title: 'Wax-Sealed Mini Botanicals & Custom Matches',
      description: `Elegant mini potted succulents or custom candle tins bearing your monogram and the date: ${details.date}.`,
      costImpact: 'budget_saver',
      tags: ['Favors', 'Eco-friendly', 'Keepsake'],
      appliesTo: ['wedding'],
    },

    // Birthdays
    {
      category: 'theme',
      title: 'Neon Glow Lounge with Custom Acrylic Signage',
      description: `Accentuate ${details.theme} with interactive LED neon tubes, mirrored plinths, and a signature acrylic birthday throne backdrop for unforgettable photos.`,
      costImpact: 'medium',
      tags: ['Vibrant', 'Photo-Op', 'Modern'],
      appliesTo: ['birthday'],
    },
    {
      category: 'menu',
      title: 'Signature Infused Cotton Candy Cocktail Cloud',
      description: `Pour sparkling wine or tonic water over fluffy organic cotton candy clouds in coupe glasses that magically melt and tint the beverage to match ${details.colorPalette[0] || 'magenta'}.`,
      costImpact: 'low',
      tags: ['Interactive Drinks', 'Signature Cocktail', 'Visual Wow'],
      appliesTo: ['birthday'],
    },
    {
      category: 'activity',
      title: 'Retro Arcade Lounge & 90s Trivia Battle',
      description: `Set up 2 retro arcade cabinet emulators with classic cooperative games and run a 15-minute high-energy birthday trivia quiz via smartphones.`,
      costImpact: 'low',
      tags: ['Games', 'High Energy', 'Crowd Pleaser'],
      appliesTo: ['birthday'],
    },
    {
      category: 'cost_saving',
      title: 'BYO Dessert Potluck Dessert Bar',
      description: `Order a stunning centerpiece mini-cake for photos/candle-blowing, but invite close foodie friends to contribute mini signature tarts, cutting bakery costs by $250+.`,
      costImpact: 'budget_saver',
      tags: ['Community', 'Budget Friendly', 'Desserts'],
      appliesTo: ['birthday'],
    },

    // Community Events
    {
      category: 'activity',
      title: 'Neighborhood Living Heritage Story Booth',
      description: `A cozy tent with podcasting microphones where youth interview longtime neighborhood residents about historical local memories, recorded for the public library archive.`,
      costImpact: 'budget_saver',
      tags: ['Intergenerational', 'Culture', 'Free'],
      appliesTo: ['community'],
    },
    {
      category: 'eco_friendly',
      title: 'Solar-Powered Acoustic Sound Stage',
      description: `Demonstrate environmental leadership by powering the acoustic performers with a mobile solar battery trailer supplied by local green energy sponsors.`,
      costImpact: 'budget_saver',
      tags: ['Green Energy', 'Eco', 'Sponsorship'],
      appliesTo: ['community'],
    },
    {
      category: 'menu',
      title: 'Multicultural Tasting Passport Trail',
      description: `Attendees buy a $15 booklet with 6 perforated stamps redeemable for bite-sized signature appetizers at 6 different local ethnic immigrant-owned food stalls.`,
      costImpact: 'low',
      tags: ['Foodies', 'Diversity', 'Revenue Generator'],
      appliesTo: ['community'],
    },
    {
      category: 'decor',
      title: 'Upcycled Burlap & Fabric Bunting Workshops',
      description: `Prior to the event, hold a community crafting circle to sew 200 meters of festive colorful overhead bunting from donated textiles.`,
      costImpact: 'budget_saver',
      tags: ['DIY', 'Upcycled', 'Community Art'],
      appliesTo: ['community'],
    },

    // Universal / Custom
    {
      category: 'favor',
      title: 'Seeded Paper Thank-You Postcards',
      description: `Hand out biodegradable cards embedded with wildflower seeds. Guests can plant them in their gardens as a blossoming reminder of the event.`,
      costImpact: 'budget_saver',
      tags: ['Eco', 'Heartfelt', 'Sustainable'],
      appliesTo: ['wedding', 'birthday', 'community', 'custom'],
    },
  ];

  const matched = catalog
    .filter((c) => c.appliesTo.includes(type) || c.appliesTo.includes('custom'))
    .filter((c) => !categoryFilter || c.category === categoryFilter);

  return matched.map((item, idx) => ({
    id: `ai-idea-${Date.now()}-${idx}`,
    category: item.category,
    title: item.title,
    description: item.description,
    costImpact: item.costImpact,
    tags: item.tags,
    saved: false,
    aiGenerated: true,
  }));
}

// -------------------------------------------------------------
// PUBLIC SERVICE API
// -------------------------------------------------------------

export async function fetchPersonalizedIdeas(
  event: CelebrationEvent,
  categoryFilter?: IdeaCategory
): Promise<PersonalizedIdea[]> {
  const apiKey = getStoredApiKey();

  if (apiKey) {
    try {
      const prompt = `You are a world-class celebration architect and event producer.
Event Details:
- Type: ${event.details.type}
- Title: "${event.details.title}"
- Guest Count: ${event.details.guestCount}
- Total Budget: ${event.details.currency}${event.details.totalBudget}
- Theme: ${event.details.theme}
- Vibe: ${event.details.vibe}
${categoryFilter ? `- Filter for category: ${categoryFilter}` : ''}

Generate 4 highly creative, deeply personalized, realistic event ideas that will delight attendees.
Respond ONLY with a JSON array in the following format:
[
  {
    "category": "${categoryFilter || 'menu'}",
    "title": "Creative Title",
    "description": "2-3 sentences explaining the experiential concept and how it ties to the theme",
    "costImpact": "budget_saver" | "low" | "medium" | "high",
    "tags": ["Tag1", "Tag2"]
  }
]`;

      interface GeminiRawIdea {
        category?: IdeaCategory;
        title?: string;
        description?: string;
        costImpact?: 'budget_saver' | 'low' | 'medium' | 'high';
        tags?: string[];
      }

      const raw = await callGemini(prompt, 'You are an elite event designer.');
      const parsed = extractJsonFromText<GeminiRawIdea[]>(raw, []);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((p, idx) => ({
          id: `ai-idea-gemini-${Date.now()}-${idx}`,
          category: p.category || categoryFilter || 'theme',
          title: p.title || 'Innovative Concept',
          description: p.description || '',
          costImpact: p.costImpact || 'medium',
          tags: Array.isArray(p.tags) ? p.tags : ['Bespoke', 'AI Recommended'],
          saved: false,
          aiGenerated: true,
        }));
      }
    } catch (err) {
      console.warn('Gemini ideas generation failed, falling back to local engine:', err);
    }
  }

  return generateLocalPersonalizedIdeas(event, categoryFilter);
}

// RFP (Request For Proposal) Generator for Vendors
export async function generateVendorRfp(
  event: CelebrationEvent,
  vendor: VendorItem
): Promise<string> {
  const apiKey = getStoredApiKey();
  const { details } = event;

  if (apiKey) {
    try {
      const prompt = `Draft a polite, professional, and thorough Request for Proposal (RFP) message to send to an event vendor.
Vendor Name: ${vendor.name}
Vendor Category: ${vendor.category}
Event Name: ${details.title}
Event Type: ${details.type}
Date: ${details.date}
Location: ${details.location}
Guest Count: ${details.guestCount}
Target Budget for this service: ${details.currency}${vendor.quotedPrice || vendor.agreedPrice || 'Negotiable'}
Event Theme & Vibe: ${details.theme} (${details.vibe})

The message should:
1. Warmly introduce the event and express interest in their work.
2. Outline key event parameters (date, venue, guest count, hours).
3. Specify requested deliverables/packages and ask for availability, detailed quote, and portfolio examples.
4. Ask about deposit, cancellation terms, and next steps for a call or consultation.
Keep it polished, structured, and easy to read.`;

      const text = await callGemini(prompt);
      if (text && text.trim().length > 50) {
        return text.trim();
      }
    } catch (err) {
      console.warn('Gemini RFP generator failed, falling back to local template:', err);
    }
  }

  // Local fallback high-touch RFP generator
  return `Subject: RFP & Availability Inquiry: ${details.title} (${details.date}) - ${vendor.category}

Dear ${vendor.contactPerson || vendor.name + ' Team'},

I hope this message finds you well! We admire your work in ${vendor.category} and would love to explore collaborating with you for our upcoming ${details.type.toLowerCase()} celebration: "${details.title}".

Here are the key details of our event:
• Date: ${details.date}
• Location/Venue: ${details.location}
• Expected Guest Count: ~${details.guestCount} guests
• Theme & Aesthetic: ${details.theme} (${details.vibe})
• Estimated Budget Range: ${details.currency}${vendor.quotedPrice ? vendor.quotedPrice.toLocaleString() : 'Open to review based on your packages'}

Could you please confirm if you currently have availability for ${details.date}? 
If so, we would love to review:
1. Your available package offerings and detailed pricing breakdowns.
2. What services, equipment, and travel fees are included.
3. Your deposit requirements, contract terms, and payment milestones.
4. Any relevant portfolio examples or recommendations you have for our specific venue and guest count.

We are looking to finalize our vendor selections shortly. Please let us know if you have time for a brief 15-minute phone or video chat this week.

Thank you so much, and we look forward to hearing from you!

Warm regards,
The Planning Team for ${details.title}
Contact: inquiry@celebrate-event.com`;
}

// Budget Health & Optimization suggestions
export interface BudgetAnalysis {
  status: 'healthy' | 'warning' | 'critical';
  headline: string;
  totalPlanned: number;
  totalCommitted: number;
  totalPaid: number;
  remainingUnallocated: number;
  pctAllocated: number;
  tips: { title: string; advice: string; potentialSavings: string }[];
}

export function analyzeBudget(event: CelebrationEvent): BudgetAnalysis {
  const { details, budget } = event;
  const totalPlanned = budget.reduce((acc, item) => acc + item.estimatedCost, 0);
  const totalCommitted = budget.reduce((acc, item) => acc + item.actualCost, 0);
  const totalPaid = budget.reduce((acc, item) => acc + item.paidAmount, 0);
  const remaining = details.totalBudget - Math.max(totalPlanned, totalCommitted);
  const pctAllocated = Math.round((Math.max(totalPlanned, totalCommitted) / details.totalBudget) * 100);

  let status: 'healthy' | 'warning' | 'critical' = 'healthy';
  let headline = 'Budget is on track with healthy contingency reserves.';

  if (pctAllocated > 105) {
    status = 'critical';
    headline = `Alert: Current allocations exceed total budget by ${details.currency}${(Math.max(totalPlanned, totalCommitted) - details.totalBudget).toLocaleString()}!`;
  } else if (pctAllocated >= 90) {
    status = 'warning';
    headline = 'Approaching maximum budget threshold. Monitor upcoming vendor contracts closely.';
  }

  const tips: { title: string; advice: string; potentialSavings: string }[] = [];

  // Tailored optimization rules
  const catering = budget.find((b) => b.category === 'Catering & Bar');
  if (catering && catering.estimatedCost > details.totalBudget * 0.38) {
    tips.push({
      title: 'Optimize Bar & Beverage Packaging',
      advice: 'Switching from an open top-shelf liquor bar to signature wine, craft beer, and 2 preset cocktails can trim 20-30% from beverage costs without guests noticing.',
      potentialSavings: `~${details.currency}${Math.round(catering.estimatedCost * 0.18).toLocaleString()}`,
    });
  }

  const decor = budget.find((b) => b.category === 'Decor & Florals');
  if (decor && decor.estimatedCost > details.totalBudget * 0.15) {
    tips.push({
      title: 'Floral Repurposing Routine',
      advice: 'Have your coordinator transfer ceremony arch flowers to the sweetheart table and dessert display for the reception.',
      potentialSavings: `~${details.currency}${Math.round(decor.estimatedCost * 0.25).toLocaleString()}`,
    });
  }

  tips.push({
    title: 'Off-Peak or Sunday/Friday Booking Perks',
    advice: 'Vendors often offer 10-15% discounts, complimentary uplighting, or waived travel fees for non-Saturday events.',
    potentialSavings: `~${details.currency}${Math.round(details.totalBudget * 0.08).toLocaleString()}`,
  });

  return {
    status,
    headline,
    totalPlanned,
    totalCommitted,
    totalPaid,
    remainingUnallocated: remaining,
    pctAllocated,
    tips,
  };
}

// AI Copilot Chat Handler
export async function sendChatMessage(
  event: CelebrationEvent,
  messages: ChatMessage[],
  userPrompt: string
): Promise<ChatMessage> {
  const apiKey = getStoredApiKey();
  const { details } = event;

  if (apiKey) {
    try {
      const historySummary = messages
        .slice(-5)
        .map((m) => `${m.sender.toUpperCase()}: ${m.text}`)
        .join('\n');

      const systemPrompt = `You are "CelebrateAI", an expert event planner, concierge, and budget strategist.
Current Event Context:
- Name: ${details.title}
- Type: ${details.type}
- Date: ${details.date}
- Location: ${details.location}
- Guests: ${details.guestCount}
- Budget: ${details.currency}${details.totalBudget}
- Theme: ${details.theme}
- Vibe: ${details.vibe}

Rules:
1. Provide warm, concise, highly actionable responses.
2. When the user asks to add an item (or when it makes obvious sense to propose one), offer a clear recommendation and if applicable describe the budget cost or timeline date.
3. Be friendly and supportive.`;

      const prompt = `Chat History:
${historySummary}
USER: ${userPrompt}

Provide a helpful response. If you recommend a specific actionable item the user could add to their plan (such as a budget expense or timeline milestone), summarize it clearly.`;

      const responseText = await callGemini(prompt, systemPrompt);

      return {
        id: `chat-${Date.now()}`,
        sender: 'assistant',
        text: responseText,
        timestamp: new Date().toISOString(),
      };
    } catch (err) {
      console.warn('Gemini chat failed, using local conversational fallback:', err);
    }
  }

  // Local Conversational Fallback with intelligent intent detection
  const lower = userPrompt.toLowerCase();
  let reply = '';
  let suggestedActions: ChatMessage['suggestedActions'] = undefined;

  if (lower.includes('budget') || lower.includes('cost') || lower.includes('money') || lower.includes('save')) {
    const analysis = analyzeBudget(event);
    reply = `Here is your current budget status: You have allocated ${details.currency}${analysis.totalPlanned.toLocaleString()} out of ${details.currency}${details.totalBudget.toLocaleString()} (${analysis.pctAllocated}%). ${analysis.headline}\n\nTop AI Tip: ${analysis.tips[0].title} — ${analysis.tips[0].advice}`;
    suggestedActions = [
      {
        label: `View Cost-Saving Tips`,
        actionType: 'add_idea',
        payload: { category: 'cost_saving' },
      },
    ];
  } else if (lower.includes('cocktail') || lower.includes('drink') || lower.includes('bar')) {
    reply = `For "${details.title}", here are two signature beverage concepts that match your ${details.vibe}:\n\n1. **The Golden Hour Spritz**: Aperol, prosecco, splash of elderflower liqueur, garnished with dehydrated orange wheels.\n2. **The Smoked Botanist**: Botanical gin, charred rosemary syrup, freshly pressed lemon, and tonic water.\n\nShall I add a signature cocktail tasting milestone to your timeline?`;
    suggestedActions = [
      {
        label: 'Add Cocktail Tasting to Timeline',
        actionType: 'add_timeline',
        payload: {
          title: 'Signature Cocktail & Bar Tasting',
          category: 'Catering',
          phase: 'weeks_before',
          priority: 'medium',
        },
      },
    ];
  } else if (lower.includes('timeline') || lower.includes('schedule') || lower.includes('run of show') || lower.includes('time')) {
    reply = `Your timeline currently has ${event.timeline.length} milestone items. For an event starting at ${details.time || '17:00'}, the optimal flow is:\n• -120 min: Vendor load-in & soundcheck\n• -45 min: Host & primary party arrival for photos\n• 00 min: Guest reception & welcome drinks\n• +60 min: Main program / ceremony / toasts\n• +120 min: Dinner & dessert\n• +180 min: Open dancefloor / entertainment`;
    suggestedActions = [
      {
        label: 'Add Day-Of Soundcheck Task',
        actionType: 'add_timeline',
        payload: {
          title: 'Audio & Vendor Technical Soundcheck',
          category: 'Logistics',
          phase: 'day_of',
          timeOfDay: '02:00 PM',
          priority: 'high',
        },
      },
    ];
  } else if (lower.includes('vendor') || lower.includes('photographer') || lower.includes('dj') || lower.includes('florist')) {
    reply = `You currently have ${event.vendors.length} vendors in your pipeline. Pro-tip: When sending RFPs for ${details.type} vendors, always ask for an itemized equipment rider and overtime hourly rates in writing to prevent surprise day-of charges.`;
  } else if (lower.includes('rain') || lower.includes('weather') || lower.includes('emergency')) {
    reply = `Great thinking to prepare! For outdoor portions at ${details.location}, here is your 3-point contingency plan:\n1. Reserve a 48-hour clear-top tent rental hold.\n2. Stock 30 matching wooden-handle white umbrellas for picturesque photos.\n3. Verify your sound & lighting vendors have covered canopy equipment.`;
    suggestedActions = [
      {
        label: 'Add Weather Reserve to Budget',
        actionType: 'add_budget',
        payload: {
          category: 'Contingency',
          title: 'Tent & Weather Contingency Deposit',
          estimatedCost: 650,
        },
      },
    ];
  } else {
    reply = `I'm on it! For your ${details.type} "${details.title}", everything is designed around the "${details.theme}" aesthetic for ${details.guestCount} guests. You can ask me to brainstorm decor accents, calculate per-guest meal targets, draft vendor RFP inquiries, or generate a minute-by-minute schedule.`;
    suggestedActions = [
      {
        label: 'Suggest 3 Unique Decor Concepts',
        actionType: 'add_idea',
        payload: { category: 'decor' },
      },
      {
        label: 'Calculate Per-Guest Budget Breakdown',
        actionType: 'add_budget',
        payload: {},
      },
    ];
  }

  return {
    id: `chat-${Date.now()}`,
    sender: 'assistant',
    text: reply,
    timestamp: new Date().toISOString(),
    suggestedActions,
  };
}
