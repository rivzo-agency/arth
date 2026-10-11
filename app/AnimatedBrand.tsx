"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { brand } from "./brand";

type Point = { x: number; y: number };
const CYCLE = 10_000;
const clamp = (n: number) => Math.min(1, Math.max(0, n));
const ease = (n: number) => { const p = clamp(n); return p < .5 ? 4*p*p*p : 1-Math.pow(-2*p+2,3)/2; };

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function mask(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  return canvas;
}

function whiten(canvas: HTMLCanvasElement) {
  const context = canvas.getContext("2d");
  if (!context) return;
  context.globalCompositeOperation = "source-in";
  context.fillStyle = "#f7f6f1";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.globalCompositeOperation = "source-over";
}

function points(canvas: HTMLCanvasElement) {
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return [] as Point[];
  const data = context.getImageData(0, 0, canvas.width, canvas.height).data;
  const result: Point[] = [];
  for (let y=1; y<canvas.height-1; y+=2) for (let x=1; x<canvas.width-1; x+=2) {
    if (data[(y*canvas.width+x)*4+3] > 100) result.push({x,y});
  }
  return result;
}

export default function AnimatedBrand({ priority = false }: { priority?: boolean }) {
  const stageRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!stage || !canvas || !context) return;

    let frame = 0;
    let observer: ResizeObserver | undefined;
    let cancelled = false;
    let started = performance.now();
    let width = 1, height = 1;
    let arth = mask(1,1), antriksh = mask(1,1);
    let arthPoints: Point[] = [], antrikshPoints: Point[] = [];

    const configure = (wordmark: HTMLImageElement) => {
      const rect = stage.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width*ratio); canvas.height = Math.round(height*ratio);
      canvas.style.width = `${width}px`; canvas.style.height = `${height}px`;
      context.setTransform(ratio,0,0,ratio,0,0);

      arth = mask(width,height); antriksh = mask(width,height);
      const source = arth.getContext("2d"); const target = antriksh.getContext("2d");
      if (!source || !target) return;
      const sourceHeight = Math.min(height*.67, 38);
      const scale = sourceHeight/wordmark.naturalHeight;
      const top = Math.round((height-sourceHeight)*.2);
      let cursor = 1;
      for (const glyph of [{x:177,w:150},{x:77,w:112},{x:594,w:122}]) {
        const drawnWidth = glyph.w*scale;
        source.drawImage(wordmark,glyph.x,0,glyph.w,wordmark.naturalHeight,cursor,top,drawnWidth,sourceHeight);
        cursor += drawnWidth-2;
      }
      whiten(arth);
      const targetHeight = Math.min(height*.6,34);
      const targetWidth = wordmark.naturalWidth*(targetHeight/wordmark.naturalHeight);
      target.drawImage(wordmark,0,0,wordmark.naturalWidth,wordmark.naturalHeight,1,top+2,targetWidth,targetHeight);
      whiten(antriksh);
      arthPoints = points(arth); antrikshPoints = points(antriksh);
      started = performance.now();
    };

    const particles = (progress: number, reverse = false) => {
      const from = reverse ? antrikshPoints : arthPoints;
      const to = reverse ? arthPoints : antrikshPoints;
      const count = Math.min(760, Math.max(from.length,to.length));
      const p = ease(progress);
      for (let i=0; i<count; i++) {
        const a = from[Math.floor(i*from.length/count)] ?? {x:1,y:height/2};
        const b = to[Math.floor(i*to.length/count)] ?? {x:width-1,y:height/2};
        const raw = Math.sin(i*12.9898)*43758.5453;
        const seed = raw-Math.floor(raw);
        const x = a.x+(b.x-a.x)*p;
        const y = a.y+(b.y-a.y)*p+Math.sin(p*Math.PI)*(seed-.5)*22;
        const accent = i%9===0;
        context.fillStyle = accent ? "rgba(201,255,99,.95)" : "rgba(247,246,241,.92)";
        context.shadowColor = accent ? "rgba(201,255,99,.7)" : "rgba(121,227,255,.55)";
        context.shadowBlur = 3;
        context.beginPath(); context.arc(x,y,.55+seed*.75,0,Math.PI*2); context.fill();
      }
      context.shadowBlur = 0;
    };

    const draw = (time: number) => {
      const t = (time-started)%CYCLE;
      context.clearRect(0,0,width,height);
      if (t<2000) context.drawImage(arth,0,0);
      else if (t<3800) particles((t-2000)/1800);
      else if (t<7000) context.drawImage(antriksh,0,0);
      else if (t<8800) particles((t-7000)/1800,true);
      else context.drawImage(arth,0,0);
      frame = requestAnimationFrame(draw);
    };

    loadImage(brand.wordmark).then((wordmark) => {
      if (cancelled) return;
      observer = new ResizeObserver(() => configure(wordmark));
      observer.observe(stage); configure(wordmark);
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) context.drawImage(arth,0,0);
      else frame = requestAnimationFrame(draw);
    }).catch(() => undefined);

    return () => { cancelled=true; observer?.disconnect(); cancelAnimationFrame(frame); };
  }, []);

  return <span className="antriksh-logo-motion" aria-label="ARTH by ANTRIKSH">
    <span className="antriksh-logo-symbol" aria-hidden="true">
      <Image src={brand.mark} width={1338} height={1176} alt="" priority={priority} unoptimized />
    </span>
    <span ref={stageRef} className="antriksh-logo-stage" aria-hidden="true">
      <canvas ref={canvasRef} className="antriksh-logo-particle-canvas antriksh-logo-wordmark-canvas" />
      <span className="antriksh-logo-byline">BY ANTRIKSH</span>
    </span>
  </span>;
}
