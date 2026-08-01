"use client";

import Image from "next/image";
import { Fragment } from "react";
import { useEffect, useRef } from "react";

const INTERACTIVE_SELECTOR = [
  "a",
  "button",
  '[role="button"]',
  'input[type="button"]',
  'input[type="submit"]',
  'input[type="checkbox"]',
  'input[type="radio"]',
  "[data-cursor-hover]",
].join(",");

const EDITABLE_SELECTOR = [
  'input:not([type="button"]):not([type="submit"]):not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="color"])',
  "textarea",
  '[contenteditable="true"]',
  '[data-cursor-variant="text"]',
].join(",");

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(Math.max(value, minimum), maximum);

const shortestAngleDifference = (from: number, to: number) =>
  ((to - from + 540) % 360) - 180;

type SmokeParticle = {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  age: number;
  lifetime: number;
  size: number;
  angle: number;
  spin: number;
  stretch: number;
};

export function SwiftGlowingCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const trail = trailRef.current;
    if (!cursor || !trail) return;

    const finePointer = window.matchMedia("(pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let cleanupCursor: (() => void) | undefined;

    const configureCursor = () => {
      cleanupCursor?.();
      cleanupCursor = undefined;

      if (!finePointer.matches || reducedMotion.matches) return;

      document.documentElement.classList.add("custom-cursor-enabled");

      let targetX = -100;
      let targetY = -100;
      let currentX = -100;
      let currentY = -100;
      let previousPointerX = 0;
      let previousPointerY = 0;
      let targetRotation = 0;
      let currentRotation = 0;
      let targetScale = 1;
      let currentScale = 1;
      let targetMotionAngle = 180;
      let currentMotionAngle = 180;
      let speed = 0;
      let previousTime = performance.now();
      let animationFrameId = 0;
      let hasPointerPosition = false;
      let isPressed = false;
      let isHovering = false;
      let isTextVariant = false;
      let releaseTimeoutId = 0;
      let trailWidth = 0;
      let trailHeight = 0;
      let trailPixelRatio = 1;
      const smokeParticles: SmokeParticle[] = [];
      const trailContext = trail.getContext("2d");

      const resizeTrail = () => {
        trailPixelRatio = Math.min(window.devicePixelRatio || 1, 2);
        trailWidth = window.innerWidth;
        trailHeight = window.innerHeight;
        trail.width = Math.round(trailWidth * trailPixelRatio);
        trail.height = Math.round(trailHeight * trailPixelRatio);
        trail.style.width = `${trailWidth}px`;
        trail.style.height = `${trailHeight}px`;
        trailContext?.setTransform(
          trailPixelRatio,
          0,
          0,
          trailPixelRatio,
          0,
          0,
        );
      };

      const clearTrail = () => {
        smokeParticles.length = 0;
        cursor.dataset.trailActive = "false";
        trailContext?.clearRect(0, 0, trailWidth, trailHeight);
      };

      const addSmoke = (
        x: number,
        y: number,
        velocityX: number,
        velocityY: number,
      ) => {
        const distance = Math.hypot(velocityX, velocityY);
        const count = Math.min(Math.max(Math.floor(distance / 14), 1), 3);
        const movementAngle = Math.atan2(velocityY, velocityX);
        const directionX = distance > 0 ? velocityX / distance : 0;
        const directionY = distance > 0 ? velocityY / distance : 0;
        const normalX = -directionY;
        const normalY = directionX;
        for (let index = 0; index < count; index += 1) {
          const progress = (index + 1) / count;
          const spread = (Math.random() - 0.5) * 5;
          smokeParticles.push({
            x: x - directionX * (9 + progress * 12) + normalX * spread,
            y: y - directionY * (9 + progress * 12) + normalY * spread,
            velocityX: -directionX * (8 + Math.random() * 8) + normalX * spread,
            velocityY: -directionY * (8 + Math.random() * 8) + normalY * spread,
            age: 0,
            lifetime: 0.42 + Math.random() * 0.25,
            size: 5 + Math.random() * 6,
            angle: movementAngle + Math.PI + (Math.random() - 0.5) * 0.12,
            spin: (Math.random() - 0.5) * 0.35,
            stretch: 1.5 + Math.random() * 0.8,
          });
        }
        if (smokeParticles.length > 72) {
          smokeParticles.splice(0, smokeParticles.length - 72);
        }
        cursor.dataset.trailActive = "true";
      };

      const drawTrail = (deltaTime: number) => {
        if (!trailContext) return;
        trailContext.clearRect(0, 0, trailWidth, trailHeight);
        trailContext.globalCompositeOperation = "source-over";

        for (let index = smokeParticles.length - 1; index >= 0; index -= 1) {
          const particle = smokeParticles[index];
          particle.age += deltaTime;
          if (particle.age >= particle.lifetime) {
            smokeParticles.splice(index, 1);
            continue;
          }

          particle.x += particle.velocityX * deltaTime;
          particle.y += particle.velocityY * deltaTime;
          particle.angle += particle.spin * deltaTime;
          const curl = particle.spin * 0.08 * deltaTime;
          const cosine = Math.cos(curl);
          const sine = Math.sin(curl);
          const curledVelocityX =
            particle.velocityX * cosine - particle.velocityY * sine;
          particle.velocityY =
            particle.velocityX * sine + particle.velocityY * cosine;
          particle.velocityX = curledVelocityX;
          particle.velocityX *= Math.exp(-1.8 * deltaTime);
          particle.velocityY *= Math.exp(-1.2 * deltaTime);
          const life = 1 - particle.age / particle.lifetime;
          const radius = particle.size * (0.7 + (1 - life) * 1.1);
          trailContext.save();
          trailContext.translate(particle.x, particle.y);
          trailContext.rotate(particle.angle);
          trailContext.scale(particle.stretch, 1);
          const gradient = trailContext.createRadialGradient(
            0,
            0,
            0,
            0,
            0,
            radius,
          );
          gradient.addColorStop(0, `rgba(105, 190, 255, ${life * 0.035})`);
          gradient.addColorStop(0.42, `rgba(52, 132, 235, ${life * 0.1})`);
          gradient.addColorStop(0.72, `rgba(24, 76, 165, ${life * 0.055})`);
          gradient.addColorStop(1, "rgba(3, 20, 62, 0)");
          trailContext.fillStyle = gradient;
          trailContext.filter = "blur(2.5px)";
          trailContext.beginPath();
          trailContext.ellipse(0, 0, radius, radius * 0.62, 0, 0, Math.PI * 2);
          trailContext.fill();
          trailContext.restore();
        }

        trailContext.filter = "none";

        if (smokeParticles.length === 0) {
          cursor.dataset.trailActive = "false";
        }
      };

      const setVisible = (visible: boolean) => {
        cursor.dataset.visible = visible ? "true" : "false";
      };

      const animate = (time: number) => {
        const deltaTime = Math.min((time - previousTime) / 1000, 0.05);
        previousTime = time;
        const response = 1 - Math.exp(-16 * deltaTime);
        const angleResponse = 1 - Math.exp(-18 * deltaTime);

        drawTrail(deltaTime);

        currentRotation += (targetRotation - currentRotation) * response;
        currentScale += (targetScale - currentScale) * response;
        currentMotionAngle +=
          shortestAngleDifference(currentMotionAngle, targetMotionAngle) *
          angleResponse;
        speed *= Math.exp(-12 * deltaTime);
        targetRotation *= Math.exp(-14 * deltaTime);

        const normalizedSpeed = clamp(speed / 40, 0, 1);
        const baseScale = isHovering ? 1.14 : 1;
        targetScale = isTextVariant
          ? 1
          : isPressed
            ? baseScale * 0.84
            : baseScale + normalizedSpeed * 0.06;

        cursor.style.setProperty("--cursor-x", `${currentX}px`);
        cursor.style.setProperty("--cursor-y", `${currentY}px`);
        cursor.style.setProperty("--cursor-rotation", `${currentRotation}deg`);
        cursor.style.setProperty("--cursor-scale", `${currentScale}`);
        cursor.style.setProperty("--cursor-speed", `${normalizedSpeed}`);
        cursor.style.setProperty(
          "--cursor-glow-strength",
          normalizedSpeed.toString(),
        );
        cursor.style.setProperty(
          "--cursor-brightness",
          `${0.92 + normalizedSpeed * 0.18}`,
        );
        cursor.style.setProperty(
          "--cursor-motion-angle",
          `${currentMotionAngle - currentRotation}deg`,
        );
        cursor.style.setProperty(
          "--cursor-streak-opacity",
          `${isTextVariant ? 0 : normalizedSpeed * (isPressed ? 0.2 : 0.32)}`,
        );
        cursor.style.setProperty(
          "--cursor-streak-length",
          `${5 + normalizedSpeed * 22}px`,
        );

        animationFrameId = requestAnimationFrame(animate);
      };

      const handlePointerMove = (event: PointerEvent) => {
        if (event.pointerType === "touch") return;

        targetX = event.clientX;
        targetY = event.clientY;
        currentX = targetX;
        currentY = targetY;
        cursor.style.setProperty("--cursor-x", `${currentX}px`);
        cursor.style.setProperty("--cursor-y", `${currentY}px`);
        if (!hasPointerPosition) {
          previousPointerX = targetX;
          previousPointerY = targetY;
          hasPointerPosition = true;
        }

        const velocityX = event.clientX - previousPointerX;
        const velocityY = event.clientY - previousPointerY;
        previousPointerX = event.clientX;
        previousPointerY = event.clientY;
        speed = Math.min(Math.hypot(velocityX, velocityY), 40);
        targetRotation = clamp(velocityX * 0.55, -12, 12);
        if (speed > 0.5) {
          addSmoke(targetX, targetY, velocityX, velocityY);
          targetMotionAngle =
            Math.atan2(velocityY, velocityX) * (180 / Math.PI) + 180;
        }

        const target = event.target instanceof Element ? event.target : null;
        const isEditable = Boolean(target?.closest(EDITABLE_SELECTOR));
        isTextVariant = isEditable;
        isHovering =
          !isEditable && Boolean(target?.closest(INTERACTIVE_SELECTOR));
        cursor.dataset.hovering = isHovering ? "true" : "false";
        cursor.dataset.variant = isEditable ? "text" : "arrow";
        if (isEditable) {
          speed = 0;
          targetRotation = 0;
          targetScale = 1;
        }
        setVisible(!document.hidden);
      };

      const handlePointerDown = () => {
        isPressed = true;
        cursor.dataset.pressed = "true";
      };
      const handlePointerUp = () => {
        isPressed = false;
        cursor.dataset.pressed = "false";
        if (isTextVariant) return;
        cursor.dataset.released = "true";
        window.clearTimeout(releaseTimeoutId);
        releaseTimeoutId = window.setTimeout(() => {
          cursor.dataset.released = "false";
        }, 160);
      };
      const handlePointerEnter = () => {
        if (hasPointerPosition) setVisible(true);
      };
      const handlePointerLeave = () => {
        setVisible(false);
        clearTrail();
      };
      const handleDocumentMouseOut = (event: MouseEvent) => {
        if (
          event.relatedTarget === null &&
          (event.target === document.documentElement ||
            event.target === document.body)
        ) {
          handlePointerLeave();
        }
      };
      const handleVisibilityChange = () =>
        document.hidden ? handlePointerLeave() : setVisible(hasPointerPosition);

      resizeTrail();
      window.addEventListener("pointermove", handlePointerMove, {
        passive: true,
      });
      window.addEventListener("pointerdown", handlePointerDown, {
        passive: true,
      });
      window.addEventListener("pointerup", handlePointerUp, { passive: true });
      window.addEventListener("pointerenter", handlePointerEnter, {
        passive: true,
      });
      window.addEventListener("pointerleave", handlePointerLeave, {
        passive: true,
      });
      window.addEventListener("blur", handlePointerLeave);
      window.addEventListener("resize", resizeTrail, { passive: true });
      document.documentElement.addEventListener(
        "mouseleave",
        handlePointerLeave,
      );
      document.addEventListener("mouseout", handleDocumentMouseOut);
      document.addEventListener("visibilitychange", handleVisibilityChange);
      animationFrameId = requestAnimationFrame(animate);

      cleanupCursor = () => {
        cancelAnimationFrame(animationFrameId);
        window.clearTimeout(releaseTimeoutId);
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerdown", handlePointerDown);
        window.removeEventListener("pointerup", handlePointerUp);
        window.removeEventListener("pointerenter", handlePointerEnter);
        window.removeEventListener("pointerleave", handlePointerLeave);
        window.removeEventListener("blur", handlePointerLeave);
        window.removeEventListener("resize", resizeTrail);
        document.documentElement.removeEventListener(
          "mouseleave",
          handlePointerLeave,
        );
        document.removeEventListener("mouseout", handleDocumentMouseOut);
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange,
        );
        document.documentElement.classList.remove("custom-cursor-enabled");
        setVisible(false);
        clearTrail();
      };
    };

    finePointer.addEventListener("change", configureCursor);
    reducedMotion.addEventListener("change", configureCursor);
    configureCursor();

    return () => {
      cleanupCursor?.();
      finePointer.removeEventListener("change", configureCursor);
      reducedMotion.removeEventListener("change", configureCursor);
      document.documentElement.classList.remove("custom-cursor-enabled");
    };
  }, []);

  return (
    <Fragment>
      <canvas
        ref={trailRef}
        className="swift-cursor-trail"
        aria-hidden="true"
      />
      <div
        ref={cursorRef}
        className="swift-cursor"
        data-visible="false"
        data-hovering="false"
        data-pressed="false"
        data-variant="arrow"
        data-released="false"
        data-trail-active="false"
        aria-hidden="true"
      >
        <div className="swift-cursor__visual">
          <span className="swift-cursor__arrow">
            <span className="swift-cursor__streak" />
            <span className="swift-cursor__motion-glow" />
            <Image
              className="swift-cursor__image"
              src="/cursor-arrow.png"
              width={1024}
              height={1024}
              sizes="40px"
              priority
              alt=""
            />
          </span>
          <span className="swift-cursor__text" />
        </div>
      </div>
    </Fragment>
  );
}
