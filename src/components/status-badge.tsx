import { INVOICE_STATUS_LABEL, MEMBERSHIP_LABEL } from "@/lib/format";
import type { Invoice, MembershipStatus } from "@/lib/types";

const MEMBERSHIP_STYLE: Record<MembershipStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  active: "bg-emerald-100 text-emerald-800",
  paused: "bg-slate-200 text-slate-700",
  cancelled: "bg-red-100 text-red-700",
};

const INVOICE_STYLE: Record<Invoice["status"], string> = {
  pending: "bg-amber-100 text-amber-800",
  paid: "bg-emerald-100 text-emerald-800",
  void: "bg-slate-200 text-slate-700",
};

export function MembershipBadge({ status }: { status: MembershipStatus }) {
  return <span className={`badge ${MEMBERSHIP_STYLE[status]}`}>{MEMBERSHIP_LABEL[status]}</span>;
}

export function InvoiceBadge({ status }: { status: Invoice["status"] }) {
  return <span className={`badge ${INVOICE_STYLE[status]}`}>{INVOICE_STATUS_LABEL[status]}</span>;
}
