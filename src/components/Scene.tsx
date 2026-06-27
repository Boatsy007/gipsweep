import { useRef, useEffect, useMemo, Suspense } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF, MeshReflectorMaterial } from '@react-three/drei'
import { EffectComposer, Bloom, DepthOfField, ChromaticAberration } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'
import gsap from 'gsap'

// ---------- Dust motes ----------
function DustParticles() {
  const count = 280
  const ref = useRef<THREE.Points>(null)

  const [geo, mat] = useMemo(() => {
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 14
      positions[i * 3 + 1] = Math.random() * 7
      positions[i * 3 + 2] = (Math.random() - 0.5) * 14
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const m = new THREE.PointsMaterial({
      color: '#c8bfa8',
      size: 0.028,
      transparent: true,
      opacity: 0.38,
      sizeAttenuation: true,
      depthWrite: false,
    })
    return [g, m]
  }, [])

  useFrame((_, delta) => {
    if (!ref.current) return
    const pos = ref.current.geometry.attributes.position
    const arr = pos.array as Float32Array
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += delta * (0.04 + Math.random() * 0.02)
      arr[i * 3 + 0] += Math.sin(Date.now() * 0.0001 + i) * 0.002
      if (arr[i * 3 + 1] > 7) {
        arr[i * 3 + 1] = 0
        arr[i * 3 + 0] = (Math.random() - 0.5) * 14
        arr[i * 3 + 2] = (Math.random() - 0.5) * 14
      }
    }
    pos.needsUpdate = true
  })

  return <points ref={ref} geometry={geo} material={mat} />
}

// ---------- Reflective floor ----------
function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[50, 50]} />
      <MeshReflectorMaterial
        blur={[600, 100]}
        resolution={1024}
        mixBlur={0.85}
        mixStrength={120}
        roughness={0.78}
        depthScale={1.4}
        minDepthThreshold={0.3}
        maxDepthThreshold={1.6}
        color="#05060a"
        metalness={0.65}
        mirror={0.6}
      />
    </mesh>
  )
}

// ---------- Moving sweep light ----------
function SweepLight() {
  const lightRef = useRef<THREE.SpotLight>(null)
  const angle = useRef(Math.PI * 1.1)

  useFrame((_, delta) => {
    angle.current += delta * 0.12
    if (!lightRef.current) return
    const r = 9
    lightRef.current.position.x = Math.cos(angle.current) * r
    lightRef.current.position.z = Math.sin(angle.current) * r
    lightRef.current.position.y = 7
    lightRef.current.target.position.set(0, 1.2, 0)
    lightRef.current.target.updateMatrixWorld()
  })

  return (
    <spotLight
      ref={lightRef}
      intensity={28}
      color="#ffffff"
      angle={0.38}
      penumbra={0.88}
      distance={22}
      decay={1.8}
      castShadow
      shadow-mapSize={[1024, 1024]}
      shadow-bias={-0.0005}
    />
  )
}

// ---------- The machine ----------
function SweeperModel() {
  const { scene } = useGLTF('/sweeper.glb')

  const { cloned } = useMemo(() => {
    const s = scene.clone(true)
    // Compute bounding box of original scene to get scale + placement
    const box = new THREE.Box3().setFromObject(scene)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z)
    const targetSize = 5.5
    const scaleFactor = targetSize / maxDim

    s.scale.setScalar(scaleFactor)
    // Center XZ, sit on floor
    s.position.x = -center.x * scaleFactor
    s.position.z = -center.z * scaleFactor
    const floorY = box.min.y * scaleFactor
    s.position.y = -floorY

    // Enhance all materials for premium look
    s.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        mesh.castShadow = true
        mesh.receiveShadow = true
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
        mats.forEach((m) => {
          if (m instanceof THREE.MeshStandardMaterial) {
            m.envMapIntensity = 1.4
            m.needsUpdate = true
          }
        })
      }
    })

    return { cloned: s }
  }, [scene])

  return <primitive object={cloned} />
}

