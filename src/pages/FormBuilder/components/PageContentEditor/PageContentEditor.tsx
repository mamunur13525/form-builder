import type { FormPage, IFormTheme } from "@/shared/types/common";
import { PageLabel, PageHelperText, PageSubmitButton, type VariableItem } from "@/shared/components/pages";
import { CoverImageBlock, CoverImageSide } from "@/shared/components/CoverImageBlock";
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
  page: FormPage;
  pageIndex: number;
  onUpdate: (index: number, updates: Partial<FormPage>) => void;
  isMobileView: boolean;
  theme?: IFormTheme | null;
  variables?: VariableItem[];
  /**
   * When false the canvas background (colour + image) is owned by an outer
   * container, e.g. the form builder's window canvas, so the editor stays
   * transparent and lets it show through.
   */
  withBackground?: boolean;
}

const editorMap: Record<
  string,
  React.ComponentType<{
    page: FormPage;
    pageIndex: number;
    onUpdate: (index: number, updates: Partial<FormPage>) => void;
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
  variables = [],
  withBackground = true,
}: PageContentEditorProps) {
  const PageEditor = editorMap[page.type];
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
    ...(withBackground ? { backgroundColor: themeResolved.backgroundColor } : {}),
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
  
  const coverLayout = page.coverImage?.layout ?? "top";
  const isSideCover =
    Boolean(page.coverImage?.url) &&
    (coverLayout === "left" || coverLayout === "right");

  const content = (
    <>
      <PageLabel
        label={page.label}
        pageNumber={pageIndex + 1}
        editable
        onUpdate={(label) => onUpdate(pageIndex, { label })}
        color={themeResolved.questionColor}
        fontSizeClass={fontSizes.question}
        variables={variables}
      />

      <PageHelperText
        helperText={page.helperText}
        editable
        onUpdate={(helperText) => onUpdate(pageIndex, { helperText })}
        color={themeResolved.textColor}
        fontSizeClass={fontSizes.helper}
        variables={variables}
      />

      <div className="mt-8 w-full" style={{ color: themeResolved.answerColor }}>
        {/* Page-specific editor */}
        {PageEditor && (
          <PageEditor
            page={page}
            pageIndex={pageIndex}
            onUpdate={onUpdate}
            isMobileView={isMobileView}
            color={themeResolved.answerColor}
            fontSizeClass={fontSizes.input}
          />
        )}
      </div>

      <PageSubmitButton
        text={
          page.appearance.submitButtonText ||
          (isStatement ? "Continue" : "Submit")
        }
        color={themeResolved.buttonColor || page.appearance.submitButtonColor}
        textColor={themeResolved.buttonTextColor}
        roundCorners={themeResolved.roundCorners}
        fontSizeClass={fontSizes.button}
      />
    </>
  );

  return (
    <div
      className="light relative flex h-full w-full flex-col items-center justify-center overflow-hidden"
      style={containerStyle}
    >
      {/* Background Image Layer */}
      {withBackground && themeResolved.backgroundImage?.url && (
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={bgImageStyle}
        />
      )}

      {isSideCover ? (
        /* Left/right: the page is split in half — image on one side, all
           content (including the submit button) on the other. */
        <div className="relative z-10 flex h-full w-full flex-col sm:flex-row">
          <CoverImageSide coverImage={page.coverImage} side={coverLayout} />
          <div className="flex min-h-0 w-full flex-1 flex-col overflow-y-auto sm:h-full sm:w-1/2">
            <div
              className={cn(
                "mx-auto my-auto flex w-full max-w-[800px] flex-col px-5 py-8 sm:px-8 sm:py-12",
                alignClass,
              )}
            >
              {content}
            </div>
          </div>
        </div>
      ) : (
        <div className={cn("relative z-10 w-full min-h-0 overflow-y-auto max-w-[800px]")}>
          <div
            className={cn(
              "mx-auto flex flex-col transition-all duration-500 ease-out pl-5 pr-2 py-8 sm:px-6 sm:py-12",
              alignClass,
              isMobileView ? "w-full" : "w-full sm:w-11/12",
            )}
          >
            <CoverImageBlock
              coverImage={page.coverImage}
              imageClassName="rounded-[22px] border border-[var(--editorial-border-light)]"
              contentClassName={alignClass}
            >
              {content}
            </CoverImageBlock>
          </div>
        </div>
      )}
    </div>
  );
}

