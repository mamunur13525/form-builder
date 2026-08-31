import { Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { LogicCondition, LogicOperator, LogicCombinator, LogicSourceType } from "../../../shared/types/common";
import {
    OPERATORS_WITH_VALUE,
} from "./logicEditorConfig";

interface ConditionRowProps {
    condition: LogicCondition;
    index: number;
    isFirst: boolean;
    operatorOptions: { value: LogicOperator; label: string }[];
    valueOptions: { value: string; label: string }[];
    numericSources: Set<string>;
    onUpdate: (index: number, patch: Partial<LogicCondition>) => void;
    onRemove: (index: number) => void;
    canRemove: boolean;
    pages: { pageKey: string; label: string }[];
    variables: { name: string }[];
}

export function ConditionRow({
    condition,
    index,
    isFirst,
    operatorOptions,
    valueOptions,
    numericSources,
    onUpdate,
    onRemove,
    canRemove,
    pages,
    variables,
}: ConditionRowProps) {
    const hasValue = OPERATORS_WITH_VALUE.has(condition.operator);
    const showValueSelect = valueOptions.length > 0 && hasValue;
    const sourceIsPage = condition.sourceType === "page";
    const isNumeric = numericSources.has(condition.sourceKey);

    return (
        <motion.div
            key={index}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="flex flex-wrap items-center gap-2.5"
        >
            {!isFirst && (
                <div className="flex items-center gap-2">
                    <div className="w-px h-4 bg-[#e5e7eb]" />
                    <Select
                        value={condition.combinator ?? "and"}
                        onValueChange={(value) =>
                            onUpdate(index, { combinator: value as LogicCombinator })
                        }
                    >
                        <SelectTrigger className="h-8 rounded-lg border border-[#e5e7eb] bg-white px-2.5 py-1.5 text-[12px] font-semibold text-[#06b6d4] min-w-[70px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="and">AND</SelectItem>
                            <SelectItem value="or">OR</SelectItem>
                        </SelectContent>
                    </Select>
                    <div className="w-px h-4 bg-[#e5e7eb]" />
                </div>
            )}

            <span className={`flex items-center text-[12px] font-medium ${isFirst ? "text-[#06b6d4]" : "text-[#9ca3af]"}`}>
                {isFirst ? "If the answer" : "If the answer"}
            </span>

            <Select
                value={condition.sourceType}
                onValueChange={(value) => {
                    const nextType = value as LogicSourceType;
                    onUpdate(index, {
                        sourceType: nextType,
                        sourceKey: nextType === "page" ? pages[0]?.pageKey ?? "" : variables[0]?.name ?? "",
                        operator: "equals",
                        value: "",
                    });
                }}
            >
                <SelectTrigger className="h-8 rounded-lg border border-[#e5e7eb] bg-white px-2.5 py-1.5 text-[13px] text-[#374151] min-w-[130px]">
                    <SelectValue placeholder="a page answer" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="page">a page answer</SelectItem>
                    <SelectItem value="variable">a variable</SelectItem>
                </SelectContent>
            </Select>

            {condition.sourceType === "variable" && (
                <Select
                    value={condition.sourceKey}
                    onValueChange={(value) => onUpdate(index, { sourceKey: value, value: "" })}
                >
                    <SelectTrigger className="h-8 rounded-lg border border-[#e5e7eb] bg-white px-2.5 py-1.5 text-[13px] text-[#374151] min-w-[150px]">
                        <SelectValue placeholder="Select variable" />
                    </SelectTrigger>
                    <SelectContent>
                        {variables.map((v) => (
                            <SelectItem key={v.name} value={v.name}>
                                @{v.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}

            {condition.sourceType === "page" && (
                <Select
                    value={condition.sourceKey}
                    onValueChange={(value) => onUpdate(index, { sourceKey: value, value: "" })}
                >
                    <SelectTrigger className="h-8 rounded-lg border border-[#e5e7eb] bg-white px-2.5 py-1.5 text-[13px] text-[#374151] min-w-[150px]">
                        <SelectValue placeholder="Select question" />
                    </SelectTrigger>
                    <SelectContent>
                        {pages.map((p) => (
                            <SelectItem key={p.pageKey} value={p.pageKey}>
                                {p.label || p.pageKey}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}

            <Select
                value={condition.operator}
                onValueChange={(value) => onUpdate(index, { operator: value as LogicOperator })}
            >
                <SelectTrigger className="h-8 rounded-lg border border-[#e5e7eb] bg-white px-2.5 py-1.5 text-[13px] text-[#374151] min-w-[150px]">
                    <SelectValue placeholder="Select operator" />
                </SelectTrigger>
                <SelectContent>
                    {operatorOptions.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                            {o.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {hasValue && (
                <>
                    {showValueSelect ? (
                        <Select
                            value={String(condition.value ?? "")}
                            onValueChange={(value) => onUpdate(index, { value: value })}
                        >
                            <SelectTrigger className="h-8 rounded-lg border border-[#e5e7eb] bg-white px-2.5 py-1.5 text-[13px] text-[#374151] min-w-[140px]">
                                <SelectValue placeholder="Select answer" />
                            </SelectTrigger>
                            <SelectContent>
                                {valueOptions.map((o) => (
                                    <SelectItem key={o.value} value={String(o.value)}>
                                        {o.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    ) : sourceIsPage && isNumeric ? (
                        <input
                            type="number"
                            value={String(condition.value ?? "")}
                            onChange={(e) => onUpdate(index, { value: e.target.value })}
                            className="h-8 w-24 rounded-lg border border-[#e5e7eb] bg-white px-3 py-1.5 text-[13px] text-[#111827] placeholder-[#9ca3af] transition-colors focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/20 focus:border-[#06b6d4]"
                            placeholder="Value"
                        />
                    ) : (
                        <input
                            type="text"
                            value={String(condition.value ?? "")}
                            onChange={(e) => onUpdate(index, { value: e.target.value })}
                            className="h-8 w-24 rounded-lg border border-[#e5e7eb] bg-white px-3 py-1.5 text-[13px] text-[#111827] placeholder-[#9ca3af] transition-colors focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/20 focus:border-[#06b6d4]"
                            placeholder="Value"
                        />
                    )}
                </>
            )}

            <button
                type="button"
                onClick={() => onRemove(index)}
                disabled={!canRemove}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-[#9ca3af] transition-colors hover:bg-[#f3f4f6] hover:text-[#ef4444] disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Remove condition"
            >
                <Trash2 className="h-3.5 w-3.5" />
            </button>
        </motion.div>
    );
}