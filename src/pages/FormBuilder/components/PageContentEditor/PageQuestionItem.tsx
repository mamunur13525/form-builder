import { Copy, GripVertical, Trash2 } from "lucide-react";
import type { FormPage, FormQuestion } from "@/shared/types/common";
import type { VariableItem } from "@/shared/components/pages";
import { VariableEditable } from "@/shared/components/pages";
import { getFontSizeClasses, getQuestionTitleClasses, resolveFormTheme } from "@/shared/utils/theme";
import { cn } from "@/lib/utils";

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

interface PageQuestionItemProps {
  question: FormQuestion;
  questionIndex: number;
  page: FormPage;
  pageIndex: number;
  isMobileView: boolean;
  theme: ReturnType<typeof resolveFormTheme>;
  fontSizes: ReturnType<typeof getFontSizeClasses>;
  variables: VariableItem[];
  hasMultipleQuestions: boolean;
  hasSelectedQuestion: boolean;
  isThisQuestionSelected: boolean;
  selectedQuestionId?: string | null;
  onSelectQuestion?: (questionId: string | null) => void;
  onUpdateQuestion: (index: number, updates: Partial<FormQuestion>) => void;
  onDeleteQuestion: (index: number) => void;
  onDuplicateQuestion: (index: number) => void;
  movableProps: React.HTMLAttributes<HTMLDivElement> & {
    style?: React.CSSProperties;
  };
  isDragged: boolean;
}

/** One question card inside the page editor. */
export function PageQuestionItem({
  question,
  questionIndex,
  page,
  pageIndex,
  isMobileView,
  theme,
  fontSizes,
  variables,
  hasMultipleQuestions,
  hasSelectedQuestion,
  isThisQuestionSelected,
  selectedQuestionId,
  onSelectQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  onDuplicateQuestion,
  movableProps,
  isDragged,
}: PageQuestionItemProps) {
  const { style: movableStyle, ...itemProps } = movableProps;
  const QuestionEditor = editorMap[question.type];
  const questionTitle = question.title !== undefined ? question.title : (question.label || "");

  const questionAsPage: FormPage = {
    ...page,
    _id: question._id || question.id,
    pageKey: question.questionKey || question.blockKey || page.pageKey,
    type: question.type,
    title: question.title,
    description: "",
    label: question.label || question.title || "",
    helperText: "",
    placeholder: question.placeholder || "",
    options: question.options || [],
    settings: question.settings,
    validation: question.validation,
    appearance: question.appearance || page.appearance,
    coverImage: question.coverImage,
    required: question.required ?? false,
  };

  const combinedStyle: React.CSSProperties = {
    ...movableStyle,
    zIndex: isDragged ? 9999 : undefined,
  };

  const questionId = question.questionKey || question.blockKey;

  const questionTitleSize = getQuestionTitleClasses(theme.fontSize);

  const isStatementWithoutEmbed =
    question.type === "statement" &&
    !hasMultipleQuestions &&
    !question.settings?.statement?.embedUrl &&
    !page.settings?.statement?.embedUrl;

  if (isStatementWithoutEmbed) {
    return (
      <div
        id={`question-${questionId}`}
        data-block-id={`block-${questionId}`}
        data-question-item="true"
        {...itemProps}
        style={combinedStyle}
        className="h-0 w-full overflow-hidden"
      />
    );
  }

  return (
    <div
      id={`question-${questionId}`}
      data-block-id={`block-${questionId}`}
      data-question-item="true"
      {...itemProps}
      style={combinedStyle}
      onClick={() => {
        if (selectedQuestionId !== questionId) {
          onSelectQuestion?.(questionId || null);
        }
      }}
      onFocusCapture={() => {
        if (selectedQuestionId !== questionId) {
          onSelectQuestion?.(questionId || null);
        }
      }}
      className={cn(
        "group/question relative w-full rounded-xl pr-2",
        isDragged
          ? "opacity-75 bg-slate-50/80 dark:bg-zinc-800/80 shadow-lg ring-1 ring-[#FF5722]/30"
          : !hasSelectedQuestion
            ? "opacity-100"
            : isThisQuestionSelected
              ? "opacity-100 ring-2 ring-[#FF5722]/25 rounded-xl bg-white/5 dark:bg-zinc-900/5 shadow-xs"
              : "opacity-35 hover:opacity-75 cursor-pointer"
      )}
    >
      {/* Question Main Content: clean design, no card border, no type icon */}
      <div className="relative w-full py-2">
        {hasMultipleQuestions ? (
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

            {/* Question Title (only when page has multiple questions) */}
            <div className="flex-1 min-w-0">
              <VariableEditable
                value={questionTitle}
                onCommit={(title) => onUpdateQuestion(questionIndex, { title })}
                variables={variables}
                ariaLabel="Question"
                placeholder="Question title..."
                className={cn(
                  questionTitleSize,
                  "font-normal outline-none border-0 border-transparent pb-1 transition-colors cursor-text w-full"
                )}
                style={theme.questionColor ? { color: theme.questionColor } : undefined}
              />
            </div>

            {/* Question Actions: Duplicate & Delete (revealed on question hover) */}
            <div className="flex items-center gap-0.5 opacity-0 group-hover/question:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicateQuestion(questionIndex);
                }}
                title="Duplicate question"
                className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteQuestion(questionIndex);
                }}
                title="Delete question"
                className="p-1 rounded text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ) : (
          /* Single question: allow duplicate on hover */
          <div className="absolute top-2 right-2 flex items-center gap-0.5 opacity-0 group-hover/question:opacity-100 transition-opacity z-10">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDuplicateQuestion(questionIndex);
              }}
              title="Duplicate question"
              className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Question Editor Input */}
        <div className={cn("w-full pl-[34px]", hasMultipleQuestions ? "mt-4" : "mt-1")} style={{ color: theme.answerColor }}>
          {QuestionEditor ? (
            <QuestionEditor
              page={questionAsPage}
              pageIndex={pageIndex}
              onUpdate={(_, updates) => onUpdateQuestion(questionIndex, updates as Partial<FormQuestion>)}
              isMobileView={isMobileView}
              color={theme.answerColor}
              fontSizeClass={fontSizes.input}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
