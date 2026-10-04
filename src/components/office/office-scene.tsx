"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import type { Group } from "three";
import type { AgentVisualStatus, OfficeRoom, OfficeSceneProps } from "./types";

const positions: Record<OfficeRoom["id"], [number, number, number]> = {
  sales: [-3.6, 0.5, -2.2],
  project: [0, 0.5, -3],
  creative: [3.6, 0.5, -2.2],
  finance: [-3.6, 0.5, 2.2],
  review: [0, 0.5, 3],
  owner: [3.6, 0.5, 2.2],
};

const phases: Record<OfficeRoom["id"], number> = {
  sales: 0,
  project: 0.8,
  creative: 1.6,
  finance: 2.4,
  review: 3.2,
  owner: 4,
};

function statusColor(status: AgentVisualStatus | undefined) {
  if (status === "sedang_bekerja") return "#38BDF8";
  if (status === "review") return "#f59e0b";
  if (status === "perlu_perhatian") return "#fb7185";
  if (status === "offline") return "#94a3b8";
  return "#2563EB";
}

function Workstation({ status }: { status?: AgentVisualStatus }) {
  const active = status === "sedang_bekerja" || status === "review";
  const color = statusColor(status);

  return (
    <group position={[0, 0.15, 1.02]}>
      <mesh position={[0, 0.14, 0]}>
        <boxGeometry args={[0.9, 0.12, 0.48]} />
        <meshStandardMaterial color="#c8d6e5" roughness={0.75} />
      </mesh>
      <mesh position={[0, 0.46, -0.12]} rotation={[-0.12, 0, 0]}>
        <boxGeometry args={[0.58, 0.38, 0.06]} />
        <meshStandardMaterial
          color={active ? color : "#b8c7d8"}
          emissive={active ? color : "#000000"}
          emissiveIntensity={active ? 1.45 : 0}
          roughness={0.35}
        />
      </mesh>
      <mesh position={[0, 0.36, -0.03]}>
        <boxGeometry args={[0.08, 0.25, 0.08]} />
        <meshStandardMaterial color="#718397" roughness={0.7} />
      </mesh>
    </group>
  );
}

function AgentWorker({ status, phase }: { status?: AgentVisualStatus; phase: number }) {
  const root = useRef<Group>(null);
  const leftArm = useRef<Group>(null);
  const rightArm = useRef<Group>(null);
  const working = status === "sedang_bekerja" || status === "review";
  const attention = status === "perlu_perhatian";
  const color = statusColor(status);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() + phase;

    if (root.current) {
      root.current.position.y = Math.sin(t * 2.1) * 0.018;
      root.current.position.x = working ? Math.sin(t * 2.8) * 0.025 : Math.sin(t * 0.65) * 0.11;
      root.current.position.z = working ? 1.38 : 1.34 + Math.sin(t * 0.55) * 0.09;
      root.current.rotation.y = working ? Math.PI : Math.PI + Math.sin(t * 0.45) * 0.16;
    }

    if (leftArm.current) {
      leftArm.current.rotation.x = working ? -0.75 + Math.sin(t * 7.2) * 0.22 : -0.08 + Math.sin(t * 1.3) * 0.08;
    }
    if (rightArm.current) {
      rightArm.current.rotation.x = working ? -0.75 + Math.sin(t * 7.2 + 1.2) * 0.22 : -0.08 + Math.sin(t * 1.3 + 1) * 0.08;
    }
  });

  return (
    <group ref={root} position={[0, 0, 1.38]} rotation={[0, Math.PI, 0]}>
      <mesh position={[0, 0.56, 0]}>
        <cylinderGeometry args={[0.17, 0.22, 0.48, 12]} />
        <meshStandardMaterial color={attention ? "#fb7185" : "#2563EB"} roughness={0.42} />
      </mesh>
      <mesh position={[0, 0.98, 0]}>
        <sphereGeometry args={[0.18, 14, 14]} />
        <meshStandardMaterial color="#e8f3fb" roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.25, 0]}>
        <sphereGeometry args={[0.045, 10, 10]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.8} />
      </mesh>
      <group ref={leftArm} position={[-0.24, 0.66, -0.02]}>
        <mesh position={[0, -0.17, 0]}>
          <boxGeometry args={[0.09, 0.34, 0.09]} />
          <meshStandardMaterial color="#7da9df" roughness={0.5} />
        </mesh>
      </group>
      <group ref={rightArm} position={[0.24, 0.66, -0.02]}>
        <mesh position={[0, -0.17, 0]}>
          <boxGeometry args={[0.09, 0.34, 0.09]} />
          <meshStandardMaterial color="#7da9df" roughness={0.5} />
        </mesh>
      </group>
      <mesh position={[-0.1, 0.19, 0]}>
        <boxGeometry args={[0.1, 0.34, 0.1]} />
        <meshStandardMaterial color="#35577d" roughness={0.65} />
      </mesh>
      <mesh position={[0.1, 0.19, 0]}>
        <boxGeometry args={[0.1, 0.34, 0.1]} />
        <meshStandardMaterial color="#35577d" roughness={0.65} />
      </mesh>
    </group>
  );
}

