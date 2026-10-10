// JanAwaaz - Core Domain Types

export type Department = 
  | 'Safety'
  | 'Cleanliness'
  | 'Fare & Ticketing'
  | 'Lifts & Accessibility'
  | 'Staff Behaviour'
  | 'Other / Needs Review';

export type ComplaintSource = 
  | 'App'
  | 'Email'
  | 'Social Media'
  | 'Paper Form'
  | 'Other';

export type DetectedLanguage = 
  | 'English'
  | 'Hindi'
  | 'Gujarati'
  | 'Gujlish/Hinglish'
  | 'Unknown';

export type UrgencyTier = 
  | 'CRITICAL'   // 80 - 100
  | 'HIGH'       // 60 - 79
  | 'MEDIUM'     // 35 - 59
  | 'ROUTINE';   // 0 - 34

export type ComplaintStatus = 
  | 'Open'
  | 'In Progress'
  | 'Escalated'
  | 'Resolved';

export type SyncStatus = 
  | 'local_only'
  | 'pending_sync'
  | 'synced';

export interface InternalNote {
  id: string;
  note: string;
  author: string;
  timestamp: string;
}

export interface AuditEntry {
  timestamp: string;
  action: string;
  details: string;
  operator: string;
}

export interface DraftReply {
  language: DetectedLanguage;
  text: string;
  templateUsed: string;
  isCustomized: boolean;
}

export interface ScoringBreakdown {
  baseScore: number;
  keywordDetections: string[];
  riskMultipliers: string[];
  adjustments: string[];
}

export interface Complaint {
  id: string;                         // e.g. "LS-2026-001"
  referenceId?: string;               // external ref if any, e.g. "DEMO-FB-004"
  source: ComplaintSource;
  rawText: string;
  station: string;                    // GMRC station name or "General Corridor"
  dateTime: string;                   // ISO 8601 string
  detectedLanguage: DetectedLanguage;
  languageConfidence: number;         // 0.0 to 1.0
  department: Department;
  classificationConfidence: number;   // 0.0 to 1.0
  urgencyScore: number;               // 0 to 100
  urgencyTier: UrgencyTier;
  urgencyReasons: string[];           // Explainable human-readable reasons
  scoringBreakdown: ScoringBreakdown;
  isDepartmentOverridden: boolean;
  isUrgencyOverridden: boolean;
  overrideNotes?: string;
  status: ComplaintStatus;
  internalNotes: InternalNote[];
  auditTrail: AuditEntry[];
  draftReply: DraftReply;
  syncStatus: SyncStatus;
  isDuplicateOrRelated?: boolean;
  relatedComplaintIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ParsedBatchRow {
  rowNumber: number;
  rawText: string;
  station: string;
  source: ComplaintSource;
  referenceId?: string;
  dateTime?: string;
  detectedLanguage: DetectedLanguage;
  predictedDepartment: Department;
  urgencyScore: number;
  urgencyTier: UrgencyTier;
  urgencyReasons: string[];
  isValid: boolean;
  error?: string;
  selectedForImport: boolean;
}

export interface StationReference {
  id: string;
  name: string;
  type: string;
  corridor: string;
}
