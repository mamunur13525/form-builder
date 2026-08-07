import type { FormField } from "@/shared/types/common";
import { TextareaField } from "@/shared/components/fields";

interface EditorProps {
  page: FormField;
  pageIndex: number;
  onUpdate: (index: number, updates: Partial<FormField>) => void;
  color?: string;
  fontSizeClass?: string;
}

export function LongTextEditor({ page, pageIndex, onUpdate, color, fontSizeClass }: EditorProps) {
  return (
    <div className="space-y-1">
      <TextareaField
        value={page.placeholder}
        onChange={(v) => onUpdate(pageIndex, { placeholder: v })}
        placeholder="Placeholder text..."
        rows={3}
        color={color}
        fontSizeClass={fontSizeClass}
      />
    </div>
  );
}
