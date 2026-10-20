import type { ReactNode, FC } from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { EventProvider, useEventContext } from '../context/EventContext';

const wrapper: FC<{ children: ReactNode }> = ({ children }) => (
  <EventProvider>{children}</EventProvider>
);

describe('EventContext State Management', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should initialize with default curated celebration events', () => {
    const { result } = renderHook(() => useEventContext(), { wrapper });
    expect(result.current.events.length).toBeGreaterThanOrEqual(3);
    expect(result.current.activeEvent).toBeDefined();
    expect(result.current.activeEvent.details.title).toContain('Wedding');
  });

  it('should allow switching the active event', () => {
    const { result } = renderHook(() => useEventContext(), { wrapper });
    const birthdayId = result.current.events.find((e) => e.details.type === 'birthday')?.details.id;
    expect(birthdayId).toBeDefined();

    act(() => {
      result.current.setActiveEventId(birthdayId!);
    });

    expect(result.current.activeEvent.details.type).toBe('birthday');
  });

  it('should create a new celebration event with auto-generated budget & timeline', () => {
    const { result } = renderHook(() => useEventContext(), { wrapper });

    let newId = '';
    act(() => {
      newId = result.current.createNewEvent({
        title: 'Tech Innovators Block Gala',
        type: 'community',
        totalBudget: 20000,
        currency: '$',
      });
    });

    expect(newId).toBeTruthy();
    expect(result.current.activeEventId).toBe(newId);
    expect(result.current.activeEvent.details.title).toBe('Tech Innovators Block Gala');
    expect(result.current.activeEvent.budget.length).toBeGreaterThan(0);
    expect(result.current.activeEvent.timeline.length).toBeGreaterThan(0);
  });

  it('should perform CRUD operations on budget items', () => {
    const { result } = renderHook(() => useEventContext(), { wrapper });

    act(() => {
      result.current.addBudgetItem({
        category: 'Entertainment & Music',
        title: 'Acoustic Guitarist',
        estimatedCost: 800,
        actualCost: 750,
        paidAmount: 750,
        status: 'paid_in_full',
      });
    });

    const added = result.current.activeEvent.budget.find((b) => b.title === 'Acoustic Guitarist');
    expect(added).toBeDefined();
    expect(added?.estimatedCost).toBe(800);

    // Update
    act(() => {
      result.current.updateBudgetItem(added!.id, { estimatedCost: 850 });
    });
    const updated = result.current.activeEvent.budget.find((b) => b.id === added!.id);
    expect(updated?.estimatedCost).toBe(850);

    // Delete
    act(() => {
      result.current.deleteBudgetItem(added!.id);
    });
    const deleted = result.current.activeEvent.budget.find((b) => b.id === added!.id);
    expect(deleted).toBeUndefined();
  });

  it('should toggle timeline task status sequentially', () => {
    const { result } = renderHook(() => useEventContext(), { wrapper });
    const task = result.current.activeEvent.timeline[0];
    const initialStatus = task.status;

    act(() => {
      result.current.toggleTimelineStatus(task.id);
    });

    const updatedTask = result.current.activeEvent.timeline.find((t) => t.id === task.id);
    expect(updatedTask?.status).not.toBe(initialStatus);
  });

  it('should export and import event JSON properly', () => {
    const { result } = renderHook(() => useEventContext(), { wrapper });
    const exportedJson = result.current.exportActiveEventJson();
    expect(exportedJson).toContain(result.current.activeEvent.details.title);

    let importSuccess = false;
    act(() => {
      importSuccess = result.current.importEventJson(exportedJson);
    });

    expect(importSuccess).toBe(true);
  });
});
