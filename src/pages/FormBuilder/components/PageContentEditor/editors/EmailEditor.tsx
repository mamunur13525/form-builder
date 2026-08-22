import type { FormPage } from "@/shared/types/common";
import { TextPage } from "@/shared/components/pages";

interface EditorProps {
  page: FormPage;
  pageIndex: number;
  onUpdate: (index: number, updates: Partial<FormPage>) => void;
  color?: string;
  fontSizeClass?: string;
}

export function EmailEditor({ page, pageIndex, onUpdate, color, fontSizeClass }: EditorProps) {
  return (
    <div className="space-y-1">
      <TextPage
        value={page.placeholder}
        onChange={(v) => onUpdate(pageIndex, { placeholder: v })}
        placeholder="email@example.com"
        color={color}
        fontSizeClass={fontSizeClass}
      />
    </div>
  );
}
