// ZipperLoader.jsx — Full premium rewrite with curved peeling animation
import { useEffect, useRef, useState, useCallback } from 'react'

const TOOTH_COUNT = 60
const DURATION_MS = 2200
const START_DELAY = 300

function easeInOutQuart(t) {
  return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2
}

// ─── Left Tooth Row Component ────────────────────────────────────────────────
function LeftToothRow({ y, currentY, panelWidth }) {
  const distance = currentY - y
  const isSeparated = y < currentY

  let transform = 'translateX(0px) rotate(0deg)'
  let opacity = 1

  if (isSeparated) {
    const pct = Math.pow(distance / (currentY + 1), 1.6)
    const shiftX = pct * panelWidth

    const nextY = y + 5
    const nextPct = nextY >= currentY ? 0 : Math.pow((currentY - nextY) / (currentY + 1), 1.6)
    const nextShiftX = nextPct * panelWidth

    const dx = nextShiftX - shiftX
    const dy = 5
    const angleRad = Math.atan2(dx, dy)
    const angleDeg = angleRad * (180 / Math.PI)

    // Left teeth rotate counter-clockwise, add a separation gap
    const sep = -10 * Math.min(1, distance / 50)
    transform = `translateX(${-shiftX + sep}px) rotate(${-angleDeg}deg)`
    opacity = Math.max(0.15, 1 - distance / 300)
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: y,
        right: '50%',
        width: 60,
        height: 14,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        transform,
        opacity,
        transition: 'transform 0.05s linear, opacity 0.1s ease',
      }}
    >
      {/* Tape segment */}
      <div style={{
        width: 20,
        height: 14,
        background: 'linear-gradient(90deg, #1f2d3d, #304455, #243543)',
        borderRight: '1.5px solid #486581',
        boxShadow: 'inset -2px 0 4px rgba(0,0,0,0.5)',
      }} />
      
      {/* Tooth (SVG-based) */}
      <svg
        width="16"
        height="10"
        viewBox="0 0 16 10"
        style={{
          filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.6))',
          flexShrink: 0,
        }}
      >
        <path
          d="M2,1 L14,3 L14,7 L2,9 Z"
          fill="url(#leftToothGrad)"
          stroke="#444"
          strokeWidth="0.5"
        />
        <line x1="2" y1="1" x2="14" y2="3" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
        <circle cx="14" cy="5" r="1.5" fill="#bbb" stroke="#555" strokeWidth="0.4" />
        <defs>
          <linearGradient id="leftToothGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#eaeaea" />
            <stop offset="40%" stopColor="#b5b5b5" />
            <stop offset="100%" stopColor="#666666" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}

// ─── Right Tooth Row Component ───────────────────────────────────────────────
function RightToothRow({ y, currentY, panelWidth }) {
  const distance = currentY - y
  const isSeparated = y < currentY

  let transform = 'translateX(0px) rotate(0deg)'
  let opacity = 1

  if (isSeparated) {
    const pct = Math.pow(distance / (currentY + 1), 1.6)
    const shiftX = pct * panelWidth

    const nextY = y + 5
    const nextPct = nextY >= currentY ? 0 : Math.pow((currentY - nextY) / (currentY + 1), 1.6)
    const nextShiftX = nextPct * panelWidth

    const dx = nextShiftX - shiftX
    const dy = 5
    const angleRad = Math.atan2(dx, dy)
    const angleDeg = angleRad * (180 / Math.PI)

    // Right teeth rotate clockwise
    const sep = 10 * Math.min(1, distance / 50)
    transform = `translateX(${shiftX + sep}px) rotate(${angleDeg}deg)`
    opacity = Math.max(0.15, 1 - distance / 300)
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: y,
        left: '50%',
        width: 60,
        height: 14,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        transform,
        opacity,
        transition: 'transform 0.05s linear, opacity 0.1s ease',
      }}
    >
      {/* Tooth (SVG-based) */}
      <svg
        width="16"
        height="10"
        viewBox="0 0 16 10"
        style={{
          filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.6))',
          transform: 'scaleX(-1)',
          flexShrink: 0,
        }}
      >
        <path
          d="M2,1 L14,3 L14,7 L2,9 Z"
          fill="url(#rightToothGrad)"
          stroke="#444"
          strokeWidth="0.5"
        />
        <line x1="2" y1="1" x2="14" y2="3" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
        <circle cx="14" cy="5" r="1.5" fill="#bbb" stroke="#555" strokeWidth="0.4" />
        <defs>
          <linearGradient id="rightToothGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#eaeaea" />
            <stop offset="40%" stopColor="#b5b5b5" />
            <stop offset="100%" stopColor="#666666" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Tape segment */}
      <div style={{
        width: 20,
        height: 14,
        background: 'linear-gradient(270deg, #1f2d3d, #304455, #243543)',
        borderLeft: '1.5px solid #486581',
        boxShadow: 'inset 2px 0 4px rgba(0,0,0,0.5)',
      }} />
    </div>
  )
}

