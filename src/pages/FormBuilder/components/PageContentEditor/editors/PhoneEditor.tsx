import type { FormField } from "@/shared/types/common";
import { TextField } from "@/shared/components/fields";

interface EditorProps {
  page: FormField;
  pageIndex: number;
  onUpdate: (index: number, updates: Partial<FormField>) => void;
}

export function PhoneEditor({ page, pageIndex, onUpdate }: EditorProps) {
  return (
    <div className="space-y-1">
      <TextField
        value={page.placeholder}
        onChange={(v) => onUpdate(pageIndex, { placeholder: v })}
        placeholder="+1 (555) 000-0000"
      />
    </div>
  );
}