import type { FormField, IFormTheme } from "@/shared/types/common";
import { FieldLabel, FieldHelperText, FieldSubmitButton } from "@/shared/components/fields";
import { resolveFormTheme, getFontSizeClasses, loadThemeFont } from "@/shared/utils/theme";
import { useEffect } from "react";

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
  theme?: IFormTheme | null;
}

const editorMap: Record<
  string,
  React.ComponentType<{
    page: FormField;
    pageIndex: number;
    onUpdate: (index: number, updates: Partial<FormField>) => void;
    isMobileView?: boolean;
    color?: string;
    fontSizeClass?: string;
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
  theme,
}: PageContentEditorProps) {
  const FieldEditor = editorMap[page.type];
  const isStatement = page.type === "statement";
  const themeResolved = resolveFormTheme(theme);

  useEffect(() => {
    if (themeResolved.font) {
      loadThemeFont(themeResolved.font);
    }
  }, [themeResolved.font]);

  const fontSizes = getFontSizeClasses(themeResolved.fontSize);
  const alignClass =
    themeResolved.alignment === "center"
      ? "text-center items-center"
      : themeResolved.alignment === "right"
        ? "text-right items-end"
        : "text-left items-start";

  const containerStyle: React.CSSProperties = {
    backgroundColor: themeResolved.backgroundColor,
    color: themeResolved.textColor,
    fontFamily: themeResolved.font?.family ? `"${themeResolved.font.family}", sans-serif` : undefined,
  };

  const bgImageStyle: React.CSSProperties = themeResolved.backgroundImage?.url
    ? {
      backgroundImage: `url(${themeResolved.backgroundImage.url})`,
      backgroundRepeat: themeResolved.backgroundImage.tile ? "repeat" : "no-repeat",
      backgroundSize: themeResolved.backgroundImage.tile ? "auto" : "cover",
      backgroundPosition: "center",
      filter:
        themeResolved.backgroundImage.brightness !== undefined
          ? `brightness(${(100 + themeResolved.backgroundImage.brightness) / 100})`
          : undefined,
    }
    : {};
  
  return (
    <div
      className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden"
      style={containerStyle}
    >
      {/* Background Image Layer */}
      {themeResolved.backgroundImage?.url && (
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={bgImageStyle}
        />
      )}

      {/* Editor Content */}
      <div className={cn("relative z-10 w-full min-h-0 overflow-y-auto max-w-[800px]")}>
        <div
          className={cn(
            "mx-auto flex flex-col transition-all duration-500 ease-out pl-5 pr-2 py-8 sm:px-6 sm:py-12",
            alignClass,
            isMobileView ? "w-full" : "w-full sm:w-11/12",
          )}
        >
          {page.coverImage?.url && (
            <img
              src={page.coverImage.url}
              alt={page.coverImage.alt || ""}
              className="mb-8 max-h-56 w-full rounded-[22px] border border-[var(--editorial-border-light)] object-cover"
            />
          )}

          <FieldLabel
            label={page.label}
            pageNumber={pageIndex + 1}
            editable
            onUpdate={(label) => onUpdate(pageIndex, { label })}
            color={themeResolved.questionColor}
            fontSizeClass={fontSizes.question}
          />

          <FieldHelperText
            helperText={page.helperText}
            editable
            onUpdate={(helperText) => onUpdate(pageIndex, { helperText })}
            color={themeResolved.textColor}
            fontSizeClass={fontSizes.helper}
          />

          <div className="mt-8 w-full" style={{ color: themeResolved.answerColor }}>
            {/* Field-specific editor */}
            {FieldEditor && (
              <FieldEditor
                page={page}
                pageIndex={pageIndex}
                onUpdate={onUpdate}
                isMobileView={isMobileView}
                color={themeResolved.answerColor}
                fontSizeClass={fontSizes.input}
              />
            )}
          </div>

          <FieldSubmitButton
            text={
              page.appearance.submitButtonText ||
              (isStatement ? "Continue" : "Submit")
            }
            color={themeResolved.buttonColor || page.appearance.submitButtonColor}
            textColor={themeResolved.buttonTextColor}
            roundCorners={themeResolved.roundCorners}
            fontSizeClass={fontSizes.button}
          />
        </div>
      </div>
    </div>
  );
}

