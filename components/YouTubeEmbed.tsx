
import React from "react";

type Props = {
  videoId: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  allowFullScreen?: boolean;
};

export default function YouTubeEmbed({
  videoId,
  width = "100%",
  height = "100%",
  className,
  allowFullScreen = true,
}: Props) {
  // Fallback para SSR/SSG y cálculo preciso del origin
  const origin =
    typeof window !== "undefined" && window.location && window.location.origin
      ? window.location.origin
      : "";

  const cleanId = videoId.trim();

  // Usamos youtube-nocookie.com para evitar problemas de privacidad/cookies que a veces disparan errores de configuración
  // enablejsapi=1 y origin son los parámetros críticos para evitar el Error 153
  const src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(
    cleanId
  )}?enablejsapi=1&modestbranding=1&controls=1&rel=0&autoplay=1&origin=${encodeURIComponent(origin)}`;

  return (
    <iframe
      title="YouTube video player"
      width={width}
      height={height}
      src={src}
      frameBorder={0}
      referrerPolicy="strict-origin-when-cross-origin"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      {...(allowFullScreen ? { allowFullScreen: true } : {})}
      className={className}
    />
  );
}
