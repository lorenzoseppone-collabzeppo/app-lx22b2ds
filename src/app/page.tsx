'use client'

import { useEffect, useState, useCallback } from 'react'

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBN3yNgVtgRug-pcjTFAK5PgxxzF2OasfM",
  authDomain: "presenze-pre-post.firebaseapp.com",
  projectId: "presenze-pre-post",
  storageBucket: "presenze-pre-post.firebasestorage.app",
  messagingSenderId: "291215184515",
  appId: "1:291215184515:web:5930221368bc5a3d49c1b6"
}

const INITIAL_CHILDREN = [
  'Sofia Rossi', 'Leonardo Bianchi', 'Aurora Romano', 'Tommaso Ferrari',
  'Giulia Esposito', 'Mattia Ricci', 'Alice Marino', 'Nicola Parisi',
  'Elisa Benedetti', 'Simone Rinaldi', 'Beatrice Costa', 'Davide Moretti',
  'Martina Barbieri', 'Federico Rizzo', 'Chiara Lombardi', 'Gabriele Gallo',
  'Ginevra Conti', 'Alessandro De Luca', 'Lorenzo Greco', 'Emma Bruno',
  'Pietro Colombo', 'Viola Fontana', 'Marco Villa', 'Camilla Russo',
  'Edoardo Messina', 'Anna Serra', 'Filippo Mazza', 'Bianca Pellegrini',
  'Luca Marchetti', 'Giorgia Ferretti'
]

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return parts[0][0].toUpperCase() + parts[parts.length - 1][0].toUpperCase()
  return parts[0].substring(0, 2).toUpperCase()
}

const DATES = [
  { short: '23 mag 2026', full: 'Sabato 23 Maggio 2026' },
  { short: '24 mag 2026', full: 'Domenica 24 Maggio 2026' },
  { short: '25 mag 2026', full: 'Lunedì 25 Magggio 2026' },
  { short: '26 mag 2026', full: 'Martedì 26 Maggio 2026' },
  { short: '27 mag 2026', full: 'Mercoledì 27 Maggio 2026' },
]

