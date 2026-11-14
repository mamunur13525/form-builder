import { useEffect, useMemo, memo } from "react";
import type { FormPage, IFormTheme } from "@/shared/types/common";
import { PageSubmitButton, type VariableItem } from "@/shared/components/pages";
import { CoverImageBlock, CoverImageSide } from "@/shared/components/CoverImageBlock";
import { resolveFormTheme, getFontSizeClasses, loadThemeFont } from "@/shared/utils/theme";
import { List } from "react-movable";
import { cn } from "@/lib/utils";

import { AddQuestionButton } from "./AddQuestionButton";
import { PageHeaderEditor } from "./PageHeaderEditor";
import { PageQuestionItem } from "./PageQuestionItem";
import { usePageQuestions } from "./usePageQuestions";

import { useDeselectQuestionOnOutside } from "./useDeselectQuestionOnOutside";

interface PageContentEditorProps {
  page: FormPage;
  pageIndex: number;
  onUpdate: (index: number, updates: Partial<FormPage>) => void;
  isMobileView: boolean;
  theme?: IFormTheme | null;
  variables?: VariableItem[];
  withBackground?: boolean;
  selectedQuestionId?: string | null;
  onSelectQuestion?: (questionId: string | null) => void;
}

function PageContentEditorComponent({
  page,
  pageIndex,
  onUpdate,
  isMobileView,
  theme,
  variables = [],
  withBackground = true,
  selectedQuestionId,
  onSelectQuestion,
}: PageContentEditorProps) {
  const themeResolved = useMemo(() => resolveFormTheme(theme), [theme]);

  const fontKey = useMemo(() => {
    if (!themeResolved.font?.family) return "";
    return `${themeResolved.font.family}:${themeResolved.font.source}:${themeResolved.font.url ?? ""}`;
  }, [themeResolved.font]);

  useEffect(() => {
    if (themeResolved.font) {
      loadThemeFont(themeResolved.font);
    }
  }, [fontKey, themeResolved.font]);

  useDeselectQuestionOnOutside(selectedQuestionId, onSelectQuestion);

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

  const {
    questions,
    updateQuestion,
    insertQuestion,
    deleteQuestion,
    moveQuestion,
    duplicateQuestion,
  } = usePageQuestions(page, pageIndex, onUpdate);

  const hasSelectedQuestion = Boolean(
    selectedQuestionId &&
      questions.some((q) => (q.questionKey || q.blockKey) === selectedQuestionId)
  );

  const hasMultipleQuestions = questions.length > 1;

  const handlePageTitleChange = (nextTitle: string) => {
    onUpdate(pageIndex, {
      title: nextTitle,
      label: nextTitle,
    });
  };

  const handlePageDescriptionChange = (nextDesc: string) => {
    onUpdate(pageIndex, {
      description: nextDesc,
      helperText: nextDesc,
    });
  };

  const pageTitle = page.title !== undefined ? page.title : (page.label || (!hasMultipleQuestions ? questions[0]?.title : "") || "");
  const pageDescription = page.description !== undefined ? page.description : (page.helperText || "");

  const isStatement = page.type === "statement" || questions[0]?.type === "statement";
  const hasEmbed = Boolean(page.settings?.statement?.embedUrl || questions[0]?.settings?.statement?.embedUrl);
  const isStatementWithoutEmbed = isStatement && !hasMultipleQuestions && !hasEmbed;

  const content = (
    <div className={cn("group/pagecontent w-full", isStatementWithoutEmbed ? "space-y-4" : "space-y-6")}>
      {/* 1. Page Title and Description with page number on top-left aligned with question handles */}
      <PageHeaderEditor
        pageIndex={pageIndex}
        title={pageTitle}
        description={pageDescription}
        variables={variables}
        fontSizes={fontSizes}
        questionColor={themeResolved.questionColor}
        textColor={themeResolved.textColor}
        onTitleChange={handlePageTitleChange}
        onDescriptionChange={handlePageDescriptionChange}
      />

      {/* 2. Questions Section */}
      <div className="relative w-full">
        {/* Top-most Add Question button (above first question) - hidden until hovered */}
        {!isStatement && (
          <div className="absolute -top-3 inset-x-0 z-20 -my-2 h-4 flex items-center opacity-0 transition-opacity group-hover/pagecontent:opacity-100 focus-within:opacity-100 hover:opacity-100">
            <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-slate-200/90 dark:bg-zinc-800" />
            <AddQuestionButton
              onAddQuestion={(type) => insertQuestion(0, type)}
              className="!absolute !w-auto left-[-42px] top-1/2 -translate-y-1/2"
            />
          </div>
        )}

        {/* Questions List via react-movable for 6-dot drag-and-drop reordering */}
        <List
          values={questions}
          onChange={({ oldIndex, newIndex }) => moveQuestion(oldIndex, newIndex)}
          transitionDuration={150}
          lockVertically
          renderList={({ children, props }) => (
            <div {...props} className={cn("w-full", isStatementWithoutEmbed ? "" : "space-y-8")}>
              {children}
            </div>
          )}
          renderItem={({ value: question, index: qIdx = 0, props, isDragged }) => {
            const { key, ...itemProps } = props;
            const questionId = question.questionKey || question.blockKey;
            const isThisQuestionSelected = !hasSelectedQuestion || questionId === selectedQuestionId;

            return (
              <div
                key={key}
                className={cn(
                  "group/question relative w-full",
                  isStatementWithoutEmbed && "h-4 -my-1 flex items-center justify-center"
                )}
              >
                <PageQuestionItem
                  question={question}
                  questionIndex={qIdx}
                  page={page}
                  pageIndex={pageIndex}
                  isMobileView={isMobileView}
                  theme={themeResolved}
                  fontSizes={fontSizes}
                  variables={variables}
                  hasMultipleQuestions={hasMultipleQuestions}
                  hasSelectedQuestion={hasSelectedQuestion}
                  isThisQuestionSelected={isThisQuestionSelected}
                  selectedQuestionId={selectedQuestionId}
                  onSelectQuestion={onSelectQuestion}
                  onUpdateQuestion={updateQuestion}
                  onDeleteQuestion={deleteQuestion}
                  onDuplicateQuestion={duplicateQuestion}
                  movableProps={itemProps}
                  isDragged={isDragged}
                />
                {/* Full-width hover line + add button in the page margin */}
                <div className="pointer-events-none absolute inset-x-0 -bottom-4 h-px bg-slate-200/90 opacity-0 transition-opacity group-hover/question:opacity-100 dark:bg-zinc-800" />
                <AddQuestionButton
                  onAddQuestion={(type) => insertQuestion(qIdx + 1, type)}
                  className={cn(
                    "!absolute !w-auto left-[-42px] -bottom-4 -translate-y-1/2 z-20 opacity-0 group-hover/question:opacity-100 hover:!opacity-100 focus-within:opacity-100 transition-opacity",
                    isDragged ? "invisible" : ""
                  )}
                />
              </div>
            );
          }}
        />
      </div>

      {/* Page Submit Button */}
      <div className={cn(isStatementWithoutEmbed ? "pt-0" : "pt-2")}>
        <PageSubmitButton
          text={
            page.appearance?.submitButtonText ||
            (isStatement ? "Continue" : "Submit")
          }
          color={themeResolved.buttonColor || page.appearance?.submitButtonColor}
          textColor={themeResolved.buttonTextColor}
          roundCorners={themeResolved.roundCorners}
          fontSizeClass={fontSizes.button}
        />
      </div>
    </div>
  );

  return (
    <div
      className="light relative flex h-full w-full flex-col items-center justify-center overflow-hidden"
      style={containerStyle}
      onClick={(e) => {
        const target = e.target as HTMLElement | null;
        if (
          selectedQuestionId &&
          target &&
          !target.closest("[data-question-item='true']") &&
          !target.closest(".group\\/question") &&
          !target.closest("[data-add-question='true']")
        ) {
          onSelectQuestion?.(null);
        }
      }}
    >
      {/* Background Image Layer */}
      {withBackground && themeResolved.backgroundImage?.url && (
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={bgImageStyle}
        />
      )}

      {isSideCover ? (
        <div className="relative z-10 flex h-full w-full flex-col sm:flex-row">
          <CoverImageSide coverImage={page.coverImage} side={coverLayout} />
          <div className="flex min-h-0 w-full flex-1 flex-col overflow-y-auto sm:h-full sm:w-1/2">
            <div
              className={cn(
                "mx-auto my-auto flex w-full max-w-[800px] flex-col px-5 py-8 sm:px-8 sm:py-12",
                alignClass
              )}
            >
              {content}
            </div>
          </div>
        </div>
      ) : (
        <div className="relative z-10 w-full min-h-0 overflow-y-auto px-10">
          <div
            className={cn(
              "flex w-full flex-col pl-5 pr-2 py-8 sm:px-6 sm:py-12",
              alignClass
            )}
          >
            <CoverImageBlock
              coverImage={page.coverImage}
              imageClassName="rounded-lg border border-[var(--editorial-border-light)]"
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

export const PageContentEditor = memo(PageContentEditorComponent);
