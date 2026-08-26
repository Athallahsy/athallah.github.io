"use client";

import { useEffect, useRef } from "react";

interface ColorRGB {
  r: number;
  g: number;
  b: number;
}

interface SplashCursorProps {
  SIM_RESOLUTION?: number;
  DYE_RESOLUTION?: number;
  DENSITY_DISSIPATION?: number;
  VELOCITY_DISSIPATION?: number;
  PRESSURE?: number;
  PRESSURE_ITERATIONS?: number;
  CURL?: number;
  SPLAT_RADIUS?: number;
  SPLAT_FORCE?: number;
  SHADING?: boolean;
  COLOR_UPDATE_SPEED?: number;
  BACK_COLOR?: ColorRGB;
  TRANSPARENT?: boolean;
  RAINBOW_MODE?: boolean;
  COLOR?: string;
  className?: string;
}

// ── FBO helpers ─────────────────────────────────────────────────────────

interface FBO {
  texture: WebGLTexture;
  fbo: WebGLFramebuffer;
  width: number;
  height: number;
  texelSizeX: number;
  texelSizeY: number;
  attach: (id: number) => number;
}

interface DoubleFBO {
  width: number;
  height: number;
  texelSizeX: number;
  texelSizeY: number;
  read: FBO;
  write: FBO;
  swap: () => void;
}

function createFBO(
  gl: WebGL2RenderingContext,
  w: number,
  h: number,
  internalFormat: number,
  format: number,
  type: number,
  filter: number,
): FBO {
  gl.activeTexture(gl.TEXTURE0);
  const texture = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);

  const fbo = gl.createFramebuffer()!;
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    gl.COLOR_ATTACHMENT0,
    gl.TEXTURE_2D,
    texture,
    0,
  );
  gl.viewport(0, 0, w, h);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  return {
    texture,
    fbo,
    width: w,
    height: h,
    texelSizeX: 1 / w,
    texelSizeY: 1 / h,
    attach(id: number) {
      gl.activeTexture(gl.TEXTURE0 + id);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      return id;
    },
  };
}

function createDoubleFBO(
  gl: WebGL2RenderingContext,
  w: number,
  h: number,
  internalFormat: number,
  format: number,
  type: number,
  filter: number,
): DoubleFBO {
  let fbo1 = createFBO(gl, w, h, internalFormat, format, type, filter);
  let fbo2 = createFBO(gl, w, h, internalFormat, format, type, filter);
  return {
    width: w,
    height: h,
    texelSizeX: fbo1.texelSizeX,
    texelSizeY: fbo1.texelSizeY,
    get read() {
      return fbo1;
    },
    set read(v: FBO) {
      fbo1 = v;
    },
    get write() {
      return fbo2;
    },
    set write(v: FBO) {
      fbo2 = v;
    },
    swap() {
      const tmp = fbo1;
      fbo1 = fbo2;
      fbo2 = tmp;
    },
  };
}

function compileShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string,
): WebGLShader {
  const shader = gl.createShader(type)!;
  const trimmedSource = source.trim();
  gl.shaderSource(shader, trimmedSource);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(
      "[SplashCursor] shader compile error:",
      gl.getShaderInfoLog(shader),
    );
  }
  return shader;
}

function createProgram(
  gl: WebGL2RenderingContext,
  vs: WebGLShader,
  fs: WebGLShader,
): WebGLProgram {
  const program = gl.createProgram()!;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(
      "[SplashCursor] program link error:",
      gl.getProgramInfoLog(program),
    );
  }
  return program;
}

function getUniforms(
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
): Record<string, WebGLUniformLocation> {
  const uniforms: Record<string, WebGLUniformLocation> = {};
  const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < count; i++) {
    const info = gl.getActiveUniform(program, i)!;
    uniforms[info.name] = gl.getUniformLocation(program, info.name)!;
  }
  return uniforms;
}

