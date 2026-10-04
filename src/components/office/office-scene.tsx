"use client";

import { Canvas } from "@react-three/fiber";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { OfficeRoom, OfficeSceneProps } from "./types";

const positions: Record<OfficeRoom["id"], [number, number, number]> = {
  sales: [-3.6, 0.5, -2.2],
  project: [0, 0.5, -3],
  creative: [3.6, 0.5, -2.2],
  finance: [-3.6, 0.5, 2.2],
  review: [0, 0.5, 3],
  owner: [3.6, 0.5, 2.2],
};

function RoomMesh({
  room,
  onNavigate,
}: {
  room: OfficeRoom;
  onNavigate: (href: string) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const position = positions[room.id];
  const active = room.value > 0 || room.alert;

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
          color={active ? (room.alert ? "#fb7185" : "#38BDF8") : "#9aa9ba"}
          emissive={active ? (room.alert ? "#fb7185" : "#38BDF8") : "#000000"}
          emissiveIntensity={active ? 1.8 : 0}
        />
      </mesh>
    </group>
  );
}

function ChiefAvatar() {
  return (
    <group position={[0, 0, 0]}>
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
        dpr={[1, 1.35]}
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
        {rooms.map((room) => (
          <RoomMesh key={room.id} room={room} onNavigate={(href) => router.push(href)} />
        ))}
      </Canvas>

      <div className="office-center-label">
        <span>AI CHIEF OF STAFF</span>
        <strong>Command Center</strong>
        <small>Klik ruangan atau kartu untuk masuk</small>
      </div>
    </div>
  );
}
