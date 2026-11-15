import { useEffect } from "react";

export function useDeselectQuestionOnOutside(
  selectedQuestionId: string | null | undefined,
  onSelectQuestion?: (questionId: string | null) => void
) {
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
}
