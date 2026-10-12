import { useEffect, useRef } from "react";

/** Grid spacing in CSS pixels; wider on small screens so phones draw fewer dots. */
const SPACING_WIDE = 30;
const SPACING_NARROW = 38;
/** How far the pointer reaches, and how hard it pushes. */
const REACH = 150;
const PUSH = 18;
/** Ripple speed (px per ms), ring width, and how long one lasts. */
const RIPPLE_SPEED = 0.6;
const RIPPLE_WIDTH = 70;
const RIPPLE_LIFE = 1600;

interface Ripple {
  x: number;
  y: number;
  born: number;
}

function cssColor(name: string): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
}

/**
 * The page's idle background: a fine dot grid that drifts in a slow wave,
 * leans away from the pointer and lights up toward the accent color, and
 * sends a ripple through the grid on every click or tap. Plain canvas, behind
 * everything, ignoring the pointer for hit-testing. Paused in background tabs,
 * and never mounted for reduced motion.
 */
export function AmbientField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let width = 0;
    let height = 0;
    let spacing = SPACING_WIDE;
    let dot = cssColor("--color-border-strong");
    let lit = cssColor("--color-accent");
    const pointer = { x: -9999, y: -9999 };
    const ripples: Ripple[] = [];
    let frame = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      spacing = width < 640 ? SPACING_NARROW : SPACING_WIDE;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (now: number) => {
      ctx.clearRect(0, 0, width, height);
      for (let i = ripples.length - 1; i >= 0; i--) {
        if (now - (ripples[i]?.born ?? 0) > RIPPLE_LIFE) ripples.splice(i, 1);
      }
      for (let gy = spacing / 2; gy < height; gy += spacing) {
        for (let gx = spacing / 2; gx < width; gx += spacing) {
          // Idle drift: a slow diagonal wave.
          let x = gx + Math.sin(now / 2400 + gy / 140) * 1.6;
          let y = gy + Math.cos(now / 2800 + gx / 160) * 1.6;
          let glow = 0;

          const dx = x - pointer.x;
          const dy = y - pointer.y;
          const dist = Math.hypot(dx, dy);
          if (dist < REACH && dist > 0.01) {
            const force = (1 - dist / REACH) ** 2;
            x += (dx / dist) * force * PUSH;
            y += (dy / dist) * force * PUSH;
            glow = Math.max(glow, force);
          }
          for (const ripple of ripples) {
            const radius = (now - ripple.born) * RIPPLE_SPEED;
            const rx = x - ripple.x;
            const ry = y - ripple.y;
            const d = Math.hypot(rx, ry);
            const band = 1 - Math.abs(d - radius) / RIPPLE_WIDTH;
            if (band > 0 && d > 0.01) {
              const fade = 1 - (now - ripple.born) / RIPPLE_LIFE;
              const k = band * fade;
              x += (rx / d) * k * 10;
              y += (ry / d) * k * 10;
              glow = Math.max(glow, k);
            }
          }

          ctx.globalAlpha = 0.28 + glow * 0.62;
          ctx.fillStyle = glow > 0.12 ? lit : dot;
          const size = 1.4 + glow * 1.6;
          ctx.fillRect(x - size / 2, y - size / 2, size, size);
        }
      }
      ctx.globalAlpha = 1;
    };

    const loop = (now: number) => {
      draw(now);
      frame = window.requestAnimationFrame(loop);
    };
    const start = () => {
      if (!frame && document.visibilityState === "visible") {
        frame = window.requestAnimationFrame(loop);
      }
    };
    const stop = () => {
      window.cancelAnimationFrame(frame);
      frame = 0;
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      pointer.x = event.clientX;
      pointer.y = event.clientY;
    };
    const onLeave = () => {
      pointer.x = -9999;
      pointer.y = -9999;
    };
    const onDown = (event: PointerEvent) => {
      ripples.push({
        x: event.clientX,
        y: event.clientY,
        born: performance.now(),
      });
      if (ripples.length > 4) ripples.shift();
    };
    const onVisibility = () =>
      document.visibilityState === "visible" ? start() : stop();
    // Re-read the palette when the theme toggle flips data-theme.
    const theme = new MutationObserver(() => {
      dot = cssColor("--color-border-strong");
      lit = cssColor("--color-accent");
    });

    resize();
    start();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", onVisibility);
    theme.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => {
      stop();
      theme.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
    />
  );
}
