import { Container, Typography } from "@mui/material";
import { CalendarView } from "../components/CalendarView";

export function CalendarPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Események
      </Typography>
      <CalendarView />
    </Container>
  );
}
