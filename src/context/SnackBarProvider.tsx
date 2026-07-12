import { useCallback, useState, type ReactNode } from "react";
import { Snackbar, Alert } from "@mui/material";
import { registerGlobalShowError, SnackbarContext } from "./snackbar-context";

export function SnackbarProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  const showError = useCallback((msg: string) => {
    setMessage(msg);
    setOpen(true);
  }, []);

  registerGlobalShowError(showError);

  const handleClose = () => setOpen(false);

  return (
    <SnackbarContext.Provider value={{ showError }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={5000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="error" onClose={handleClose} variant="filled">
          {message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
}
