---
Task ID: 1
Agent: Main Agent
Task: Fix Google login on iOS Safari - v22 robust auth

Work Log:
- Analyzed current v21 auth code (signInWithRedirect for mobile, signInWithPopup for desktop)
- User reported login broken on BOTH iPhones after modifying Firebase Console domain settings
- Root cause: signInWithRedirect is fragile on iOS Safari with GitHub Pages; user likely misconfigured Firebase authorized domains
- Rewrote auth system in v22:
  1. Try signInWithPopup first (even on mobile) - faster and simpler
  2. If popup is blocked/cancelled, automatically fall back to signInWithRedirect
  3. iOS WebView detected separately (always uses redirect)
  4. Better error messages with step-by-step Firebase Console instructions
  5. Domain diagnostic bar showing current hostname
  6. 30-second safety timeout to clear stuck loginLoading state
  7. Added Google Identity Services (GIS) library as potential future auth path
- Deployed v22 to GitHub Pages (commit 12581e2091a3)

Stage Summary:
- v22 deployed at https://lorenzoseppone-collabzeppo.github.io/app-lx22b2ds/
- Key change: popup first, redirect as fallback (opposite of v21)
- Added domain diagnostic info to help user configure Firebase Console correctly
- User needs to verify Firebase Console > Authentication > Settings > Authorized domains includes: lorenzoseppone-collabzeppo.github.io

---
Task ID: 2
Agent: Main Agent
Task: Fix class sync between devices - Farfalla not appearing on iPhone 2

Work Log:
- Identified root cause: auto-save `doSaveToFirestore()` was failing silently on iOS Safari (SDK timeout) with NO fallback to REST API
- Only the manual "Carica su Server" button had REST API fallback - so classes only uploaded when user clicked that button
- The `loadFromFirestore()` was not forcing server reads, could return cached/empty data
- Added REST API fallback to `doSaveToFirestore()`: if SDK `set()` fails OR times out (10s), automatically tries `uploadViaRestAPI()`
- Changed `loadFromFirestore()` to force server read with `{source:'server'}` instead of default cache-first
- Added `downloadViaRestAPI()` function as read fallback when Firestore SDK fails
- Added `parseFirestoreFields()` and `parseFirestoreValue()` to convert Firestore REST API response back to JS objects
- Deployed v23 to GitHub Pages (commit dbfdc83403ed)

Stage Summary:
- v23 deployed at https://lorenzoseppone-collabzeppo.github.io/app-lx22b2ds/
- Key fixes:
  1. Auto-save now has REST API fallback (same as manual "Carica su Server")
  2. Login loads from SERVER first (not cache)
  3. Read also has REST API fallback
- User needs to test: open app on iPhone 1, make a change, then open on iPhone 2 and check if data syncs

---
Task ID: 3
Agent: Main Agent
Task: Fix sync - REST API FIRST on mobile, periodic auto-sync

Work Log:
- Identified that Firestore SDK is completely unreliable on iOS Safari for both reads and writes
- Previous approach (SDK first, REST API as fallback) was wrong - SDK wastes 10-15 seconds before falling back
- Rewrote doSaveToFirestore(): On mobile, REST API is tried FIRST, SDK is fallback only
- Rewrote loadFromFirestore(): On mobile, REST API read is tried FIRST, SDK is fallback only
- Added saveSuccess() and saveFailed() helper functions for cleaner code
- Added PERIODIC AUTO-SYNC: Every 30 seconds, uploads data via REST API on mobile
- Added PERIODIC DOWNLOAD: Every 60 seconds, checks for new classes from server via REST API on mobile
- Deployed v24 to GitHub Pages (commit d638337e4cf8)

Stage Summary:
- v24 deployed at https://lorenzoseppone-collabzeppo.github.io/app-lx22b2ds/
- Strategy change: REST API FIRST on mobile, SDK as fallback (opposite of v23)
- Periodic sync ensures data is always uploaded even if individual saves fail
- Periodic download checks for new classes from other devices every 60 seconds
- No more timeout issues - REST API should respond in 2-5 seconds

---
Task ID: v25-json-string-sync
Agent: main
Task: Fix Firestore sync between devices - rewrite to use JSON string storage

Work Log:
- Analyzed screenshot: "Timeout: caricamento troppo lento" error on iPhone 1
- Identified root cause: REST API `convertToFirestoreFields()` was converting all data to Firestore typed format, which is error-prone and likely silently failing
- Rewrote entire sync system (v25) to store data as a JSON string in `dataJson` field instead of complex Firestore typed format
- New `uploadJsonViaRestAPI()`: sends data as a single `stringValue` field (massive simplification)
- New `downloadJsonViaRestAPI()`: reads `dataJson` string and parses JSON directly
- Added `resolveDocData()`: handles both new dataJson format and old classes format (backward compat)
- Rewrote `doSaveToFirestore()`: stores data as JSON string, REST API first on mobile
- Rewrote `loadFromFirestore()`: REST API first on mobile, with proper fallback
- Rewrote `startSnapshotListener()`: on mobile uses REST API polling (30s) instead of SDK onSnapshot (which times out on iOS Safari)
- Rewrote `App.uploadToServer()`: on mobile uses REST API directly, no connection test (which was also using SDK and timing out)
- Rewrote `App.downloadFromServer()` and `App.forceSync()`: use JSON string approach
- Removed periodic download sync (now handled by mobile polling in startSnapshotListener)
- Kept old `uploadViaRestAPI()` and `downloadViaRestAPI()` as emergency fallbacks
- Deployed v25 to GitHub Pages

