import { useRef, useEffect, useState, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { MeshReflectorMaterial } from '@react-three/drei'
import { EffectComposer, Bloom, DepthOfField, ChromaticAberration } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'
import gsap from 'gsap'
import Sweeper from './Sweeper'
import type { SweeperHandle } from './Sweeper'

// --- Dust/mist particles ---
function Particles({ active, sweeperZ }: { active: boolean; sweeperZ: React.RefObject<number> }) {
  const count = 220
  const meshRef = useRef<THREE.Points>(null)

  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const vel = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const r = 0.3 + Math.random() * 0.55
      pos[i * 3] = Math.cos(angle) * r * (i % 2 === 0 ? -0.8 : 0.8)
      pos[i * 3 + 1] = Math.random() * 0.18
      pos[i * 3 + 2] = Math.sin(angle) * r * 0.5
      vel[i * 3] = (Math.random() - 0.5) * 0.012
      vel[i * 3 + 1] = 0.004 + Math.random() * 0.008
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.01
    }
    return [pos, vel]
  }, [])

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions.slice(), 3))
    return g
  }, [positions])

  const mat = useMemo(() => new THREE.PointsMaterial({
    color: '#c8b89a',
    size: 0.045,
    transparent: true,
    opacity: 0.0,
    sizeAttenuation: true,
    depthWrite: false,
  }), [])

  useFrame(() => {
    if (!meshRef.current || !active) return
    const pos = meshRef.current.geometry.attributes.position
    const arr = pos.array as Float32Array
    const sz = sweeperZ.current ?? 0

    mat.opacity = Math.min(mat.opacity + 0.015, 0.72)

    for (let i = 0; i < count; i++) {
      arr[i * 3] += velocities[i * 3]
      arr[i * 3 + 1] += velocities[i * 3 + 1]
      arr[i * 3 + 2] += velocities[i * 3 + 2] - 0.003 // drift backward as sweeper moves

      // Reset particles that float too high or too far
      if (arr[i * 3 + 1] > 0.9 || Math.abs(arr[i * 3]) > 1.2) {
        const angle = Math.random() * Math.PI * 2
        const r = 0.25 + Math.random() * 0.5
        arr[i * 3] = Math.cos(angle) * r * (i % 2 === 0 ? -0.7 : 0.7) + sz * 0.05
        arr[i * 3 + 1] = 0.02
        arr[i * 3 + 2] = Math.sin(angle) * r * 0.4
      }
    }
    pos.needsUpdate = true
    meshRef.current.position.z = sz
  })

  return <points ref={meshRef} geometry={geo} material={mat} />
}

// Water mist
function WaterMist({ active, sweeperZ }: { active: boolean; sweeperZ: React.RefObject<number> }) {
  const count = 90
  const meshRef = useRef<THREE.Points>(null)
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const r = 0.4 + Math.random() * 0.35
      pos[i * 3] = Math.cos(angle) * r
      pos[i * 3 + 1] = Math.random() * 0.25
      pos[i * 3 + 2] = Math.sin(angle) * r * 0.6 + 2.3
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return g
  }, [])

  const mat = useMemo(() => new THREE.PointsMaterial({
    color: '#d0e8f8',
    size: 0.055,
    transparent: true,
    opacity: 0.0,
    sizeAttenuation: true,
    depthWrite: false,
  }), [])

  useFrame((_, delta) => {
    if (!meshRef.current) return
    const sz = sweeperZ.current ?? 0
    meshRef.current.position.z = sz
    if (active) {
      mat.opacity = Math.min(mat.opacity + delta * 0.5, 0.55)
    }
    const pos = meshRef.current.geometry.attributes.position
    const arr = pos.array as Float32Array
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += 0.003 + Math.random() * 0.002
      if (arr[i * 3 + 1] > 0.6) {
        arr[i * 3 + 1] = 0.01
      }
    }
    pos.needsUpdate = true
  })

  return <points ref={meshRef} geometry={geo} material={mat} />
}

// Road markings
function RoadMarkings() {
  const stripeCount = 8
  return (
    <group>
      {/* Centre lane dashes */}
      {Array.from({ length: stripeCount }, (_, i) => (
        <mesh key={i} receiveShadow position={[0, 0.002, i * 3.5 - 14]}>
          <boxGeometry args={[0.12, 0.002, 1.8]} />
          <meshStandardMaterial color="#eeeecc" roughness={0.6} opacity={0.75} transparent />
        </mesh>
      ))}
      {/* Left edge line */}
      <mesh receiveShadow position={[-3.8, 0.002, 0]}>
        <boxGeometry args={[0.08, 0.002, 36]} />
        <meshStandardMaterial color="#eeeecc" roughness={0.6} opacity={0.6} transparent />
      </mesh>
      {/* Right edge line */}
      <mesh receiveShadow position={[3.8, 0.002, 0]}>
        <boxGeometry args={[0.08, 0.002, 36]} />
        <meshStandardMaterial color="#eeeecc" roughness={0.6} opacity={0.6} transparent />
      </mesh>
    </group>
  )
}

