"use client";

import { useEffect, useRef } from "react";

/** Perspective-projected stars: one canvas, no WebGL or animation dependencies. */
export default function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !context) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let width = 1;
    let height = 1;
    let frame = 0;
    let lastTime = 0;
    let visible = false;
    let stars: { x: number; y: number; z: number; tint: boolean }[] = [];
    const depth = 1400;

    const reset = (star: (typeof stars)[number], initial = false) => {
      star.x = (Math.random() - .5) * width * 3;
      star.y = (Math.random() - .5) * height * 3;
      star.z = initial ? 50 + Math.random() * depth : depth;
    };

    const draw = (delta: number) => {
      context.clearRect(0, 0, width, height);
      const focal = Math.max(width, height) * .7;
      const cx = width * .58;
      const cy = height * .43;
      for (const star of stars) {
        const oldZ = star.z;
        star.z -= delta * .15;
        if (star.z < 12) { reset(star); continue; }
        const x = cx + star.x * focal / star.z;
        const y = cy + star.y * focal / star.z;
        if (x < -30 || x > width + 30 || y < -30 || y > height + 30) {
          reset(star);
          continue;
        }
        const proximity = 1 - Math.min(star.z / depth, 1);
        context.globalAlpha = .18 + proximity * .7;
        context.strokeStyle = star.tint ? "#baffda" : "#cadfff";
        context.fillStyle = context.strokeStyle;
        context.lineWidth = .5 + proximity;
        if (delta > 0) {
          context.beginPath();
          context.moveTo(cx + star.x * focal / (oldZ + 8), cy + star.y * focal / (oldZ + 8));
          context.lineTo(x, y);
          context.stroke();
        }
        context.beginPath();
        context.arc(x, y, .45 + proximity * 1.4, 0, Math.PI * 2);
        context.fill();
      }
      context.globalAlpha = 1;
    };

    const animate = (time: number) => {
      // Cap to 30 fps, with time-based movement on high-refresh displays.
      if (!lastTime || time - lastTime >= 32) {
        draw(lastTime ? Math.min(time - lastTime, 64) : 0);
        lastTime = time;
      }
      frame = requestAnimationFrame(animate);
    };
    const sync = () => {
      cancelAnimationFrame(frame);
      lastTime = 0;
      if (visible && !document.hidden && !motion.matches) {
        frame = requestAnimationFrame(animate);
      } else {
        draw(0);
      }
    };
    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      stars = Array.from({ length: width < 700 ? 90 : 200 }, (_, index) => {
        const star = { x: 0, y: 0, z: 0, tint: index % 7 === 0 };
        reset(star, true);
        return star;
      });
      draw(0);
    };
    const sizeObserver = new ResizeObserver(resize);
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    resize();
    sizeObserver.observe(canvas);
    visibilityObserver.observe(canvas);
    motion.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      cancelAnimationFrame(frame);
      sizeObserver.disconnect();
      visibilityObserver.disconnect();
      motion.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  return <canvas ref={canvasRef} className="launch-starfield" aria-hidden="true" />;
}