function hexToRgbNorm(hex: string): ColorRGB {
  let h = hex.replace("#", "");
  if (h.length === 3) {
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const int = parseInt(h, 16);
  return {
    r: ((int >> 16) & 255) / 255,
    g: ((int >> 8) & 255) / 255,
    b: (int & 255) / 255,
  };
}

function hsvToRgb(h: number, s: number, v: number): ColorRGB {
  let r = 0,
    g = 0,
    b = 0;
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = v;
      b = p;
      break;
    case 2:
      r = p;
      g = v;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = v;
      break;
    case 4:
      r = t;
      g = p;
      b = v;
      break;
    case 5:
      r = v;
      g = p;
      b = q;
      break;
  }
  return { r, g, b };
}

// ── Shaders ──────────────────────────────────────────────────────────────

const BASE_VERTEX = `#version 300 es
  precision highp float;
  layout(location = 0) in vec2 aPosition;
  out vec2 vUv;
  out vec2 vL;
  out vec2 vR;
  out vec2 vT;
  out vec2 vB;
  uniform vec2 texelSize;
  void main () {
    vUv = aPosition * 0.5 + 0.5;
    vL = vUv - vec2(texelSize.x, 0.0);
    vR = vUv + vec2(texelSize.x, 0.0);
    vT = vUv + vec2(0.0, texelSize.y);
    vB = vUv - vec2(0.0, texelSize.y);
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`;

const CLEAR_SHADER = `#version 300 es
  precision highp float;
  precision highp sampler2D;
  in vec2 vUv;
  out vec4 fragColor;
  uniform sampler2D uTexture;
  uniform float value;
  void main () {
    fragColor = value * texture(uTexture, vUv);
  }
`;

const SPLAT_SHADER = `#version 300 es
  precision highp float;
  precision highp sampler2D;
  in vec2 vUv;
  out vec4 fragColor;
  uniform sampler2D uTarget;
  uniform float aspectRatio;
  uniform vec3 color;
  uniform vec2 point;
  uniform float radius;
  void main () {
    vec2 p = vUv - point.xy;
    p.x *= aspectRatio;
    vec3 splat = exp(-dot(p, p) / radius) * color;
    vec3 base = texture(uTarget, vUv).xyz;
    fragColor = vec4(base + splat, 1.0);
  }
`;

const ADVECTION_SHADER = `#version 300 es
  precision highp float;
  precision highp sampler2D;
  in vec2 vUv;
  out vec4 fragColor;
  uniform sampler2D uVelocity;
  uniform sampler2D uSource;
  uniform vec2 texelSize;
  uniform float dt;
  uniform float dissipation;
  void main () {
    vec2 coord = vUv - dt * texture(uVelocity, vUv).xy * texelSize;
    vec4 result = texture(uSource, coord);
    float decay = 1.0 + dissipation * dt;
    fragColor = result / decay;
  }
`;

const DIVERGENCE_SHADER = `#version 300 es
  precision highp float;
  precision highp sampler2D;
  in vec2 vUv;
  in vec2 vL;
  in vec2 vR;
  in vec2 vT;
  in vec2 vB;
  out vec4 fragColor;
  uniform sampler2D uVelocity;
  void main () {
    float L = texture(uVelocity, vL).x;
    float R = texture(uVelocity, vR).x;
    float T = texture(uVelocity, vT).y;
    float B = texture(uVelocity, vB).y;
    vec2 C = texture(uVelocity, vUv).xy;
    if (vL.x < 0.0) { L = -C.x; }
    if (vR.x > 1.0) { R = -C.x; }
    if (vT.y > 1.0) { T = -C.y; }
    if (vB.y < 0.0) { B = -C.y; }
    float div = 0.5 * (R - L + T - B);
    fragColor = vec4(div, 0.0, 0.0, 1.0);
  }
`;

