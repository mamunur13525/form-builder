import type { FormPage } from "@/shared/types/common";
import { DatePage } from "@/shared/components/pages";

interface EditorProps {
  page: FormPage;
  pageIndex: number;
  onUpdate: (index: number, updates: Partial<FormPage>) => void;
  color?: string;
  fontSizeClass?: string;
}

export function DateEditor({ page, pageIndex, onUpdate, color, fontSizeClass }: EditorProps) {
  return (
    <div className="space-y-1">
      <DatePage
        value={page.placeholder}
        onChange={(v) => onUpdate(pageIndex, { placeholder: v })}
        color={color}
        fontSizeClass={fontSizeClass}
      />
    </div>
  );
}