export default function RegistroPresenze() {
  const [children, setChildren] = useState(INITIAL_CHILDREN)
  const [presenze, setPresenze] = useState<Set<number>>(new Set())
  const [pre, setPre] = useState<Set<number>>(new Set())
  const [post, setPost] = useState<Set<number>>(new Set())
  const [dateIndex, setDateIndex] = useState(2)
  const [search, setSearch] = useState('')
  const [className, setClassName] = useState('Coccinelle')
  const [editingClass, setEditingClass] = useState(false)
  const [editingChild, setEditingChild] = useState<number | null>(null)
  const [editValue, setEditValue] = useState('')
  const [user, setUser] = useState<any>(null)
  const [loginLoading, setLoginLoading] = useState(false)
  const [firebaseReady, setFirebaseReady] = useState(false)

  useEffect(() => {
    const loadFirebase = async () => {
      try {
        const script1 = document.createElement('script')
        script1.src = 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js'
        script1.async = true
        document.head.appendChild(script1)
        await new Promise<void>((resolve, reject) => {
          script1.onload = () => resolve()
          script1.onerror = () => reject(new Error('Failed to load firebase-app'))
        })

        const script2 = document.createElement('script')
        script2.src = 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth-compat.js'
        script2.async = true
        document.head.appendChild(script2)
        await new Promise<void>((resolve, reject) => {
          script2.onload = () => resolve()
          script2.onerror = () => reject(new Error('Failed to load firebase-auth'))
        })

        const fb = (window as any).firebase
        fb.initializeApp(FIREBASE_CONFIG)
        const auth = fb.auth()

        // Try persistence levels from most persistent to least
        // LOCAL requires localStorage, SESSION requires sessionStorage, NONE is in-memory only
        const persistences = [
          { type: fb.auth.Auth.Persistence.LOCAL, name: 'LOCAL' },
          { type: fb.auth.Auth.Persistence.SESSION, name: 'SESSION' },
          { type: fb.auth.Auth.Persistence.NONE, name: 'NONE' },
        ]

        let persistenceSet = false
        for (const p of persistences) {
          try {
            await auth.setPersistence(p.type)
            console.log(`Firebase persistence set to ${p.name}`)
            persistenceSet = true
            break
          } catch (err: any) {
            console.warn(`Persistence ${p.name} not available:`, err.message)
          }
        }

        if (!persistenceSet) {
          console.warn('No Firebase persistence method available, using default')
        }

        auth.onAuthStateChanged((u: any) => {
          setUser(u)
          setLoginLoading(false)
        })

        // Handle redirect result silently
        try {
          await auth.getRedirectResult()
        } catch (err: any) {
          // Silently handle redirect errors - user will see auth state via onAuthStateChanged
          console.warn('getRedirectResult error (safe to ignore):', err.code || err.message)
        }

        setFirebaseReady(true)
      } catch (err: any) {
        console.error('Firebase initialization failed:', err)
        setFirebaseReady(true) // Still mark as ready so UI doesn't hang
      }
    }
    loadFirebase()
  }, [])

  const handleLogin = useCallback(() => {
    const fb = (window as any).firebase
    if (!fb) return
    const auth = fb.auth()
    if (user) {
      if (confirm(`Vuoi disconnettere l'account "${user.displayName || user.email}"?`)) {
        auth.signOut()
      }
    } else {
      setLoginLoading(true)
      const provider = new fb.auth.GoogleAuthProvider()
      auth.signInWithPopup(provider).catch((error: any) => {
        setLoginLoading(false)
        let msg = 'Errore durante il login.'
        if (error.code === 'auth/popup-closed-by-user') {
          // User closed popup - no need to show error
          return
        } else if (error.code === 'auth/popup-blocked') {
          // Try redirect as fallback
          auth.signInWithRedirect(provider).catch(() => {
            alert('Impossibile effettuare il login. Controlla le impostazioni del browser.')
          })
          return
        } else if (error.code === 'auth/unauthorized-domain') {
          const domain = window.location.hostname
          msg = `Dominio "${domain}" non autorizzato.\n\nVai su Firebase Console > Authentication > Settings > Authorized domains e aggiungi: ${domain}`
        } else if (error.code === 'auth/operation-not-allowed') {
          msg = 'Login Google non abilitato. Abilitalo in Firebase Console > Authentication > Sign-in method.'
        } else if (error.code === 'auth/operation-not-supported-in-this-environment') {
          msg = 'Ambiente non supportato. Prova ad aprire il sito direttamente nel browser (non in un\'iframe).\n\nCopia e apri questo link: ' + window.location.href
        } else {
          msg = 'Errore: ' + error.message
        }
        alert(msg)
      })
    }
  }, [user])

  const togglePresenza = (i: number) => {
    setPresenze(prev => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n })
  }
  const togglePre = (i: number) => {
    setPre(prev => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n })
  }
  const togglePost = (i: number) => {
    setPost(prev => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n })
  }

  const selectAllPresenza = () => {
    if (presenze.size === children.length) setPresenze(new Set())
    else setPresenze(new Set(children.map((_, i) => i)))
  }
  const selectAllPre = () => {
    if (pre.size === children.length) setPre(new Set())
    else setPre(new Set(children.map((_, i) => i)))
  }
  const selectAllPost = () => {
    if (post.size === children.length) setPost(new Set())
    else setPost(new Set(children.map((_, i) => i)))
  }

  const startEditChild = (i: number) => {
    setEditingChild(i)
    setEditValue(children[i])
  }
  const saveEditChild = () => {
    if (editingChild !== null && editValue.trim()) {
      const nc = [...children]
      nc[editingChild] = editValue.trim()
      setChildren(nc)
    }
    setEditingChild(null)
  }

  const filteredChildren = children.map((name, i) => ({ name, i })).filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", backgroundColor: '#f0eef5', backgroundImage: 'radial-gradient(circle, #d5d0e0 1px, transparent 1px)', backgroundSize: '20px 20px', minHeight: '100vh', padding: 0, color: '#333' }}>
      <div style={{ maxWidth: 560, margin: '0 auto', padding: 16, minHeight: '100vh' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, padding: '12px 0', position: 'relative' }}>
          <div style={{ width: 48, height: 48, background: '#1a1a2e', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg viewBox="0 0 24 24" width={26} height={26} fill="white"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM5 8V6h14v2H5zm2 4h10v2H7v-2zm0 4h7v2H7v-2z"/></svg>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {editingClass ? (
              <input value={className} onChange={e => setClassName(e.target.value)} onBlur={() => setEditingClass(false)} onKeyDown={e => { if (e.key === 'Enter') setEditingClass(false) }} autoFocus style={{ fontSize: 24, fontWeight: 700, color: '#1a1a2e', border: '2px solid #007bff', borderRadius: 6, padding: '2px 6px', outline: 'none', background: 'white' }} />
            ) : (
              <div onClick={() => setEditingClass(true)} style={{ fontSize: 24, fontWeight: 700, color: '#1a1a2e', cursor: 'pointer', padding: '2px 6px', borderRadius: 6, border: '2px solid transparent' }} title="Clicca per modificare">{className}</div>
            )}
            <div style={{ fontSize: 14, color: '#888' }}>Registro presenze</div>
          </div>
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto', padding: '6px 12px', background: 'white', borderRadius: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.1)', fontSize: 12, maxWidth: 180 }}>
              {user.photoURL && <img src={user.photoURL} alt="" style={{ width: 28, height: 28, borderRadius: '50%' }} />}
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 500, color: '#1a1a2e' }}>{user.displayName || user.email}</span>
            </div>
          )}
        </div>

        {/* Auth status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 500, marginBottom: 12, background: user ? '#d4edda' : '#fff3cd', color: user ? '#155724' : '#856404', border: `1px solid ${user ? '#c3e6cb' : '#ffeeba'}` }}>
          <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span>{user ? `Connesso come ${user.displayName || user.email}` : 'Effettua il login con Google per salvare i dati'}</span>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, width: '100%' }}>
            <button onClick={handleLogin} disabled={loginLoading} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: `1px solid ${user ? '#28a745' : '#ddd'}`, background: user ? '#28a745' : 'white', color: user ? 'white' : '#333', fontSize: 13, fontWeight: 500, cursor: 'pointer', opacity: loginLoading ? 0.7 : 1 }}>
              <svg viewBox="0 0 24 24" width={16} height={16}>
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {loginLoading ? '⏳' : (user ? 'Logout' : 'Login')}
            </button>
            <button style={btnStyle}>Oggi</button>
            <button style={btnStyle}>Azzera giorno</button>
            <button style={{ ...btnStyle, color: '#dc3545', borderColor: '#dc3545' }}>Azzera mese</button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, width: '100%' }}>
            <button style={{ ...btnStyle, background: '#dc3545', color: 'white', borderColor: '#dc3545' }}>
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              PDF
            </button>
            <button style={btnStyle}>Importa</button>
            <button style={btnStyle}>Backup</button>
            <button style={btnStyle}>Mese</button>
          </div>
          <button style={{ ...btnStyle, background: '#28a745', color: 'white', borderColor: '#28a745', padding: '8px 18px', marginBottom: 16, width: '100%' }}>
            <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2}><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
            Condividi
          </button>
        </div>

        {/* Date Section */}
        <Card>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>DATA</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 8 }}>
            <button onClick={() => setDateIndex(Math.max(0, dateIndex - 1))} style={arrowStyle}>
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <span style={{ fontSize: 18, fontWeight: 600, color: '#1a1a2e' }}>{DATES[dateIndex].short}</span>
            <button onClick={() => setDateIndex(Math.min(DATES.length - 1, dateIndex + 1))} style={arrowStyle}>
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
          <div style={{ textAlign: 'center', fontSize: 13, color: '#888', marginBottom: 10 }}>{DATES[dateIndex].full}</div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Badge color="green" label={`${presenze.size} presenze`} />
            <Badge color="orange" label={`${pre.size} pre`} />
            <Badge color="blue" label={`${post.size} post`} />
          </div>
        </Card>

        {/* Search */}
        <Card>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>RICERCA BAMBINO</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, background: '#fafafa', marginBottom: 10 }}>
            <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="#aaa" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" placeholder="Cerca per nome o cognome..." value={search} onChange={e => setSearch(e.target.value)} style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 14, color: '#333', width: '100%', fontFamily: 'inherit' }} />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#666', cursor: 'pointer' }}>
            <input type="checkbox" style={{ width: 16, height: 16, accentColor: '#666' }} />
            Solo con presenze nel mese
          </label>
        </Card>

        {/* Roster */}
        <div style={{ background: 'white', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', alignItems: 'center', padding: '10px 16px', background: '#fafafa', borderBottom: '1px solid #eee', gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: 0.3 }}>BAMBINO</span>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 54 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', cursor: 'pointer' }}>Presenza</label>
              <input type="checkbox" checked={presenze.size === children.length && children.length > 0} onChange={selectAllPresenza} style={{ width: 16, height: 16, accentColor: '#28a745', cursor: 'pointer' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 54 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', cursor: 'pointer' }}>Pre</label>
              <input type="checkbox" checked={pre.size === children.length && children.length > 0} onChange={selectAllPre} style={{ width: 16, height: 16, accentColor: '#28a745', cursor: 'pointer' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 54 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', cursor: 'pointer' }}>Post</label>
              <input type="checkbox" checked={post.size === children.length && children.length > 0} onChange={selectAllPost} style={{ width: 16, height: 16, accentColor: '#28a745', cursor: 'pointer' }} />
            </div>
          </div>

          {filteredChildren.map(({ name, i }) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', alignItems: 'center', padding: '8px 16px', borderBottom: '1px solid #f0f0f0', gap: 8, transition: 'background 0.1s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#1a1a2e', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, flexShrink: 0 }}>{getInitials(name)}</div>
                {editingChild === i ? (
                  <input value={editValue} onChange={e => setEditValue(e.target.value)} onBlur={saveEditChild} onKeyDown={e => { if (e.key === 'Enter') saveEditChild(); if (e.key === 'Escape') setEditingChild(null) }} autoFocus style={{ fontSize: 14, fontWeight: 500, border: '1.5px solid #007bff', borderRadius: 4, padding: '2px 6px', outline: 'none', background: 'white', fontFamily: 'inherit', minWidth: 0 }} />
                ) : (
                  <span onClick={() => startEditChild(i)} style={{ fontSize: 14, fontWeight: 500, color: '#1a1a2e', cursor: 'pointer', padding: '2px 6px', borderRadius: 4, border: '1.5px solid transparent', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title="Clicca per modificare">{name}</span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 54 }}>
                <input type="checkbox" checked={presenze.has(i)} onChange={() => togglePresenza(i)} style={{ width: 20, height: 20, accentColor: '#28a745', cursor: 'pointer' }} />
              </div>
              <button onClick={() => togglePre(i)} style={{ padding: '5px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, border: `1.5px solid ${pre.has(i) ? '#e67e00' : '#ccc'}`, background: pre.has(i) ? '#e67e00' : 'white', color: pre.has(i) ? 'white' : '#888', cursor: 'pointer', minWidth: 54, textAlign: 'center', fontFamily: 'inherit' }}>PRE</button>
              <button onClick={() => togglePost(i)} style={{ padding: '5px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, border: `1.5px solid ${post.has(i) ? '#007bff' : '#ccc'}`, background: post.has(i) ? '#007bff' : 'white', color: post.has(i) ? 'white' : '#888', cursor: 'pointer', minWidth: 54, textAlign: 'center', fontFamily: 'inherit' }}>POST</button>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10, marginBottom: 12 }}>
          <StatCard label="Totale presenze mese" sub="Maggio 2026" value={presenze.size} color="#28a745" />
          <StatCard label="Totale pre mese" sub="Ingressi Anticipati" value={pre.size} color="#e67e00" />
          <StatCard label="Totale post mese" sub="Uscite Posticipate" value={post.size} color="#6f42c1" />
        </div>

        {/* Notice */}
        <div style={{ background: '#fdf6e3', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="#e67e00" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
          <span style={{ fontSize: 13, color: '#7a5c00', fontWeight: 500 }}>Usare su più dispositivi</span>
        </div>
      </div>
    </div>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  return <div style={{ background: 'white', borderRadius: 12, padding: 16, marginBottom: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>{children}</div>
}

function Badge({ color, label }: { color: string, label: string }) {
  const styles: Record<string, { bg: string, c: string, dot: string }> = {
    green: { bg: '#d4edda', c: '#155724', dot: '#28a745' },
    orange: { bg: '#fff3cd', c: '#856404', dot: '#e67e00' },
    blue: { bg: '#cce5ff', c: '#004085', dot: '#007bff' },
  }
  const s = styles[color] || styles.green
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 12, fontSize: 12, fontWeight: 500, background: s.bg, color: s.c }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot }}></span>
      {label}
    </span>
  )
}

function StatCard({ label, sub, value, color }: { label: string, sub: string, value: number, color: string }) {
  return (
    <div style={{ background: 'white', borderRadius: 12, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ fontSize: 12, color: '#888', fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 11, color: '#aaa' }}>{sub}</span>
      </div>
      <div style={{ fontSize: 36, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
    </div>
  )
}

const btnStyle: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8,
  border: '1px solid #ddd', background: 'white', fontSize: 13, fontWeight: 500,
  color: '#333', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit'
}

const arrowStyle: React.CSSProperties = {
  width: 32, height: 32, borderRadius: '50%', border: '1px solid #ddd', background: 'white',
  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
  color: '#888', fontSize: 16, transition: 'all 0.15s'
}
