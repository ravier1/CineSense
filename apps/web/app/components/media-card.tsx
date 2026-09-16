"use client";

import Image from "next/image";
import { useState, type CSSProperties } from "react";
import type { DiscoveryItem } from "../../lib/tmdb-discovery";

function samplePosterColor(image: HTMLImageElement) {
  const canvas = document.createElement("canvas");
  canvas.width = 8;
  canvas.height = 8;
  const context = canvas.getContext("2d");
  if (!context) return "#8b7b8f";
  try {
    context.drawImage(image, 0, 0, 8, 8);
    const pixels = context.getImageData(0, 0, 8, 8).data;
    let red = 0;
    let green = 0;
    let blue = 0;
    let count = 0;
    for (let index = 0; index < pixels.length; index += 4) {
      const brightness = (pixels[index] + pixels[index + 1] + pixels[index + 2]) / 3;
      if (brightness > 24 && brightness < 238) {
        red += pixels[index];
        green += pixels[index + 1];
        blue += pixels[index + 2];
        count += 1;
      }
    }
    if (!count) return "#8b7b8f";
    return `rgb(${Math.round(red / count)}, ${Math.round(green / count)}, ${Math.round(blue / count)})`;
  } catch {
    return "#8b7b8f";
  }
}

export function MediaCard({ item }: { item: DiscoveryItem }) {
  const [posterAccent, setPosterAccent] = useState("#8b7b8f");
  const style = { "--poster-accent": posterAccent } as CSSProperties;
  const mediaPath = item.kind === "Series" ? "tv" : "movie";

  return <a className="media-card" style={style} href={`https://www.themoviedb.org/${mediaPath}/${item.id}`} target="_blank" rel="noreferrer" aria-label={`Open ${item.title} on TMDB`}><div className="media-poster">{item.posterUrl ? <Image src={item.posterUrl} alt={`${item.title} poster`} fill sizes="(max-width: 700px) 42vw, 170px" onLoad={(event) => setPosterAccent(samplePosterColor(event.currentTarget))} /> : <span>{item.title}</span>}<span className="media-rating">★ {item.rating}</span></div><h3>{item.title}</h3><p>{item.year || "Coming soon"} · {item.kind}</p></a>;
}
