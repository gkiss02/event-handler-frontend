import { createContext, useContext } from "react";

export interface SnackbarContextValue {
  showError: (message: string) => void;
}

export const SnackbarContext = createContext<SnackbarContextValue | undefined>(
  undefined
);

let globalShowError: ((message: string) => void) | null = null;

export function registerGlobalShowError(fn: (message: string) => void): void {
  globalShowError = fn;
}

export function triggerGlobalError(message: string): void {
  if (globalShowError) {
    globalShowError(message);
  }
}

export function useSnackbar(): SnackbarContextValue {
  const ctx = useContext(SnackbarContext);
  if (!ctx) {
    throw new Error("useSnackbar must be used within SnackbarProvider");
  }
  return ctx;
}
