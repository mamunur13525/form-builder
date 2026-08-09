import type { FormField } from "@/shared/types/common";
import { TextField } from "@/shared/components/fields";

interface EditorProps {
  page: FormField;
  pageIndex: number;
  onUpdate: (index: number, updates: Partial<FormField>) => void;
  color?: string;
  fontSizeClass?: string;
}

export function UrlEditor({ page, pageIndex, onUpdate, color, fontSizeClass }: EditorProps) {
  return (
    <div className="space-y-1">
      <TextField
        value={page.placeholder}
        onChange={(v) => onUpdate(pageIndex, { placeholder: v })}
        placeholder="https://example.com"
        color={color}
        fontSizeClass={fontSizeClass}
      />
    </div>
  );
}
