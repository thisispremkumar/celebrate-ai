import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useEventContext } from '../context/EventContext';
import type { EventType, CurrencySymbol } from '../types/event';

interface NewEventModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ARCHETYPES: {
  type: EventType;
  title: string;
  defaultTheme: string;
  defaultVibe: string;
  defaultBudget: number;
  palette: string[];
}[] = [
  {
    type: 'wedding',
    title: 'Dream Wedding Celebration',
    defaultTheme: 'Ethereal Romance & Sunset Warmth',
    defaultVibe: 'Intimate candlelit celebration, elegant florals, and timeless romance',
    defaultBudget: 35000,
    palette: ['#8B263E', '#D4AF37', '#F5EBE0', '#6B705C', '#E6CCB2'],
  },
  {
    type: 'birthday',
    title: 'Milestone Birthday Party',
    defaultTheme: 'Neon Disco & Midnight Electric',
    defaultVibe: 'High-energy dancing, signature cocktails, glitter, and vibrant memories',
    defaultBudget: 5000,
    palette: ['#FF007F', '#7928CA', '#00F0FF', '#FFE600', '#111827'],
  },
  {
    type: 'community',
    title: 'Community Arts & Harvest Festival',
    defaultTheme: 'Local Harvest & Community Unity',
    defaultVibe: 'Family-friendly, inclusive, live local performers, and artisan booths',
    defaultBudget: 12000,
    palette: ['#C85A17', '#E0A96D', '#2B4C3F', '#7D3C1B', '#F4E8C1'],
  },
  {
    type: 'custom',
    title: 'Bespoke Celebration Gathering',
    defaultTheme: 'Modern Sophistication',
    defaultVibe: 'Custom celebration crafted to your personal vision',
    defaultBudget: 10000,
    palette: ['#4F46E5', '#EC4899', '#F59E0B'],
  },
];

export const NewEventModal: React.FC<NewEventModalProps> = ({ isOpen, onClose }) => {
  const { createNewEvent } = useEventContext();

  const [selectedArchetype, setSelectedArchetype] = useState<EventType>('wedding');
  const [title, setTitle] = useState('My Dream Wedding');
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 90);
    return d.toISOString().split('T')[0];
  });
  const [time, setTime] = useState('17:00');
  const [location, setLocation] = useState('Grand Estate & Gardens');
  const [guestCount, setGuestCount] = useState(100);
  const [totalBudget, setTotalBudget] = useState(30000);
  const [currency, setCurrency] = useState<CurrencySymbol>('$');
  const [theme, setTheme] = useState('Ethereal Romantic & Candlelight');
  const [vibe, setVibe] = useState('Warm, intimate romance with acoustic strings and curated wine pairings');

  if (!isOpen) return null;

  const handleSelectArchetype = (arch: (typeof ARCHETYPES)[0]) => {
    setSelectedArchetype(arch.type);
    setTitle(arch.title);
    setTheme(arch.defaultTheme);
    setVibe(arch.defaultVibe);
    setTotalBudget(arch.defaultBudget);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currentArch = ARCHETYPES.find((a) => a.type === selectedArchetype);

    createNewEvent({
      title,
      type: selectedArchetype,
      date,
      time,
      location,
      guestCount: Number(guestCount) || 50,
      totalBudget: Number(totalBudget) || 10000,
      currency,
      theme,
      vibe,
      colorPalette: currentArch?.palette || ['#6366f1', '#ec4899', '#f59e0b'],
    });

    onClose();
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="new-event-title">
      <div className="modal-content" style={{ maxWidth: 640 }}>
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-medium)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={20} className="gradient-text" />
            <h2 id="new-event-title" style={{ fontSize: '1.25rem' }}>
              Create New Celebration Plan
            </h2>
          </div>
          <button className="btn btn-ghost" onClick={onClose} aria-label="Close dialog">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {/* Archetype Selector */}
          <div style={{ marginBottom: 20 }}>
            <label className="form-label">Choose Event Archetype</label>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 10,
                marginTop: 6,
              }}
            >
              {ARCHETYPES.map((arch) => {
                const active = selectedArchetype === arch.type;
                return (
                  <button
                    key={arch.type}
                    type="button"
                    onClick={() => handleSelectArchetype(arch)}
                    className="btn"
                    style={{
                      background: active ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-secondary)',
                      borderColor: active ? 'var(--accent-primary)' : 'var(--border-subtle)',
                      color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                      justifyContent: 'flex-start',
                      padding: '12px',
                      textAlign: 'left',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                    }}
                  >
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', textTransform: 'capitalize' }}>
                      {arch.type === 'wedding' ? '💍 Wedding' : arch.type === 'birthday' ? '🎂 Birthday' : arch.type === 'community' ? '🎪 Community' : '✨ Custom Event'}
                    </span>
                    <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                      Pre-populates initial budget & timeline
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title & Date */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="evt-name">
                Celebration Title
              </label>
              <input
                id="evt-name"
                type="text"
                className="form-input"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="evt-date">
                Event Date
              </label>
              <input
                id="evt-date"
                type="date"
                className="form-input"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          {/* Location & Time */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="evt-location">
                Venue / Location
              </label>
              <input
                id="evt-location"
                type="text"
                className="form-input"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="evt-time">
                Start Time
              </label>
              <input
                id="evt-time"
                type="time"
                className="form-input"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          {/* Guests, Budget & Currency */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px', gap: 14 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="evt-guests">
                Guest Count
              </label>
              <input
                id="evt-guests"
                type="number"
                min={1}
                className="form-input"
                required
                value={guestCount}
                onChange={(e) => setGuestCount(Number(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="evt-budget">
                Total Target Budget
              </label>
              <input
                id="evt-budget"
                type="number"
                min={100}
                className="form-input"
                required
                value={totalBudget}
                onChange={(e) => setTotalBudget(Number(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="evt-curr">
                Currency
              </label>
              <select
                id="evt-curr"
                className="form-select"
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencySymbol)}
              >
                <option value="$">$ (USD)</option>
                <option value="€">€ (EUR)</option>
                <option value="£">£ (GBP)</option>
                <option value="₹">₹ (INR)</option>
                <option value="A$">A$ (AUD)</option>
                <option value="C$">C$ (CAD)</option>
              </select>
            </div>
          </div>

          {/* Theme & Vibe */}
          <div className="form-group">
            <label className="form-label" htmlFor="evt-theme">
              Theme & Aesthetic Concept
            </label>
            <input
              id="evt-theme"
              type="text"
              className="form-input"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="evt-vibe">
              Desired Vibe & Atmosphere
            </label>
            <textarea
              id="evt-vibe"
              className="form-textarea"
              rows={2}
              value={vibe}
              onChange={(e) => setVibe(e.target.value)}
            />
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 12,
              marginTop: 20,
              paddingTop: 16,
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-gradient">
              <Sparkles size={16} />
              <span>Generate Event Architecture</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
