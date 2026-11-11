import type { FormPage, FormQuestion, PageType } from "@/shared/types/common";
import { defaultOptionsForType, defaultSettingsForType } from "@/features/forms/model/page-defaults";

/** Derive a page's questions and the add/remove/reorder operations on them. */
export function usePageQuestions(
  page: FormPage,
  pageIndex: number,
  onUpdate: (index: number, updates: Partial<FormPage>) => void
) {
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

  const insertQuestion = (targetIndex: number, type: PageType) => {
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

    // The new question is empty, so drop the caret straight into its title.
    setTimeout(() => {
      document
        .querySelector<HTMLElement>(`#question-${key} [aria-label="Question"]`)
        ?.focus();
    }, 0);
  };

  const deleteQuestion = (questionIndex: number) => {
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

  const moveQuestion = (oldIndex: number, newIndex: number) => {
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

  const duplicateQuestion = (questionIndex: number) => {
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

  return { questions, updateQuestion, insertQuestion, deleteQuestion, moveQuestion, duplicateQuestion };
}
