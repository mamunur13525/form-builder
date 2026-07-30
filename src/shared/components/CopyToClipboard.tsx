import { useCallback, type ReactNode } from "react";
import { showSuccess } from "@/shared/hooks/useToast";

interface CopyToClipboardProps {
  text: string;
  children: ReactNode;
  className?: string;
}

export function CopyToClipboard({ text, children, className }: CopyToClipboardProps) {
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      showSuccess("Copied to clipboard");
    } catch {
      // Clipboard API may fail in some environments
    }
  }, [text]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={className}
    >
      {children}
    </button>
  );
}