// ─── Pull tab component ───────────────────────────────────────────────────────
function ZipperPull({ y }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: y,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pointerEvents: 'none',
        filter: 'drop-shadow(0 6px 20px rgba(0,0,0,0.9))',
      }}
    >
      {/* Cord loop at top */}
      <svg width="24" height="20" viewBox="0 0 24 20" style={{ marginBottom: -2 }}>
        <path
          d="M12,2 C6,2 3,7 3,10 C3,14 6,18 12,18 C18,18 21,14 21,10 C21,7 18,2 12,2 Z"
          fill="none"
          stroke="#999"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M12,2 L12,0"
          stroke="#888"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>

      {/* Main pull body */}
      <div
        style={{
          width: 58,
          height: 36,
          background: 'linear-gradient(160deg, #f0f0f0 0%, #c8c8c8 35%, #a0a0a0 65%, #787878 100%)',
          borderRadius: 5,
          border: '1px solid #555',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 2,
          boxShadow: `
            inset 0 1px 0 rgba(255,255,255,0.6),
            inset 0 -1px 0 rgba(0,0,0,0.4),
            inset 1px 0 0 rgba(255,255,255,0.3),
            inset -1px 0 0 rgba(0,0,0,0.3)
          `,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{
          position: 'absolute',
          top: 0, left: '15%',
          width: '30%', height: '100%',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.35) 0%, transparent 100%)',
          borderRadius: 2,
        }} />
        <div style={{ width: 32, height: 1.5, background: 'rgba(0,0,0,0.3)', borderRadius: 1 }} />
        <div style={{
          fontSize: 7,
          fontWeight: 800,
          letterSpacing: '0.15em',
          color: '#333',
          fontFamily: 'monospace',
          textShadow: '0 1px 0 rgba(255,255,255,0.5)',
        }}>
          STITCH3D
        </div>
        <div style={{ width: 32, height: 1.5, background: 'rgba(0,0,0,0.3)', borderRadius: 1 }} />
      </div>

      {/* Bottom connector nub */}
      <div style={{
        width: 10, height: 6,
        background: 'linear-gradient(180deg, #aaa, #666)',
        borderRadius: '0 0 3px 3px',
        border: '1px solid #444',
        borderTop: 'none',
      }} />
    </div>
  )
}

