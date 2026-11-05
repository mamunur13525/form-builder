/**
 * Static configuration for the Logic editor dialog: the four rule sections
 * (one per backend rule category) and the comparison-operator metadata used
 * by the condition builder.
 */

import { Eye, EyeOff, GitBranch, Calculator } from "lucide-react";
import type { LogicCalcOperation, LogicCategory, LogicOperator } from "../../../shared/types/common";

export interface SectionConfig {
    category: LogicCategory
    title: string
    description: string
    icon: typeof Eye
    /** Action types this section lets the user pick for a rule. */
    actionOptions: { value: "showPage" | "hidePage" | "jumpToPage" | "goToEnd" | "setVariable"; label: string }[]
}

export const SECTIONS: SectionConfig[] = [
    {
        category: "display",
        title: "Display page",
        description: "Show this page only when the conditions below are true.",
        icon: Eye,
        actionOptions: [{ value: "showPage", label: "Show this page" }],
    },
    {
        category: "hidePage",
        title: "Hide page",
        description: "Hide this page when the conditions below are true.",
        icon: EyeOff,
        actionOptions: [{ value: "hidePage", label: "Hide this page" }],
    },
    {
        category: "branching",
        title: "Page branching",
        description: "Jump straight to another page (or the end of the form).",
        icon: GitBranch,
        actionOptions: [
            { value: "jumpToPage", label: "Jump to page" },
            { value: "goToEnd", label: "Jump to end" },
        ],
    },
    {
        category: "calculation",
        title: "Calculations",
        description: "Set or update a number variable — add, subtract, multiply or divide by a number or another number variable.",
        icon: Calculator,
        actionOptions: [{ value: "setVariable", label: "Update a variable" }],
    },
]

export const OPERATOR_LABELS: Record<LogicOperator, string> = {
    equals: "is equal to",
    notEquals: "is not equal to",
    contains: "contains",
    notContains: "does not contain",
    greaterThan: "is greater than",
    greaterThanOrEquals: "is greater than or equal to",
    lessThan: "is less than",
    lessThanOrEquals: "is less than or equal to",
    isEmpty: "is empty",
    isNotEmpty: "is not empty",
}

export const OPERATOR_OPTIONS = (Object.keys(OPERATOR_LABELS) as LogicOperator[]).map(
    (operator) => ({ value: operator, label: OPERATOR_LABELS[operator] }),
)

/** Operators that need a comparison value. */
export const OPERATORS_WITH_VALUE = new Set<LogicOperator>([
    "equals",
    "notEquals",
    "contains",
    "notContains",
    "greaterThan",
    "greaterThanOrEquals",
    "lessThan",
    "lessThanOrEquals",
])

/** Operators that only make sense for numeric sources. */
export const NUMERIC_ONLY_OPERATORS: LogicOperator[] = [
    "greaterThan",
    "greaterThanOrEquals",
    "lessThan",
    "lessThanOrEquals",
]

/**
 * Arithmetic operations offered by calculation rules. `set` overwrites the
 * target variable; the rest fold the operand onto its running value. The verb
 * labels read naturally after the target: "@score" + "Add" + "5".
 */
export const CALC_OPERATIONS: { value: LogicCalcOperation; label: string }[] = [
    { value: "set", label: "Set to" },
    { value: "add", label: "Add" },
    { value: "subtract", label: "Subtract" },
    { value: "multiply", label: "Multiply by" },
    { value: "divide", label: "Divide by" },
]

/** Short symbol per operation, used by the read-only rule summary chips. */
export const CALC_OPERATION_SYMBOLS: Record<LogicCalcOperation, string> = {
    set: "=",
    add: "+",
    subtract: "−",
    multiply: "×",
    divide: "÷",
}
