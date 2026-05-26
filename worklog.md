---
Task ID: 1
Agent: Main Agent
Task: Add Firebase Firestore to Registro Presenze for per-user data persistence

Work Log:
- Read current index.html from GitHub (live version)
- Added Firebase Firestore SDK (firebase-firestore-compat.js CDN)
- Implemented per-user data storage in Firestore (collection: users/{uid})
- Added dateData structure for per-date attendance tracking
- Added Firestore save with 1-second debounce to avoid excessive writes
- Added Firestore load on user login (overwrites localStorage with cloud data)
- Added sync status bar UI (saving/synced/error indicators)
- Added offline persistence support via Firestore enablePersistence()
- Fixed date navigation to properly save/load per-date data
- Pushed updated file to GitHub Pages successfully
- Verified site is live with Firestore script included

Stage Summary:
- Firebase Firestore integration complete
- Each Google account now has its own data synced across devices
- Site live at https://lorenzoseppone-collabzeppo.github.io/registro-presenze/
- User still needs to: 1) Add domain to Firebase authorized domains, 2) Set up Firestore security rules
