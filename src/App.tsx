import React, { useState, useEffect, useCallback } from 'react';
import { Complaint, Department, ComplaintStatus } from './types';
import { lokSunoStorage } from './services/storage';
import { generateSeedComplaints } from './data/seedComplaints';
import { Navbar } from './components/Navbar';
import { MetricsBar } from './components/MetricsBar';
import { UrgentShield } from './components/UrgentShield';
import { ComplaintTable } from './components/ComplaintTable';
import { ComplaintDetailModal } from './components/ComplaintDetailModal';
import { ManualIntakeModal } from './components/ManualIntakeModal';
import { BatchIntakeModal } from './components/BatchIntakeModal';
import { ExportModal } from './components/ExportModal';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';

export const App: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  // Modals state
  const [isManualIntakeOpen, setIsManualIntakeOpen] = useState<boolean>(false);
  const [isBatchIntakeOpen, setIsBatchIntakeOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);

  // Filter state
  const [selectedDepartment, setSelectedDepartment] = useState<Department | 'ALL'>('ALL');
  const [selectedUrgencyFilter, setSelectedUrgencyFilter] = useState<string>('ALL');

  // Network state & offline simulation
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  // Listen to browser online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast('Network restored: JanAwaaz online');
    };
    const handleOffline = () => {
      setIsOnline(false);
      showToast('Operating in Offline Mode: All operations active');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showToast]);

  // Load complaints from IndexedDB or seed initial data
  const loadComplaints = useCallback(async () => {
    try {
      setIsLoading(true);
      const stored = await lokSunoStorage.getAllComplaints();
      if (stored.length > 0) {
        setComplaints(stored);
      } else {
        // First run: Seed realistic multilingual complaints
        const seeds = generateSeedComplaints();
        await lokSunoStorage.saveComplaintsBatch(seeds);
        setComplaints(seeds);
      }
    } catch (err) {
      console.error('[LokSuno] Failed to load complaints from storage:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadComplaints();
  }, [loadComplaints]);

  // Handle Load Demo Multilingual Batch
  const handleLoadDemoBatch = async () => {
    try {
      const seeds = generateSeedComplaints();
      await lokSunoStorage.saveComplaintsBatch(seeds);
      await loadComplaints();
      showToast('Loaded curated demo batch with Gujarati, Hindi, English and Gujlish grievances!');
    } catch (err) {
      console.error('[LokSuno] Error loading demo batch:', err);
    }
  };

  // Handle Manual Complaint Save
  const handleSaveComplaint = async (newComplaint: Complaint) => {
    try {
      await lokSunoStorage.saveComplaint(newComplaint);
      await loadComplaints();
      showToast(`Complaint ${newComplaint.id} logged and triaged into ${newComplaint.department} queue.`);
    } catch (err) {
      console.error('[LokSuno] Error saving complaint:', err);
    }
  };

  // Handle Batch Import Save
  const handleSaveBatch = async (batch: Complaint[]) => {
    try {
      await lokSunoStorage.saveComplaintsBatch(batch);
      await loadComplaints();
      showToast(`Successfully imported ${batch.length} complaints into operations desk!`);
    } catch (err) {
      console.error('[LokSuno] Error importing batch:', err);
    }
  };

  // Handle Quick Status Update
  const handleUpdateStatus = async (id: string, newStatus: ComplaintStatus, reason: string) => {
    try {
      await lokSunoStorage.updateComplaint(id, { status: newStatus }, reason);
      await loadComplaints();
      if (selectedComplaint && selectedComplaint.id === id) {
        setSelectedComplaint(prev => prev ? { ...prev, status: newStatus } : null);
      }
      showToast(`Status updated to "${newStatus}" for ${id}.`);
    } catch (err) {
      console.error('[LokSuno] Error updating status:', err);
    }
  };

  // Handle Detailed Complaint Update (overrides, replies, notes)
  const handleUpdateComplaint = async (id: string, updates: Partial<Complaint>, reason: string) => {
    try {
      const updated = await lokSunoStorage.updateComplaint(id, updates, reason);
      await loadComplaints();
      setSelectedComplaint(updated);
      showToast(`Saved triage changes for ${id}.`);
    } catch (err) {
      console.error('[LokSuno] Error updating complaint:', err);
    }
  };

  const pendingSyncCount = complaints.filter(
    c => c.syncStatus === 'pending_sync' || c.syncStatus === 'local_only'
  ).length;

  return (
    <div className="app-container">
      {/* Top Operations Header */}
      <Navbar 
        isOnline={isOnline}
        isSimulatedOffline={isSimulatedOffline}
        onToggleSimulatedOffline={() => {
          setIsSimulatedOffline(prev => !prev);
          showToast(!isSimulatedOffline ? 'Simulated Offline Mode Activated' : 'Simulated Network Reconnected');
        }}
        pendingSyncCount={pendingSyncCount}
        onOpenManualIntake={() => setIsManualIntakeOpen(true)}
        onOpenBatchIntake={() => setIsBatchIntakeOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onLoadDemoBatch={handleLoadDemoBatch}
      />

      {/* Main Operations Control Desk Area */}
      <main style={{ padding: '1.25rem 1.5rem', maxWidth: '1440px', width: '100%', margin: '0 auto', flex: 1 }}>
        {/* Offline Banner Indicator if offline */}
        {(!isOnline || isSimulatedOffline) && (
          <div 
            style={{
              backgroundColor: '#fffbeb',
              border: '1px solid #fef08a',
              color: '#854d0e',
              padding: '0.65rem 1rem',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 600,
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <span>
              <strong>OFFLINE OPERATIONS ACTIVE:</strong> All local triage, multilingual classification, urgency scoring, reply drafts, and IndexedDB persistence are working completely offline without remote network requests.
            </span>
            <span style={{ fontSize: '0.72rem', background: '#fef3c7', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
              On-Device Mode
            </span>
          </div>
        )}

        {/* Operational Metrics Bar & Department Counters */}
        <MetricsBar 
          complaints={complaints}
          selectedDepartment={selectedDepartment}
          onSelectDepartment={(dept) => setSelectedDepartment(dept)}
          selectedUrgencyFilter={selectedUrgencyFilter}
          onSelectUrgencyFilter={(f) => setSelectedUrgencyFilter(f)}
        />

        {/* Signature Feature: Urgent First Shield */}
        <UrgentShield 
          complaints={complaints}
          onInspectComplaint={(c) => setSelectedComplaint(c)}
          onUpdateStatus={handleUpdateStatus}
        />

        {/* Ranked Complaints List & Action Console */}
        <ComplaintTable 
          complaints={complaints}
          onInspectComplaint={(c) => setSelectedComplaint(c)}
          onUpdateStatus={handleUpdateStatus}
          selectedDepartment={selectedDepartment}
          onSelectDepartment={(dept) => setSelectedDepartment(dept)}
          selectedUrgencyFilter={selectedUrgencyFilter}
          onSelectUrgencyFilter={(f) => setSelectedUrgencyFilter(f)}
        />
      </main>

      {/* Footer */}
      <footer 
        style={{ 
          backgroundColor: '#0f172a', 
          color: '#94a3b8', 
          padding: '1rem 1.5rem', 
          fontSize: '0.75rem', 
          borderTop: '1px solid #334155',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem'
        }}
      >
        <div>
          <strong style={{ color: '#f8fafc' }}>JanAwaaz (जनआवाज़)</strong> — Offline-First Metro Grievance Intelligence
        </div>
        <div>
          DevFest Gandhinagar Hackathon — PS-07, Every Complaint Heard | GMRC Operations Decision Support
        </div>
      </footer>

      {/* Modals */}
      <ManualIntakeModal 
        isOpen={isManualIntakeOpen}
        onClose={() => setIsManualIntakeOpen(false)}
        onSaveComplaint={handleSaveComplaint}
        existingComplaints={complaints}
      />

      <BatchIntakeModal 
        isOpen={isBatchIntakeOpen}
        onClose={() => setIsBatchIntakeOpen(false)}
        onSaveBatch={handleSaveBatch}
        existingComplaints={complaints}
      />

      <ComplaintDetailModal 
        complaint={selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
        onUpdateComplaint={handleUpdateComplaint}
      />

      <ExportModal 
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        complaints={complaints}
        onRefreshComplaints={loadComplaints}
      />

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="toast-container">
          <div className="toast">
            <CheckCircle2 size={16} color="#34d399" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
