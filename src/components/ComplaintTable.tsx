import React, { useState } from 'react';
import { Complaint, Department, DetectedLanguage, UrgencyTier } from '../types';
import { 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  Eye, 
  Check, 
  Copy,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

interface ComplaintTableProps {
  complaints: Complaint[];
  onInspectComplaint: (complaint: Complaint) => void;
  onUpdateStatus: (id: string, newStatus: Complaint['status'], reason: string) => void;
  selectedDepartment: Department | 'ALL';
  onSelectDepartment: (dept: Department | 'ALL') => void;
  selectedUrgencyFilter: string;
  onSelectUrgencyFilter: (filter: string) => void;
}

export const ComplaintTable: React.FC<ComplaintTableProps> = ({
  complaints,
  onInspectComplaint,
  onUpdateStatus,
  selectedDepartment,
  onSelectDepartment,
  selectedUrgencyFilter,
  onSelectUrgencyFilter
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [languageFilter, setLanguageFilter] = useState<string>('ALL');

  // Filter complaints based on search and filters
  const filteredComplaints = complaints.filter(c => {
    // Search query
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchText = c.rawText.toLowerCase().includes(q);
      const matchId = c.id.toLowerCase().includes(q) || (c.referenceId && c.referenceId.toLowerCase().includes(q));
      const matchStation = c.station.toLowerCase().includes(q);
      const matchDept = c.department.toLowerCase().includes(q);
      if (!matchText && !matchId && !matchStation && !matchDept) return false;
    }

    // Department filter
    if (selectedDepartment !== 'ALL' && c.department !== selectedDepartment) {
      return false;
    }

    // Urgency filter
    if (selectedUrgencyFilter === 'CRITICAL_HIGH') {
      if (c.urgencyTier !== 'CRITICAL' && c.urgencyTier !== 'HIGH') return false;
    } else if (selectedUrgencyFilter === 'RESOLVED') {
      if (c.status !== 'Resolved') return false;
    } else if (selectedUrgencyFilter !== 'ALL') {
      if (c.urgencyTier !== selectedUrgencyFilter) return false;
    }

    // Status filter
    if (statusFilter !== 'ALL' && c.status !== statusFilter) {
      return false;
    }

    // Language filter
    if (languageFilter !== 'ALL' && c.detectedLanguage !== languageFilter) {
      return false;
    }

    return true;
  });

  return (
    <div className="control-console">
      {/* Search and Secondary Filter Row */}
      <div className="filters-bar">
        <div className="search-and-actions">
          <div className="search-box">
            <Search size={16} color="#64748b" />
            <input 
              type="text" 
              placeholder="Search by ID, Station, or Grievance keywords..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', alignItems: 'center' }}>
            {/* Status Selector */}
            <select 
              className="form-select"
              style={{ width: 'auto', padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="Open">Status: Open</option>
              <option value="In Progress">Status: In Progress</option>
              <option value="Escalated">Status: Escalated</option>
              <option value="Resolved">Status: Resolved</option>
            </select>

            {/* Language Selector */}
            <select 
              className="form-select"
              style={{ width: 'auto', padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
              value={languageFilter}
              onChange={(e) => setLanguageFilter(e.target.value)}
            >
              <option value="ALL">All Languages</option>
              <option value="Gujarati">Language: Gujarati</option>
              <option value="Hindi">Language: Hindi</option>
              <option value="English">Language: English</option>
              <option value="Gujlish/Hinglish">Language: Gujlish / Hinglish</option>
            </select>

            {/* Clear Filters if active */}
            {(searchTerm || selectedDepartment !== 'ALL' || selectedUrgencyFilter !== 'ALL' || statusFilter !== 'ALL' || languageFilter !== 'ALL') && (
              <button 
                className="btn btn-sm btn-secondary"
                onClick={() => {
                  setSearchTerm('');
                  onSelectDepartment('ALL');
                  onSelectUrgencyFilter('ALL');
                  setStatusFilter('ALL');
                  setLanguageFilter('ALL');
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.74rem', color: '#64748b' }}>
          <span>
            Showing <strong>{filteredComplaints.length}</strong> of <strong>{complaints.length}</strong> complaints (Ranked by Urgency)
          </span>
          {selectedDepartment !== 'ALL' && (
            <span>Filtered Queue: <strong style={{ color: '#0f172a' }}>{selectedDepartment}</strong></span>
          )}
        </div>
      </div>

      {/* Complaints Table */}
      <div className="table-responsive">
        <table className="ops-table">
          <thead>
            <tr>
              <th style={{ width: '80px' }}>Urgency</th>
              <th style={{ width: '130px' }}>ID / Channel</th>
              <th style={{ width: '140px' }}>Station</th>
              <th>Original Grievance Text</th>
              <th style={{ width: '150px' }}>Department</th>
              <th style={{ width: '110px' }}>Status</th>
              <th style={{ width: '90px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredComplaints.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <ShieldAlert size={36} color="#cbd5e1" />
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#334155' }}>
                      No Grievance Records Found
                    </div>
                    <div style={{ fontSize: '0.8rem' }}>
                      No complaints match the selected filter criteria or search query.
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              filteredComplaints.map(c => {
                const isCritical = c.urgencyTier === 'CRITICAL';
                return (
                  <tr key={c.id} className={isCritical ? 'row-critical' : ''}>
                    {/* Urgency Badge */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <span className={`urgency-badge urgency-${c.urgencyTier}`}>
                          {c.urgencyScore}
                        </span>
                        <span style={{ fontSize: '0.66rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                          {c.urgencyTier}
                        </span>
                      </div>
                    </td>

                    {/* ID & Source */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <span style={{ fontWeight: 700, color: '#0f172a' }}>{c.id}</span>
                        <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                          <span className="badge-source">{c.source}</span>
                          {c.referenceId && (
                            <span style={{ fontSize: '0.66rem', color: '#64748b' }}>
                              #{c.referenceId}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Station & Time */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <span style={{ fontWeight: 600, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <MapPin size={12} color="#ea580c" />
                          {c.station}
                        </span>
                        <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                          {new Date(c.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>

                    {/* Text & Language */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span className="badge-lang">{c.detectedLanguage}</span>
                          {c.urgencyReasons.length > 0 && (
                            <span 
                              style={{ 
                                fontSize: '0.68rem', 
                                color: isCritical ? '#b91c1c' : '#64748b',
                                fontWeight: isCritical ? 700 : 500,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.2rem'
                              }}
                            >
                              <AlertTriangle size={10} color={isCritical ? '#dc2626' : '#94a3b8'} />
                              {c.urgencyReasons[0]}
                            </span>
                          )}
                        </div>
                        <p 
                          style={{ 
                            fontSize: '0.84rem', 
                            color: '#0f172a',
                            lineHeight: '1.35',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}
                          title={c.rawText}
                        >
                          {c.rawText}
                        </p>
                      </div>
                    </td>

                    {/* Department */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <span className={`badge-dept badge-dept-${c.department.split(' ')[0]}`}>
                          {c.department}
                        </span>
                        {c.isDepartmentOverridden && (
                          <span style={{ fontSize: '0.64rem', color: '#ca8a04', fontWeight: 600 }}>
                            Overridden by Ops
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status Dropdown */}
                    <td>
                      <select 
                        value={c.status}
                        onChange={(e) => onUpdateStatus(c.id, e.target.value as Complaint['status'], `Status changed to ${e.target.value}`)}
                        className="form-select"
                        style={{ 
                          padding: '0.25rem 0.45rem', 
                          fontSize: '0.74rem', 
                          fontWeight: 700,
                          backgroundColor: c.status === 'Resolved' ? '#f0fdf4' : c.status === 'Escalated' ? '#fef2f2' : c.status === 'In Progress' ? '#fefce8' : '#ffffff',
                          color: c.status === 'Resolved' ? '#166534' : c.status === 'Escalated' ? '#991b1b' : c.status === 'In Progress' ? '#854d0e' : '#0f172a',
                          borderColor: c.status === 'Resolved' ? '#86efac' : c.status === 'Escalated' ? '#fca5a5' : '#cbd5e1'
                        }}
                      >
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Escalated">Escalated</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </td>

                    {/* Action */}
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => onInspectComplaint(c)}
                        title="View details, draft response, and audit trail"
                      >
                        <Eye size={13} />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
