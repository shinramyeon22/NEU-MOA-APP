# GAS to React + Firebase Migration Plan

## 1. Project Stack
- **Runtime:** Bun
- **Frontend:** React (JavaScript)
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router DOM
- **Backend:** Firebase (Auth, Firestore)
- **Charts:** Chart.js with react-chartjs-2

## 2. Directory Structure
```text
/
├── .docs/              # Project context and documentation
├── .env                # Environment variables (Firebase config)
├── src/
│   ├── components/     # Reusable UI components
│   ├── context/        # Auth and Data contexts
│   ├── hooks/          # Custom React hooks
│   ├── pages/          # Page components (Dashboard, MOAList, etc.)
│   ├── services/       # Firebase and API services
│   ├── utils/          # Formatting and validation utilities
│   ├── App.jsx         # Main routing and layout
│   └── firebase.js     # Firebase initialization
└── ...
```

## 3. Core Logic Migration
- **Auth:** Migrate Google Identity Services to Firebase Auth (Google Provider) with `@neu.edu.ph` domain restriction.
- **Data:** Replace Google Sheets with Firestore collections: `moas`, `users`, `audit_logs`, `colleges`.
- **Authorization:** Implement role-based access control (RBAC) via Firestore Security Rules and React Context.
- **Analytics:** Port Google Apps Script dashboard logic to client-side Firestore queries and Chart.js.