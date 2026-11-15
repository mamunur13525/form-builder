import { motion } from "framer-motion";
import type { KeyboardEvent } from "react";
import { AlertTriangle } from "lucide-react";
import type { FormPage } from "../types/common";
import { cn } from "@/lib/utils";
import { FormPageRenderer } from "./FormPageRenderer";
import { PageLabel, PageHelperText, PageSubmitButton, type VariableItem } from "./pages";
import type { ResolvedFormTheme } from "../utils/theme";
import { getQuestionTitleClasses } from "../utils/theme";
import { validateQuestion } from "../hooks/useFormValidation";

interface FormPageContentProps {
  page: FormPage;
  currentStep: number;
  themeResolved: ResolvedFormTheme;
  fontSizes: {
    question: string;
    helper: string;
    input: string;
    button: string;
  };
  variableItems: VariableItem[];
  answers: Record<string, unknown>;
  error: string | null;
  isSubmitting: boolean;
  isLastStep: boolean;
  isMobileView?: boolean;
  onAnswer: (key: string, val: unknown) => void;
  onNext: () => void;
}

export function FormPageContent({
  page,
  currentStep,
  themeResolved,
  fontSizes,
  variableItems,
  answers,
  error,
  isSubmitting,
  isLastStep,
  isMobileView,
  onAnswer,
  onNext,
}: FormPageContentProps) {
  const questions = (page.questions && page.questions.length > 0)
    ? page.questions
    : (page.blocks && page.blocks.length > 0)
      ? page.blocks
      : [
          {
            _id: page._id,
            id: page._id,
            questionKey: page.pageKey,
            blockKey: page.pageKey,
            type: page.type,
            title: page.title || page.label || "",
            description: page.description || page.helperText || "",
            label: page.label || page.title || "",
            helperText: page.helperText || page.description || "",
            placeholder: page.placeholder,
            required: page.required,
            order: 1,
            options: page.options,
            validation: page.validation,
            settings: page.settings,
            appearance: page.appearance,
            coverImage: page.coverImage,
            isActive: page.isActive,
          },
        ];

  const hasMultipleQuestions = questions.length > 1;
  const isStatementOnly = questions.every((q) => q.type === "statement");
  const questionTitleClass = getQuestionTitleClasses(themeResolved.fontSize);
  // Errors are per question: each one shows under the field it belongs to.
  const questionErrors = error
    ? questions.map((q, idx) => {
        const qKey =
          q.questionKey ||
          q.blockKey ||
          (q as any).id ||
          (q as any)._id ||
          (hasMultipleQuestions ? `${page.pageKey}_q${idx + 1}` : page.pageKey);
        const val =
          answers[qKey] !== undefined
            ? answers[qKey]
            : (!hasMultipleQuestions ? answers[page.pageKey] : undefined);
        return validateQuestion(q, val);
      })
    : [];
  const hasQuestionError = questionErrors.some(Boolean);

  // Enter submits the page from any text field (Shift+Enter still adds a
  // newline in a textarea), matching a native form's behavior.
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) return;
    const tag = (event.target as HTMLElement).tagName;
    if (tag !== "INPUT" && tag !== "TEXTAREA") return;
    event.preventDefault();
    if (!isSubmitting) onNext();
  };

  return (
    <div className="w-full space-y-6" onKeyDown={handleKeyDown}>
      {/* Page Title & Description (when present / non-empty) */}
      {(page.title || page.label || page.description || page.helperText) ? (
        <div>
          <PageLabel
            label={page.title || page.label}
            pageNumber={currentStep + 1}
            required={!hasMultipleQuestions && (page.required || questions[0]?.required)}
            color={themeResolved.questionColor}
            fontSizeClass={fontSizes.question}
            variables={variableItems}
          />
          {(page.description || (!hasMultipleQuestions ? page.helperText : "")) ? (
            <PageHelperText
              helperText={page.description || page.helperText}
              color={themeResolved.textColor}
              fontSizeClass={fontSizes.helper}
              variables={variableItems}
            />
          ) : null}
        </div>
      ) : null}

      {/* Questions List */}
      <div className="w-full space-y-8">
        {questions.map((question, qIdx) => {
          const questionTitle = question.title || (hasMultipleQuestions ? question.label : "");
          const questionKey: string =
            question.questionKey ||
            question.blockKey ||
            (question as any).id ||
            (question as any)._id ||
            (hasMultipleQuestions ? `${page.pageKey}_q${qIdx + 1}` : page.pageKey);
          const questionError = questionErrors[qIdx] ?? null;
          const questionAsPage: FormPage = {
            ...page,
            _id: question._id || question.id,
            pageKey: questionKey,
            type: question.type,
            placeholder: question.placeholder || "",
            options: question.options || [],
            settings: question.settings,
            validation: question.validation,
            appearance: question.appearance || page.appearance,
            required: question.required ?? false,
          };

          const questionValue =
            answers[questionKey] !== undefined
              ? answers[questionKey]
              : (!hasMultipleQuestions ? answers[page.pageKey] : undefined);

          return (
            <div key={questionKey || qIdx} className="w-full space-y-3">
              {hasMultipleQuestions && questionTitle ? (
                <div className="space-y-1">
                  <h3
                    className={cn("font-normal", questionTitleClass)}
                    style={{ color: themeResolved.questionColor }}
                  >
                    {questionTitle}
                    {question.required && (
                      <span className="ml-1 text-destructive font-bold">*</span>
                    )}
                  </h3>
                </div>
              ) : null}

              <div className="w-full" style={{ color: themeResolved.answerColor }}>
                <FormPageRenderer
                  page={questionAsPage}
                  value={questionValue}
                  error={questionError}
                  onAnswer={(_key, val) => {
                    onAnswer(questionKey, val);
                    if (!hasMultipleQuestions && questionKey !== page.pageKey) {
                      onAnswer(page.pageKey, val);
                    }
                  }}
                  color={themeResolved.answerColor}
                  fontSizeClass={fontSizes.input}
                  isMobileView={isMobileView}
                />
              </div>

              {questionError && (
                <div className="flex items-center gap-1.5 text-sm text-destructive font-medium pt-1">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  {questionError}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Errors with no field of their own (e.g. a failed submit). */}
      {error && !hasQuestionError && (
        <motion.div
          initial={{ y: -4, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center gap-1.5 text-sm text-destructive font-medium pt-1"
        >
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </motion.div>
      )}

      {/* Page Submit/Next Button */}
      <div className="pt-2">
        <PageSubmitButton
          text={
            isSubmitting
              ? "Submitting..."
              : page.appearance?.submitButtonText ||
                (!isLastStep ? "Next" : isStatementOnly ? "Continue" : "Submit")
          }
          color={themeResolved.buttonColor || page.appearance?.submitButtonColor}
          textColor={themeResolved.buttonTextColor}
          roundCorners={themeResolved.roundCorners}
          fontSizeClass={fontSizes.button}
          onClick={onNext}
          disabled={isSubmitting}
        />
      </div>
    </div>
  );
}
