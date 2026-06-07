

export enum CaseStatus {
  NEW = "New",
  IN_PROGRESS = "In Progress",
  WAITING = "Waiting",
  REVIEW = "Review",
  CLOSED = "Closed",
}

export enum CasePriority {
  LOW = "Low",
  MEDIUM = "Medium",
  HIGH = "High",
}

// --------------------
// Document Types
// --------------------
export interface DocumentResponse {
  id: number;
  case_id: number;
  filename: string;
  mime_type: string;
  file_size_bytes: number;
  uploaded_at: string;
  is_archived: boolean;
}

// --------------------
// Base Case Fields
// --------------------
export interface CaseBase {
  title: string;
  client_name: string;
  case_type?: string | null;
  priority: CasePriority;
  assigned_owner?: string | null;
  due_date?: string | null;
  status: CaseStatus;
  notes?: string | null;
}

// --------------------
// Create Case
// --------------------
export interface CaseCreate extends CaseBase {}

// --------------------
// Update Case
// --------------------
export interface CaseUpdate {
  title?: string;
  client_name?: string;
  case_type?: string | null;
  priority?: CasePriority;
  assigned_owner?: string | null;
  due_date?: string | null;
  status?: CaseStatus;
  notes?: string | null;
}

// --------------------
// API Response Case
// --------------------
export interface CaseResponse extends CaseBase {
  id: number;
  created_at: string;
  updated_at?: string | null;
  is_archived: boolean;

  // Phase 3 - Documents
  documents?: DocumentResponse[];
}

// NEW: Phase 4 AI Analysis Schema
export interface AIAnalysisResponse {
  id: number;
  case_id: number;
  document_id?: number | null;
  analysis_type: "document" | "case";
  summary?: string | null;
  parties?: string | null;
  key_dates?: string | null;
  obligations?: string | null;
  action_items?: string | null;
  risks?: string | null;
  analyzed_at: string;
}