export type AIProviderName = "gemini";

export type JsonSchema = {
  type: string;
  properties?: Record<string, unknown>;
  required?: string[];
  enum?: string[];
  items?: unknown;
  additionalProperties?: boolean;
};

export type TextRequest = {
  system: string;
  prompt: string;
};

export type StructuredRequest = TextRequest & {
  schema: JsonSchema;
};

export interface AIProvider {
  name: AIProviderName;
  generateText(request: TextRequest): Promise<string>;
  generateStructured<T>(request: StructuredRequest): Promise<T>;
}

export type AgentSlug =
  | "chief-of-staff"
  | "sales"
  | "project-manager"
  | "creative"
  | "finance"
  | "reviewer"
  | "developer";

export type AIActionName =
  | "none"
  | "create_lead"
  | "create_project_task"
  | "create_pending_transaction"
  | "request_approval";

export type AIActionPayload = {
  name?: string;
  whatsapp?: string;
  email?: string;
  company?: string;
  source?: string;
  needs?: string;
  budget?: number;
  project_id?: string;
  title?: string;
  description?: string;
  priority?: number;
  amount?: number;
  transaction_type?: string;
  category?: string;
  risk?: string;
  summary?: string;
};

export type AgentPlan = {
  reply: string;
  action: AIActionName;
  action_payload: AIActionPayload;
  action_reason: string;
};

export type RouterDecision = {
  agent_slug: AgentSlug;
  reason: string;
};
