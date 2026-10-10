import React from 'react';
import { 
  ShieldAlert, 
  Wifi, 
  WifiOff, 
  PlusCircle, 
  FileSpreadsheet, 
  Download, 
  DatabaseBackup,
  Layers
} from 'lucide-react';

interface NavbarProps {
  isOnline: boolean;
  isSimulatedOffline: boolean;
  onToggleSimulatedOffline: () => void;
  pendingSyncCount: number;
  onOpenManualIntake: () => void;
  onOpenBatchIntake: () => void;
  onOpenExportModal: () => void;
  onLoadDemoBatch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isOnline,
  isSimulatedOffline,
  onToggleSimulatedOffline,
  pendingSyncCount,
  onOpenManualIntake,
  onOpenBatchIntake,
  onOpenExportModal,
  onLoadDemoBatch
}) => {
  const effectiveOnline = isOnline && !isSimulatedOffline;

  return (
    <header className="metro-navbar">
      <div className="brand-section">
        <div className="brand-icon">
          <ShieldAlert size={22} />
        </div>
        <div>
          <div className="brand-title">
            JanAwaaz <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f97316', marginLeft: '0.2rem' }}>जनआवाज़</span>
            <span className="brand-badge">GMRC PS-07</span>
          </div>
          <div className="brand-tagline">
            हर आवाज़ से सही कार्रवाई तक। • From Every Voice to the Right Action.
          </div>
        </div>
      </div>

      <div className="nav-actions">
        {/* Offline / Online Status Pill with Toggle */}
        <button 
          className={`status-pill ${effectiveOnline ? 'status-online' : 'status-offline'}`}
          onClick={onToggleSimulatedOffline}
          title={isSimulatedOffline ? "Simulated Offline Mode Active. Click to reconnect." : "Click to simulate offline network cutoff"}
          style={{ cursor: 'pointer', background: effectiveOnline ? '#064e3b' : '#78350f', color: '#ffffff', border: 'none' }}
        >
          {effectiveOnline ? (
            <>
              <Wifi size={14} />
              <span>ONLINE (SYNCED)</span>
            </>
          ) : (
            <>
              <WifiOff size={14} />
              <span>OFFLINE (ON-DEVICE PERSISTED)</span>
            </>
          )}
        </button>

        {pendingSyncCount > 0 && (
          <span 
            className="status-pill"
            style={{ backgroundColor: '#475569', color: '#f8fafc', cursor: 'pointer' }}
            onClick={onOpenExportModal}
            title={`${pendingSyncCount} changes saved locally, queued for sync`}
          >
            Outbox: {pendingSyncCount}
          </span>
        )}

        {/* Load Demo Multilingual Batch */}
        <button 
          className="btn btn-dark btn-sm"
          onClick={onLoadDemoBatch}
          title="Load curated test batch with Gujarati, Hindi, English and Gujlish complaints"
        >
          <Layers size={15} />
          <span>Demo Batch</span>
        </button>

        {/* Batch Import */}
        <button 
          className="btn btn-secondary btn-sm"
          onClick={onOpenBatchIntake}
          title="Import or paste batch complaints (CSV/Text)"
        >
          <FileSpreadsheet size={15} />
          <span>Batch Intake</span>
        </button>

        {/* Manual Intake */}
        <button 
          className="btn btn-primary btn-sm"
          onClick={onOpenManualIntake}
          title="Register single complaint"
        >
          <PlusCircle size={15} />
          <span>Log Grievance</span>
        </button>

        {/* Export / Sync */}
        <button 
          className="btn btn-secondary btn-sm"
          onClick={onOpenExportModal}
          title="Export CSV/JSON Backup or review sync state"
        >
          <Download size={15} />
          <span>Backup</span>
        </button>
      </div>
    </header>
  );
};
