import type { ReactNode } from "react";

const CORNERS = [
  "-top-1 -left-1",
  "-top-1 -right-1",
  "-bottom-1 -left-1",
  "-bottom-1 -right-1",
];

/**
 * The studio selection chrome around the active canvas surface: a top-left tag
 * badge and four corner pips. Shared by pages and end pages.
 */
export function SelectionFrame({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="relative h-full w-full">
      <div className="absolute -top-3 left-4 z-20 flex items-center gap-1.5 rounded-lg bg-[#FF5722] px-2 py-0.5 text-[11px] font-semibold text-white shadow-md">
        <span>{label}</span>
      </div>
      {CORNERS.map((position) => (
        <div
          key={position}
          className={`absolute ${position} z-20 h-2 w-2 rounded-lg border border-[#FF5722] bg-white pointer-events-none`}
        />
      ))}
      {children}
    </div>
  );
}
