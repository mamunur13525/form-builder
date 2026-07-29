import { useContext } from "react";
import { FormContext, type FormContextValue } from "./form-context";

export function useFormContext(): FormContextValue {
  const context = useContext(FormContext);
  if (context === undefined) {
    throw new Error("useFormContext must be used within a FormProvider");
  }
  return context;
}