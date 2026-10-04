"use client";

import Link from "next/link";
import type { OfficeSceneProps } from "./types";

export function OfficeLite({ rooms }: OfficeSceneProps) {
  return (
    <div className="office-lite">
      <div className="lite-chief">
        <span>AI</span>
        <strong>Chief of Staff</strong>
        <small>Command Center</small>
      </div>
      <div className="lite-room-grid">
        {rooms.map((room) => (
          <Link
            key={room.id}
            href={room.href}
            prefetch={false}
            className={`lite-room ${room.alert ? "has-alert" : ""}`}
          >
            <div>
              <span>{room.name}</span>
              <strong>{room.value}</strong>
            </div>
            <small>{room.label}</small>
          </Link>
        ))}
      </div>
    </div>
  );
}
