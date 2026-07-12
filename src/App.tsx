import { CssBaseline } from "@mui/material";
import { CalendarPage } from "./pages/CalendarPage";
import { LocationsProvider } from "./context/LocationsProvider";

function App() {
  return (
    <LocationsProvider>
      <CssBaseline />
      <CalendarPage />
    </LocationsProvider>
  );
}

export default App;