// Camera controller: GSAP timeline + mouse parallax
function CameraController({
  sweeperRef,
  onPhaseChange,
}: {
  sweeperRef: React.RefObject<SweeperHandle | null>
  onPhaseChange: (phase: number) => void
}) {
  const { camera } = useThree()
  const mouse = useRef({ x: 0, y: 0 })
  const camTarget = useRef(new THREE.Vector3(0, 1.2, 0))
  const phaseRef = useRef(0)
  const sweeperZRef = useRef(0)

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2
      mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', handleMouse)
    return () => window.removeEventListener('mousemove', handleMouse)
  }, [])

  useEffect(() => {
    // Initial camera position: dramatic 3/4 angle
    camera.position.set(4.5, 3.2, 9.5)
    camera.lookAt(0, 1.2, 0)

    const sweeper = sweeperRef.current
    if (!sweeper) return

    const tl = gsap.timeline()
    const state = { beaconT: 0, sweeperZ: 0, camX: 4.5, camY: 3.2, camZ: 9.5, targetZ: 0 }

    // Phase 0 → 1: camera push in (0–2.5s)
    tl.to(state, {
      camX: 3.8, camY: 2.6, camZ: 7.8,
      duration: 2.5,
      ease: 'power2.inOut',
      onUpdate: () => camera.position.set(state.camX, state.camY, state.camZ),
    }, 0)

    // Phase 1: beacons start pulsing (1.2s)
    tl.call(() => {
      if (sweeper.beaconPulse) sweeper.beaconPulse.current = 1
      phaseRef.current = 1
      onPhaseChange(1)
    }, [], 1.2)

    // Phase 2: headlights glow on (2.2s)
    tl.call(() => {
      phaseRef.current = 2
      onPhaseChange(2)
      const hlMat = sweeper.headlightL?.material as THREE.MeshStandardMaterial
      const hrMat = sweeper.headlightR?.material as THREE.MeshStandardMaterial
      if (hlMat) gsap.to(hlMat, { emissiveIntensity: 3.5, duration: 0.8 })
      if (hrMat) gsap.to(hrMat, { emissiveIntensity: 3.5, duration: 0.8 })
    }, [], 2.2)

    // Phase 3: brushes lower + start spinning (3.4s)
    tl.call(() => {
      phaseRef.current = 3
      onPhaseChange(3)
      if (sweeper.brushesSpinning) sweeper.brushesSpinning.current = true
    }, [], 3.4)

    // Phase 4: sweeper drives forward (5.2s)
    tl.to(state, {
      sweeperZ: -16,
      targetZ: -8,
      duration: 5.5,
      ease: 'power1.inOut',
      onUpdate: () => {
        if (sweeper.group) sweeper.group.position.z = state.sweeperZ
        sweeperZRef.current = state.sweeperZ
        camTarget.current.set(0, 1.2, state.targetZ)
      },
    }, 5.2)

    // Camera tracks beside sweeper
    tl.to(state, {
      camX: 5.5, camY: 2.5, camZ: 2.5,
      duration: 5.5,
      ease: 'power1.inOut',
      onUpdate: () => camera.position.set(state.camX, state.camY, state.camZ),
    }, 5.2)

    // Phase 5: show text (9.5s)
    tl.call(() => {
      phaseRef.current = 5
      onPhaseChange(5)
    }, [], 9.5)

    // Ongoing beacon pulse timer
    gsap.ticker.add((time) => {
      if (sweeper.beaconPulse && sweeper.beaconPulse.current > 0) {
        sweeper.beaconPulse.current = time
      }
    })

    return () => {
      tl.kill()
    }
  }, []) // eslint-disable-line

  useFrame(() => {
    // Mouse parallax on top of GSAP position
    const mx = mouse.current.x * 0.18
    const my = mouse.current.y * 0.1
    camera.position.x += (camera.position.x + mx - camera.position.x) * 0.04
    camera.position.y += (camera.position.y - my * 0.5 - camera.position.y) * 0.04

    // Smooth look-at
    const lx = camTarget.current.x + mx * 0.3
    const ly = camTarget.current.y
    const lz = camTarget.current.z
    camera.lookAt(lx, ly, lz)
  })

  return null
}

