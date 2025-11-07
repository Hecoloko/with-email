export interface TeamMember {
  id: string;
  name: string;
  avatar_url: string;
}

export type Stage = 'Applied' | 'Screening' | 'Interview' | 'Offer' | 'Hired' | 'Rejected';

export type TaskStatus = 'To Do' | 'In Progress' | 'Done';

export interface Task {
  id: string;
  description: string;
  status: TaskStatus;
  created_at: string;
  assigned_to_id?: string;
  applicant_id?: string;
  created_by?: string;
}

export interface Note {
  id: string;
  content: string;
  created_at: string;
  applicant_id?: string;
  created_by?: string;
}

export interface Attachment {
  id: string;
  file_name: string;
  url: string;
  mime_type: string;
  applicant_id?: string;
  created_by?: string;
  bucket?: string;
  object_path?: string;
}

export interface Applicant {
  id: string;
  name: string;
  role: string;
  avatar_url: string;
  stage: Stage;
  assigned_to_id?: string;
  interview_date?: string;
  notes?: Note[];
  tasks?: Task[];
  attachments?: Attachment[];
  email?: string;
  phone?: string;
  created_by?: string;
}