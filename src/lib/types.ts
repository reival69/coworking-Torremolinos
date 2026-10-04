export type Plan = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price_cents: number;
  billing_interval: "day" | "month";
  features: string[];
  sort_order: number;
  active: boolean;
};

export type Space = {
  id: string;
  name: string;
  kind: "desk" | "meeting_room" | "office";
  capacity: number;
  hourly_price_cents: number;
  description: string | null;
  active: boolean;
};

export type MembershipStatus = "pending" | "active" | "paused" | "cancelled";

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  company: string | null;
  tax_id: string | null;
  role: "member" | "admin";
  plan_id: string | null;
  requested_plan_slug: string | null;
  membership_status: MembershipStatus;
  created_at: string;
};

export type Booking = {
  id: string;
  space_id: string;
  member_id: string;
  starts_at: string;
  ends_at: string;
  status: "confirmed" | "cancelled";
  notes: string | null;
};

export type Invoice = {
  id: string;
  number: string;
  member_id: string;
  concept: string;
  amount_cents: number;
  status: "pending" | "paid" | "void";
  issued_on: string;
  due_on: string;
  paid_at: string | null;
};
