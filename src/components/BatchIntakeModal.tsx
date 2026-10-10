import React, { useState } from 'react';
import { Complaint, ParsedBatchRow, Department, ComplaintSource } from '../types';
import { parseBatchInput } from '../services/csvParser';
import { generateDraftReply } from '../services/draftReplies';
import { 
  X, 
  Upload, 
  FileSpreadsheet, 
  CheckSquare, 
  Square, 
  AlertTriangle, 
  Check, 
  FileText,
  Sparkles
} from 'lucide-react';

interface BatchIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveBatch: (complaints: Complaint[]) => void;
  existingComplaints: Complaint[];
}

const SAMPLE_CSV_TEMPLATE = `feedback_id,station,source,feedback_text_synthetic
DEMO-FB-101,GIFT City,Social Media,Urgent! Sparks and smoke coming from train AC unit
DEMO-FB-102,Infocity,App,લિફ્ટમાં વ્હીલચેયર મુસાફર ફસાયા છે તાત્કાલિક સ્ટાફ મોકલો
DEMO-FB-103,Raysan,App,Smart card recharge Rs 100 cut thayu pan balance zero batav che
DEMO-FB-104,Sachivalaya,Paper Form,शौचालय बहुत गंदा है और बदबू आ रही है
DEMO-FB-105,PDEU,Social Media,Ticket counter clerk pushed elderly person and misbehaved
DEMO-FB-106,Sector-1,App,Could not locate the feeder bus schedule for Mahatma Mandir`;

