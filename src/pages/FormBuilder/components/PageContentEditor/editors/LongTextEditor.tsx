import type { FormPage } from "@/shared/types/common";
import { TextareaPage } from "@/shared/components/pages";
import { cn } from "@/lib/utils";

interface EditorProps {
  page: FormPage;
  pageIndex: number;
  onUpdate: (index: number, updates: Partial<FormPage>) => void;
  color?: string;
  fontSizeClass?: string;
}

export function LongTextEditor({ page, pageIndex, onUpdate, color, fontSizeClass }: EditorProps) {
  return (
    <div className="space-y-1">
      <TextareaPage
        value={page.placeholder}
        onChange={(v) => onUpdate(pageIndex, { placeholder: v })}
        placeholder="Placeholder text..."
        rows={3}
        color={color}
        fontSizeClass={cn(fontSizeClass)}
      />
    </div>
  );
}
