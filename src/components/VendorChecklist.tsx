import React, { useState } from 'react';
import {
  Plus,
  Mail,
  Phone,
  Globe,
  Star,
  Trash2,
  Edit2,
  Sparkles,
  Copy,
  Check,
} from 'lucide-react';
import { useEventContext } from '../context/EventContext';
import type { VendorItem, VendorStatus } from '../types/event';
import { generateVendorRfp } from '../services/aiService';

interface VendorChecklistProps {
  onOpenAddModal: () => void;
  onEditVendor: (vendor: VendorItem) => void;
}

const STATUS_LABELS: Record<VendorStatus, { label: string; color: string; bg: string }> = {
  to_research: { label: 'To Research', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.15)' },
  contacted: { label: 'Inquiry Sent', color: '#60a5fa', bg: 'rgba(96, 165, 250, 0.15)' },
  quoted: { label: 'Quote Received', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
  shortlisted: { label: 'Shortlisted', color: '#c084fc', bg: 'rgba(192, 132, 252, 0.15)' },
  contract_signed: { label: 'Contract Signed', color: '#2dd4bf', bg: 'rgba(45, 212, 191, 0.15)' },
  deposit_paid: { label: 'Deposit Paid', color: '#34d399', bg: 'rgba(52, 211, 153, 0.15)' },
  completed: { label: 'Service Completed', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' },
};

export const VendorChecklist: React.FC<VendorChecklistProps> = ({
  onOpenAddModal,
  onEditVendor,
}) => {
  const { activeEvent, deleteVendorItem, updateVendorItem } = useEventContext();
  const { details, vendors } = activeEvent;

  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [rfpModalVendor, setRfpModalVendor] = useState<VendorItem | null>(null);
  const [rfpContent, setRfpContent] = useState<string>('');
  const [loadingRfp, setLoadingRfp] = useState<boolean>(false);
  const [copiedRfp, setCopiedRfp] = useState<boolean>(false);

  const filteredVendors = vendors.filter((v) => {
    if (selectedStatus !== 'all' && v.status !== selectedStatus) return false;
    return true;
  });

  const handleOpenRfpGenerator = async (vendor: VendorItem) => {
    setRfpModalVendor(vendor);
    setLoadingRfp(true);
    setCopiedRfp(false);

    try {
      const generated = await generateVendorRfp(activeEvent, vendor);
      setRfpContent(generated);
    } catch {
      setRfpContent('Failed to generate RFP inquiry. Please check network connection.');
    } finally {
      setLoadingRfp(false);
    }
  };

  const handleCopyRfp = () => {
    navigator.clipboard.writeText(rfpContent);
    setCopiedRfp(true);
    setTimeout(() => setCopiedRfp(false), 2500);

    // Record that RFP was sent/drafted
    if (rfpModalVendor) {
      updateVendorItem(rfpModalVendor.id, { rfpSent: true, rfpContent });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Top Controls */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.4rem' }}>Vendor CRM & Checklist</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Manage contracts, payment milestones, ratings, and AI RFPs for {vendors.length} vendors
          </p>
        </div>

        <button className="btn btn-primary" onClick={onOpenAddModal}>
          <Plus size={16} />
          <span>Add New Vendor</span>
        </button>
      </div>

      {/* Pipeline Status Filters */}
      <div
        className="glass-panel"
        style={{
          padding: '10px 16px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginRight: 6 }}>
          Pipeline Status:
        </span>
        <button
          className={`btn btn-ghost ${selectedStatus === 'all' ? 'btn-secondary' : ''}`}
          style={{ padding: '4px 10px', fontSize: '0.8rem' }}
          onClick={() => setSelectedStatus('all')}
        >
          All ({vendors.length})
        </button>
        {Object.entries(STATUS_LABELS).map(([statusKey, cfg]) => {
          const count = vendors.filter((v) => v.status === statusKey).length;
          return (
            <button
              key={statusKey}
              className={`btn btn-ghost ${selectedStatus === statusKey ? 'btn-secondary' : ''}`}
              style={{
                padding: '4px 10px',
                fontSize: '0.8rem',
                color: selectedStatus === statusKey ? cfg.color : 'inherit',
              }}
              onClick={() => setSelectedStatus(statusKey)}
            >
              {cfg.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Vendors Grid */}
      {filteredVendors.length === 0 ? (
        <div className="glass-panel" style={{ padding: '48px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: 12 }}>
            No vendors found matching this filter.
          </p>
          <button className="btn btn-secondary" onClick={onOpenAddModal}>
            <Plus size={15} />
            <span>Add First Vendor</span>
          </button>
        </div>
      ) : (
        <div className="vendors-grid">
          {filteredVendors.map((vendor) => {
            const statusConfig = STATUS_LABELS[vendor.status] || STATUS_LABELS.to_research;

            return (
              <div key={vendor.id} className="glass-panel vendor-card">
                <div>
                  <div className="vendor-header">
                    <div>
                      <span
                        className="badge"
                        style={{
                          background: 'rgba(255, 255, 255, 0.08)',
                          color: 'var(--text-secondary)',
                          fontSize: '0.7rem',
                          marginBottom: 4,
                        }}
                      >
                        {vendor.category}
                      </span>
                      <h3 style={{ fontSize: '1.15rem' }}>{vendor.name}</h3>
                      {vendor.contactPerson && (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Contact: {vendor.contactPerson}
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: 2 }}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          fill={i < vendor.rating ? '#f59e0b' : 'none'}
                          stroke={i < vendor.rating ? '#f59e0b' : 'rgba(255,255,255,0.2)'}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div style={{ marginTop: 10 }}>
                    <span
                      className="badge"
                      style={{
                        background: statusConfig.bg,
                        color: statusConfig.color,
                        border: `1px solid ${statusConfig.color}40`,
                      }}
                    >
                      {statusConfig.label}
                    </span>
                  </div>

                  {/* Pricing info */}
                  <div className="vendor-price-block">
                    <span className="vendor-quoted">
                      {details.currency}
                      {(vendor.agreedPrice || vendor.quotedPrice || 0).toLocaleString()}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {vendor.agreedPrice ? 'Agreed' : 'Estimated'}
                    </span>
                    {vendor.depositAmount > 0 && (
                      <span
                        style={{
                          marginLeft: 'auto',
                          fontSize: '0.75rem',
                          color: 'var(--status-success)',
                          background: 'rgba(16, 185, 129, 0.1)',
                          padding: '2px 6px',
                          borderRadius: 4,
                        }}
                      >
                        Deposit: {details.currency}{vendor.depositAmount.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* Contact details */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                      marginTop: 12,
                      fontSize: '0.8rem',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {vendor.email && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Mail size={13} className="text-muted" />
                        <a
                          href={`mailto:${vendor.email}`}
                          style={{ color: 'inherit', textDecoration: 'none' }}
                        >
                          {vendor.email}
                        </a>
                      </div>
                    )}
                    {vendor.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Phone size={13} className="text-muted" />
                        <span>{vendor.phone}</span>
                      </div>
                    )}
                    {vendor.website && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Globe size={13} className="text-muted" />
                        <a
                          href={vendor.website}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}
                        >
                          Visit Website
                        </a>
                      </div>
                    )}
                  </div>

                  {vendor.notes && (
                    <p
                      style={{
                        marginTop: 10,
                        fontSize: '0.775rem',
                        color: 'var(--text-muted)',
                        background: 'rgba(255, 255, 255, 0.03)',
                        padding: '6px 8px',
                        borderRadius: 6,
                      }}
                    >
                      {vendor.notes}
                    </p>
                  )}
                </div>

                {/* Vendor Footer Action Buttons */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: 12,
                    borderTop: '1px solid var(--border-subtle)',
                  }}
                >
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                    onClick={() => handleOpenRfpGenerator(vendor)}
                    title="Generate AI Request for Proposal inquiry"
                  >
                    <Sparkles size={14} className="gradient-text" />
                    <span>AI RFP Draft</span>
                  </button>

                  <div style={{ display: 'flex', gap: 4 }}>
                    <button
                      className="btn btn-ghost"
                      style={{ padding: 6 }}
                      onClick={() => onEditVendor(vendor)}
                      aria-label="Edit Vendor Details"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      className="btn btn-ghost"
                      style={{ padding: 6, color: 'var(--status-danger)' }}
                      onClick={() => {
                        if (window.confirm(`Delete vendor "${vendor.name}"?`)) {
                          deleteVendorItem(vendor.id);
                        }
                      }}
                      aria-label="Delete Vendor"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* AI RFP Message Modal */}
      {rfpModalVendor && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="rfp-title">
          <div className="modal-content" style={{ maxWidth: 680 }}>
            <div
              style={{
                padding: '20px',
                borderBottom: '1px solid var(--border-medium)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={18} className="gradient-text" />
                <h3 id="rfp-title" style={{ fontSize: '1.2rem' }}>
                  AI Vendor RFP: {rfpModalVendor.name}
                </h3>
              </div>
              <button
                className="btn btn-ghost"
                onClick={() => setRfpModalVendor(null)}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '20px' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 14 }}>
                This inquiry has been personalized for <strong>{rfpModalVendor.category}</strong>, referencing your event date ({details.date}), venue ({details.location}), and budget.
              </p>

              {loadingRfp ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Sparkles size={24} className="gradient-text animate-spin" />
                  <p style={{ marginTop: 10 }}>Drafting professional vendor inquiry...</p>
                </div>
              ) : (
                <textarea
                  className="form-textarea"
                  style={{ width: '100%', minHeight: 260, fontFamily: 'inherit', fontSize: '0.85rem' }}
                  value={rfpContent}
                  onChange={(e) => setRfpContent(e.target.value)}
                  aria-label="Generated RFP Message"
                />
              )}
            </div>

            <div
              style={{
                padding: '16px 20px',
                borderTop: '1px solid var(--border-medium)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {copiedRfp ? '✓ Copied to clipboard!' : 'Ready to send via email or vendor contact form.'}
              </span>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-secondary" onClick={() => setRfpModalVendor(null)}>
                  Close
                </button>
                <button className="btn btn-primary" onClick={handleCopyRfp} disabled={loadingRfp}>
                  {copiedRfp ? <Check size={15} /> : <Copy size={15} />}
                  <span>{copiedRfp ? 'Copied!' : 'Copy to Clipboard'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