function RoomMesh({
  room,
  onNavigate,
}: {
  room: OfficeRoom;
  onNavigate: (href: string) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const position = positions[room.id];
  const active = room.agentStatus === "sedang_bekerja" || room.agentStatus === "review" || room.alert;

  return (
    <group position={position}>
      <mesh
        position={[0, 0.1, 0]}
        scale={hovered ? 1.05 : 1}
        onPointerEnter={(event) => {
          event.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerLeave={() => {
          setHovered(false);
          document.body.style.cursor = "default";
        }}
        onClick={(event) => {
          event.stopPropagation();
          onNavigate(room.href);
        }}
      >
        <boxGeometry args={[2.35, 0.72, 1.75]} />
        <meshStandardMaterial
          color={room.id === "owner" ? "#0F2747" : hovered ? "#2563EB" : "#dfeafb"}
          roughness={0.55}
          metalness={room.id === "owner" ? 0.35 : 0.08}
        />
      </mesh>

      <mesh position={[0, 0.68, 0]} scale={hovered ? 1.04 : 1}>
        <boxGeometry args={[1.55, 0.55, 1.18]} />
        <meshStandardMaterial
          color={room.id === "owner" ? "#153e6e" : "#ffffff"}
          roughness={0.7}
        />
      </mesh>

      <mesh position={[0, 1.25, 0]}>
        <sphereGeometry args={[0.11, 18, 18]} />
        <meshStandardMaterial
          color={active ? statusColor(room.agentStatus) : "#9aa9ba"}
          emissive={active ? statusColor(room.agentStatus) : "#000000"}
          emissiveIntensity={active ? 1.8 : 0}
        />
      </mesh>

      <Workstation status={room.agentStatus} />
      <AgentWorker status={room.agentStatus} phase={phases[room.id]} />
    </group>
  );
}

function ChiefAvatar() {
  const root = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (!root.current) return;
    const t = clock.getElapsedTime();
    root.current.position.y = Math.sin(t * 1.6) * 0.035;
    root.current.rotation.y = Math.sin(t * 0.35) * 0.18;
  });

  return (
    <group ref={root} position={[0, 0, 0]}>
      <mesh position={[0, 0.48, 0]}>
        <cylinderGeometry args={[0.33, 0.42, 0.78, 24]} />
        <meshStandardMaterial color="#2563EB" roughness={0.4} metalness={0.15} />
      </mesh>
      <mesh position={[0, 1.1, 0]}>
        <sphereGeometry args={[0.3, 24, 24]} />
        <meshStandardMaterial color="#eaf6ff" roughness={0.45} />
      </mesh>
      <mesh position={[0, 1.56, 0]}>
        <sphereGeometry args={[0.075, 18, 18]} />
        <meshStandardMaterial color="#38BDF8" emissive="#38BDF8" emissiveIntensity={2} />
      </mesh>
    </group>
  );
}

function DataCourier() {
  const root = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (!root.current) return;
    const t = clock.getElapsedTime() * 0.34;
    root.current.position.x = Math.cos(t) * 2.15;
    root.current.position.z = Math.sin(t) * 1.85;
    root.current.position.y = 0.18 + Math.sin(t * 5) * 0.03;
  });

  return (
    <group ref={root}>
      <mesh>
        <sphereGeometry args={[0.09, 12, 12]} />
        <meshStandardMaterial color="#38BDF8" emissive="#38BDF8" emissiveIntensity={2.4} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.08, 0]}>
        <ringGeometry args={[0.12, 0.18, 20]} />
        <meshBasicMaterial color="#9bdcff" transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

function Architecture() {
  return (
    <>
      <mesh position={[0, -0.06, 0]}>
        <boxGeometry args={[10.4, 0.12, 8.5]} />
        <meshStandardMaterial color="#eef4fa" roughness={0.95} />
      </mesh>

      <mesh position={[0, 0.25, -4.1]}>
        <boxGeometry args={[10.4, 0.5, 0.16]} />
        <meshStandardMaterial color="#d4e1ef" roughness={0.8} />
      </mesh>
      <mesh position={[-5.1, 0.25, 0]}>
        <boxGeometry args={[0.16, 0.5, 8.2]} />
        <meshStandardMaterial color="#d4e1ef" roughness={0.8} />
      </mesh>
      <mesh position={[5.1, 0.25, 0]}>
        <boxGeometry args={[0.16, 0.5, 8.2]} />
        <meshStandardMaterial color="#d4e1ef" roughness={0.8} />
      </mesh>

      <mesh position={[0, 0.01, 0]}>
        <circleGeometry args={[1.25, 48]} />
        <meshStandardMaterial color="#dceaff" roughness={0.8} />
      </mesh>
    </>
  );
}

export default function OfficeScene({ rooms }: OfficeSceneProps) {
  const router = useRouter();

  return (
    <div className="office-canvas-wrap">
      <Canvas
        dpr={[1, 1.25]}
        camera={{ position: [9.4, 10.2, 11.6], fov: 38, near: 0.1, far: 100 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        onCreated={({ camera }) => camera.lookAt(0, 0.2, 0)}
      >
        <color attach="background" args={["#f8fbff"]} />
        <ambientLight intensity={1.65} />
        <directionalLight position={[5, 10, 7]} intensity={2.3} color="#ffffff" />
        <directionalLight position={[-6, 6, -4]} intensity={0.65} color="#79cfff" />

        <Architecture />
        <ChiefAvatar />
        <DataCourier />
        {rooms.map((room) => (
          <RoomMesh key={room.id} room={room} onNavigate={(href) => router.push(href)} />
        ))}
      </Canvas>

      <div className="office-center-label">
        <span>AI CHIEF OF STAFF</span>
        <strong>Command Center</strong>
        <small>Pegawai AI bergerak sesuai status kerja</small>
      </div>
    </div>
  );
}
