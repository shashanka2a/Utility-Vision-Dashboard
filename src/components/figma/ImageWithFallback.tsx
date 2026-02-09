"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

const ERROR_IMG_SRC =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg==";

export function ImageWithFallback({
  src,
  alt = "",
  className,
  style,
  width,
  height,
  ...rest
}: ImageProps) {
  const [didError, setDidError] = useState(false);

  if (didError || !src) {
    return (
      <div
        className={`relative inline-block bg-gray-100 text-center align-middle ${className ?? ""}`}
        style={style}
      >
        <div className="flex items-center justify-center w-full h-full min-h-[88px] min-w-[88px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ERROR_IMG_SRC}
            alt="Error loading image"
            data-original-url={typeof src === "string" ? src : undefined}
            className={className}
          />
        </div>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width ?? 88}
      height={height ?? 88}
      className={className}
      style={style}
      onError={() => setDidError(true)}
      unoptimized={typeof src === "string" && src.startsWith("data:")}
      {...rest}
    />
  );
}
