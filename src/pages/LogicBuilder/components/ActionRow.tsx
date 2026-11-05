import { ChevronRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { FormLogicRule, FormPage, LogicCalcOperation } from "../../../shared/types/common";
import { CALC_OPERATIONS } from "./logicEditorConfig";

interface ActionRowProps {
    rule: FormLogicRule;
    sectionCategory: string;
    actionOptions: { value: string; label: string }[];
    pages: FormPage[];
    numberVariables: { name: string }[];
    onUpdateAction: (patch: Partial<NonNullable<FormLogicRule["actions"]>[number]>) => void;
}

export function ActionRow({
    rule,
    sectionCategory,
    actionOptions,
    pages,
    numberVariables,
    onUpdateAction,
}: ActionRowProps) {
    const action = (rule.actions ?? [])[0];
    const operandRaw = typeof action?.value === "string"
        ? action.value
        : action?.value != null
            ? String(action.value)
            : "";
    const operandIsVariable = operandRaw.startsWith("@");
    const operandVarName = operandIsVariable ? operandRaw.slice(1) : "";
    const operandNumber = operandIsVariable ? "" : operandRaw;

    if (sectionCategory === "branching") {
        return (
            <div className="flex items-center gap-2 rounded-xl bg-[#06b6d4]/5 border border-[#06b6d4]/15 px-3 py-2.5">
                <span className="flex items-center gap-1.5 text-[12px] font-semibold text-[#06b6d4] uppercase tracking-wide">
                    Then
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-[#9ca3af]" />
                <Select
                    value={action?.action ?? "jumpToPage"}
                    onValueChange={(value) =>
                        onUpdateAction({
                            action: value as "jumpToPage" | "goToEnd",
                            targetPageKey: value === "goToEnd" ? undefined : action?.targetPageKey,
                        })
                    }
                >
                    <SelectTrigger className="h-8 rounded-lg border border-[#e5e7eb] bg-white px-2.5 py-1.5 text-[13px] text-[#374151] min-w-[140px]">
                        <SelectValue placeholder="Select action" />
                    </SelectTrigger>
                    <SelectContent>
                        {actionOptions.map((o) => (
                            <SelectItem key={o.value} value={o.value}>
                                {o.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {action?.action === "jumpToPage" && (
                    <>
                        <span className="text-[#9ca3af] text-[12px]">to</span>
                        <Select
                            value={action.targetPageKey ?? ""}
                            onValueChange={(value) => onUpdateAction({ targetPageKey: value })}
                        >
                            <SelectTrigger className="h-8 rounded-lg border border-[#e5e7eb] bg-white px-2.5 py-1.5 text-[13px] text-[#374151] min-w-[180px]">
                                <SelectValue placeholder="Select destination" />
                            </SelectTrigger>
                            <SelectContent>
                                {pages
                                    .filter((p) => p.pageKey !== rule.conditions?.[0]?.sourceKey)
                                    .map((p) => (
                                        <SelectItem key={p.pageKey} value={p.pageKey}>
                                            <span className="flex items-center gap-2">
                                                <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-[#e0f2fe] text-[#06b6d4] text-[10px] font-semibold">
                                                    Q{p.label}
                                                </span>
                                                {p.label || p.pageKey}
                                            </span>
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                    </>
                )}
            </div>
        );
    }

    if (sectionCategory === "calculation") {
        return (
            <div className="flex flex-wrap items-center gap-2.5 rounded-xl bg-[#06b6d4]/5 border border-[#06b6d4]/15 px-3 py-2.5">
                <Select
                    value={action?.variableName ?? ""}
                    onValueChange={(value) => onUpdateAction({ variableName: value })}
                >
                    <SelectTrigger className="h-8 rounded-lg border border-[#e5e7eb] bg-white px-2.5 py-1.5 text-[13px] text-[#374151] min-w-[140px]">
                        <SelectValue placeholder="Select variable" />
                    </SelectTrigger>
                    <SelectContent>
                        {numberVariables.map((v) => (
                            <SelectItem key={v.name} value={v.name}>
                                @{v.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select
                    value={action?.operation ?? "set"}
                    onValueChange={(value) =>
                        onUpdateAction({ operation: value as LogicCalcOperation })
                    }
                >
                    <SelectTrigger className="h-8 rounded-lg border border-[#e5e7eb] bg-white px-2.5 py-1.5 text-[13px] text-[#374151] min-w-[120px]">
                        <SelectValue placeholder="Operation" />
                    </SelectTrigger>
                    <SelectContent>
                        {CALC_OPERATIONS.map((o) => (
                            <SelectItem key={o.value} value={o.value}>
                                {o.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <span className="text-[#9ca3af] text-[12px]">a number</span>

                {operandIsVariable ? (
                    <Select
                        value={operandVarName}
                        onValueChange={(value) =>
                            onUpdateAction({ value: value ? `@${value}` : "@" })
                        }
                    >
                        <SelectTrigger className="h-8 rounded-lg border border-[#e5e7eb] bg-white px-2.5 py-1.5 text-[13px] text-[#374151] min-w-[140px]">
                            <SelectValue placeholder="Select variable" />
                        </SelectTrigger>
                        <SelectContent>
                            {numberVariables.map((v) => (
                                <SelectItem key={v.name} value={v.name}>
                                    @{v.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                ) : (
                    <input
                        type="number"
                        value={operandNumber}
                        onChange={(e) => onUpdateAction({ value: e.target.value })}
                        className="h-8 w-24 rounded-lg border border-[#e5e7eb] bg-white px-3 py-1.5 text-[13px] text-[#111827] placeholder-[#9ca3af] transition-colors focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/20 focus:border-[#06b6d4]"
                        placeholder="e.g. 5"
                    />
                )}
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2 rounded-xl bg-[#06b6d4]/5 border border-[#06b6d4]/15 px-3 py-2.5">
            <span className="text-[12px] font-semibold text-[#06b6d4] uppercase tracking-wide">
                {sectionCategory === "display" ? "Display this page" : "Hide this page"}
            </span>
        </div>
    );
}