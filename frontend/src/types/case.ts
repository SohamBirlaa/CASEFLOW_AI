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
  
  export interface CaseBase {
    title: string;
    client_name: string;
    case_type?: string | null;
    priority: CasePriority;
    assigned_owner?: string | null;
    due_date?: string | null; // ISO DateTime string
    status: CaseStatus;
    notes?: string | null;
  }
  
  // Data required to create a new case
  export interface CaseCreate extends CaseBase {}
  
  // Data returned from the API (includes DB generated fields)
  export interface CaseResponse extends CaseBase {
    id: number;
    created_at: string;
    updated_at?: string | null;
    is_archived: boolean;
  }