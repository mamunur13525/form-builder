import { createContext } from "react";
import type { Form } from "@/shared/types/common";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export interface FormContextValue {
  form: Form | null;
  isLoading: boolean;
  error: string | null;
  isPublished: boolean;
  hasUnpublishedChanges: boolean;
  /**
   * Incremented every time the form is re-fetched from the server. Builder
   * views watch this to re-sync local state after the server changes pages
   * underneath them (e.g. discarding a draft).
   */
  formRevision: number;
  saveStatus: SaveStatus;
  previewForm: Form | null;
  showPreview: boolean;
  refreshForm: () => Promise<void>;
  setIsPublished: (published: boolean) => void;
  setHasUnpublishedChanges: (hasChanges: boolean) => void;
  updateFormData: (updates: Partial<Form>) => void;
  showSaveStatus: (status: SaveStatus) => void;
  setPreviewForm: (form: Form | null) => void;
  setShowPreview: (show: boolean) => void;
  openPreview: (form?: Form | null) => void;
}

export const FormContext = createContext<FormContextValue | undefined>(
  undefined,
);