export default function Scene({ onShowText }: { onShowText: () => void }) {
  const sweeperRef = useRef<SweeperHandle>(null)
  const sweeperZRef = useRef(0)
  const [dustActive, setDustActive] = useState(false)
  const [mistActive, setMistActive] = useState(false)

  const handlePhase = (phase: number) => {
    if (phase >= 3) {
      setDustActive(true)
      setMistActive(true)
    }
    if (phase >= 5) {
      onShowText()
    }
  }

  return (
    <>
      {/* Fog */}
      <fog attach="fog" args={['#0d1015', 18, 55]} />

      {/* Sky ambient */}
      <ambientLight intensity={0.18} color="#1a2035" />

      {/* Early morning key light — warm from low angle (sunrise) */}
      <directionalLight
        position={[-8, 6, 4]}
        intensity={1.8}
        color="#ffa060"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={40}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-bias={-0.001}
      />

      {/* Cool fill from right */}
      <directionalLight position={[10, 4, -2]} intensity={0.45} color="#4060a0" />

      {/* Ground bounce */}
      <pointLight position={[0, 0.5, 0]} intensity={0.6} color="#2030a0" distance={12} decay={2} />

      {/* Headlight point lights (activated with headlights) */}
      <pointLight position={[-0.72, 1.05, 2.15]} intensity={0} color="#c8deff" distance={8} decay={2} />
      <pointLight position={[0.72, 1.05, 2.15]} intensity={0} color="#c8deff" distance={8} decay={2} />

      {/* === ROAD === */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
        <planeGeometry args={[20, 60, 1, 1]} />
        <MeshReflectorMaterial
          blur={[400, 80]}
          resolution={1024}
          mixBlur={0.9}
          mixStrength={85}
          roughness={0.85}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#090c10"
          metalness={0.5}
          mirror={0.25}
        />
      </mesh>

      {/* Gutter/kerb strips */}
      <mesh receiveShadow position={[-4.5, 0.06, 0]}>
        <boxGeometry args={[0.5, 0.12, 60]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.85} />
      </mesh>
      <mesh receiveShadow position={[4.5, 0.06, 0]}>
        <boxGeometry args={[0.5, 0.12, 60]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.85} />
      </mesh>

      <RoadMarkings />

      {/* Background buildings silhouette */}
      {[[-6, 5, -22], [-9, 7, -18], [-5.5, 3.5, -28], [6, 6, -20], [8, 4, -24]].map(([x, h, z], i) => (
        <mesh key={i} castShadow position={[x as number, (h as number) / 2, z as number]}>
          <boxGeometry args={[2.8, h as number, 2.4]} />
          <meshStandardMaterial color="#0e1218" roughness={1} />
        </mesh>
      ))}

      {/* Street lamp */}
      <group position={[5.5, 0, 2]}>
        <mesh castShadow position={[0, 2.5, 0]}>
          <cylinderGeometry args={[0.05, 0.06, 5, 8]} />
          <meshStandardMaterial color="#444444" roughness={0.7} />
        </mesh>
        <mesh castShadow position={[-0.3, 5.1, 0]}>
          <boxGeometry args={[0.6, 0.08, 0.2]} />
          <meshStandardMaterial color="#333333" roughness={0.6} />
        </mesh>
        <pointLight position={[-0.3, 4.9, 0]} intensity={2.2} color="#ffe580" distance={10} decay={2} />
      </group>
      <group position={[-5.5, 0, -6]}>
        <mesh castShadow position={[0, 2.5, 0]}>
          <cylinderGeometry args={[0.05, 0.06, 5, 8]} />
          <meshStandardMaterial color="#444444" roughness={0.7} />
        </mesh>
        <mesh castShadow position={[0.3, 5.1, 0]}>
          <boxGeometry args={[0.6, 0.08, 0.2]} />
          <meshStandardMaterial color="#333333" roughness={0.6} />
        </mesh>
        <pointLight position={[0.3, 4.9, 0]} intensity={2.2} color="#ffe580" distance={10} decay={2} />
      </group>

      {/* === SWEEPER === */}
      <Sweeper ref={sweeperRef} />

      {/* === PARTICLES === */}
      <Particles active={dustActive} sweeperZ={sweeperZRef} />
      <WaterMist active={mistActive} sweeperZ={sweeperZRef} />

      {/* === CAMERA CONTROLLER === */}
      <CameraController sweeperRef={sweeperRef} onPhaseChange={handlePhase} />

      {/* === POSTPROCESSING === */}
      <EffectComposer multisampling={4}>
        <DepthOfField
          focusDistance={0.02}
          focalLength={0.12}
          bokehScale={2.5}
          height={480}
        />
        <Bloom
          intensity={1.2}
          luminanceThreshold={0.55}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          offset={[0.0012, 0.0012] as unknown as THREE.Vector2}
          radialModulation={false}
          modulationOffset={0.15}
        />
      </EffectComposer>
    </>
  )
}
