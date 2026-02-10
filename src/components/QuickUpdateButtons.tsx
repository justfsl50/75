"use client";

import { Button } from "@/components/ui/button";
import { Check, X, RotateCcw } from "lucide-react";

interface QuickUpdateButtonsProps {
  onPresent: () => void;
  onAbsent: () => void;
  onReset: () => void;
}

export function QuickUpdateButtons({ onPresent, onAbsent, onReset }: QuickUpdateButtonsProps) {
  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold text-foreground">Quick Update</h2>
      <div className="flex gap-2">
        <Button
          onClick={onPresent}
          className="flex-1 gap-2 bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700"
        >
          <Check className="h-4 w-4" />
          Present Today
        </Button>
        <Button
          onClick={onAbsent}
          variant="destructive"
          className="flex-1 gap-2"
        >
          <X className="h-4 w-4" />
          Absent Today
        </Button>
        <Button onClick={onReset} variant="outline" size="icon" title="Reset all data">
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
