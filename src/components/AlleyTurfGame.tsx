"use client";

import Image from "next/image";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AlleyCollageBackdrop } from "./AlleyCollageBackdrop";
import { CardboardBoard } from "./CardboardBoard";
import { alleyAudio } from "@/lib/alleyAudio";
import {
  createInitialBoard,
  evaluateBoard,
  type BoardState,
  type Player,
} from "@/lib/gameLogic";

interface ScoreTally {
  cat: number;
  pigeon: number;
  draws: number;
}

export function AlleyTurfGame() {
  const [board, setBoard] = useState<BoardState>(() => createInitialBoard());
  const [currentPlayer, setCurrentPlayer] = useState<Player>("cat");
  const [muted, setMuted] = useState(false);
  const [score, setScore] = useState<ScoreTally>({
    cat: 0,
    pigeon: 0,
    draws: 0,
  });

  const evaluation = useMemo(() => evaluateBoard(board), [board]);
  const isGameOver = evaluation.status !== "playing";

  // Preload audio buffers on first pointer interaction anywhere on the page
  useEffect(() => {
    const warmAudio = () => {
      void alleyAudio.preload();
      window.removeEventListener("pointerdown", warmAudio);
    };
    window.addEventListener("pointerdown", warmAudio, { passive: true });
    return () => window.removeEventListener("pointerdown", warmAudio);
  }, []);

  const handleCellClick = useCallback(
    (index: number) => {
      if (board[index] !== null || isGameOver) return;

      const nextBoard = [...board];
      nextBoard[index] = currentPlayer;
      const nextEval = evaluateBoard(nextBoard);

      setBoard(nextBoard);

      if (nextEval.status === "win" && nextEval.winner) {
        const winner = nextEval.winner;
        setScore((prev) => ({
          ...prev,
          [winner]: prev[winner] + 1,
        }));
        void alleyAudio.playWin(winner);
      } else if (nextEval.status === "draw") {
        setScore((prev) => ({
          ...prev,
          draws: prev.draws + 1,
        }));
        void alleyAudio.playMove(currentPlayer);
        setTimeout(() => {
          void alleyAudio.playDraw();
        }, 280);
      } else {
        void alleyAudio.playMove(currentPlayer);
        setCurrentPlayer(currentPlayer === "cat" ? "pigeon" : "cat");
      }
    },
    [board, currentPlayer, isGameOver]
  );

  const handleNewGame = useCallback(() => {
    alleyAudio.playNewGame();
    setBoard(createInitialBoard());
    setCurrentPlayer("cat");
  }, []);

  const handleToggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      alleyAudio.setMuted(next);
      return next;
    });
  }, []);

  const handleMascotPreview = useCallback((player: Player) => {
    void alleyAudio.playMove(player);
  }, []);

  const catActive =
    (evaluation.status === "playing" && currentPlayer === "cat") ||
    evaluation.winner === "cat";
  const pigeonActive =
    (evaluation.status === "playing" && currentPlayer === "pigeon") ||
    evaluation.winner === "pigeon";

  const renderStatusCopy = () => {
    if (evaluation.status === "win" && evaluation.winner === "cat") {
      return (
        <>
          <strong className="italic font-bold text-[#F45B3C]">CATS</strong>{" "}
          RULE THE BLOCK!
        </>
      );
    }
    if (evaluation.status === "win" && evaluation.winner === "pigeon") {
      return (
        <>
          <strong className="italic font-bold text-[#1E5EE2]">PIGEONS</strong>{" "}
          OWN THE ALLEY!
        </>
      );
    }
    if (evaluation.status === "draw") {
      return (
        <>
          <strong className="italic font-bold">ALLEY TRUCE!</strong> IT&apos;S A
          DRAW!
        </>
      );
    }
    if (currentPlayer === "cat") {
      return (
        <>
          <strong className="italic font-bold text-[#F45B3C]">CATS</strong>{" "}
          ON THE PROWL...
        </>
      );
    }
    return (
      <>
        <strong className="italic font-bold text-[#1E5EE2]">PIGEONS</strong>{" "}
        MAKING A MOVE...
      </>
    );
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center px-4 py-6 sm:px-6 sm:py-8">
      <AlleyCollageBackdrop />

      {/* Minimal top-right zine score & audio bar */}
      <div className="relative z-20 mb-4 flex w-full max-w-[660px] items-center justify-between gap-2 sm:fixed sm:right-6 sm:top-5 sm:mb-0 sm:w-auto sm:justify-end">
        <div
          aria-label="Match scoreboard"
          className="flex items-center gap-2.5 rounded-full border-[2.5px] border-[#18181B] bg-[#FAF3E0] px-3 py-1 text-xs font-bold tracking-wide shadow-[3px_3px_0px_#18181B] sm:text-[13px]"
        >
          <span className="text-[#F45B3C]">CATS {score.cat}</span>
          <span className="text-[#18181B]/40">•</span>
          <span className="text-[#18181B]/75">TIES {score.draws}</span>
          <span className="text-[#18181B]/40">•</span>
          <span className="text-[#1E5EE2]">PIGEONS {score.pigeon}</span>
        </div>

        <button
          type="button"
          onClick={handleToggleMute}
          aria-pressed={!muted}
          aria-label={muted ? "Unmute game sounds" : "Mute game sounds"}
          className="flex cursor-pointer items-center gap-1.5 rounded-full border-[2.5px] border-[#18181B] bg-white px-3 py-1 text-xs font-bold tracking-wide shadow-[3px_3px_0px_#18181B] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#18181B] sm:text-[13px]"
        >
          <span aria-hidden="true">{muted ? "🔇" : "🔊"}</span>
          <span>{muted ? "SFX OFF" : "SFX ON"}</span>
        </button>
      </div>

      {/* Main 1:1 composition stage */}
      <main className="relative z-10 flex w-full max-w-[680px] flex-col items-center">
        {/* Header Masthead: Flanking Stickers + Arched ALLEY TURF */}
        <header className="mb-9 flex w-full items-center justify-center gap-2 sm:mb-12 sm:gap-5">
          {/* Left Cat Turn Badge */}
          <button
            type="button"
            onClick={() => handleMascotPreview("cat")}
            title="Play Cat Meow"
            aria-label={`Player 1: Cats${
              catActive ? " (Active)" : ""
            }. Click to hear a meow.`}
            style={{ "--base-rot": "-4deg" } as React.CSSProperties}
            className={`relative flex h-20 w-20 shrink-0 cursor-pointer items-center justify-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#18181B] sm:h-28 sm:w-28 ${
              catActive
                ? "animate-turn-wiggle scale-105 opacity-100"
                : "scale-95 opacity-75 hover:scale-100 hover:opacity-100"
            }`}
          >
            <Image
              src="/images/cat-sticker.png"
              alt="Grumpy Street Cat"
              width={512}
              height={512}
              priority
              draggable={false}
              className="sticker-shadow-lg h-full w-full select-none object-contain"
            />
            {evaluation.status === "playing" && currentPlayer === "cat" && (
              <span className="absolute -bottom-1.5 rounded-md border-2 border-[#18181B] bg-[#F45B3C] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-[2px_2px_0px_#18181B]">
                TURN
              </span>
            )}
          </button>

          {/* Arched Comic Title + Subtitle */}
          <div className="-mt-2 flex flex-col items-center sm:-mt-4">
            <svg
              viewBox="0 0 420 82"
              className="h-auto w-[210px] overflow-visible sm:w-[340px]"
              role="img"
              aria-label="ALLEY TURF"
            >
              <defs>
                <path id="alley-arch" d="M 16,70 Q 210,26 404,70" />
              </defs>
              {/* Hard black comic offset drop-shadow */}
              <text
                className="select-none fill-[#18181B] stroke-[#18181B]"
                style={{
                  fontFamily: "var(--font-display), sans-serif",
                  fontSize: "64px",
                  letterSpacing: "3px",
                  strokeWidth: "12px",
                  strokeLinejoin: "round",
                  paintOrder: "stroke fill",
                }}
                transform="translate(4, 5)"
              >
                <textPath
                  href="#alley-arch"
                  startOffset="50%"
                  textAnchor="middle"
                >
                  ALLEY TURF
                </textPath>
              </text>
              {/* Main cream fill + thick black ink outline */}
              <text
                className="select-none fill-[#FAF3E0] stroke-[#18181B]"
                style={{
                  fontFamily: "var(--font-display), sans-serif",
                  fontSize: "64px",
                  letterSpacing: "3px",
                  strokeWidth: "11px",
                  strokeLinejoin: "round",
                  paintOrder: "stroke fill",
                }}
              >
                <textPath
                  href="#alley-arch"
                  startOffset="50%"
                  textAnchor="middle"
                >
                  ALLEY TURF
                </textPath>
              </text>
            </svg>

            <p className="-mt-1 text-center text-sm font-bold tracking-[0.08em] text-[#18181B] sm:-mt-2 sm:text-xl">
              CATS VS. PIGEONS
            </p>
          </div>

          {/* Right Pigeon Turn Badge */}
          <button
            type="button"
            onClick={() => handleMascotPreview("pigeon")}
            title="Play Pigeon Coo"
            aria-label={`Player 2: Pigeons${
              pigeonActive ? " (Active)" : ""
            }. Click to hear a pigeon coo.`}
            style={{ "--base-rot": "3deg" } as React.CSSProperties}
            className={`relative flex h-20 w-20 shrink-0 cursor-pointer items-center justify-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#18181B] sm:h-28 sm:w-28 ${
              pigeonActive
                ? "animate-turn-wiggle scale-105 opacity-100"
                : "scale-95 opacity-75 hover:scale-100 hover:opacity-100"
            }`}
          >
            <Image
              src="/images/pigeon-sticker.png"
              alt="Sassy City Pigeon"
              width={512}
              height={512}
              priority
              draggable={false}
              className="sticker-shadow-lg h-full w-full select-none object-contain"
            />
            {evaluation.status === "playing" && currentPlayer === "pigeon" && (
              <span className="absolute -bottom-1.5 rounded-md border-2 border-[#18181B] bg-[#1E5EE2] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-[2px_2px_0px_#18181B]">
                TURN
              </span>
            )}
          </button>
        </header>

        {/* Centerpiece: Taped Cardboard 3x3 Board */}
        <CardboardBoard
          board={board}
          currentPlayer={currentPlayer}
          winningLine={evaluation.winningLine}
          winner={evaluation.winner}
          isGameOver={isGameOver}
          onCellClick={handleCellClick}
        />

        {/* Bottom Status Speech Bubble + Tilted NEW GAME Sticker Button */}
        <div className="relative z-20 mt-7 flex w-full max-w-[370px] items-center justify-between gap-3 sm:mt-8 sm:max-w-[450px] sm:gap-4">
          {/* Comic Speech Bubble */}
          <div className="relative flex-1">
            {/* Halftone dotted comic shadow underneath speech bubble */}
            <div
              aria-hidden="true"
              className="halftone-dots-dense absolute -bottom-2.5 left-2 right-0 top-2 rounded-[20px]"
            />

            <div
              aria-live="polite"
              className="relative z-10 flex min-h-[54px] items-center justify-center rounded-[18px] border-[3.5px] border-[#18181B] bg-white px-4 py-2.5 text-center text-sm tracking-wide text-[#18181B] sm:min-h-[60px] sm:px-5 sm:text-base"
            >
              <span>{renderStatusCopy()}</span>
            </div>

            {/* Speech bubble comic pointer tail */}
            <svg
              viewBox="0 0 36 28"
              aria-hidden="true"
              className="relative z-10 -mt-[4px] ml-6 h-5 w-7"
            >
              <path
                d="M 8 0 L 2 24 L 28 0 Z"
                fill="#FFFFFF"
                stroke="#18181B"
                strokeWidth="3.5"
                strokeLinejoin="round"
              />
              {/* Mask top stroke seam cleanly inside bubble */}
              <rect x="4" y="-2" width="26" height="5" fill="#FFFFFF" />
            </svg>
          </div>

          {/* Tilted Die-Cut Sticker NEW GAME Button */}
          <button
            type="button"
            onClick={handleNewGame}
            className="group relative -mt-4 shrink-0 -rotate-4 cursor-pointer rounded-[16px] bg-white p-[4px] shadow-[5px_6px_0px_#18181B] ring-[3px] ring-[#18181B] transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-1 hover:-rotate-2 hover:shadow-[7px_8px_0px_#18181B] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#1E5EE2] active:translate-x-1 active:translate-y-1 active:shadow-[2px_2px_0px_#18181B]"
          >
            <span className="flex flex-col items-center justify-center rounded-[11px] border-[3px] border-[#18181B] bg-[#F45B3C] px-4 py-2 text-center font-bold uppercase leading-[1.02] tracking-wide text-[#18181B] transition-colors group-hover:bg-[#FF6747] sm:px-5 sm:py-2.5 sm:text-lg">
              <span>NEW</span>
              <span>GAME</span>
            </span>
          </button>
        </div>
      </main>
    </div>
  );
}
