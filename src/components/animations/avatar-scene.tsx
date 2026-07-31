"use client";

import Image from "next/image";
import type { RefObject } from "react";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type AvatarSequenceProps = {
  heroStageRef: RefObject<HTMLDivElement | null>;
  heroTrackRef: RefObject<HTMLElement | null>;
};

const VIDEO_SRC = "/media/avatar/avatar-transformation.webm";

export function AvatarSequence({
  heroStageRef,
  heroTrackRef,
}: AvatarSequenceProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const portraitRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    const portrait = portraitRef.current;
    const video = videoRef.current;
    const track = heroTrackRef.current;
    const stage = heroStageRef.current;

    if (!root || !portrait || !video || !track || !stage) return;

    video.pause();
    video.currentTime = 0;
    gsap.set(video, { autoAlpha: 0 });
    gsap.set(portrait, { autoAlpha: 1 });

    const loadingTimer = window.setTimeout(() => {
      if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
        setShowLoading(true);
      }
    }, 2500);

    const media = gsap.matchMedia();
    media.add(
      {
        desktop: "(min-width: 1024px)",
        reduceMotion: "(prefers-reduced-motion: reduce)",
      },
      (context) => {
        const { desktop, reduceMotion } = context.conditions as {
          desktop: boolean;
          reduceMotion: boolean;
        };

        if (!desktop || reduceMotion) {
          video.pause();
          gsap.set(video, { autoAlpha: 0 });
          gsap.set(portrait, { autoAlpha: 1 });
          return;
        }

        let timeline: gsap.core.Timeline | undefined;

        const initializeTimeline = () => {
          if (timeline || !Number.isFinite(video.duration)) return;

          window.clearTimeout(loadingTimer);
          setShowLoading(false);
          video.pause();

          const state = { time: 0 };
          const endTime = Math.max(0, video.duration - 0.01);

          timeline = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              id: "hero-avatar-video",
              trigger: track,
              start: "top top",
              end: () => `+=${Math.max(window.innerHeight * 3, 2600)}`,
              pin: stage,
              pinSpacing: true,
              scrub: 0.6,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });

          timeline
            .to(video, { autoAlpha: 1, duration: 0.12 }, 0)
            .to(portrait, { autoAlpha: 0, duration: 0.12 }, 0)
            .to(
              root.querySelector(".sweep"),
              { xPercent: 650, opacity: 0.75, duration: 0.16 },
              0,
            )
            .to(
              root.querySelector(".orbit-one"),
              { rotate: 58, scale: 1.06, duration: 1 },
              0,
            )
            .to(
              root.querySelector(".orbit-two"),
              { rotate: -52, duration: 1 },
              0,
            )
            .to(
              root.querySelector(".nebula"),
              { scale: 1.12, opacity: 0.25, duration: 1 },
              0,
            )
            .to(
              state,
              {
                time: endTime,
                duration: 0.88,
                onUpdate: () => {
                  const safeTime = Math.min(
                    Math.max(state.time, 0),
                    Math.max(video.duration - 0.01, 0),
                  );
                  if (Math.abs(video.currentTime - safeTime) > 0.015) {
                    video.currentTime = safeTime;
                  }
                },
              },
              0.12,
            );

          const refreshAfterLayout = async () => {
            const portraitImage = root.querySelector("img");
            if (portraitImage) {
              await portraitImage.decode().catch(() => undefined);
            }
            await document.fonts.ready;
            requestAnimationFrame(() => ScrollTrigger.refresh());
          };

          void refreshAfterLayout();
        };

        if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
          initializeTimeline();
        } else {
          video.addEventListener("loadedmetadata", initializeTimeline, {
            once: true,
          });
        }

        return () => {
          video.removeEventListener("loadedmetadata", initializeTimeline);
          timeline?.kill();
        };
      },
    );

    const markReady = () => {
      window.clearTimeout(loadingTimer);
      setShowLoading(false);
      video.pause();
    };
    video.addEventListener("loadeddata", markReady, { once: true });

    return () => {
      window.clearTimeout(loadingTimer);
      video.removeEventListener("loadeddata", markReady);
      media.revert();
      video.pause();
    };
  }, [heroStageRef, heroTrackRef]);

  return (
    <div ref={rootRef} className="avatar-stage">
      <div className="nebula" aria-hidden="true" />
      <div className="orbit orbit-one" aria-hidden="true" />
      <div className="orbit orbit-two" aria-hidden="true" />
      <span className="star s1" aria-hidden="true" />
      <span className="star s2" aria-hidden="true" />
      <span className="star s3" aria-hidden="true" />
      <div ref={portraitRef} className="avatar-media avatar-portrait">
        <Image
          src="/media/avatar/portrait-original.webp"
          alt="Portrait of Ruththiragayan Sutharsan"
          fill
          priority
          sizes="(min-width: 1024px) 42vw, 90vw"
          className="avatar-media-content"
        />
      </div>
      <video
        ref={videoRef}
        className="avatar-media avatar-media-content avatar-video"
        muted
        playsInline
        preload="auto"
        poster="/media/avatar/portrait-original.webp"
        aria-hidden="true"
      >
        <source src={VIDEO_SRC} type="video/webm" />
      </video>
      <div className="sweep" aria-hidden="true" />
      {showLoading && (
        <span className="avatar-loading" aria-hidden="true">
          Loading animation…
        </span>
      )}
      <span className="float-badge code">Code</span>
      <span className="float-badge design">Design</span>
      <span className="float-badge build">Build</span>
    </div>
  );
}