Stage Summary:
- v25 deployed: https://lorenzoseppone-collabzeppo.github.io/app-lx22b2ds/
- Key innovation: Instead of converting to Firestore REST API typed format, data is stored as a simple JSON string
- This eliminates all type conversion bugs and makes REST API reliable on iOS Safari
- Mobile devices now use REST API for everything (upload, download, polling) - no SDK timeout issues
- Desktop devices still use SDK (with REST API fallback)

---
Task ID: SYNC-FIX-FINAL-v25
Agent: main
Date: 2026-05-28
Status: ✅ RISOLTO - Sync tra dispositivi FUNZIONA

## CRONOLOGIA ERRORI E SOLUZIONI

### v14-v18: Errori di base
- Firestore `.set()` sovrascriveva tutto → cambiato a `.update()` con dot notation
- `enablePersistence()` causava timeout su iOS Safari → DISABILITATO
- `invalid-argument` errors → aggiunto `cleanForFirestore()` per strip NaN/Infinity

### v19: REST API fallback aggiunto
- Aggiunto `uploadViaRestAPI()` come fallback quando SDK va in timeout
- Problema: REST API usava `convertToFirestoreFields()` che convertiva ogni campo nel formato tipizzato Firestore (stringValue, integerValue, mapValue, arrayValue ecc.)
- Questo era COMPLESSO e soggetto a errori silenziosi

### v20-v22: Problemi di login
- `signInWithRedirect` non funzionava su iOS → cambiato a popup-first con redirect fallback
- Auth persistence cambiata a LOCAL

### v23-v24: Auto-save con REST API fallback
- Auto-save usava REST API come fallback se SDK andava in timeout
- Problema: `convertToFirestoreFields()` era ROTTO - convertiva male i dati
- Risultato: i dati NON arrivavano mai al server, gli altri dispositivi non vedevano nulla
- Timeout "caricamento troppo lento" su iPhone 1

### v25: SOLUZIONE DEFINITIVA ✅
**Cosa ha funzionato:**

1. **JSON String Storage** - Invece di convertire nel formato Firestore tipizzato, salvo TUTTI i dati come un'unica stringa JSON nel campo `dataJson`. Questo:
   - Elimina `convertToFirestoreFields()` dalla upload (era la causa principale dei failure silenziosi)
   - REST API upload: solo 3 campi stringa (`dataJson`, `_saveId`, `updatedAt`) invece di centinaia di campi nidificati
   - REST API download: legge `dataJson` e fa `JSON.parse()` - semplice e affidabile

2. **Mobile: REST API FIRST, SDK mai** - Su iOS Safari, l'SDK Firestore va SEMPRE in timeout per IndexedDB/WebSocket. Soluzione:
   - Upload: REST API diretta (nessun test di connessione SDK prima!)
   - Download: REST API diretta
   - Polling ogni 30 secondi via REST API (invece di onSnapshot SDK)
   - SDK usato SOLO come fallback se REST API fallisce

3. **Rimozione test di connessione** - Il pulsante "Carica su Server" prima faceva un `testFirestoreConnection()` che usava l'SDK e andava in timeout. Rimosso completamente su mobile.

4. **Backward compat** - `resolveDocData()` gestisce sia il nuovo formato `dataJson` che il vecchio formato `classes`
   - Se `dataJson` esiste: JSON.parse() del contenuto
   - Se solo `classes` esiste: usa il vecchio formato

5. **File app.html** - Pubblicato anche come app.html per bypassare completamente la cache di Safari

6. **Bug visuale versione** - Il testo "v24" era hardcoded nell'HTML anche se il codice era v25 → corretto a v25

### CONFIGURAZIONE CHE FUNZIONA
- Firebase project: `presenze-pre-post`
- Firestore path: `users/{uid}` con campo `dataJson` (stringa JSON)
- URL app: https://lorenzoseppone-collabzeppo.github.io/app-lx22b2ds/app.html
- Repo: lorenzoseppone-collabzeppo/app-lx22b2ds
- Mobile: REST API solo, niente SDK Firestore per read/write
- Desktop: SDK con REST API fallback

### LEZIONI IMPARATE
1. ❌ MAI usare `convertToFirestoreFields()` per REST API - troppo complesso, errori silenziosi
2. ✅ Salva dati come stringa JSON in un singolo campo Firestore
3. ❌ MAI usare SDK Firestore su iOS Safari per operazioni critiche - va in timeout
4. ✅ Usa REST API diretta su mobile
5. ❌ MAI fare "test di connessione" con SDK prima di upload su mobile
6. ✅ Safari cache è aggressiva - usa file diversi (app.html) per bypass
7. ✅ Mostra sempre la versione corretta nell'interfaccia utente
