import { Canvas } from '@react-three/fiber'
import { ACESFilmicToneMapping } from 'three'
import Scene from './components/Scene'
import Overlay from './components/Overlay'

export default function Hero() {
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', background: '#000' }}>
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{ position: [9, 4.5, 9], fov: 38, near: 0.1, far: 80 }}
        gl={{
          antialias: true,
          toneMapping: ACESFilmicToneMapping,
          toneMappingExposure: 0,
        }}
        style={{ position: 'absolute', inset: 0 }}
      >
        <Scene />
      </Canvas>

      <Overlay />
    </div>
  )
}
