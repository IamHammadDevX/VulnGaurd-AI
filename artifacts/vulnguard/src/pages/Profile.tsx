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
        <div className="max-w-sm rounded-[32px] border border-zinc-800 bg-[linear-gradient(180deg,rgba(24,24,27,0.78),rgba(9,9,11,0.72))] p-8 text-center">
          <User className="mx-auto h-12 w-12 text-zinc-200" />
          <h2 className="mt-4 text-2xl font-semibold text-zinc-50">Sign in to view your profile</h2>
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
        <div className="rounded-[32px] border border-zinc-800/80 bg-[linear-gradient(180deg,rgba(24,24,27,0.78),rgba(9,9,11,0.72))] p-6 shadow-[0_32px_100px_-58px_rgba(0,0,0,1)] backdrop-blur-2xl sm:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">Identity summary</p>
          <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center">
            {user?.profileImageUrl ? (
              <img src={user.profileImageUrl} alt="" className="h-24 w-24 rounded-[28px] border border-zinc-800 object-cover" />
            ) : (
              <div className="grid h-24 w-24 place-items-center rounded-[28px] border border-zinc-800 bg-zinc-950 text-zinc-100">
                <User className="h-10 w-10" />
              </div>
            )}
            <div className="min-w-0">
              <h1 className="text-3xl font-semibold tracking-tight text-zinc-50">
                {user?.firstName ?? "Security"} {user?.lastName ?? "Operator"}
              </h1>
              <p className="mt-2 inline-flex max-w-full items-start gap-2 break-all text-sm text-zinc-400">
                <Mail className="h-4 w-4" />
                {user?.email ?? "No email"}
              </p>
            </div>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-zinc-800 bg-white/[0.03] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">Scans run</p>
              <p className="mt-2 text-2xl font-semibold text-zinc-50">{profile?.totalScans ?? 0}</p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-white/[0.03] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">Member since</p>
              <p className="mt-2 text-lg font-semibold text-zinc-100">
                {profile?.createdAt
                  ? new Date(profile.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
                  : "--"}
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-white/[0.03] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">Plan</p>
              <p className="mt-2 text-lg font-semibold text-emerald-300">Free tier</p>
            </div>
          </div>
        </div>

        <div className="rounded-[32px] border border-zinc-800/80 bg-[linear-gradient(180deg,rgba(24,24,27,0.78),rgba(9,9,11,0.72))] p-6 shadow-[0_32px_100px_-58px_rgba(0,0,0,1)] backdrop-blur-2xl sm:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">Access status</p>
          <div className="mt-5 space-y-4">
            <div className="rounded-2xl border border-zinc-800 bg-white/[0.03] p-4">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl border border-zinc-800 bg-zinc-950 text-emerald-300">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-base font-semibold text-zinc-50">Subscription status</p>
                  <p className="text-sm text-zinc-400">Free plan with secure account access enabled.</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-white/[0.03] p-4">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl border border-zinc-800 bg-zinc-950 text-zinc-100">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-base font-semibold text-zinc-50">Account lifecycle</p>
                  <p className="text-sm text-zinc-400">Keep email and identity data current for team invites and reports.</p>
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

      <section className="rounded-[32px] border border-zinc-800/80 bg-[linear-gradient(180deg,rgba(24,24,27,0.78),rgba(9,9,11,0.72))] p-6 shadow-[0_32px_100px_-58px_rgba(0,0,0,1)] backdrop-blur-2xl sm:p-8">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl border border-zinc-800 bg-zinc-950 text-zinc-100">
            <FileCode className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">Edit profile</p>
            <h2 className="text-xl font-semibold text-zinc-50">Update account details</h2>
          </div>
        </div>

        {status && (
          <p className="mt-5 rounded-2xl border border-zinc-800 bg-white/[0.03] px-4 py-3 text-sm text-zinc-300">
            {status}
          </p>
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-zinc-400">First name</label>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-zinc-800 bg-white/[0.03] px-4 py-3 text-sm text-zinc-100 outline-none transition-colors placeholder:text-zinc-600 focus:border-emerald-500/30"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-400">Last name</label>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-zinc-800 bg-white/[0.03] px-4 py-3 text-sm text-zinc-100 outline-none transition-colors placeholder:text-zinc-600 focus:border-emerald-500/30"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-medium text-zinc-400">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-zinc-800 bg-white/[0.03] px-4 py-3 text-sm text-zinc-100 outline-none transition-colors placeholder:text-zinc-600 focus:border-emerald-500/30"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-medium text-zinc-400">Profile image URL</label>
            <input
              value={profileImageUrl}
              onChange={(e) => setProfileImageUrl(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-zinc-800 bg-white/[0.03] px-4 py-3 text-sm text-zinc-100 outline-none transition-colors placeholder:text-zinc-600 focus:border-emerald-500/30"
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
