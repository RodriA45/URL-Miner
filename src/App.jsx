import { useState, useEffect } from 'react'
import { LayoutDashboard, FolderKanban, History, Settings, Copy, Download, Trash2, Replace, Moon, Sun } from 'lucide-react'
import './index.css'

function App() {
  const [inputText, setInputText] = useState('')
  const [extractedLinks, setExtractedLinks] = useState([])
  const [stats, setStats] = useState({ total: 0, duplicates: 0 })
  const [theme, setTheme] = useState('dark') // 4. Dark/Light Mode
  
  // Settings
  const [domainFilter, setDomainFilter] = useState('') // 2. Domain Filter
  const [prefix, setPrefix] = useState('') // 3. Formatter Prefix
  const [suffix, setSuffix] = useState('') // 3. Formatter Suffix
  
  // Tools
  const [findText, setFindText] = useState('')
  const [replaceText, setReplaceText] = useState('')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }

  const handleExtract = () => {
    // Regex for URLs
    const urlRegex = /(https?:\/\/[^\s"']+)/g
    const matches = inputText.match(urlRegex) || []
    
    let processed = matches
    
    // 2. Filter by Domain
    if (domainFilter.trim() !== '') {
      processed = processed.filter(link => link.toLowerCase().includes(domainFilter.toLowerCase()))
    }

    // Duplicates logic
    const uniqueLinks = [...new Set(processed)]
    const duplicatesRemoved = processed.length - uniqueLinks.length // 5. Duplicate Counter
    
    // 3. Format Links (Prefix/Suffix)
    const formattedLinks = uniqueLinks.map(link => `${prefix}${link}${suffix}`)

    setExtractedLinks(formattedLinks)
    setStats({
      total: formattedLinks.length,
      duplicates: duplicatesRemoved
    })
  }

  const handleReplace = () => {
    if (!findText) return
    const newLinks = extractedLinks.map(link => link.split(findText).join(replaceText))
    setExtractedLinks(newLinks)
  }

  const handleCopyAll = async () => {
    if (extractedLinks.length === 0) return
    await navigator.clipboard.writeText(extractedLinks.join('\n'))
    alert('¡Copiado al portapapeles!')
  }

  // 1. Export TXT
  const handleDownloadTxt = () => {
    if (extractedLinks.length === 0) return
    const blob = new Blob([extractedLinks.join('\n')], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'enlaces_extraidos.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  // 1. Export CSV
  const handleDownloadCsv = () => {
    if (extractedLinks.length === 0) return
    const csvContent = "URL\n" + extractedLinks.join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'enlaces_extraidos.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleClear = () => {
    setInputText('')
    setExtractedLinks([])
    setStats({ total: 0, duplicates: 0 })
  }

  return (
    <div className="app-container">
      <header className="top-bar">
        <div className="brand">
          <h1>URL_MINER</h1>
          <span>THE POWERFUL LINK EXTRACTOR TOOL</span>
        </div>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end'}}>
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === 'dark' ? <><Sun size={16}/> CLARO</> : <><Moon size={16}/> OSCURO</>}
          </button>
          <div style={{fontFamily: 'JetBrains Mono', fontSize: '0.9rem'}}>
            V_3.0.0 // SYS: ONLINE
          </div>
        </div>
      </header>

      <main className="main-grid">
        <aside className="sidebar">
          <button className="nav-btn active">
            <LayoutDashboard size={20} /> DASHBOARD
          </button>
          <button className="nav-btn">
            <FolderKanban size={20} /> PROJECTS
          </button>
          <button className="nav-btn">
            <History size={20} /> HISTORY
          </button>
          <button className="nav-btn">
            <Settings size={20} /> SETTINGS
          </button>
        </aside>

        <section className="content-area">
          {/* Input Panel */}
          <div className="panel">
            <div className="panel-header">
              <h2 className="panel-title">EXTRACT LINKS FROM SOURCE</h2>
            </div>
            
            <div className="panel-body">
              <div className="editor-section">
                <textarea 
                  placeholder="Pega aquí el texto masivo o código fuente..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
              </div>
              
              <div className="settings-section">
                
                <div className="settings-title">FILTROS INTELIGENTES</div>
                <div className="form-group">
                  <label>Contiene (ej. drive, youtube):</label>
                  <input 
                    type="text" 
                    placeholder="Dejar vacío para todo" 
                    value={domainFilter}
                    onChange={e => setDomainFilter(e.target.value)}
                  />
                </div>

                <div className="settings-title" style={{marginTop: '1rem'}}>FORMATEADOR</div>
                <div className="form-group">
                  <label>Prefijo (ej. &lt;a href="):</label>
                  <input 
                    type="text" 
                    value={prefix}
                    onChange={e => setPrefix(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Sufijo (ej. "&gt;Link&lt;/a&gt;):</label>
                  <input 
                    type="text" 
                    value={suffix}
                    onChange={e => setSuffix(e.target.value)}
                  />
                </div>

                <button 
                  className="btn-primary" 
                  onClick={handleExtract}
                  disabled={!inputText.trim()}
                  style={{marginTop: '1rem'}}
                >
                  EXTRACT 
                </button>
                <button className="btn-secondary" onClick={handleClear} style={{marginTop: '0.5rem'}}>
                  <Trash2 size={16} /> CLEAR
                </button>
              </div>
            </div>
          </div>

          {/* Output Panel */}
          <div className="panel">
            <div className="panel-header">
              <h2 className="panel-title">EXTRACTION RESULTS</h2>
            </div>
            
            <div className="panel-body" style={{flexDirection: 'column', gap: '1rem'}}>
              
              {/* Toolbar */}
              <div style={{display: 'flex', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap'}}>
                
                {/* 5. Duplicate Counter Banner */}
                <div style={{fontFamily: 'JetBrains Mono', fontWeight: 'bold'}}>
                  {stats.total > 0 ? (
                    <>
                      SE ENCONTRARON {stats.total} ENLACES 
                      {stats.duplicates > 0 && <span className="badge" style={{marginLeft: '10px'}}>({stats.duplicates} duplicados eliminados)</span>}
                    </>
                  ) : (
                    "0 LINKS FOUND"
                  )}
                </div>
                
                <div style={{display: 'flex', gap: '0.5rem'}}>
                  <button className="btn-secondary" onClick={handleDownloadTxt} disabled={stats.total === 0}>
                    <Download size={16} /> .TXT
                  </button>
                  <button className="btn-secondary" onClick={handleDownloadCsv} disabled={stats.total === 0}>
                    <Download size={16} /> .CSV
                  </button>
                  <button className="btn-secondary" onClick={handleCopyAll} disabled={stats.total === 0} style={{borderColor: 'var(--accent-color)', color: 'var(--text-primary)', background: 'var(--accent-color)'}}>
                    <span style={{color: 'black', display:'flex', gap:'5px', fontWeight:'bold', alignItems:'center'}}>
                      <Copy size={16} /> COPY ALL
                    </span>
                  </button>
                </div>
              </div>

              {/* Bulk Find & Replace */}
              {stats.total > 0 && (
                <div className="tools-group">
                  <input 
                    type="text"
                    placeholder="Find (e.g., share)" 
                    value={findText}
                    onChange={e => setFindText(e.target.value)}
                  />
                  <input 
                    type="text"
                    placeholder="Replace (e.g., view)" 
                    value={replaceText}
                    onChange={e => setReplaceText(e.target.value)}
                  />
                  <button className="btn-secondary" onClick={handleReplace}>
                    <Replace size={16} /> BATCH REPLACE
                  </button>
                </div>
              )}

              {/* Table */}
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th style={{width: '50px'}}>#</th>
                      <th style={{width: '80px'}}>TYPE</th>
                      <th>URL</th>
                      <th className="action-col">ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {extractedLinks.length > 0 ? (
                      extractedLinks.map((link, idx) => (
                        <tr key={idx}>
                          <td>{idx + 1}</td>
                          <td>[L]</td>
                          <td className="url-col">{link}</td>
                          <td className="action-col">
                            <span style={{cursor: 'pointer', opacity: 0.7, fontWeight: 'bold'}} onClick={() => {
                              navigator.clipboard.writeText(link);
                            }}>[Copy]</span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" style={{textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)'}}>
                          NO DATA TO DISPLAY. PASTE TEXT AND EXTRACT.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          </div>

        </section>
      </main>

      <footer className="status-bar">
        <div>(L) {stats.total} Items Loaded</div>
        <div style={{color: 'var(--accent-cyan)', fontWeight: 'bold'}}>SYSTEM STATUS: NOMINAL</div>
      </footer>
    </div>
  )
}

export default App
