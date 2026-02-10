"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const REMINDER_KEY = "reminderSettings";

interface ReminderSettingsData {
  enabled: boolean;
  time: string; // HH:MM
  dailyReminder: boolean;
  riskAlert: boolean;
  weeklySummary: boolean;
}

const DEFAULT_SETTINGS: ReminderSettingsData = {
  enabled: false,
  time: "08:00",
  dailyReminder: true,
  riskAlert: true,
  weeklySummary: true,
};

function loadSettings(): ReminderSettingsData {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(REMINDER_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function saveSettings(s: ReminderSettingsData) {
  if (typeof window === "undefined") return;
  localStorage.setItem(REMINDER_KEY, JSON.stringify(s));
}

function isAndroid() {
  return typeof navigator !== "undefined" && /Android/i.test(navigator.userAgent);
}

function isIOS() {
  if (typeof navigator === "undefined") return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.userAgent.includes("Mac") && "ontouchend" in document)
  );
}

export function ReminderSettings() {
  const [settings, setSettings] = useState<ReminderSettingsData>(DEFAULT_SETTINGS);
  const [permissionState, setPermissionState] = useState<
    NotificationPermission | "unsupported" | "prompt"
  >("default");
  const [checking, setChecking] = useState(false);

  const syncPermissionState = useCallback(() => {
    if (!("Notification" in window)) {
      setPermissionState("unsupported");
      return;
    }

    // Use Permissions API for real-time status, with Notification API fallback
    if ("permissions" in navigator) {
      navigator.permissions
        .query({ name: "notifications" })
        .then((status) => {
          setPermissionState(status.state as NotificationPermission);
          // Auto-update when the user changes permission in browser/OS settings
          status.onchange = () => {
            setPermissionState(status.state as NotificationPermission);
          };
        })
        .catch(() => {
          setPermissionState(Notification.permission);
        });
    } else {
      setPermissionState(Notification.permission);
    }
  }, []);

  useEffect(() => {
    setSettings(loadSettings());
    syncPermissionState();
  }, [syncPermissionState]);

  const updateSetting = <K extends keyof ReminderSettingsData>(
    key: K,
    value: ReminderSettingsData[K]
  ) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    saveSettings(next);
  };

  const requestPermission = async () => {
    if (!("Notification" in window)) return;
    const result = await Notification.requestPermission();
    setPermissionState(result);
    if (result === "granted") {
      updateSetting("enabled", true);
      // Send a test notification
      if ("serviceWorker" in navigator) {
        const reg = await navigator.serviceWorker.ready;
        reg.showNotification("Attendance Planner", {
          body: "Reminders are now active! We'll help you stay on track.",
          icon: "/icons/icon-192.png",
          badge: "/icons/icon-192.png",
        });
      }
    }
  };

  const handleRecheck = async () => {
    setChecking(true);
    try {
      if (!("Notification" in window)) {
        setPermissionState("unsupported");
        toast.error("Notifications are not supported in this browser.");
        return;
      }

      // Try requesting permission again — on some browsers this will re-prompt
      // if the user has reset the permission via site settings.
      // On others it will immediately return the current state.
      const result = await Notification.requestPermission();
      setPermissionState(result);

      if (result === "granted") {
        toast.success("Notifications are now enabled!");
        updateSetting("enabled", true);
      } else if (result === "denied") {
        // Still denied — also sync with Permissions API in case there's a difference
        syncPermissionState();
        toast.error(
          "Still blocked. Please follow the steps below to enable notifications."
        );
      } else {
        // "default" / "prompt" — permission was reset, show enable button
        toast.info('Permission was reset. Tap "Enable Notifications" to allow.');
      }
    } finally {
      setChecking(false);
    }
  };

  const isSupported = permissionState !== "unsupported";
  const isDenied = permissionState === "denied";
  const isDefault =
    permissionState === "default" || permissionState === "prompt";
  const isGranted = permissionState === "granted";

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Reminders</h2>

      {!isSupported && (
        <p className="text-sm text-muted-foreground">
          Notifications are not supported in this browser.
        </p>
      )}

      {isSupported && isDenied && (
        <div className="space-y-3">
          <p className="text-sm text-red-500">
            Notifications are blocked for this site.
          </p>

          <div className="rounded-lg border border-border bg-muted/50 p-3 text-sm text-muted-foreground space-y-1.5">
            <p className="font-medium text-foreground">How to enable:</p>
            {isAndroid() ? (
              <ol className="list-decimal list-inside space-y-1">
                <li>Tap the lock/tune icon in Chrome&apos;s address bar</li>
                <li>Tap &quot;Permissions&quot; or &quot;Site settings&quot;</li>
                <li>Set Notifications to &quot;Allow&quot;</li>
                <li>Come back and tap Re-check below</li>
              </ol>
            ) : isIOS() ? (
              <p>
                iOS Safari does not support web notifications. Try using Chrome
                on Android or a desktop browser.
              </p>
            ) : (
              <ol className="list-decimal list-inside space-y-1">
                <li>Click the lock/info icon in the address bar</li>
                <li>Find &quot;Notifications&quot; and set it to &quot;Allow&quot;</li>
                <li>Come back and click Re-check below</li>
              </ol>
            )}
          </div>

          <Button
            onClick={handleRecheck}
            className="w-full gap-2"
            variant="outline"
            size="sm"
            disabled={checking}
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${checking ? "animate-spin" : ""}`}
            />
            {checking ? "Checking..." : "Re-check Permission"}
          </Button>
        </div>
      )}

      {isSupported && isDefault && (
        <Button
          onClick={requestPermission}
          className="w-full gap-2"
          variant="outline"
        >
          <Bell className="h-4 w-4" />
          Enable Notifications
        </Button>
      )}

      {isSupported && isGranted && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {settings.enabled ? (
                <Bell className="h-4 w-4 text-indigo-500" />
              ) : (
                <BellOff className="h-4 w-4 text-muted-foreground" />
              )}
              <Label className="text-sm">Reminders Active</Label>
            </div>
            <Switch
              checked={settings.enabled}
              onCheckedChange={(v) => updateSetting("enabled", v)}
            />
          </div>

          {settings.enabled && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="reminderTime" className="text-sm">
                  Reminder Time
                </Label>
                <Input
                  id="reminderTime"
                  type="time"
                  value={settings.time}
                  onChange={(e) => updateSetting("time", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Daily Class Reminder</Label>
                  <Switch
                    checked={settings.dailyReminder}
                    onCheckedChange={(v) =>
                      updateSetting("dailyReminder", v)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Risk Alerts</Label>
                  <Switch
                    checked={settings.riskAlert}
                    onCheckedChange={(v) => updateSetting("riskAlert", v)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Weekly Summary</Label>
                  <Switch
                    checked={settings.weeklySummary}
                    onCheckedChange={(v) =>
                      updateSetting("weeklySummary", v)
                    }
                  />
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
