"use client";

import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AttendanceData } from "@/lib/attendanceMath";
import { validateInputs } from "@/lib/attendanceMath";

interface AttendanceFormProps {
  data: AttendanceData;
  onChange: (data: AttendanceData) => void;
}

export function AttendanceForm({ data, onChange }: AttendanceFormProps) {
  const errors = validateInputs(data.A, data.T, data.R, data.target);
  const errorMap = Object.fromEntries(errors.map((e) => [e.field, e.message]));

  const handleChange = useCallback(
    (field: keyof AttendanceData, value: string) => {
      const num = value === "" ? 0 : parseInt(value, 10);
      if (isNaN(num)) return;
      onChange({ ...data, [field]: Math.max(0, num) });
    },
    [data, onChange]
  );

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Your Attendance</h2>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="totalClasses" className="text-sm font-medium">
            Total Classes Held
          </Label>
          <Input
            id="totalClasses"
            type="number"
            min={0}
            inputMode="numeric"
            value={data.T || ""}
            placeholder="0"
            onChange={(e) => handleChange("T", e.target.value)}
            className={errorMap.T ? "border-red-500" : ""}
          />
          {errorMap.T && <p className="text-xs text-red-500">{errorMap.T}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="attended" className="text-sm font-medium">
            Classes Attended
          </Label>
          <Input
            id="attended"
            type="number"
            min={0}
            inputMode="numeric"
            value={data.A || ""}
            placeholder="0"
            onChange={(e) => handleChange("A", e.target.value)}
            className={errorMap.A ? "border-red-500" : ""}
          />
          {errorMap.A && <p className="text-xs text-red-500">{errorMap.A}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="remaining" className="text-sm font-medium">
            Remaining Classes
          </Label>
          <Input
            id="remaining"
            type="number"
            min={0}
            inputMode="numeric"
            value={data.R || ""}
            placeholder="0"
            onChange={(e) => handleChange("R", e.target.value)}
            className={errorMap.R ? "border-red-500" : ""}
          />
          {errorMap.R && <p className="text-xs text-red-500">{errorMap.R}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="target" className="text-sm font-medium">
            Target %
          </Label>
          <Input
            id="target"
            type="number"
            min={1}
            max={100}
            inputMode="numeric"
            value={data.target || ""}
            placeholder="75"
            onChange={(e) => handleChange("target", e.target.value)}
            className={errorMap.target ? "border-red-500" : ""}
          />
          {errorMap.target && <p className="text-xs text-red-500">{errorMap.target}</p>}
        </div>
      </div>
    </div>
  );
}
