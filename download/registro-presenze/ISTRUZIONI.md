# REGISTRO PRESENZE - ISTRUZIONI DEPLOY FIREBASE HOSTING

## COSA HAI BISOGNO

- Un computer (Windows, Mac o Linux)
- Node.js installato (scarica da https://nodejs.org)
- Il tuo account Google che ha accesso al progetto Firebase "presenze-pre-post"

---

## PASSO 1: Scarica i file

Scarica la cartella "registro-presenze" che contiene:

```
registro-presenze/
├── firebase.json        <-- configurazione Firebase Hosting
├── .firebaserc          <-- collegamento al progetto Firebase
├── public/
│   └── index.html       <-- IL SITO (questo è il Registro Presenze)
└── ISTRUZIONI.md        <-- questo file
```

L'unico file importante è `public/index.html` - è TUTTO il sito in un solo file.

---

## PASSO 2: Installa Firebase CLI

Apri il terminale (Command Prompt su Windows, Terminal su Mac) e digita:

```bash
npm install -g firebase-tools
```

---

## PASSO 3: Fai login su Firebase

```bash
firebase login
```

Si aprirà il browser per fare login con Google.
Usa lo STESSO account che hai usato per creare il progetto "presenze-pre-post".

---

## PASSO 4: Vai nella cartella del progetto

```bash
cd PERCORSO/DOVE/HAI/MESSO/registro-presenze
```

Esempio su Windows:
```bash
cd C:\Users\TuoNome\Downloads\registro-presenze
```

Esempio su Mac:
```bash
cd ~/Downloads/registro-presenze
```

---

## PASSO 5: Deploy!

```bash
firebase deploy --only hosting
```

Aspetta che finisca. Alla fine vedrai un messaggio tipo:

```
✔ Deploy complete!

Project Console: https://console.firebase.google.com/project/presenze-pre-post/overview
Hosting URL: https://presenze-pre-post.web.app
```

---

## PASSO 6: Aggiungi il dominio ai domini autorizzati in Firebase

1. Vai su https://console.firebase.google.com
2. Seleziona il progetto "presenze-pre-post"
3. Clicca su **Authentication** (menu a sinistra)
4. Clicca su **Settings** (scheda in alto)
5. Sotto **Authorized domains**, clicca **Add domain**
6. Aggiungi: `presenze-pre-post.web.app`
7. Clicca **Save**

---

## RISULTATO

Il tuo Registro Presenze sarà online a uno di questi link:

- **https://presenze-pre-post.web.app**
- **https://presenze-pre-post.firebaseapp.com**

Funziona su qualsiasi dispositivo (telefono, tablet, computer)!
Il login Google funzionerà perché il dominio è autorizzato.

---

## PER AGGIORNARE IL SITO

Se modifichi il file `public/index.html`, rifai il deploy:

```bash
cd PERCORSO/registro-presenze
firebase deploy --only hosting
```

---

## PER MODIFICARE I NOMI DEI BAMBINI

Apri `public/index.html` con un editor di testo (anche Blocco Note).
Cerca la riga che inizia con `var children = [` e modifica i nomi tra virgolette.

---

## DOMINIO PERSONALIZZATO (opzionale)

Se vuoi usare un dominio tipo `registro-tuascuola.it`:
1. Vai su Firebase Console > Hosting > Add custom domain
2. Segui le istruzioni per configurare il DNS
3. Anche questo dominio va aggiunto in Authentication > Settings > Authorized domains
