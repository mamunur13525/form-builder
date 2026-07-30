import type { FormField } from "@/shared/types/common";
import { DateField } from "@/shared/components/fields";

interface EditorProps {
  page: FormField;
  pageIndex: number;
  onUpdate: (index: number, updates: Partial<FormField>) => void;
}

export function DateEditor({ page, pageIndex, onUpdate }: EditorProps) {
  return (
    <div className="space-y-1">
      <DateField
        value={page.placeholder}
        onChange={(v) => onUpdate(pageIndex, { placeholder: v })}
      />
    </div>
  );
}