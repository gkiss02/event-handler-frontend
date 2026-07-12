import { useEffect, useState, type ReactNode } from "react";
import { fetchLocations } from "../api/eventApi";
import { LocationsContext } from "./locations-context";

export function LocationsProvider({ children }: { children: ReactNode }) {
  const [locations, setLocations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const data = await fetchLocations();
        if (!cancelled) setLocations(data);
      } catch {
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <LocationsContext.Provider value={{ locations, loading }}>
      {children}
    </LocationsContext.Provider>
  );
}
