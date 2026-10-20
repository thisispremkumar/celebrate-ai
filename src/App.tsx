import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  DollarSign,
  CalendarDays,
  Users2,
  Lightbulb,
  Bot,
} from 'lucide-react';
import { EventProvider, useEventContext } from './context/EventContext';
import { Navbar } from './components/Navbar';
import { EventHero } from './components/EventHero';
import { DashboardOverview } from './components/DashboardOverview';
import { BudgetPlanner } from './components/BudgetPlanner';
import { TimelineSchedule } from './components/TimelineSchedule';
import { VendorChecklist } from './components/VendorChecklist';
import { PersonalizedIdeasHub } from './components/PersonalizedIdeasHub';
import { AICopilotChat } from './components/AICopilotChat';
import { NewEventModal } from './components/NewEventModal';
import { SettingsModal } from './components/SettingsModal';
import { EventBriefModal } from './components/EventBriefModal';
import {
  BudgetModal,
  TimelineModal,
  VendorModal,
  EditDetailsModal,
} from './components/ItemModals';
import type { BudgetItem, TimelineItem, VendorItem } from './types/event';
import './App.css';

type TabKey = 'dashboard' | 'budget' | 'timeline' | 'vendors' | 'ideas' | 'chat';

const PlannerApp: React.FC = () => {
  const { activeEvent } = useEventContext();
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('celebrate_theme') as 'dark' | 'light') || 'dark';
  });

  // Modals state
  const [showNewEvent, setShowNewEvent] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showBrief, setShowBrief] = useState(false);
  const [showEditDetails, setShowEditDetails] = useState(false);

  const [budgetModal, setBudgetModal] = useState<{ isOpen: boolean; item?: BudgetItem | null }>({
    isOpen: false,
    item: null,
  });
  const [timelineModal, setTimelineModal] = useState<{
    isOpen: boolean;
    item?: TimelineItem | null;
  }>({
    isOpen: false,
    item: null,
  });
  const [vendorModal, setVendorModal] = useState<{ isOpen: boolean; item?: VendorItem | null }>({
    isOpen: false,
    item: null,
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('celebrate_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const TABS: { key: TabKey; label: string; icon: React.ReactNode; badgeCount?: number }[] = [
    { key: 'dashboard', label: 'Overview', icon: <LayoutDashboard size={16} /> },
    {
      key: 'budget',
      label: 'Budget & Costs',
      icon: <DollarSign size={16} />,
      badgeCount: activeEvent.budget.length,
    },
    {
      key: 'timeline',
      label: 'Timeline & Schedule',
      icon: <CalendarDays size={16} />,
      badgeCount: activeEvent.timeline.length,
    },
    {
      key: 'vendors',
      label: 'Vendors & RFPs',
      icon: <Users2 size={16} />,
      badgeCount: activeEvent.vendors.length,
    },
    {
      key: 'ideas',
      label: 'Personalized Ideas',
      icon: <Lightbulb size={16} />,
      badgeCount: activeEvent.ideas.length,
    },
    { key: 'chat', label: 'AI Copilot', icon: <Bot size={16} /> },
  ];

  return (
    <div className="app-container">
      {/* Skip to Content for Screen Readers / Accessibility */}
      <a
        href="#main-content-target"
        className="sr-only"
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          background: 'var(--accent-primary)',
          color: 'white',
          padding: '8px 16px',
          zIndex: 9999,
        }}
      >
        Skip to main content
      </a>

      {/* Navigation Header */}
      <Navbar
        onOpenNewEvent={() => setShowNewEvent(true)}
        onOpenSettings={() => setShowSettings(true)}
        onOpenBrief={() => setShowBrief(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Workspace */}
      <main id="main-content-target" className="main-content" role="main">
        {/* Hero Event Banner */}
        <EventHero onEditDetails={() => setShowEditDetails(true)} />

        {/* Tab Navigation */}
        <nav className="tabs-nav" role="tablist" aria-label="Event Planner Modules">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                role="tab"
                id={`tab-${tab.key}`}
                aria-selected={isActive}
                aria-controls={`panel-${tab.key}`}
                className={`tab-btn ${isActive ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badgeCount !== undefined && (
                  <span
                    style={{
                      fontSize: '0.7rem',
                      background: isActive ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.1)',
                      color: isActive ? 'white' : 'var(--text-secondary)',
                      padding: '1px 6px',
                      borderRadius: 'var(--radius-full)',
                      marginLeft: 2,
                    }}
                  >
                    {tab.badgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Tab Panels */}
        <div id={`panel-${activeTab}`} role="tabpanel" aria-labelledby={`tab-${activeTab}`}>
          {activeTab === 'dashboard' && (
            <DashboardOverview
              onNavigateTab={(tab) => setActiveTab(tab)}
              onOpenAddBudget={() => setBudgetModal({ isOpen: true, item: null })}
              onOpenAddTimeline={() => setTimelineModal({ isOpen: true, item: null })}
              onOpenAddVendor={() => setVendorModal({ isOpen: true, item: null })}
            />
          )}

          {activeTab === 'budget' && (
            <BudgetPlanner
              onOpenAddModal={() => setBudgetModal({ isOpen: true, item: null })}
              onEditItem={(item) => setBudgetModal({ isOpen: true, item })}
            />
          )}

          {activeTab === 'timeline' && (
            <TimelineSchedule
              onOpenAddModal={() => setTimelineModal({ isOpen: true, item: null })}
              onEditItem={(item) => setTimelineModal({ isOpen: true, item })}
            />
          )}

          {activeTab === 'vendors' && (
            <VendorChecklist
              onOpenAddModal={() => setVendorModal({ isOpen: true, item: null })}
              onEditVendor={(vendor) => setVendorModal({ isOpen: true, item: vendor })}
            />
          )}

          {activeTab === 'ideas' && <PersonalizedIdeasHub />}

          {activeTab === 'chat' && <AICopilotChat />}
        </div>
      </main>

      {/* Global Modals */}
      <NewEventModal isOpen={showNewEvent} onClose={() => setShowNewEvent(false)} />
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
      <EventBriefModal isOpen={showBrief} onClose={() => setShowBrief(false)} />
      <EditDetailsModal isOpen={showEditDetails} onClose={() => setShowEditDetails(false)} />

      <BudgetModal
        isOpen={budgetModal.isOpen}
        editItem={budgetModal.item}
        onClose={() => setBudgetModal({ isOpen: false, item: null })}
      />

      <TimelineModal
        isOpen={timelineModal.isOpen}
        editItem={timelineModal.item}
        onClose={() => setTimelineModal({ isOpen: false, item: null })}
      />

      <VendorModal
        isOpen={vendorModal.isOpen}
        editVendor={vendorModal.item}
        onClose={() => setVendorModal({ isOpen: false, item: null })}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <EventProvider>
      <PlannerApp />
    </EventProvider>
  );
};

export default App;
