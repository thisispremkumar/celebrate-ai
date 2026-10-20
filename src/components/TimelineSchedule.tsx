import React, { useState } from 'react';
import {
  Clock,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Filter,
  Download,
  Sparkles,
  ListOrdered,
  Layers,
} from 'lucide-react';
import { useEventContext } from '../context/EventContext';
import type { TimelineItem, TimelinePhase, TaskPriority } from '../types/event';

interface TimelineScheduleProps {
  onOpenAddModal: () => void;
  onEditItem: (item: TimelineItem) => void;
}

const PHASE_LABELS: Record<TimelinePhase, { label: string; icon: string }> = {
  months_before: { label: 'Months Before (Strategy & Booking)', icon: '🗓️' },
  weeks_before: { label: 'Weeks Before (Details & Finalization)', icon: '📝' },
  days_before: { label: 'Days Before (Rehearsal & Logistics)', icon: '📦' },
  day_of: { label: 'Day of Celebration (Run of Show)', icon: '✨' },
  post_event: { label: 'Post-Event (Wrap-Up & Thank Yous)', icon: '💌' },
};

export const TimelineSchedule: React.FC<TimelineScheduleProps> = ({
  onOpenAddModal,
  onEditItem,
}) => {
  const { activeEvent, toggleTimelineStatus, deleteTimelineItem, addTimelineItem } =
    useEventContext();
  const { details, timeline } = activeEvent;

  const [viewMode, setViewMode] = useState<'phased' | 'day_of'>('phased');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [aiSuggesting, setAiSuggesting] = useState(false);

  // Filter tasks
  const filteredTasks = timeline.filter((t) => {
    if (viewMode === 'day_of' && t.phase !== 'day_of') return false;
    if (statusFilter === 'pending' && t.status === 'completed') return false;
    if (statusFilter === 'completed' && t.status !== 'completed') return false;
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    return true;
  });

  // Export to iCalendar (.ics) format
  const exportIcal = () => {
    const calendarEvents = timeline.map((item) => {
      const summary = `${item.title} (${details.title})`;
      const description = `${item.description || ''}\\nPhase: ${item.phase}\\nAssigned: ${item.assignedTo}`;
      // Basic ics format entry
      return `BEGIN:VEVENT
UID:${item.id}@celebrateai.app
SUMMARY:${summary}
DESCRIPTION:${description}
STATUS:${item.status === 'completed' ? 'COMPLETED' : 'CONFIRMED'}
PRIORITY:${item.priority === 'critical' ? '1' : item.priority === 'high' ? '2' : '3'}
END:VEVENT`;
    });

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//CelebrateAI//Event Planner//EN
CALSCALE:GREGORIAN
${calendarEvents.join('\n')}
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${details.title.replace(/\s+/g, '_')}_Schedule.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // AI Task Suggester
  const handleAiSuggestTasks = () => {
    setAiSuggesting(true);
    setTimeout(() => {
      // Dynamic suggestion based on type
      if (details.type === 'wedding') {
        addTimelineItem({
          phase: 'day_of',
          title: 'Reception Cake Cutting & Champagne Toast',
          description: 'Announce cake cutting, photo capture with sparklers, followed by dessert service',
          targetDate: 'Wedding Day',
          timeOfDay: '08:30 PM',
          category: 'Reception',
          assignedTo: 'Emcee & Coordinator',
          status: 'not_started',
          priority: 'high',
        });
        addTimelineItem({
          phase: 'post_event',
          title: 'Mail Handwritten Thank-You Cards & Review Vendors',
          description: 'Send personalized photo cards to all guests and leave 5-star reviews for vendors',
          targetDate: '2 Weeks After',
          category: 'Follow-Up',
          assignedTo: 'Couple',
          status: 'not_started',
          priority: 'medium',
        });
      } else if (details.type === 'birthday') {
        addTimelineItem({
          phase: 'day_of',
          title: 'Surprise Midnight Confetti Countdown',
          description: 'DJ cues track, confetti cannon release, celebratory cheers',
          targetDate: 'Party Night',
          timeOfDay: '11:59 PM',
          category: 'Highlight',
          assignedTo: 'DJ & Host',
          status: 'not_started',
          priority: 'high',
        });
      } else {
        addTimelineItem({
          phase: 'day_of',
          title: 'Community Volunteer De-Brief & Cleanup Crew Walk',
          description: 'Gather lead volunteers for trash check, lost and found consolidation, and street sweep',
          targetDate: 'Festival Evening',
          timeOfDay: '06:00 PM',
          category: 'Logistics',
          assignedTo: 'Volunteer Leads',
          status: 'not_started',
          priority: 'critical',
        });
      }
      setAiSuggesting(false);
    }, 600);
  };

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'critical':
        return (
          <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
            Critical
          </span>
        );
      case 'high':
        return (
          <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
            High
          </span>
        );
      case 'medium':
        return (
          <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
            Medium
          </span>
        );
      default:
        return (
          <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.08)', color: 'var(--text-muted)' }}>
            Low
          </span>
        );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Top Header & View Mode Switcher */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-md)',
              display: 'inline-flex',
              padding: 3,
            }}
          >
            <button
              className={`btn btn-ghost ${viewMode === 'phased' ? 'btn-primary' : ''}`}
              style={{ padding: '6px 14px', fontSize: '0.85rem' }}
              onClick={() => setViewMode('phased')}
            >
              <Layers size={15} />
              <span>Phased Timeline</span>
            </button>
            <button
              className={`btn btn-ghost ${viewMode === 'day_of' ? 'btn-primary' : ''}`}
              style={{ padding: '6px 14px', fontSize: '0.85rem' }}
              onClick={() => setViewMode('day_of')}
            >
              <ListOrdered size={15} />
              <span>Day-Of Run of Show</span>
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <button
            className="btn btn-secondary"
            onClick={handleAiSuggestTasks}
            disabled={aiSuggesting}
            title="Auto-suggest missing milestone tasks"
          >
            <Sparkles size={15} className="gradient-text" />
            <span>{aiSuggesting ? 'Analyzing...' : 'AI Auto-Suggest Tasks'}</span>
          </button>
          <button className="btn btn-secondary" onClick={exportIcal} title="Export to Calendar (.ics)">
            <Download size={15} />
            <span>Export .ICS</span>
          </button>
          <button className="btn btn-primary" onClick={onOpenAddModal}>
            <Plus size={15} />
            <span>Add Milestone</span>
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div
        className="glass-panel"
        style={{
          padding: '12px 18px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 14,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          <Filter size={15} />
          <span>Filters:</span>
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          {(['all', 'pending', 'completed'] as const).map((status) => (
            <button
              key={status}
              className={`btn btn-ghost ${statusFilter === status ? 'btn-secondary' : ''}`}
              style={{ padding: '4px 10px', fontSize: '0.8rem', textTransform: 'capitalize' }}
              onClick={() => setStatusFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <label htmlFor="priority-filter" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Priority:
          </label>
          <select
            id="priority-filter"
            className="form-select"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            style={{ padding: '4px 8px', fontSize: '0.8rem' }}
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Timeline Content */}
      {viewMode === 'day_of' ? (
        /* Day of Run of Show (Chronological times) */
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ marginBottom: 18 }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: 4 }}>
              Day-Of Run of Show (Minute-by-Minute)
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Precise scheduled milestones and operational cues for {details.date}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {filteredTasks.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '32px' }}>
                No day-of tasks found. Click "Add Milestone" and set Phase to "Day of Celebration".
              </p>
            ) : (
              filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className={`timeline-card ${task.status === 'completed' ? 'completed' : ''}`}
                >
                  <button
                    className={`timeline-check-btn ${task.status === 'completed' ? 'checked' : ''}`}
                    onClick={() => toggleTimelineStatus(task.id)}
                    aria-label={`Mark ${task.title} complete`}
                  >
                    {task.status === 'completed' && <CheckCircle2 size={16} />}
                  </button>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <span
                        style={{
                          fontFamily: 'monospace',
                          fontSize: '0.95rem',
                          fontWeight: 700,
                          color: 'var(--accent-primary)',
                          background: 'rgba(99, 102, 241, 0.1)',
                          padding: '2px 8px',
                          borderRadius: 4,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <Clock size={13} />
                        {task.timeOfDay || 'Scheduled'}
                      </span>
                      <strong style={{ fontSize: '0.95rem' }}>{task.title}</strong>
                      {getPriorityBadge(task.priority)}
                    </div>

                    {task.description && (
                      <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                        {task.description}
                      </p>
                    )}

                    <div style={{ display: 'flex', gap: 12, fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6 }}>
                      <span>Role: {task.assignedTo}</span>
                      <span>Category: {task.category}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 4 }}>
                    <button
                      className="btn btn-ghost"
                      style={{ padding: 6 }}
                      onClick={() => onEditItem(task)}
                      aria-label="Edit milestone"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      className="btn btn-ghost"
                      style={{ padding: 6, color: 'var(--status-danger)' }}
                      onClick={() => {
                        if (window.confirm(`Delete "${task.title}"?`)) {
                          deleteTimelineItem(task.id);
                        }
                      }}
                      aria-label="Delete milestone"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* Phased View */
        <div className="timeline-phases">
          {(Object.keys(PHASE_LABELS) as TimelinePhase[]).map((phaseKey) => {
            const phaseTasks = filteredTasks.filter((t) => t.phase === phaseKey);
            if (phaseTasks.length === 0 && (statusFilter !== 'all' || priorityFilter !== 'all')) {
              return null;
            }

            return (
              <div key={phaseKey} className="glass-panel phase-group">
                <div className="phase-header">
                  <div className="phase-title">
                    <span>{PHASE_LABELS[phaseKey].icon}</span>
                    <h3>{PHASE_LABELS[phaseKey].label}</h3>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        marginLeft: 6,
                      }}
                    >
                      ({phaseTasks.length})
                    </span>
                  </div>
                </div>

                <div className="timeline-items-list">
                  {phaseTasks.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                      No tasks currently in this phase.
                    </p>
                  ) : (
                    phaseTasks.map((task) => (
                      <div
                        key={task.id}
                        className={`timeline-card ${task.status === 'completed' ? 'completed' : ''}`}
                      >
                        <button
                          className={`timeline-check-btn ${task.status === 'completed' ? 'checked' : ''}`}
                          onClick={() => toggleTimelineStatus(task.id)}
                          aria-label={`Toggle task completion for "${task.title}"`}
                        >
                          {task.status === 'completed' && <CheckCircle2 size={16} />}
                        </button>

                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                            <strong style={{ fontSize: '0.95rem' }}>{task.title}</strong>
                            {getPriorityBadge(task.priority)}
                            <span
                              style={{
                                fontSize: '0.75rem',
                                color: 'var(--accent-primary)',
                                background: 'rgba(99, 102, 241, 0.08)',
                                padding: '2px 8px',
                                borderRadius: 4,
                              }}
                            >
                              {task.targetDate} {task.timeOfDay ? `• ${task.timeOfDay}` : ''}
                            </span>
                          </div>

                          {task.description && (
                            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                              {task.description}
                            </p>
                          )}

                          <div style={{ display: 'flex', gap: 12, fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6 }}>
                            <span>Assigned: {task.assignedTo}</span>
                            <span>Category: {task.category}</span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: 4 }}>
                          <button
                            className="btn btn-ghost"
                            style={{ padding: 6 }}
                            onClick={() => onEditItem(task)}
                            aria-label="Edit milestone"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            className="btn btn-ghost"
                            style={{ padding: 6, color: 'var(--status-danger)' }}
                            onClick={() => {
                              if (window.confirm(`Delete "${task.title}"?`)) {
                                deleteTimelineItem(task.id);
                              }
                            }}
                            aria-label="Delete milestone"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
