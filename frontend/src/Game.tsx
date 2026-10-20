import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Check, Disc3, Search, SkipForward, X } from 'lucide-react'
import { matches, normalize, STAGES } from './lib/game'

type Album = { id: string; title: string; artist: string; coverUrl: string; spotifyUrl: string }
type Guess = { title: string; correct: boolean; skipped?: boolean }
type Round = { album: Album; guesses: Guess[] }
const apiBase = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')
const storageKey = 'coverdup-round-v2'
function restore(): Round | null {
  try {
    const value = JSON.parse(localStorage.getItem(storageKey) || 'null')
    return value && typeof value.album?.id === 'string' && typeof value.album?.title === 'string' && typeof value.album?.coverUrl === 'string' && Array.isArray(value.guesses) && value.guesses.length <= 5 && value.guesses.every((g: Guess) => typeof g.title === 'string' && typeof g.correct === 'boolean') ? value : null
  } catch { return null }
}

export default function Game() {
  const [round, setRound] = useState<Round | null>(restore)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [guess, setGuess] = useState('')
  const [selected, setSelected] = useState<Album | null>(null)
  const [suggestions, setSuggestions] = useState<Album[]>([])
  const [active, setActive] = useState(-1)
  const [searchError, setSearchError] = useState('')
  const [artStatus, setArtStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [retryArt, setRetryArt] = useState(0)
  const [notice, setNotice] = useState('')
  const canvas = useRef<HTMLCanvasElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const image = useRef<HTMLImageElement | null>(null)
  const request = useRef(0)
  const fetchingRound = useRef(false)
  const won = round?.guesses.some(g => g.correct) || false
  const finished = won || (round?.guesses.length || 0) === 5
  const stage = Math.min(round?.guesses.length || 0, 4)

  async function newRound() {
    if (fetchingRound.current) return
    fetchingRound.current = true
    setLoading(true); setError(''); setNotice('')
    try {
      const params = new URLSearchParams({ mix: 'mixed', exclude: round?.album.id || '' })
      const response = await fetch(`${apiBase}/spotify/random?${params}`, { signal: AbortSignal.timeout(20000) })
      const data = await response.json().catch(() => { throw new Error('Spotify unavailable. Try again.') })
      if (!response.ok) throw new Error(data.message)
      if (!data.album?.coverUrl || !data.album?.title) throw new Error('Spotify returned an incomplete album. Try again.')
      setRound({ album: data.album, guesses: [] }); setGuess(''); setSelected(null); setSuggestions([])
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not load a record. Try again.') }
    finally { fetchingRound.current = false; setLoading(false) }
  }
  useEffect(() => { if (!round) void newRound() }, [])
  useEffect(() => {
    if (round) { try { localStorage.setItem(storageKey, JSON.stringify(round)) } catch { /* Private browsing can disable storage. */ } }
  }, [round])

  useEffect(() => {
    if (!round) return
    let disposed = false
    setArtStatus('loading'); image.current = null
    const art = new Image()
    art.onload = () => { if (!disposed) { image.current = art; setArtStatus('ready') } }
    art.onerror = () => { if (!disposed) setArtStatus('error') }
    art.src = round.album.coverUrl
    return () => { disposed = true }
  }, [round?.album.coverUrl, retryArt])
  useEffect(() => {
    if (!canvas.current || !image.current || artStatus !== 'ready') return
    const size = finished ? 600 : STAGES[stage]
    canvas.current.width = size; canvas.current.height = size
    canvas.current.getContext('2d')?.drawImage(image.current, 0, 0, size, size)
  }, [stage, finished, artStatus, round?.album.id])

  useEffect(() => {
    const version = ++request.current
    setActive(-1); setSuggestions([]); setSearchError('')
    if (guess.trim().length < 2 || selected || finished) return
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`${apiBase}/spotify/suggestions?q=${encodeURIComponent(guess.trim())}`, { signal: controller.signal })
        if (!response.ok) throw new Error()
        const data = await response.json()
        if (version === request.current) setSuggestions(data.suggestions || [])
      } catch { if (!controller.signal.aborted && version === request.current) setSearchError('Search is unavailable. You can still guess by title.') }
    }, 250)
    return () => { clearTimeout(timer); controller.abort() }
  }, [guess, selected, finished])

  function choose(album: Album) { setSelected(album); setGuess(album.title); setSuggestions([]); input.current?.focus() }
  function submit(skipped = false) {
    if (!round || finished || loading || artStatus !== 'ready' || (!skipped && !guess.trim())) return
    if (!skipped && round.guesses.some(g => !g.skipped && normalize(g.title) === normalize(guess))) { setNotice('Already guessed.'); return }
    const correct = !skipped && (selected ? selected.id === round.album.id || (matches(round.album.title, selected.title) && normalize(round.album.artist) === normalize(selected.artist)) : matches(round.album.title, guess))
    setRound({ ...round, guesses: [...round.guesses, { title: skipped ? 'Skipped' : guess.trim(), correct, skipped }] })
    setGuess(''); setSelected(null); setSuggestions([]); setNotice(''); input.current?.focus()
  }

  return <div className="site-shell">
    <header><a className="wordmark" href="/" aria-label="CoverdUp home"><span className="brand-icon"><Disc3 size={20} /></span>coverd<span>up</span><span className="brand-dot">®</span></a></header>
    <main aria-label="Album guessing game">
      <div className="cover-frame">
        <canvas ref={canvas} role="img" aria-label={finished && round ? `${round.album.title} by ${round.album.artist}` : `Mystery album, attempt ${stage + 1} of 5`} style={{ imageRendering: finished ? 'auto' : 'pixelated' }} />
        {(loading || artStatus !== 'ready') && <div className="cover-overlay">{loading || (artStatus === 'loading' && !error) ? <Disc3 className="spinning" size={24} aria-label="Loading album" /> : <><span>{error ? 'Spotify unavailable' : 'Artwork unavailable'}</span><button onClick={() => error ? newRound() : setRetryArt(n => n + 1)}>Retry</button></>}</div>}
      </div>
      <div className="progress" aria-label={`Attempt ${finished ? round?.guesses.length : stage + 1} of 5`}>{STAGES.map((_, i) => <span key={i} title={round?.guesses[i]?.title || `Attempt ${i + 1}`} className={`dot ${round?.guesses[i] ? round.guesses[i].correct ? 'correct' : 'miss' : !finished && i === stage ? 'current' : ''}`} />)}</div>
      {!finished ? <form onSubmit={e => { e.preventDefault(); if (active >= 0 && suggestions[active]) choose(suggestions[active]); else submit() }}>
        <div className="search-wrap"><Search size={18} aria-hidden="true" /><input id="album-guess" ref={input} value={guess} aria-label="Search albums or artists" placeholder="Album or artist…" autoComplete="off" disabled={loading || !round || artStatus !== 'ready'} role="combobox" aria-autocomplete="list" aria-expanded={suggestions.length > 0} aria-controls="album-results" aria-activedescendant={active >= 0 ? `result-${active}` : undefined} onChange={e => { setGuess(e.target.value); setSelected(null); setNotice('') }} onKeyDown={e => { if (e.key === 'ArrowDown') { e.preventDefault(); setActive(n => Math.min(n + 1, suggestions.length - 1)) } if (e.key === 'ArrowUp') { e.preventDefault(); setActive(n => Math.max(-1, n - 1)) } if (e.key === 'Escape') { setSuggestions([]); setActive(-1) } }} />
          <button className="submit" aria-label="Submit guess" disabled={!guess.trim() || loading || artStatus !== 'ready'}><ArrowRight size={19} /></button>
          {!!suggestions.length && <ul id="album-results" role="listbox">{suggestions.map((a, i) => <li key={a.id} id={`result-${i}`} role="option" aria-selected={active === i}><button type="button" className={active === i ? 'highlight' : ''} onClick={() => choose(a)}><span>{a.title}<small>{a.artist}</small></span><ArrowRight size={15} /></button></li>)}</ul>}
        </div>
        <div className="below-input"><span className="feedback" role="status">{notice || searchError}</span><button className="skip" type="button" disabled={!round || loading || artStatus !== 'ready'} onClick={() => submit(true)}>Skip <SkipForward size={13} /></button></div>
      </form> : <div className="result"><h1>{round?.album.title}</h1><p>{round?.album.artist}</p><div><a href={round?.album.spotifyUrl} target="_blank" rel="noreferrer">Spotify ↗</a><button onClick={newRound} disabled={loading}>Next <ArrowRight size={16} /></button></div></div>}
      {error && <p className="error" role="alert">{error}</p>}
      {!!round?.guesses.length && !finished && <ol className="guess-history">{round.guesses.map((g, i) => <li key={i}><span>{g.title}</span>{g.correct ? <Check size={13} /> : <X size={13} />}</li>)}</ol>}
    </main>
  </div>
}
