import React, { useState } from 'react';
import { Complaint } from '../types';
import { exportComplaintsToCSV } from '../services/csvParser';
import { lokSunoStorage } from '../services/storage';
import { 
  X, 
  Download, 
  Upload, 
  Database, 
  CheckCircle, 
  RefreshCw, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  complaints: Complaint[];
  onRefreshComplaints: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  complaints,
  onRefreshComplaints
}) => {
  if (!isOpen) return null;

  const [syncStatusMsg, setSyncStatusMsg] = useState<string>('');
  const [importStatusMsg, setImportStatusMsg] = useState<string>('');

  const pendingCount = complaints.filter(c => c.syncStatus === 'pending_sync' || c.syncStatus === 'local_only').length;

  const handleExportCSV = () => {
    const csvData = exportComplaintsToCSV(complaints);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `janawaaz_metro_complaints_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = async () => {
    const jsonData = await lokSunoStorage.exportBackupJSON();
    const blob = new Blob([jsonData], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `janawaaz_backup_snapshot_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const count = await lokSunoStorage.importBackupJSON(text);
        setImportStatusMsg(`Successfully restored ${count} complaints from JSON snapshot!`);
        onRefreshComplaints();
      } catch (err: any) {
        setImportStatusMsg(`Import failed: ${err.message || 'Invalid JSON format'}`);
      }
    };
    reader.readAsText(file);
  };

  const handleAcknowledgeSync = async () => {
    // When operating offline or without an active server backend,
    // we simulate syncing the local outbox and marking them as synced
    for (const c of complaints) {
      if (c.syncStatus !== 'synced') {
        await lokSunoStorage.saveComplaint({
          ...c,
          syncStatus: 'synced'
        });
      }
    }
    setSyncStatusMsg('Outbox synchronized and acknowledged into local master store.');
    onRefreshComplaints();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '620px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Database size={20} color="#0f172a" />
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
              Offline Storage, Export & Sync Outbox
            </span>
          </div>

          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Outbox Status Card */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                On-Device Outbox Queue
              </span>
              <span className={`status-pill ${pendingCount === 0 ? 'status-online' : 'status-offline'}`}>
                {pendingCount === 0 ? 'ALL RECORDS SYNCED' : `${pendingCount} PENDING SYNC`}
              </span>
            </div>

            <p style={{ fontSize: '0.78rem', color: '#475569', lineHeight: '1.4', marginBottom: '0.75rem' }}>
              JanAwaaz stores all records 100% offline in IndexedDB. In a production depot setup with network connectivity, queued records sync to central GMRC servers. In offline mode, your data is never lost.
            </p>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={handleAcknowledgeSync}
              >
                <RefreshCw size={13} />
                <span>Mark Outbox as Synced</span>
              </button>
            </div>

            {syncStatusMsg && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.76rem', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <CheckCircle size={14} />
                <span>{syncStatusMsg}</span>
              </div>
            )}
          </div>

          {/* Backup & Export Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <span className="form-label">Data Export & Backup Options:</span>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <button 
                className="btn btn-secondary"
                style={{ justifyContent: 'center', padding: '0.75rem' }}
                onClick={handleExportCSV}
              >
                <Download size={16} color="#ea580c" />
                <span>Export CSV File ({complaints.length})</span>
              </button>

              <button 
                className="btn btn-secondary"
                style={{ justifyContent: 'center', padding: '0.75rem' }}
                onClick={handleExportJSON}
              >
                <Download size={16} color="#0284c7" />
                <span>Export JSON Backup</span>
              </button>
            </div>

            {/* Restore from JSON */}
            <div style={{ marginTop: '0.5rem' }}>
              <span className="form-label" style={{ display: 'block', marginBottom: '0.35rem' }}>
                Restore Backup Snapshot (JSON):
              </span>
              <input 
                type="file" 
                accept=".json,application/json" 
                className="form-input"
                onChange={handleImportJSON}
              />
              {importStatusMsg && (
                <div style={{ marginTop: '0.4rem', fontSize: '0.76rem', color: importStatusMsg.includes('failed') ? '#dc2626' : '#16a34a' }}>
                  {importStatusMsg}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
