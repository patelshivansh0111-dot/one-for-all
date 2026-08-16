"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { apiDelete, apiPatch } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function SettingsPage() {
  const { logout } = useAuth();
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [profilePublic, setProfilePublic] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const saveMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => apiPatch("/users/me/settings", data),
    onSuccess: () => toast.success("Settings saved"),
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiDelete("/users/me"),
    onSuccess: () => {
      toast.success("Account deleted");
      logout();
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <header>
        <p className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground">SETTINGS</p>
        <h1 className="mt-2 font-serif text-4xl tracking-tight">Your preferences</h1>
      </header>

      <section className="editorial-card p-6">
        <h2 className="font-mono text-[11px] tracking-[0.14em]">PRIVACY</h2>
        <div className="mt-4 flex items-center justify-between gap-4">
          <div>
            <Label htmlFor="public-profile" className="font-medium">
              Public profile
            </Label>
            <p className="text-sm text-muted-foreground">Allow others to find and view your profile</p>
          </div>
          <Switch id="public-profile" checked={profilePublic} onCheckedChange={setProfilePublic} />
        </div>
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => saveMutation.mutate({ profilePublic })}
          disabled={saveMutation.isPending}
        >
          Save privacy
        </Button>
      </section>

      <section className="editorial-card p-6">
        <h2 className="font-mono text-[11px] tracking-[0.14em]">NOTIFICATIONS</h2>
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="email-notifs">Email notifications</Label>
            <Switch id="email-notifs" checked={emailNotifs} onCheckedChange={setEmailNotifs} />
          </div>
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="push-notifs">Push notifications</Label>
            <Switch id="push-notifs" checked={pushNotifs} onCheckedChange={setPushNotifs} />
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => saveMutation.mutate({ emailNotifications: emailNotifs, pushNotifications: pushNotifs })}
          disabled={saveMutation.isPending}
        >
          Save notifications
        </Button>
      </section>

      <section className="editorial-card border-accent-pink p-6">
        <h2 className="font-mono text-[11px] tracking-[0.14em] text-accent-pink">DELETE ACCOUNT</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Permanently delete your account and all associated data. This cannot be undone.
        </p>
        {!showDeleteConfirm ? (
          <Button variant="outline" size="sm" className="mt-4 border-accent-pink text-accent-pink" onClick={() => setShowDeleteConfirm(true)}>
            Delete account
          </Button>
        ) : (
          <div className="mt-4 flex flex-wrap gap-3">
            <Button
              variant="pink"
              size="sm"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting…" : "Yes, delete my account"}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
