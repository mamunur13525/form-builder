import { ChevronDown, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { FormLogicRule } from "../../../shared/types/common";
import { ruleSummary } from "./ruleUtils";

interface RuleCardV2Props {
    rule: FormLogicRule;
    index: number;
    onEdit: () => void;
    onDelete: () => void;
    isExpanded?: boolean;
    onToggleExpand: () => void;
    children?: React.ReactNode;
}

export function RuleCardV2({
    rule,
    index,
    onEdit,
    onDelete,
    isExpanded = true,
    onToggleExpand,
    children,
}: RuleCardV2Props) {
    const summary = ruleSummary(rule);

    return (
        <motion.div
            className="relative rounded-[12px] border border-[#e5e7eb] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05),0_4px_6px_rgba(0,0,0,0.04)] transition-all duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08),0_8px_16px_rgba(0,0,0,0.06)]"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
        >
            <div className="flex items-center justify-between gap-3 px-4 py-3.5">
                <div className="flex items-center gap-3">
                    <span className="flex h-6 min-w-[6px] items-center justify-center rounded-full bg-[#06b6d4]/10 text-[#06b6d4] text-[11px] font-semibold uppercase tracking-wide">
                        Rule #{index + 1}
                    </span>
                    <button
                        type="button"
                        onClick={onToggleExpand}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-[#6b7280] transition-colors hover:bg-[#f3f4f6] hover:text-[#111827]"
                        aria-label={isExpanded ? "Collapse rule" : "Expand rule"}
                        aria-expanded={isExpanded}
                    >
                        <ChevronDown
                            className={`h-4 w-4 transition-transform duration-200 ${
                                isExpanded ? "rotate-180" : "rotate-0"
                            }`}
                        />
                    </button>
                </div>

                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={onEdit}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-[#6b7280] transition-colors hover:bg-[#f3f4f6] hover:text-[#111827]"
                        aria-label="Edit rule"
                    >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                    </button>
                    <button
                        type="button"
                        onClick={onDelete}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-[#6b7280] transition-colors hover:bg-[#fef2f2] hover:text-[#ef4444]"
                        aria-label="Delete rule"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-[#e5e7eb] px-4 pb-4"
                    >
                        <div className="pt-3 text-[#374151] text-[13px] leading-relaxed">{summary}</div>
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>

            {rule.enabled === false && (
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-[#fef2f2] text-[#ef4444] text-[10px] font-medium uppercase tracking-wide">
                    Disabled
                </div>
            )}
        </motion.div>
    );
}