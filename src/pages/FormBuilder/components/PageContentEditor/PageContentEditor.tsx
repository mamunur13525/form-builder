import { useEffect, useState } from "react";
import type { FormPage, FormQuestion, IFormTheme, PageType } from "@/shared/types/common";
import { PageLabel, PageHelperText, PageSubmitButton, type VariableItem, VariableEditable } from "@/shared/components/pages";
import { CoverImageBlock, CoverImageSide } from "@/shared/components/CoverImageBlock";
import { resolveFormTheme, getFontSizeClasses, loadThemeFont } from "@/shared/utils/theme";
import { Plus, Trash2, Copy, GripVertical } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PAGE_TYPE_LABELS, PAGE_TYPES, PAGE_TYPE_VISUALS } from "@/shared/constants/form-types";
import { defaultOptionsForType, defaultSettingsForType } from "@/features/forms/model/page-defaults";
import { List } from "react-movable";

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

interface AddQuestionButtonProps {
  onAddQuestion: (type: PageType) => void;
  className?: string;
}

function AddQuestionButton({ onAddQuestion, className }: AddQuestionButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={cn(
        "relative flex items-center justify-center py-1.5 w-full group/add z-20",
        className
      )}
    >
      {/* Subtle guide line on hover */}
      <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-px bg-transparent group-hover/add:bg-slate-200/90 dark:group-hover/add:zinc-800/90 transition-colors pointer-events-none" />

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          type="button"
          aria-label="Add question"
          className="relative inline-flex items-center justify-center h-6 rounded-full border border-slate-300/80 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 text-slate-500 dark:text-zinc-400 shadow-2xs hover:border-[#FF5722] hover:text-[#FF5722] hover:shadow-xs transition-all duration-200 cursor-pointer overflow-hidden group/btn"
        >
          <Plus className="h-3.5 w-3.5 text-[#FF5722] shrink-0" />
          <span className="text-[11px] font-medium max-w-0 opacity-0 group-hover/btn:max-w-[85px] group-hover/btn:opacity-100 whitespace-nowrap overflow-hidden transition-all duration-200 ease-in-out pl-0 group-hover/btn:pl-1">
            Add question
          </span>
        </PopoverTrigger>
        <PopoverContent
          className="w-72 max-h-96 overflow-y-auto p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xl rounded-xl z-50"
          align="center"
          sideOffset={6}
        >
          <div className="px-2 py-1.5 text-xs font-semibold text-slate-500 dark:text-zinc-400">
            Select question type
          </div>
          <div className="grid grid-cols-1 gap-1">
            {PAGE_TYPES.map((type) => {
              const visual = PAGE_TYPE_VISUALS[type];
              const TypeIcon = visual?.icon;
              const label = visual?.displayName ?? PAGE_TYPE_LABELS[type] ?? type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    onAddQuestion(type);
                  }}
                  className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left text-sm hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer w-full"
                >
                  <div
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded text-white shadow-2xs",
                      visual?.bgColor ?? "bg-slate-500"
                    )}
                  >
                    {TypeIcon ? <TypeIcon className="h-3.5 w-3.5 stroke-[2]" /> : null}
                  </div>
                  <span className="font-medium text-slate-800 dark:text-zinc-200 text-xs">
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function PageContentEditor({
  page,
  pageIndex,
  onUpdate,
  isMobileView,
  theme,
  variables = [],
  withBackground = true,
}: PageContentEditorProps) {
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

  // Derive questions from page or synthesize fallback question from page fields
  const questions: FormQuestion[] =
    (page.questions && page.questions.length > 0)
      ? page.questions
      : (page.blocks && page.blocks.length > 0)
        ? page.blocks
        : [
            {
              _id: page._id,
              id: page._id,
              questionKey: page.pageKey,
              blockKey: page.pageKey,
              type: page.type || "shortText",
              title: page.title !== undefined ? page.title : (page.label || ""),
              description: page.description !== undefined ? page.description : (page.helperText || ""),
              label: page.label || page.title || "",
              helperText: page.helperText || page.description || "",
              placeholder: page.placeholder || "",
              required: page.required ?? false,
              order: 1,
              options: page.options || [],
              validation: page.validation,
              settings: page.settings,
              appearance: page.appearance || { width: "full", icon: "" },
              coverImage: page.coverImage,
              isActive: page.isActive ?? true,
            },
          ];

  const updateQuestion = (questionIndex: number, updates: Partial<FormQuestion>) => {
    const updatedQuestions = [...questions];
    const target = updatedQuestions[questionIndex];
    if (!target) return;

    const nextTitle =
      updates.title !== undefined
        ? updates.title
        : updates.label !== undefined
          ? updates.label
          : target.title;
    const nextDesc =
      updates.description !== undefined
        ? updates.description
        : updates.helperText !== undefined
          ? updates.helperText
          : target.description;

    updatedQuestions[questionIndex] = {
      ...target,
      ...updates,
      title: nextTitle,
      label: nextTitle,
      description: nextDesc,
      helperText: nextDesc,
    };

    const pageUpdates: Partial<FormPage> = {
      questions: updatedQuestions,
      blocks: updatedQuestions,
    };

    // If updating question 0, sync page-level properties as fallback
    if (questionIndex === 0) {
      if (updates.type) pageUpdates.type = updates.type;
      if (updates.placeholder !== undefined) pageUpdates.placeholder = updates.placeholder;
      if (updates.options !== undefined) pageUpdates.options = updates.options;
      if (updates.settings !== undefined) pageUpdates.settings = updates.settings;
      if (updates.required !== undefined) pageUpdates.required = updates.required;
      if (nextTitle !== undefined) {
        pageUpdates.label = nextTitle;
        pageUpdates.title = nextTitle;
      }
      if (nextDesc !== undefined) {
        pageUpdates.helperText = nextDesc;
        pageUpdates.description = nextDesc;
      }
    }

    onUpdate(pageIndex, pageUpdates);
  };

  const handleInsertQuestion = (targetIndex: number, type: PageType) => {
    const key = `question_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newQuestion: FormQuestion = {
      questionKey: key,
      blockKey: key,
      type,
      title: "",
      description: "",
      label: "",
      helperText: "",
      placeholder: "",
      required: false,
      order: targetIndex + 1,
      options: defaultOptionsForType(type),
      settings: defaultSettingsForType(type),
      appearance: { width: "full", icon: "" },
      isActive: true,
    };

    const updated = [...questions];
    updated.splice(targetIndex, 0, newQuestion);
    const reordered = updated.map((b, idx) => ({ ...b, order: idx + 1 }));

    onUpdate(pageIndex, {
      questions: reordered,
      blocks: reordered,
      type: reordered[0]?.type ?? page.type,
      label: reordered[0]?.label ?? page.label,
    });
  };

  const handleDeleteQuestion = (questionIndex: number) => {
    if (questions.length <= 1) return;
    const updated = questions
      .filter((_, i) => i !== questionIndex)
      .map((b, idx) => ({ ...b, order: idx + 1 }));
    onUpdate(pageIndex, {
      questions: updated,
      blocks: updated,
      type: updated[0]?.type ?? page.type,
      label: updated[0]?.label ?? page.label,
    });
  };

  const handleMoveQuestionIndex = (oldIndex: number, newIndex: number) => {
    if (oldIndex === newIndex) return;
    const updated = [...questions];
    const [moved] = updated.splice(oldIndex, 1);
    updated.splice(newIndex, 0, moved);
    const reordered = updated.map((b, idx) => ({ ...b, order: idx + 1 }));
    onUpdate(pageIndex, {
      questions: reordered,
      blocks: reordered,
      type: reordered[0]?.type ?? page.type,
      label: reordered[0]?.label ?? page.label,
    });
  };

  const handleDuplicateQuestion = (questionIndex: number) => {
    const target = questions[questionIndex];
    if (!target) return;
    const key = `question_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const duplicated: FormQuestion = {
      ...target,
      _id: undefined,
      id: undefined,
      questionKey: key,
      blockKey: key,
      title: target.title ? `${target.title} (copy)` : "",
      label: target.title ? `${target.title} (copy)` : "",
      order: questionIndex + 2,
    };
    const updated = [...questions];
    updated.splice(questionIndex + 1, 0, duplicated);
    const reordered = updated.map((b, idx) => ({ ...b, order: idx + 1 }));
    onUpdate(pageIndex, {
      questions: reordered,
      blocks: reordered,
    });
  };

  const handlePageTitleChange = (nextTitle: string) => {
    onUpdate(pageIndex, {
      title: nextTitle,
    });
  };

  const handlePageDescriptionChange = (nextDesc: string) => {
    onUpdate(pageIndex, {
      description: nextDesc,
    });
  };

  const pageTitle = page.title ?? "";
  const pageDescription = page.description ?? "";

  const isStatement = page.type === "statement";

  const content = (
    <div className="w-full space-y-6">
      {/* 1. Page Title and Description with page number on top-left as before */}
      <div className="w-full relative space-y-1 mb-2">
        <PageLabel
          label={pageTitle}
          pageNumber={pageIndex + 1}
          editable
          onUpdate={handlePageTitleChange}
          color={themeResolved.questionColor}
          fontSizeClass={fontSizes.question}
          variables={variables}
        />
        <PageHelperText
          helperText={pageDescription}
          editable
          onUpdate={handlePageDescriptionChange}
          color={themeResolved.textColor}
          fontSizeClass={fontSizes.helper}
          variables={variables}
        />
      </div>

      {/* 2. Top-most Add Question button (above first question) - hidden until hovered */}
      <div className="group/topbtn relative w-full -mb-3 z-20">
        <AddQuestionButton
          onAddQuestion={(type) => handleInsertQuestion(0, type)}
          className="opacity-0 group-hover/topbtn:opacity-100 hover:!opacity-100 transition-opacity"
        />
      </div>

      {/* Questions List via react-movable for 6-dot drag-and-drop reordering */}
      <List
        values={questions}
        onChange={({ oldIndex, newIndex }) => handleMoveQuestionIndex(oldIndex, newIndex)}
        transitionDuration={150}
        lockVertically
        renderList={({ children, props }) => (
          <div {...props} className="w-full space-y-2">
            {children}
          </div>
        )}
        renderItem={({ value: question, index: qIdx = 0, props, isDragged }) => {
          const { key, ...itemProps } = props;
          const QuestionEditor = editorMap[question.type];
          const questionTitle = question.title !== undefined ? question.title : (question.label || "");
          const questionDesc = question.description !== undefined ? question.description : (question.helperText || "");

          const questionAsPage: FormPage = {
            ...page,
            _id: question._id || question.id,
            pageKey: question.questionKey || question.blockKey || page.pageKey,
            type: question.type,
            title: question.title,
            description: question.description,
            label: question.label || question.title || "",
            helperText: question.helperText || question.description || "",
            placeholder: question.placeholder || "",
            options: question.options || [],
            settings: question.settings,
            validation: question.validation,
            appearance: question.appearance || page.appearance,
            coverImage: question.coverImage,
            required: question.required ?? false,
          };

          const combinedStyle: React.CSSProperties = {
            ...itemProps.style,
            zIndex: isDragged ? 9999 : undefined,
          };

          const questionId = question.questionKey || question.blockKey;

          return (
            <div
              key={key}
              id={`question-${questionId}`}
              data-block-id={`block-${questionId}`}
              {...itemProps}
              style={combinedStyle}
              className={cn(
                "group/question relative w-full rounded-xl transition-all",
                isDragged
                  ? "opacity-75 bg-slate-50/80 dark:bg-zinc-800/80 shadow-lg ring-1 ring-[#FF5722]/30"
                  : ""
              )}
            >
              {/* Question Main Content: clean design, no card border, no type icon */}
              <div className="relative w-full py-2">
                <div className="flex items-start gap-2.5">
                  {/* 6-dot drag handle for reordering */}
                  <span
                    data-movable-handle
                    aria-hidden="true"
                    tabIndex={-1}
                    title="Drag to reorder question"
                    className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded text-slate-300 dark:text-zinc-600 hover:text-slate-600 dark:hover:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 touch-none select-none cursor-grab active:cursor-grabbing transition-colors"
                  >
                    <GripVertical className="h-4 w-4" />
                  </span>

                  {/* Question Title & Description */}
                  <div className="flex-1 min-w-0">
                    <VariableEditable
                      value={questionTitle}
                      onCommit={(title) => updateQuestion(qIdx, { title })}
                      variables={variables}
                      ariaLabel="Question"
                      placeholder="Type your question... Use @ to recall information."
                      className={cn(
                        fontSizes.question || "text-[26px]",
                        "font-semibold outline-none border-0 border-transparent pb-1 transition-colors cursor-text w-full"
                      )}
                      style={themeResolved.questionColor ? { color: themeResolved.questionColor } : undefined}
                    />

                    <div className="mt-1 w-full">
                      <VariableEditable
                        value={questionDesc}
                        onCommit={(description) => updateQuestion(qIdx, { description })}
                        variables={variables}
                        ariaLabel="Description"
                        placeholder="Description (optional)"
                        className={cn(
                          fontSizes.helper || "text-[18px]",
                          "text-muted-foreground outline-none border-0 border-transparent pb-1 transition-colors cursor-text w-full"
                        )}
                        style={themeResolved.textColor ? { color: themeResolved.textColor } : undefined}
                      />
                    </div>
                  </div>

                  {/* Question Actions: Duplicate & Delete (revealed on question hover) */}
                  <div className="flex items-center gap-0.5 opacity-0 group-hover/question:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => handleDuplicateQuestion(qIdx)}
                      title="Duplicate question"
                      className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteQuestion(qIdx)}
                        title="Delete question"
                        className="p-1 rounded text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Question Editor Input */}
                <div className="mt-6 w-full pl-8" style={{ color: themeResolved.answerColor }}>
                  {QuestionEditor ? (
                    <QuestionEditor
                      page={questionAsPage}
                      pageIndex={pageIndex}
                      onUpdate={(_, updates) => updateQuestion(qIdx, updates as any)}
                      isMobileView={isMobileView}
                      color={themeResolved.answerColor}
                      fontSizeClass={fontSizes.input}
                    />
                  ) : null}
                </div>
              </div>

              {/* Add Question Button between questions and at the bottom:
                  Only 1 button below each question (total N for N questions, plus 1 top = N+1).
                  Opacity is hidden by default; revealed on hovering the question or the plus itself. */}
              <AddQuestionButton
                onAddQuestion={(type) => handleInsertQuestion(qIdx + 1, type)}
                className={cn(
                  "opacity-0 group-hover/question:opacity-100 hover:!opacity-100 transition-opacity",
                  isDragged ? "invisible" : ""
                )}
              />
            </div>
          );
        }}
      />

      {/* Page Submit Button */}
      <div className="pt-4">
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
        <div className="relative z-10 w-full min-h-0 overflow-y-auto max-w-[800px]">
          <div
            className={cn(
              "mx-auto flex flex-col transition-all duration-500 ease-out pl-5 pr-2 py-8 sm:px-6 sm:py-12",
              alignClass,
              isMobileView ? "w-full" : "w-full sm:w-11/12"
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
