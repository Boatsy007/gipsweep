import { motion } from 'framer-motion'

export default function Overlay() {
  const ease = [0.16, 1, 0.3, 1] as const

  return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10,
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      padding: 'clamp(32px, 6vw, 72px)',
    }}>

      {/* Top-left wordmark */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 10, duration: 2 }}
        style={{
          position: 'absolute', top: 'clamp(24px, 4vh, 48px)', left: 'clamp(24px, 4vw, 56px)',
          color: 'rgba(255,255,255,0.35)', fontSize: '11px', fontWeight: 600,
          letterSpacing: '0.32em', textTransform: 'uppercase',
        }}
      >
        Gippsland Environmental Sweeping Co.
      </motion.div>

      {/* Top-right status */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 11, duration: 2 }}
        style={{
          position: 'absolute', top: 'clamp(24px, 4vh, 48px)', right: 'clamp(24px, 4vw, 56px)',
          color: 'rgba(255,160,50,0.6)', fontSize: '10px', fontWeight: 500,
          letterSpacing: '0.28em', textTransform: 'uppercase',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}
      >
        <span style={{
          width: '6px', height: '6px', borderRadius: '50%',
          background: '#ff9900', display: 'inline-block',
          boxShadow: '0 0 8px #ff9900',
        }} />
        Fleet Active
      </motion.div>

      {/* Main title block — bottom left */}
      <div style={{ maxWidth: '680px' }}>
        {/* Thin accent line */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 8.2, duration: 1.0, ease }}
          style={{
            width: '36px', height: '2px',
            background: '#e06000',
            marginBottom: '1.8rem',
            transformOrigin: 'left center',
          }}
        />

        {/* GIPPSLAND */}
        <div style={{ overflow: 'hidden' }}>
          <motion.div
            initial={{ y: '105%' }}
            animate={{ y: '0%' }}
            transition={{ delay: 8.5, duration: 1.1, ease }}
            style={{
              fontSize: 'clamp(40px, 6.5vw, 96px)', fontWeight: 800,
              color: '#f0ede8', letterSpacing: '-0.025em', lineHeight: 1,
              textTransform: 'uppercase',
            }}
          >
            Gippsland
          </motion.div>
        </div>

        {/* ENVIRONMENTAL */}
        <div style={{ overflow: 'hidden' }}>
          <motion.div
            initial={{ y: '105%' }}
            animate={{ y: '0%' }}
            transition={{ delay: 8.85, duration: 1.1, ease }}
            style={{
              fontSize: 'clamp(40px, 6.5vw, 96px)', fontWeight: 800,
              color: '#f0ede8', letterSpacing: '-0.025em', lineHeight: 1,
              textTransform: 'uppercase',
            }}
          >
            Environmental
          </motion.div>
        </div>

        {/* SWEEPING COMPANY */}
        <div style={{ overflow: 'hidden' }}>
          <motion.div
            initial={{ y: '105%' }}
            animate={{ y: '0%' }}
            transition={{ delay: 9.2, duration: 1.1, ease }}
            style={{
              fontSize: 'clamp(40px, 6.5vw, 96px)', fontWeight: 800,
              color: '#e06000', letterSpacing: '-0.025em', lineHeight: 1.05,
              textTransform: 'uppercase',
            }}
          >
            Sweeping Company
          </motion.div>
        </div>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 9.8, duration: 0.9, ease }}
          style={{
            height: '1px', maxWidth: '460px',
            background: 'linear-gradient(90deg, rgba(220,180,120,0.3) 0%, transparent 100%)',
            margin: '1.6rem 0 1.3rem',
            transformOrigin: 'left center',
          }}
        />

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 10.1, duration: 1.4 }}
          style={{
            color: 'rgba(200,190,175,0.55)', fontSize: 'clamp(12px, 1.3vw, 16px)',
            fontWeight: 400, letterSpacing: '0.06em', lineHeight: 1.75,
          }}
        >
          Commercial sweeping.&ensp;Industrial sites.&ensp;Car parks.&ensp;Roads.<br />
          <span style={{ color: 'rgba(220,140,40,0.75)', fontWeight: 500 }}>
            Cleaner surfaces, sharper businesses.
          </span>
        </motion.p>
      </div>

      {/* Vignette */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: -1,
        background: 'radial-gradient(ellipse at 60% 40%, transparent 25%, rgba(0,0,0,0.65) 100%)',
      }} />

      {/* Bottom gradient */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%', zIndex: -1,
        background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)',
        pointerEvents: 'none',
      }} />
    </div>
  )
}
