"use client";

import { useDashboardStore } from "../lib/store";
import { Slider } from "../components/ui/slider"
import { format } from "date-fns";
import { useMemo } from "react";

export function TimelineSlider() {
  const { 
    timeWindow, 
    selectedTime, 
    setSelectedTime,
    isRangeMode 
  } = useDashboardStore();

  // Memoize calculations to prevent re-running on every render
  const { totalHours, currentHourOffset } = useMemo(() => {
    const start = timeWindow.start.getTime();
    const end = timeWindow.end.getTime();
    
    // Total hours in our 30-day window
    const totalDurationMs = end - start;
    const totalHours = Math.round(totalDurationMs / (1000 * 60 * 60));

    // Calculate the current slider position based on selectedTime
    let currentHourOffset = 0;
    if (!isRangeMode && selectedTime instanceof Date) {
        const selectedMs = selectedTime.getTime() - start;
        currentHourOffset = Math.round(selectedMs / (1000 * 60 * 60));
    }
    // Note: We will handle the range mode slider logic later

    return { totalHours, currentHourOffset };
  }, [timeWindow, selectedTime, isRangeMode]);

  const handleSliderChange = (value: number[]) => {
    const hoursFromStart = value[0];
    const newSelectedDate = new Date(timeWindow.start.getTime() + hoursFromStart * 60 * 60 * 1000);
    setSelectedTime(newSelectedDate);
  };
  
  // Format the displayed date string
  const displayDate = useMemo(() => {
    if (selectedTime instanceof Date) {
      return format(selectedTime, "eee, MMM d, yyyy HH:00'h'");
    }
    // Note: We'll add range display logic later
    return "Time Range";
  }, [selectedTime]);

  return (
    <div className="w-full px-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-slate-300">Timeline</span>
        <span className="text-sm font-semibold text-purple-400 bg-purple-900/50 px-2 py-1 rounded">
            {displayDate}
        </span>
      </div>
      <Slider
        min={0}
        max={totalHours}
        step={1} // Move one hour at a time
        value={[currentHourOffset]}
        onValueChange={handleSliderChange}
        disabled={isRangeMode} // We'll enable a different slider for range mode
      />
      <div className="flex justify-between text-xs text-slate-500 mt-1">
        <span>{format(timeWindow.start, "MMM d")}</span>
        <span>{format(timeWindow.end, "MMM d")}</span>
      </div>
    </div>
  );
}