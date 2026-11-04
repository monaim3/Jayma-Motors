"use client";

import { LoaderCircle, Maximize, Minimize, Pause, Play, RotateCcw, RotateCw, Volume2, VolumeX, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

const formatTime = (seconds) => {
  if (!Number.isFinite(seconds)) return "0:00";
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

const subscribeNoop = () => () => {};

const controlButton =
  "flex size-10 items-center justify-center rounded-full text-white transition-colors hover:bg-white/15 hover:text-brand-500 focus-visible:outline-2 focus-visible:outline-brand-500";

/**
 * Popup video player with custom brand-red controls: play/pause, ±10 s,
 * seekable progress bar, volume, time, fullscreen. Controls hide while the
 * video plays and the pointer is still. Keys: Space/K play, ←/→ seek,
 * M mute, F fullscreen, Esc close.
 */
export function VideoModal({ open, onClose, src, poster, title, aspect = 9 / 16 }) {
  const frameRef = useRef(null);
  const videoRef = useRef(null);
  const trackRef = useRef(null);
  const closeRef = useRef(null);
  const hideTimer = useRef(0);
  const isClient = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );

  const [playing, setPlaying] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);

  const video = () => videoRef.current;

  const showControls = useCallback(() => {
    setControlsVisible(true);
    window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) setControlsVisible(false);
    }, 2500);
  }, []);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
    showControls();
  }, [showControls]);

  const seekBy = useCallback(
    (delta) => {
      const v = videoRef.current;
      if (!v) return;
      v.currentTime = Math.min(Math.max(0, v.currentTime + delta), v.duration || 0);
      showControls();
    },
    [showControls],
  );

  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    if (!v.muted && v.volume === 0) v.volume = 0.6;
    showControls();
  }, [showControls]);

  const toggleFullscreen = useCallback(() => {
    const frame = frameRef.current;
    const v = videoRef.current;
    if (document.fullscreenElement) document.exitFullscreen?.();
    else if (frame?.requestFullscreen) frame.requestFullscreen().catch(() => {});
    else v?.webkitEnterFullscreen?.(); // iOS Safari
  }, []);

  // Open: focus close, lock page scroll, start playback (the click allows sound).
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement;
    const v = videoRef.current;
    const timer = hideTimer;
    closeRef.current?.focus();
    document.body.style.overflow = "hidden";
    v?.play().catch(() => {});
    return () => {
      document.body.style.overflow = "";
      window.clearTimeout(timer.current);
      if (v) {
        v.pause();
        v.currentTime = 0;
      }
      if (document.fullscreenElement) document.exitFullscreen?.();
      previous?.focus?.();
    };
  }, [open]);

  // Keyboard shortcuts while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (event) => {
      if (event.target instanceof HTMLInputElement) return;
      const key = event.key.toLowerCase();
      if (key === "escape" && !document.fullscreenElement) onClose();
      else if (key === " " || key === "k") {
        if (event.target instanceof HTMLButtonElement && key === " ") return;
        event.preventDefault();
        togglePlay();
      } else if (key === "arrowright") seekBy(5);
      else if (key === "arrowleft") seekBy(-5);
      else if (key === "m") toggleMute();
      else if (key === "f") toggleFullscreen();
    };
    const onFullscreen = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("keydown", onKey);
    document.addEventListener("fullscreenchange", onFullscreen);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("fullscreenchange", onFullscreen);
    };
  }, [open, onClose, togglePlay, seekBy, toggleMute, toggleFullscreen]);

  // Drag on the progress bar to seek.
  const seekToPointer = (event) => {
    const track = trackRef.current;
    const v = videoRef.current;
    if (!track || !v || !v.duration) return;
    const rect = track.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    v.currentTime = ratio * v.duration;
    setCurrent(v.currentTime);
  };
  const onTrackDown = (event) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    seekToPointer(event);
    showControls();
  };
  const onTrackMove = (event) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) seekToPointer(event);
  };
  const onTrackKey = (event) => {
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") event.stopPropagation();
    if (event.key === "ArrowRight") seekBy(5);
    if (event.key === "ArrowLeft") seekBy(-5);
  };

  const progress = duration ? (current / duration) * 100 : 0;
  const bufferedPct = duration ? (buffered / duration) * 100 : 0;
  const showUi = controlsVisible || !playing;

  // Rendered into <body>: a parent with `isolate`/transform would otherwise
  // trap the popup under the fixed header and floating buttons.
  if (!isClient) return null;

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-[60] flex items-center justify-center p-4 transition-opacity duration-300 sm:p-8",
        open ? "visible opacity-100" : "invisible opacity-0",
      )}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      aria-hidden={!open}
    >
      <div className="absolute inset-0 bg-black/85 backdrop-blur-md" onClick={onClose} />

      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        aria-label="Close video"
        className="absolute top-4 right-4 z-10 flex size-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur transition-colors hover:border-brand-500 hover:bg-brand-600 sm:top-6 sm:right-6"
      >
        <X className="size-5" aria-hidden="true" />
      </button>

      <div
        ref={frameRef}
        onPointerMove={showControls}
        style={{ aspectRatio: aspect }}
        className={cn(
          "group/player relative max-w-full overflow-hidden rounded-2xl bg-black shadow-2xl ring-1 shadow-black/60 ring-white/10 transition-transform duration-300",
          // Portrait reels fill the height; landscape videos fill the width.
          aspect < 1 ? "h-full max-h-[min(88dvh,900px)]" : "max-h-[88dvh] w-full max-w-6xl",
          open ? "scale-100" : "scale-95",
          fullscreen && "max-h-none rounded-none",
          playing && !showUi && "cursor-none",
        )}
      >
        <video
          ref={videoRef}
          src={open ? src : undefined}
          poster={poster}
          playsInline
          preload="metadata"
          onClick={togglePlay}
          onPlay={() => {
            setPlaying(true);
            showControls();
          }}
          onPause={() => {
            setPlaying(false);
            setControlsVisible(true);
          }}
          onEnded={() => setPlaying(false)}
          onWaiting={() => setWaiting(true)}
          onPlaying={() => setWaiting(false)}
          onCanPlay={() => setWaiting(false)}
          onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
          onTimeUpdate={(event) => setCurrent(event.currentTarget.currentTime)}
          onProgress={(event) => {
            const ranges = event.currentTarget.buffered;
            if (ranges.length) setBuffered(ranges.end(ranges.length - 1));
          }}
          onVolumeChange={(event) => {
            setMuted(event.currentTarget.muted);
            setVolume(event.currentTarget.volume);
          }}
          className="size-full object-contain"
        />

        {/* Centre: big play button when paused, spinner while buffering. */}
        {(!playing || waiting) && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            {waiting && playing ? (
              <LoaderCircle className="size-12 animate-spin text-white" aria-hidden="true" />
            ) : (
              <button
                type="button"
                onClick={togglePlay}
                aria-label="Play video"
                className="pointer-events-auto flex size-20 items-center justify-center rounded-full bg-brand-600 text-white shadow-xl ring-8 shadow-brand-900/50 ring-brand-600/25 transition-transform hover:scale-105"
              >
                <Play className="ml-1 size-9 fill-current" aria-hidden="true" />
              </button>
            )}
          </div>
        )}

        {/* Top: title */}
        <div
          className={cn(
            "pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-black/70 to-transparent px-5 pt-4 pb-10 transition-opacity duration-300",
            showUi ? "opacity-100" : "opacity-0",
          )}
        >
          <p className="font-display text-lg text-white">{title}</p>
          <p className="text-xs font-semibold tracking-[0.18em] text-brand-500 uppercase">Jayma Motors</p>
        </div>

        {/* Bottom: controls */}
        <div
          className={cn(
            "absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-3 pt-12 pb-3 transition-opacity duration-300 sm:px-4",
            showUi ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        >
          <div
            ref={trackRef}
            role="slider"
            tabIndex={0}
            aria-label="Seek"
            aria-valuemin={0}
            aria-valuemax={Math.round(duration)}
            aria-valuenow={Math.round(current)}
            aria-valuetext={`${formatTime(current)} of ${formatTime(duration)}`}
            onPointerDown={onTrackDown}
            onPointerMove={onTrackMove}
            onKeyDown={onTrackKey}
            className="group/track relative flex h-5 cursor-pointer touch-none items-center focus-visible:outline-none"
          >
            <div className="relative h-1 w-full overflow-hidden rounded-full bg-white/20 transition-[height] group-hover/track:h-1.5">
              <div className="absolute inset-y-0 left-0 bg-white/30" style={{ width: `${bufferedPct}%` }} />
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-brand-700 to-brand-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span
              aria-hidden="true"
              className="absolute size-3.5 -translate-x-1/2 rounded-full bg-white shadow ring-4 ring-brand-500/40 transition-transform group-hover/track:scale-125 group-focus-visible/track:scale-125"
              style={{ left: `${progress}%` }}
            />
          </div>

          <div className="mt-1.5 flex items-center gap-1">
            <button
              type="button"
              onClick={togglePlay}
              aria-label={playing ? "Pause" : "Play"}
              className={controlButton}
            >
              {playing ? (
                <Pause className="size-5 fill-current" aria-hidden="true" />
              ) : (
                <Play className="size-5 fill-current" aria-hidden="true" />
              )}
            </button>
            <button type="button" onClick={() => seekBy(-10)} aria-label="Back 10 seconds" className={controlButton}>
              <RotateCcw className="size-[1.1rem]" aria-hidden="true" />
            </button>
            <button type="button" onClick={() => seekBy(10)} aria-label="Forward 10 seconds" className={controlButton}>
              <RotateCw className="size-[1.1rem]" aria-hidden="true" />
            </button>

            <div className="group/volume flex items-center">
              <button
                type="button"
                onClick={toggleMute}
                aria-label={muted || volume === 0 ? "Unmute" : "Mute"}
                className={controlButton}
              >
                {muted || volume === 0 ? (
                  <VolumeX className="size-5" aria-hidden="true" />
                ) : (
                  <Volume2 className="size-5" aria-hidden="true" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={muted ? 0 : volume}
                aria-label="Volume"
                onChange={(event) => {
                  const v = video();
                  if (!v) return;
                  v.volume = Number(event.target.value);
                  v.muted = v.volume === 0;
                }}
                className="hidden w-0 cursor-pointer accent-brand-500 opacity-0 transition-all duration-200 group-focus-within/volume:w-16 group-focus-within/volume:opacity-100 group-hover/volume:w-16 group-hover/volume:opacity-100 sm:block"
              />
            </div>

            <span className="ml-2 text-xs font-semibold text-white tabular-nums">
              {formatTime(current)} <span className="text-zinc-400">/ {formatTime(duration)}</span>
            </span>

            <button
              type="button"
              onClick={toggleFullscreen}
              aria-label={fullscreen ? "Exit full screen" : "Full screen"}
              className={cn(controlButton, "ml-auto")}
            >
              {fullscreen ? (
                <Minimize className="size-5" aria-hidden="true" />
              ) : (
                <Maximize className="size-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
