"use client";

import Image from "next/image";
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

export function SwiftGlowingCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

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

      const setVisible = (visible: boolean) => {
        cursor.dataset.visible = visible ? "true" : "false";
      };

      const animate = (time: number) => {
        const deltaTime = Math.min((time - previousTime) / 1000, 0.05);
        previousTime = time;
        const interpolation = 1 - Math.exp(-28 * deltaTime);
        const response = 1 - Math.exp(-20 * deltaTime);
        const angleResponse = 1 - Math.exp(-24 * deltaTime);

        currentX += (targetX - currentX) * interpolation;
        currentY += (targetY - currentY) * interpolation;
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
        if (!hasPointerPosition) {
          currentX = targetX;
          currentY = targetY;
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
      const handlePointerLeave = (event: PointerEvent) => {
        if (event.relatedTarget === null) setVisible(false);
      };
      const handleVisibilityChange = () =>
        setVisible(!document.hidden && hasPointerPosition);

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
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange,
        );
        document.documentElement.classList.remove("custom-cursor-enabled");
        setVisible(false);
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
    <div
      ref={cursorRef}
      className="swift-cursor"
      data-visible="false"
      data-hovering="false"
      data-pressed="false"
      data-variant="arrow"
      data-released="false"
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
  );
}
