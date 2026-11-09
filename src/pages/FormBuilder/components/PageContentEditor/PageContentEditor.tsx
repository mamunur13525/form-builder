import { useEffect, useState, useRef, useMemo } from "react";
import type { FormPage, FormQuestion, IFormTheme, PageType } from "@/shared/types/common";
import { PageSubmitButton, type VariableItem, VariableEditable } from "@/shared/components/pages";
import { CoverImageBlock, CoverImageSide } from "@/shared/components/CoverImageBlock";
import { resolveFormTheme, getFontSizeClasses, loadThemeFont } from "@/shared/utils/theme";
import { Plus, Trash2, Copy, GripVertical, Search, X } from "lucide-react";
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
  selectedQuestionId?: string | null;
  onSelectQuestion?: (questionId: string | null) => void;
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
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setSearchQuery("");
    }
  }, [open]);

  const filteredTypes = PAGE_TYPES.filter((type) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const visual = PAGE_TYPE_VISUALS[type];
    const label = (PAGE_TYPE_LABELS[type] ?? type).toLowerCase();
    const displayName = (visual?.displayName ?? "").toLowerCase();
    return label.includes(q) || displayName.includes(q) || type.toLowerCase().includes(q);
  });

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
          data-add-question="true"
          aria-label="Add question"
          className="relative inline-flex items-center justify-center h-6 rounded-full border border-slate-300/80 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 text-slate-500 dark:text-zinc-400 shadow-2xs hover:border-[#FF5722] hover:text-[#FF5722] hover:shadow-xs transition-all duration-200 cursor-pointer overflow-hidden group/btn"
        >
          <Plus className="h-3.5 w-3.5 text-[#FF5722] shrink-0" />
          <span className="text-[11px] font-medium max-w-0 opacity-0 group-hover/btn:max-w-[85px] group-hover/btn:opacity-100 whitespace-nowrap overflow-hidden transition-all duration-200 ease-in-out pl-0 group-hover/btn:pl-1">
            Add question
          </span>
        </PopoverTrigger>
        <PopoverContent
          data-add-question="true"
          className="w-72 max-h-[460px] flex flex-col p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xl rounded-xl z-50 overflow-hidden"
          align="center"
          sideOffset={6}
        >
          {/* Search bar with autofocus */}
          <div className="relative mb-2 px-0.5">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 dark:text-zinc-500 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search question types..."
              autoFocus
              className="w-full h-8 pl-8 pr-7 text-xs rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/80 dark:bg-zinc-800/60 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-[#FF5722] focus:ring-1 focus:ring-[#FF5722]/30 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 cursor-pointer"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
            Select question type ({filteredTypes.length})
          </div>

          <div className="grid grid-cols-1 gap-1 overflow-y-auto max-h-[320px] pr-0.5">
            {filteredTypes.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400 dark:text-zinc-500">
                No question types found.
              </div>
            ) : (
              filteredTypes.map((type) => {
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
                    className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left text-sm hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer w-full group/item"
                  >
                    <div
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded text-white shadow-2xs transition-transform group-hover/item:scale-105",
                        visual?.bgColor ?? "bg-slate-500"
                      )}
                    >
                      {TypeIcon ? <TypeIcon className="h-3.5 w-3.5 stroke-[2]" /> : null}
                    </div>
                    <span className="font-medium text-slate-800 dark:text-zinc-200 text-xs truncate">
                      {label}
                    </span>
                  </button>
                );
              })
            )}
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

  // Deselect nested question when clicking outside the question
  useEffect(() => {
    if (!selectedQuestionId) return;

    const handlePointerDown = (event: MouseEvent | PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      // 1. If clicked inside any question card in the editor, keep selection
      if (
        target.closest("[data-question-item='true']") ||
        target.closest(".group\\/question")
      ) {
        return;
      }

      // 2. If clicked inside sidebar nested question items, keep selection
      if (
        target.closest("[data-sidebar-question='true']") ||
        target.closest(".group\\/questionitem")
      ) {
        return;
      }

      // 3. If clicked inside SettingsPanel, drawers, dialogs, popovers, or add-question button
      if (
        target.closest("[data-settings-panel='true']") ||
        target.closest("[role='dialog']") ||
        target.closest("[data-radix-popper-content-wrapper]") ||
        target.closest("[data-add-question='true']")
      ) {
        return;
      }

      // Clicked outside any question -> deselect
      onSelectQuestion?.(null);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [selectedQuestionId, onSelectQuestion]);

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

  const hasSelectedQuestion = Boolean(
    selectedQuestionId &&
      questions.some((q) => (q.questionKey || q.blockKey) === selectedQuestionId)
  );

  const hasMultipleQuestions = questions.length > 1;

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

    updatedQuestions[questionIndex] = {
      ...target,
      ...updates,
      title: nextTitle,
      label: nextTitle,
      description: "",
      helperText: "",
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
      description: "",
      helperText: "",
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

  const isStatement = page.type === "statement";

  const questionTitleSize =
    themeResolved.fontSize === "small"
      ? "text-[16px] sm:text-[17px]"
      : themeResolved.fontSize === "large"
        ? "text-[20px] sm:text-[22px]"
        : "text-[17px] sm:text-[19px]";

  const content = (
    <div className="w-full space-y-6">
      {/* 1. Page Title and Description with page number on top-left aligned with question handles */}
      <div className="w-full relative mb-2">
        <div className="flex items-start gap-2.5">
          {/* Page number badge aligned in the exact same 24px column as question drag handles */}
          <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded bg-slate-900 dark:bg-zinc-800 text-white text-[11px] font-bold select-none shadow-2xs">
            {pageIndex + 1}
          </span>

          <div className="flex-1 min-w-0">
            <VariableEditable
              value={pageTitle}
              onCommit={handlePageTitleChange}
              variables={variables}
              ariaLabel="Page Title"
              placeholder="Page title (optional)"
              className={cn(
                fontSizes.question || "text-[24px] sm:text-[28px]",
                "font-normal outline-none border-0 border-transparent pb-1 transition-colors cursor-text w-full"
              )}
              style={themeResolved.questionColor ? { color: themeResolved.questionColor } : undefined}
            />

            <div className="mt-1 w-full">
              <VariableEditable
                value={pageDescription}
                onCommit={handlePageDescriptionChange}
                variables={variables}
                ariaLabel="Page Description"
                placeholder="Description (optional)"
                className={cn(
                  fontSizes.helper || "text-[16px] sm:text-[18px]",
                  "font-normal text-muted-foreground outline-none border-0 border-transparent pb-1 transition-colors cursor-text w-full"
                )}
                style={themeResolved.textColor ? { color: themeResolved.textColor } : undefined}
              />
            </div>
          </div>
        </div>
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
            ...itemProps.style,
            zIndex: isDragged ? 9999 : undefined,
          };

          const questionId = question.questionKey || question.blockKey;
          const isThisQuestionSelected = !hasSelectedQuestion || questionId === selectedQuestionId;

          return (
            <div
              key={key}
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
                "group/question relative w-full rounded-xl transition-all duration-200",
                isDragged
                  ? "opacity-75 bg-slate-50/80 dark:bg-zinc-800/80 shadow-lg ring-1 ring-[#FF5722]/30"
                  : !hasSelectedQuestion
                    ? "opacity-100"
                    : isThisQuestionSelected
                      ? "opacity-100 ring-2 ring-[#FF5722]/25 rounded-xl bg-white/40 dark:bg-zinc-900/40 shadow-xs"
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
                        onCommit={(title) => updateQuestion(qIdx, { title })}
                        variables={variables}
                        ariaLabel="Question"
                        placeholder="Question title..."
                        className={cn(
                          questionTitleSize,
                          "font-normal outline-none border-0 border-transparent pb-1 transition-colors cursor-text w-full"
                        )}
                        style={themeResolved.questionColor ? { color: themeResolved.questionColor } : undefined}
                      />
                    </div>

                    {/* Question Actions: Duplicate & Delete (revealed on question hover) */}
                    <div className="flex items-center gap-0.5 opacity-0 group-hover/question:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicateQuestion(qIdx);
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
                          handleDeleteQuestion(qIdx);
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
                        handleDuplicateQuestion(qIdx);
                      }}
                      title="Duplicate question"
                      className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}

                {/* Question Editor Input */}
                <div className={cn("w-full pl-[34px]", hasMultipleQuestions ? "mt-4" : "mt-1")} style={{ color: themeResolved.answerColor }}>
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
