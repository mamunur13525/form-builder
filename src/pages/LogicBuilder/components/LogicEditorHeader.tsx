import { X } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../../components/ui/select";
import type { FormPage } from "../../../shared/types/common";
import { PageTypeChip } from "./RuleEditor";

interface LogicEditorHeaderProps {
    selectedPage: FormPage;
    allPages: FormPage[];
    onSelectPage: (pageKey: string) => void;
    onClose: () => void;
}

/** Dialog header: page dropdown + close button. */
export function LogicEditorHeader({
    selectedPage,
    allPages,
    onSelectPage,
    onClose,
}: LogicEditorHeaderProps) {
    return (
        <div className="flex items-start justify-between gap-3 border-b border-[var(--editorial-border-light)] px-4 py-3 sm:px-6 sm:py-4">
            <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="flex w-full max-w-sm mx-auto flex-col gap-1">
                    <label
                        htmlFor="logic-builder-page-select"
                        className="text-[11px] text-center font-semibold uppercase tracking-wide text-[var(--editorial-subtle)]"
                    >
                        Select page
                    </label>
                    <Select
                        value={selectedPage.pageKey}
                        onValueChange={(v) => {
                            if (v) onSelectPage(v)
                        }}
                    >
                        <SelectTrigger
                            id="logic-builder-page-select"
                            size="sm"
                            aria-label="Select page"
                            className="w-full rounded-lg border-[var(--input)] bg-[var(--card)] px-3.5 text-[15px] shadow-sm hover:border-[var(--editorial-primary-ring)]"
                        >
                            <SelectValue>
                                <span className="flex min-w-0 items-center gap-2 truncate">
                                    <PageTypeChip
                                        page={selectedPage}
                                        pageNumber={
                                            allPages.findIndex(
                                                (p) =>
                                                    p.pageKey ===
                                                    selectedPage.pageKey,
                                            ) + 1
                                        }
                                    />
                                    <span className="truncate">
                                        {selectedPage.title || selectedPage.label || "Untitled page"}
                                    </span>
                                </span>
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="editorial">
                            {allPages.map((p, index) => {
                                const qs = p.questions ?? p.blocks ?? []
                                const qCount = qs.length > 0 ? qs.length : 1
                                const pageTitle = p.title || p.label || "Untitled page"
                                return (
                                    <SelectItem key={p.pageKey} value={p.pageKey}>
                                        <span className="flex items-center gap-2">
                                            <PageTypeChip page={p} pageNumber={index + 1} />
                                            <span className="truncate">
                                                {pageTitle}
                                            </span>
                                            <span className="text-xs text-[var(--muted-foreground)]">
                                                ({qCount} {qCount === 1 ? "question" : "questions"})
                                            </span>
                                        </span>
                                    </SelectItem>
                                )
                            })}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <button
                type="button"
                aria-label="Close"
                onClick={onClose}
                className="editorial-transition flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--editorial-subtle)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)]"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    )
}
