import { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from "@/components/ui/combobox";
import { InputGroupAddon } from "@/components/ui/input-group";
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

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      document.querySelector<HTMLInputElement>("[data-slot='combobox-content'] input")?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, [open]);

  return (
    <div
      className={cn(
        "relative flex items-center justify-center h-0 py-0 w-full group/add z-20",
        open && "!opacity-100",
        className
      )}
    >
      {/* Subtle guide line on hover */}
      <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-px bg-transparent group-hover/add:bg-slate-200/90 dark:group-hover/add:zinc-800/90 transition-colors pointer-events-none" />

      <Combobox<PageType>
        items={PAGE_TYPES}
        autoHighlight
        value={null}
        onValueChange={(type) => {
          if (!type) return;
          setOpen(false);
          onAddQuestion(type);
        }}
        itemToStringLabel={(type) =>
          type ? PAGE_TYPE_VISUALS[type]?.displayName ?? PAGE_TYPE_LABELS[type] ?? type : ""
        }
        inputValue={searchQuery}
        onInputValueChange={(next) => setSearchQuery(next ?? "")}
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setSearchQuery("");
        }}
      >
        <ComboboxTrigger
          type="button"
          data-add-question="true"
          aria-label="Add question"
          className="relative inline-flex items-center justify-center h-6 rounded-full border border-slate-300/80 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 text-slate-500 dark:text-zinc-400 shadow-2xs hover:border-[#FF5722] hover:text-[#FF5722] hover:shadow-xs transition-all duration-200 cursor-pointer overflow-hidden group/btn [&>svg:last-child]:hidden"
        >
          <Plus className="h-3.5 w-3.5 text-[#FF5722] shrink-0" />
          <span className="text-[11px] font-medium max-w-0 opacity-0 group-hover/btn:max-w-[85px] group-hover/btn:opacity-100 whitespace-nowrap overflow-hidden transition-all duration-200 ease-in-out pl-0 group-hover/btn:pl-1">
            Add question
          </span>
        </ComboboxTrigger>
        <ComboboxContent
          data-add-question="true"
          className="w-72 p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xl rounded-xl z-50"
          align="center"
          sideOffset={6}
        >
          {/* Search bar with autofocus */}
          <div className="mb-2 px-0.5">
            <ComboboxInput
              autoFocus
              showTrigger={false}
              showClear={Boolean(searchQuery)}
              placeholder="Search question types..."
              className="w-full text-xs h-8 bg-slate-50/80 dark:bg-zinc-800/60 rounded-lg border border-slate-200 dark:border-zinc-700 outline-0 ring-0 shadow-none focus:outline-0 focus:ring-0 focus:border-[#FF5722] focus-within:outline-0 focus-within:ring-0 focus-within:border-[#FF5722]"
            >
              <InputGroupAddon align="inline-start">
                <Search className="size-3.5 text-slate-400 dark:text-zinc-500" />
              </InputGroupAddon>
            </ComboboxInput>
          </div>

          <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
            Select question type
          </div>

          <ComboboxEmpty className="py-6 text-center text-xs text-slate-400 dark:text-zinc-500">
            No question types found.
          </ComboboxEmpty>

          <ComboboxList className="max-h-[320px] p-0.5">
            {(type: PageType) => {
              const visual = PAGE_TYPE_VISUALS[type];
              const TypeIcon = visual?.icon;
              const label = visual?.displayName ?? PAGE_TYPE_LABELS[type] ?? type;
              return (
                <ComboboxItem
                  key={type}
                  value={type}
                  className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left text-sm min-h-0 data-highlighted:bg-slate-100 dark:data-highlighted:bg-zinc-800 cursor-pointer w-full group/item"
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
                </ComboboxItem>
              );
            }}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}
