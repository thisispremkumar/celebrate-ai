import React from 'react';
import {
  Sparkles,
  Calendar,
  PlusCircle,
  Moon,
  Sun,
  Settings,
  FileDown,
  RotateCcw,
} from 'lucide-react';
import { useEventContext } from '../context/EventContext';

interface NavbarProps {
  onOpenNewEvent: () => void;
  onOpenSettings: () => void;
  onOpenBrief: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenNewEvent,
  onOpenSettings,
  onOpenBrief,
  theme,
  onToggleTheme,
}) => {
  const { events, activeEventId, setActiveEventId, resetToDefaults } = useEventContext();
  const handleReset = () => {
    if (window.confirm('Reset all events and restore default demo plans? Any unsaved custom events will be restored to defaults.')) {
      resetToDefaults();
    }
  };

  return (
    <header className="navbar" role="banner">
      <div className="nav-brand" tabIndex={0} role="button" aria-label="CelebrateAI Home">
        <div className="brand-icon" aria-hidden="true">
          <Sparkles size={20} />
        </div>
        <div>
          <div className="brand-title">
            Celebrate<span className="gradient-text">AI</span>
          </div>
          <div className="brand-subtitle">GenAI Event Architect</div>
        </div>
      </div>

      {/* Event Switcher */}
      <div className="event-switcher-wrapper" role="region" aria-label="Event Switcher">
        <Calendar size={16} className="text-muted" aria-hidden="true" />
        <label htmlFor="event-select" className="sr-only">
          Select Active Event
        </label>
        <select
          id="event-select"
          className="event-select"
          value={activeEventId}
          onChange={(e) => setActiveEventId(e.target.value)}
          aria-label="Current Celebration Event"
        >
          {events.map((evt) => (
            <option key={evt.details.id} value={evt.details.id}>
              {evt.details.type.toUpperCase()}: {evt.details.title}
            </option>
          ))}
        </select>
        <button
          className="btn btn-ghost"
          style={{ padding: '4px 8px', fontSize: '0.8rem' }}
          onClick={onOpenNewEvent}
          title="Create New Event Plan"
          aria-label="Create New Event"
        >
          <PlusCircle size={15} />
          <span>New</span>
        </button>
      </div>

      {/* Nav Actions */}
      <div className="nav-actions">
        <button
          className="btn btn-secondary"
          onClick={onOpenBrief}
          title="View & Print Event Dossier"
          aria-label="View Printable Event Brief"
        >
          <FileDown size={15} />
          <span className="d-none-sm">Export Brief</span>
        </button>

        <button
          className="btn btn-ghost"
          onClick={onToggleTheme}
          aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button
          className="btn btn-ghost"
          onClick={onOpenSettings}
          title="AI & API Settings"
          aria-label="Settings and Gemini API Key"
        >
          <Settings size={18} />
        </button>

        <button
          className="btn btn-ghost"
          onClick={handleReset}
          title="Reset to Demo Defaults"
          aria-label="Reset events to defaults"
        >
          <RotateCcw size={16} />
        </button>
      </div>
    </header>
  );
};
