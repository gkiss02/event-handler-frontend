import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Button,
  Stack,
  CircularProgress,
  Divider,
  Typography,
  IconButton,
  Alert,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import {
  addParticipant,
  createEvent,
  deleteEvent,
  editParticipant,
  fetchEvent,
  publishEvent,
  removeParticipant,
  updateEvent,
} from "../api/eventApi";
import {
  EventStatus,
  type CreateEventPayload,
  type EventDetail,
  type Participant,
} from "../types/event.types";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import { useLocations } from "../context/locations-context";

interface EventModalProps {
  open: boolean;
  eventId?: string | null;
  onClose: () => void;
  onSaved: () => void;
}

interface FormState {
  title: string;
  location: string | "";
  startDate: Date | null;
  endDate: Date | null;
  status: EventStatus;
}

interface FieldErrors {
  title?: boolean;
  location?: boolean;
  startDate?: boolean;
  endDate?: boolean;
  dateRange?: boolean;
}

const emptyForm: FormState = {
  title: "",
  location: "",
  startDate: null,
  endDate: null,
  status: EventStatus.DRAFT,
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(value: string): boolean {
  return EMAIL_REGEX.test(value.trim());
}

export function EventModal({
  open,
  eventId,
  onClose,
  onSaved,
}: EventModalProps) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [newParticipantEmail, setNewParticipantEmail] = useState("");
  const [newParticipantError, setNewParticipantError] = useState(false);
  const [editingParticipantId, setEditingParticipantId] = useState<
    string | null
  >(null);
  const [editingEmail, setEditingEmail] = useState("");
  const [editingEmailError, setEditingEmailError] = useState(false);
  const { locations } = useLocations();

  const isEditMode = Boolean(eventId);

  useEffect(() => {
    if (!open || !eventId) return;

    let cancelled = false;

    const loadEvent = async () => {
      setLoading(true);

      try {
        const data: EventDetail = await fetchEvent(eventId);
        if (cancelled) return;

        setForm({
          title: data.title,
          location: data.location,
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate),
          status: data.status,
        });
        setParticipants(data.participants);
        setFieldErrors({});
      } catch {
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadEvent();

    return () => {
      cancelled = true;
    };
  }, [open, eventId]);

  const validateForm = (): boolean => {
    const dateRangeInvalid =
      form.startDate !== null &&
      form.endDate !== null &&
      form.startDate.getTime() > form.endDate.getTime();

    const errors: FieldErrors = {
      title: !form.title.trim(),
      location: !form.location,
      startDate: !form.startDate,
      endDate: !form.endDate,
      dateRange: dateRangeInvalid,
    };

    setFieldErrors(errors);

    return !Object.values(errors).some(Boolean);
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    if (!form.startDate || !form.endDate) return;

    setLoading(true);

    const payload: CreateEventPayload = {
      title: form.title,
      location: form.location,
      startDate: form.startDate.toISOString(),
      endDate: form.endDate.toISOString(),
    };

    try {
      if (isEditMode && eventId) {
        await updateEvent(eventId, payload);
      } else {
        await createEvent(payload);
      }
      onSaved();
      onClose();
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!eventId) return;

    setLoading(true);

    try {
      await publishEvent(eventId);
      onSaved();
      onClose();
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!eventId) return;

    setLoading(true);

    try {
      await deleteEvent(eventId);
      onSaved();
      onClose();
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleAddParticipant = async () => {
    const email = newParticipantEmail.trim();

    if (!email || !isValidEmail(email)) {
      setNewParticipantError(true);
      return;
    }

    if (!eventId) return;

    try {
      const participant = await addParticipant(eventId, email);
      setParticipants((prev) => [...prev, participant]);
      setNewParticipantEmail("");
      setNewParticipantError(false);
    } catch {}
  };

  const startEditParticipant = (participant: Participant) => {
    setEditingParticipantId(participant.id);
    setEditingEmail(participant.email);
    setEditingEmailError(false);
  };

  const cancelEditParticipant = () => {
    setEditingParticipantId(null);
    setEditingEmail("");
    setEditingEmailError(false);
  };

  const handleEditParticipant = async () => {
    const email = editingEmail.trim();

    if (!email || !isValidEmail(email)) {
      setEditingEmailError(true);
      return;
    }

    if (!eventId || !editingParticipantId) return;

    try {
      const updated = await editParticipant(
        eventId,
        editingParticipantId,
        email
      );
      setParticipants((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p))
      );
      cancelEditParticipant();
    } catch {}
  };

  const handleRemoveParticipant = async (participantId: string) => {
    if (!eventId) return;

    try {
      await removeParticipant(eventId, participantId);
      setParticipants((prev) => prev.filter((p) => p.id !== participantId));
    } catch {}
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {isEditMode ? "Esemény szerkesztése" : "Új esemény"}
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Stack sx={{ alignItems: "center", py: 4 }}>
            <CircularProgress />
          </Stack>
        ) : (
          <Stack sx={{ gap: 2, pt: 1 }}>
            <TextField
              label="Cím"
              value={form.title}
              onChange={(e) => {
                setForm((f) => ({ ...f, title: e.target.value }));
                setFieldErrors((errs) => ({ ...errs, title: false }));
              }}
              error={Boolean(fieldErrors.title)}
              helperText={fieldErrors.title ? "A cím megadása kötelező." : " "}
              fullWidth
            />
            <TextField
              select
              label="Helyszín"
              value={form.location}
              onChange={(e) => {
                setForm((f) => ({ ...f, location: e.target.value }));
                setFieldErrors((errs) => ({ ...errs, location: false }));
              }}
              error={Boolean(fieldErrors.location)}
              helperText={
                fieldErrors.location ? "A helyszín kiválasztása kötelező." : " "
              }
              fullWidth
            >
              {locations.map((loc) => (
                <MenuItem key={loc} value={loc}>
                  {loc}
                </MenuItem>
              ))}
            </TextField>
            <DateTimePicker
              label="Kezdés"
              value={form.startDate}
              onChange={(value) => {
                setForm((f) => ({ ...f, startDate: value }));
                setFieldErrors((errs) => ({
                  ...errs,
                  startDate: false,
                  dateRange: false,
                }));
              }}
              ampm={false}
              slotProps={{
                textField: {
                  error: Boolean(
                    fieldErrors.startDate || fieldErrors.dateRange
                  ),
                  helperText: fieldErrors.startDate
                    ? "A kezdés megadása kötelező."
                    : " ",
                },
              }}
            />
            <DateTimePicker
              label="Befejezés"
              value={form.endDate}
              onChange={(value) => {
                setForm((f) => ({ ...f, endDate: value }));
                setFieldErrors((errs) => ({
                  ...errs,
                  endDate: false,
                  dateRange: false,
                }));
              }}
              ampm={false}
              slotProps={{
                textField: {
                  error: Boolean(fieldErrors.endDate || fieldErrors.dateRange),
                  helperText: fieldErrors.endDate
                    ? "A befejezés megadása kötelező."
                    : " ",
                },
              }}
            />
            {fieldErrors.dateRange && (
              <Alert severity="error">
                A kezdés dátuma nem lehet később, mint a befejezésé.
              </Alert>
            )}

            {isEditMode && (
              <>
                <Divider sx={{ mt: 1 }} />
                <Typography variant="subtitle2">Résztvevők</Typography>
                <Stack sx={{ gap: 1 }}>
                  {participants.map((p) => (
                    <Stack
                      key={p.id}
                      direction="row"
                      sx={{ alignItems: "center", gap: 1 }}
                    >
                      {editingParticipantId === p.id ? (
                        <>
                          <TextField
                            value={editingEmail}
                            onChange={(e) => {
                              setEditingEmail(e.target.value);
                              setEditingEmailError(false);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleEditParticipant();
                              }
                              if (e.key === "Escape") cancelEditParticipant();
                            }}
                            error={editingEmailError}
                            helperText={
                              editingEmailError
                                ? "Adj meg egy érvényes email címet."
                                : " "
                            }
                            size="small"
                            fullWidth
                            autoFocus
                          />
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleEditParticipant()}
                          >
                            <CheckIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={cancelEditParticipant}
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </>
                      ) : (
                        <>
                          <Typography variant="body2" sx={{ flexGrow: 1 }}>
                            {p.email}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => startEditParticipant(p)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveParticipant(p.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </>
                      )}
                    </Stack>
                  ))}
                  {participants.length === 0 && (
                    <Typography variant="body2" color="text.secondary">
                      Még nincs résztvevő.
                    </Typography>
                  )}
                </Stack>
                <Stack
                  direction="row"
                  sx={{ gap: 1, alignItems: "flex-start" }}
                >
                  <TextField
                    label="Résztvevő email címe"
                    value={newParticipantEmail}
                    onChange={(e) => {
                      setNewParticipantEmail(e.target.value);
                      setNewParticipantError(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddParticipant();
                      }
                    }}
                    error={newParticipantError}
                    helperText={
                      newParticipantError
                        ? "Adj meg egy érvényes email címet."
                        : " "
                    }
                    fullWidth
                    size="small"
                  />
                  <Button
                    onClick={() => handleAddParticipant()}
                    variant="outlined"
                    sx={{ mt: 0.25 }}
                  >
                    Hozzáadás
                  </Button>
                </Stack>
              </>
            )}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Mégse</Button>
        {isEditMode && (
          <Button
            onClick={() => handleDelete()}
            variant="outlined"
            color="error"
            disabled={loading}
          >
            Törlés
          </Button>
        )}
        {isEditMode && form.status === EventStatus.DRAFT && (
          <Button
            onClick={() => handlePublish()}
            variant="outlined"
            color="success"
            disabled={loading}
          >
            Publikálás
          </Button>
        )}
        <Button
          onClick={() => handleSave()}
          variant="contained"
          disabled={loading}
        >
          Mentés
        </Button>
      </DialogActions>
    </Dialog>
  );
}
