import type { FormField } from "@/shared/types/common";
import { TimeField } from "@/shared/components/fields";

interface EditorProps {
  page: FormField;
  pageIndex: number;
  onUpdate: (index: number, updates: Partial<FormField>) => void;
  color?: string;
  fontSizeClass?: string;
}

export function TimeEditor({ page, pageIndex, onUpdate, color, fontSizeClass }: EditorProps) {
  return (
    <div className="space-y-1">
      <TimeField
        value={page.placeholder}
        onChange={(v) => onUpdate(pageIndex, { placeholder: v })}
        color={color}
        fontSizeClass={fontSizeClass}
      />
    </div>
  );
}
