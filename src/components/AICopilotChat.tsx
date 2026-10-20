import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  Sparkles,
  Trash2,
  Check,
  Plus,
  HelpCircle,
} from 'lucide-react';
import { useEventContext } from '../context/EventContext';
import { sendChatMessage } from '../services/aiService';
import type { ChatMessage } from '../types/event';

export const AICopilotChat: React.FC = () => {
  const {
    activeEvent,
    addChatMessage,
    clearChatHistory,
    addBudgetItem,
    addTimelineItem,
  } = useEventContext();
  const { details, chatHistory } = activeEvent;

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [actionDone, setActionDone] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (typeof messagesEndRef.current?.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isTyping]);

  const handleSendMessage = async (textToSend?: string) => {
    const prompt = (textToSend || input).trim();
    if (!prompt || isTyping) return;

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: prompt,
      timestamp: new Date().toISOString(),
    };

    addChatMessage(userMessage);
    setInput('');
    setIsTyping(true);

    try {
      const response = await sendChatMessage(activeEvent, chatHistory, prompt);
      addChatMessage(response);
    } catch (err) {
      console.error('Chat error:', err);
      addChatMessage({
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: 'Sorry, I encountered a hiccup processing that request. Please try again or check your API key in Settings.',
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleApplyAction = (action: NonNullable<ChatMessage['suggestedActions']>[number], actionKey: string) => {
    if (action.actionType === 'add_budget') {
      addBudgetItem({
        category: action.payload.category || 'Other',
        title: action.payload.title || 'AI Recommended Expense',
        estimatedCost: action.payload.estimatedCost || 500,
        actualCost: 0,
        paidAmount: 0,
        status: 'planned',
        notes: 'Added via AI Copilot chat suggestion',
      });
    } else if (action.actionType === 'add_timeline') {
      addTimelineItem({
        phase: action.payload.phase || 'weeks_before',
        title: action.payload.title || 'AI Recommended Task',
        description: action.payload.description || 'Milestone added via AI Copilot',
        targetDate: action.payload.timeOfDay ? 'Day of Celebration' : '2 Weeks Out',
        timeOfDay: action.payload.timeOfDay,
        category: action.payload.category || 'Run of Show',
        assignedTo: 'Lead Organizer',
        status: 'not_started',
        priority: action.payload.priority || 'medium',
      });
    }

    setActionDone((prev) => ({ ...prev, [actionKey]: true }));
  };

  const QUICK_PROMPTS = [
    `How can we trim 15% from catering without sacrificing quality?`,
    `Suggest 3 signature cocktail and mocktail concepts for "${details.theme}".`,
    `Create a rainy day backup weather contingency plan for ${details.location}.`,
    `Audit my day-of schedule and point out any tight transition bottlenecks.`,
  ];

  return (
    <div className="chat-container">
      {/* Main Conversation Panel */}
      <div className="glass-panel chat-main-card">
        {/* Chat Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'var(--accent-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
              }}
            >
              <Bot size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                CelebrateAI Planner Concierge
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Context loaded for {details.type.toUpperCase()}: {details.title}
              </div>
            </div>
          </div>

          <button
            className="btn btn-ghost"
            style={{ padding: '6px 10px', fontSize: '0.75rem' }}
            onClick={() => {
              if (window.confirm('Clear conversation history?')) {
                clearChatHistory();
              }
            }}
            title="Clear Chat History"
          >
            <Trash2 size={14} />
            <span>Clear</span>
          </button>
        </div>

        {/* Message Log */}
        <div className="chat-history" role="log" aria-live="polite">
          {chatHistory.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Sparkles size={28} className="gradient-text" style={{ marginBottom: 12 }} />
              <p style={{ fontSize: '0.95rem', fontWeight: 600 }}>
                Start a conversation with your AI event architect!
              </p>
              <p style={{ fontSize: '0.825rem', marginTop: 4 }}>
                Ask questions about budgets, timelines, music playlists, menus, or vendor RFP questions.
              </p>
            </div>
          ) : (
            chatHistory.map((msg, index) => {
              const isAssistant = msg.sender === 'assistant';
              return (
                <div
                  key={msg.id || index}
                  className={`chat-bubble ${isAssistant ? 'assistant' : 'user'}`}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: '0.75rem',
                      color: isAssistant ? 'var(--text-muted)' : 'rgba(255, 255, 255, 0.8)',
                      marginBottom: 4,
                    }}
                  >
                    {isAssistant ? <Bot size={14} /> : <User size={14} />}
                    <span>{isAssistant ? 'CelebrateAI' : 'You'}</span>
                  </div>

                  <div style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>

                  {/* Actionable Suggestions */}
                  {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                      {msg.suggestedActions.map((action, aIdx) => {
                        const actionKey = `${msg.id}-act-${aIdx}`;
                        const isDone = actionDone[actionKey];

                        return (
                          <button
                            key={aIdx}
                            className={`btn ${isDone ? 'btn-secondary' : 'btn-primary'}`}
                            style={{ padding: '5px 10px', fontSize: '0.75rem' }}
                            disabled={isDone}
                            onClick={() => handleApplyAction(action, actionKey)}
                          >
                            {isDone ? <Check size={13} /> : <Plus size={13} />}
                            <span>{isDone ? 'Applied to Plan' : action.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}

          {isTyping && (
            <div className="chat-bubble assistant" style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sparkles size={14} className="gradient-text animate-spin" />
                <span>CelebrateAI is formulating recommendations...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Bar */}
        <form
          className="chat-input-row"
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
        >
          <input
            type="text"
            className="chat-input"
            placeholder={`Ask CelebrateAI about your ${details.type}...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isTyping}
            aria-label="Ask CelebrateAI a question"
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!input.trim() || isTyping}
            aria-label="Send message"
          >
            <Send size={16} />
          </button>
        </form>
      </div>

      {/* Side Panel: Quick Prompts & Context Guide */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <Sparkles size={16} className="gradient-text" />
            <span>Smart Prompt Ideas</span>
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Click any prompt to ask the AI concierge immediately
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {QUICK_PROMPTS.map((prompt, pIdx) => (
            <button
              key={pIdx}
              className="btn btn-secondary"
              style={{
                textAlign: 'left',
                justifyContent: 'flex-start',
                padding: '9px 12px',
                fontSize: '0.8rem',
                lineHeight: 1.4,
              }}
              onClick={() => handleSendMessage(prompt)}
            >
              "{prompt}"
            </button>
          ))}
        </div>

        <div
          style={{
            marginTop: 'auto',
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            display: 'flex',
            gap: 8,
          }}
        >
          <HelpCircle size={16} style={{ flexShrink: 0, marginTop: 2, color: 'var(--accent-primary)' }} />
          <span>
            CelebrateAI remembers your event details, budget limits, and timeline tasks during this session.
          </span>
        </div>
      </div>
    </div>
  );
};
