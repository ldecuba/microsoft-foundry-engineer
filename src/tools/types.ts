export type FindingSeverity = "info" | "low" | "medium" | "high" | "critical";

export interface Finding {
  severity: FindingSeverity;
  title: string;
  detail: string;
  evidence: string[];
  nextAction: string;
}

export interface ChecklistItem {
  id: string;
  title: string;
  evidence: string;
}

export interface ToolResult {
  status: "pass" | "review" | "fail";
  summary: string;
  findings: Finding[];
  checklist: ChecklistItem[];
  references?: string[];
}
