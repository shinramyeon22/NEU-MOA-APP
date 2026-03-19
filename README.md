<p align="center">
  <a href="https://gen-lang-client-0632857640.web.app" target="_blank">
    <img src="https://img.shields.io/badge/🚀%20Launch%20NEU%20MOA-View%20Live%20App-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Launch NEU MOA App" height="50"/>
  </a>
</p>

<h1 align="center">NEU MOA (Memoranda of Agreement Tracker)</h1>

<p align="center">
  Single-page application for monitoring, maintaining, and auditing Memoranda of Agreement (MOAs) at New Era University.<br/>
  Built with React, Vite, Firebase Authentication, Firestore, and Tailwind CSS.
  <br/><br/>
  <strong>Live Deployment:</strong> 
  <a href="https://gen-lang-client-0632857640.web.app">https://gen-lang-client-0632857640.web.app</a>
</p>

<br/>

## Features
- Google Sign-in restricted to @neu.edu.ph accounts
- Role-based access (Admin / Maintainer / Viewer)
- Create, view, update, and archive MOAs
- Audit trail / change history logging
- Encrypted environment variables workflow for team collaboration
- Firebase Hosting deployment ready


# NEU MOA (React + Vite + Firebase)

Single-page app for monitoring and maintaining Memoranda of Agreement (MOAs), using:
- React + Vite
- Firebase Auth (Google sign-in)
- Firestore (MOAs, users, audit logs)
- Tailwind CSS (compiled via PostCSS)

## Prereqs

- Bun installed
- OpenSSL installed (for encrypted env workflow)
- Firebase project with:
	- Authentication → Google provider enabled
	- Firestore Database created

## Install

```bash
bun install
```

## Environment variables

This app reads Firebase config from `.env` (Vite variables must start with `VITE_`).

- Example template: `.env.example`
- Local secrets: `.env` (ignored by git)

### Encrypted env in git

We commit an encrypted env file so teammates can decrypt locally:

- Committed: `.env.enc` and `.env.enc.sha256`
- Not committed: `.env`

How it works:
- You type a passphrase in the terminal (never written to disk).
- The scripts encrypt/decrypt with OpenSSL and write an integrity file.

Decrypt committed env into local `.env`:

```bash
./scripts/decrypt-env.sh
```

Note: Decryption will refuse to run if `.env` already exists. Delete/move it first.

Encrypt your current `.env` back into `.env.enc` (and `.env.enc.sha256`):

```bash
./scripts/encrypt-env.sh
```

Security notes:
- `.env` is always ignored.
- `.env.enc.sha256` is an integrity check; decryption will fail if the password is wrong or the file was modified.

## Run locally

```bash
bun run dev
```

## Lint / Build

```bash
bun run lint
bun run build
bun run preview
```

## Firebase configuration checklist

### Authentication

Firebase Console → Authentication:
- Enable Google provider
- Add authorized domains:
	- `localhost` (for local dev)
	- Your hosting domain after deploy (e.g. `YOUR_PROJECT.web.app`)

### Firestore rules

Ensure your deployed Firestore rules allow authenticated `@neu.edu.ph` accounts to:
- Read/write their own `users/{uid}` doc (app creates it on first login)
- Read MOAs (and write if Admin/canMaintain)

### Composite indexes

Some Firestore queries require composite indexes. If you see:
`FirebaseError: The query requires an index`

Click the link in the console and create the suggested index.

## Deploy (Firebase Hosting)

This repo is already initialized for Firebase Hosting via `firebase.json` and `.firebaserc`.

1) Build the SPA:

```bash
bun run build
```

2) Deploy hosting:

```bash
firebase deploy --only hosting
```

3) Post-deploy (required for Google sign-in):

Firebase Console → Authentication → Settings → Authorized domains
- Add the deployed domain (e.g. `YOUR_PROJECT.web.app`)

## Troubleshooting

### Stuck on “Verifying your Google account…”

Usually caused by Firestore permissions preventing the app from reading/creating `users/{uid}`.
Verify:
- You are using the same Firebase project ID in `.env` as the project where rules are deployed.
- Rules allow authenticated users to access `users/{uid}`.
