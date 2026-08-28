"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, extend, useFrame } from "@react-three/fiber";
import {
  useGLTF,
  useTexture,
  Environment,
  Lightformer,
} from "@react-three/drei";
import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  useRopeJoint,
  useSphericalJoint,
  type RapierRigidBody,
} from "@react-three/rapier";
import { MeshLineGeometry, MeshLineMaterial } from "meshline";
import * as THREE from "three";

extend({ MeshLineGeometry, MeshLineMaterial });

// Augment ThreeElements to support meshLine JSX tags in TypeScript
declare module "@react-three/fiber" {
  interface ThreeElements {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    meshLineGeometry: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    meshLineMaterial: any;
  }
}

interface LanyardProps {
  position?: [number, number, number];
  gravity?: [number, number, number];
  fov?: number;
  transparent?: boolean;
  lanyardImage?: string | null;
  lanyardWidth?: number;
  startEntrance?: boolean;
  reduceMotion?: boolean;
}

export default function Lanyard({
  position = [0, 0, 20],
  gravity = [0, -40, 0],
  fov = 20,
  transparent = true,
  lanyardImage = null,
  lanyardWidth = 1,
  startEntrance = false,
  reduceMotion = false,
}: LanyardProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const onChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(e.matches);
    };
    onChange(media);
    media.addEventListener("change", onChange);
    return () => {
      media.removeEventListener("change", onChange);
    };
  }, []);

  const [posX, posY, posZ] = position;
  const camPos: [number, number, number] = isMobile
    ? [0, -0.7, 8.0]
    : [0, 0, posZ];

  return (
    <div
      className={`w-full h-full relative ${isDragging ? "touch-none" : ""}`}
      style={{ minHeight: "400px" }}
    >
      <Canvas
        camera={{ position: camPos, fov: fov }}
        dpr={[1, isMobile ? 1.2 : 1.5]}
        gl={{ alpha: transparent }}
        onCreated={({ gl }) =>
          gl.setClearColor(new THREE.Color(0x000000), transparent ? 0 : 1)
        }
      >
        <ambientLight intensity={Math.PI} />
        <Physics gravity={gravity} timeStep={isMobile ? 1 / 30 : 1 / 60}>
          <Band
            setIsDragging={setIsDragging}
            isMobile={isMobile}
            lanyardImage={lanyardImage}
            lanyardWidth={lanyardWidth}
            posX={posX}
            posY={posY}
            startEntrance={startEntrance}
            reduceMotion={reduceMotion}
          />
        </Physics>
        <Environment blur={0.75}>
          <Lightformer
            intensity={2}
            color="white"
            position={[0, -1, 5]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={3}
            color="white"
            position={[-1, -1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={3}
            color="white"
            position={[1, 1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={10}
            color="white"
            position={[-10, 0, 14]}
            rotation={[0, Math.PI / 2, Math.PI / 3]}
            scale={[100, 10, 1]}
          />
        </Environment>
      </Canvas>
    </div>
  );
}

interface BandProps {
  maxSpeed?: number;
  minSpeed?: number;
  isMobile?: boolean;
  setIsDragging?: (val: boolean) => void;
  lanyardImage?: string | null;
  lanyardWidth?: number;
  posX?: number;
  posY?: number;
  startEntrance?: boolean;
  reduceMotion?: boolean;
}

function Band({
  maxSpeed = 50,
  minSpeed = 0,
  isMobile = false,
  setIsDragging,
  lanyardImage = null,
  lanyardWidth = 1,
  posX = 2.0,
  posY = 1.3,
  startEntrance = false,
  reduceMotion = false,
}: BandProps) {
  const band = useRef<THREE.Mesh>(null!);
  const fixed = useRef<RapierRigidBody>(null!);
  const j1 = useRef<RapierRigidBody>(null!);
  const j2 = useRef<RapierRigidBody>(null!);
  const j3 = useRef<RapierRigidBody>(null!);
  const j4 = useRef<RapierRigidBody>(null!);
  const j5 = useRef<RapierRigidBody>(null!);
  const card = useRef<RapierRigidBody>(null!);

  const [entranceDone, setEntranceDone] = useState(false);

  useEffect(() => {
    if (startEntrance) {
      const id = setTimeout(() => {
        setEntranceDone(true);
      }, 0);
      return () => clearTimeout(id);
    }
  }, [startEntrance]);

  const vec = useRef(new THREE.Vector3()).current;
  const ang = useRef(new THREE.Vector3()).current;
  const rot = useRef(new THREE.Vector3()).current;
  const dir = useRef(new THREE.Vector3()).current;

  // "Sendok" tambahan yang dipake ulang tiap frame di useFrame — daripada
  // bikin THREE.Vector3 / THREE.Quaternion baru 60x per detik (yang bikin
  // "sampah" numpuk dan bisa nyebabin micro-stutter pas dibersihin), kita
  // siapin sekali di sini terus isinya ditimpa ulang tiap frame pakai
  // .set()/.copy() (yang gak bikin objek baru).
  const scratchVec = useRef(new THREE.Vector3()).current;
  const scratchQuat = useRef(new THREE.Quaternion()).current;
  const hookOffsetVec = useRef(new THREE.Vector3()).current;
  const hookPosVec = useRef(new THREE.Vector3()).current;

  const segmentProps = {
    type: "dynamic" as const,
    canSleep: false,
    colliders: false as unknown as undefined,
    angularDamping: isMobile ? 8 : 4,
    linearDamping: isMobile ? 6 : 4,
  };

  // Load resources using static paths
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { nodes, materials } = useGLTF("/models/card-v3.glb") as any;
  const texture = useTexture(lanyardImage || "/textures/lanyard-v3.png");
  // Must be set synchronously before the mesh renders — useEffect is too late
  // (Three.js caches texture state on first draw call)
  // eslint-disable-next-line react-hooks/immutability
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

  // Use the baked texture from the GLB directly
  const cardMap = materials.base.map;

  const curve = useMemo(() => {
    const c = new THREE.CatmullRomCurve3([
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),
    ]);
    c.curveType = "chordal";
    return c;
  }, []);

  const [dragged, drag] = useState<THREE.Vector3 | false>(false);
  const [hovered, hover] = useState(false);

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 0.6]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 0.6]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 0.6]);
  useRopeJoint(j3, j4, [[0, 0, 0], [0, 0, 0], 0.6]);
  useRopeJoint(j4, j5, [[0, 0, 0], [0, 0, 0], 0.6]);
  useSphericalJoint(j5, card, [
    [0, 0, 0],
    [0, 1.4, 0],
  ]);

  useEffect(() => {
    if (hovered && !isMobile) {
      document.body.style.cursor = dragged ? "grabbing" : "grab";
      return () => void (document.body.style.cursor = "auto");
    }
  }, [hovered, dragged, isMobile]);

  useFrame((state, delta) => {
    if (!isMobile) {
      const targetCamX = -(state.viewport.width / 2 - posX);
      state.camera.position.x = targetCamX;
    } else {
      state.camera.position.x = 0;
    }

    if (!entranceDone) {
      const anchorY = isMobile ? 5 : posY !== undefined ? posY + 2.5 : 3.8;
      const restY = anchorY - 3.0;

      const holdOffsetX = reduceMotion ? 0 : isMobile ? 1.0 : 1.8;
      const holdOffsetY = reduceMotion ? 0 : 3.2;

      card.current?.setNextKinematicTranslation({
        x: holdOffsetX,
        y: restY + holdOffsetY,
        z: 0,
      });
      [j1, j2, j3, j4, j5, fixed].forEach((ref) => ref.current?.wakeUp());
    } else if (dragged) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      [card, j1, j2, j3, j4, j5, fixed].forEach((ref) => ref.current?.wakeUp());

      const minX = posX - state.viewport.width;
      const maxX = posX - 0.2;
      const minY = state.camera.position.y - state.viewport.height / 2 + 0.5;
      const maxY = state.camera.position.y + state.viewport.height / 2 - 0.2;

      const targetX = Math.max(minX, Math.min(maxX, vec.x - dragged.x));
      const targetY = Math.max(minY, Math.min(maxY, vec.y - dragged.y));
      const targetZ = vec.z - dragged.z;

      card.current?.setNextKinematicTranslation({
        x: targetX,
        y: targetY,
        z: targetZ,
      });
    }

    if (fixed.current) {
      [j1, j2, j3, j4].forEach((ref) => {
        if (!ref.current) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const lerped = (ref.current as any).lerped as THREE.Vector3 | undefined;
        const currentTranslation = ref.current.translation();
        // Timpa scratchVec yang udah ada, bukan bikin Vector3 baru.
        scratchVec.set(
          currentTranslation.x,
          currentTranslation.y,
          currentTranslation.z,
        );
        if (!lerped) {
          // Cuma di sini kita beneran perlu .clone() — soalnya nilai ini
          // mesti "nempel"/disimpan permanen di ref.current.lerped buat
          // dipake terus di frame-frame berikutnya, bukan sekadar dipakai
          // sekali lalu dibuang.
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (ref.current as any).lerped = scratchVec.clone();
          return;
        }
        const clampedDistance = Math.max(
          0.1,
          Math.min(1, lerped.distanceTo(scratchVec)),
        );
        lerped.lerp(
          scratchVec,
          delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed)),
        );
      });

      const cardTrans = card.current!.translation();
      const cardRot = card.current!.rotation();
      scratchQuat.set(cardRot.x, cardRot.y, cardRot.z, cardRot.w);
      hookOffsetVec.set(0, 1.15, 0).applyQuaternion(scratchQuat);
      hookPosVec.set(cardTrans.x, cardTrans.y, cardTrans.z).add(hookOffsetVec);

      const getRefVec = (ref: React.RefObject<RapierRigidBody | null>) => {
        if (!ref.current) return scratchVec.set(0, 0, 0);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const lerped = (ref.current as any).lerped as THREE.Vector3 | undefined;
        if (lerped) return lerped;
        const t = ref.current.translation();
        return scratchVec.set(t.x, t.y, t.z);
      };

      const j5t = j5.current!.translation();
      const fixedt = fixed.current.translation();

      curve.points[0].copy(hookPosVec);
      curve.points[1].set(j5t.x, j5t.y, j5t.z);
      curve.points[2].copy(getRefVec(j4));
      curve.points[3].copy(getRefVec(j3));
      curve.points[4].copy(getRefVec(j2));
      curve.points[5].copy(getRefVec(j1));
      curve.points[6].set(fixedt.x, fixedt.y, fixedt.z);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (band.current as any)?.geometry.setPoints(
        curve.getPoints(isMobile ? 16 : 32),
      );
      const angVel = card.current!.angvel();
      const cardRotation = card.current!.rotation();
      rot.set(cardRotation.x, cardRotation.y, cardRotation.z);
      ang.set(angVel.x, angVel.y, angVel.z);
      card.current!.setAngvel(
        { x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z },
        true,
      );
    }
  });

  return (
    <>
      <group
        position={[0, isMobile ? 5 : posY !== undefined ? posY + 2.5 : 3.8, 0]}
      >
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />

        <RigidBody ref={j1} position={[0.2, 0, 0]} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>

        <RigidBody ref={j2} position={[0.4, 0, 0]} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>

        <RigidBody ref={j3} position={[0.6, 0, 0]} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>

        <RigidBody ref={j4} position={[0.8, 0, 0]} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>

        <RigidBody ref={j5} position={[1.0, 0, 0]} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>

        <RigidBody
          ref={card}
          position={[1.2, 0, 0]}
          {...segmentProps}
          type={
            !entranceDone
              ? "kinematicPosition"
              : dragged
                ? "kinematicPosition"
                : "dynamic"
          }
        >
          <CuboidCollider args={[1.2, 1.7, 0.02]} />

          <group
            scale={1.75}
            position={[0, -1.0, -0.05]}
            onPointerOver={() => entranceDone && hover(true)}
            onPointerOut={() => entranceDone && hover(false)}
            onPointerUp={(e) => {
              if (!entranceDone) return;
              (e.target as HTMLElement).releasePointerCapture(e.pointerId);
              drag(false);
              if (setIsDragging) setIsDragging(false);
            }}
            onPointerDown={(e) => {
              if (!entranceDone) return;
              (e.target as HTMLElement).setPointerCapture(e.pointerId);
              const cardTranslation = card.current!.translation();
              drag(
                new THREE.Vector3()
                  .copy(e.point)
                  .sub(
                    vec.set(
                      cardTranslation.x,
                      cardTranslation.y,
                      cardTranslation.z,
                    ),
                  ),
              );
              if (setIsDragging) setIsDragging(true);
            }}
          >
            <mesh geometry={nodes.card.geometry}>
              <meshPhysicalMaterial
                map={cardMap}
                map-anisotropy={16}
                clearcoat={1}
                clearcoatRoughness={0.15}
                roughness={0.9}
                metalness={0.8}
              />
            </mesh>

            <mesh
              geometry={nodes.clip.geometry}
              material={materials.metal}
              material-roughness={0.3}
            />

            <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
          </group>
        </RigidBody>
      </group>

      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          color="white"
          depthTest={false}
          resolution={isMobile ? [1000, 2000] : [1000, 1000]}
          useMap
          map={texture}
          repeat={[-3, 1]}
          lineWidth={lanyardWidth * 0.7}
        />
      </mesh>
    </>
  );
}

useGLTF.preload("/models/card-v3.glb");
