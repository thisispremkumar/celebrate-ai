import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  CelebrationEvent,
  EventDetails,
  BudgetItem,
  TimelineItem,
  VendorItem,
  PersonalizedIdea,
  ChatMessage,
  EventType,
} from '../types/event';
import { defaultEvents } from '../data/defaultEvents';

const STORAGE_KEY = 'celebrate_events_data_v1';
const ACTIVE_ID_KEY = 'celebrate_active_event_id';

interface EventContextType {
  events: CelebrationEvent[];
  activeEvent: CelebrationEvent;
  activeEventId: string;
  setActiveEventId: (id: string) => void;
  createNewEvent: (details: Partial<EventDetails>) => string;
  updateEventDetails: (updates: Partial<EventDetails>) => void;
  deleteEvent: (id: string) => void;
  resetToDefaults: () => void;

  // Budget Actions
  addBudgetItem: (item: Omit<BudgetItem, 'id'>) => void;
  updateBudgetItem: (id: string, updates: Partial<BudgetItem>) => void;
  deleteBudgetItem: (id: string) => void;

  // Timeline Actions
  addTimelineItem: (item: Omit<TimelineItem, 'id'>) => void;
  updateTimelineItem: (id: string, updates: Partial<TimelineItem>) => void;
  deleteTimelineItem: (id: string) => void;
  toggleTimelineStatus: (id: string) => void;

  // Vendor Actions
  addVendorItem: (vendor: Omit<VendorItem, 'id'>) => void;
  updateVendorItem: (id: string, updates: Partial<VendorItem>) => void;
  deleteVendorItem: (id: string) => void;

  // Idea Actions
  addPersonalizedIdea: (idea: Omit<PersonalizedIdea, 'id'>) => void;
  toggleSaveIdea: (id: string) => void;
  deleteIdea: (id: string) => void;

  // Chat Actions
  addChatMessage: (message: ChatMessage) => void;
  clearChatHistory: () => void;

