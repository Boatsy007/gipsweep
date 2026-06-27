import { motion } from 'framer-motion'

interface OverlayProps {
  visible: boolean
}

export default function Overlay({ visible }: OverlayProps) {
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
      padding: '0 6vw 8vh',
      zIndex: 10,
    }}>
      {/* Top-left logo mark */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: visible ? 0.6 : 0, y: visible ? 0 : -12 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        style={{
          position: 'absolute',
          top: '4vh',
          left: '5vw',
          color: '#ffffff',
          fontSize: '11px',
          fontWeight: 600,
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
        }}
      >
        Gippsland Environmental
      </motion.div>

      {/* Main title block */}
      <div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: visible ? 1 : 0 }}
          transition={{ duration: 0.4, delay: 0.0 }}
          style={{
            marginBottom: '1.4rem',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          {/* Orange accent bar */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: visible ? 1 : 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            style={{
              width: '48px',
              height: '3px',
              background: '#ff6600',
              transformOrigin: 'left center',
            }}
          />
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: visible ? 0.55 : 0, x: visible ? 0 : -10 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            style={{
              color: '#ff8800',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.35em',
              textTransform: 'uppercase',
            }}
          >
            Est. Gippsland, Victoria
          </motion.span>
        </motion.div>

        {/* Line 1: GIPPSLAND ENVIRONMENTAL */}
        <div style={{ overflow: 'hidden' }}>
          <motion.h1
            initial={{ y: '110%' }}
            animate={{ y: visible ? '0%' : '110%' }}
            transition={{ duration: 0.9, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            style={{
              color: '#f0f0ec',
              fontSize: 'clamp(32px, 5.5vw, 82px)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              lineHeight: 1.0,
              textTransform: 'uppercase',
              margin: 0,
            }}
          >
            Gippsland Environmental
          </motion.h1>
        </div>

        {/* Line 2: SWEEPING COMPANY */}
        <div style={{ overflow: 'hidden' }}>
          <motion.h1
            initial={{ y: '110%' }}
            animate={{ y: visible ? '0%' : '110%' }}
            transition={{ duration: 0.9, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
            style={{
              color: '#f0f0ec',
              fontSize: 'clamp(32px, 5.5vw, 82px)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              lineHeight: 1.0,
              textTransform: 'uppercase',
              margin: 0,
            }}
          >
            <span style={{ color: '#ff6600' }}>Sweeping</span> Company
          </motion.h1>
        </div>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: visible ? 1 : 0, opacity: visible ? 1 : 0 }}
          transition={{ duration: 0.7, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
          style={{
            height: '1px',
            background: 'linear-gradient(90deg, rgba(255,102,0,0.6) 0%, rgba(255,255,255,0.1) 60%, transparent 100%)',
            margin: '1.4rem 0 1.2rem',
            transformOrigin: 'left center',
            maxWidth: '520px',
          }}
        />

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: visible ? 0.65 : 0, y: visible ? 0 : 10 }}
          transition={{ duration: 0.8, delay: 0.55 }}
          style={{
            color: '#c8c8c0',
            fontSize: 'clamp(12px, 1.4vw, 17px)',
            fontWeight: 400,
            letterSpacing: '0.04em',
            lineHeight: 1.7,
            maxWidth: '440px',
          }}
        >
          Commercial sweeping. Industrial sites. Car parks. Roads.<br />
          <span style={{ color: '#ff8800', fontWeight: 500 }}>Cleaner surfaces, sharper businesses.</span>
        </motion.p>

        {/* CTA hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: visible ? 1 : 0 }}
          transition={{ duration: 0.8, delay: 0.85 }}
          style={{
            marginTop: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <div style={{
            border: '1px solid rgba(255,102,0,0.6)',
            padding: '12px 28px',
            color: '#ff6600',
            fontSize: '12px',
            fontWeight: 600,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}>
            Get a Quote
          </div>
          <div style={{
            padding: '12px 28px',
            color: 'rgba(255,255,255,0.45)',
            fontSize: '12px',
            fontWeight: 500,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}>
            Our Services ↓
          </div>
        </motion.div>
      </div>

      {/* Bottom right — specs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: visible ? 0.4 : 0 }}
        transition={{ duration: 1, delay: 1.0 }}
        style={{
          position: 'absolute',
          bottom: '6vh',
          right: '5vw',
          textAlign: 'right',
          color: '#aaaaaa',
          fontSize: '10px',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          lineHeight: 2,
        }}
      >
        <div>Compact CN101 Sweeper</div>
        <div style={{ color: '#ff6600' }}>● On Site Now</div>
      </motion.div>

      {/* Vignette overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(4,5,8,0.55) 100%)',
        pointerEvents: 'none',
        zIndex: -1,
      }} />

      {/* Bottom gradient fade */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '45%',
        background: 'linear-gradient(to top, rgba(6,7,10,0.85) 0%, transparent 100%)',
        pointerEvents: 'none',
        zIndex: -1,
      }} />
    </div>
  )
}
