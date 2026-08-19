"use client";

import { Sidebar } from "@/components/layout/Sidebar";

export function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] lg:hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <Sidebar className="relative z-10" onClose={onClose} />
    </div>
  );
}
