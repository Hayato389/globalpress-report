'use client'
import { useState, useRef } from 'react'

interface SiteRow {
  name: string
  url: string
  mediaType: string
  sessions: string
}

export default function Home() {
  const [pressUrl, setPressUrl] = useState('')
  const [urlLoading, setUrlLoading] = useState(false)
  const [title, setTitle] = useState('')
  const [country, setCountry] = useState('アメリカ / 英語')
  const [category, setCategory] = useState('デジタル')
  const [date, setDate] = useState('')
  const [sites, setSites] = useState<SiteRow[]>([])
  const [screenshots, setScreenshots] = useState<{p1: File|null, p2: File|null, p3: File|null}>({p1:null,p2:null,p3:null})
  const [screenshotPreviews, setScreenshotPreviews] = useState<{p1:string,p2:string,p3:string}>({p1:'',p2:'',p3:''})
  const [loading, setLoading] = useState(false)
  const [csvFileName, setCsvFileName] = useState('')
  const csvRef = useRef<HTMLInputElement>(null)
  const p1Ref = useRef<HTMLInputElement>(null)
  const p2Ref = useRef<HTMLInputElement>(null)
  const p3Ref = useRef<HTMLInputElement>(null)

  const handleFetchMeta = async () => {
    if (!pressUrl) return
    setUrlLoading(true)
    try {
      const res = await fetch('/api/fetch-meta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: pressUrl })
      })
      const data = await res.json()
      if (data.title) setTitle(data.title)
    } catch {
      alert('URLからの取得に失敗しました。手動で入力してください。')
    } finally {
      setUrlLoading(false)
    }
  }

  const handleCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCsvFileName(file.name)
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      const lines = text.split('\n').filter(l => l.trim())
      const parsed: SiteRow[] = lines.slice(0, 10).map((line, i) => {
        const parts = line.split(',')
        const name = parts[0]?.trim() || ''
        const url = parts.slice(1).join(',').trim() || ''
        return { name, url, mediaType: i < 8 ? '大規模メディア' : '中規模メディア', sessions: '100,000以上／月' }
      })
      setSites(parsed)
    }
    reader.readAsText(file)
  }

  const handleScreenshot = (key: 'p1'|'p2'|'p3') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setScreenshots(prev => ({...prev, [key]: file}))
    const url = URL.createObjectURL(file)
    setScreenshotPreviews(prev => ({...prev, [key]: url}))
  }

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('title', title)
      formData.append('country', country)
      formData.append('category', category)
      formData.append('date', date)
      formData.append('sites', JSON.stringify(sites))
      if (screenshots.p1) formData.append('screenshot1', screenshots.p1)
      if (screenshots.p2) formData.append('screenshot2', screenshots.p2)
      if (screenshots.p3) formData.append('screenshot3', screenshots.p3)

      const res = await fetch('/api/generate', { method: 'POST', body: formData })
      if (!res.ok) throw new Error('生成エラー')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `GlobalPress_Report_${date || 'report'}.docx`
      a.click()
    } catch {
      alert('エラーが発生しました。もう一度お試しください。')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: 8,
    border: '1.5px solid #d1d5db', fontSize: 14, fontFamily: 'inherit',
    background: '#fafafa', outline: 'none', boxSizing: 'border-box',
  }
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6
  }

  return (
    <div style={{minHeight:'100vh', background:'linear-gradient(135deg,#f0f4ff 0%,#fafbff 50%,#f0f7ff 100%)', fontFamily:"'Hiragino Sans','Hiragino Kaku Gothic ProN','Noto Sans JP',sans-serif"}}>
      <div style={{background:'#1e3a5f', padding:'20px 40px', display:'flex', alignItems:'center', gap:16, boxShadow:'0 2px 12px rgba(0,0,0,0.15)'}}>
        <div style={{width:40,height:40,borderRadius:10,background:'linear-gradient(135deg,#4f9cf9,#a78bfa)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>📰</div>
        <div>
          <div style={{color:'white',fontWeight:700,fontSize:20}}>Global Press</div>
          <div style={{color:'#93c5fd',fontSize:12}}>レポート自動生成システム</div>
        </div>
      </div>

      <div style={{maxWidth:800, margin:'40px auto', padding:'0 24px'}}>

        {/* URL入力 */}
        <div style={{background:'white',borderRadius:16,padding:32,marginBottom:24,boxShadow:'0 1px 3px rgba(0,0,0,0.08)',border:'1px solid #e5e7eb'}}>
          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:16}}>
            <div style={{width:32,height:32,borderRadius:'50%',background:'#1e3a5f',color:'white',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:14}}>0</div>
            <h2 style={{margin:0,fontSize:18,fontWeight:700,color:'#1e3a5f'}}>プレスリリースURL</h2>
          </div>
          <p style={{color:'#6b7280',fontSize:13,marginBottom:16}}>URLを入力すると記事タイトルを自動取得します。</p>
          <div style={{display:'flex',gap:8}}>
            <input
              style={{...inputStyle, flex:1}}
              value={pressUrl}
              onChange={e=>setPressUrl(e.target.value)}
              placeholder="https://..."
            />
            <button
              onClick={handleFetchMeta}
              disabled={urlLoading || !pressUrl}
              style={{padding:'10px 20px',borderRadius:8,border:'none',background:urlLoading||!pressUrl?'#e5e7eb':'#1e3a5f',color:urlLoading||!pressUrl?'#9ca3af':'white',fontWeight:600,fontSize:14,cursor:urlLoading||!pressUrl?'not-allowed':'pointer',whiteSpace:'nowrap'}}
            >
              {urlLoading ? '取得中...' : '自動取得'}
            </button>
          </div>
        </div>

        {/* 配信概要 */}
        <div style={{background:'white',borderRadius:16,padding:32,marginBottom:24,boxShadow:'0 1px 3px rgba(0,0,0,0.08)',border:'1px solid #e5e7eb'}}>
          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:24}}>
            <div style={{width:32,height:32,borderRadius:'50%',background:'#1e3a5f',color:'white',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:14}}>1</div>
            <h2 style={{margin:0,fontSize:18,fontWeight:700,color:'#1e3a5f'}}>配信概要</h2>
          </div>
          <div style={{display:'grid',gap:16}}>
            <div>
              <label style={labelStyle}>記事タイトル</label>
              <input style={inputStyle} value={title} onChange={e=>setTitle(e.target.value)} placeholder="URLから自動取得、または手動入力" />
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
              <div>
                <label style={labelStyle}>配信国 / 配信言語</label>
                <input style={inputStyle} value={country} onChange={e=>setCountry(e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>配信カテゴリー</label>
                <input style={inputStyle} value={category} onChange={e=>setCategory(e.target.value)} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>配信日</label>
              <input style={{...inputStyle, maxWidth:200}} type="date" value={date} onChange={e=>setDate(e.target.value)} />
            </div>
          </div>
        </div>

        {/* CSVアップロード */}
        <div style={{background:'white',borderRadius:16,padding:32,marginBottom:24,boxShadow:'0 1px 3px rgba(0,0,0,0.08)',border:'1px solid #e5e7eb'}}>
          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:8}}>
            <div style={{width:32,height:32,borderRadius:'50%',background:'#1e3a5f',color:'white',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:14}}>2</div>
            <h2 style={{margin:0,fontSize:18,fontWeight:700,color:'#1e3a5f'}}>掲載サイト（CSVアップロード）</h2>
          </div>
          <p style={{color:'#6b7280',fontSize:13,marginBottom:20}}>EIN Presswireから取得したCSVファイルをアップロードしてください。</p>
          <div onClick={()=>csvRef.current?.click()} style={{border:'2px dashed #cbd5e1',borderRadius:12,padding:'28px 20px',textAlign:'center',cursor:'pointer',background:'#f8fafc'}}>
            <div style={{fontSize:32,marginBottom:8}}>📄</div>
            <div style={{fontWeight:600,color:'#374151',fontSize:14}}>{csvFileName || 'CSVファイルをクリックして選択'}</div>
            <div style={{color:'#9ca3af',fontSize:12,marginTop:4}}>.csv形式</div>
            <input ref={csvRef} type="file" accept=".csv" style={{display:'none'}} onChange={handleCSV} />
          </div>
          {sites.length > 0 && (
            <div style={{marginTop:16,borderRadius:10,overflow:'hidden',border:'1px solid #e5e7eb'}}>
              <div style={{background:'#1e3a5f',color:'white',padding:'8px 16px',fontSize:12,fontWeight:600,display:'grid',gridTemplateColumns:'40px 1fr 80px'}}>
                <span>#</span><span>サイト名</span><span style={{textAlign:'center'}}>形態</span>
              </div>
              {sites.map((s,i)=>(
                <div key={i} style={{padding:'8px 16px',fontSize:12,display:'grid',gridTemplateColumns:'40px 1fr 80px',alignItems:'center',background:i%2===0?'#f9fafb':'white',borderTop:'1px solid #f3f4f6'}}>
                  <span style={{color:'#6b7280'}}>{i+1}</span>
                  <span style={{color:'#111827',fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.name}</span>
                  <span style={{textAlign:'center',fontSize:11,background:s.mediaType==='大規模メディア'?'#dbeafe':'#d1fae5',color:s.mediaType==='大規模メディア'?'#1d4ed8':'#065f46',padding:'2px 6px',borderRadius:4,fontWeight:600}}>{s.mediaType==='大規模メディア'?'大規模':'中規模'}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* スクリーンショット */}
        <div style={{background:'white',borderRadius:16,padding:32,marginBottom:24,boxShadow:'0 1px 3px rgba(0,0,0,0.08)',border:'1px solid #e5e7eb'}}>
          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:8}}>
            <div style={{width:32,height:32,borderRadius:'50%',background:'#1e3a5f',color:'white',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:14}}>3</div>
            <h2 style={{margin:0,fontSize:18,fontWeight:700,color:'#1e3a5f'}}>スクリーンショット</h2>
          </div>
          <p style={{color:'#6b7280',fontSize:13,marginBottom:20}}>アメリカ・英語設定でのGoogle検索結果画像をアップロードしてください。</p>
          {(['p1','p2','p3'] as const).map((key, i) => {
            const labels = ['パターン①：プレスリリースタイトルで検索','パターン②：サービス名で検索','パターン③：会社名で検索']
            const refs = [p1Ref, p2Ref, p3Ref]
            return (
              <div key={key} style={{marginBottom:16}}>
                <label style={{...labelStyle,marginBottom:8}}>{labels[i]}</label>
                <div onClick={()=>refs[i].current?.click()} style={{border:'2px dashed #cbd5e1',borderRadius:10,padding:screenshotPreviews[key]?0:'20px',textAlign:'center',cursor:'pointer',background:'#f8fafc',overflow:'hidden',minHeight:60,display:'flex',alignItems:'center',justifyContent:'center'}}>
                  {screenshotPreviews[key]
                    ? <img src={screenshotPreviews[key]} alt="" style={{width:'100%',maxHeight:300,objectFit:'contain'}} />
                    : <div style={{color:'#9ca3af',fontSize:13}}>🖼️ クリックして画像を選択</div>
                  }
                  <input ref={refs[i]} type="file" accept="image/*" style={{display:'none'}} onChange={handleScreenshot(key)} />
                </div>
              </div>
            )
          })}
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !title || !date}
          style={{width:'100%',padding:'16px',borderRadius:12,border:'none',background:loading||!title||!date?'#e5e7eb':'linear-gradient(135deg,#1e3a5f,#2563eb)',color:loading||!title||!date?'#9ca3af':'white',fontSize:16,fontWeight:700,cursor:loading||!title||!date?'not-allowed':'pointer',boxShadow:loading||!title||!date?'none':'0 4px 16px rgba(37,99,235,0.35)'}}
        >
          {loading ? '⏳ レポート生成中...' : '📄 Wordレポートを生成してダウンロード'}
        </button>

        <div style={{textAlign:'center',color:'#9ca3af',fontSize:12,marginTop:24,marginBottom:40}}>
          Global Press レポート自動生成システム © 2026 APOC Co., Ltd.
        </div>
      </div>
    </div>
  )
}