const CURL_SHADER = `#version 300 es
  precision highp float;
  precision highp sampler2D;
  in vec2 vUv;
  in vec2 vL;
  in vec2 vR;
  in vec2 vT;
  in vec2 vB;
  out vec4 fragColor;
  uniform sampler2D uVelocity;
  void main () {
    float L = texture(uVelocity, vL).y;
    float R = texture(uVelocity, vR).y;
    float T = texture(uVelocity, vT).x;
    float B = texture(uVelocity, vB).x;
    float vorticity = R - L - T + B;
    fragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
  }
`;

const VORTICITY_SHADER = `#version 300 es
  precision highp float;
  precision highp sampler2D;
  in vec2 vUv;
  in vec2 vL;
  in vec2 vR;
  in vec2 vT;
  in vec2 vB;
  out vec4 fragColor;
  uniform sampler2D uVelocity;
  uniform sampler2D uCurl;
  uniform float curl;
  uniform float dt;
  void main () {
    float L = texture(uCurl, vL).x;
    float R = texture(uCurl, vR).x;
    float T = texture(uCurl, vT).x;
    float B = texture(uCurl, vB).x;
    float C = texture(uCurl, vUv).x;
    vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
    force /= length(force) + 0.0001;
    force *= curl * C;
    force.y *= -1.0;
    vec2 vel = texture(uVelocity, vUv).xy;
    vel += force * dt;
    vel = clamp(vel, -1000.0, 1000.0);
    fragColor = vec4(vel, 0.0, 1.0);
  }
`;

const PRESSURE_SHADER = `#version 300 es
  precision highp float;
  precision highp sampler2D;
  in vec2 vUv;
  in vec2 vL;
  in vec2 vR;
  in vec2 vT;
  in vec2 vB;
  out vec4 fragColor;
  uniform sampler2D uPressure;
  uniform sampler2D uDivergence;
  void main () {
    float L = texture(uPressure, vL).x;
    float R = texture(uPressure, vR).x;
    float T = texture(uPressure, vT).x;
    float B = texture(uPressure, vB).x;
    float divergence = texture(uDivergence, vUv).x;
    float pressure = (L + R + B + T - divergence) * 0.25;
    fragColor = vec4(pressure, 0.0, 0.0, 1.0);
  }
`;

const GRADIENT_SUBTRACT_SHADER = `#version 300 es
  precision highp float;
  precision highp sampler2D;
  in vec2 vUv;
  in vec2 vL;
  in vec2 vR;
  in vec2 vT;
  in vec2 vB;
  out vec4 fragColor;
  uniform sampler2D uPressure;
  uniform sampler2D uVelocity;
  void main () {
    float L = texture(uPressure, vL).x;
    float R = texture(uPressure, vR).x;
    float T = texture(uPressure, vT).x;
    float B = texture(uPressure, vB).x;
    vec2 velocity = texture(uVelocity, vUv).xy;
    velocity.xy -= vec2(R - L, T - B);
    fragColor = vec4(velocity, 0.0, 1.0);
  }
`;

const DISPLAY_SHADER = `#version 300 es
  precision highp float;
  precision highp sampler2D;
  in vec2 vUv;
  in vec2 vL;
  in vec2 vR;
  in vec2 vT;
  in vec2 vB;
  out vec4 fragColor;
  uniform sampler2D uTexture;
  uniform vec2 texelSize;
  uniform bool uShading;
  uniform vec3 uBackColor;
  uniform bool uTransparent;
  void main () {
    vec3 c = texture(uTexture, vUv).rgb;
    if (uShading) {
      vec3 lc = texture(uTexture, vL).rgb;
      vec3 rc = texture(uTexture, vR).rgb;
      vec3 tc = texture(uTexture, vT).rgb;
      vec3 bc = texture(uTexture, vB).rgb;
      float dx = length(rc) - length(lc);
      float dy = length(tc) - length(bc);
      vec3 n = normalize(vec3(dx, dy, length(texelSize)));
      vec3 l = vec3(0.0, 0.0, 1.0);
      float diffuse = clamp(dot(n, l) + 0.7, 0.7, 1.0);
      c *= diffuse;
    }
    float a = max(c.r, max(c.g, c.b));
    if (uTransparent) {
      fragColor = vec4(c, a);
    } else {
      fragColor = vec4(c + uBackColor * (1.0 - a), 1.0);
    }
  }
`;

