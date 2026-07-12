import { useEffect, useState } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  type SelectChangeEvent,
} from "@mui/material";
import { EventStatus, type EventFilters } from "../types/event.types";
import { fetchLocations } from "../api/eventApi";

interface FilterPanelProps {
  filters: EventFilters;
  onChange: (filters: EventFilters) => void;
}

export function FilterPanel({ filters, onChange }: FilterPanelProps) {
  const [locations, setLocations] = useState<string[]>([]);

  useEffect(() => {
    void fetchLocations().then(setLocations);
  }, []);

  const handleStatusChange = (event: SelectChangeEvent) => {
    const value = event.target.value;
    onChange({
      ...filters,
      status: value === "" ? undefined : (value as EventStatus),
    });
  };

  const handleLocationChange = (event: SelectChangeEvent) => {
    const value = event.target.value;
    onChange({ ...filters, location: value === "" ? undefined : value });
  };

  return (
    <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
      <FormControl size="small" sx={{ minWidth: 160 }}>
        <InputLabel id="status-filter-label">Státusz</InputLabel>
        <Select
          labelId="status-filter-label"
          label="Státusz"
          value={filters.status ?? ""}
          onChange={handleStatusChange}
        >
          <MenuItem value="">Összes</MenuItem>
          <MenuItem value={EventStatus.DRAFT}>Vázlat</MenuItem>
          <MenuItem value={EventStatus.PUBLISHED}>Publikált</MenuItem>
        </Select>
      </FormControl>
      <FormControl size="small" sx={{ minWidth: 200 }}>
        <InputLabel id="location-filter-label">Helyszín</InputLabel>
        <Select
          labelId="location-filter-label"
          label="Helyszín"
          value={filters.location ?? ""}
          onChange={handleLocationChange}
        >
          <MenuItem value="">Összes</MenuItem>
          {locations.map((location) => (
            <MenuItem key={location} value={location}>
              {location}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}
