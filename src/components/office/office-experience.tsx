"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { OfficeLite } from "./office-lite";
import type { OfficeSceneProps } from "./types";

const OfficeScene = dynamic(() => import("./office-scene"), {
  ssr: false,
  loading: () => (
    <div className="office-loading">
      <div className="office-loading-mark">TD</div>
      <span>Menyiapkan kantor 3D…</span>
    </div>
  ),
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

  useEffect(() => {
    setAutoLite(shouldUseLite());
    setReady(true);

    const handleResize = () => setAutoLite(shouldUseLite());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const lite = mode === "lite" || (mode === "auto" && autoLite);

  return (
    <section className="office-experience">
      <div className="office-experience-head">
        <div>
          <span className="soft-label">LOBBY · LIVE OFFICE</span>
          <h2>Kantor digital Teman Digital</h2>
          <p>3D adalah pengalaman dan navigasi. Pekerjaan tetap dilakukan di dashboard 2D yang cepat.</p>
        </div>
        <div className="mode-switch" aria-label="Mode tampilan kantor">
          <button className={mode === "auto" ? "active" : ""} onClick={() => setMode("auto")}>Otomatis</button>
          <button className={mode === "3d" ? "active" : ""} onClick={() => setMode("3d")}>3D</button>
          <button className={mode === "lite" ? "active" : ""} onClick={() => setMode("lite")}>Ringan</button>
        </div>
      </div>

      {!ready ? (
        <div className="office-loading"><div className="office-loading-mark">TD</div><span>Menyiapkan lobby…</span></div>
      ) : lite ? (
        <OfficeLite rooms={rooms} />
      ) : (
        <OfficeScene rooms={rooms} />
      )}

      <div className="office-room-cards">
        {rooms.map((room) => (
          <a key={room.id} href={room.href} className={room.alert ? "room-summary alert" : "room-summary"}>
            <span>{room.name}</span>
            <strong>{room.value}</strong>
            <small>{room.label}</small>
          </a>
        ))}
      </div>
    </section>
  );
}
