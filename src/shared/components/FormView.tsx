import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import type { Form, FormField } from "../../shared/types/common";
import { cn } from "@/lib/utils";
import { useFormNavigation } from "../hooks/useFormNavigation";
import { FormFieldRenderer } from "./FormFieldRenderer";
import { FormProgressBar } from "./FormProgressBar";
import { FormSubmittedView } from "./FormSubmittedView";
import { FormNavigationFooter } from "./FormNavigationFooter";
import { FieldLabel, FieldHelperText, FieldSubmitButton } from "./fields";
import { resolveFormTheme, getFontSizeClasses, loadThemeFont } from "../utils/theme";

const slideVariants = {
  enter: (direction: number) => ({
    x: direction * 40,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: -direction * 40,
    opacity: 0,
  }),
};

interface FormViewProps {
  form: Form;
  mode: "preview" | "published";
  onSubmit?: (answers: Record<string, unknown>) => void;
}

export function FormView({ form, mode, onSubmit }: FormViewProps) {
  const {
    currentStep,
    direction,
    answers,
    isSubmitting,
    submitted,
    error,
    submittedPages,
    activeFields,
    currentField,
    isLastStep,
    handleAnswer,
    handleNext,
    handlePrev,
    handleNavNext,
  } = useFormNavigation({ form, mode, onSubmit });

  const themeResolved = resolveFormTheme(form.theme);

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

  const renderFieldQuestion = (field: FormField) => (
    <div className={cn("w-full flex flex-col", alignClass)}>
      {field.coverImage?.url && (
        <img
          src={field.coverImage.url}
          alt={field.coverImage.alt || ""}
          className="mb-5 max-h-56 w-full rounded-md border object-cover"
        />
      )}

      <FieldLabel
        label={field.label}
        pageNumber={currentStep + 1}
        color={themeResolved.questionColor}
        fontSizeClass={fontSizes.question}
      />

      <FieldHelperText
        helperText={field.helperText}
        color={themeResolved.textColor}
        fontSizeClass={fontSizes.helper}
      />

      {/* Field-specific input */}
      <div className="mt-5 w-full" style={{ color: themeResolved.answerColor }}>
        <FormFieldRenderer
          field={field}
          value={answers[field.fieldKey]}
          error={error}
          onAnswer={handleAnswer}
          color={themeResolved.answerColor}
          fontSizeClass={fontSizes.input}
        />
        {error && (
          <motion.div
            initial={{ y: -4, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center gap-1.5 text-sm text-destructive font-medium pt-1"
          >
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            {error}
          </motion.div>
        )}
      </div>

      {/* Statement pages collect no answer, so the button just advances. */}
      <FieldSubmitButton
        text={
          isSubmitting
            ? "Submitting..."
            : field.appearance.submitButtonText ||
            (field.type === "statement" ? "Continue" : "Submit")
        }
        color={themeResolved.buttonColor || field.appearance.submitButtonColor}
        textColor={themeResolved.buttonTextColor}
        roundCorners={themeResolved.roundCorners}
        fontSizeClass={fontSizes.button}
        onClick={handleNext}
        disabled={isSubmitting}
      />
    </div>
  );

  if (submitted) {
    return <FormSubmittedView onReset={() => { }} />;
  }

  return (
    <div
      className="relative flex flex-col h-full w-full overflow-hidden"
      style={containerStyle}
    >
      {/* Background Image Layer */}
      {themeResolved.backgroundImage?.url && (
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={bgImageStyle}
        />
      )}

      {/* Progress bar */}
      {form.settings?.showProgressBar && (
        <div className="relative z-10">
          <FormProgressBar
            currentStep={currentStep}
            totalSteps={activeFields.length}
          />
        </div>
      )}

      {/* Content area */}
      <div className="relative z-10 flex-1 min-h-0">
        <div className="absolute inset-0">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              className="absolute inset-0 overflow-y-auto px-6 py-10 flex items-center"
            >
              <div className="mx-auto max-w-2xl w-full">
                {activeFields.length === 0 ? (
                  <div className="text-center py-20 text-muted-foreground">
                    <p className="text-lg">No fields in this form yet.</p>
                    <p className="text-base mt-2">
                      Add fields in the form builder to see them here.
                    </p>
                  </div>
                ) : currentField ? (
                  renderFieldQuestion(currentField)
                ) : (
                  <div className="text-center py-20 text-muted-foreground">
                    <p>Loading field...</p>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10">
        <FormNavigationFooter
          currentStep={currentStep}
          isLastStep={isLastStep}
          hasSubmittedCurrent={submittedPages.has(currentStep)}
          onPrev={handlePrev}
          onNavNext={handleNavNext}
        />
      </div>
    </div>
  );
}