import { create } from 'zustand';
import { produce } from 'immer';
import { nanoid } from 'nanoid';
import { subDays, addDays } from 'date-fns';

// --- TYPE DEFINITIONS ---
// (These are the types you already defined, which are perfect)
export type ColorRule = {
  id: string;
  field: string;
  operator: '>' | '<' | '>=' | '<=' | '==';
  value: number;
  color: string;
};

export type Polygon = {
  id: string;
  name: string;
  points: [number, number][];
  dataSource: string;
  colorRules: ColorRule[];
  currentValue?: number;
  currentColor?: string;
};

// --- STATE SHAPE ---
// This defines all the data our dashboard will track.
export type DashboardState = {
  polygons: Polygon[];
  // Time window: 15 days in the past to 15 days in the future
  timeWindow: {
    start: Date;
    end: Date;
  };
  // The user's current selection on the timeline
  selectedTime: Date | { start: Date; end: Date }; 
  isRangeMode: boolean; // Toggles between single point and range slider
};

// --- ACTIONS ---
// These are the functions that can modify our state.
export type DashboardActions = {
  addPolygon: (points: [number, number][]) => void;
  removePolygon: (polygonId: string) => void;
  setSelectedTime: (time: Date) => void;
  setSelectedTimeRange: (range: { start: Date; end: Date }) => void;
  toggleMode: () => void;
  // We will add more actions later (updateName, addRule, etc.)
};


// --- STORE CREATION ---
// This is where we put it all together.

const thirtyDaysAgo = subDays(new Date(), 15);
const thirtyDaysFromNow = addDays(new Date(), 15);

export const useDashboardStore = create<DashboardState & DashboardActions>((set) => ({
  // Initial State
  polygons: [],
  timeWindow: {
    start: thirtyDaysAgo,
    end: thirtyDaysFromNow,
  },
  selectedTime: new Date(), // Default to the current time
  isRangeMode: false, // Start in single point mode

  // Actions
  addPolygon: (points) =>
    set(
      produce((draft: DashboardState) => {
        const newPolygon: Polygon = {
          id: nanoid(),
          name: `Analysis Zone ${draft.polygons.length + 1}`,
          points: points,
          dataSource: 'Open-Meteo', // Default
          colorRules: [],
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

  setSelectedTime: (time) =>
    set(
      produce((draft: DashboardState) => {
        draft.selectedTime = time;
      })
    ),
  
  setSelectedTimeRange: (range) =>
    set(
      produce((draft: DashboardState) => {
        draft.selectedTime = range;
      })
    ),

  toggleMode: () => set((state) => ({ isRangeMode: !state.isRangeMode })),
}));