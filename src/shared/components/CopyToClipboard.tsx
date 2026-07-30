import { useCallback, useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface CopyToClipboardProps {
  text: string;
  className?: string;
}

export function CopyToClipboard({
  text,
  className = "",
}: CopyToClipboardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API may fail in some environments
    }
  }, [text]);

  return (
    <Button
      variant={"outline"}
      type="button"
      onClick={handleCopy}
      className={'border-0 py-3 rounded-md cursor-pointer'}
    >
      <span className="relative h-4 w-4">
        <Copy
          className={cn(
            "absolute inset-0 h-4 w-4 transition-all duration-200",
            copied ? "scale-0 opacity-0" : "scale-100 opacity-100",
            className,
          )}
        />
        <Check
          className={cn(
            "absolute inset-0 h-4 w-4 transition-all duration-200",
            copied
              ? "scale-100 opacity-100 text-green-600 hover:text-green-600"
              : "scale-0 opacity-0",
          )}
        />
      </span>
    </Button>
  );
}
