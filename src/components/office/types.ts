export type AgentVisualStatus =
  | "tersedia"
  | "sedang_bekerja"
  | "menunggu_informasi"
  | "review"
  | "perlu_perhatian"
  | "offline";

export type OfficeRoom = {
  id: "sales" | "project" | "creative" | "finance" | "review" | "owner";
  name: string;
  href: string;
  value: number;
  label: string;
  alert?: boolean;
  agentName?: string;
  agentStatus?: AgentVisualStatus;
};

export type OfficeSceneProps = {
  rooms: OfficeRoom[];
};
