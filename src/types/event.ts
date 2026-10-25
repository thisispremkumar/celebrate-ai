export type EventType = 'wedding' | 'birthday' | 'community' | 'custom';

export type CurrencySymbol = '$' | '€' | '£' | '₹' | 'A$' | 'C$';

export interface EventDetails {
  id: string;
  title: string;
  type: EventType;
  date: string; // YYYY-MM-DD
  time?: string;
  location: string;
  guestCount: number;
  totalBudget: number;
  currency: CurrencySymbol;
  theme: string;
  vibe: string;
  colorPalette: string[]; // Hex codes or descriptions
  notes: string;
  createdAt: string;
}

export type BudgetCategory =
  | 'Venue'
  | 'Catering & Bar'
  | 'Decor & Florals'
  | 'Photography & Video'
  | 'Entertainment & Music'
  | 'Attire & Beauty'
  | 'Invitations & Favors'
  | 'Permits & Logistics'
  | 'Contingency'
  | 'Other';

export interface BudgetItem {
  id: string;
  category: BudgetCategory;
  title: string;
  estimatedCost: number;
  actualCost: number;
  paidAmount: number;
  status: 'planned' | 'deposit_paid' | 'paid_in_full' | 'overdue';
  vendorId?: string;
  notes?: string;
}

export type TimelinePhase =
  | 'months_before'
  | 'weeks_before'
  | 'days_before'
  | 'day_of'
  | 'post_event';

export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface TimelineItem {
  id: string;
  phase: TimelinePhase;
  title: string;
  description: string;
  targetDate: string; // e.g. "3 months out" or specific date/time
  timeOfDay?: string; // e.g. "09:00 AM" for Day-of Run-of-Show
  category: string;
  assignedTo: string;
  status: 'not_started' | 'in_progress' | 'completed';
  priority: TaskPriority;
}

export type VendorStatus =
  | 'to_research'
  | 'contacted'
  | 'quoted'
  | 'shortlisted'
  | 'contract_signed'
  | 'deposit_paid'
  | 'completed';

export interface VendorItem {
  id: string;
  name: string;
  category: string;
  contactPerson: string;
  email: string;
  phone: string;
  website?: string;
  status: VendorStatus;
  rating: number; // 1-5
  quotedPrice: number;
  agreedPrice: number;
  depositAmount: number;
  notes: string;
  rfpSent: boolean;
  rfpContent?: string;
}

export type IdeaCategory =
  | 'theme'
  | 'decor'
  | 'menu'
  | 'entertainment'
  | 'favor'
  | 'activity'
  | 'cost_saving'
  | 'eco_friendly';

export interface PersonalizedIdea {
  id: string;
  category: IdeaCategory;
  title: string;
  description: string;
  costImpact: 'budget_saver' | 'low' | 'medium' | 'high';
  tags: string[];
  saved: boolean;
  aiGenerated?: boolean;
}

export interface ChatActionPayload {
  query?: string;
  category?: string;
  title?: string;
  description?: string;
  phase?: TimelinePhase;
  priority?: TaskPriority;
  targetDate?: string;
  timeOfDay?: string;
  estimatedCost?: number;
  actualCost?: number;
  quotedPrice?: number;
  notes?: string;
}

export interface ChatSuggestedAction {
  label: string;
  actionType: 'add_budget' | 'add_timeline' | 'add_vendor' | 'add_idea';
  payload: ChatActionPayload;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  suggestedActions?: ChatSuggestedAction[];
}

export interface CelebrationEvent {
  details: EventDetails;
  budget: BudgetItem[];
  timeline: TimelineItem[];
  vendors: VendorItem[];
  ideas: PersonalizedIdea[];
  chatHistory: ChatMessage[];
}

export interface AISettings {
  apiKey: string;
  model: string;
  temperature: number;
}
