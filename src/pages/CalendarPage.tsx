import { Container, Typography } from "@mui/material";
import { CalendarView } from "../components/CalendarView";
import { FilterPanel } from "../components/FilterPanel";
import { useState } from "react";
import type { EventFilters } from "../types/event.types";

export function CalendarPage() {
  const [filters, setFilters] = useState<EventFilters>({});

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Események
      </Typography>
      <FilterPanel filters={filters} onChange={setFilters} />
      <CalendarView filters={filters} />
    </Container>
  );
}
