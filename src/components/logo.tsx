import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 font-display text-lg font-semibold tracking-tight">
      <span className="grid size-8 place-items-center rounded-full bg-terracotta text-sm text-white">CT</span>
      Coworking Torremolinos
    </Link>
  );
}
