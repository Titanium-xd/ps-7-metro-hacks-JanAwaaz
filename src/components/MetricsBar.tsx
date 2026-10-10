import React from 'react';
import { Complaint, Department } from '../types';
import { 
  AlertOctagon, 
  CheckCircle2, 
  HelpCircle, 
  FileText,
  Shield,
  Sparkles,
  CreditCard,
  Accessibility,
  UserX,
  FileQuestion
} from 'lucide-react';

interface MetricsBarProps {
  complaints: Complaint[];
  selectedDepartment: Department | 'ALL';
  onSelectDepartment: (dept: Department | 'ALL') => void;
  selectedUrgencyFilter: string;
  onSelectUrgencyFilter: (filter: string) => void;
}

export const MetricsBar: React.FC<MetricsBarProps> = ({
  complaints,
  selectedDepartment,
  onSelectDepartment,
  selectedUrgencyFilter,
  onSelectUrgencyFilter
}) => {
  const total = complaints.length;
  
  const criticalUnresolved = complaints.filter(
    c => (c.urgencyTier === 'CRITICAL' || c.urgencyTier === 'HIGH') && c.status !== 'Resolved'
  ).length;

  const reviewRequired = complaints.filter(
    c => c.department === 'Other / Needs Review' && c.status !== 'Resolved'
  ).length;

  const resolved = complaints.filter(c => c.status === 'Resolved').length;

  // Department counts
  const deptCounts: Record<Department, number> = {
    'Safety': complaints.filter(c => c.department === 'Safety').length,
    'Lifts & Accessibility': complaints.filter(c => c.department === 'Lifts & Accessibility').length,
    'Cleanliness': complaints.filter(c => c.department === 'Cleanliness').length,
    'Fare & Ticketing': complaints.filter(c => c.department === 'Fare & Ticketing').length,
    'Staff Behaviour': complaints.filter(c => c.department === 'Staff Behaviour').length,
    'Other / Needs Review': complaints.filter(c => c.department === 'Other / Needs Review').length
  };

  return (
    <div style={{ marginBottom: '1.25rem' }}>
      {/* 4 Summary Cards */}
      <div className="metrics-grid">
        <div 
          className="metric-card"
          style={{ cursor: 'pointer', borderLeft: selectedUrgencyFilter === 'ALL' ? '4px solid #0f172a' : undefined }}
          onClick={() => onSelectUrgencyFilter('ALL')}
        >
          <div className="metric-label">
            <span>Total Intake</span>
            <FileText size={16} />
          </div>
          <div className="metric-value">{total}</div>
          <div className="metric-sub">Multi-channel registered</div>
        </div>

        <div 
          className="metric-card critical"
          style={{ cursor: 'pointer', outline: selectedUrgencyFilter === 'CRITICAL_HIGH' ? '2px solid #dc2626' : undefined }}
          onClick={() => onSelectUrgencyFilter(selectedUrgencyFilter === 'CRITICAL_HIGH' ? 'ALL' : 'CRITICAL_HIGH')}
        >
          <div className="metric-label" style={{ color: '#dc2626' }}>
            <span>Urgent Unresolved</span>
            <AlertOctagon size={16} color="#dc2626" />
          </div>
          <div className="metric-value" style={{ color: '#dc2626' }}>{criticalUnresolved}</div>
          <div className="metric-sub" style={{ color: '#b91c1c' }}>Immediate operational triage</div>
        </div>

        <div 
          className="metric-card"
          style={{ cursor: 'pointer', borderLeft: '4px solid #ca8a04', outline: selectedDepartment === 'Other / Needs Review' ? '2px solid #ca8a04' : undefined }}
          onClick={() => onSelectDepartment(selectedDepartment === 'Other / Needs Review' ? 'ALL' : 'Other / Needs Review')}
        >
          <div className="metric-label" style={{ color: '#854d0e' }}>
            <span>Review Required</span>
            <HelpCircle size={16} color="#ca8a04" />
          </div>
          <div className="metric-value" style={{ color: '#854d0e' }}>{reviewRequired}</div>
          <div className="metric-sub">Unclear / Ambiguous routing</div>
        </div>

        <div 
          className="metric-card resolved"
          style={{ cursor: 'pointer', outline: selectedUrgencyFilter === 'RESOLVED' ? '2px solid #16a34a' : undefined }}
          onClick={() => onSelectUrgencyFilter(selectedUrgencyFilter === 'RESOLVED' ? 'ALL' : 'RESOLVED')}
        >
          <div className="metric-label" style={{ color: '#166534' }}>
            <span>Resolved</span>
            <CheckCircle2 size={16} color="#16a34a" />
          </div>
          <div className="metric-value" style={{ color: '#166534' }}>{resolved}</div>
          <div className="metric-sub">Closed with audit trail</div>
        </div>
      </div>

      {/* Department Queues Bar */}
      <div 
        style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '0.6rem', 
          background: '#ffffff', 
          padding: '0.75rem 1rem', 
          borderRadius: '8px', 
          border: '1px solid #e2e8f0',
          alignItems: 'center'
        }}
      >
        <span style={{ fontSize: '0.76rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.04em', marginRight: '0.3rem' }}>
          Department Queues:
        </span>

        <button 
          className={`filter-chip ${selectedDepartment === 'ALL' ? 'active' : ''}`}
          onClick={() => onSelectDepartment('ALL')}
        >
          <span>All Queues</span>
          <span className="filter-chip-count">{total}</span>
        </button>

        <button 
          className={`filter-chip ${selectedDepartment === 'Safety' ? 'active' : ''}`}
          onClick={() => onSelectDepartment('Safety')}
        >
          <Shield size={14} color={selectedDepartment === 'Safety' ? '#ffffff' : '#dc2626'} />
          <span>Safety</span>
          <span className="filter-chip-count">{deptCounts['Safety']}</span>
        </button>

        <button 
          className={`filter-chip ${selectedDepartment === 'Lifts & Accessibility' ? 'active' : ''}`}
          onClick={() => onSelectDepartment('Lifts & Accessibility')}
        >
          <Accessibility size={14} color={selectedDepartment === 'Lifts & Accessibility' ? '#ffffff' : '#2563eb'} />
          <span>Lifts & Accessibility</span>
          <span className="filter-chip-count">{deptCounts['Lifts & Accessibility']}</span>
        </button>

        <button 
          className={`filter-chip ${selectedDepartment === 'Cleanliness' ? 'active' : ''}`}
          onClick={() => onSelectDepartment('Cleanliness')}
        >
          <Sparkles size={14} color={selectedDepartment === 'Cleanliness' ? '#ffffff' : '#16a34a'} />
          <span>Cleanliness</span>
          <span className="filter-chip-count">{deptCounts['Cleanliness']}</span>
        </button>

        <button 
          className={`filter-chip ${selectedDepartment === 'Fare & Ticketing' ? 'active' : ''}`}
          onClick={() => onSelectDepartment('Fare & Ticketing')}
        >
          <CreditCard size={14} color={selectedDepartment === 'Fare & Ticketing' ? '#ffffff' : '#ca8a04'} />
          <span>Fare & Ticketing</span>
          <span className="filter-chip-count">{deptCounts['Fare & Ticketing']}</span>
        </button>

        <button 
          className={`filter-chip ${selectedDepartment === 'Staff Behaviour' ? 'active' : ''}`}
          onClick={() => onSelectDepartment('Staff Behaviour')}
        >
          <UserX size={14} color={selectedDepartment === 'Staff Behaviour' ? '#ffffff' : '#9333ea'} />
          <span>Staff Behaviour</span>
          <span className="filter-chip-count">{deptCounts['Staff Behaviour']}</span>
        </button>

        <button 
          className={`filter-chip ${selectedDepartment === 'Other / Needs Review' ? 'active' : ''}`}
          onClick={() => onSelectDepartment('Other / Needs Review')}
        >
          <FileQuestion size={14} color={selectedDepartment === 'Other / Needs Review' ? '#ffffff' : '#64748b'} />
          <span>Needs Review</span>
          <span className="filter-chip-count">{deptCounts['Other / Needs Review']}</span>
        </button>
      </div>
    </div>
  );
};
