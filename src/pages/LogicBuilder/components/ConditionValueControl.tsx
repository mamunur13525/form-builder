import { Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "../../../components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
} from "../../../components/ui/select";
import {
    INPUT_CLASS,
    OVERLAY_CLASS,
    Trigger,
} from "./ruleEditorUi";

interface ConditionValueControlProps {
    hasValue: boolean;
    showValueSelect: boolean;
    value: unknown;
    condValueOptions: Array<{ value?: unknown; label?: string }>;
    isCalculation: boolean;
    sourceType: "page" | "variable" | undefined;
    onChange: (value: string) => void;
}

export function ConditionValueControl({
    hasValue,
    showValueSelect,
    value,
    condValueOptions,
    isCalculation,
    sourceType,
    onChange,
}: ConditionValueControlProps) {
    if (!hasValue) return null;

    if (showValueSelect) {
        return (
            <Select
                value={
                    value == null || value === ""
                        ? null
                        : String(value)
                }
                onValueChange={(v) => {
                    if (v != null) onChange(v);
                }}
            >
                <Trigger aria-label="Value" className="flex-1 min-w-[150px]">
                    <span className="flex min-w-0 items-center gap-2 truncate">
                        <Circle
                            className="h-4 w-4 shrink-0 text-[var(--foreground)]"
                            aria-hidden
                        />
                        <span className="min-w-0 truncate">
                            {String(
                                condValueOptions.find(
                                    (o) =>
                                        String(o.value) === String(value) ||
                                        o.label === String(value),
                                )?.label ??
                                    value ??
                                    "Select Value…",
                            )}
                        </span>
                    </span>
                </Trigger>
                <SelectContent className={OVERLAY_CLASS}>
                    {condValueOptions.map((o) => (
                        <SelectItem
                            key={String(o.value ?? o.label)}
                            value={String(o.value ?? o.label ?? "")}
                        >
                            {o.label ?? String(o.value)}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        );
    }

    return (
        <Input
            type={
                sourceType === "page" && isCalculation
                    ? "number"
                    : "text"
            }
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
            className={cn(INPUT_CLASS, "min-w-[12rem] flex-1")}
            placeholder="Value"
        />
    );
}
