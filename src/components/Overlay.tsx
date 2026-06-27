import { motion } from 'framer-motion'
import { useState } from 'react'

// Swap to /logo.png once you copy your PNG to public/logo.png
// SVG fallback is used until then — layout is identical either way
const LOGO_PNG = '/logo.png'
const LOGO_SVG = '/logo.svg'

function Logo() {
  const [usePng, setUsePng] = useState(true)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.0, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      style={{
        width: '100%',
        maxWidth: 'clamp(220px, 24vw, 380px)',
        aspectRatio: '1 / 1',
        position: 'relative',
        flexShrink: 0,
      }}
    >
      <img
        src={usePng ? LOGO_PNG : LOGO_SVG}
        onError={() => setUsePng(false)}
        alt="GESC – Gippsland Environmental Sweeping Company"
        width={380}
        height={380}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          objectPosition: 'left center',
          // Makes white pixels disappear on dark backgrounds:
          // white × dark = transparent, orange × dark = orange (preserved)
          mixBlendMode: 'screen',
          imageRendering: 'crisp-edges',
          display: 'block',
          filter: 'drop-shadow(0 0 18px rgba(224, 96, 0, 0.12))',
        }}
        draggable={false}
      />
    </motion.div>
  )
}

export default function Overlay() {
  const ease = [0.16, 1, 0.3, 1] as const

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      zIndex: 10,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
      padding: 'clamp(28px, 5vw, 64px)',
    }}>

      {/* Top-right status chip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5, duration: 1.5 }}
        style={{
          position: 'absolute',
          top: 'clamp(24px, 4vh, 44px)',
          right: 'clamp(24px, 4vw, 52px)',
          color: 'rgba(224, 130, 30, 0.7)',
          fontSize: '10px',
          fontWeight: 600,
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <motion.span
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            width: '5px',
            height: '5px',
            borderRadius: '50%',
            background: '#e06000',
            display: 'inline-block',
            boxShadow: '0 0 6px #e06000',
          }}
        />
        Fleet Active · Gippsland
      </motion.div>

      {/* Main content block — logo + taglines */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0',
        maxWidth: 'clamp(280px, 36vw, 480px)',
      }}>

        {/* ─── LOGO ─── */}
        <Logo />

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 2.0, duration: 0.9, ease }}
          style={{
            height: '1px',
            background: 'linear-gradient(90deg, rgba(224,96,0,0.45) 0%, rgba(255,255,255,0.05) 60%, transparent 100%)',
            marginTop: '0.4rem',
            marginBottom: '1.1rem',
            transformOrigin: 'left center',
          }}
        />

        {/* Primary tagline */}
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.3, duration: 1.2, ease }}
          style={{
            color: 'rgba(210, 200, 185, 0.75)',
            fontSize: 'clamp(12px, 1.25vw, 16px)',
            fontWeight: 400,
            letterSpacing: '0.05em',
            lineHeight: 1.75,
            margin: 0,
          }}
        >
          Commercial sweeping. Industrial sites. Car parks. Roads.
        </motion.p>

        {/* Secondary tagline */}
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.6, duration: 1.2, ease }}
          style={{
            color: 'rgba(224, 140, 40, 0.8)',
            fontSize: 'clamp(12px, 1.25vw, 16px)',
            fontWeight: 500,
            letterSpacing: '0.05em',
            lineHeight: 1.75,
            margin: '0.15rem 0 0',
          }}
        >
          Cleaner surfaces, sharper businesses.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.0, duration: 1.2 }}
          style={{ marginTop: '1.8rem', display: 'flex', gap: '12px', alignItems: 'center', pointerEvents: 'auto' }}
        >
          <button style={{
            background: 'transparent',
            border: '1px solid rgba(224, 96, 0, 0.7)',
            color: '#e06000',
            padding: '11px 26px',
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            fontFamily: 'inherit',
            transition: 'all 0.2s ease',
          }}
            onMouseEnter={e => { (e.target as HTMLButtonElement).style.background = 'rgba(224,96,0,0.12)' }}
            onMouseLeave={e => { (e.target as HTMLButtonElement).style.background = 'transparent' }}
          >
            Get a Quote
          </button>
          <span style={{
            color: 'rgba(200, 190, 175, 0.35)',
            fontSize: '11px',
            fontWeight: 400,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            pointerEvents: 'auto',
          }}>
            Our Services ↓
          </span>
        </motion.div>
      </div>

      {/* Vignette */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: -1, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at 60% 40%, transparent 25%, rgba(0,0,0,0.6) 100%)',
      }} />

      {/* Bottom gradient */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%', zIndex: -1, pointerEvents: 'none',
        background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)',
      }} />
    </div>
  )
}
