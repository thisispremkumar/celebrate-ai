import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  Download,
  AlertTriangle,
  PieChart,
  DollarSign,
} from 'lucide-react';
import { useEventContext } from '../context/EventContext';
import type { BudgetItem, BudgetCategory } from '../types/event';
import { analyzeBudget } from '../services/aiService';

const ALL_CATEGORIES: BudgetCategory[] = [
  'Venue',
  'Catering & Bar',
  'Decor & Florals',
  'Photography & Video',
  'Entertainment & Music',
  'Attire & Beauty',
  'Invitations & Favors',
  'Permits & Logistics',
  'Contingency',
  'Other',
];

const CATEGORY_COLORS: Record<string, string> = {
  Venue: '#6366f1',
  'Catering & Bar': '#ec4899',
  'Decor & Florals': '#f59e0b',
  'Photography & Video': '#10b981',
  'Entertainment & Music': '#8b5cf6',
  'Attire & Beauty': '#06b6d4',
  'Invitations & Favors': '#f43f5e',
  'Permits & Logistics': '#64748b',
  Contingency: '#14b8a6',
  Other: '#94a3b8',
};

interface BudgetPlannerProps {
  onOpenAddModal: () => void;
  onEditItem: (item: BudgetItem) => void;
}

export const BudgetPlanner: React.FC<BudgetPlannerProps> = ({
  onOpenAddModal,
  onEditItem,
}) => {
  const { activeEvent, deleteBudgetItem } = useEventContext();
  const { details, budget } = activeEvent;
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const analysis = analyzeBudget(activeEvent);

  // Group costs by category
  const categoryTotals: Record<string, number> = {};
  budget.forEach((item) => {
    const cost = Math.max(item.estimatedCost, item.actualCost);
    categoryTotals[item.category] = (categoryTotals[item.category] || 0) + cost;
  });

  const filteredItems = budget.filter((item) => {
    const matchesCategory =
      selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const exportCsv = () => {
    const headers = [
      'Category',
      'Title',
      'Estimated Cost',
      'Actual Cost',
      'Paid Amount',
      'Status',
      'Notes',
    ];
    const rows = budget.map((b) => [
      `"${b.category}"`,
      `"${b.title.replace(/"/g, '""')}"`,
      b.estimatedCost,
      b.actualCost,
      b.paidAmount,
      b.status,
      `"${(b.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `${details.title.replace(/\s+/g, '_')}_Budget.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: BudgetItem['status']) => {
    switch (status) {
      case 'paid_in_full':
        return (
          <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
            Paid in Full
          </span>
        );
      case 'deposit_paid':
        return (
          <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
            Deposit Paid
          </span>
        );
      case 'overdue':
        return (
          <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}>
            Overdue
          </span>
        );
      default:
        return (
          <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.08)', color: 'var(--text-secondary)' }}>
            Planned
          </span>
        );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Top Metric Cards */}
      <div className="metrics-grid">
        <div className="glass-panel metric-card">
          <div className="metric-header">
            <span>Target Budget</span>
            <DollarSign size={18} className="text-muted" />
          </div>
          <div className="metric-value">
            {details.currency}{details.totalBudget.toLocaleString()}
          </div>
          <div className="metric-sub">Base allocated limit</div>
        </div>

        <div className="glass-panel metric-card">
          <div className="metric-header">
            <span>Estimated Total</span>
            <PieChart size={18} className="text-muted" />
          </div>
          <div className="metric-value">
            {details.currency}{analysis.totalPlanned.toLocaleString()}
          </div>
          <div className="metric-sub">
            {analysis.pctAllocated}% of target budget
          </div>
        </div>

        <div className="glass-panel metric-card">
          <div className="metric-header">
            <span>Amount Paid</span>
            <span style={{ color: 'var(--status-success)', fontWeight: 600 }}>Cleared</span>
          </div>
          <div className="metric-value" style={{ color: 'var(--status-success)' }}>
            {details.currency}{analysis.totalPaid.toLocaleString()}
          </div>
          <div className="metric-sub">
            {Math.round((analysis.totalPaid / (analysis.totalCommitted || analysis.totalPlanned || 1)) * 100)}% of commitments paid
          </div>
        </div>

        <div className="glass-panel metric-card">
          <div className="metric-header">
            <span>Remaining Buffer</span>
            {analysis.remainingUnallocated < 0 && (
              <AlertTriangle size={18} style={{ color: 'var(--status-danger)' }} />
            )}
          </div>
          <div
            className="metric-value"
            style={{
              color:
                analysis.remainingUnallocated < 0
                  ? 'var(--status-danger)'
                  : 'var(--text-primary)',
            }}
          >
            {details.currency}{Math.abs(analysis.remainingUnallocated).toLocaleString()}
          </div>
          <div className="metric-sub">
            {analysis.remainingUnallocated < 0 ? 'Over budget' : 'Available for extras'}
          </div>
        </div>
      </div>

      {/* Category Distribution Bar & AI Tips */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: 12 }}>Category Spending Distribution</h3>
        <div
          style={{
            height: '24px',
            display: 'flex',
            borderRadius: 'var(--radius-full)',
            overflow: 'hidden',
            background: 'rgba(255, 255, 255, 0.05)',
            marginBottom: '16px',
          }}
          aria-label="Category Spending Breakdown Chart"
        >
          {Object.entries(categoryTotals).map(([cat, amount]) => {
            const pct = Math.max(1, (amount / (analysis.totalPlanned || 1)) * 100);
            return (
              <div
                key={cat}
                style={{
                  width: `${pct}%`,
                  backgroundColor: CATEGORY_COLORS[cat] || '#94a3b8',
                  transition: 'width 0.3s ease',
                }}
                title={`${cat}: ${details.currency}${amount.toLocaleString()} (${Math.round(pct)}%)`}
              />
            );
          })}
        </div>

        {/* Category Legend Chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {Object.entries(categoryTotals).map(([cat, amount]) => (
            <div
              key={cat}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: '0.8rem',
                cursor: 'pointer',
                opacity: selectedCategory === 'all' || selectedCategory === cat ? 1 : 0.45,
              }}
              onClick={() => setSelectedCategory(selectedCategory === cat ? 'all' : cat)}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  backgroundColor: CATEGORY_COLORS[cat] || '#94a3b8',
                }}
              />
              <span style={{ fontWeight: 600 }}>{cat}:</span>
              <span style={{ color: 'var(--text-secondary)' }}>
                {details.currency}{amount.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Filter and Actions Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, flex: 1, maxWidth: 600 }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search expenses or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ minWidth: 200, flex: 1 }}
            aria-label="Search budget items"
          />

          <select
            className="form-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            aria-label="Filter by Category"
          >
            <option value="all">All Categories ({budget.length})</option>
            {ALL_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={exportCsv} title="Export to CSV">
            <Download size={15} />
            <span>Export CSV</span>
          </button>
          <button className="btn btn-primary" onClick={onOpenAddModal}>
            <Plus size={15} />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Budget Table */}
      <div className="glass-panel budget-table-card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Item / Description</th>
                <th>Estimated</th>
                <th>Actual</th>
                <th>Paid</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    No budget items found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <span
                        className="badge"
                        style={{
                          background: `${CATEGORY_COLORS[item.category] || '#64748b'}20`,
                          color: CATEGORY_COLORS[item.category] || '#94a3b8',
                          borderColor: `${CATEGORY_COLORS[item.category] || '#64748b'}40`,
                        }}
                      >
                        {item.category}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{item.title}</div>
                      {item.notes && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                          {item.notes}
                        </div>
                      )}
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      {details.currency}{item.estimatedCost.toLocaleString()}
                    </td>
                    <td>
                      {item.actualCost > 0
                        ? `${details.currency}${item.actualCost.toLocaleString()}`
                        : '—'}
                    </td>
                    <td style={{ color: item.paidAmount > 0 ? 'var(--status-success)' : 'inherit' }}>
                      {item.paidAmount > 0
                        ? `${details.currency}${item.paidAmount.toLocaleString()}`
                        : '—'}
                    </td>
                    <td>{getStatusBadge(item.status)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        <button
                          className="btn btn-ghost"
                          style={{ padding: 6 }}
                          onClick={() => onEditItem(item)}
                          aria-label={`Edit ${item.title}`}
                          title="Edit Item"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          className="btn btn-ghost"
                          style={{ padding: 6, color: 'var(--status-danger)' }}
                          onClick={() => {
                            if (window.confirm(`Delete "${item.title}"?`)) {
                              deleteBudgetItem(item.id);
                            }
                          }}
                          aria-label={`Delete ${item.title}`}
                          title="Delete Item"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Cost-Saving Recommendations */}
      <div className="glass-panel" style={{ padding: '22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <Sparkles size={20} className="gradient-text" />
          <h3 style={{ fontSize: '1.1rem' }}>AI Budget Optimization & Cost-Saving Ideas</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>
          {analysis.tips.map((tip, idx) => (
            <div
              key={idx}
              style={{
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 8,
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{tip.title}</span>
                  <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                    {tip.potentialSavings}
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {tip.advice}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
