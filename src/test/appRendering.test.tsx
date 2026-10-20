import '@testing-library/jest-dom/vitest';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';

describe('CelebrateAI Application Component', () => {
  it('renders navbar brand title and event hero', () => {
    render(<App />);

    expect(screen.getByText('Celebrate')).toBeInTheDocument();
    expect(screen.getByText('AI')).toBeInTheDocument();
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('renders all 6 primary navigation tabs with accessibility attributes', () => {
    render(<App />);

    const overviewTab = screen.getByRole('tab', { name: /overview/i });
    const budgetTab = screen.getByRole('tab', { name: /budget/i });
    const timelineTab = screen.getByRole('tab', { name: /timeline/i });
    const vendorsTab = screen.getByRole('tab', { name: /vendors/i });
    const ideasTab = screen.getByRole('tab', { name: /ideas/i });
    const chatTab = screen.getByRole('tab', { name: /copilot/i });

    expect(overviewTab).toHaveAttribute('aria-selected', 'true');
    expect(budgetTab).toHaveAttribute('aria-selected', 'false');
    expect(timelineTab).toBeInTheDocument();
    expect(vendorsTab).toBeInTheDocument();
    expect(ideasTab).toBeInTheDocument();
    expect(chatTab).toBeInTheDocument();
  });

  it('switches between tabs and displays the corresponding module', () => {
    render(<App />);

    // Click Budget tab
    const budgetTab = screen.getByRole('tab', { name: /budget/i });
    fireEvent.click(budgetTab);
    expect(budgetTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Target Budget')).toBeInTheDocument();
    expect(screen.getByText('Category Spending Distribution')).toBeInTheDocument();

    // Click Timeline tab
    const timelineTab = screen.getByRole('tab', { name: /timeline/i });
    fireEvent.click(timelineTab);
    expect(timelineTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText(/phased timeline/i)).toBeInTheDocument();

    // Click Vendors tab
    const vendorsTab = screen.getByRole('tab', { name: /vendors/i });
    fireEvent.click(vendorsTab);
    expect(vendorsTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Vendor CRM & Checklist')).toBeInTheDocument();

    // Click Ideas tab
    const ideasTab = screen.getByRole('tab', { name: /ideas/i });
    fireEvent.click(ideasTab);
    expect(ideasTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Personalized AI Inspiration Hub')).toBeInTheDocument();

    // Click AI Copilot tab
    const chatTab = screen.getByRole('tab', { name: /copilot/i });
    fireEvent.click(chatTab);
    expect(chatTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('CelebrateAI Planner Concierge')).toBeInTheDocument();
  });

  it('triggers new event modal when clicking New button', () => {
    render(<App />);

    const newBtn = screen.getByTitle('Create New Event Plan');
    fireEvent.click(newBtn);

    expect(screen.getByText('Create New Celebration Plan')).toBeInTheDocument();
    expect(screen.getByText('Choose Event Archetype')).toBeInTheDocument();
  });
});
