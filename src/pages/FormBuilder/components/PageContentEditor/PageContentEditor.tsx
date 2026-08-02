import type { FormField } from "@/shared/types/common";
import { FieldLabel, FieldHelperText, FieldSubmitButton } from "@/shared/components/fields";

import {
  ShortTextEditor,
  LongTextEditor,
  EmailEditor,
  PhoneEditor,
  NumberEditor,
  DateEditor,
  TimeEditor,
  UrlEditor,
  YesNoEditor,
  RadioEditor,
  CheckboxEditor,
  SelectEditor,
  MultiSelectEditor,
  StatementEditor,
  DropdownEditor,
  AddressEditor,
  OpinionScaleEditor,
  SignatureEditor,
  MatrixEditor,
  UploadEditor,
  RatingSettingsAwareEditor,
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
  file: UploadEditor,
  rating: RatingSettingsAwareEditor,
  yesNo: YesNoEditor,
  radio: RadioEditor,
  checkbox: CheckboxEditor,
  select: SelectEditor,
  multiSelect: MultiSelectEditor,
  statement: StatementEditor,
  dropdown: DropdownEditor,
  address: AddressEditor,
  opinionScale: OpinionScaleEditor,
  signature: SignatureEditor,
  matrix: MatrixEditor,
};

export function PageContentEditor({
  page,
  pageIndex,
  onUpdate,
  isMobileView,
}: PageContentEditorProps) {
  const FieldEditor = editorMap[page.type];
  // Statement pages are display-only, so they get no submit button.
  const isStatement = page.type === "statement";

  return (
    <div className="w-full max-w-[800px] mx-auto h-full flex flex-col items-center justify-center">
      {/* Editor Content */}
      <div className={cn("w-full overflow-y-auto")}>
        <div
          className={cn(
            "mx-auto transition-all duration-500 ease-in-out px-6 py-8",
            isMobileView ? "w-full" : "w-11/12",
          )}
        >
          {page.coverImage?.url && (
            <img
              src={page.coverImage.url}
              alt={page.coverImage.alt || ""}
              className="mb-5 max-h-56 w-full rounded-md border object-cover"
            />
          )}

          <FieldLabel
            label={page.label}
            pageNumber={pageIndex + 1}
            editable
            onUpdate={(label) => onUpdate(pageIndex, { label })}
          />

          <FieldHelperText
            helperText={page.helperText}
            editable
            onUpdate={(helperText) => onUpdate(pageIndex, { helperText })}
          />

          <div className="mt-5">
            {/* Field-specific editor */}
            {FieldEditor && (
              <FieldEditor
                page={page}
                pageIndex={pageIndex}
                onUpdate={onUpdate}
              />
            )}
          </div>

          <FieldSubmitButton
            text={
              page.appearance.submitButtonText ||
              (isStatement ? "Continue" : "Submit")
            }
            color={page.appearance.submitButtonColor}
          />
        </div>
      </div>
    </div>
  );
}