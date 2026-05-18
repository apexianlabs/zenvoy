'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const TONES = ['Professional','Friendly','Casual','Formal','Empathetic','Direct','Diplomatic','Confident','Concise']
const CONTEXTS = ['Email','Slack message','LinkedIn message','Client communication','Team communication','Customer support','Apology','Follow-up','Cold outreach']

export default function GeneratePage() {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [result, setResult]   = useState(null)
  const [form, setForm]       = useState({ original_message:'', tone:'Professional', context:'Email', recipient:'' })

  useEffect(() => {
    try {
      const match = document.cookie.match(/zen_user=([^;]+)/)
      if (match) setUser(JSON.parse(decodeURIComponent(match[1])))
    } catch(e) {}
  }, [])

  const handleSubmit = async () => {
    if (!form.original_message.trim()) return setError('Please paste your original message.')
    setLoading(true); setError(''); setResult(null)
    try {
      const token = document.cookie.match(/zen_token=([^;]+)/)?.[1] || ''
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...form, userId: user?.id })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setResult(data.result)
    } catch(e) { setError(e.message) }
    setLoading(false)
  }

  const inputStyle = { width:'100%', padding:'10px 12px', border:'1px solid #e2e8f0', borderRadius:8, fontSize:14, color:'#0f172a', background:'#fff', outline:'none', fontFamily:'Inter,sans-serif', boxSizing:'border-box' }
  const labelStyle = { fontSize:11, fontWeight:600, color:'#475569', textTransform:'uppercase', letterSpacing:'0.05em', display:'block', marginBottom:5 }

  if (result) return (
    <div style={{minHeight:'100vh',background:'#f8fafc',fontFamily:'Inter,sans-serif'}}>
      <nav style={{background:'#fff',borderBottom:'1px solid #e2e8f0',height:56,display:'flex',alignItems:'center',padding:'0 24px',gap:16}}>
        <Link href="/" style={{display:'flex',alignItems:'center',gap:8,textDecoration:'none'}}>
          <div style={{width:28,height:28,borderRadius:7,background:'#7c3aed',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:800,color:'#fff'}}>Z</div>
          <span style={{fontWeight:700,color:'#0f172a',fontSize:15}}>Zenvoy</span>
        </Link>
        <div style={{flex:1}}/>
      </nav>
      <div style={{maxWidth:720,margin:'0 auto',padding:'32px 24px',display:'flex',flexDirection:'column',gap:14}}>
        <div style={{background:'#f5f3ff',border:'1px solid #ddd6fe',borderRadius:12,padding:20}}>
          <p style={{fontSize:11,fontWeight:700,color:'#7c3aed',textTransform:'uppercase',marginBottom:4}}>✅ Message Rewritten</p>
          <p style={{fontSize:16,fontWeight:700,color:'#0f172a'}}>{form.tone} tone · {form.context}</p>
        </div>
        {(result.rewritten_message || result.message || result.rewritten) && (
          <div style={{background:'#fff',border:'2px solid #ddd6fe',borderRadius:12,padding:24}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
              <p style={{fontSize:11,fontWeight:700,color:'#475569',textTransform:'uppercase'}}>✉️ Rewritten Message</p>
              <button onClick={() => navigator.clipboard.writeText(result.rewritten_message || result.message || result.rewritten)}
                style={{fontSize:11,color:'#7c3aed',background:'#f5f3ff',border:'1px solid #ddd6fe',borderRadius:6,padding:'4px 10px',cursor:'pointer',fontFamily:'Inter,sans-serif',fontWeight:600}}>
                Copy
              </button>
            </div>
            <p style={{fontSize:14,color:'#374151',lineHeight:1.8,whiteSpace:'pre-wrap'}}>{result.rewritten_message || result.message || result.rewritten}</p>
          </div>
        )}
        {result.explanation && (
          <div style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:12,padding:20}}>
            <p style={{fontSize:11,fontWeight:700,color:'#475569',textTransform:'uppercase',marginBottom:8}}>💡 What changed</p>
            <p style={{fontSize:13,color:'#374151',lineHeight:1.7}}>{result.explanation}</p>
          </div>
        )}
        <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
          <button onClick={() => { setResult(null); setForm({...form, original_message:''}) }}
            style={{flex:1,padding:'10px',borderRadius:8,border:'1px solid #e2e8f0',background:'#fff',fontSize:13,fontWeight:600,color:'#475569',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>
            Rewrite another
          </button>
          {user ? <Link href="/dashboard" style={{flex:1,padding:'10px',borderRadius:8,border:'none',background:'#7c3aed',color:'#fff',fontSize:13,fontWeight:700,textDecoration:'none',textAlign:'center',display:'flex',alignItems:'center',justifyContent:'center'}}>Dashboard →</Link>
                : <Link href="/login" style={{flex:1,padding:'10px',borderRadius:8,border:'none',background:'#7c3aed',color:'#fff',fontSize:13,fontWeight:700,textDecoration:'none',textAlign:'center',display:'flex',alignItems:'center',justifyContent:'center'}}>Save messages →</Link>}
        </div>
      </div>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'#f8fafc',fontFamily:'Inter,sans-serif'}}>
      <nav style={{background:'#fff',borderBottom:'1px solid #e2e8f0',height:56,display:'flex',alignItems:'center',padding:'0 24px',gap:16}}>
        <Link href="/" style={{display:'flex',alignItems:'center',gap:8,textDecoration:'none'}}>
          <div style={{width:28,height:28,borderRadius:7,background:'#7c3aed',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:800,color:'#fff'}}>Z</div>
          <span style={{fontWeight:700,color:'#0f172a',fontSize:15}}>Zenvoy</span>
        </Link>
        <div style={{flex:1}}/>
        {user ? <Link href="/dashboard" style={{fontSize:13,color:'#64748b',textDecoration:'none'}}>Dashboard</Link>
               : <Link href="/login" style={{fontSize:13,color:'#7c3aed',fontWeight:600,textDecoration:'none'}}>Sign in</Link>}
      </nav>
      <div style={{maxWidth:620,margin:'0 auto',padding:'40px 24px'}}>
        <h1 style={{fontSize:26,fontWeight:800,color:'#0f172a',marginBottom:6}}>Rewrite your message</h1>
        <p style={{fontSize:14,color:'#64748b',marginBottom:28}}>Paste your message, choose your tone, and get a perfectly rewritten version instantly.</p>
        {error && <div style={{background:'#fef2f2',border:'1px solid #fecaca',borderRadius:10,padding:'12px 16px',fontSize:13,color:'#dc2626',marginBottom:20}}>{error}</div>}
        <div style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:14,padding:28}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:14}}>
            <div><label style={labelStyle}>Tone *</label>
              <select value={form.tone} onChange={e => setForm({...form,tone:e.target.value})} style={{...inputStyle,background:'#fff'}}>
                {TONES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div><label style={labelStyle}>Context</label>
              <select value={form.context} onChange={e => setForm({...form,context:e.target.value})} style={{...inputStyle,background:'#fff'}}>
                {CONTEXTS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div style={{marginBottom:14}}>
            <label style={labelStyle}>Recipient (optional)</label>
            <input value={form.recipient} onChange={e => setForm({...form,recipient:e.target.value})} placeholder="e.g. My manager, a potential client, a difficult customer..." style={inputStyle}/>
          </div>
          <div style={{marginBottom:24}}>
            <label style={labelStyle}>Original message *</label>
            <textarea value={form.original_message} onChange={e => setForm({...form,original_message:e.target.value})}
              placeholder="Paste the message you want to rewrite..."
              rows={7} style={{...inputStyle,resize:'vertical'}}/>
          </div>
          <button onClick={handleSubmit} disabled={loading}
            style={{width:'100%',padding:'13px',borderRadius:10,border:'none',background:loading?'#a78bfa':'#7c3aed',color:'#fff',fontSize:15,fontWeight:700,cursor:loading?'not-allowed':'pointer',fontFamily:'Inter,sans-serif'}}>
            {loading ? '✨ Rewriting...' : 'Rewrite message →'}
          </button>
        </div>
      </div>
    </div>
  )
}
