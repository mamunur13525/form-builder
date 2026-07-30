import { Button } from "@/components/ui/button";
import type { FormField } from "@/shared/types/common";

import {
  ShortTextEditor,
  LongTextEditor,
  EmailEditor,
  PhoneEditor,
  NumberEditor,
  DateEditor,
  TimeEditor,
  UrlEditor,
  FileEditor,
  RatingEditor,
  YesNoEditor,
  RadioEditor,
  CheckboxEditor,
  SelectEditor,
  MultiSelectEditor,
} from "./editors";
import { cn } from "@/lib/utils";

interface PageContentEditorProps {
  page: FormField;
  pageIndex: number;
  onUpdate: (index: number, updates: Partial<FormField>) => void;
  isMobileView: boolean;
}

const editorMap: Record<
  string,
  React.ComponentType<{
    page: FormField;
    pageIndex: number;
    onUpdate: (index: number, updates: Partial<FormField>) => void;
  }>
> = {
  shortText: ShortTextEditor,
  longText: LongTextEditor,
  email: EmailEditor,
  phone: PhoneEditor,
  number: NumberEditor,
  date: DateEditor,
  time: TimeEditor,
  url: UrlEditor,
  file: FileEditor,
  rating: RatingEditor,
  yesNo: YesNoEditor,
  radio: RadioEditor,
  checkbox: CheckboxEditor,
  select: SelectEditor,
  multiSelect: MultiSelectEditor,
};

export function PageContentEditor({
  page,
  pageIndex,
  onUpdate,
  isMobileView,
}: PageContentEditorProps) {
  const FieldEditor = editorMap[page.type];

  return (
    <div className="w-full h-3/4 flex flex-col">
      {/* Editor Content */}
      <div className={cn("flex-1 overflow-y-auto")}>
        <div
          className={cn(
            "mx-auto transition-all duration-500 ease-in-out px-6",
            isMobileView ? "w-full " : "w-11/12",
          )}
        >
          {/* Editable Label */}
          <div className="relative space-y-1">
            <span className="absolute right-[102%]  top-2 text-[10px] font-bold text-muted select-none bg-gray-900 px-1 rounded">
              {pageIndex + 1}
            </span>
            <div
              contentEditable
              suppressContentEditableWarning
              data-placeholder="Type your question... Use @ to recall information."
              className="text-lg outline-none border-b border-transparent focus:border-primary pb-1 transition-colors cursor-text"
              onBlur={(e) =>
                onUpdate(pageIndex, {
                  label: e.currentTarget.textContent || "",
                })
              }
              dangerouslySetInnerHTML={{ __html: page.label }}
            />
          </div>

          {/* Editable Helper Text */}
          <div className="space-y-1">
            <div
              contentEditable
              suppressContentEditableWarning
              data-placeholder="Description (optional)"
              className="text-sm text-muted-foreground outline-none border-b border-transparent focus:border-primary pb-1 transition-colors cursor-text"
              onBlur={(e) =>
                onUpdate(pageIndex, {
                  helperText: e.currentTarget.textContent || "",
                })
              }
              dangerouslySetInnerHTML={{ __html: page.helperText || "" }}
            />
          </div>
          <div className="mt-2">
            {/* Field-specific editor */}
            {FieldEditor && (
              <FieldEditor
                page={page}
                pageIndex={pageIndex}
                onUpdate={onUpdate}
              />
            )}
          </div>

          {/* Submit button preview */}
          <div className="pt-2">
            <Button
              size="lg"
              className="w-full sm:w-auto"
              style={
                page.appearance.submitButtonColor
                  ? { backgroundColor: page.appearance.submitButtonColor }
                  : undefined
              }
            >
              {page.appearance.submitButtonText || "Submit"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
