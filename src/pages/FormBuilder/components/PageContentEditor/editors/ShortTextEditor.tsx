import type { FormField } from "@/shared/types/common";
import { TextField } from "@/shared/components/fields";

interface EditorProps {
  page: FormField;
  pageIndex: number;
  onUpdate: (index: number, updates: Partial<FormField>) => void;
}

export function ShortTextEditor({ page, pageIndex, onUpdate }: EditorProps) {
  return (
    <div className="space-y-1">
      <TextField
        value={page.placeholder}
        onChange={(v) => onUpdate(pageIndex, { placeholder: v })}
        placeholder="Placeholder text..."
      />
    </div>
  );
}