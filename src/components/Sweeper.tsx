import { useRef, useMemo, forwardRef, useImperativeHandle } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export interface SweeperHandle {
  group: THREE.Group | null
  leftBrush: THREE.Group | null
  rightBrush: THREE.Group | null
  beaconMesh: THREE.Mesh | null
  headlightL: THREE.Mesh | null
  headlightR: THREE.Mesh | null
  brushesSpinning: React.MutableRefObject<boolean>
  beaconPulse: React.MutableRefObject<number>
}

const WHITE_PAINT = new THREE.MeshStandardMaterial({ color: '#e8e8e6', roughness: 0.25, metalness: 0.15 })
const DARK_PANEL = new THREE.MeshStandardMaterial({ color: '#1c1f24', roughness: 0.55, metalness: 0.3 })
const TYRE = new THREE.MeshStandardMaterial({ color: '#111111', roughness: 0.9, metalness: 0.0 })
const RIM = new THREE.MeshStandardMaterial({ color: '#aaaaaa', roughness: 0.3, metalness: 0.8 })
const ORANGE = new THREE.MeshStandardMaterial({ color: '#ff6600', roughness: 0.4, metalness: 0.1, emissive: '#331100', emissiveIntensity: 0.3 })
const GLASS = new THREE.MeshPhysicalMaterial({ color: '#0d1a2a', roughness: 0.05, metalness: 0.1, transmission: 0.4, transparent: true, opacity: 0.75 })
const BRUSH_DISC = new THREE.MeshStandardMaterial({ color: '#1a1a1a', roughness: 0.6, metalness: 0.2 })
const BRISTLE_MAT = new THREE.MeshStandardMaterial({ color: '#2d2d2d', roughness: 0.8, metalness: 0.0 })
const SUCTION_MAT = new THREE.MeshStandardMaterial({ color: '#333333', roughness: 0.5, metalness: 0.4 })
const HOSE_MAT = new THREE.MeshStandardMaterial({ color: '#222222', roughness: 0.7, metalness: 0.1 })
const MIRROR_MAT = new THREE.MeshStandardMaterial({ color: '#888888', roughness: 0.2, metalness: 0.9 })
const BEACON_MAT = new THREE.MeshStandardMaterial({ color: '#ffaa00', roughness: 0.1, metalness: 0.2, emissive: '#ff8800', emissiveIntensity: 1.5 })
const HEADLIGHT_MAT = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.05, emissive: '#aaddff', emissiveIntensity: 0.1 })
const TAIL_MAT = new THREE.MeshStandardMaterial({ color: '#cc2200', roughness: 0.3, emissive: '#440000', emissiveIntensity: 0.5 })
const YELLOW_MAT = new THREE.MeshStandardMaterial({ color: '#ffcc00', roughness: 0.4, metalness: 0.05 })

function Wheel({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} rotation={[0, 0, Math.PI / 2]}>
      {/* Tyre outer */}
      <mesh material={TYRE} castShadow>
        <torusGeometry args={[0.38, 0.14, 16, 32]} />
      </mesh>
      {/* Tyre inner fill */}
      <mesh material={TYRE} castShadow>
        <cylinderGeometry args={[0.25, 0.25, 0.27, 16]} />
      </mesh>
      {/* Rim */}
      <mesh material={RIM} castShadow>
        <cylinderGeometry args={[0.26, 0.26, 0.22, 12]} />
      </mesh>
      {/* Hub bolts */}
      {[0, 1, 2, 3, 4].map(i => (
        <mesh key={i} position={[Math.cos(i * Math.PI * 2 / 5) * 0.16, 0.12, Math.sin(i * Math.PI * 2 / 5) * 0.16]} material={RIM} castShadow>
          <cylinderGeometry args={[0.025, 0.025, 0.05, 6]} />
        </mesh>
      ))}
    </group>
  )
}

