"use client";

import Image from "next/image";
import { Fragment, useEffect, useRef } from "react";

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

export function SwiftGlowingCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLSpanElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const arrow = arrowRef.current;
    const glow = glowRef.current;
    if (!cursor || !arrow || !glow) return;

    const finePointer = window.matchMedia("(pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let cleanupCursor: (() => void) | undefined;

    const configureCursor = () => {
      cleanupCursor?.();
      cleanupCursor = undefined;

      if (!finePointer.matches || reducedMotion.matches) return;

      let pointerX = -100;
      let pointerY = -100;
      let previousPointerX = -100;
      let previousPointerY = -100;
      let glowX = -100;
      let glowY = -100;
      let rotation = 0;
      let targetRotation = 0;
      let scale = 1;
      let speed = 0;
      let frameId: number | null = null;
      let releaseTimeoutId = 0;
      let previousFrameTime = 0;
      let hasPointerPosition = false;
      let isPressed = false;
      let isHovering = false;
      let isTextVariant = false;
      let lastHoverTarget: EventTarget | null = null;
      let lastCursorTransform = "";
      let lastArrowTransform = "";
      let lastGlowTransform = "";
      let lastGlowOpacity = "";

      const setData = (name: string, value: string) => {
        if (cursor.dataset[name] !== value) cursor.dataset[name] = value;
      };

      const setVisible = (visible: boolean) => {
        setData("visible", visible ? "true" : "false");
      };

      const stopAnimation = () => {
        if (frameId !== null) cancelAnimationFrame(frameId);
        frameId = null;
        previousFrameTime = 0;
      };

      const updateHoverState = (target: EventTarget | null) => {
        if (target === lastHoverTarget) return;
        lastHoverTarget = target;

        const element = target instanceof Element ? target : null;
        const nextTextVariant = Boolean(element?.closest(EDITABLE_SELECTOR));
        const nextHovering =
          !nextTextVariant && Boolean(element?.closest(INTERACTIVE_SELECTOR));

        if (nextTextVariant !== isTextVariant) {
          isTextVariant = nextTextVariant;
          setData("variant", isTextVariant ? "text" : "arrow");
        }
        if (nextHovering !== isHovering) {
          isHovering = nextHovering;
          setData("hovering", isHovering ? "true" : "false");
        }
        if (isTextVariant) {
          speed = 0;
          targetRotation = 0;
        }
        scheduleAnimation();
      };

      const animate = (time: number) => {
        frameId = null;
        if (!hasPointerPosition || document.hidden) return;

        const deltaTime = previousFrameTime
          ? Math.min((time - previousFrameTime) / 1000, 0.05)
          : 1 / 60;
        previousFrameTime = time;

        const rotationAlpha = 1 - Math.exp(-24 * deltaTime);
        const scaleAlpha = 1 - Math.exp(-26 * deltaTime);
        const glowAlpha = 1 - Math.exp(-20 * deltaTime);
        const normalizedSpeed = clamp(speed / 40, 0, 1);
        const baseScale = isHovering ? 1.1 : 1;
        const targetScale = isTextVariant
          ? 1
          : isPressed
            ? baseScale * 0.9
            : baseScale + normalizedSpeed * 0.03;

        rotation += (targetRotation - rotation) * rotationAlpha;
        scale += (targetScale - scale) * scaleAlpha;
        glowX += (pointerX - glowX) * glowAlpha;
        glowY += (pointerY - glowY) * glowAlpha;
        speed *= Math.exp(-14 * deltaTime);
        targetRotation *= Math.exp(-16 * deltaTime);

        const cursorTransform = `translate3d(${pointerX}px, ${pointerY}px, 0)`;
        if (cursorTransform !== lastCursorTransform) {
          cursor.style.transform = cursorTransform;
          lastCursorTransform = cursorTransform;
        }

        const arrowTransform = `translate(-32.2%, -18.5%) rotate(${rotation.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
        if (arrowTransform !== lastArrowTransform) {
          arrow.style.transform = arrowTransform;
          lastArrowTransform = arrowTransform;
        }

        const glowScale = 0.88 + normalizedSpeed * 0.22;
        const glowTransform = `translate3d(${glowX.toFixed(2)}px, ${glowY.toFixed(2)}px, 0) translate(-50%, -50%) scale(${glowScale.toFixed(3)})`;
        if (glowTransform !== lastGlowTransform) {
          glow.style.transform = glowTransform;
          lastGlowTransform = glowTransform;
        }

        const glowOpacity = isTextVariant
          ? "0"
          : Math.min(0.18 + normalizedSpeed * 0.3, 0.48).toFixed(3);
        if (glowOpacity !== lastGlowOpacity) {
          glow.style.opacity = glowOpacity;
          lastGlowOpacity = glowOpacity;
        }

        const positionSettled =
          Math.abs(glowX - pointerX) < 0.1 && Math.abs(glowY - pointerY) < 0.1;
        const rotationSettled =
          Math.abs(rotation - targetRotation) < 0.05 &&
          Math.abs(targetRotation) < 0.05;
        const scaleSettled = Math.abs(scale - targetScale) < 0.002;
        const speedSettled = speed < 0.1;

        if (
          !positionSettled ||
          !rotationSettled ||
          !scaleSettled ||
          !speedSettled
        ) {
          frameId = requestAnimationFrame(animate);
        } else {
          previousFrameTime = 0;
        }
      };

      function scheduleAnimation() {
        if (frameId === null && hasPointerPosition && !document.hidden) {
          frameId = requestAnimationFrame(animate);
        }
      }

      const handlePointerMove = (event: PointerEvent) => {
        if (event.pointerType === "touch") return;

        pointerX = event.clientX;
        pointerY = event.clientY;
        if (!hasPointerPosition) {
          previousPointerX = pointerX;
          previousPointerY = pointerY;
          glowX = pointerX;
          glowY = pointerY;
          hasPointerPosition = true;
        }

        const velocityX = pointerX - previousPointerX;
        const velocityY = pointerY - previousPointerY;
        previousPointerX = pointerX;
        previousPointerY = pointerY;
        speed = Math.min(Math.hypot(velocityX, velocityY), 40);
        targetRotation = isTextVariant ? 0 : clamp(velocityX * 0.45, -10, 10);

        updateHoverState(event.target);
        setVisible(!document.hidden);
        scheduleAnimation();
      };

      const handlePointerOver = (event: PointerEvent) => {
        if (event.pointerType !== "touch") updateHoverState(event.target);
      };

      const handlePointerDown = () => {
        isPressed = true;
        setData("pressed", "true");
        scheduleAnimation();
      };

      const handlePointerUp = () => {
        isPressed = false;
        setData("pressed", "false");
        scheduleAnimation();
        if (isTextVariant) return;

        setData("released", "true");
        window.clearTimeout(releaseTimeoutId);
        releaseTimeoutId = window.setTimeout(() => {
          setData("released", "false");
        }, 160);
      };

      const handlePointerLeave = () => {
        hasPointerPosition = false;
        lastHoverTarget = null;
        stopAnimation();
        setVisible(false);
        glow.style.opacity = "0";
        lastGlowOpacity = "0";
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

      const handleVisibilityChange = () => {
        if (document.hidden) handlePointerLeave();
      };

      window.addEventListener("pointermove", handlePointerMove, {
        passive: true,
      });
      window.addEventListener("pointerdown", handlePointerDown, {
        passive: true,
      });
      window.addEventListener("pointerup", handlePointerUp, { passive: true });
      window.addEventListener("pointerleave", handlePointerLeave, {
        passive: true,
      });
      document.addEventListener("pointerover", handlePointerOver, {
        passive: true,
      });
      window.addEventListener("blur", handlePointerLeave);
      document.documentElement.addEventListener(
        "mouseleave",
        handlePointerLeave,
      );
      document.addEventListener("mouseout", handleDocumentMouseOut);
      document.addEventListener("visibilitychange", handleVisibilityChange);
      document.documentElement.classList.add("custom-cursor-enabled");

      cleanupCursor = () => {
        stopAnimation();
        window.clearTimeout(releaseTimeoutId);
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerdown", handlePointerDown);
        window.removeEventListener("pointerup", handlePointerUp);
        window.removeEventListener("pointerleave", handlePointerLeave);
        document.removeEventListener("pointerover", handlePointerOver);
        window.removeEventListener("blur", handlePointerLeave);
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
        glow.style.opacity = "0";
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
      <div ref={glowRef} className="swift-cursor-glow" aria-hidden="true" />
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
          <span ref={arrowRef} className="swift-cursor__arrow">
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
