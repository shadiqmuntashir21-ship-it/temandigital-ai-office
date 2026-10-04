"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import { OfficeLite } from "./office-lite";
import type { OfficeSceneProps } from "./types";

const OfficeScene = dynamic(() => import("./office-scene"), {
  ssr: false,
  loading: () => <OfficeLite rooms={[]} />,
});

type Mode = "auto" | "3d" | "lite";

function shouldUseLite() {
  if (typeof window === "undefined") return true;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const narrow = window.innerWidth < 820;
  const nav = navigator as Navigator & { deviceMemory?: number };
  const lowMemory = typeof nav.deviceMemory === "number" && nav.deviceMemory <= 4;

  return reduced || narrow || lowMemory;
}

export function OfficeExperience({ rooms }: OfficeSceneProps) {
  const [mode, setMode] = useState<Mode>("auto");
  const [autoLite, setAutoLite] = useState(true);
  const [ready, setReady] = useState(false);
  const [idle3DReady, setIdle3DReady] = useState(false);

  useEffect(() => {
    setAutoLite(shouldUseLite());
    setReady(true);

    const timer = window.setTimeout(() => setIdle3DReady(true), 700);
    const handleResize = () => setAutoLite(shouldUseLite());

    window.addEventListener("resize", handleResize);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const lite = mode === "lite" || (mode === "auto" && autoLite);
  const render3D = !lite && (mode === "3d" || idle3DReady);

  return (
    <section className="office-experience">
      <div className="office-experience-head">
        <div>
          <span className="soft-label">LOBBY · LIVE OFFICE</span>
          <h2>Kantor digital Teman Digital</h2>
          <p>3D dimuat setelah antarmuka siap agar navigasi tetap ringan dan responsif.</p>
        </div>
        <div className="mode-switch" aria-label="Mode tampilan kantor">
          <button className={mode === "auto" ? "active" : ""} onClick={() => setMode("auto")}>Otomatis</button>
          <button className={mode === "3d" ? "active" : ""} onClick={() => setMode("3d")}>3D</button>
          <button className={mode === "lite" ? "active" : ""} onClick={() => setMode("lite")}>Ringan</button>
        </div>
      </div>

      {!ready || !render3D ? (
        <OfficeLite rooms={rooms} />
      ) : (
        <OfficeScene rooms={rooms} />
      )}

      <div className="office-room-cards">
        {rooms.map((room) => (
          <Link
            key={room.id}
            href={room.href}
            prefetch={false}
            className={room.alert ? "room-summary alert" : "room-summary"}
          >
            <span>{room.name}</span>
            <strong>{room.value}</strong>
            <small>{room.label}</small>
          </Link>
        ))}
      </div>
    </section>
  );
}
