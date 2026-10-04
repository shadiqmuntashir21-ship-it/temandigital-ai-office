export type OfficeRoom = {
  id: "sales" | "project" | "creative" | "finance" | "review" | "owner";
  name: string;
  href: string;
  value: number;
  label: string;
  alert?: boolean;
};

export type OfficeSceneProps = {
  rooms: OfficeRoom[];
};