function RotaryBrush({ position, spinRef }: { position: [number, number, number]; spinRef: React.RefObject<THREE.Group | null>; direction: 1 | -1 }) {
  const bristleCount = 18
  const bristles = useMemo(() => {
    return Array.from({ length: bristleCount }, (_, i) => {
      const angle = (i / bristleCount) * Math.PI * 2
      const r = 0.32
      return { x: Math.cos(angle) * r, z: Math.sin(angle) * r, angle }
    })
  }, [])

  return (
    <group position={position} ref={spinRef}>
      {/* Main disc */}
      <mesh material={BRUSH_DISC} castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.52, 0.52, 0.06, 32]} />
      </mesh>
      {/* Centre hub */}
      <mesh material={RIM} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.1, 12]} />
      </mesh>
      {/* Bristle bundles radiating out */}
      {bristles.map((b, i) => (
        <mesh key={i} material={BRISTLE_MAT} castShadow
          position={[b.x, -0.03, b.z]}
          rotation={[0, b.angle + Math.PI / 2, 0]}>
          <boxGeometry args={[0.04, 0.05, 0.22]} />
        </mesh>
      ))}
      {/* Radial arms (spokes) */}
      {[0, 1, 2, 3, 4, 5].map(i => (
        <mesh key={i} material={BRUSH_DISC} rotation={[Math.PI / 2, i * Math.PI / 3, 0]}>
          <cylinderGeometry args={[0.018, 0.018, 0.48, 6]} />
        </mesh>
      ))}
      {/* Outer skirt ring */}
      <mesh material={BRISTLE_MAT} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.49, 0.025, 8, 32]} />
      </mesh>
    </group>
  )
}

function HydraulicArm({ side }: { side: -1 | 1 }) {
  return (
    <group position={[side * 0.6, 0.45, 1.8]}>
      {/* Main arm */}
      <mesh material={DARK_PANEL} castShadow rotation={[0.1, 0, side * 0.15]}>
        <boxGeometry args={[0.06, 0.08, 0.7]} />
      </mesh>
      {/* Hydraulic cylinder */}
      <mesh material={RIM} position={[0, 0.05, 0.15]} rotation={[0.3, 0, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.35, 8]} />
      </mesh>
    </group>
  )
}

