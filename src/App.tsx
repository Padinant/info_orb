import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import facts from './facts.json'

// ── Palettes ────────────────────────────────────────────────────────────────

const PALETTES: Record<string, { label: string; vars: Record<string, string> }> = {
  cosmos: {
    label: 'Cosmos',
    vars: {
      '--void': '#070611',
      '--deep-space': '#17102B',
      '--astral-violet': '#5E3A9E',
      '--orb-purple': '#8B5CF6',
      '--nebula-lavender': '#BFA7FF',
      '--cosmic-blue': '#536DFE',
      '--starlight': '#F5F1FF',
      '--moon-dust': '#B9B2C9',
    },
  },
  void: {
    label: 'Void',
    vars: {
      '--void': '#050508',
      '--deep-space': '#0d0d14',
      '--astral-violet': '#1e1e2c',
      '--orb-purple': '#a8acc8',
      '--nebula-lavender': '#dcdff0',
      '--cosmic-blue': '#5c6490',
      '--starlight': '#f0f0fa',
      '--moon-dust': '#686898',
    },
  },
  accessible: {
    label: 'Accessible',
    vars: {
      '--void': '#060b0d',
      '--deep-space': '#0d1820',
      '--astral-violet': '#0a2d40',
      '--orb-purple': '#00b4d8',
      '--nebula-lavender': '#90e0ef',
      '--cosmic-blue': '#0096c7',
      '--starlight': '#ffffff',
      '--moon-dust': '#7ab8ca',
    },
  },
  royal: {
    label: 'Royal',
    vars: {
      '--void': '#0a0700',
      '--deep-space': '#160f00',
      '--astral-violet': '#3d1860',
      '--orb-purple': '#c8a018',
      '--nebula-lavender': '#f0d060',
      '--cosmic-blue': '#1a5c8a',
      '--starlight': '#fff5e0',
      '--moon-dust': '#c8a87a',
    },
  },
}

const SWATCH_KEYS = ['--void', '--orb-purple', '--nebula-lavender', '--starlight'] as const

// ── Sub-components ───────────────────────────────────────────────────────────

function PalettePanel({
  current,
  onSelect,
}: {
  current: string
  onSelect: (name: string) => void
}) {
  return (
    <div className="palette-panel">
      <p className="panel-label">Color Palette</p>
      <div className="panel-options">
        {Object.entries(PALETTES).map(([name, { label, vars }]) => (
          <button
            key={name}
            className={`panel-option ${current === name ? 'option-active' : ''}`}
            onClick={() => onSelect(name)}
          >
            <div className="swatch-strip">
              {SWATCH_KEYS.map(key => (
                <span key={key} className="swatch-seg" style={{ background: vars[key] }} />
              ))}
            </div>
            <span className="option-name">{label}</span>
            {current === name && <span className="option-check" aria-hidden="true">✦</span>}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Star generation ──────────────────────────────────────────────────────────

interface Star {
  id: number; x: number; y: number; size: number
  op: number; dur: number; delay: number
}

function generateStars(count: number): Star[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() < 0.06 ? Math.random() * 1.5 + 2.5 : Math.random() * 1.5 + 0.4,
    op: Math.random() * 0.55 + 0.15,
    dur: Math.random() * 4 + 2,
    delay: Math.random() * 7,
  }))
}

// ── App ──────────────────────────────────────────────────────────────────────

const TRIGGER_SWATCHES = ['--void', '--orb-purple', '--starlight'] as const

export default function App() {
  const [currentFact, setCurrentFact] = useState<string | null>(null)
  const [isRevealing, setIsRevealing] = useState(false)
  const [palette, setPalette] = useState('cosmos')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const stars = useMemo(() => generateStars(170), [])
  const settingsRootRef = useRef<HTMLDivElement>(null)

  // Close panel on outside click
  useEffect(() => {
    if (!settingsOpen) return
    const handler = (e: MouseEvent) => {
      if (settingsRootRef.current && !settingsRootRef.current.contains(e.target as Node)) {
        setSettingsOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [settingsOpen])

  const handleOrbClick = useCallback(() => {
    if (isRevealing) return
    setIsRevealing(true)
    const next = facts[Math.floor(Math.random() * facts.length)] as string
    setTimeout(() => {
      setCurrentFact(next)
      setIsRevealing(false)
    }, 380)
  }, [isRevealing])

  const handleSelectPalette = useCallback((name: string) => {
    setPalette(name)
    setSettingsOpen(false)
  }, [])

  const paletteVars = PALETTES[palette].vars

  return (
    <div className="app-root" style={paletteVars as React.CSSProperties}>
      {/* Starfield */}
      <div className="stars-layer" aria-hidden="true">
        {stars.map(star => (
          <div
            key={star.id}
            className="star"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              '--op': star.op,
              '--dur': `${star.dur}s`,
              '--delay': `${star.delay}s`,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Black hole overlay */}
      <div className="blackhole-bg" aria-hidden="true" />

      {/* Main oracle stage */}
      <main className="orb-stage">
        <h1 className="site-title">The Oracle Orb</h1>

        <div className={`fact-display ${isRevealing ? 'fact-out' : 'fact-in'}`}>
          {currentFact ? (
            <p className="fact-text">&ldquo;{currentFact}&rdquo;</p>
          ) : (
            <p className="fact-empty">A universe of secrets awaits...</p>
          )}
        </div>

        <button
          className={`magic-orb ${isRevealing ? 'orb-pressing' : ''}`}
          onClick={handleOrbClick}
          aria-label="Click to reveal a fun fact from the oracle"
        />

        <p className="click-instruction">
          {currentFact ? 'touch again to reveal another secret' : 'touch the orb'}
        </p>
      </main>

      {/* Palette settings */}
      <div className="settings-root" ref={settingsRootRef}>
        {settingsOpen && (
          <PalettePanel current={palette} onSelect={handleSelectPalette} />
        )}
        <button
          className={`settings-trigger ${settingsOpen ? 'trigger-open' : ''}`}
          onClick={() => setSettingsOpen(s => !s)}
          aria-label="Change color palette"
          aria-expanded={settingsOpen}
        >
          <div className="trigger-dots" aria-hidden="true">
            {TRIGGER_SWATCHES.map(key => (
              <span
                key={key}
                className="trigger-dot"
                style={{ background: paletteVars[key] }}
              />
            ))}
          </div>
          <span className="trigger-label">palette</span>
        </button>
      </div>
    </div>
  )
}
