import { createContext } from "react";
import type { Form } from "@/shared/types/common";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export interface FormContextValue {
  form: Form | null;
  isLoading: boolean;
  error: string | null;
  isPublished: boolean;
  saveStatus: SaveStatus;
  previewForm: Form | null;
  showPreview: boolean;
  refreshForm: () => Promise<void>;
  setIsPublished: (published: boolean) => void;
  updateFormData: (updates: Partial<Form>) => void;
  showSaveStatus: (status: SaveStatus) => void;
  setPreviewForm: (form: Form | null) => void;
  setShowPreview: (show: boolean) => void;
  openPreview: (form?: Form | null) => void;
}

export const FormContext = createContext<FormContextValue | undefined>(
  undefined,
);