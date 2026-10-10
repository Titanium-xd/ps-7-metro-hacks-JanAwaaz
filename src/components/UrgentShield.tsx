import React, { useState } from 'react';
import { Complaint } from '../types';
import { 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle, 
  ArrowUpRight, 
  Clock, 
  MapPin, 
  MessageSquare,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface UrgentShieldProps {
  complaints: Complaint[];
  onInspectComplaint: (complaint: Complaint) => void;
  onUpdateStatus: (id: string, newStatus: Complaint['status'], reason: string) => void;
}

export const UrgentShield: React.FC<UrgentShieldProps> = ({
  complaints,
  onInspectComplaint,
  onUpdateStatus
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Surface unresolved complaints with urgency >= 65 or Safety department
  const urgentComplaints = complaints.filter(
    c => (c.urgencyScore >= 65 || c.department === 'Safety') && c.status !== 'Resolved'
  ).sort((a, b) => b.urgencyScore - a.urgencyScore);

  if (urgentComplaints.length === 0) {
    return (
      <div 
        style={{
          background: 'linear-gradient(90deg, #064e3b 0%, #0f172a 100%)',
          border: '1px solid #10b981',
          borderRadius: '8px',
          padding: '0.85rem 1.25rem',
          color: '#ecfdf5',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.85rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <CheckCircle size={18} color="#34d399" />
          <span style={{ fontWeight: 700 }}>URGENT FIRST SHIELD: All Critical Issues Controlled</span>
          <span style={{ color: '#a7f3d0', fontSize: '0.78rem' }}>No pending critical safety alerts at this time.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="urgent-shield-banner">
      <div className="shield-header">
        <div className="shield-title-area">
          <ShieldAlert className="shield-icon" size={24} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1rem', fontWeight: 800, letterSpacing: '-0.01em' }}>
                URGENT FIRST SHIELD — PRIORITY ESCALATION CONSOLE
              </span>
              <span 
                style={{ 
                  backgroundColor: '#dc2626', 
                  color: '#ffffff', 
                  fontSize: '0.68rem', 
                  fontWeight: 800, 
                  padding: '0.15rem 0.45rem', 
                  borderRadius: '4px' 
                }}
              >
                {urgentComplaints.length} ACTIVE
              </span>
            </div>
            <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
              Explainable AI decision support for station controllers. Offline-ready rapid triage.
            </div>
          </div>
        </div>

        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem' }}
        >
          {isExpanded ? (
            <>
              <span>Collapse ({urgentComplaints.length})</span>
              <ChevronUp size={16} />
            </>
          ) : (
            <>
              <span>Expand ({urgentComplaints.length})</span>
              <ChevronDown size={16} />
            </>
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="shield-items-grid">
          {urgentComplaints.slice(0, 4).map(c => (
            <div key={c.id} className="shield-item-card">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#f8fafc' }}>
                      {c.id}
                    </span>
                    <span className="badge-source">{c.source}</span>
                    <span className="badge-lang">{c.detectedLanguage}</span>
                  </div>

                  <span className={`urgency-badge urgency-${c.urgencyTier}`}>
                    SCORE {c.urgencyScore}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#cbd5e1', fontSize: '0.75rem', marginBottom: '0.45rem' }}>
                  <MapPin size={12} color="#f97316" />
                  <span style={{ fontWeight: 600 }}>{c.station}</span>
                  <span>•</span>
                  <Clock size={12} />
                  <span>{new Date(c.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <span>•</span>
                  <span style={{ color: c.status === 'Open' ? '#ef4444' : '#f59e0b', fontWeight: 700 }}>
                    {c.status.toUpperCase()}
                  </span>
                </div>

                <p 
                  style={{ 
                    fontSize: '0.82rem', 
                    color: '#f1f5f9', 
                    lineHeight: '1.35', 
                    marginBottom: '0.55rem',
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                  }}
                  title={c.rawText}
                >
                  "{c.rawText}"
                </p>

                {/* Visible Explainable Escalation Reasons */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.4rem' }}>
                  {c.urgencyReasons.map((reason, idx) => (
                    <span 
                      key={idx}
                      style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.2)',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        color: '#fca5a5',
                        fontSize: '0.68rem',
                        fontWeight: 600,
                        padding: '0.12rem 0.4rem',
                        borderRadius: '3px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}
                    >
                      <AlertTriangle size={10} color="#f87171" />
                      {reason}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons for Station Controller */}
              <div style={{ display: 'flex', gap: '0.4rem', borderTop: '1px solid #334155', paddingTop: '0.5rem' }}>
                {c.status === 'Open' && (
                  <button 
                    className="btn btn-sm"
                    style={{ backgroundColor: '#f97316', color: '#ffffff', flex: 1, justifyContent: 'center' }}
                    onClick={() => onUpdateStatus(c.id, 'In Progress', 'Controller acknowledged priority alert')}
                  >
                    <span>Acknowledge</span>
                  </button>
                )}

                {c.status !== 'Escalated' && (
                  <button 
                    className="btn btn-sm"
                    style={{ backgroundColor: '#dc2626', color: '#ffffff', flex: 1, justifyContent: 'center' }}
                    onClick={() => onUpdateStatus(c.id, 'Escalated', 'Escalated to Station Controller & Safety Desk')}
                  >
                    <span>Escalate</span>
                  </button>
                )}

                <button 
                  className="btn btn-dark btn-sm"
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => onInspectComplaint(c)}
                >
                  <MessageSquare size={13} />
                  <span>Draft Reply</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