export const BatchIntakeModal: React.FC<BatchIntakeModalProps> = ({
  isOpen,
  onClose,
  onSaveBatch,
  existingComplaints
}) => {
  if (!isOpen) return null;

  const [step, setStep] = useState<'INPUT' | 'PREVIEW'>('INPUT');
  const [rawText, setRawText] = useState<string>('');
  const [parsedRows, setParsedRows] = useState<ParsedBatchRow[]>([]);
  const [fileName, setFileName] = useState<string>('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setRawText(content);
      const rows = parseBatchInput(content, existingComplaints);
      setParsedRows(rows);
      setStep('PREVIEW');
    };
    reader.readAsText(file);
  };

  const handleParsePasted = () => {
    if (!rawText.trim()) return;
    const rows = parseBatchInput(rawText, existingComplaints);
    setParsedRows(rows);
    setStep('PREVIEW');
  };

  const handleLoadSampleCSV = () => {
    setRawText(SAMPLE_CSV_TEMPLATE);
    const rows = parseBatchInput(SAMPLE_CSV_TEMPLATE, existingComplaints);
    setParsedRows(rows);
    setFileName('sample_multilingual_intake.csv');
    setStep('PREVIEW');
  };

  const toggleSelectRow = (rowNumber: number) => {
    setParsedRows(prev => prev.map(r => 
      r.rowNumber === rowNumber ? { ...r, selectedForImport: !r.selectedForImport } : r
    ));
  };

  const toggleSelectAll = (select: boolean) => {
    setParsedRows(prev => prev.map(r => 
      r.isValid ? { ...r, selectedForImport: select } : r
    ));
  };

  const updateRowDept = (rowNumber: number, dept: Department) => {
    setParsedRows(prev => prev.map(r => 
      r.rowNumber === rowNumber ? { ...r, predictedDepartment: dept } : r
    ));
  };

  const updateRowScore = (rowNumber: number, score: number) => {
    setParsedRows(prev => prev.map(r => {
      if (r.rowNumber === rowNumber) {
        let tier: ParsedBatchRow['urgencyTier'] = 'ROUTINE';
        if (score >= 80) tier = 'CRITICAL';
        else if (score >= 60) tier = 'HIGH';
        else if (score >= 35) tier = 'MEDIUM';
        return { ...r, urgencyScore: score, urgencyTier: tier };
      }
      return r;
    }));
  };

  const handleCommitImport = () => {
    const selected = parsedRows.filter(r => r.selectedForImport && r.isValid);
    if (selected.length === 0) return;

    const now = new Date().toISOString();
    const importedComplaints: Complaint[] = selected.map((r, i) => {
      const draft = generateDraftReply(
        r.predictedDepartment,
        r.detectedLanguage,
        r.urgencyScore,
        r.station,
        r.referenceId || `BATCH-${r.rowNumber}`
      );

      return {
        id: `LS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        referenceId: r.referenceId,
        source: r.source,
        rawText: r.rawText,
        station: r.station || 'General Corridor',
        dateTime: now,
        detectedLanguage: r.detectedLanguage,
        languageConfidence: 0.85,
        department: r.predictedDepartment,
        classificationConfidence: 0.85,
        urgencyScore: r.urgencyScore,
        urgencyTier: r.urgencyTier,
        urgencyReasons: r.urgencyReasons,
        scoringBreakdown: {
          baseScore: 20,
          keywordDetections: [],
          riskMultipliers: [],
          adjustments: ['Batch auto-triage']
        },
        isDepartmentOverridden: false,
        isUrgencyOverridden: false,
        status: 'Open',
        internalNotes: [
          {
            id: `note-batch-${i}`,
            note: `Imported via Batch Intake. Language: ${r.detectedLanguage}.`,
            author: 'Batch Gateway',
            timestamp: now
          }
        ],
        auditTrail: [
          {
            timestamp: now,
            action: 'INTAKE_BATCH',
            details: `Batch imported from ${fileName || 'Pasted Data'}.`,
            operator: 'Batch Gateway'
          }
        ],
        draftReply: draft,
        syncStatus: 'pending_sync',
        createdAt: now,
        updatedAt: now
      };
    });

    onSaveBatch(importedComplaints);
    onClose();
  };

  const selectedCount = parsedRows.filter(r => r.selectedForImport && r.isValid).length;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '960px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
              Batch Complaint Intake
            </span>
            <span className="brand-badge">CSV & Multi-Line Parser</span>
          </div>

          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {step === 'INPUT' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="form-label">Upload CSV File or Paste Grievances:</span>
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={handleLoadSampleCSV}
                >
                  <Sparkles size={14} color="#ea580c" />
                  <span>Load Sample Test CSV</span>
                </button>
              </div>

              {/* Upload Drop Area */}
              <div 
                style={{
                  border: '2px dashed #cbd5e1',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  textAlign: 'center',
                  background: '#f8fafc',
                  cursor: 'pointer'
                }}
                onClick={() => document.getElementById('csvFileInput')?.click()}
              >
                <input 
                  type="file" 
                  id="csvFileInput" 
                  accept=".csv,text/csv,text/plain" 
                  style={{ display: 'none' }} 
                  onChange={handleFileUpload}
                />
                <Upload size={32} color="#64748b" style={{ margin: '0 auto 0.5rem auto' }} />
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
                  Click to select CSV file from your device
                </div>
                <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '0.2rem' }}>
                  Supports CSVs like sample_passenger_feedback.csv or custom grievance batches
                </div>
              </div>

              {/* Paste Textarea */}
              <div className="form-group">
                <label className="form-label">Or Paste CSV / Multi-Line Text Directly:</label>
                <textarea 
                  className="form-textarea"
                  style={{ minHeight: '160px', fontFamily: 'monospace', fontSize: '0.8rem' }}
                  placeholder="Paste CSV rows or one complaint per line..."
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                />
              </div>
            </div>
          ) : (
            /* STEP 2: PREVIEW & CORRECTION TABLE */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem' }}>
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => toggleSelectAll(true)}
                  >
                    Select All Valid
                  </button>
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => toggleSelectAll(false)}
                  >
                    Deselect All
                  </button>
                  <span>
                    Selected <strong>{selectedCount}</strong> of <strong>{parsedRows.length}</strong> rows
                  </span>
                </div>

                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => setStep('INPUT')}
                >
                  Back to Input
                </button>
              </div>

              {/* Review Table */}
              <div className="table-responsive" style={{ maxHeight: '380px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                <table className="ops-table" style={{ fontSize: '0.78rem' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>Import</th>
                      <th style={{ width: '50px' }}>Row</th>
                      <th style={{ width: '120px' }}>Station</th>
                      <th>Parsed Complaint Text</th>
                      <th style={{ width: '90px' }}>Language</th>
                      <th style={{ width: '150px' }}>Triage Department</th>
                      <th style={{ width: '90px' }}>Urgency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedRows.map(r => (
                      <tr key={r.rowNumber} style={{ opacity: r.isValid ? 1 : 0.6, background: r.isValid ? undefined : '#fef2f2' }}>
                        <td>
                          {r.isValid ? (
                            <input 
                              type="checkbox" 
                              checked={r.selectedForImport} 
                              onChange={() => toggleSelectRow(r.rowNumber)}
                            />
                          ) : (
                            <AlertTriangle size={14} color="#dc2626" />
                          )}
                        </td>
                        <td>{r.rowNumber}</td>
                        <td>{r.station}</td>
                        <td>
                          <div style={{ fontWeight: 500, color: '#0f172a' }}>{r.rawText}</div>
                          {r.error && (
                            <div style={{ color: '#dc2626', fontSize: '0.7rem' }}>{r.error}</div>
                          )}
                        </td>
                        <td>
                          <span className="badge-lang">{r.detectedLanguage}</span>
                        </td>
                        <td>
                          {r.isValid ? (
                            <select 
                              className="form-select"
                              style={{ padding: '0.2rem 0.4rem', fontSize: '0.74rem' }}
                              value={r.predictedDepartment}
                              onChange={(e) => updateRowDept(r.rowNumber, e.target.value as Department)}
                            >
                              <option value="Safety">Safety</option>
                              <option value="Lifts & Accessibility">Lifts & Accessibility</option>
                              <option value="Cleanliness">Cleanliness</option>
                              <option value="Fare & Ticketing">Fare & Ticketing</option>
                              <option value="Staff Behaviour">Staff Behaviour</option>
                              <option value="Other / Needs Review">Other / Needs Review</option>
                            </select>
                          ) : '-'}
                        </td>
                        <td>
                          {r.isValid ? (
                            <input 
                              type="number"
                              min={0}
                              max={100}
                              className="form-input"
                              style={{ padding: '0.2rem 0.4rem', width: '65px', fontSize: '0.74rem' }}
                              value={r.urgencyScore}
                              onChange={(e) => updateRowScore(r.rowNumber, Number(e.target.value))}
                            />
                          ) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          {step === 'INPUT' ? (
            <>
              <button className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleParsePasted}
                disabled={!rawText.trim()}
              >
                Parse & Review ({rawText ? 'Ready' : 'Paste Text First'})
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-secondary" onClick={() => setStep('INPUT')}>
                Back
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleCommitImport}
                disabled={selectedCount === 0}
              >
                Import {selectedCount} Records into Operations Desk
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
