import type { JsonSchema } from "@/lib/ai/types";

export const routerSchema: JsonSchema = {
  type: "object",
  properties: {
    agent_slug: {
      type: "string",
      enum: ["chief-of-staff","sales","project-manager","creative","finance","reviewer","developer"],
    },
    reason: { type: "string" },
  },
  required: ["agent_slug", "reason"],
  additionalProperties: false,
};

export const agentPlanSchema: JsonSchema = {
  type: "object",
  properties: {
    reply: { type: "string" },
    action: {
      type: "string",
      enum: ["none","create_lead","create_project_task","create_pending_transaction","request_approval"],
    },
    action_payload: {
      type: "object",
      properties: {
        name: { type: "string" },
        whatsapp: { type: "string" },
        email: { type: "string" },
        company: { type: "string" },
        source: { type: "string" },
        needs: { type: "string" },
        budget: { type: "number" },
        project_id: { type: "string" },
        title: { type: "string" },
        description: { type: "string" },
        priority: { type: "number" },
        amount: { type: "number" },
        transaction_type: { type: "string" },
        category: { type: "string" },
        risk: { type: "string" },
        summary: { type: "string" },
      },
      additionalProperties: false,
    },
    action_reason: { type: "string" },
  },
  required: ["reply", "action", "action_payload", "action_reason"],
  additionalProperties: false,
};
