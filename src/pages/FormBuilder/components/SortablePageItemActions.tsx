import { useState } from "react";
import {
  Trash2,
  ChevronUp,
  ChevronDown,
  Copy,
  MoreVertical,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "../../../components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../../components/ui/tooltip";
import { cn } from "@/lib/utils";

interface SortablePageItemActionsProps {
  index: number;
  isFirst: boolean;
  isLast: boolean;
  onDelete: (index: number) => void;
  onDuplicate?: (index: number) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
}

/** Delete (with confirm) and the three-dot page menu. */
export function SortablePageItemActions({
  index,
  isFirst,
  isLast,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
}: SortablePageItemActionsProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <div className="flex shrink-0 items-center gap-0.5">
      <Popover open={confirmOpen} onOpenChange={setConfirmOpen}>
        <Tooltip>
          <TooltipTrigger
            render={
              <PopoverTrigger
                type="button"
                aria-label="Delete page"
                onClick={(e) => e.stopPropagation()}
                className={`flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 dark:text-zinc-400 hover:bg-rose-500/10 hover:text-rose-500 dark:hover:text-rose-400 cursor-pointer transition-opacity duration-200 ${
                  confirmOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                }`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </PopoverTrigger>
            }
          />
          <TooltipContent>Delete</TooltipContent>
        </Tooltip>
        <PopoverContent
          side="top"
          align="end"
          sideOffset={8}
          onClick={(e) => e.stopPropagation()}
          className="w-64 gap-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#18181c] p-4 shadow-xl dark:shadow-2xl text-slate-800 dark:text-zinc-100"
        >
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              Delete this page?
            </p>
            <p className="text-xs leading-snug text-slate-500 dark:text-zinc-400">
              This action cannot be undone.
            </p>
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmOpen(false)}
              className="border-slate-200 dark:border-zinc-700 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => {
                setConfirmOpen(false);
                onDelete(index);
              }}
              className="bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
            >
              Delete
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              onClick={(e) => e.stopPropagation()}
              className={cn("flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-700 dark:hover:text-zinc-200 transition-colors cursor-pointer ", confirmOpen ? "opacity-100": "opacity-0 group-hover:opacity-100")}
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          }
        />
        <DropdownMenuContent
          align="end"
          className="w-40 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#18181c] p-1.5 shadow-xl dark:shadow-2xl text-slate-800 dark:text-zinc-200"
        >
          {onDuplicate && (
            <DropdownMenuItem
              className="cursor-pointer rounded-lg text-xs font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white"
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate(index);
              }}
            >
              <Copy className="h-3.5 w-3.5 mr-2 text-slate-400 dark:text-zinc-400" />
              Duplicate
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            disabled={isFirst}
            className="cursor-pointer rounded-lg text-xs font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white disabled:opacity-40"
            onClick={(e) => {
              e.stopPropagation();
              onMoveUp(index);
            }}
          >
            <ChevronUp className="h-3.5 w-3.5 mr-2 text-slate-400 dark:text-zinc-400" />
            Move Up
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={isLast}
            className="cursor-pointer rounded-lg text-xs font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white disabled:opacity-40"
            onClick={(e) => {
              e.stopPropagation();
              onMoveDown(index);
            }}
          >
            <ChevronDown className="h-3.5 w-3.5 mr-2 text-slate-400 dark:text-zinc-400" />
            Move Down
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
