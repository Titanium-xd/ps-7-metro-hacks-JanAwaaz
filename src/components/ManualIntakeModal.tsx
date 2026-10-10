import React, { useState, useMemo } from 'react';
import { Complaint, ComplaintSource } from '../types';
import { GMRC_STATIONS } from '../data/gmrcStations';
import { classifyComplaint } from '../services/classifier';
import { calculateUrgency } from '../services/urgency';
import { generateDraftReply } from '../services/draftReplies';
import { X, Sparkles, AlertTriangle, Shield, CheckCircle } from 'lucide-react';

interface ManualIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveComplaint: (complaint: Complaint) => void;
  existingComplaints: Complaint[];
}

export const ManualIntakeModal: React.FC<ManualIntakeModalProps> = ({
  isOpen,
  onClose,
  onSaveComplaint,
  existingComplaints
}) => {
  if (!isOpen) return null;

  const [source, setSource] = useState<ComplaintSource>('App');
  const [station, setStation] = useState<string>('Infocity');
  const [referenceId, setReferenceId] = useState<string>('');
  const [rawText, setRawText] = useState<string>('');
  const [dateTime, setDateTime] = useState<string>(new Date().toISOString().slice(0, 16));
  const [error, setError] = useState<string>('');

  // Real-time classification and urgency scoring preview
  const preview = useMemo(() => {
    if (!rawText.trim()) return null;
    const classification = classifyComplaint(rawText);
    const urgency = calculateUrgency(rawText, classification.department, station, existingComplaints);
    return { classification, urgency };
  }, [rawText, station, existingComplaints]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawText.trim()) {
      setError('Please enter the passenger complaint text.');
      return;
    }

    const classification = preview?.classification || classifyComplaint(rawText);
    const urgency = preview?.urgency || calculateUrgency(rawText, classification.department, station, existingComplaints);
    const draft = generateDraftReply(
      classification.department,
      classification.detectedLanguage,
      urgency.score,
      station,
      referenceId || `MAN-${Date.now().toString().slice(-4)}`
    );

    const now = new Date().toISOString();
    const newId = `LS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const complaint: Complaint = {
      id: newId,
      referenceId: referenceId.trim() || undefined,
      source,
      rawText: rawText.trim(),
      station,
      dateTime: new Date(dateTime).toISOString(),
      detectedLanguage: classification.detectedLanguage,
      languageConfidence: classification.languageConfidence,
      department: classification.department,
      classificationConfidence: classification.confidence,
      urgencyScore: urgency.score,
      urgencyTier: urgency.tier,
      urgencyReasons: urgency.reasons,
      scoringBreakdown: urgency.breakdown,
      isDepartmentOverridden: false,
      isUrgencyOverridden: false,
      status: 'Open',
      internalNotes: [
        {
          id: `note-${Date.now()}`,
          note: `Logged via Manual Intake (${source}). Detected: ${classification.detectedLanguage}.`,
          author: 'Desk Operator',
          timestamp: now
        }
      ],
      auditTrail: [
        {
          timestamp: now,
          action: 'INTAKE_MANUAL',
          details: `Manual grievance intake recorded for ${station}. Urgency: ${urgency.score} (${urgency.tier}).`,
          operator: 'Desk Operator'
        }
      ],
      draftReply: draft,
      syncStatus: 'pending_sync',
      createdAt: now,
      updatedAt: now
    };

    onSaveComplaint(complaint);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
              Register Metro Grievance
            </span>
            <span className="brand-badge">Manual Intake</span>
          </div>

          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '0.6rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem' }}>
                {error}
              </div>
            )}

            {/* Source & Station Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Intake Channel / Source:</label>
                <select 
                  className="form-select"
                  value={source}
                  onChange={(e) => setSource(e.target.value as ComplaintSource)}
                >
                  <option value="App">Mobile App</option>
                  <option value="Email">Customer Email</option>
                  <option value="Social Media">Social Media (Twitter/X)</option>
                  <option value="Paper Form">Paper Form (Station Counter)</option>
                  <option value="Other">Other / Walk-in</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Metro Station:</label>
                <select 
                  className="form-select"
                  value={station}
                  onChange={(e) => setStation(e.target.value)}
                >
                  <option value="General Corridor">General / Corridor Wide</option>
                  {GMRC_STATIONS.map(s => (
                    <option key={s.id} value={s.name}>
                      {s.name} ({s.corridor})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date and Reference ID Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Incident Date & Time:</label>
                <input 
                  type="datetime-local" 
                  className="form-input"
                  value={dateTime}
                  onChange={(e) => setDateTime(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">External Ref ID (Optional):</label>
                <input 
                  type="text" 
                  className="form-input"
                  placeholder="e.g. TW-9081 or APP-4412"
                  value={referenceId}
                  onChange={(e) => setReferenceId(e.target.value)}
                />
              </div>
            </div>

            {/* Raw Grievance Textarea */}
            <div className="form-group">
              <label className="form-label">
                Original Grievance Text (Gujarati / Hindi / English / Gujlish):
              </label>
              <textarea 
                className="form-textarea"
                style={{ minHeight: '110px' }}
                placeholder="Enter exact passenger words in any script or Romanized mixed language..."
                value={rawText}
                onChange={(e) => {
                  setRawText(e.target.value);
                  if (error) setError('');
                }}
              />
            </div>

            {/* Real-time Triage Preview Card */}
            {preview && (
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.76rem', fontWeight: 700, color: '#334155' }}>
                    <Sparkles size={14} color="#ea580c" />
                    <span>Real-Time Local Triage Preview</span>
                  </div>

                  <span className={`urgency-badge urgency-${preview.urgency.tier}`}>
                    SCORE {preview.urgency.score} ({preview.urgency.tier})
                  </span>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.76rem', color: '#475569', marginBottom: '0.4rem' }}>
                  <span>Language: <strong style={{ color: '#0369a1' }}>{preview.classification.detectedLanguage}</strong></span>
                  <span>•</span>
                  <span>Queue: <strong style={{ color: '#0f172a' }}>{preview.classification.department}</strong></span>
                  <span>•</span>
                  <span>Confidence: <strong>{Math.round(preview.classification.confidence * 100)}%</strong></span>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                  {preview.urgency.reasons.map((r, i) => (
                    <span 
                      key={i} 
                      style={{ fontSize: '0.7rem', background: '#fee2e2', color: '#991b1b', padding: '0.1rem 0.4rem', borderRadius: '3px' }}
                    >
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Register Complaint
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