  // Import / Export
  exportActiveEventJson: () => string;
  importEventJson: (jsonStr: string) => boolean;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<CelebrationEvent[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.error('Failed to load stored events, using defaults:', err);
    }
    return defaultEvents;
  });

  const [activeEventId, setActiveEventId] = useState<string>(() => {
    try {
      const stored = localStorage.getItem(ACTIVE_ID_KEY);
      if (stored && events.some((e) => e.details.id === stored)) {
        return stored;
      }
    } catch {
      // fallback
    }
    return events[0]?.details.id || 'evt-wedding-01';
  });

  // Save to localStorage whenever events change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    } catch (err) {
      console.error('Failed to persist events to localStorage:', err);
    }
  }, [events]);

  useEffect(() => {
    try {
      localStorage.setItem(ACTIVE_ID_KEY, activeEventId);
    } catch (err) {
      console.error('Failed to persist active event ID:', err);
    }
  }, [activeEventId]);

  const activeEvent =
    events.find((e) => e.details.id === activeEventId) || events[0] || defaultEvents[0];

  const updateActiveEvent = (updater: (prev: CelebrationEvent) => CelebrationEvent) => {
    setEvents((prev) =>
      prev.map((e) => (e.details.id === activeEvent.details.id ? updater(e) : e))
    );
  };

  const updateEventDetails = (updates: Partial<EventDetails>) => {
    updateActiveEvent((prev) => ({
      ...prev,
      details: { ...prev.details, ...updates },
    }));
  };

  const createNewEvent = (customDetails: Partial<EventDetails>): string => {
    const id = `evt-${Date.now()}`;
    const type: EventType = customDetails.type || 'wedding';
    const totalBudget = customDetails.totalBudget || 10000;
    const currency = customDetails.currency || '$';

    const newEvent: CelebrationEvent = {
      details: {
        id,
        title: customDetails.title || 'My New Celebration',
        type,
        date: customDetails.date || new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
        time: customDetails.time || '17:00',
        location: customDetails.location || 'Local Community Center or Venue',
        guestCount: customDetails.guestCount || 50,
        totalBudget,
        currency,
        theme: customDetails.theme || 'Celebratory & Elegant',
        vibe: customDetails.vibe || 'Warm, joy-filled celebration with close friends and family',
        colorPalette: customDetails.colorPalette || ['#4F46E5', '#EC4899', '#F59E0B'],
        notes: customDetails.notes || 'Created with CelebrateAI assistant.',
        createdAt: new Date().toISOString(),
      },
      budget: [
        {
          id: `b-init-1`,
          category: 'Venue',
          title: 'Venue Rental & Space Fee',
          estimatedCost: Math.round(totalBudget * 0.35),
          actualCost: 0,
          paidAmount: 0,
          status: 'planned',
          notes: 'Estimated 35% of total budget',
        },
        {
          id: `b-init-2`,
          category: 'Catering & Bar',
          title: 'Food, Beverages & Cake',
          estimatedCost: Math.round(totalBudget * 0.35),
          actualCost: 0,
          paidAmount: 0,
          status: 'planned',
          notes: 'Estimated 35% of total budget',
        },
        {
          id: `b-init-3`,
          category: 'Decor & Florals',
          title: 'Decor, Table Centerpieces & Lighting',
          estimatedCost: Math.round(totalBudget * 0.12),
          actualCost: 0,
          paidAmount: 0,
          status: 'planned',
        },
        {
          id: `b-init-4`,
          category: 'Entertainment & Music',
          title: 'DJ, Audio Equipment or Live Performer',
          estimatedCost: Math.round(totalBudget * 0.1),
          actualCost: 0,
          paidAmount: 0,
          status: 'planned',
        },
        {
          id: `b-init-5`,
          category: 'Contingency',
          title: 'Emergency Cushion Reserve',
          estimatedCost: Math.round(totalBudget * 0.08),
          actualCost: 0,
          paidAmount: 0,
          status: 'planned',
        },
      ],
      timeline: [
        {
          id: `t-init-1`,
          phase: 'months_before',
          title: 'Set Date & Book Primary Venue',
          description: 'Confirm booking date and pay initial holding deposit',
          targetDate: '3 Months Out',
          category: 'Venue',
          assignedTo: 'Lead Organizer',
          status: 'not_started',
          priority: 'critical',
        },
        {
          id: `t-init-2`,
          phase: 'weeks_before',
          title: 'Send Invitations & Track RSVPs',
          description: 'Finalize headcount, dietary restrictions, and playlist songs',
          targetDate: '4 Weeks Out',
          category: 'Logistics',
          assignedTo: 'Lead Organizer',
          status: 'not_started',
          priority: 'high',
        },
        {
          id: `t-init-3`,
          phase: 'days_before',
          title: 'Final Vendor Confirmation Call',
          description: 'Confirm delivery times, contact numbers, and load-in access',
          targetDate: '3 Days Out',
          category: 'Vendors',
          assignedTo: 'Lead Organizer',
          status: 'not_started',
          priority: 'high',
        },
        {
          id: `t-init-4`,
          phase: 'day_of',
          title: 'Event Kickoff & Guest Welcome',
          description: 'Doors open, greeting music begins, and refreshments served',
          targetDate: 'Event Day',
          timeOfDay: customDetails.time || '17:00',
          category: 'Run of Show',
          assignedTo: 'Lead Organizer',
          status: 'not_started',
          priority: 'critical',
        },
      ],
      vendors: [],
      ideas: [
        {
          id: `i-init-1`,
          category: 'activity',
          title: 'Interactive Guest Wishes Wishing Tree',
          description: 'Place tags and ribbons next to a decorative branch display for guests to write heartfelt memories.',
          costImpact: 'budget_saver',
          tags: ['Interactive', 'Keepsake'],
          saved: true,
          aiGenerated: true,
        },
      ],
      chatHistory: [
        {
          id: `msg-init-1`,
          sender: 'assistant',
          text: `Welcome to "${customDetails.title || 'My New Celebration'}"! I am your AI event architect. I've drafted an initial budget distribution and milestone schedule. How would you like to start customizing?`,
          timestamp: new Date().toISOString(),
        },
      ],
    };

    setEvents((prev) => [...prev, newEvent]);
    setActiveEventId(id);
    return id;
  };

  const deleteEvent = (id: string) => {
    if (events.length <= 1) {
      alert('You must keep at least one event in your planner.');
      return;
    }
    const filtered = events.filter((e) => e.details.id !== id);
    setEvents(filtered);
    if (activeEventId === id) {
      setActiveEventId(filtered[0].details.id);
    }
  };

  const resetToDefaults = () => {
    setEvents(defaultEvents);
    setActiveEventId(defaultEvents[0].details.id);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(ACTIVE_ID_KEY);
  };

  // Budget mutations
  const addBudgetItem = (item: Omit<BudgetItem, 'id'>) => {
    const newItem: BudgetItem = {
      ...item,
      id: `b-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    updateActiveEvent((prev) => ({
      ...prev,
      budget: [...prev.budget, newItem],
    }));
  };

  const updateBudgetItem = (id: string, updates: Partial<BudgetItem>) => {
    updateActiveEvent((prev) => ({
      ...prev,
      budget: prev.budget.map((b) => (b.id === id ? { ...b, ...updates } : b)),
    }));
  };

  const deleteBudgetItem = (id: string) => {
    updateActiveEvent((prev) => ({
      ...prev,
      budget: prev.budget.filter((b) => b.id !== id),
    }));
  };

  // Timeline mutations
  const addTimelineItem = (item: Omit<TimelineItem, 'id'>) => {
    const newItem: TimelineItem = {
      ...item,
      id: `t-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    updateActiveEvent((prev) => ({
      ...prev,
      timeline: [...prev.timeline, newItem],
    }));
  };

  const updateTimelineItem = (id: string, updates: Partial<TimelineItem>) => {
    updateActiveEvent((prev) => ({
      ...prev,
      timeline: prev.timeline.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));
  };

  const deleteTimelineItem = (id: string) => {
    updateActiveEvent((prev) => ({
      ...prev,
      timeline: prev.timeline.filter((t) => t.id !== id),
    }));
  };

  const toggleTimelineStatus = (id: string) => {
    updateActiveEvent((prev) => ({
      ...prev,
      timeline: prev.timeline.map((t) => {
        if (t.id !== id) return t;
        const nextStatus: TimelineItem['status'] =
          t.status === 'completed'
            ? 'not_started'
            : t.status === 'not_started'
            ? 'in_progress'
            : 'completed';
        return { ...t, status: nextStatus };
      }),
    }));
  };

  // Vendor mutations
  const addVendorItem = (vendor: Omit<VendorItem, 'id'>) => {
    const newVendor: VendorItem = {
      ...vendor,
      id: `v-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    updateActiveEvent((prev) => ({
      ...prev,
      vendors: [...prev.vendors, newVendor],
    }));
  };

  const updateVendorItem = (id: string, updates: Partial<VendorItem>) => {
    updateActiveEvent((prev) => ({
      ...prev,
      vendors: prev.vendors.map((v) => (v.id === id ? { ...v, ...updates } : v)),
    }));
  };

  const deleteVendorItem = (id: string) => {
    updateActiveEvent((prev) => ({
      ...prev,
      vendors: prev.vendors.filter((v) => v.id !== id),
    }));
  };

  // Ideas mutations
  const addPersonalizedIdea = (idea: Omit<PersonalizedIdea, 'id'>) => {
    const newIdea: PersonalizedIdea = {
      ...idea,
      id: `idea-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    updateActiveEvent((prev) => ({
      ...prev,
      ideas: [newIdea, ...prev.ideas],
    }));
  };

  const toggleSaveIdea = (id: string) => {
    updateActiveEvent((prev) => ({
      ...prev,
      ideas: prev.ideas.map((i) => (i.id === id ? { ...i, saved: !i.saved } : i)),
    }));
  };

  const deleteIdea = (id: string) => {
    updateActiveEvent((prev) => ({
      ...prev,
      ideas: prev.ideas.filter((i) => i.id !== id),
    }));
  };

  // Chat mutations
  const addChatMessage = (message: ChatMessage) => {
    updateActiveEvent((prev) => ({
      ...prev,
      chatHistory: [...prev.chatHistory, message],
    }));
  };

  const clearChatHistory = () => {
    updateActiveEvent((prev) => ({
      ...prev,
      chatHistory: [],
    }));
  };

  // Export & Import
  const exportActiveEventJson = (): string => {
    return JSON.stringify(activeEvent, null, 2);
  };

  const importEventJson = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr) as CelebrationEvent;
      if (!parsed.details || !parsed.details.title || !parsed.details.type) {
        throw new Error('Invalid event structure: missing details');
      }
      // Assign fresh ID or retain
      const imported: CelebrationEvent = {
        ...parsed,
        details: {
          ...parsed.details,
          id: `evt-import-${Date.now()}`,
          title: `${parsed.details.title} (Imported)`,
        },
      };
      setEvents((prev) => [...prev, imported]);
      setActiveEventId(imported.details.id);
      return true;
    } catch (err) {
      console.error('Import failed:', err);
      return false;
    }
  };

  return (
    <EventContext.Provider
      value={{
        events,
        activeEvent,
        activeEventId,
        setActiveEventId,
        createNewEvent,
        updateEventDetails,
        deleteEvent,
        resetToDefaults,
        addBudgetItem,
        updateBudgetItem,
        deleteBudgetItem,
        addTimelineItem,
        updateTimelineItem,
        deleteTimelineItem,
        toggleTimelineStatus,
        addVendorItem,
        updateVendorItem,
        deleteVendorItem,
        addPersonalizedIdea,
        toggleSaveIdea,
        deleteIdea,
        addChatMessage,
        clearChatHistory,
        exportActiveEventJson,
        importEventJson,
      }}
    >
      {children}
    </EventContext.Provider>
  );
};

export const useEventContext = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEventContext must be used within an EventProvider');
  }
  return context;
};
