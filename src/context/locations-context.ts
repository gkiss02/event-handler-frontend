import { createContext, useContext } from "react";

export interface LocationsContextValue {
  locations: string[];
  loading: boolean;
  error: string | null;
}

export const LocationsContext = createContext<
  LocationsContextValue | undefined
>(undefined);

export function useLocations(): LocationsContextValue {
  const ctx = useContext(LocationsContext);
  if (!ctx) {
    throw new Error("useLocations must be used within a LocationsProvider");
  }
  return ctx;
}