// ---------- Camera: slow luxury orbit + mouse parallax ----------
function CameraController({ mouseRef }: { mouseRef: React.RefObject<{ x: number; y: number }> }) {
  const { camera, gl } = useThree()
  const theta = useRef(Math.PI * 0.55)
  const phi = useRef(1.18) // ~32° above horizontal
  const camPos = useRef(new THREE.Vector3())
  const lookTarget = useRef(new THREE.Vector3(0, 1.4, 0))
  const elapsed = useRef(0)

  useEffect(() => {
    // Exposure reveal: emerge from darkness
    gl.toneMappingExposure = 0
    gsap.to(gl, {
      toneMappingExposure: 1.05,
      duration: 3.2,
      delay: 0.6,
      ease: 'power2.inOut',
    })
  }, [gl])

  useFrame((_, delta) => {
    elapsed.current += delta
    const t = elapsed.current

    // Very slow continuous orbit
    theta.current += delta * 0.052

    // Organic radius & elevation variation — slow breathing
    const rVar = Math.sin(t * 0.06) * 1.6 + Math.sin(t * 0.11 + 1.2) * 0.7
    const phiVar = Math.sin(t * 0.045) * 0.22 + Math.sin(t * 0.09 + 0.8) * 0.08
    const currentR = 10 + rVar
    const currentPhi = phi.current + phiVar

    // Spherical → cartesian
    const mx = (mouseRef.current?.x ?? 0) * 0.35
    const my = (mouseRef.current?.y ?? 0) * 0.18

    const tx = currentR * Math.sin(currentPhi) * Math.cos(theta.current) + mx
    const ty = currentR * Math.cos(currentPhi) + my * 0.5
    const tz = currentR * Math.sin(currentPhi) * Math.sin(theta.current)

    camPos.current.set(tx, ty, tz)
    camera.position.lerp(camPos.current, 0.028)

    // Subtle look-at height variation
    const lh = 1.4 + Math.sin(t * 0.05) * 0.4
    lookTarget.current.lerp(new THREE.Vector3(mx * 0.25, lh, 0), 0.03)
    camera.lookAt(lookTarget.current)
  })

  return null
}

// ---------- Main Scene ----------
export default function Scene() {
  const mouseRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2
      mouseRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <>
      <fog attach="fog" args={['#06080e', 20, 52]} />

      {/* Base ambient — very low */}
      <ambientLight intensity={0.06} color="#0d1828" />

      {/* Hemisphere — cold sky, warm ground bounce */}
      <hemisphereLight args={['#1a2a4a', '#1a0e00', 0.25]} />

      {/* Key light — large, soft, from upper-left front */}
      <directionalLight
        position={[-5, 10, 6]}
        intensity={2.6}
        color="#f5f0e8"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.5}
        shadow-camera-far={35}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-bias={-0.0008}
      />

      {/* Rim light — cool, from rear-right */}
      <directionalLight position={[7, 5, -8]} intensity={1.8} color="#6090c0" />

      {/* Rear separation light */}
      <directionalLight position={[-3, 3, -10]} intensity={1.1} color="#304060" />

      {/* Low fill from right */}
      <pointLight position={[8, 2, 3]} intensity={4} color="#c8d8f0" distance={18} decay={2} />

      {/* Moving sweep spotlight */}
      <SweepLight />

      {/* Floor */}
      <Floor />

      {/* The machine */}
      <Suspense fallback={null}>
        <SweeperModel />
      </Suspense>

      {/* Atmosphere */}
      <DustParticles />

      {/* Camera */}
      <CameraController mouseRef={mouseRef} />

      {/* Post-processing */}
      <EffectComposer multisampling={4}>
        <DepthOfField
          focusDistance={0.018}
          focalLength={0.1}
          bokehScale={2.2}
          height={480}
        />
        <Bloom
          intensity={0.85}
          luminanceThreshold={0.75}
          luminanceSmoothing={0.85}
          mipmapBlur
        />
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          offset={[0.0008, 0.0008] as unknown as THREE.Vector2}
          radialModulation={false}
          modulationOffset={0.1}
        />
      </EffectComposer>
    </>
  )
}
