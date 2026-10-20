import React from 'react';
import confetti from 'canvas-confetti';
import {
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Sparkles,
  Edit3,
  PartyPopper,
} from 'lucide-react';
import { useEventContext } from '../context/EventContext';

interface EventHeroProps {
  onEditDetails: () => void;
}

export const EventHero: React.FC<EventHeroProps> = ({ onEditDetails }) => {
  const { activeEvent } = useEventContext();
  const { details } = activeEvent;

  // Calculate days remaining
  const calculateDaysRemaining = (targetDate: string): string => {
    try {
      const target = new Date(targetDate);
      const now = new Date();
      // zero out time
      target.setHours(0, 0, 0, 0);
      now.setHours(0, 0, 0, 0);
      const diffTime = target.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return '🎉 Today is the big day!';
      if (diffDays === 1) return '⏳ 1 day away!';
      if (diffDays > 1) return `⏳ In ${diffDays} days`;
      return `Completed on ${targetDate}`;
    } catch {
      return targetDate;
    }
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: details.colorPalette && details.colorPalette.length > 0
        ? details.colorPalette
        : ['#6366f1', '#ec4899', '#f59e0b', '#10b981'],
    });
  };

  const getHeroClass = () => {
    switch (details.type) {
      case 'wedding':
        return 'hero-wedding';
      case 'birthday':
        return 'hero-birthday';
      case 'community':
        return 'hero-community';
      default:
        return '';
    }
  };

  const getBadgeClass = () => {
    switch (details.type) {
      case 'wedding':
        return 'badge-wedding';
      case 'birthday':
        return 'badge-birthday';
      case 'community':
        return 'badge-community';
      default:
        return 'badge-custom';
    }
  };

  return (
    <div className={`event-hero ${getHeroClass()}`} role="region" aria-label="Event Details Overview">
      <div className="hero-meta-row">
        <div className="hero-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span className={`badge ${getBadgeClass()}`}>
              {details.type}
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {calculateDaysRemaining(details.date)}
            </span>
          </div>
          <h1>{details.title}</h1>
          <p className="hero-vibe">{details.vibe}</p>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            className="btn btn-secondary"
            onClick={onEditDetails}
            aria-label="Edit event details"
          >
            <Edit3 size={15} />
            <span>Edit Info</span>
          </button>
          <button
            className="btn btn-gradient"
            onClick={triggerConfetti}
            title="Celebrate Milestone"
            aria-label="Trigger Confetti Celebration"
          >
            <PartyPopper size={16} />
            <span>Celebrate!</span>
          </button>
        </div>
      </div>

      <div className="hero-tags">
        <div className="hero-pill">
          <Calendar size={14} className="text-muted" aria-hidden="true" />
          <span>{details.date} {details.time ? `at ${details.time}` : ''}</span>
        </div>

        <div className="hero-pill">
          <MapPin size={14} className="text-muted" aria-hidden="true" />
          <span>{details.location}</span>
        </div>

        <div className="hero-pill">
          <Users size={14} className="text-muted" aria-hidden="true" />
          <span>{details.guestCount} Guests</span>
        </div>

        <div className="hero-pill">
          <DollarSign size={14} className="text-muted" aria-hidden="true" />
          <span>Budget: {details.currency}{details.totalBudget.toLocaleString()}</span>
        </div>

        {details.colorPalette && details.colorPalette.length > 0 && (
          <div className="hero-pill">
            <Sparkles size={14} className="text-muted" aria-hidden="true" />
            <span>Palette:</span>
            <div className="color-swatches" aria-label="Event Color Palette">
              {details.colorPalette.map((color, i) => (
                <span
                  key={i}
                  className="color-dot"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
