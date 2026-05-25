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
  { short: '25 mag 2026', full: 'Lunedì 25 Maggio 2026' },
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
        const persistences = [
          { type: fb.auth.Auth.Persistence.LOCAL, name: 'LOCAL' },
          { type: fb.auth.Auth.Persistence.SESSION, name: 'SESSION' },
          { type: fb.auth.Auth.Persistence.NONE, name: 'NONE' },
        ]
        let persistenceSet = false
        for (const p of persistences) {
          try { await auth.setPersistence(p.type); persistenceSet = true; break }
          catch (err: any) { console.warn(`Persistence ${p.name} not available:`, err.message) }
        }
        auth.onAuthStateChanged((u: any) => { setUser(u); setLoginLoading(false) })
        try { await auth.getRedirectResult() } catch (err: any) { console.warn('getRedirectResult error:', err.code || err.message) }
        setFirebaseReady(true)
      } catch (err: any) { console.error('Firebase init failed:', err); setFirebaseReady(true) }
    }
    loadFirebase()
  }, [])

  const handleLogin = useCallback(() => {
    const fb = (window as any).firebase
    if (!fb) return
    const auth = fb.auth()
    if (user) {
      if (confirm(`Vuoi disconnettere l'account "${user.displayName || user.email}"?`)) auth.signOut()
    } else {
      setLoginLoading(true)
      const provider = new fb.auth.GoogleAuthProvider()
      auth.signInWithPopup(provider).catch((error: any) => {
        setLoginLoading(false)
        let msg = 'Errore durante il login.'
        if (error.code === 'auth/popup-closed-by-user') return
        else if (error.code === 'auth/popup-blocked') { auth.signInWithRedirect(provider); return }
        else if (error.code === 'auth/unauthorized-domain') { msg = `Dominio "${window.location.hostname}" non autorizzato.\n\nAggiungi: ${window.location.hostname} in Firebase Console > Authentication > Authorized domains` }
        else if (error.code === 'auth/operation-not-allowed') { msg = 'Login Google non abilitato.' }
        else { msg = 'Errore: ' + error.message }
        alert(msg)
      })
    }
  }, [user])

  const togglePresenza = (i: number) => setPresenze(prev => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n })
  const togglePre = (i: number) => setPre(prev => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n })
  const togglePost = (i: number) => setPost(prev => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n })
  const selectAllPresenza = () => { if (presenze.size === children.length) setPresenze(new Set()); else setPresenze(new Set(children.map((_, i) => i))) }
  const selectAllPre = () => { if (pre.size === children.length) setPre(new Set()); else setPre(new Set(children.map((_, i) => i))) }
  const selectAllPost = () => { if (post.size === children.length) setPost(new Set()); else setPost(new Set(children.map((_, i) => i))) }
  const startEditChild = (i: number) => { setEditingChild(i); setEditValue(children[i]) }
  const saveEditChild = () => { if (editingChild !== null && editValue.trim()) { const nc = [...children]; nc[editingChild] = editValue.trim(); setChildren(nc) }; setEditingChild(null) }
  const filteredChildren = children.map((name, i) => ({ name, i })).filter(c => c.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", backgroundColor: '#f0eef5', backgroundImage: 'radial-gradient(circle, #d5d0e0 1px, transparent 1px)', backgroundSize: '20px 20px', minHeight: '100vh', padding: 0, color: '#333' }}>
      <div style={{ maxWidth: 560, margin: '0 auto', padding: 16, minHeight: '100vh' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, padding: '12px 0', position: 'relative' }}>
          <div style={{ width: 48, height: 48, background: '#1a1a2e', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><svg viewBox="0 0 24 24" width={26} height={26} fill="white"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM5 8V6h14v2H5zm2 4h10v2H7v-2zm0 4h7v2H7v-2z"/></svg></div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {editingClass ? <input value={className} onChange={e => setClassName(e.target.value)} onBlur={() => setEditingClass(false)} onKeyDown={e => { if (e.key === 'Enter') setEditingClass(false) }} autoFocus style={{ fontSize: 24, fontWeight: 700, color: '#1a1a2e', border: '2px solid #007bff', borderRadius: 6, padding: '2px 6px', outline: 'none', background: 'white' }} /> : <div onClick={() => setEditingClass(true)} style={{ fontSize: 24, fontWeight: 700, color: '#1a1a2e', cursor: 'pointer', padding: '2px 6px', borderRadius: 6, border: '2px solid transparent' }} title="Clicca per modificare">{className}</div>}
            <div style={{ fontSize: 14, color: '#888' }}>Registro presenze</div>
          </div>
          {user && <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto', padding: '6px 12px', background: 'white', borderRadius: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.1)', fontSize: 12, maxWidth: 180 }}>{user.photoURL && <img src={user.photoURL} alt="" style={{ width: 28, height: 28, borderRadius: '50%' }} />}<span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 500, color: '#1a1a2e' }}>{user.displayName || user.email}</span></div>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 500, marginBottom: 12, background: user ? '#d4edda' : '#fff3cd', color: user ? '#155724' : '#856404', border: `1px solid ${user ? '#c3e6cb' : '#ffeeba'}` }}><span>{user ? `Connesso come ${user.displayName || user.email}` : 'Effettua il login con Google per salvare i dati'}</span></div>
        <p style={{textAlign:'center',padding:20,color:'#888'}}>Caricamento...</p>
      </div>
    </div>
  )
}
