import type { FormPage } from "@/shared/types/common";
import { TimePage } from "@/shared/components/pages";

interface EditorProps {
  page: FormPage;
  pageIndex: number;
  onUpdate: (index: number, updates: Partial<FormPage>) => void;
  color?: string;
  fontSizeClass?: string;
}

export function TimeEditor({ page, pageIndex, onUpdate, color, fontSizeClass }: EditorProps) {
  return (
    <div className="space-y-1">
      <TimePage
        value={page.placeholder}
        onChange={(v) => onUpdate(pageIndex, { placeholder: v })}
        color={color}
        fontSizeClass={fontSizeClass}
      />
    </div>
  );
}
