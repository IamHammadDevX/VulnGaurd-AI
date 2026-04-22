import { useState, useEffect } from "react";
import { useAuth } from "@workspace/replit-auth-web";
import { Calendar, FileCode, LogOut, Mail, Shield, User } from "lucide-react";

interface ProfileData {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  createdAt: string;
  totalScans: number;
}

export default function Profile() {
  const { user, isLoading, isAuthenticated, login, logout, updateProfile } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!isAuthenticated) return;
    fetch("/api/user/profile", { credentials: "include" })
      .then((response) => response.json())
      .then((data) => {
        const next = data.user as ProfileData;
        setProfile(next);
        setFirstName(next?.firstName ?? "");
        setLastName(next?.lastName ?? "");
        setEmail(next?.email ?? "");
        setProfileImageUrl(next?.profileImageUrl ?? "");
      })
      .catch(() => {});
  }, [isAuthenticated]);

  const handleSaveProfile = async () => {
    setStatus("");
    setSaving(true);

    const result = await updateProfile({
      firstName,
      lastName,
      email,
      profileImageUrl,
    });

    setSaving(false);

    if (result.error) {
      setStatus(result.error);
      return;
    }

    setStatus("Profile updated. If you changed email, verify it from your inbox.");
    fetch("/api/user/profile", { credentials: "include" })
      .then((response) => response.json())
      .then((data) => setProfile(data.user))
      .catch(() => null);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-emerald-400/30 border-t-emerald-300" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="app-shell-panel max-w-sm rounded-[32px] p-8 text-center">
          <User className="app-shell-heading mx-auto h-12 w-12" />
          <h2 className="app-shell-heading mt-4 text-2xl font-semibold">Sign in to view your profile</h2>
          <button
            onClick={login}
            className="mt-6 rounded-full border border-emerald-500/30 bg-emerald-500/14 px-5 py-3 text-sm font-semibold text-emerald-200 transition-all hover:-translate-y-0.5"
          >
            Log in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="app-shell-panel rounded-[32px] p-6 sm:p-8">
          <p className="app-shell-muted text-[11px] font-semibold uppercase tracking-[0.24em]">Identity summary</p>
          <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center">
            {user?.profileImageUrl ? (
              <img src={user.profileImageUrl} alt="" className="h-24 w-24 rounded-[28px] border border-border object-cover" />
            ) : (
              <div className="app-shell-inset app-shell-heading grid h-24 w-24 place-items-center rounded-[28px]">
                <User className="h-10 w-10" />
              </div>
            )}
            <div className="min-w-0">
              <h1 className="app-shell-heading text-3xl font-semibold tracking-tight">
                {user?.firstName ?? "Security"} {user?.lastName ?? "Operator"}
              </h1>
              <p className="app-shell-copy mt-2 inline-flex max-w-full items-start gap-2 break-all text-sm">
                <Mail className="h-4 w-4" />
                {user?.email ?? "No email"}
              </p>
            </div>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="app-shell-panel-soft rounded-2xl p-4">
              <p className="app-shell-muted text-[11px] font-semibold uppercase tracking-[0.24em]">Scans run</p>
              <p className="app-shell-heading mt-2 text-2xl font-semibold">{profile?.totalScans ?? 0}</p>
            </div>
            <div className="app-shell-panel-soft rounded-2xl p-4">
              <p className="app-shell-muted text-[11px] font-semibold uppercase tracking-[0.24em]">Member since</p>
              <p className="app-shell-heading mt-2 text-lg font-semibold">
                {profile?.createdAt
                  ? new Date(profile.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
                  : "--"}
              </p>
            </div>
            <div className="app-shell-panel-soft rounded-2xl p-4">
              <p className="app-shell-muted text-[11px] font-semibold uppercase tracking-[0.24em]">Plan</p>
              <p className="mt-2 text-lg font-semibold text-emerald-300">Free tier</p>
            </div>
          </div>
        </div>

        <div className="app-shell-panel rounded-[32px] p-6 sm:p-8">
          <p className="app-shell-muted text-[11px] font-semibold uppercase tracking-[0.24em]">Access status</p>
          <div className="mt-5 space-y-4">
            <div className="app-shell-panel-soft rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="app-shell-inset grid h-11 w-11 place-items-center rounded-2xl text-emerald-300">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <p className="app-shell-heading text-base font-semibold">Subscription status</p>
                  <p className="app-shell-copy text-sm">Free plan with secure account access enabled.</p>
                </div>
              </div>
            </div>
            <div className="app-shell-panel-soft rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="app-shell-inset app-shell-heading grid h-11 w-11 place-items-center rounded-2xl">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="app-shell-heading text-base font-semibold">Account lifecycle</p>
                  <p className="app-shell-copy text-sm">Keep email and identity data current for team invites and reports.</p>
                </div>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-200 transition-all hover:-translate-y-0.5"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </div>
        </div>
      </section>

      <section className="app-shell-panel rounded-[32px] p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <div className="app-shell-inset app-shell-heading grid h-11 w-11 place-items-center rounded-2xl">
            <FileCode className="h-5 w-5" />
          </div>
          <div>
            <p className="app-shell-muted text-[11px] font-semibold uppercase tracking-[0.24em]">Edit profile</p>
            <h2 className="app-shell-heading text-xl font-semibold">Update account details</h2>
          </div>
        </div>

        {status && (
          <p className="app-shell-panel-soft app-shell-copy mt-5 rounded-2xl px-4 py-3 text-sm">
            {status}
          </p>
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="app-shell-copy text-xs font-medium">First name</label>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="app-shell-input mt-2 w-full rounded-2xl px-4 py-3 text-sm outline-none transition-colors focus:border-emerald-500/30"
            />
          </div>
          <div>
            <label className="app-shell-copy text-xs font-medium">Last name</label>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="app-shell-input mt-2 w-full rounded-2xl px-4 py-3 text-sm outline-none transition-colors focus:border-emerald-500/30"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="app-shell-copy text-xs font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="app-shell-input mt-2 w-full rounded-2xl px-4 py-3 text-sm outline-none transition-colors focus:border-emerald-500/30"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="app-shell-copy text-xs font-medium">Profile image URL</label>
            <input
              value={profileImageUrl}
              onChange={(e) => setProfileImageUrl(e.target.value)}
              className="app-shell-input mt-2 w-full rounded-2xl px-4 py-3 text-sm outline-none transition-colors focus:border-emerald-500/30"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="w-full rounded-full border border-emerald-500/30 bg-emerald-500/14 px-5 py-3 text-sm font-semibold text-emerald-200 transition-all hover:-translate-y-0.5 disabled:opacity-50 sm:w-auto"
          >
            {saving ? "Saving..." : "Save profile"}
          </button>
        </div>
      </section>
    </div>
  );
}
