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

type FluidTrail = {
  move: (x: number, y: number, velocityX: number, velocityY: number) => void;
  clear: () => void;
  destroy: () => void;
};

const createFluidTrail = (canvas: HTMLCanvasElement): FluidTrail | null => {
  const gl = canvas.getContext("webgl2", {
    alpha: true,
    antialias: false,
    depth: false,
    premultipliedAlpha: false,
  });
  if (!gl) return null;

  const vertexSource = `#version 300 es
    in vec2 a_position;
    out vec2 v_uv;
    void main() {
      v_uv = a_position * 0.5 + 0.5;
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;
  const fragmentSource = `#version 300 es
    precision highp float;
    uniform sampler2D u_texture;
    uniform vec2 u_resolution;
    uniform vec2 u_mouse;
    uniform vec2 u_previousMouse;
    uniform vec2 u_velocity;
    uniform float u_time;
    uniform float u_splat;
    in vec2 v_uv;
    out vec4 outputColor;

    float segmentDistance(vec2 point, vec2 start, vec2 end) {
      vec2 line = end - start;
      float lengthSquared = max(dot(line, line), 0.000001);
      float progress = clamp(dot(point - start, line) / lengthSquared, 0.0, 1.0);
      return length(point - (start + line * progress));
    }

    void main() {
      vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
      vec2 fromMouse = (v_uv - u_mouse) * aspect;
      float influence = exp(-dot(fromMouse, fromMouse) * 42.0);
      vec2 perpendicular = vec2(-fromMouse.y, fromMouse.x);
      vec2 flow = u_velocity * 0.00022;
      vec2 curl = perpendicular * influence * sin(u_time * 2.2 + length(fromMouse) * 35.0) * 0.004;
      vec2 ambientFlow = vec2(
        sin(v_uv.y * 19.0 + u_time * 0.8),
        cos(v_uv.x * 17.0 - u_time * 0.65)
      ) * 0.00055;
      vec2 sampleUv = clamp(v_uv - flow * influence + curl + ambientFlow, vec2(0.001), vec2(0.999));
      vec4 previous = texture(u_texture, sampleUv) * 0.974;

      float distanceToPath = segmentDistance(
        v_uv * aspect,
        u_previousMouse * aspect,
        u_mouse * aspect
      );
      float core = exp(-(distanceToPath * distanceToPath) / 0.00014);
      float plume = exp(-(distanceToPath * distanceToPath) / 0.0004) * 0.18;
      float dye = (core + plume) * u_splat;
      float colorShift = 0.5 + 0.5 * sin(u_time * 1.7);
      vec3 blue = mix(vec3(0.035, 0.24, 0.95), vec3(0.42, 0.78, 1.0), colorShift);
      vec3 whiteBlue = mix(blue, vec3(0.86, 0.96, 1.0), 0.28);
      vec3 color = previous.rgb + whiteBlue * dye * 0.22;
      float alpha = min(previous.a + dye * 0.2, 0.52);
      outputColor = vec4(color, alpha);
    }
  `;

  const compileShader = (type: number, source: string) => {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  };

  const vertexShader = compileShader(gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentSource);
  if (!vertexShader || !fragmentShader) return null;

  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }

  const positionBuffer = gl.createBuffer();
  const vertexArray = gl.createVertexArray();
  if (!positionBuffer || !vertexArray) return null;
  gl.bindVertexArray(vertexArray);
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
    gl.STATIC_DRAW,
  );
  const positionLocation = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  const uniform = (name: string) => gl.getUniformLocation(program, name);
  const textureUniform = uniform("u_texture");
  const resolutionUniform = uniform("u_resolution");
  const mouseUniform = uniform("u_mouse");
  const previousMouseUniform = uniform("u_previousMouse");
  const velocityUniform = uniform("u_velocity");
  const timeUniform = uniform("u_time");
  const splatUniform = uniform("u_splat");
  const framebuffer = gl.createFramebuffer();
  if (!framebuffer) return null;

  let textures: WebGLTexture[] = [];
  let readIndex = 0;
  let animationFrameId = 0;
  let pointerX = -1;
  let pointerY = -1;
  let previousX = -1;
  let previousY = -1;
  let velocityX = 0;
  let velocityY = 0;
  let pendingSplat = false;
  let destroyed = false;

  const createTexture = () => {
    const texture = gl.createTexture();
    if (!texture) return null;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      canvas.width,
      canvas.height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null,
    );
    return texture;
  };

  const resize = () => {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    const width = Math.max(1, Math.round(window.innerWidth * pixelRatio));
    const height = Math.max(1, Math.round(window.innerHeight * pixelRatio));
    if (canvas.width === width && canvas.height === height) return;
    canvas.width = width;
    canvas.height = height;
    textures.forEach((texture) => gl.deleteTexture(texture));
    textures = [createTexture(), createTexture()].filter(
      (texture): texture is WebGLTexture => texture !== null,
    );
    readIndex = 0;
    gl.viewport(0, 0, width, height);
  };

  const clear = () => {
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.clearColor(0, 0, 0, 0);
    textures.forEach((texture) => {
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        texture,
        0,
      );
      gl.clear(gl.COLOR_BUFFER_BIT);
    });
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.clear(gl.COLOR_BUFFER_BIT);
    pendingSplat = false;
  };

  const draw = (time: number) => {
    if (destroyed || textures.length !== 2) return;
    const writeIndex = 1 - readIndex;
    gl.useProgram(program);
    gl.bindVertexArray(vertexArray);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textures[readIndex]);
    gl.uniform1i(textureUniform, 0);
    gl.uniform2f(resolutionUniform, canvas.width, canvas.height);
    gl.uniform2f(mouseUniform, pointerX, pointerY);
    gl.uniform2f(previousMouseUniform, previousX, previousY);
    gl.uniform2f(velocityUniform, velocityX, velocityY);
    gl.uniform1f(timeUniform, time / 1000);
    gl.uniform1f(splatUniform, pendingSplat ? 1 : 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      textures[writeIndex],
      0,
    );
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, framebuffer);
    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);
    gl.blitFramebuffer(
      0,
      0,
      canvas.width,
      canvas.height,
      0,
      0,
      canvas.width,
      canvas.height,
      gl.COLOR_BUFFER_BIT,
      gl.NEAREST,
    );
    readIndex = writeIndex;
    pendingSplat = false;
    velocityX *= 0.88;
    velocityY *= 0.88;
    animationFrameId = requestAnimationFrame(draw);
  };

  resize();
  clear();
  window.addEventListener("resize", resize, { passive: true });
  animationFrameId = requestAnimationFrame(draw);

  return {
    move: (x, y, nextVelocityX, nextVelocityY) => {
      const normalizedX = x / window.innerWidth;
      const normalizedY = 1 - y / window.innerHeight;
      if (pointerX < 0) {
        pointerX = normalizedX;
        pointerY = normalizedY;
      }
      previousX = pointerX;
      previousY = pointerY;
      pointerX = normalizedX;
      pointerY = normalizedY;
      velocityX = nextVelocityX;
      velocityY = -nextVelocityY;
      pendingSplat = true;
    },
    clear,
    destroy: () => {
      destroyed = true;
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
      textures.forEach((texture) => gl.deleteTexture(texture));
      gl.deleteFramebuffer(framebuffer);
      gl.deleteBuffer(positionBuffer);
      gl.deleteVertexArray(vertexArray);
      gl.deleteProgram(program);
    },
  };
};

export function SwiftGlowingCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLSpanElement>(null);
  const fluidCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const arrow = arrowRef.current;
    const fluidCanvas = fluidCanvasRef.current;
    if (!cursor || !arrow || !fluidCanvas) return;

    const finePointer = window.matchMedia("(pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let cleanupCursor: (() => void) | undefined;

    const configureCursor = () => {
      cleanupCursor?.();
      cleanupCursor = undefined;

      if (!finePointer.matches || reducedMotion.matches) return;

      const fluidTrail = createFluidTrail(fluidCanvas);

      let pointerX = -100;
      let pointerY = -100;
      let previousPointerX = -100;
      let previousPointerY = -100;
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
        const normalizedSpeed = clamp(speed / 40, 0, 1);
        const baseScale = isHovering ? 1.1 : 1;
        const targetScale = isTextVariant
          ? 1
          : isPressed
            ? baseScale * 0.9
            : baseScale + normalizedSpeed * 0.03;

        rotation += (targetRotation - rotation) * rotationAlpha;
        scale += (targetScale - scale) * scaleAlpha;
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

        const rotationSettled =
          Math.abs(rotation - targetRotation) < 0.05 &&
          Math.abs(targetRotation) < 0.05;
        const scaleSettled = Math.abs(scale - targetScale) < 0.002;
        const speedSettled = speed < 0.1;

        if (!rotationSettled || !scaleSettled || !speedSettled) {
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
          hasPointerPosition = true;
        }

        const velocityX = pointerX - previousPointerX;
        const velocityY = pointerY - previousPointerY;
        previousPointerX = pointerX;
        previousPointerY = pointerY;
        speed = Math.min(Math.hypot(velocityX, velocityY), 40);
        targetRotation = isTextVariant ? 0 : clamp(velocityX * 0.45, -10, 10);
        fluidTrail?.move(pointerX, pointerY, velocityX, velocityY);

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
        fluidTrail?.clear();
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
        fluidTrail?.destroy();
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
        ref={fluidCanvasRef}
        className="swift-cursor-fluid"
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
