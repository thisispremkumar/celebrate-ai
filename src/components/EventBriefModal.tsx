import React from 'react';
import { Printer, X, Sparkles } from 'lucide-react';
import { useEventContext } from '../context/EventContext';
import { analyzeBudget } from '../services/aiService';

interface EventBriefModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EventBriefModal: React.FC<EventBriefModalProps> = ({ isOpen, onClose }) => {
  const { activeEvent } = useEventContext();
  const { details, budget, timeline, vendors, ideas } = activeEvent;

  if (!isOpen) return null;

  const analysis = analyzeBudget(activeEvent);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="brief-title">
      <div className="modal-content" style={{ maxWidth: 850 }}>
        {/* Modal Controls (Hidden in print) */}
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid var(--border-medium)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={18} className="gradient-text" />
            <h3 id="brief-title" style={{ fontSize: '1.15rem' }}>
              Celebration Dossier & Executive Brief
            </h3>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary" onClick={handlePrint}>
              <Printer size={15} />
              <span>Print / Save as PDF</span>
            </button>
            <button className="btn btn-ghost" onClick={onClose} aria-label="Close brief">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: 28 }}>
          {/* Executive Header */}
          <div style={{ borderBottom: '2px solid var(--border-medium)', paddingBottom: 20 }}>
            <span
              className="badge"
              style={{
                textTransform: 'uppercase',
                background: 'rgba(99, 102, 241, 0.15)',
                color: 'var(--accent-primary)',
                marginBottom: 8,
              }}
            >
              {details.type} Master Plan
            </span>
            <h1 style={{ fontSize: '2rem', marginTop: 4 }}>{details.title}</h1>
            <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)', marginTop: 4 }}>
              "{details.vibe}"
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 12,
                marginTop: 18,
                fontSize: '0.9rem',
              }}
            >
              <div>
                <strong>Date & Time:</strong>
                <div>{details.date} {details.time ? `at ${details.time}` : ''}</div>
              </div>
              <div>
                <strong>Location:</strong>
                <div>{details.location}</div>
              </div>
              <div>
                <strong>Expected Guests:</strong>
                <div>{details.guestCount} Attendees</div>
              </div>
              <div>
                <strong>Total Budget:</strong>
                <div>{details.currency}{details.totalBudget.toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* Financial Summary */}
          <div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: 12 }}>1. Financial & Budget Breakdown</h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 10,
                marginBottom: 16,
                background: 'var(--bg-secondary)',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target Budget</span>
                <div style={{ fontWeight: 700 }}>{details.currency}{details.totalBudget.toLocaleString()}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Estimated</span>
                <div style={{ fontWeight: 700 }}>{details.currency}{analysis.totalPlanned.toLocaleString()}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Cleared Payments</span>
                <div style={{ fontWeight: 700, color: 'var(--status-success)' }}>
                  {details.currency}{analysis.totalPaid.toLocaleString()}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Remaining Buffer</span>
                <div style={{ fontWeight: 700 }}>{details.currency}{analysis.remainingUnallocated.toLocaleString()}</div>
              </div>
            </div>

            <table className="data-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Item</th>
                  <th>Estimated</th>
                  <th>Actual</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {budget.map((b) => (
                  <tr key={b.id}>
                    <td>{b.category}</td>
                    <td>{b.title}</td>
                    <td>{details.currency}{b.estimatedCost.toLocaleString()}</td>
                    <td>{b.actualCost ? `${details.currency}${b.actualCost.toLocaleString()}` : '—'}</td>
                    <td>{b.status.replace('_', ' ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Master Timeline */}
          <div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: 12 }}>2. Master Schedule & Run of Show</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timing</th>
                  <th>Milestone Task</th>
                  <th>Phase</th>
                  <th>Responsible</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {timeline.map((t) => (
                  <tr key={t.id}>
                    <td style={{ fontWeight: 600 }}>{t.timeOfDay || t.targetDate}</td>
                    <td>{t.title}</td>
                    <td>{t.phase.replace('_', ' ')}</td>
                    <td>{t.assignedTo}</td>
                    <td>{t.status.replace('_', ' ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Vendor Contacts */}
          <div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: 12 }}>3. Vendor Directory & Status</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Vendor</th>
                  <th>Category</th>
                  <th>Contact Info</th>
                  <th>Agreed Fee</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {vendors.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                      No vendors added yet.
                    </td>
                  </tr>
                ) : (
                  vendors.map((v) => (
                    <tr key={v.id}>
                      <td style={{ fontWeight: 600 }}>{v.name}</td>
                      <td>{v.category}</td>
                      <td>
                        {v.email} {v.phone ? `• ${v.phone}` : ''}
                      </td>
                      <td>{details.currency}{(v.agreedPrice || v.quotedPrice).toLocaleString()}</td>
                      <td>{v.status.replace('_', ' ')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Curated AI Ideas */}
          {ideas.filter((i) => i.saved).length > 0 && (
            <div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: 12 }}>4. Signature Curated Experiences</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {ideas
                  .filter((i) => i.saved)
                  .map((idea) => (
                    <div
                      key={idea.id}
                      style={{
                        padding: '10px 14px',
                        background: 'var(--bg-secondary)',
                        borderRadius: 'var(--radius-md)',
                      }}
                    >
                      <strong>{idea.title}</strong> ({idea.category})
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                        {idea.description}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          <div
            style={{
              textAlign: 'center',
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: 16,
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
            }}
          >
            Generated by CelebrateAI – Event Planning Assistant • Confidential & Event Coordinator Copy
          </div>
        </div>
      </div>
    </div>
  );
};
