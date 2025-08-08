// src/lib/store.ts
import { create } from 'zustand';
import { produce } from 'immer'; // For safe and easy state updates
import { nanoid } from 'nanoid';
import { subDays } from 'date-fns';
// Rule for coloring a polygon (e.g., "if temp > 25, color is red")
export type ColorRule = {
  id: string; // A unique ID for the rule
  field: string; // The data field to check (e.g., "temperature_2m")
  operator: '>' | '<' | '>=' | '<=' | '==';
  value: number;
  color: string; // e.g., "#FF0000"
};

// Represents a single polygon drawn on the map
export type Polygon = {
  id: string; // A unique ID for the polygon
  name: string; // User-defined name like "My Neighborhood"
  points: [number, number][]; // Array of [lat, lng] coordinates
  dataSource: string; // The API source it's linked to (e.g., "Open-Meteo")
  colorRules: ColorRule[]; // The specific rules for this polygon
  currentValue?: number; // The latest fetched value (e.g., 26)
  currentColor?: string; // The color based on the current value and rules
};
// ... (paste the type definitions from step 2 here) ...

export type DashboardActions = {
  setSelectedHour: (hour: Date) => void;
  addPolygon: (points: [number, number][]) => void;
  removePolygon: (polygonId: string) => void;
  // We will add more actions later (updateName, addRule, etc.)
};

// Create the store by combining the state and actions
export const useDashboardStore = create<DashboardState & DashboardActions>((set) => ({
  selectedHour: new Date(), // Default to the current hour
  polygons: [], // Start with no polygons

  setSelectedHour: (hour) => set({ selectedHour: hour }),

  addPolygon: (points) =>
    set(
      produce((draft: DashboardState) => {
        const newPolygon: Polygon = {
          id: nanoid(), // e.g., 'V1StGXR8_Z5jdHi6B-myT'
          name: `Polygon ${draft.polygons.length + 1}`,
          points: points,
          dataSource: 'Open-Meteo', // Default data source
          colorRules: [], // Starts with no rules
        };
        draft.polygons.push(newPolygon);
      })
    ),
  
  removePolygon: (polygonId) =>
    set(
      produce((draft: DashboardState) => {
        draft.polygons = draft.polygons.filter((p) => p.id !== polygonId);
      })
    ),
}));

// This is the main shape of our entire application's state
export type DashboardState = {
  selectedHour: Date;
  polygons: Polygon[];
  // We will add functions to modify this state below
};