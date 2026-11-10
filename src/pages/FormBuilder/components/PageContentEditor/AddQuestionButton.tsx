import { useEffect, useRef, useState } from "react";
import { Plus, Search, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PAGE_TYPE_LABELS, PAGE_TYPES, PAGE_TYPE_VISUALS } from "@/shared/constants/form-types";
import type { PageType } from "@/shared/types/common";
import { cn } from "@/lib/utils";

interface AddQuestionButtonProps {
  onAddQuestion: (type: PageType) => void;
  className?: string;
}

export function AddQuestionButton({ onAddQuestion, className }: AddQuestionButtonProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setSearchQuery("");
    }
  }, [open]);

  const filteredTypes = PAGE_TYPES.filter((type) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const visual = PAGE_TYPE_VISUALS[type];
    const label = (PAGE_TYPE_LABELS[type] ?? type).toLowerCase();
    const displayName = (visual?.displayName ?? "").toLowerCase();
    return label.includes(q) || displayName.includes(q) || type.toLowerCase().includes(q);
  });

  return (
    <div
      className={cn(
        "relative flex items-center justify-center py-1.5 w-full group/add z-20",
        className
      )}
    >
      {/* Subtle guide line on hover */}
      <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-px bg-transparent group-hover/add:bg-slate-200/90 dark:group-hover/add:zinc-800/90 transition-colors pointer-events-none" />

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          type="button"
          data-add-question="true"
          aria-label="Add question"
          className="relative inline-flex items-center justify-center h-6 rounded-full border border-slate-300/80 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 text-slate-500 dark:text-zinc-400 shadow-2xs hover:border-[#FF5722] hover:text-[#FF5722] hover:shadow-xs transition-all duration-200 cursor-pointer overflow-hidden group/btn"
        >
          <Plus className="h-3.5 w-3.5 text-[#FF5722] shrink-0" />
          <span className="text-[11px] font-medium max-w-0 opacity-0 group-hover/btn:max-w-[85px] group-hover/btn:opacity-100 whitespace-nowrap overflow-hidden transition-all duration-200 ease-in-out pl-0 group-hover/btn:pl-1">
            Add question
          </span>
        </PopoverTrigger>
        <PopoverContent
          data-add-question="true"
          className="w-72 max-h-[460px] flex flex-col p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xl rounded-xl z-50 overflow-hidden"
          align="center"
          sideOffset={6}
        >
          {/* Search bar with autofocus */}
          <div className="relative mb-2 px-0.5">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 dark:text-zinc-500 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search question types..."
              autoFocus
              className="w-full h-8 pl-8 pr-7 text-xs rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/80 dark:bg-zinc-800/60 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-[#FF5722] focus:ring-1 focus:ring-[#FF5722]/30 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 cursor-pointer"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
            Select question type ({filteredTypes.length})
          </div>

          <div className="grid grid-cols-1 gap-1 overflow-y-auto max-h-[320px] pr-0.5">
            {filteredTypes.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400 dark:text-zinc-500">
                No question types found.
              </div>
            ) : (
              filteredTypes.map((type) => {
                const visual = PAGE_TYPE_VISUALS[type];
                const TypeIcon = visual?.icon;
                const label = visual?.displayName ?? PAGE_TYPE_LABELS[type] ?? type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      onAddQuestion(type);
                    }}
                    className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left text-sm hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer w-full group/item"
                  >
                    <div
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded text-white shadow-2xs transition-transform group-hover/item:scale-105",
                        visual?.bgColor ?? "bg-slate-500"
                      )}
                    >
                      {TypeIcon ? <TypeIcon className="h-3.5 w-3.5 stroke-[2]" /> : null}
                    </div>
                    <span className="font-medium text-slate-800 dark:text-zinc-200 text-xs truncate">
                      {label}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
