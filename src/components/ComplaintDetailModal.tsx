import React, { useState } from 'react';
import { Complaint, Department, DetectedLanguage, ComplaintStatus } from '../types';
import { generateDraftReply } from '../services/draftReplies';
import { 
  X, 
  MapPin, 
  Clock, 
  ShieldAlert, 
  Copy, 
  Check, 
  AlertTriangle, 
  Send, 
  MessageSquare, 
  History, 
  FileText,
  User,
  Plus
} from 'lucide-react';

interface ComplaintDetailModalProps {
  complaint: Complaint | null;
  onClose: () => void;
  onUpdateComplaint: (id: string, updates: Partial<Complaint>, reason: string) => void;
}

export const ComplaintDetailModal: React.FC<ComplaintDetailModalProps> = ({
  complaint,
  onClose,
  onUpdateComplaint
}) => {
  if (!complaint) return null;

  const [activeTab, setActiveTab] = useState<'DETAILS' | 'REPLY' | 'NOTES' | 'AUDIT'>('REPLY');
  const [selectedDept, setSelectedDept] = useState<Department>(complaint.department);
  const [selectedStatus, setSelectedStatus] = useState<ComplaintStatus>(complaint.status);
  const [selectedLang, setSelectedLang] = useState<DetectedLanguage>(complaint.draftReply.language || complaint.detectedLanguage);
  const [draftText, setDraftText] = useState<string>(complaint.draftReply?.text || '');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [overrideScore, setOverrideScore] = useState<number>(complaint.urgencyScore);
  const [overrideReason, setOverrideReason] = useState<string>('');
  const [newNoteText, setNewNoteText] = useState<string>('');
  const [authorName, setAuthorName] = useState<string>('Station Controller');

  // Re-generate draft if language or department changes
  const handleRegenerateDraft = (newDept: Department, newLang: DetectedLanguage) => {
    const freshDraft = generateDraftReply(
      newDept,
      newLang,
      overrideScore,
      complaint.station,
      complaint.referenceId || complaint.id
    );
    setDraftText(freshDraft.text);
  };

  const handleCopyDraft = () => {
    navigator.clipboard.writeText(draftText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleSaveOverrides = () => {
    const isDeptChanged = selectedDept !== complaint.department;
    const isScoreChanged = overrideScore !== complaint.urgencyScore;
    const isStatusChanged = selectedStatus !== complaint.status;

    let logMessage = '';
    if (isDeptChanged) logMessage += `Department changed to ${selectedDept}. `;
    if (isScoreChanged) logMessage += `Urgency overridden from ${complaint.urgencyScore} to ${overrideScore} (${overrideReason || 'Controller manual triage'}). `;
    if (isStatusChanged) logMessage += `Status changed to ${selectedStatus}. `;

    if (!logMessage) logMessage = 'Updated draft reply / notes.';

    onUpdateComplaint(complaint.id, {
      department: selectedDept,
      isDepartmentOverridden: isDeptChanged || complaint.isDepartmentOverridden,
      urgencyScore: overrideScore,
      isUrgencyOverridden: isScoreChanged || complaint.isUrgencyOverridden,
      status: selectedStatus,
      draftReply: {
        language: selectedLang,
        text: draftText,
        templateUsed: 'CUSTOM_EDITED',
        isCustomized: true
      }
    }, logMessage);

    onClose();
  };

  const handleAddNote = () => {
    if (!newNoteText.trim()) return;

    const now = new Date().toISOString();
    const updatedNotes = [
      ...(complaint.internalNotes || []),
      {
        id: `note-${Date.now()}`,
        note: newNoteText.trim(),
        author: authorName,
        timestamp: now
      }
    ];

    onUpdateComplaint(complaint.id, {
      internalNotes: updatedNotes
    }, `Added internal note by ${authorName}: "${newNoteText.trim()}"`);

    setNewNoteText('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
              {complaint.id}
            </span>
            <span className="badge-source">{complaint.source}</span>
            <span className={`urgency-badge urgency-${complaint.urgencyTier}`}>
              SCORE {complaint.urgencyScore} ({complaint.urgencyTier})
            </span>
          </div>

          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', padding: '0 1.5rem' }}>
          <button 
            style={{
              padding: '0.75rem 1rem',
              border: 'none',
              background: 'transparent',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              color: activeTab === 'REPLY' ? '#ea580c' : '#64748b',
              borderBottom: activeTab === 'REPLY' ? '2px solid #ea580c' : 'none'
            }}
            onClick={() => setActiveTab('REPLY')}
          >
            Response Draft & Actions
          </button>

          <button 
            style={{
              padding: '0.75rem 1rem',
              border: 'none',
              background: 'transparent',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              color: activeTab === 'DETAILS' ? '#ea580c' : '#64748b',
              borderBottom: activeTab === 'DETAILS' ? '2px solid #ea580c' : 'none'
            }}
            onClick={() => setActiveTab('DETAILS')}
          >
            Triage & Explainability
          </button>

          <button 
            style={{
              padding: '0.75rem 1rem',
              border: 'none',
              background: 'transparent',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              color: activeTab === 'NOTES' ? '#ea580c' : '#64748b',
              borderBottom: activeTab === 'NOTES' ? '2px solid #ea580c' : 'none'
            }}
            onClick={() => setActiveTab('NOTES')}
          >
            Internal Notes ({complaint.internalNotes?.length || 0})
          </button>

          <button 
            style={{
              padding: '0.75rem 1rem',
              border: 'none',
              background: 'transparent',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              color: activeTab === 'AUDIT' ? '#ea580c' : '#64748b',
              borderBottom: activeTab === 'AUDIT' ? '2px solid #ea580c' : 'none'
            }}
            onClick={() => setActiveTab('AUDIT')}
          >
            Audit Trail ({complaint.auditTrail?.length || 0})
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* Always Visible: Grievance Card */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: '#475569' }}>
                <MapPin size={14} color="#ea580c" />
                <strong>{complaint.station}</strong>
                <span>•</span>
                <Clock size={14} />
                <span>{new Date(complaint.dateTime).toLocaleString()}</span>
                {complaint.referenceId && <span>• Ref: #{complaint.referenceId}</span>}
              </div>

              <span className="badge-lang">
                Detected: {complaint.detectedLanguage} ({Math.round(complaint.languageConfidence * 100)}%)
              </span>
            </div>

            <div style={{ fontSize: '0.94rem', fontWeight: 600, color: '#0f172a', lineHeight: '1.45' }}>
              "{complaint.rawText}"
            </div>
          </div>

          {/* TAB 1: RESPONSE DRAFT & ACTIONS */}
          {activeTab === 'REPLY' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="form-label">Draft Reply Language:</span>
                  <select 
                    className="form-select"
                    style={{ width: 'auto', padding: '0.3rem 0.6rem', fontSize: '0.78rem' }}
                    value={selectedLang}
                    onChange={(e) => {
                      const newLang = e.target.value as DetectedLanguage;
                      setSelectedLang(newLang);
                      handleRegenerateDraft(selectedDept, newLang);
                    }}
                  >
                    <option value="Gujarati">Gujarati (ગુજરાતી)</option>
                    <option value="Hindi">Hindi (हिन्दी)</option>
                    <option value="English">English</option>
                    <option value="Gujlish/Hinglish">Gujlish / Mixed</option>
                  </select>
                </div>

                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={handleCopyDraft}
                >
                  {isCopied ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                  <span>{isCopied ? 'Copied to Clipboard!' : 'Copy Draft'}</span>
                </button>
              </div>

              <div className="form-group">
                <textarea 
                  className="form-textarea"
                  style={{ minHeight: '140px', fontSize: '0.88rem', lineHeight: '1.5' }}
                  value={draftText}
                  onChange={(e) => setDraftText(e.target.value)}
                  placeholder="Draft response in passenger's language..."
                />
              </div>

              <div style={{ fontSize: '0.72rem', color: '#64748b', background: '#f1f5f9', padding: '0.5rem 0.75rem', borderRadius: '4px' }}>
                <strong>Local Draft Notice:</strong> Offline templates are generated safely without external API dependencies. Review facts before sending via email, SMS or social media.
              </div>

              {/* Status Update Quick Buttons */}
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem' }}>
                <span className="form-label" style={{ display: 'block', marginBottom: '0.4rem' }}>
                  Triage Status:
                </span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {(['Open', 'In Progress', 'Escalated', 'Resolved'] as ComplaintStatus[]).map(s => (
                    <button 
                      key={s}
                      className={`btn btn-sm ${selectedStatus === s ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setSelectedStatus(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TRIAGE & EXPLAINABILITY */}
          {activeTab === 'DETAILS' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Department & Score Overrides */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Department Queue:</label>
                  <select 
                    className="form-select"
                    value={selectedDept}
                    onChange={(e) => {
                      const newDept = e.target.value as Department;
                      setSelectedDept(newDept);
                      handleRegenerateDraft(newDept, selectedLang);
                    }}
                  >
                    <option value="Safety">Safety</option>
                    <option value="Lifts & Accessibility">Lifts & Accessibility</option>
                    <option value="Cleanliness">Cleanliness</option>
                    <option value="Fare & Ticketing">Fare & Ticketing</option>
                    <option value="Staff Behaviour">Staff Behaviour</option>
                    <option value="Other / Needs Review">Other / Needs Review</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Urgency Score (0 - 100):</label>
                  <input 
                    type="number" 
                    min={0} 
                    max={100}
                    className="form-input"
                    value={overrideScore}
                    onChange={(e) => setOverrideScore(Number(e.target.value))}
                  />
                </div>
              </div>

              {/* Explainable Reasons */}
              <div>
                <span className="form-label" style={{ display: 'block', marginBottom: '0.35rem' }}>
                  Explainable Decision Factors:
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {complaint.urgencyReasons.map((reason, idx) => (
                    <div 
                      key={idx}
                      style={{ 
                        background: '#f8fafc', 
                        border: '1px solid #e2e8f0', 
                        padding: '0.45rem 0.75rem', 
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        color: '#334155'
                      }}
                    >
                      <AlertTriangle size={14} color="#ea580c" />
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Scoring Breakdown Details */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '0.75rem' }}>
                <span className="form-label" style={{ display: 'block', marginBottom: '0.3rem' }}>
                  Local Rule Breakdown:
                </span>
                <div style={{ fontSize: '0.76rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <div>• Baseline: {complaint.scoringBreakdown?.baseScore || 20} pts</div>
                  {complaint.scoringBreakdown?.keywordDetections?.map((kw, i) => (
                    <div key={i}>• Detected Keyword: <strong style={{ color: '#0f172a' }}>{kw}</strong></div>
                  ))}
                  {complaint.scoringBreakdown?.riskMultipliers?.map((rm, i) => (
                    <div key={i} style={{ color: '#dc2626' }}>• {rm}</div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Override Justification / Operator Note:</label>
                <input 
                  type="text" 
                  className="form-input"
                  placeholder="e.g. Verified with station master on call"
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* TAB 3: INTERNAL NOTES */}
          {activeTab === 'NOTES' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {complaint.internalNotes && complaint.internalNotes.length > 0 ? (
                  complaint.internalNotes.map(n => (
                    <div key={n.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '0.65rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b', marginBottom: '0.2rem' }}>
                        <strong>{n.author}</strong>
                        <span>{new Date(n.timestamp).toLocaleString()}</span>
                      </div>
                      <div style={{ fontSize: '0.84rem', color: '#0f172a' }}>
                        {n.note}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '1.5rem', color: '#94a3b8', fontSize: '0.82rem' }}>
                    No internal notes recorded yet.
                  </div>
                )}
              </div>

              {/* Add Note Input */}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  className="form-input"
                  placeholder="Add operational note (e.g. Housekeeping dispatched)..."
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                />
                <button 
                  className="btn btn-secondary"
                  onClick={handleAddNote}
                >
                  <Plus size={14} />
                  <span>Add Note</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: AUDIT TRAIL */}
          {activeTab === 'AUDIT' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '260px', overflowY: 'auto' }}>
              {complaint.auditTrail?.map((entry, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '0.75rem', fontSize: '0.78rem', borderLeft: '2px solid #cbd5e1', paddingLeft: '0.75rem' }}>
                  <div style={{ color: '#64748b', whiteSpace: 'nowrap' }}>
                    {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div>
                    <strong style={{ color: '#0f172a' }}>[{entry.action}]</strong> {entry.details}
                    <div style={{ color: '#64748b', fontSize: '0.7rem' }}>by {entry.operator}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSaveOverrides}>
            Save Changes & Triage
          </button>
        </div>
      </div>
    </div>
  );
};