const Sweeper = forwardRef<SweeperHandle>((_, ref) => {
  const groupRef = useRef<THREE.Group>(null)
  const leftBrushRef = useRef<THREE.Group>(null)
  const rightBrushRef = useRef<THREE.Group>(null)
  const beaconRef = useRef<THREE.Mesh>(null)
  const headlightLRef = useRef<THREE.Mesh>(null)
  const headlightRRef = useRef<THREE.Mesh>(null)
  const brushesSpinning = useRef(false)
  const beaconPulse = useRef(0)

  useImperativeHandle(ref, () => ({
    group: groupRef.current,
    leftBrush: leftBrushRef.current,
    rightBrush: rightBrushRef.current,
    beaconMesh: beaconRef.current,
    headlightL: headlightLRef.current,
    headlightR: headlightRRef.current,
    brushesSpinning,
    beaconPulse,
  }))

  useFrame((_, delta) => {
    if (brushesSpinning.current) {
      if (leftBrushRef.current) leftBrushRef.current.rotation.y += delta * 6
      if (rightBrushRef.current) rightBrushRef.current.rotation.y -= delta * 6
    }
    // Beacon pulse
    if (beaconRef.current) {
      const t = beaconPulse.current
      const mat = beaconRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 1.0 + Math.sin(t * 3.5) * 0.8
    }
  })

  return (
    <group ref={groupRef}>
      {/* === LOWER CHASSIS === */}
      <mesh material={DARK_PANEL} castShadow receiveShadow position={[0, 0.35, 0]}>
        <boxGeometry args={[2.05, 0.7, 4.2]} />
      </mesh>

      {/* Chassis sill panels */}
      <mesh material={DARK_PANEL} castShadow position={[-1.05, 0.35, 0]}>
        <boxGeometry args={[0.05, 0.72, 4.2]} />
      </mesh>
      <mesh material={DARK_PANEL} castShadow position={[1.05, 0.35, 0]}>
        <boxGeometry args={[0.05, 0.72, 4.2]} />
      </mesh>

      {/* === UPPER BODY (rear section) === */}
      <mesh material={WHITE_PAINT} castShadow receiveShadow position={[0, 1.12, -0.4]}>
        <boxGeometry args={[1.95, 0.85, 3.0]} />
      </mesh>

      {/* === HOPPER BOX (rear) === */}
      <mesh material={WHITE_PAINT} castShadow receiveShadow position={[0, 1.35, -1.55]}>
        <boxGeometry args={[1.9, 1.15, 1.45]} />
      </mesh>
      {/* Hopper top lip */}
      <mesh material={DARK_PANEL} castShadow position={[0, 1.95, -1.55]}>
        <boxGeometry args={[1.95, 0.08, 1.5]} />
      </mesh>
      {/* Hopper rear door */}
      <mesh material={DARK_PANEL} castShadow position={[0, 1.2, -2.33]}>
        <boxGeometry args={[1.85, 1.0, 0.06]} />
      </mesh>
      {/* Hopper rear warning stripes */}
      {[-0.5, -0.15, 0.2, 0.55].map((x, i) => (
        <mesh key={i} material={i % 2 === 0 ? ORANGE : YELLOW_MAT} position={[x, 1.2, -2.34]} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[0.14, 0.9, 0.02]} />
        </mesh>
      ))}

      {/* === CAB SECTION === */}
      {/* Cab back wall */}
      <mesh material={WHITE_PAINT} castShadow receiveShadow position={[0, 1.45, 1.25]}>
        <boxGeometry args={[1.9, 1.15, 0.12]} />
      </mesh>
      {/* Cab roof */}
      <mesh material={WHITE_PAINT} castShadow receiveShadow position={[0, 2.0, 1.6]}>
        <boxGeometry args={[1.92, 0.1, 0.95]} />
      </mesh>
      {/* Cab side panels */}
      <mesh material={WHITE_PAINT} castShadow receiveShadow position={[-0.96, 1.55, 1.65]}>
        <boxGeometry args={[0.06, 0.95, 0.88]} />
      </mesh>
      <mesh material={WHITE_PAINT} castShadow receiveShadow position={[0.96, 1.55, 1.65]}>
        <boxGeometry args={[0.06, 0.95, 0.88]} />
      </mesh>
      {/* Cab front face (above windshield) */}
      <mesh material={WHITE_PAINT} castShadow position={[0, 1.9, 2.1]}>
        <boxGeometry args={[1.92, 0.2, 0.06]} />
      </mesh>

      {/* Windshield */}
      <mesh material={GLASS} castShadow position={[0, 1.6, 2.08]} rotation={[-0.12, 0, 0]}>
        <boxGeometry args={[1.78, 0.65, 0.04]} />
      </mesh>

      {/* Side glass doors */}
      <mesh material={GLASS} position={[-0.95, 1.58, 1.65]} rotation={[0, 0.05, 0]}>
        <boxGeometry args={[0.04, 0.58, 0.72]} />
      </mesh>
      <mesh material={GLASS} position={[0.95, 1.58, 1.65]} rotation={[0, -0.05, 0]}>
        <boxGeometry args={[0.04, 0.58, 0.72]} />
      </mesh>

      {/* Door frames */}
      <mesh material={DARK_PANEL} castShadow position={[-0.93, 1.95, 1.65]}>
        <boxGeometry args={[0.07, 0.08, 0.75]} />
      </mesh>
      <mesh material={DARK_PANEL} castShadow position={[0.93, 1.95, 1.65]}>
        <boxGeometry args={[0.07, 0.08, 0.75]} />
      </mesh>

      {/* === FRONT BUMPER AREA === */}
      <mesh material={DARK_PANEL} castShadow receiveShadow position={[0, 0.72, 2.1]}>
        <boxGeometry args={[2.0, 0.75, 0.08]} />
      </mesh>
      {/* Bumper bar */}
      <mesh material={DARK_PANEL} castShadow position={[0, 0.38, 2.12]}>
        <boxGeometry args={[2.1, 0.15, 0.12]} />
      </mesh>
      {/* Front grille */}
      <mesh material={DARK_PANEL} castShadow position={[0, 1.05, 2.1]}>
        <boxGeometry args={[1.75, 0.35, 0.06]} />
      </mesh>
      {/* Grille slats */}
      {[-0.3, -0.1, 0.1, 0.3].map((y, i) => (
        <mesh key={i} material={HOSE_MAT} position={[0, 1.05 + y, 2.11]}>
          <boxGeometry args={[1.6, 0.03, 0.04]} />
        </mesh>
      ))}

      {/* === HEADLIGHTS === */}
      <mesh ref={headlightLRef} material={HEADLIGHT_MAT} castShadow position={[-0.72, 1.02, 2.12]}>
        <boxGeometry args={[0.28, 0.16, 0.06]} />
      </mesh>
      <mesh ref={headlightRRef} material={HEADLIGHT_MAT} castShadow position={[0.72, 1.02, 2.12]}>
        <boxGeometry args={[0.28, 0.16, 0.06]} />
      </mesh>
      {/* Headlight surrounds */}
      <mesh material={DARK_PANEL} position={[-0.72, 1.02, 2.11]}>
        <boxGeometry args={[0.34, 0.22, 0.04]} />
      </mesh>
      <mesh material={DARK_PANEL} position={[0.72, 1.02, 2.11]}>
        <boxGeometry args={[0.34, 0.22, 0.04]} />
      </mesh>

      {/* === ORANGE SAFETY STRIPE along sides === */}
      <mesh material={ORANGE} castShadow position={[-1.03, 0.74, 0]}>
        <boxGeometry args={[0.04, 0.1, 4.15]} />
      </mesh>
      <mesh material={ORANGE} castShadow position={[1.03, 0.74, 0]}>
        <boxGeometry args={[0.04, 0.1, 4.15]} />
      </mesh>
      {/* Front orange band */}
      <mesh material={ORANGE} castShadow position={[0, 0.74, 2.13]}>
        <boxGeometry args={[2.1, 0.1, 0.04]} />
      </mesh>

      {/* === SIDE MIRRORS === */}
      <mesh material={MIRROR_MAT} castShadow position={[-1.18, 1.82, 1.88]}>
        <boxGeometry args={[0.2, 0.12, 0.09]} />
      </mesh>
      <mesh material={DARK_PANEL} castShadow position={[-1.12, 1.82, 1.88]}>
        <boxGeometry args={[0.04, 0.04, 0.22]} />
      </mesh>
      <mesh material={MIRROR_MAT} castShadow position={[1.18, 1.82, 1.88]}>
        <boxGeometry args={[0.2, 0.12, 0.09]} />
      </mesh>
      <mesh material={DARK_PANEL} castShadow position={[1.12, 1.82, 1.88]}>
        <boxGeometry args={[0.04, 0.04, 0.22]} />
      </mesh>

      {/* === AMBER ROOF BEACON === */}
      <mesh material={BEACON_MAT} ref={beaconRef} castShadow position={[0, 2.18, 1.45]}>
        <cylinderGeometry args={[0.12, 0.14, 0.2, 16]} />
      </mesh>
      <mesh material={BEACON_MAT} castShadow position={[0, 2.08, 1.45]}>
        <cylinderGeometry args={[0.16, 0.16, 0.04, 16]} />
      </mesh>

      {/* Second beacon */}
      <mesh material={BEACON_MAT} castShadow position={[0, 2.18, 1.0]}>
        <cylinderGeometry args={[0.1, 0.12, 0.18, 16]} />
      </mesh>

      {/* === REAR TAIL LIGHTS === */}
      <mesh material={TAIL_MAT} position={[-0.78, 1.12, -2.34]}>
        <boxGeometry args={[0.2, 0.1, 0.04]} />
      </mesh>
      <mesh material={TAIL_MAT} position={[0.78, 1.12, -2.34]}>
        <boxGeometry args={[0.2, 0.1, 0.04]} />
      </mesh>
      <mesh material={YELLOW_MAT} position={[-0.45, 1.12, -2.34]}>
        <boxGeometry args={[0.16, 0.1, 0.04]} />
      </mesh>
      <mesh material={YELLOW_MAT} position={[0.45, 1.12, -2.34]}>
        <boxGeometry args={[0.16, 0.1, 0.04]} />
      </mesh>

      {/* === HYDRAULIC BRUSH ARMS === */}
      <HydraulicArm side={-1} />
      <HydraulicArm side={1} />

      {/* === ROTARY FRONT BRUSHES === */}
      <RotaryBrush position={[-0.72, 0.05, 2.3]} spinRef={leftBrushRef as React.RefObject<THREE.Group>} direction={1} />
      <RotaryBrush position={[0.72, 0.05, 2.3]} spinRef={rightBrushRef as React.RefObject<THREE.Group>} direction={-1} />

      {/* === SUCTION INTAKE (centre) === */}
      <group position={[0, 0.1, 2.15]}>
        <mesh material={SUCTION_MAT} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 0.14, 20]} />
        </mesh>
        {/* Intake grill rings */}
        {[0.08, 0.14, 0.19].map((r, i) => (
          <mesh key={i} material={DARK_PANEL} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[r, 0.01, 6, 20]} />
          </mesh>
        ))}
      </group>

      {/* === HOSES / PIPES === */}
      <mesh material={HOSE_MAT} castShadow position={[-0.4, 0.55, 1.9]} rotation={[0.4, 0.1, 0.1]}>
        <cylinderGeometry args={[0.04, 0.04, 0.9, 8]} />
      </mesh>
      <mesh material={HOSE_MAT} castShadow position={[0.4, 0.55, 1.9]} rotation={[0.4, -0.1, -0.1]}>
        <cylinderGeometry args={[0.04, 0.04, 0.9, 8]} />
      </mesh>
      {/* Water pipe horizontal */}
      <mesh material={HOSE_MAT} castShadow position={[0, 0.92, 2.05]}>
        <cylinderGeometry args={[0.025, 0.025, 1.8, 8]} />
      </mesh>

      {/* === WHEELS === */}
      <Wheel position={[-1.08, 0.45, 1.45]} />
      <Wheel position={[1.08, 0.45, 1.45]} />
      <Wheel position={[-1.08, 0.45, -1.1]} />
      <Wheel position={[1.08, 0.45, -1.1]} />

      {/* Mudguards */}
      <mesh material={DARK_PANEL} castShadow position={[-1.04, 0.88, 1.45]}>
        <boxGeometry args={[0.14, 0.06, 0.62]} />
      </mesh>
      <mesh material={DARK_PANEL} castShadow position={[1.04, 0.88, 1.45]}>
        <boxGeometry args={[0.14, 0.06, 0.62]} />
      </mesh>
      <mesh material={DARK_PANEL} castShadow position={[-1.04, 0.88, -1.1]}>
        <boxGeometry args={[0.14, 0.06, 0.62]} />
      </mesh>
      <mesh material={DARK_PANEL} castShadow position={[1.04, 0.88, -1.1]}>
        <boxGeometry args={[0.14, 0.06, 0.62]} />
      </mesh>
    </group>
  )
})

Sweeper.displayName = 'Sweeper'
export default Sweeper