// ─── Main Zipper Loader ───────────────────────────────────────────────────────
export default function ZipperLoader({ onComplete }) {
  const [progress, setProgress] = useState(0)          // 0 → 1
  const [phase, setPhase] = useState('zipping')        // zipping | peeling | done
  const [separatedCount, setSeparatedCount] = useState(0)

  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1000,
    height: typeof window !== 'undefined' ? window.innerHeight : 800
  });

  const leftPanelRef = useRef(null)
  const rightPanelRef = useRef(null)
  const rafRef = useRef(null)
  const startRef = useRef(null)

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const skipAll = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    setPhase('done')
    setTimeout(onComplete, 500)
  }, [onComplete])

  // Helpers to generate clip-path strings
  const getLeftClipPath = (currentY, screenH) => {
    if (currentY <= 0) return 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)';
    const points = ['0% 0%'];
    const N = 15;
    for (let i = 0; i <= N; i++) {
      const y = (i / N) * screenH;
      let shiftPercent = 0;
      if (y < currentY) {
        const distance = currentY - y;
        const pct = Math.pow(distance / (currentY + 1), 1.6);
        shiftPercent = pct * 100;
      }
      const x = Math.max(0, 100 - shiftPercent);
      points.push(`${x.toFixed(1)}% ${(y / screenH * 100).toFixed(1)}%`);
    }
    points.push('0% 100%');
    return `polygon(${points.join(', ')})`;
  };

  const getRightClipPath = (currentY, screenH) => {
    if (currentY <= 0) return 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)';
    const points = ['100% 0%'];
    const N = 15;
    for (let i = 0; i <= N; i++) {
      const y = (i / N) * screenH;
      let shiftPercent = 0;
      if (y < currentY) {
        const distance = currentY - y;
        const pct = Math.pow(distance / (currentY + 1), 1.6);
        shiftPercent = pct * 100;
      }
      const x = Math.min(100, shiftPercent);
      points.push(`${x.toFixed(1)}% ${(y / screenH * 100).toFixed(1)}%`);
    }
    points.push('100% 100%');
    return `polygon(${points.join(', ')})`;
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      function tick(timestamp) {
        if (!startRef.current) startRef.current = timestamp
        const elapsed = timestamp - startRef.current
        const raw = Math.min(elapsed / DURATION_MS, 1)
        const eased = easeInOutQuart(raw)

        const currentY = eased * screenSize.height;
        setProgress(eased)
        setSeparatedCount(Math.floor(eased * TOOTH_COUNT))

        // Update clip paths dynamically
        if (leftPanelRef.current && rightPanelRef.current) {
          leftPanelRef.current.style.clipPath = getLeftClipPath(currentY, screenSize.height);
          rightPanelRef.current.style.clipPath = getRightClipPath(currentY, screenSize.height);
        }

        if (raw < 1) {
          rafRef.current = requestAnimationFrame(tick)
        } else {
          // Zipper fully open — start panel peel
          setPhase('peeling')
          setTimeout(() => {
            setPhase('done')
            setTimeout(onComplete, 700)
          }, 1000)
        }
      }
      rafRef.current = requestAnimationFrame(tick)
    }, START_DELAY)

    return () => {
      clearTimeout(timeout)
      cancelAnimationFrame(rafRef.current)
    }
  }, [onComplete, screenSize.height])

  const pullY = `calc(${progress * 100}vh - 36px)`
  const toothSpacing = screenSize.height / TOOTH_COUNT
  const panelWidth = screenSize.width / 2

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      overflow: 'hidden',
      pointerEvents: phase === 'done' ? 'none' : 'all',
      opacity: phase === 'done' ? 0 : 1,
      transition: phase === 'done' ? 'opacity 0.6s ease' : 'none',
    }}>

      {/* ── LEFT PANEL ────────────────────────────────────── */}
      <div 
        ref={leftPanelRef}
        style={{
          position: 'absolute',
          top: 0, left: 0,
          width: '50%',
          height: '100%',
          background: '#0d0d0d',
          backgroundImage: `
            repeating-linear-gradient(
              90deg,
              transparent 0px,
              transparent 3px,
              rgba(255,255,255,0.012) 3px,
              rgba(255,255,255,0.012) 4px
            )
          `,
          transform: phase === 'peeling' || phase === 'done'
            ? 'translateX(-105%)' : 'translateX(0)',
          transition: 'transform 0.95s cubic-bezier(0.76, 0, 0.24, 1)',
          boxShadow: 'inset -8px 0 24px rgba(0,0,0,0.6)',
        }}
      />

      {/* ── RIGHT PANEL ───────────────────────────────────── */}
      <div 
        ref={rightPanelRef}
        style={{
          position: 'absolute',
          top: 0, right: 0,
          width: '50%',
          height: '100%',
          background: '#0d0d0d',
          backgroundImage: `
            repeating-linear-gradient(
              90deg,
              transparent 0px,
              transparent 3px,
              rgba(255,255,255,0.012) 3px,
              rgba(255,255,255,0.012) 4px
            )
          `,
          transform: phase === 'peeling' || phase === 'done'
            ? 'translateX(105%)' : 'translateX(0)',
          transition: 'transform 0.95s cubic-bezier(0.76, 0, 0.24, 1)',
          boxShadow: 'inset 8px 0 24px rgba(0,0,0,0.6)',
        }}
      />

      {/* ── ZIPPER CENTER ASSEMBLY ────────────────────────── */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 120,
        height: '100%',
        pointerEvents: 'none',
        zIndex: 20,
        opacity: phase === 'peeling' || phase === 'done' ? 0 : 1,
        transition: 'opacity 0.4s ease',
      }}>

        {/* LEFT TEETH COLUMN */}
        {Array.from({ length: TOOTH_COUNT }).map((_, i) => (
          <LeftToothRow
            key={`l-${i}`}
            y={i * toothSpacing}
            currentY={progress * screenSize.height}
            panelWidth={panelWidth}
          />
        ))}

        {/* RIGHT TEETH COLUMN */}
        {Array.from({ length: TOOTH_COUNT }).map((_, i) => (
          <RightToothRow
            key={`r-${i}`}
            y={i * toothSpacing}
            currentY={progress * screenSize.height}
            panelWidth={panelWidth}
          />
        ))}

      </div>

      {/* ── ZIPPER PULL TAB ───────────────────────────────── */}
      <div style={{
        opacity: phase === 'peeling' || phase === 'done' ? 0 : 1,
        transition: 'opacity 0.4s ease',
      }}>
        {/* Glowing aura behind pull tab */}
        <div style={{
          position: 'absolute',
          top: `calc(${pullY} - 22px)`,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 90,
          height: 90,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.35) 0%, rgba(139,92,246,0) 70%)',
          filter: 'blur(4px)',
          zIndex: 50,
          pointerEvents: 'none',
        }} />

        <ZipperPull y={pullY} />
      </div>

      {/* ── BOTTOM STOP ───────────────────────────────────── */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 24, height: 12,
        background: 'linear-gradient(180deg, #aaa, #666)',
        borderRadius: '4px 4px 0 0',
        border: '1px solid #444',
        borderBottom: 'none',
        zIndex: 25,
        boxShadow: '0 -4px 12px rgba(0,0,0,0.5)',
        opacity: phase === 'peeling' || phase === 'done' ? 0 : 1,
        transition: 'opacity 0.4s ease',
      }} />

      {/* ── SKIP BUTTON ───────────────────────────────────── */}
      <button
        onClick={skipAll}
        style={{
          position: 'absolute',
          bottom: 28,
          right: 28,
          background: 'transparent',
          border: '1px solid rgba(255,255,255,0.18)',
          color: 'rgba(255,255,255,0.45)',
          padding: '8px 18px',
          borderRadius: 24,
          fontSize: 12,
          fontFamily: 'inherit',
          letterSpacing: '0.06em',
          cursor: 'pointer',
          zIndex: 200,
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={e => {
          e.target.style.borderColor = 'rgba(255,255,255,0.5)'
          e.target.style.color = 'rgba(255,255,255,0.85)'
        }}
        onMouseLeave={e => {
          e.target.style.borderColor = 'rgba(255,255,255,0.18)'
          e.target.style.color = 'rgba(255,255,255,0.45)'
        }}
      >
        Skip intro →
      </button>
    </div>
  )
}
