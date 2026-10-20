import React, { useState, useEffect } from 'react';
import { useEventContext } from '../context/EventContext';
import type {
  BudgetItem,
  BudgetCategory,
  TimelineItem,
  TimelinePhase,
  TaskPriority,
  VendorItem,
  VendorStatus,
} from '../types/event';

// ------------------------------------------------------------------
// 1. Budget Modal
// ------------------------------------------------------------------
interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  editItem?: BudgetItem | null;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({ isOpen, onClose, editItem }) => {
  const { addBudgetItem, updateBudgetItem, activeEvent } = useEventContext();
  const { details } = activeEvent;

  const [category, setCategory] = useState<BudgetCategory>('Venue');
  const [title, setTitle] = useState('');
  const [estimatedCost, setEstimatedCost] = useState(1000);
  const [actualCost, setActualCost] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [status, setStatus] = useState<BudgetItem['status']>('planned');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (editItem) {
      setCategory(editItem.category);
      setTitle(editItem.title);
      setEstimatedCost(editItem.estimatedCost);
      setActualCost(editItem.actualCost);
      setPaidAmount(editItem.paidAmount);
      setStatus(editItem.status);
      setNotes(editItem.notes || '');
    } else {
      setCategory('Venue');
      setTitle('');
      setEstimatedCost(500);
      setActualCost(0);
      setPaidAmount(0);
      setStatus('planned');
      setNotes('');
    }
  }, [editItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editItem) {
      updateBudgetItem(editItem.id, {
        category,
        title,
        estimatedCost: Number(estimatedCost),
        actualCost: Number(actualCost),
        paidAmount: Number(paidAmount),
        status,
        notes,
      });
    } else {
      addBudgetItem({
        category,
        title,
        estimatedCost: Number(estimatedCost),
        actualCost: Number(actualCost),
        paidAmount: Number(paidAmount),
        status,
        notes,
      });
    }
    onClose();
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="budget-modal-title">
      <div className="modal-content">
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border-medium)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 id="budget-modal-title" style={{ fontSize: '1.2rem' }}>
            {editItem ? 'Edit Budget Item' : 'Add New Expense Item'}
          </h3>
          <button className="btn btn-ghost" onClick={onClose} aria-label="Close dialog">✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="b-cat">Category</label>
            <select
              id="b-cat"
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value as BudgetCategory)}
            >
              <option value="Venue">Venue</option>
              <option value="Catering & Bar">Catering & Bar</option>
              <option value="Decor & Florals">Decor & Florals</option>
              <option value="Photography & Video">Photography & Video</option>
              <option value="Entertainment & Music">Entertainment & Music</option>
              <option value="Attire & Beauty">Attire & Beauty</option>
              <option value="Invitations & Favors">Invitations & Favors</option>
              <option value="Permits & Logistics">Permits & Logistics</option>
              <option value="Contingency">Contingency</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="b-title">Item Title / Description</label>
            <input
              id="b-title"
              type="text"
              className="form-input"
              required
              placeholder="e.g. Cocktail Bar Package or String Quartet"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="b-est">Estimated ({details.currency})</label>
              <input
                id="b-est"
                type="number"
                min={0}
                className="form-input"
                required
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(Number(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="b-act">Actual ({details.currency})</label>
              <input
                id="b-act"
                type="number"
                min={0}
                className="form-input"
                value={actualCost}
                onChange={(e) => setActualCost(Number(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="b-paid">Paid ({details.currency})</label>
              <input
                id="b-paid"
                type="number"
                min={0}
                className="form-input"
                value={paidAmount}
                onChange={(e) => setPaidAmount(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="b-stat">Payment Status</label>
            <select
              id="b-stat"
              className="form-select"
              value={status}
              onChange={(e) => setStatus(e.target.value as BudgetItem['status'])}
            >
              <option value="planned">Planned (Estimate Only)</option>
              <option value="deposit_paid">Deposit Paid</option>
              <option value="paid_in_full">Paid in Full</option>
              <option value="overdue">Payment Overdue</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="b-notes">Notes & Inclusions</label>
            <textarea
              id="b-notes"
              className="form-textarea"
              rows={2}
              placeholder="e.g. Deposit due 30 days prior; includes glassware"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">{editItem ? 'Save Changes' : 'Add Expense'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ------------------------------------------------------------------
// 2. Timeline Modal
// ------------------------------------------------------------------
interface TimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  editItem?: TimelineItem | null;
}

export const TimelineModal: React.FC<TimelineModalProps> = ({ isOpen, onClose, editItem }) => {
  const { addTimelineItem, updateTimelineItem } = useEventContext();

  const [phase, setPhase] = useState<TimelinePhase>('weeks_before');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState('3 Weeks Out');
  const [timeOfDay, setTimeOfDay] = useState('');
  const [category, setCategory] = useState('Logistics');
  const [assignedTo, setAssignedTo] = useState('Lead Coordinator');
  const [priority, setPriority] = useState<TaskPriority>('medium');

  useEffect(() => {
    if (editItem) {
      setPhase(editItem.phase);
      setTitle(editItem.title);
      setDescription(editItem.description);
      setTargetDate(editItem.targetDate);
      setTimeOfDay(editItem.timeOfDay || '');
      setCategory(editItem.category);
      setAssignedTo(editItem.assignedTo);
      setPriority(editItem.priority);
    } else {
      setPhase('weeks_before');
      setTitle('');
      setDescription('');
      setTargetDate('2 Weeks Out');
      setTimeOfDay('');
      setCategory('Logistics');
      setAssignedTo('Lead Coordinator');
      setPriority('medium');
    }
  }, [editItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editItem) {
      updateTimelineItem(editItem.id, {
        phase,
        title,
        description,
        targetDate,
        timeOfDay: timeOfDay.trim() || undefined,
        category,
        assignedTo,
        priority,
      });
    } else {
      addTimelineItem({
        phase,
        title,
        description,
        targetDate,
        timeOfDay: timeOfDay.trim() || undefined,
        category,
        assignedTo,
        status: 'not_started',
        priority,
      });
    }
    onClose();
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="timeline-modal-title">
      <div className="modal-content">
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border-medium)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 id="timeline-modal-title" style={{ fontSize: '1.2rem' }}>
            {editItem ? 'Edit Milestone Task' : 'Add New Milestone Task'}
          </h3>
          <button className="btn btn-ghost" onClick={onClose} aria-label="Close dialog">✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="t-phase">Planning Phase</label>
              <select
                id="t-phase"
                className="form-select"
                value={phase}
                onChange={(e) => setPhase(e.target.value as TimelinePhase)}
              >
                <option value="months_before">Months Before</option>
                <option value="weeks_before">Weeks Before</option>
                <option value="days_before">Days Before</option>
                <option value="day_of">Day of Celebration</option>
                <option value="post_event">Post-Event</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="t-prio">Priority</label>
              <select
                id="t-prio"
                className="form-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="t-title">Task Title</label>
            <input
              id="t-title"
              type="text"
              className="form-input"
              required
              placeholder="e.g. Finalize Seating Chart or Rig Soundstage"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="t-target">Target Date / Window</label>
              <input
                id="t-target"
                type="text"
                className="form-input"
                placeholder="e.g. 2 Weeks Before or 2026-08-15"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="t-time">Time of Day (Optional)</label>
              <input
                id="t-time"
                type="text"
                className="form-input"
                placeholder="e.g. 04:30 PM (for Day of)"
                value={timeOfDay}
                onChange={(e) => setTimeOfDay(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="t-assign">Assigned Person / Role</label>
              <input
                id="t-assign"
                type="text"
                className="form-input"
                placeholder="e.g. Host, Sarah, DJ"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="t-cat">Category</label>
              <input
                id="t-cat"
                type="text"
                className="form-input"
                placeholder="e.g. Ceremony, Logistics, Attire"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="t-desc">Description / Instructions</label>
            <textarea
              id="t-desc"
              className="form-textarea"
              rows={2}
              placeholder="Details or action steps..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">{editItem ? 'Save Milestone' : 'Add Milestone'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ------------------------------------------------------------------
// 3. Vendor Modal
// ------------------------------------------------------------------
interface VendorModalProps {
  isOpen: boolean;
  onClose: () => void;
  editVendor?: VendorItem | null;
}

export const VendorModal: React.FC<VendorModalProps> = ({ isOpen, onClose, editVendor }) => {
  const { addVendorItem, updateVendorItem, activeEvent } = useEventContext();
  const { details } = activeEvent;

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Venue');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [status, setStatus] = useState<VendorStatus>('to_research');
  const [rating, setRating] = useState(5);
  const [quotedPrice, setQuotedPrice] = useState(1500);
  const [agreedPrice, setAgreedPrice] = useState(0);
  const [depositAmount, setDepositAmount] = useState(0);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (editVendor) {
      setName(editVendor.name);
      setCategory(editVendor.category);
      setContactPerson(editVendor.contactPerson);
      setEmail(editVendor.email);
      setPhone(editVendor.phone);
      setWebsite(editVendor.website || '');
      setStatus(editVendor.status);
      setRating(editVendor.rating);
      setQuotedPrice(editVendor.quotedPrice);
      setAgreedPrice(editVendor.agreedPrice);
      setDepositAmount(editVendor.depositAmount);
      setNotes(editVendor.notes);
    } else {
      setName('');
      setCategory('Catering & Bar');
      setContactPerson('');
      setEmail('');
      setPhone('');
      setWebsite('');
      setStatus('to_research');
      setRating(5);
      setQuotedPrice(1500);
      setAgreedPrice(0);
      setDepositAmount(0);
      setNotes('');
    }
  }, [editVendor, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editVendor) {
      updateVendorItem(editVendor.id, {
        name,
        category,
        contactPerson,
        email,
        phone,
        website,
        status,
        rating,
        quotedPrice: Number(quotedPrice),
        agreedPrice: Number(agreedPrice),
        depositAmount: Number(depositAmount),
        notes,
      });
    } else {
      addVendorItem({
        name,
        category,
        contactPerson,
        email,
        phone,
        website,
        status,
        rating,
        quotedPrice: Number(quotedPrice),
        agreedPrice: Number(agreedPrice),
        depositAmount: Number(depositAmount),
        notes,
        rfpSent: false,
      });
    }
    onClose();
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="vendor-modal-title">
      <div className="modal-content">
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border-medium)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 id="vendor-modal-title" style={{ fontSize: '1.2rem' }}>
            {editVendor ? 'Edit Vendor Details' : 'Add New Vendor'}
          </h3>
          <button className="btn btn-ghost" onClick={onClose} aria-label="Close dialog">✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="v-name">Vendor / Company Name</label>
              <input
                id="v-name"
                type="text"
                className="form-input"
                required
                placeholder="e.g. Golden Gate Photography"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="v-cat">Category</label>
              <input
                id="v-cat"
                type="text"
                className="form-input"
                required
                placeholder="e.g. Photography, Catering"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="v-contact">Contact Person</label>
              <input
                id="v-contact"
                type="text"
                className="form-input"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="v-email">Email</label>
              <input
                id="v-email"
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="v-phone">Phone</label>
              <input
                id="v-phone"
                type="tel"
                className="form-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="v-stat">Pipeline Status</label>
              <select
                id="v-stat"
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value as VendorStatus)}
              >
                <option value="to_research">To Research</option>
                <option value="contacted">Inquiry Sent</option>
                <option value="quoted">Quote Received</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="contract_signed">Contract Signed</option>
                <option value="deposit_paid">Deposit Paid</option>
                <option value="completed">Service Completed</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="v-rate">Rating (1 to 5)</label>
              <input
                id="v-rate"
                type="number"
                min={1}
                max={5}
                className="form-input"
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="v-quoted">Quoted ({details.currency})</label>
              <input
                id="v-quoted"
                type="number"
                min={0}
                className="form-input"
                value={quotedPrice}
                onChange={(e) => setQuotedPrice(Number(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="v-agreed">Agreed ({details.currency})</label>
              <input
                id="v-agreed"
                type="number"
                min={0}
                className="form-input"
                value={agreedPrice}
                onChange={(e) => setAgreedPrice(Number(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="v-dep">Deposit ({details.currency})</label>
              <input
                id="v-dep"
                type="number"
                min={0}
                className="form-input"
                value={depositAmount}
                onChange={(e) => setDepositAmount(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="v-notes">Notes / Special Deliverables</label>
            <textarea
              id="v-notes"
              className="form-textarea"
              rows={2}
              placeholder="e.g. Needs wireless mic; includes 5 hours of service"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">{editVendor ? 'Save Changes' : 'Add Vendor'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ------------------------------------------------------------------
// 4. Edit Event Details Modal
// ------------------------------------------------------------------
interface EditDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditDetailsModal: React.FC<EditDetailsModalProps> = ({ isOpen, onClose }) => {
  const { activeEvent, updateEventDetails } = useEventContext();
  const { details } = activeEvent;

  const [title, setTitle] = useState(details.title);
  const [date, setDate] = useState(details.date);
  const [time, setTime] = useState(details.time || '');
  const [location, setLocation] = useState(details.location);
  const [guestCount, setGuestCount] = useState(details.guestCount);
  const [totalBudget, setTotalBudget] = useState(details.totalBudget);
  const [theme, setTheme] = useState(details.theme);
  const [vibe, setVibe] = useState(details.vibe);

  useEffect(() => {
    setTitle(details.title);
    setDate(details.date);
    setTime(details.time || '');
    setLocation(details.location);
    setGuestCount(details.guestCount);
    setTotalBudget(details.totalBudget);
    setTheme(details.theme);
    setVibe(details.vibe);
  }, [details, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateEventDetails({
      title,
      date,
      time,
      location,
      guestCount: Number(guestCount),
      totalBudget: Number(totalBudget),
      theme,
      vibe,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="edit-details-title">
      <div className="modal-content">
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border-medium)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 id="edit-details-title" style={{ fontSize: '1.2rem' }}>Edit Event Details</h3>
          <button className="btn btn-ghost" onClick={onClose} aria-label="Close dialog">✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="ed-title">Event Title</label>
            <input
              id="ed-title"
              type="text"
              className="form-input"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="ed-date">Date</label>
              <input
                id="ed-date"
                type="date"
                className="form-input"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="ed-time">Time</label>
              <input
                id="ed-time"
                type="time"
                className="form-input"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="ed-loc">Venue / Location</label>
            <input
              id="ed-loc"
              type="text"
              className="form-input"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="ed-guests">Guest Count</label>
              <input
                id="ed-guests"
                type="number"
                min={1}
                className="form-input"
                value={guestCount}
                onChange={(e) => setGuestCount(Number(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="ed-budget">Total Target Budget ({details.currency})</label>
              <input
                id="ed-budget"
                type="number"
                min={1}
                className="form-input"
                value={totalBudget}
                onChange={(e) => setTotalBudget(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="ed-theme">Theme / Aesthetic Concept</label>
            <input
              id="ed-theme"
              type="text"
              className="form-input"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="ed-vibe">Vibe & Atmospheric Description</label>
            <textarea
              id="ed-vibe"
              className="form-textarea"
              rows={2}
              value={vibe}
              onChange={(e) => setVibe(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
};
