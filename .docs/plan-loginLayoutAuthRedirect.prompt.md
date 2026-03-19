## Plan: Fix Login Layout + Auth Redirect Middleware

Align the React Login page to the legacy centered hero design (matching `.agent/expected.png` and `.toMigrate/index.html`), and add a router-level auth/role guard (“middleware”) that supports role-based post-login redirects (Admin/Faculty → dashboard, Student → MOA list) and safe protection for all private routes.

**Steps**
1. Confirm baseline behaviors (no code changes yet):
   - Use `.toMigrate/index.html` as the source of truth for Login layout: top nav with logo + NEUMOA label, centered hero headline/description, centered sign-in section.
   - Redirect behavior: role-based default landing (Admin/Faculty → `/dashboard`, Student → `/moas`) unless the user was originally trying to visit another route.
2. Add route-guard components (auth “middleware”) (*blocks step 3–4*):
   - Create a small wrapper component (e.g., `src/components/RequireAuth.jsx`) that:
     - Reads auth state from `useAuth()` (`user`, `loading`).
     - While `loading` is true, renders nothing (or a minimal skeleton).
     - If no `user`, redirects to `/login` using `<Navigate>` with `replace` and `state={{ from: location }}`.
   - Create an admin/role guard (e.g., `src/components/RequireRole.jsx` or `RequireAdmin.jsx`) that:
     - Requires authenticated user first.
     - Enforces `user.role === 'Admin'` (keep current behavior for UserManagement/AuditTrail).
     - Redirects unauthorized users to `/dashboard`.
3. Wire guards into routing (*depends on step 2*):
   - Update `src/App.jsx` routes so protected pages are wrapped:
     - `/dashboard`, `/moas` → RequireAuth
     - `/users`, `/audit` → RequireAdmin/RequireRole
   - Keep `/login` public.
   - Adjust the catch-all route so unauthenticated users don’t bounce unnecessarily (optional): use a single “root redirect” component that sends authed users to `/dashboard` and unauthenticated to `/login`.
4. Implement role-based post-login redirect (*depends on step 2–3*):
   - Update `src/pages/Login.jsx` to read `location.state?.from` and compute the post-login destination:
     - If `from` exists and is allowed for the user’s role, redirect back to it.
     - Else redirect to role default:
       - Admin/Faculty/canMaintain → `/dashboard`
       - Student → `/moas`
   - Ensure redirect uses `replace` to avoid back-navigation to `/login`.
5. Fix Login page layout to match expected hero design (*parallel with step 2–4*):
   - Refactor `src/pages/Login.jsx` markup/classes to match `.toMigrate/index.html` structure:
     - Add top nav bar (`bg-black/30 backdrop-blur-md border-b border-white/10`) with small logo (`w-10 h-10`) and title.
     - Make hero content centered: `flex-1 flex items-center justify-center px-6 py-12 text-center`.
     - Use the same heading/typography hierarchy from legacy (headline with purple-highlighted words, supporting paragraph, then sign-in area).
     - Keep Firebase `signInWithPopup` login handler, but style the button to visually match expected (centered, “Verifying…” spinner section, helper text).
   - Update `src/index.css` `.hero-bg` gradient values and behavior to match legacy if needed (overlay opacity and `background-position`).
6. Patch MOAList crash risk explicitly (defense-in-depth) (*parallel with step 3*):
   - In `src/pages/MOAList.jsx`, add `const { user, logout, loading: authLoading } = useAuth();` and guard:
     - If `authLoading` return null; if no `user`, return `<Navigate to="/login" />`.
   - This ensures the page doesn’t throw even if routed incorrectly.

**Relevant files**
- `src/pages/Login.jsx` — adjust layout to match expected; add redirect destination logic based on `location.state.from` and role defaults.
- `src/context/AuthContext.jsx` — source of truth for `user`, `loading`, `error` (likely no changes needed; ensure consumers use `loading`).
- `src/App.jsx` — implement router-level auth/role guards (“middleware”) by wrapping protected routes.
- `src/pages/MOAList.jsx` — add authLoading/user guards to prevent `user.role` null crashes.
- `src/index.css` — ensure `.hero-bg` matches legacy/expected look.
- `.toMigrate/index.html` — reference for expected hero layout and class structure.
- `.agent/expected.png`, `.agent/actual.png` — visual verification targets.

**Verification**
1. Run the app (`bun run dev`).
2. Unauthenticated navigation checks:
   - Open `/moas` directly → redirected to `/login`.
   - After login as Student → redirected to `/moas` (or back to `from` if present).
   - Open `/users` directly unauthenticated → `/login`; authenticate as non-admin → redirected to `/dashboard`.
3. Visual check:
   - Compare `/login` to `.agent/expected.png` for alignment, spacing, centered text, and sign-in area placement.
4. Regression check:
   - Login with a non-`@neu.edu.ph` account → sees error and remains on login.
   - Blocked user → sees error and is signed out.

**Decisions**
- Login design target is the legacy centered hero (matches expected.png).
- Redirect policy is role-based by default, with “return-to” (`from`) support when a route guard sent the user to `/login`.
- Auth persistence remains Firebase default (local persistence).

**Further Considerations**
1. Allowed-route validation: if a Student is redirected back to an Admin-only `from` route, clamp to `/moas` to avoid loops.
2. Optional: consolidate repeated sidebar/header markup later; not required for this fix.
