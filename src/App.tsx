import { CssBaseline } from "@mui/material";
import { CalendarPage } from "./pages/CalendarPage";
import { LocationsProvider } from "./context/LocationsProvider";
import { SnackbarProvider } from "./context/SnackBarProvider";

function App() {
  return (
    <SnackbarProvider>
      <LocationsProvider>
        <CssBaseline />
        <CalendarPage />
      </LocationsProvider>
    </SnackbarProvider>
  );
}

export default App;
