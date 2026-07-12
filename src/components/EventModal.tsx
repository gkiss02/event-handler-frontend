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
  Alert,
  CircularProgress,
  Divider,
  Typography,
  IconButton,
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

const emptyForm: FormState = {
  title: "",
  location: "",
  startDate: null,
  endDate: null,
  status: EventStatus.DRAFT,
};

export function EventModal({
  open,
  eventId,
  onClose,
  onSaved,
}: EventModalProps) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [newParticipantEmail, setNewParticipantEmail] = useState("");
  const [participantError, setParticipantError] = useState<string | null>(null);
  const [editingParticipantId, setEditingParticipantId] = useState<
    string | null
  >(null);
  const [editingEmail, setEditingEmail] = useState("");
  const { locations } = useLocations();

  const isEditMode = Boolean(eventId);

  useEffect(() => {
    if (!open || !eventId) return;

    let cancelled = false;

    const loadEvent = async () => {
      setLoading(true);
      setError(null);

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
      } catch {
        if (!cancelled) setError("Nem sikerült betölteni az eseményt.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadEvent();

    return () => {
      cancelled = true;
    };
  }, [open, eventId]);

  const handleSave = async () => {
    if (!form.title || !form.location || !form.startDate || !form.endDate) {
      setError("Minden mező kitöltése kötelező.");
      return;
    }

    setLoading(true);
    setError(null);

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
      setError("Nem sikerült menteni az eseményt.");
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!eventId) return;

    setLoading(true);
    setError(null);

    try {
      await publishEvent(eventId);
      onSaved();
      onClose();
    } catch {
      setError("Nem sikerült publikálni az eseményt.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!eventId) return;

    setLoading(true);
    setError(null);

    try {
      await deleteEvent(eventId);
      onSaved();
      onClose();
    } catch {
      setError("Nem sikerült törölni az eseményt.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddParticipant = async () => {
    if (!eventId || !newParticipantEmail.trim()) return;

    setParticipantError(null);

    try {
      const participant = await addParticipant(
        eventId,
        newParticipantEmail.trim()
      );
      setParticipants((prev) => [...prev, participant]);
      setNewParticipantEmail("");
    } catch {
      setParticipantError(
        "Nem sikerült hozzáadni (talán már szerepel az emailcím)."
      );
    }
  };

  const startEditParticipant = (participant: Participant) => {
    setEditingParticipantId(participant.id);
    setEditingEmail(participant.email);
    setParticipantError(null);
  };

  const cancelEditParticipant = () => {
    setEditingParticipantId(null);
    setEditingEmail("");
  };

  const handleEditParticipant = async () => {
    if (!eventId || !editingParticipantId || !editingEmail.trim()) return;

    setParticipantError(null);

    try {
      const updated = await editParticipant(
        eventId,
        editingParticipantId,
        editingEmail.trim()
      );
      setParticipants((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p))
      );
      cancelEditParticipant();
    } catch {
      setParticipantError(
        "Nem sikerült módosítani (talán már szerepel az emailcím)."
      );
    }
  };

  const handleRemoveParticipant = async (participantId: string) => {
    if (!eventId) return;

    try {
      await removeParticipant(eventId, participantId);
      setParticipants((prev) => prev.filter((p) => p.id !== participantId));
    } catch {
      setParticipantError("Nem sikerült eltávolítani a résztvevőt.");
    }
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
            {error && <Alert severity="error">{error}</Alert>}
            <TextField
              label="Cím"
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              fullWidth
            />
            <TextField
              select
              label="Helyszín"
              value={form.location}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  location: e.target.value,
                }))
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
              onChange={(value) => setForm((f) => ({ ...f, startDate: value }))}
              ampm={false}
            />
            <DateTimePicker
              label="Befejezés"
              value={form.endDate}
              onChange={(value) => setForm((f) => ({ ...f, endDate: value }))}
              ampm={false}
            />
            {isEditMode && (
              <>
                <Divider sx={{ mt: 1 }} />
                <Typography variant="subtitle2">Résztvevők</Typography>
                {participantError && (
                  <Alert severity="error">{participantError}</Alert>
                )}
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
                            onChange={(e) => setEditingEmail(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                void handleEditParticipant();
                              }
                              if (e.key === "Escape") cancelEditParticipant();
                            }}
                            size="small"
                            fullWidth
                            autoFocus
                          />
                          <IconButton
                            size="small"
                            color="success"
                            onClick={handleEditParticipant}
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
                <Stack direction="row" sx={{ gap: 1 }}>
                  <TextField
                    label="Résztvevő email címe"
                    value={newParticipantEmail}
                    onChange={(e) => setNewParticipantEmail(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        void handleAddParticipant();
                      }
                    }}
                    fullWidth
                    size="small"
                  />
                  <Button onClick={handleAddParticipant} variant="outlined">
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
            onClick={handleDelete}
            variant="outlined"
            color="error"
            disabled={loading}
          >
            Törlés
          </Button>
        )}
        {isEditMode && form.status === EventStatus.DRAFT && (
          <Button
            onClick={handlePublish}
            variant="outlined"
            color="success"
            disabled={loading}
          >
            Publikálás
          </Button>
        )}
        <Button onClick={handleSave} variant="contained" disabled={loading}>
          Mentés
        </Button>
      </DialogActions>
    </Dialog>
  );
}