// ── Component ────────────────────────────────────────────────────────────

export default function SplashCursor({
  SIM_RESOLUTION = 128,
  DYE_RESOLUTION = 512,
  DENSITY_DISSIPATION = 2.5,
  VELOCITY_DISSIPATION = 1.2,
  PRESSURE = 0.35,
  PRESSURE_ITERATIONS = 20,
  CURL = 3,
  SPLAT_RADIUS = 0.15,
  SPLAT_FORCE = 6000,
  SHADING = true,
  COLOR_UPDATE_SPEED = 10,
  BACK_COLOR = { r: 0, g: 0, b: 0 },
  TRANSPARENT = true,
  RAINBOW_MODE = false,
  COLOR = "#0369A1",
  className,
}: SplashCursorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Efek ini murni reaktif ke gerakan pointer — di bawah prefers-reduced-
    // motion kita skip total inisialisasi WebGL-nya (bukan cuma freeze).
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const gl = canvas.getContext("webgl2", {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false,
    }) as WebGL2RenderingContext | null;

    if (!gl) {
      console.warn(
        "[SplashCursor] WebGL2 tidak didukung browser ini — efek dilewati.",
      );
      return;
    }

    gl.getExtension("EXT_color_buffer_float");
    gl.getExtension("OES_texture_float_linear");

    const fixedColor = hexToRgbNorm(COLOR);

    // ── Fullscreen quad ──
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]),
      gl.STATIC_DRAW,
    );
    const elemBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elemBuffer);
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array([0, 1, 2, 0, 2, 3]),
      gl.STATIC_DRAW,
    );
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    const blit = (target: FBO | null, clear = false) => {
      if (target == null) {
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      } else {
        gl.viewport(0, 0, target.width, target.height);
        gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
      }
      if (clear) {
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
      }
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    };

    // ── Compile programs ──
    const baseVertex = compileShader(gl, gl.VERTEX_SHADER, BASE_VERTEX);
    const buildProgram = (fs: string) => {
      const shader = compileShader(gl, gl.FRAGMENT_SHADER, fs);
      const program = createProgram(gl, baseVertex, shader);
      return { program, uniforms: getUniforms(gl, program) };
    };

    const clearP = buildProgram(CLEAR_SHADER);
    const splatP = buildProgram(SPLAT_SHADER);
    const advectionP = buildProgram(ADVECTION_SHADER);
    const divergenceP = buildProgram(DIVERGENCE_SHADER);
    const curlP = buildProgram(CURL_SHADER);
    const vorticityP = buildProgram(VORTICITY_SHADER);
    const pressureP = buildProgram(PRESSURE_SHADER);
    const gradientSubtractP = buildProgram(GRADIENT_SUBTRACT_SHADER);
    const displayP = buildProgram(DISPLAY_SHADER);

    // ── Framebuffers ──
    let dye: DoubleFBO;
    let velocity: DoubleFBO;
    let divergenceFBO: FBO;
    let curlFBO: FBO;
    let pressure: DoubleFBO;

    function getResolution(resolution: number) {
      let aspectRatio = gl!.drawingBufferWidth / gl!.drawingBufferHeight;
      if (aspectRatio < 1) aspectRatio = 1.0 / aspectRatio;
      const min = Math.round(resolution);
      const max = Math.round(resolution * aspectRatio);
      if (gl!.drawingBufferWidth > gl!.drawingBufferHeight) {
        return { width: max, height: min };
      }
      return { width: min, height: max };
    }

    function initFramebuffers() {
      const simRes = getResolution(SIM_RESOLUTION);
      const dyeRes = getResolution(DYE_RESOLUTION);
      const texType = gl!.HALF_FLOAT;

      dye = createDoubleFBO(
        gl!,
        dyeRes.width,
        dyeRes.height,
        gl!.RGBA16F,
        gl!.RGBA,
        texType,
        gl!.LINEAR,
      );
      velocity = createDoubleFBO(
        gl!,
        simRes.width,
        simRes.height,
        gl!.RG16F,
        gl!.RG,
        texType,
        gl!.LINEAR,
      );
      divergenceFBO = createFBO(
        gl!,
        simRes.width,
        simRes.height,
        gl!.R16F,
        gl!.RED,
        texType,
        gl!.NEAREST,
      );
      curlFBO = createFBO(
        gl!,
        simRes.width,
        simRes.height,
        gl!.R16F,
        gl!.RED,
        texType,
        gl!.NEAREST,
      );
      pressure = createDoubleFBO(
        gl!,
        simRes.width,
        simRes.height,
        gl!.R16F,
        gl!.RED,
        texType,
        gl!.NEAREST,
      );
    }

    const scaleByPixelRatio = (v: number) =>
      Math.floor(v * (window.devicePixelRatio || 1));

    function resizeCanvas(): boolean {
      const width = scaleByPixelRatio(canvas!.clientWidth);
      const height = scaleByPixelRatio(canvas!.clientHeight);
      if (canvas!.width !== width || canvas!.height !== height) {
        canvas!.width = width || 1;
        canvas!.height = height || 1;
        return true;
      }
      return false;
    }

    resizeCanvas();
    initFramebuffers();

    // ── Pointer state ──
    const pointer = {
      id: -1,
      texcoordX: 0.5,
      texcoordY: 0.5,
      prevTexcoordX: 0.5,
      prevTexcoordY: 0.5,
      deltaX: 0,
      deltaY: 0,
      down: false,
      moved: false,
      color: RAINBOW_MODE ? hsvToRgb(Math.random(), 1, 1) : fixedColor,
    };

    function correctDeltaX(delta: number) {
      const ar = canvas!.width / canvas!.height;
      return ar < 1 ? delta * ar : delta;
    }
    function correctDeltaY(delta: number) {
      const ar = canvas!.width / canvas!.height;
      return ar > 1 ? delta / ar : delta;
    }
    function correctRadius(radius: number) {
      const ar = canvas!.width / canvas!.height;
      return ar > 1 ? radius * ar : radius;
    }

    function generateColor(): ColorRGB {
      if (!RAINBOW_MODE) return fixedColor;
      const c = hsvToRgb(Math.random(), 1.0, 1.0);
      return { r: c.r * 0.4, g: c.g * 0.4, b: c.b * 0.4 };
    }

    function updatePointerDownData(posX: number, posY: number, id: number) {
      pointer.id = id;
      pointer.down = true;
      pointer.moved = false;
      pointer.texcoordX = posX / canvas!.width;
      pointer.texcoordY = 1.0 - posY / canvas!.height;
      pointer.prevTexcoordX = pointer.texcoordX;
      pointer.prevTexcoordY = pointer.texcoordY;
      pointer.deltaX = 0;
      pointer.deltaY = 0;
      pointer.color = generateColor();
    }

    function updatePointerMoveData(posX: number, posY: number) {
      pointer.prevTexcoordX = pointer.texcoordX;
      pointer.prevTexcoordY = pointer.texcoordY;
      pointer.texcoordX = posX / canvas!.width;
      pointer.texcoordY = 1.0 - posY / canvas!.height;
      pointer.deltaX = correctDeltaX(pointer.texcoordX - pointer.prevTexcoordX);
      pointer.deltaY = correctDeltaY(pointer.texcoordY - pointer.prevTexcoordY);
      pointer.moved =
        Math.abs(pointer.deltaX) > 0 || Math.abs(pointer.deltaY) > 0;
    }

    // Dipasang di `window`, bukan di canvas — canvas ini `pointer-events:none`
    // (biar konten & Lanyard 3D di atasnya tetap bisa di-interact), jadi
    // posisi pointer di-track global lalu dikonversi relatif ke canvas.
    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas!.getBoundingClientRect();
      const x = scaleByPixelRatio(e.clientX - rect.left);
      const y = scaleByPixelRatio(e.clientY - rect.top);
      if (e.pointerType !== "touch") pointer.down = true;
      if (!pointer.down) return;

      let timer = colorTimer;
      timer += 0.016 * COLOR_UPDATE_SPEED;
      if (timer >= 1 && RAINBOW_MODE) {
        timer = 0;
        pointer.color = generateColor();
      }
      colorTimer = timer;

      updatePointerMoveData(x, y);
    };

    const onPointerDown = (e: PointerEvent) => {
      const rect = canvas!.getBoundingClientRect();
      const x = scaleByPixelRatio(e.clientX - rect.left);
      const y = scaleByPixelRatio(e.clientY - rect.top);
      updatePointerDownData(x, y, e.pointerId);
    };

    const onPointerUp = () => {
      pointer.down = false;
    };

    let colorTimer = 0;

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);

    // ── Simulation step ──
    function splat(
      x: number,
      y: number,
      dx: number,
      dy: number,
      color: ColorRGB,
    ) {
      gl!.useProgram(splatP.program);
      gl!.uniform1i(splatP.uniforms.uTarget, velocity.read.attach(0));
      gl!.uniform1f(
        splatP.uniforms.aspectRatio,
        canvas!.width / canvas!.height,
      );
      gl!.uniform2f(splatP.uniforms.point, x, y);
      gl!.uniform3f(splatP.uniforms.color, dx, dy, 0.0);
      gl!.uniform1f(
        splatP.uniforms.radius,
        correctRadius(SPLAT_RADIUS / 100.0),
      );
      blit(velocity.write);
      velocity.swap();

      gl!.uniform1i(splatP.uniforms.uTarget, dye.read.attach(0));
      gl!.uniform3f(splatP.uniforms.color, color.r, color.g, color.b);
      blit(dye.write);
      dye.swap();
    }

    function splatPointer() {
      const dx = pointer.deltaX * SPLAT_FORCE;
      const dy = pointer.deltaY * SPLAT_FORCE;
      splat(pointer.texcoordX, pointer.texcoordY, dx, dy, pointer.color);
    }

    function step(dt: number) {
      gl!.disable(gl!.BLEND);

      gl!.useProgram(curlP.program);
      gl!.uniform2f(
        curlP.uniforms.texelSize,
        velocity.texelSizeX,
        velocity.texelSizeY,
      );
      gl!.uniform1i(curlP.uniforms.uVelocity, velocity.read.attach(0));
      blit(curlFBO);

      gl!.useProgram(vorticityP.program);
      gl!.uniform2f(
        vorticityP.uniforms.texelSize,
        velocity.texelSizeX,
        velocity.texelSizeY,
      );
      gl!.uniform1i(vorticityP.uniforms.uVelocity, velocity.read.attach(0));
      gl!.uniform1i(vorticityP.uniforms.uCurl, curlFBO.attach(1));
      gl!.uniform1f(vorticityP.uniforms.curl, CURL);
      gl!.uniform1f(vorticityP.uniforms.dt, dt);
      blit(velocity.write);
      velocity.swap();

      gl!.useProgram(divergenceP.program);
      gl!.uniform2f(
        divergenceP.uniforms.texelSize,
        velocity.texelSizeX,
        velocity.texelSizeY,
      );
      gl!.uniform1i(divergenceP.uniforms.uVelocity, velocity.read.attach(0));
      blit(divergenceFBO);

      gl!.useProgram(clearP.program);
      gl!.uniform1i(clearP.uniforms.uTexture, pressure.read.attach(0));
      gl!.uniform1f(clearP.uniforms.value, PRESSURE);
      blit(pressure.write);
      pressure.swap();

      gl!.useProgram(pressureP.program);
      gl!.uniform2f(
        pressureP.uniforms.texelSize,
        velocity.texelSizeX,
        velocity.texelSizeY,
      );
      gl!.uniform1i(pressureP.uniforms.uDivergence, divergenceFBO.attach(0));
      for (let i = 0; i < PRESSURE_ITERATIONS; i++) {
        gl!.uniform1i(pressureP.uniforms.uPressure, pressure.read.attach(1));
        blit(pressure.write);
        pressure.swap();
      }

      gl!.useProgram(gradientSubtractP.program);
      gl!.uniform2f(
        gradientSubtractP.uniforms.texelSize,
        velocity.texelSizeX,
        velocity.texelSizeY,
      );
      gl!.uniform1i(
        gradientSubtractP.uniforms.uPressure,
        pressure.read.attach(0),
      );
      gl!.uniform1i(
        gradientSubtractP.uniforms.uVelocity,
        velocity.read.attach(1),
      );
      blit(velocity.write);
      velocity.swap();

      gl!.useProgram(advectionP.program);
      gl!.uniform2f(
        advectionP.uniforms.texelSize,
        velocity.texelSizeX,
        velocity.texelSizeY,
      );
      gl!.uniform1i(advectionP.uniforms.uVelocity, velocity.read.attach(0));
      gl!.uniform1i(advectionP.uniforms.uSource, velocity.read.attach(0));
      gl!.uniform1f(advectionP.uniforms.dt, dt);
      gl!.uniform1f(advectionP.uniforms.dissipation, VELOCITY_DISSIPATION);
      blit(velocity.write);
      velocity.swap();

      gl!.uniform2f(
        advectionP.uniforms.texelSize,
        velocity.texelSizeX,
        velocity.texelSizeY,
      );
      gl!.uniform1i(advectionP.uniforms.uVelocity, velocity.read.attach(0));
      gl!.uniform1i(advectionP.uniforms.uSource, dye.read.attach(1));
      gl!.uniform1f(advectionP.uniforms.dissipation, DENSITY_DISSIPATION);
      blit(dye.write);
      dye.swap();
    }

    function render() {
      gl!.blendFunc(gl!.ONE, gl!.ONE_MINUS_SRC_ALPHA);
      gl!.enable(gl!.BLEND);
      gl!.useProgram(displayP.program);
      gl!.uniform1i(displayP.uniforms.uShading, SHADING ? 1 : 0);
      gl!.uniform1i(displayP.uniforms.uTransparent, TRANSPARENT ? 1 : 0);
      gl!.uniform3f(
        displayP.uniforms.uBackColor,
        BACK_COLOR.r,
        BACK_COLOR.g,
        BACK_COLOR.b,
      );
      gl!.uniform2f(
        displayP.uniforms.texelSize,
        1 / canvas!.width,
        1 / canvas!.height,
      );
      gl!.uniform1i(displayP.uniforms.uTexture, dye.read.attach(0));
      blit(null);
    }

    let animationId = 0;
    let lastTime = performance.now();

    function frame() {
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.016666 * 2);
      lastTime = now;

      if (resizeCanvas()) initFramebuffers();

      if (pointer.moved) {
        pointer.moved = false;
        splatPointer();
      }

      step(dt);
      render();

      animationId = requestAnimationFrame(frame);
    }

    animationId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [
    SIM_RESOLUTION,
    DYE_RESOLUTION,
    DENSITY_DISSIPATION,
    VELOCITY_DISSIPATION,
    PRESSURE,
    PRESSURE_ITERATIONS,
    CURL,
    SPLAT_RADIUS,
    SPLAT_FORCE,
    SHADING,
    COLOR_UPDATE_SPEED,
    BACK_COLOR,
    TRANSPARENT,
    RAINBOW_MODE,
    COLOR,
  ]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    />
  );
}
