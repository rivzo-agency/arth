"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const floatingContent = [
  ".antriksh-studio-browser",
  ".antriksh-studio-social",
  ".antriksh-studio-growth",
  ".antriksh-service-motion",
  ".antriksh-project-visual",
  ".blog-card-visual",
  ".login-card",
].join(",");

const seeded = (value: number, salt: number) => {
  const result = Math.sin(value * 91.17 + salt * 47.31) * 10_000;
  return result - Math.floor(result);
};

export default function ZeroGravity() {
  const pathname = usePathname();

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      document.querySelectorAll<HTMLElement>(floatingContent).forEach((element, index) => {
        const radius = window.innerWidth <= 780 ? 0.7 : 1.45;
        const coordinate = (salt: number) =>
          `${((seeded(index + 1, salt) - 0.5) * radius * 2).toFixed(2)}px`;

        element.dataset.zeroGravity = "true";
        element.style.setProperty("--zero-duration", `${(15 + seeded(index, 1) * 11).toFixed(2)}s`);
        element.style.setProperty("--zero-delay", `${(-seeded(index, 2) * 12).toFixed(2)}s`);
        for (let point = 1; point <= 5; point += 1) {
          element.style.setProperty(`--zero-x-${point}`, coordinate(point * 2 + 1));
          element.style.setProperty(`--zero-y-${point}`, coordinate(point * 2 + 2));
        }
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  return null;
}
