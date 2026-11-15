import { Input } from "../../../components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
} from "../../../components/ui/select";
import type {
    FormLogicRule,
    FormPage,
    FormVariable,
    LogicCalcOperation,
} from "../../../shared/types/common";
import { CALC_OPERATIONS, type SectionConfig } from "./logicEditorConfig";
import { PageSelectContent, INPUT_CLASS, OVERLAY_CLASS, Trigger } from "./ruleEditorUi";
import { cn } from "@/lib/utils";

type RuleAction = NonNullable<FormLogicRule["actions"]>[number]

interface RuleThenControlsProps {
    section: SectionConfig
    action: RuleAction
    pages: FormPage[]
    selectedPageKey: string
    numberVariables: FormVariable[]
    isCalculation: boolean
    setAction: (patch: Partial<RuleAction>) => void
}

/** Footer action selects, per rule category. */
export function RuleThenControls({
    section,
    action,
    pages,
    selectedPageKey,
    numberVariables,
    isCalculation,
    setAction,
}: RuleThenControlsProps) {
    if (section.category === "branching") {
        return (
            <>
                <Select
                    value={action?.action ?? "jumpToPage"}
                    onValueChange={(v) => {
                        if (v !== "jumpToPage" && v !== "goToEnd") return
                        setAction({
                            action: v,
                            targetPageKey:
                                v === "goToEnd" ? undefined : action?.targetPageKey,
                        })
                    }}
                >
                    <Trigger
                        aria-label="Branching action"
                        className="w-[150px] shrink-0 border-[var(--input)] bg-[var(--secondary)] shadow-none"
                    >
                        <span className="min-w-0 truncate">
                            {section.actionOptions.find(
                                (o) => o.value === (action?.action ?? "jumpToPage"),
                            )?.label ?? "Skip to"}
                        </span>
                    </Trigger>
                    <SelectContent className={OVERLAY_CLASS}>
                        {section.actionOptions.map((o) => (
                            <SelectItem key={o.value} value={o.value}>
                                {o.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {action?.action !== "goToEnd" && (
                    <Select
                        value={action.targetPageKey || null}
                        onValueChange={(v) => {
                            if (!v) return
                            setAction({ targetPageKey: v })
                        }}
                    >
                        <Trigger aria-label="Jump target page" className="flex-1">
                            <PageSelectContent
                                page={pages.find(
                                    (p) => p.pageKey === action.targetPageKey,
                                )}
                                pageNumber={
                                    action.targetPageKey
                                        ? pages.findIndex(
                                              (p) => p.pageKey === action.targetPageKey,
                                          ) + 1 || null
                                        : null
                                }
                                placeholder="Select a page…"
                            />
                        </Trigger>
                        <SelectContent className={OVERLAY_CLASS}>
                            {pages
                                .filter(
                                    (p) => p.pageKey !== selectedPageKey,
                                )
                                .map((p) => (
                                    <SelectItem key={p.pageKey} value={p.pageKey}>
                                        <PageSelectContent
                                            page={p}
                                            pageNumber={
                                                pages.findIndex(
                                                    (pi) => pi.pageKey === p.pageKey,
                                                ) + 1
                                            }
                                        />
                                    </SelectItem>
                                ))}
                        </SelectContent>
                    </Select>
                )}
            </>
        )
    }

    if (isCalculation) {
        const operandRaw =
            typeof action?.value === "string"
                ? action.value
                : action?.value != null
                  ? String(action.value)
                  : ""
        const operandIsVariable = operandRaw.startsWith("@")
        const operandVarName = operandIsVariable ? operandRaw.slice(1) : ""
        const operandNumber = operandIsVariable ? "" : operandRaw

        return (
            <>
                <Select
                    value={action?.variableName || null}
                    onValueChange={(v) => {
                        if (!v) return
                        setAction({ variableName: v })
                    }}
                >
                    <Trigger
                        aria-label="Target variable"
                        className="w-[150px] shrink-0 border-[var(--input)] bg-[var(--secondary)] shadow-none"
                    >
                        <span className="min-w-0 truncate">
                            {action?.variableName
                                ? `@${action.variableName}`
                                : "Set variable"}
                        </span>
                    </Trigger>
                    <SelectContent className={OVERLAY_CLASS}>
                        {numberVariables.map((v) => (
                            <SelectItem key={v.name} value={v.name}>
                                @{v.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select
                    value={action?.operation ?? "set"}
                    onValueChange={(v) => {
                        if (v) setAction({ operation: v as LogicCalcOperation })
                    }}
                >
                    <Trigger
                        aria-label="Calculation operation"
                        className="w-[150px] shrink-0 border-[var(--input)] bg-[var(--secondary)] shadow-none"
                    >
                        <span className="min-w-0 truncate">
                            {CALC_OPERATIONS.find(
                                (o) => o.value === (action?.operation ?? "set"),
                            )?.label}
                        </span>
                    </Trigger>
                    <SelectContent className={OVERLAY_CLASS}>
                        {CALC_OPERATIONS.map((o) => (
                            <SelectItem key={o.value} value={o.value}>
                                {o.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select
                    value={operandIsVariable ? "variable" : "number"}
                    onValueChange={(v) => {
                        if (v === "variable" || v === "number") {
                            setAction({ value: v === "variable" ? "@" : "" })
                        }
                    }}
                >
                    <Trigger
                        aria-label="Operand type"
                        className="w-[150px] shrink-0 border-[var(--input)] bg-[var(--secondary)] shadow-none"
                    >
                        <span className="min-w-0 truncate">
                            {operandIsVariable ? "a variable" : "a number"}
                        </span>
                    </Trigger>
                    <SelectContent className={OVERLAY_CLASS}>
                        <SelectItem value="number">a number</SelectItem>
                        <SelectItem value="variable">a variable</SelectItem>
                    </SelectContent>
                </Select>
                {operandIsVariable ? (
                    <Select
                        value={operandVarName || null}
                        onValueChange={(v) => {
                            if (!v) return
                            setAction({ value: `@${v}` })
                        }}
                    >
                        <Trigger aria-label="Operand variable" className="flex-1">
                            <span className="min-w-0 truncate">
                                @{operandVarName || "Select a variable…"}
                            </span>
                        </Trigger>
                        <SelectContent className={OVERLAY_CLASS}>
                            {numberVariables.map((v) => (
                                <SelectItem key={v.name} value={v.name}>
                                    @{v.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                ) : (
                    <Input
                        type="number"
                        value={operandNumber}
                        onChange={(e) => setAction({ value: e.target.value })}
                        className={cn(INPUT_CLASS, "min-w-[12rem] flex-1")}
                        placeholder="e.g. 5"
                    />
                )}
            </>
        )
    }

    return (
        <>
            <span className="w-[150px] shrink-0 truncate text-[15px] font-medium text-[var(--editorial-body)]">
                {section.title}
            </span>
            <Select
                value={action?.targetPageKey || null}
                onValueChange={(v) => {
                    if (!v) return
                    setAction({ targetPageKey: v })
                }}
            >
                <Trigger aria-label="Target page" className="flex-1">
                    <PageSelectContent
                        page={pages.find((p) => p.pageKey === action?.targetPageKey)}
                        pageNumber={
                            action?.targetPageKey
                                ? pages.findIndex(
                                      (p) => p.pageKey === action.targetPageKey,
                                  ) + 1 || null
                                : null
                        }
                        placeholder="Select a page…"
                    />
                </Trigger>
                <SelectContent className={OVERLAY_CLASS}>
                    {pages.map((p) => (
                        <SelectItem key={p.pageKey} value={p.pageKey}>
                            <PageSelectContent
                                page={p}
                                pageNumber={
                                    pages.findIndex((pi) => pi.pageKey === p.pageKey) + 1
                                }
                            />
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </>
    )
}
