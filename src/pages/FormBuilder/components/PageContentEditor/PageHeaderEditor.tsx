import type { VariableItem } from "@/shared/components/pages";
import { VariableEditable } from "@/shared/components/pages";
import { getFontSizeClasses } from "@/shared/utils/theme";
import { cn } from "@/lib/utils";

interface PageHeaderEditorProps {
  pageIndex: number;
  title: string;
  description: string;
  variables: VariableItem[];
  fontSizes: ReturnType<typeof getFontSizeClasses>;
  questionColor?: string;
  textColor?: string;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
}

/** Page number badge + editable page title and description. */
export function PageHeaderEditor({
  pageIndex,
  title,
  description,
  variables,
  fontSizes,
  questionColor,
  textColor,
  onTitleChange,
  onDescriptionChange,
}: PageHeaderEditorProps) {
  return (
    <div className="w-full relative mb-2">
      <div className="flex items-start gap-4">
        {/* Page number badge aligned in the exact same 24px column as question drag handles */}
        <span className="mt-1 ml-1 flex shrink-0 items-center justify-center rounded text-white text-[11px] font-bold select-none shadow-2xs text-xs font-bold text-muted select-none bg-gray-900 px-1 rounded">
          {pageIndex + 1}
        </span>

        <div className="flex-1 min-w-0">
          <VariableEditable
            value={title}
            onCommit={onTitleChange}
            variables={variables}
            ariaLabel="Page Title"
            placeholder="Page title (optional)"
            className={cn(
              fontSizes.question || "text-[24px] sm:text-[28px]",
              "font-normal outline-none border-0 border-transparent pb-1 transition-colors cursor-text w-full"
            )}
            style={questionColor ? { color: questionColor } : undefined}
          />

          <div className="mt-1 w-full">
            <VariableEditable
              value={description}
              onCommit={onDescriptionChange}
              variables={variables}
              ariaLabel="Page Description"
              placeholder="Description (optional)"
              className={cn(
                fontSizes.helper || "text-[16px] sm:text-[18px]",
                "font-normal text-muted-foreground outline-none border-0 border-transparent pb-1 transition-colors cursor-text w-full"
              )}
              style={textColor ? { color: textColor } : undefined}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
