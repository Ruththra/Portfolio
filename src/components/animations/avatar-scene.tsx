"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function AvatarScene() {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
      const mobile = matchMedia("(max-width: 767px)").matches;
      if (reduced) return;
      gsap.to(".avatar-core", {
        y: -8,
        duration: 2.8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
      if (!mobile) {
        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: root.current,
            start: "top 24%",
            end: "+=650",
            scrub: 1,
            pin: true,
            invalidateOnRefresh: true,
          },
        });
        timeline
          .to(".orbit-one", { rotate: 55, scale: 1.08 }, 0)
          .to(".orbit-two", { rotate: -40 }, 0)
          .to(
            ".avatar-core",
            { scale: 1.04, filter: "drop-shadow(0 0 28px #238bff)" },
            0.25,
          )
          .to(".sweep", { xPercent: 230, opacity: 0.8 }, 0.3)
          .to(".hood", { opacity: 1, scale: 1 }, 0.65)
          .to(
            ".eye",
            { scaleY: 0.08, duration: 0.05, yoyo: true, repeat: 1 },
            0.82,
          );
      }
    },
    { scope: root },
  );

  return (
    <div
      className="avatar-stage"
      ref={root}
      aria-label="Abstract celestial avatar placeholder; personal portrait assets can be added later"
      role="img"
    >
      <div className="nebula" aria-hidden="true" />
      <div className="orbit orbit-one" aria-hidden="true" />
      <div className="orbit orbit-two" aria-hidden="true" />
      <span className="star s1" aria-hidden="true" />
      <span className="star s2" aria-hidden="true" />
      <span className="star s3" aria-hidden="true" />
      <svg className="avatar-core" viewBox="0 0 360 430" aria-hidden="true">
        <defs>
          <linearGradient id="body" x1="0" x2="1">
            <stop stopColor="#0b2445" />
            <stop offset="1" stopColor="#238bff" />
          </linearGradient>
        </defs>
        <path
          className="hood"
          d="M73 395C70 268 109 206 180 206s110 62 107 189Z"
          fill="#06152a"
          stroke="#48a7ff"
          strokeWidth="10"
          opacity=".12"
        />
        <path
          d="M55 415c8-104 53-146 125-146s117 42 125 146"
          fill="url(#body)"
        />
        <ellipse
          cx="180"
          cy="173"
          rx="77"
          ry="98"
          fill="#1c3655"
          stroke="#48a7ff"
          strokeWidth="2"
        />
        <path
          d="M105 162c0-86 34-128 79-128 56 0 83 39 78 116-17-35-40-53-72-57-28 33-57 47-85 49Z"
          fill="#050b15"
        />
        <g fill="none" stroke="#87c6ff" strokeWidth="5">
          <rect x="124" y="157" width="46" height="29" rx="13" />
          <rect x="190" y="157" width="46" height="29" rx="13" />
          <path d="M170 169h20" />
        </g>
        <g className="eye" fill="#c7e7ff">
          <ellipse cx="148" cy="171" rx="6" ry="4" />
          <ellipse cx="212" cy="171" rx="6" ry="4" />
        </g>
        <path
          d="M158 215q22 17 44 0"
          fill="none"
          stroke="#8ccaff"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
      <div className="sweep" aria-hidden="true" />
      <span className="float-badge code">Code</span>
      <span className="float-badge design">Design</span>
      <span className="float-badge build">Build</span>
    </div>
  );
}
