import React, { useState } from 'react';
import {
  Sparkles,
  Bookmark,
  BookmarkCheck,
  Trash2,
  Calendar,
  DollarSign,
  RefreshCw,
} from 'lucide-react';
import { useEventContext } from '../context/EventContext';
import type { PersonalizedIdea, IdeaCategory } from '../types/event';
import { fetchPersonalizedIdeas } from '../services/aiService';

const CATEGORIES: { key: IdeaCategory | 'all'; label: string; icon: string }[] = [
  { key: 'all', label: 'All Inspirations', icon: '✨' },
  { key: 'theme', label: 'Themes & Aesthetics', icon: '🎨' },
  { key: 'decor', label: 'Decor & Florals', icon: '🕯️' },
  { key: 'menu', label: 'Menus & Cocktails', icon: '🍸' },
  { key: 'entertainment', label: 'Entertainment & Music', icon: '🎷' },
  { key: 'activity', label: 'Activities & Games', icon: '🎲' },
  { key: 'favor', label: 'Favors & Keepsakes', icon: '🎁' },
  { key: 'eco_friendly', label: 'Eco-Friendly Ideas', icon: '🌱' },
  { key: 'cost_saving', label: 'Budget Hacks', icon: '💡' },
];

export const PersonalizedIdeasHub: React.FC = () => {
  const {
    activeEvent,
    toggleSaveIdea,
    deleteIdea,
    addPersonalizedIdea,
    addTimelineItem,
    addBudgetItem,
  } = useEventContext();
  const { details, ideas } = activeEvent;

  const [activeCategory, setActiveCategory] = useState<IdeaCategory | 'all'>('all');
  const [onlySaved, setOnlySaved] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [convertedNotice, setConvertedNotice] = useState<string | null>(null);

  const filteredIdeas = ideas.filter((idea) => {
    if (activeCategory !== 'all' && idea.category !== activeCategory) return false;
    if (onlySaved && !idea.saved) return false;
    return true;
  });

  const handleGenerateMore = async () => {
    setIsGenerating(true);
    try {
      const categoryParam = activeCategory === 'all' ? undefined : activeCategory;
      const newIdeas = await fetchPersonalizedIdeas(activeEvent, categoryParam);
      newIdeas.forEach((idea) => {
        addPersonalizedIdea(idea);
      });
    } catch (err) {
      console.error('Failed generating ideas:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConvertTimeline = (idea: PersonalizedIdea) => {
    addTimelineItem({
      phase: 'weeks_before',
      title: `Plan & Execute: ${idea.title}`,
      description: idea.description,
      targetDate: '3 Weeks Out',
      category: idea.category,
      assignedTo: 'Lead Organizer',
      status: 'not_started',
      priority: 'medium',
    });
    setConvertedNotice(`Added "${idea.title}" to your Timeline!`);
    setTimeout(() => setConvertedNotice(null), 3000);
  };

  const handleConvertBudget = (idea: PersonalizedIdea) => {
    const est = idea.costImpact === 'budget_saver' ? 0 : idea.costImpact === 'low' ? 150 : idea.costImpact === 'medium' ? 450 : 900;
    addBudgetItem({
      category: idea.category === 'menu' ? 'Catering & Bar' : idea.category === 'decor' ? 'Decor & Florals' : 'Other',
      title: idea.title,
      estimatedCost: est,
      actualCost: 0,
      paidAmount: 0,
      status: 'planned',
      notes: idea.description,
    });
    setConvertedNotice(`Added "${idea.title}" to your Budget ($${est})!`);
    setTimeout(() => setConvertedNotice(null), 3000);
  };

  const getCostImpactBadge = (impact: PersonalizedIdea['costImpact']) => {
    switch (impact) {
      case 'budget_saver':
        return (
          <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
            💰 Budget Saver
          </span>
        );
      case 'low':
        return (
          <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
            $ Low Cost
          </span>
        );
      case 'medium':
        return (
          <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
            $$ Moderate
          </span>
        );
      default:
        return (
          <span className="badge" style={{ background: 'rgba(236, 72, 153, 0.15)', color: '#f472b6' }}>
            $$$ Premium
          </span>
        );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Converted Alert Notification */}
      {convertedNotice && (
        <div
          style={{
            background: 'var(--accent-gradient)',
            color: 'white',
            padding: '10px 16px',
            borderRadius: 'var(--radius-md)',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow-md)',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <span>✓ {convertedNotice}</span>
          <button
            className="btn btn-ghost"
            style={{ color: 'white', padding: '2px 8px' }}
            onClick={() => setConvertedNotice(null)}
          >
            ✕
          </button>
        </div>
      )}

      {/* Header and Controls */}
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
          <h2 style={{ fontSize: '1.4rem' }}>Personalized AI Inspiration Hub</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Curated experiential concepts, themes, and budget hacks tailored to "{details.theme}"
          </p>
        </div>

        <button
          className="btn btn-gradient"
          onClick={handleGenerateMore}
          disabled={isGenerating}
          aria-label="Generate new ideas using GenAI"
        >
          <RefreshCw size={15} className={isGenerating ? 'animate-spin' : ''} />
          <span>{isGenerating ? 'Generating Concepts...' : 'Generate New AI Ideas'}</span>
        </button>
      </div>

      {/* Category Pills and Bookmarks Filter */}
      <div
        className="glass-panel"
        style={{
          padding: '12px 18px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              className={`btn btn-ghost ${activeCategory === cat.key ? 'btn-secondary' : ''}`}
              style={{ padding: '6px 12px', fontSize: '0.825rem' }}
              onClick={() => setActiveCategory(cat.key)}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        <button
          className={`btn btn-ghost ${onlySaved ? 'btn-secondary' : ''}`}
          style={{ padding: '6px 12px', fontSize: '0.825rem' }}
          onClick={() => setOnlySaved(!onlySaved)}
          aria-pressed={onlySaved}
        >
          {onlySaved ? <BookmarkCheck size={16} style={{ color: 'var(--accent-primary)' }} /> : <Bookmark size={16} />}
          <span>Saved Only ({ideas.filter((i) => i.saved).length})</span>
        </button>
      </div>

      {/* Ideas Grid */}
      {filteredIdeas.length === 0 ? (
        <div className="glass-panel" style={{ padding: '48px', textAlign: 'center' }}>
          <Sparkles size={32} className="gradient-text" style={{ marginBottom: 12 }} />
          <h3 style={{ fontSize: '1.1rem', marginBottom: 6 }}>No Ideas in this Category Yet</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 16 }}>
            Click below to have the GenAI architect brainstorm fresh, tailored ideas for you.
          </p>
          <button className="btn btn-primary" onClick={handleGenerateMore} disabled={isGenerating}>
            <Sparkles size={15} />
            <span>Brainstorm Ideas Now</span>
          </button>
        </div>
      ) : (
        <div className="ideas-grid">
          {filteredIdeas.map((idea) => (
            <div key={idea.id} className="glass-panel idea-card">
              {idea.aiGenerated && <span className="idea-badge-ai">AI Curated</span>}

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, paddingRight: 60 }}>
                  {getCostImpactBadge(idea.costImpact)}
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                    {idea.category.replace('_', ' ')}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.15rem', marginBottom: 8 }}>{idea.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                  {idea.description}
                </p>

                {idea.tags && idea.tags.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
                    {idea.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        style={{
                          fontSize: '0.7rem',
                          background: 'rgba(255, 255, 255, 0.05)',
                          color: 'var(--text-muted)',
                          padding: '2px 8px',
                          borderRadius: 4,
                        }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: 14,
                  borderTop: '1px solid var(--border-subtle)',
                  marginTop: 10,
                }}
              >
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    className="btn btn-ghost"
                    style={{ padding: '6px 8px', fontSize: '0.75rem' }}
                    onClick={() => handleConvertTimeline(idea)}
                    title="Add to Event Timeline as a milestone"
                  >
                    <Calendar size={13} />
                    <span>To Timeline</span>
                  </button>

                  <button
                    className="btn btn-ghost"
                    style={{ padding: '6px 8px', fontSize: '0.75rem' }}
                    onClick={() => handleConvertBudget(idea)}
                    title="Add to Event Budget as an expense item"
                  >
                    <DollarSign size={13} />
                    <span>To Budget</span>
                  </button>
                </div>

                <div style={{ display: 'flex', gap: 4 }}>
                  <button
                    className="btn btn-ghost"
                    style={{
                      padding: 6,
                      color: idea.saved ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    }}
                    onClick={() => toggleSaveIdea(idea.id)}
                    aria-label={idea.saved ? 'Remove from saved' : 'Save idea'}
                    title={idea.saved ? 'Saved' : 'Save Idea'}
                  >
                    {idea.saved ? <BookmarkCheck size={17} /> : <Bookmark size={17} />}
                  </button>
                  <button
                    className="btn btn-ghost"
                    style={{ padding: 6, color: 'var(--status-danger)' }}
                    onClick={() => deleteIdea(idea.id)}
                    aria-label="Delete idea"
                    title="Delete Idea"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
