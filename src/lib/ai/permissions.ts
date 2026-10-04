import type { AgentSlug, AIActionName } from "@/lib/ai/types";

const permissions: Record<AgentSlug, AIActionName[]> = {
  "chief-of-staff": ["none", "create_lead", "create_project_task", "request_approval"],
  sales: ["none", "create_lead", "request_approval"],
  "project-manager": ["none", "create_project_task", "request_approval"],
  creative: ["none", "request_approval"],
  finance: ["none", "create_pending_transaction", "request_approval"],
  reviewer: ["none", "request_approval"],
  developer: ["none", "request_approval"],
};

export function canAgentUse(agent: AgentSlug, action: AIActionName) {
  return permissions[agent].includes(action);
}

export function permittedActions(agent: AgentSlug) {
  return permissions[agent];
}
