import React from 'react';
import {
  DollarSign,
  CheckCircle2,
  Users2,
  Lightbulb,
  ArrowRight,
  Plus,
  Bot,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { useEventContext } from '../context/EventContext';
import { analyzeBudget } from '../services/aiService';

interface DashboardOverviewProps {
  onNavigateTab: (tab: 'budget' | 'timeline' | 'vendors' | 'ideas' | 'chat') => void;
  onOpenAddBudget: () => void;
  onOpenAddTimeline: () => void;
  onOpenAddVendor: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  onNavigateTab,
  onOpenAddBudget,
  onOpenAddTimeline,
  onOpenAddVendor,
}) => {
  const { activeEvent, toggleTimelineStatus } = useEventContext();
  const { details, timeline, vendors, ideas } = activeEvent;

  const budgetAnalysis = analyzeBudget(activeEvent);

  const completedTasks = timeline.filter((t) => t.status === 'completed').length;
  const timelineProgress =
    timeline.length > 0 ? Math.round((completedTasks / timeline.length) * 100) : 0;

  const activeVendors = vendors.filter(
    (v) => v.status === 'contract_signed' || v.status === 'deposit_paid' || v.status === 'completed'
  ).length;

  const savedIdeas = ideas.filter((i) => i.saved).length;

  // Upcoming non-completed tasks
  const pendingTasks = timeline
    .filter((t) => t.status !== 'completed')
    .slice(0, 4);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Metrics Row */}
      <div className="metrics-grid" role="region" aria-label="Key Performance Indicators">
        {/* Budget Metric */}
        <div className="glass-panel metric-card" tabIndex={0}>
          <div className="metric-header">
            <span>Budget Allocated</span>
            <DollarSign size={18} className="text-muted" aria-hidden="true" />
          </div>
          <div className="metric-value">
            {details.currency}
            {budgetAnalysis.totalPlanned.toLocaleString()}
          </div>
          <div className="metric-sub">
            of {details.currency}
            {details.totalBudget.toLocaleString()} total target
          </div>
          <div
            className="progress-bar-container"
            role="progressbar"
            aria-valuenow={budgetAnalysis.pctAllocated}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Budget Allocation Percentage"
          >
            <div
              className="progress-bar-fill"
              style={{
                width: `${Math.min(budgetAnalysis.pctAllocated, 100)}%`,
                background:
                  budgetAnalysis.status === 'critical'
                    ? 'var(--status-danger)'
                    : budgetAnalysis.status === 'warning'
                    ? 'var(--status-warning)'
                    : 'var(--status-success)',
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: 4 }}>
            <span style={{ color: budgetAnalysis.status === 'critical' ? 'var(--status-danger)' : 'var(--text-secondary)' }}>
              {budgetAnalysis.pctAllocated}% Allocated
            </span>
            <span style={{ color: 'var(--text-muted)' }}>
              {details.currency}{Math.max(0, budgetAnalysis.remainingUnallocated).toLocaleString()} Left
            </span>
          </div>
        </div>

        {/* Timeline Metric */}
        <div className="glass-panel metric-card" tabIndex={0}>
          <div className="metric-header">
            <span>Timeline Progress</span>
            <CheckCircle2 size={18} className="text-muted" aria-hidden="true" />
          </div>
          <div className="metric-value">{timelineProgress}%</div>
          <div className="metric-sub">
            {completedTasks} of {timeline.length} milestone items completed
          </div>
          <div
            className="progress-bar-container"
            role="progressbar"
            aria-valuenow={timelineProgress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Timeline Completion Percentage"
          >
            <div
              className="progress-bar-fill"
              style={{
                width: `${timelineProgress}%`,
                background: 'var(--accent-gradient)',
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '0.75rem', marginTop: 4 }}>
            <span style={{ color: 'var(--text-muted)' }}>
              {timeline.length - completedTasks} tasks remaining
            </span>
          </div>
        </div>

        {/* Vendors Metric */}
        <div className="glass-panel metric-card" tabIndex={0}>
          <div className="metric-header">
            <span>Vendor Pipeline</span>
            <Users2 size={18} className="text-muted" aria-hidden="true" />
          </div>
          <div className="metric-value">
            {activeVendors} / {vendors.length}
          </div>
          <div className="metric-sub">
            Vendors with confirmed contracts or deposits
          </div>
          <div
            className="progress-bar-container"
            role="progressbar"
            aria-valuenow={vendors.length > 0 ? (activeVendors / vendors.length) * 100 : 0}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Vendor Pipeline Percentage"
          >
            <div
              className="progress-bar-fill"
              style={{
                width: `${vendors.length > 0 ? (activeVendors / vendors.length) * 100 : 0}%`,
                background: '#38bdf8',
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '0.75rem', marginTop: 4 }}>
            <span style={{ color: 'var(--text-muted)' }}>
              {vendors.filter((v) => v.status === 'to_research' || v.status === 'contacted').length} in review
            </span>
          </div>
        </div>

        {/* AI Ideas & Inspiration */}
        <div className="glass-panel metric-card" tabIndex={0}>
          <div className="metric-header">
            <span>Personalized Ideas</span>
            <Lightbulb size={18} className="text-muted" aria-hidden="true" />
          </div>
          <div className="metric-value">{savedIdeas} Saved</div>
          <div className="metric-sub">
            {ideas.length} tailored concepts generated by AI
          </div>
          <div style={{ marginTop: 'auto', paddingTop: 8 }}>
            <button
              className="btn btn-ghost"
              style={{ padding: '4px 0', fontSize: '0.8rem', color: 'var(--accent-primary)' }}
              onClick={() => onNavigateTab('ideas')}
            >
              Browse AI Ideas Hub <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Action Bar */}
      <div
        className="glass-panel"
        style={{ padding: '16px 20px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}
        role="region"
        aria-label="Quick Actions"
      >
        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          Quick Actions:
        </span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <button className="btn btn-primary" onClick={() => onNavigateTab('chat')}>
            <Bot size={15} />
            <span>Ask AI Copilot</span>
          </button>
          <button className="btn btn-secondary" onClick={onOpenAddBudget}>
            <Plus size={15} />
            <span>Add Expense</span>
          </button>
          <button className="btn btn-secondary" onClick={onOpenAddTimeline}>
            <Plus size={15} />
            <span>Add Milestone</span>
          </button>
          <button className="btn btn-secondary" onClick={onOpenAddVendor}>
            <Plus size={15} />
            <span>Add Vendor</span>
          </button>
        </div>
      </div>

      {/* Two Column Layout: Upcoming Tasks + AI Budget/Idea Highlights */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }}>
        {/* Upcoming Tasks */}
        <div className="glass-panel" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: '1.15rem' }}>Upcoming Milestones</h2>
            <button
              className="btn btn-ghost"
              style={{ fontSize: '0.8rem', padding: '4px 8px' }}
              onClick={() => onNavigateTab('timeline')}
            >
              View All ({timeline.length}) <ArrowRight size={14} />
            </button>
          </div>

          {pendingTasks.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              All tasks completed! Great work planning your celebration.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {pendingTasks.map((task) => (
                <div
                  key={task.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 12px',
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <button
                    className={`timeline-check-btn ${task.status === 'completed' ? 'checked' : ''}`}
                    onClick={() => toggleTimelineStatus(task.id)}
                    aria-label={`Mark "${task.title}" as completed`}
                  >
                    {task.status === 'completed' && <CheckCircle2 size={16} />}
                  </button>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{task.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {task.targetDate} {task.timeOfDay ? `• ${task.timeOfDay}` : ''} • {task.assignedTo}
                    </div>
                  </div>
                  <span
                    className="badge"
                    style={{
                      fontSize: '0.65rem',
                      background:
                        task.priority === 'critical'
                          ? 'rgba(239, 68, 68, 0.15)'
                          : 'rgba(255, 255, 255, 0.05)',
                      color:
                        task.priority === 'critical'
                          ? 'var(--status-danger)'
                          : 'var(--text-secondary)',
                    }}
                  >
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Budget Intelligence Highlight */}
        <div className="glass-panel" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <TrendingUp size={18} style={{ color: 'var(--accent-primary)' }} />
              <h2 style={{ fontSize: '1.15rem' }}>AI Budget Intelligence</h2>
            </div>
            <button
              className="btn btn-ghost"
              style={{ fontSize: '0.8rem', padding: '4px 8px' }}
              onClick={() => onNavigateTab('budget')}
            >
              Open Budget <ArrowRight size={14} />
            </button>
          </div>

          <div
            style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              background:
                budgetAnalysis.status === 'critical'
                  ? 'rgba(239, 68, 68, 0.1)'
                  : budgetAnalysis.status === 'warning'
                  ? 'rgba(245, 158, 11, 0.1)'
                  : 'rgba(16, 185, 129, 0.1)',
              border: `1px solid ${
                budgetAnalysis.status === 'critical'
                  ? 'rgba(239, 68, 68, 0.3)'
                  : budgetAnalysis.status === 'warning'
                  ? 'rgba(245, 158, 11, 0.3)'
                  : 'rgba(16, 185, 129, 0.3)'
              }`,
              display: 'flex',
              gap: 10,
              alignItems: 'flex-start',
            }}
          >
            <AlertCircle
              size={18}
              style={{
                color:
                  budgetAnalysis.status === 'critical'
                    ? 'var(--status-danger)'
                    : budgetAnalysis.status === 'warning'
                    ? 'var(--status-warning)'
                    : 'var(--status-success)',
                flexShrink: 0,
                marginTop: 2,
              }}
            />
            <div style={{ fontSize: '0.875rem' }}>
              <strong style={{ display: 'block', marginBottom: 2 }}>{budgetAnalysis.headline}</strong>
              <span style={{ color: 'var(--text-secondary)' }}>
                {budgetAnalysis.tips[0]?.advice || 'No critical budget overruns detected.'}
              </span>
            </div>
          </div>

          {/* Quick AI Tip Card */}
          {budgetAnalysis.tips[0] && (
            <div
              style={{
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 14px',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontWeight: 600, fontSize: '0.825rem' }}>
                  💡 {budgetAnalysis.tips[0].title}
                </span>
                <span style={{ color: 'var(--status-success)', fontSize: '0.825rem', fontWeight: 700 }}>
                  Save {budgetAnalysis.tips[0].potentialSavings}
                </span>
              </div>
              <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
                {budgetAnalysis.tips[0].advice}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
