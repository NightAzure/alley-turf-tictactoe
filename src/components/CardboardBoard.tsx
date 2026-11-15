"use client";

import Image from "next/image";
import React from "react";
import type { BoardState, Player } from "@/lib/gameLogic";

interface CardboardBoardProps {
  board: BoardState;
  currentPlayer: Player;
  winningLine: [number, number, number] | null;
  winner: Player | null;
  isGameOver: boolean;
  onCellClick: (index: number) => void;
}

const CELL_TILTS = [-2.5, 1.8, -1.6, 2.2, -1.2, 2.6, -2.1, 1.5, -2.4];

function ComicStarburst({ winner }: { winner: Player }) {
  const fill = winner === "cat" ? "#F45B3C" : "#2563EB";
  return (
    <svg
      viewBox="0 0 120 120"
      aria-hidden="true"
      className="animate-burst-pop pointer-events-none absolute -inset-[18%] z-0 h-[136%] w-[136%]"
    >
      {/* Outer coral/cobalt spiky burst */}
      <polygon
        points="60,2 71,24 94,10 85,34 114,32 94,52 118,68 91,74 106,99 78,89 76,117 58,94 38,116 40,88 12,97 27,73 2,65 25,50 7,29 35,33 28,8 50,24"
        fill={fill}
        stroke="#18181B"
        strokeWidth="3.2"
        strokeLinejoin="round"
      />
      {/* Inner cream punch burst */}
      <polygon
        points="60,15 68,32 84,22 78,40 99,39 84,54 102,65 82,70 92,88 72,81 70,101 58,84 44,100 45,80 25,86 35,69 17,63 34,52 21,37 41,40 36,21 53,33"
        fill="#FAF3E0"
        stroke="#18181B"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CornerTape({
  className,
  rotation,
}: {
  className: string;
  rotation: number;
}) {
  return (
    <div
      aria-hidden="true"
      className={`masking-tape pointer-events-none absolute z-20 h-7 w-20 sm:h-8 sm:w-24 ${className}`}
      style={{
        transform: `rotate(${rotation}deg)`,
        clipPath:
          "polygon(4% 0, 96% 2%, 100% 24%, 95% 52%, 99% 82%, 94% 100%, 3% 98%, 0 74%, 4% 46%, 0 20%)",
      }}
    />
  );
}

export function CardboardBoard({
  board,
  currentPlayer,
  winningLine,
  winner,
  isGameOver,
  onCellClick,
}: CardboardBoardProps) {
  const winningSet = new Set(winningLine ?? []);

  return (
    <div className="relative mx-auto flex w-full max-w-[356px] items-center justify-center sm:max-w-[420px]">
      {/* Radial halftone dot shadow aura behind cardboard */}
      <div
        aria-hidden="true"
        className="halftone-aura pointer-events-none absolute -inset-x-9 -inset-y-6 sm:-inset-x-12 sm:-inset-y-8"
      />

      {/* Corrugated cardboard square */}
      <div className="kraft-cardboard relative aspect-square w-full border-[3.5px] border-[#18181B] shadow-[7px_8px_0px_#18181B]">
        {/* Four corner masking tape strips */}
        <CornerTape className="-left-6 -top-2 sm:-left-7 sm:-top-2" rotation={-40} />
        <CornerTape className="-right-6 -top-2 sm:-right-7 sm:-top-2" rotation={42} />
        <CornerTape className="-bottom-2 -left-6 sm:-bottom-2 sm:-left-7" rotation={43} />
        <CornerTape className="-bottom-2 -right-6 sm:-bottom-2 sm:-right-7" rotation={-41} />

        {/* Subtle hand-drawn comic Sharpie 3x3 grid lines */}
        <svg
          viewBox="0 0 300 300"
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 h-full w-full p-3 sm:p-4"
        >
          {/* Vertical line 1 */}
          <path
            d="M 100 6 Q 98.5 150 100.5 294"
            stroke="#18181B"
            strokeWidth="3.2"
            strokeLinecap="round"
            fill="none"
          />
          {/* Vertical line 2 */}
          <path
            d="M 200 7 Q 201.5 152 199.5 293"
            stroke="#18181B"
            strokeWidth="3.2"
            strokeLinecap="round"
            fill="none"
          />
          {/* Horizontal line 1 */}
          <path
            d="M 6 100 Q 150 98.8 294 100.4"
            stroke="#18181B"
            strokeWidth="3.2"
            strokeLinecap="round"
            fill="none"
          />
          {/* Horizontal line 2 */}
          <path
            d="M 7 200 Q 152 201.4 293 199.6"
            stroke="#18181B"
            strokeWidth="3.2"
            strokeLinecap="round"
            fill="none"
          />
        </svg>

        {/* 3x3 clickable sticker grid */}
        <div
          role="grid"
          aria-label="Tic-Tac-Toe Board"
          className="relative z-10 grid h-full w-full grid-cols-3 grid-rows-3 p-3 sm:p-4"
        >
          {board.map((cell, idx) => {
            const row = Math.floor(idx / 3) + 1;
            const col = (idx % 3) + 1;
            const isWinCell = winningSet.has(idx);
            const isDimmed = Boolean(winner) && !isWinCell;
            const canPlace = !cell && !isGameOver;
            const tilt = CELL_TILTS[idx];
            const cellOwnerLabel =
              cell === "cat" ? "Cat" : cell === "pigeon" ? "Pigeon" : "Empty";

            return (
              <button
                key={idx}
                type="button"
                role="gridcell"
                disabled={!canPlace}
                onClick={() => onCellClick(idx)}
                aria-label={`Row ${row}, Column ${col}: ${cellOwnerLabel}`}
                className={`group relative flex items-center justify-center p-1.5 transition-transform duration-150 focus-visible:z-20 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#18181B] sm:p-2 ${
                  canPlace
                    ? "cursor-pointer hover:bg-black/[0.04] active:scale-95"
                    : "cursor-default"
                }`}
              >
                {isWinCell && winner && <ComicStarburst winner={winner} />}

                {cell ? (
                  <Image
                    src={
                      cell === "cat"
                        ? "/images/cat-sticker.png"
                        : "/images/pigeon-sticker.png"
                    }
                    alt={cell === "cat" ? "Cat sticker" : "Pigeon sticker"}
                    width={512}
                    height={512}
                    priority
                    draggable={false}
                    style={{ "--tilt": `${tilt}deg` } as React.CSSProperties}
                    className={`animate-sticker-slap sticker-shadow relative z-10 h-[84%] w-[84%] select-none object-contain transition-opacity duration-200 ${
                      isDimmed ? "opacity-75" : "opacity-100"
                    } ${isWinCell ? "scale-105" : ""}`}
                  />
                ) : (
                  canPlace && (
                    <Image
                      src={
                        currentPlayer === "cat"
                          ? "/images/cat-sticker.png"
                          : "/images/pigeon-sticker.png"
                      }
                      alt=""
                      aria-hidden="true"
                      width={512}
                      height={512}
                      priority
                      draggable={false}
                      style={{ transform: `rotate(${tilt}deg) scale(0.88)` }}
                      className="pointer-events-none h-[78%] w-[78%] select-none object-contain opacity-0 transition-all duration-150 group-hover:scale-95 group-hover:opacity-40 group-focus-visible:opacity-40"
                    />
                  )
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
