import { Suspense, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { ACESFilmicToneMapping } from 'three'
import Scene from './components/Scene'
import Overlay from './components/Overlay'

export default function Hero() {
  const [showText, setShowText] = useState(false)

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', background: '#06070a' }}>
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{ position: [4.5, 3.2, 9.5], fov: 42, near: 0.1, far: 80 }}
        gl={{
          antialias: true,
          toneMapping: ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
        }}
        style={{ position: 'absolute', inset: 0 }}
      >
        <Suspense fallback={null}>
          <Scene onShowText={() => setShowText(true)} />
        </Suspense>
      </Canvas>

      <Overlay visible={showText} />
    </div>
  )
}
