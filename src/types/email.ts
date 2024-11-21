export interface EmailTemplate {
  id?: string;
  name: string;
  description: string;
  subject: string;
  html_content: string;
  created_at?: string;
  updated_at?: string;
}

export interface FeedbackMessage {
  type: "success" | "error";
  message: string;
}

export interface EmailSendRequest {
  to: string;
  subject: string;
  content: string;
  isHtml: boolean;
}
