# Supabase Setup Guide

## 1. Create Supabase project

1. Create a project in Supabase.
2. Wait for DB provisioning.
3. Copy Postgres pooler URL.

## 2. Configure env

Set in `.env`:

- `DATABASE_URL`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## 3. Install and push schema

1. `pnpm install`
2. `pnpm --filter @workspace/db run push`

## 4. Enable auth providers

In Supabase dashboard:

1. Go to `Authentication -> Providers`.
2. Enable `Email`.
3. Enable `GitHub` and set OAuth app credentials.
4. Set Site URL: `http://localhost:5173`
5. Add redirect URL: `http://localhost:5173/auth/callback`

## 5. Run app

1. API: `pnpm --filter @workspace/api-server run dev`
2. Frontend: `pnpm --filter @workspace/vulnguard run dev`

## 6. New auth pages

- `/login` -> GitHub, password, magic link
- `/signup` -> email/password + verification
- `/auth/callback` -> OAuth and magic link callback

## 7. Team and profile

- `/profile` supports editing name/email/photo.
- `/teams` supports create, invite, role updates.
- Header includes team switcher dropdown.
