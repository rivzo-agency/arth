import Image from "next/image";
import Link from "next/link";
import type { MouseEventHandler } from "react";
import { brand } from "./brand";

export default function StaticBrand({
  className = "",
  href = "/",
  onClick,
}: {
  className?: string;
  href?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}) {
  return (
    <Link className={`antriksh-static-brand ${className}`.trim()} href={href} aria-label="ARTH by ANTRIKSH home" onClick={onClick}>
      <span className="antriksh-static-mark" aria-hidden="true">
        <Image src={brand.mark} alt="" width={1338} height={1176} sizes="104px" />
      </span>
      <span className="antriksh-static-stage" aria-hidden="true">
        <span className="antriksh-static-word">RTH</span>
        <span className="antriksh-static-byline">BY ANTRIKSH</span>
      </span>
    </Link>
  );
}
