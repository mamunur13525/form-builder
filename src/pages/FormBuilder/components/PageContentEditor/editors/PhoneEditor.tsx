import { useState } from "react";
import type { FormPage } from "@/shared/types/common";
import { PhoneAnswerPage } from "@/shared/components/pages";

interface EditorProps {
  page: FormPage;
  pageIndex: number;
  onUpdate: (index: number, updates: Partial<FormPage>) => void;
  color?: string;
  fontSizeClass?: string;
}

export function PhoneEditor({ page, color, fontSizeClass }: EditorProps) {
  // Local demo value: typing or changing the country previews the mask without
  // writing the answer into the question's placeholder.
  const [preview, setPreview] = useState("");

  return (
    <div className="space-y-1">
      <PhoneAnswerPage
        value={preview}
        onChange={setPreview}
        settings={
          page.settings?.phone ?? {
            phoneVerification: false,
            countryCodeMode: "auto",
            defaultCountry: null,
          }
        }
        color={color}
        fontSizeClass={fontSizeClass}
      />
    </div>
  );
}
