// src/components/Sidebar.tsx
"use client";

import { useDashboardStore } from '../lib/store';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Trash2 } from "lucide-react"; // Icon for deletion

export function Sidebar() {
  // Connect to the store to get the current list of polygons and the delete action
  const polygons = useDashboardStore((state) => state.polygons);
  const removePolygon = useDashboardStore((state) => state.removePolygon);

  return (
    <Card className="h-full bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-xl text-white">Analysis Zones</CardTitle>
      </CardHeader>
      <CardContent>
        {polygons.length === 0 ? (
          <p className="text-slate-400">
            No polygons drawn yet. Use the draw tool on the map to create one.
          </p>
        ) : (
          <ul className="space-y-3">
            {polygons.map((polygon) => (
              <li
                key={polygon.id}
                className="flex items-center justify-between p-2 bg-slate-700 rounded-md"
              >
                <span className="font-medium text-slate-100">{polygon.name}</span>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => removePolygon(polygon.id)}
                  aria-label={`Delete ${polygon.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}