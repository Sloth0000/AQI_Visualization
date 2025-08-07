// src/lib/store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// --- TYPE DEFINITIONS ---
// This defines the structure for a single color-coding rule.
export interface ColorRule {
  id: string; // A unique ID for the rule (e.g., using Math.random() or a library)
  operator: '<' | '>' | '≤' | '≥' | '=';
  value: number;
  color: string; // e.g., '#FF0000'
}

// This defines the structure for a single polygon drawn on the map.
export interface PolygonData {
  id: string; // Unique ID for the polygon
  points: [number, number][]; // Array of [lat, lng] coordinates
  dataSourceId: string; // Which data source this polygon is linked to
  colorRules: ColorRule[]; // The specific rules for this polygon's data source
  label: string; // A user-defined name for the polygon
}

// This defines the complete shape of our global store.
interface AppState {
  polygons: PolygonData[];
  selectedTime: number; // Storing time as a Unix timestamp (milliseconds) for easier slider math
  timeRange: [number, number]; // [startTime, endTime] as timestamps
  activeSlider: 'single' | 'range';
  actions: {
    addPolygon: (newPolygon: Omit<PolygonData, 'id' | 'label'>) => void;
    deletePolygon: (polygonId: string) => void;
    updatePolygonPoints: (polygonId: string, newPoints: [number, number][]) => void;
    setPolygonLabel: (polygonId: string, label: string) => void;
    setSelectedTime: (newTime: number) => void;
    setTimeRange: (newRange: [number, number]) => void;
    setActiveSlider: (mode: 'single' | 'range') => void;
    setPolygonRules: (polygonId: string, rules: ColorRule[]) => void;
  };
}

// --- ZUSTAND STORE CREATION ---
export const useAppStore = create<AppState>()(
  // The 'persist' middleware automatically saves the store's state to localStorage!
  // This means your polygons and settings will still be there after a page refresh.
  persist(
    (set) => ({
      // Default initial state
      polygons: [],
      selectedTime: new Date().getTime(), // Defaults to the current time
      timeRange: [new Date().getTime() - 7 * 24 * 60 * 60 * 1000, new Date().getTime()], // Default to last 7 days
      activeSlider: 'single',

      // Actions are functions that modify the state using the 'set' function.
      actions: {
        addPolygon: (newPolygon) =>
          set((state) => ({
            polygons: [
              ...state.polygons,
              {
                ...newPolygon,
                id: `poly_${Date.now()}`, // Generate a simple unique ID
                label: `Polygon ${state.polygons.length + 1}`, // Default label
              },
            ],
          })),
        deletePolygon: (polygonId) =>
          set((state) => ({
            polygons: state.polygons.filter((p) => p.id !== polygonId),
          })),
        updatePolygonPoints: (polygonId, newPoints) =>
          set((state) => ({
            polygons: state.polygons.map((p) =>
              p.id === polygonId ? { ...p, points: newPoints } : p
            ),
          })),
        setPolygonLabel: (polygonId, label) =>
          set((state) => ({
            polygons: state.polygons.map((p) =>
              p.id === polygonId ? { ...p, label } : p
            ),
          })),
        setSelectedTime: (newTime) => set({ selectedTime: newTime }),
        setTimeRange: (newRange) => set({ timeRange: newRange }),
        setActiveSlider: (mode) => set({ activeSlider: mode }),
        setPolygonRules: (polygonId, rules) =>
          set((state) => ({
            polygons: state.polygons.map((p) =>
              p.id === polygonId ? { ...p, colorRules: rules } : p
            ),
          })),
      },
    }),
    {
      name: 'aqi-dashboard-storage', // The key used in localStorage
      // We only want to persist the polygons and their rules, not the selected time.
      partialize: (state) => ({ polygons: state.polygons }),
      // Custom merge function to handle hydration, especially useful for complex state
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...(persistedState as object),
      }),
    }
  )
);

// This is a helper hook to easily access just the actions.
export const useAppActions = () => useAppStore((state) => state.actions);