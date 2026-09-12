import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

(async function () {
  const canvas = document.getElementById('chip3d');
  if (!canvas) return;

  canvas.title = 'Drag to rotate. Click/tap or press Enter/Space to toggle the exploded view';
  const prefersReducedMotion3D = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (document.fonts) {
    try {
      await Promise.all([
        document.fonts.load('400 44px "IBM Plex Sans Condensed"'),
        document.fonts.load('600 16px "IBM Plex Sans Condensed"'),
        document.fonts.load('700 16px "IBM Plex Sans Condensed"'),
        document.fonts.load('800 56px "IBM Plex Sans Condensed"'),
        document.fonts.ready
      ]);
    } catch (_) {}
  }

  const isMobile = window.matchMedia('(max-width: 820px), (pointer: coarse)').matches;
  const deviceDPR = Math.max(1, window.devicePixelRatio || 1);

  const quality = isMobile ? {
    tex: 1024,
    minDPR: 0.75,
    startDPR: Math.min(Math.max(deviceDPR * 0.9, 1.0), 1.8),
    maxDPR: 2.2,
    maxRenderEdge: 1080,
    adaptiveFpsCap: 60
  } : {
    tex: 2048,
    minDPR: 1.0,
    startDPR: Math.min(Math.max(deviceDPR, 1.25), 2.5),
    maxDPR: 3.5,
    maxRenderEdge: 1920,
    adaptiveFpsCap: 144
  };

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    precision: 'highp',
    powerPreference: 'high-performance'
  });

  renderer.setPixelRatio(quality.startDPR);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.30;
  renderer.shadowMap.enabled = false;
  renderer.setClearAlpha(0);

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(20, 1, 0.1, 200);
  camera.position.set(15.2, 9.2, 15.8);

  const pmrem = new THREE.PMREMGenerator(renderer);
  const envRT = pmrem.fromScene(new RoomEnvironment(), 0.02);
  scene.environment = envRT.texture;
  scene.environmentIntensity = 0.60;
  pmrem.dispose();

  scene.add(new THREE.AmbientLight(0xffffff, 1.20));

  const hemi = new THREE.HemisphereLight(0xf2f7ff, 0x2d3946, 0.55);
  scene.add(hemi);

  const key = new THREE.DirectionalLight(0xffffff, 0.40);
  key.position.set(7, 11, 8);
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xe4efff, 0.30);
  fill.position.set(-8, 5, -6);
  scene.add(fill);

  const rim = new THREE.DirectionalLight(0xbfdcff, 0.15);
  rim.position.set(-5, 8, -10);
  scene.add(rim);

  const bottomFill = new THREE.DirectionalLight(0xffffff, 0.20);
  bottomFill.position.set(0, -7, 4);
  scene.add(bottomFill);

  const adaptive = {
    currentDPR: quality.startDPR,
    minDPR: quality.minDPR,
    maxDPR: quality.maxDPR,
    targetFrameMs: 1000 / 60,
    samples: [],
    maxSamples: 60,
    frameCounter: 0,
    resizePending: false,
    resizeForce: false
  };

  function estimateRefreshHz(samples = 36) {
    return new Promise((resolve) => {
      if (document.hidden) {
        resolve(60);
        return;
      }

      const deltas = [];
      let last = performance.now();

      function step(now) {
        const delta = now - last;
        last = now;

        if (delta > 0 && delta < 80) deltas.push(delta);

        if (deltas.length >= samples) {
          deltas.sort((a, b) => a - b);
          const mid = deltas.slice(Math.floor(samples * 0.2), Math.ceil(samples * 0.8));
          const avg = mid.reduce((s, v) => s + v, 0) / mid.length;
          resolve(Math.round(1000 / avg));
        } else {
          requestAnimationFrame(step);
        }
      }

      requestAnimationFrame(step);
    });
  }

  estimateRefreshHz().then((hz) => {
    const safeTargetFps = Math.min(quality.adaptiveFpsCap, Math.max(52, hz * 0.88));
    adaptive.targetFrameMs = 1000 / safeTargetFps;
  }).catch(() => {
    adaptive.targetFrameMs = 1000 / (isMobile ? 60 : 90);
  });

  const maxSupportedTex = renderer.capabilities.maxTextureSize || quality.tex;
  const textureSize = Math.min(quality.tex, maxSupportedTex);

  function makeCanvasTexture(draw, size = textureSize) {
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;

    const ctx = c.getContext('2d', { alpha: true });
    if (!ctx) throw new Error('2D canvas context is unavailable');
    draw(ctx, size);

    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy?.() || 16, 16);
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.generateMipmaps = true;
    tex.needsUpdate = true;
    return tex;
  }

  function rr(ctx, x, y, w, h, r) {
    const radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    ctx.lineTo(x + radius, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  function drawTrackingText(ctx, text, x, y, tracking = 0) {
    const chars = Array.from(text);
    const total =
      chars.reduce((sum, ch) => sum + ctx.measureText(ch).width, 0) +
      tracking * Math.max(0, chars.length - 1);

    let cursor = x - total / 2;

    for (const ch of chars) {
      const w = ctx.measureText(ch).width;
      ctx.fillText(ch, cursor + w / 2, y);
      cursor += w + tracking;
    }
  }

  function noise(ctx, S, n, a, dark = false) {
    for (let i = 0; i < n; i++) {
      const alpha = Math.random() * a;
      ctx.fillStyle = dark
        ? `rgba(0,0,0,${alpha})`
        : `rgba(255,255,255,${alpha})`;

      ctx.fillRect(
        Math.random() * S,
        Math.random() * S,
        1 + Math.random() * 2.2,
        1 + Math.random() * 2.2
      );
    }
  }

  function line(ctx, pts, width, color) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.stroke();
    ctx.restore();
  }

  function via2d(ctx, x, y, r, u, type = 'gold') {
    const g = ctx.createRadialGradient(
      x - r * 0.28,
      y - r * 0.28,
      r * 0.08,
      x,
      y,
      r
    );

    if (type === 'cool') {
      g.addColorStop(0, '#eafcff');
      g.addColorStop(0.42, '#8ed9ea');
      g.addColorStop(1, '#355a68');
    } else if (type === 'pale') {
      g.addColorStop(0, '#ffffff');
      g.addColorStop(0.45, '#c7d7e0');
      g.addColorStop(1, '#607888');
    } else {
      g.addColorStop(0, '#fff3c9');
      g.addColorStop(0.43, '#c99b55');
      g.addColorStop(1, '#65401e');
    }

    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255,255,255,0.20)';
    ctx.lineWidth = 0.9 * u;
    ctx.stroke();
  }

  function block(ctx, x, y, w, h, label, fill, stroke, u, fontScale = 1) {
    ctx.save();

    rr(ctx, x, y, w, h, 8 * u);
    ctx.fillStyle = fill;
    ctx.fill();

    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1.55 * u;
    ctx.stroke();

    ctx.fillStyle = 'rgba(238,248,255,0.82)';
    ctx.font = `700 ${12.5 * u * fontScale}px "IBM Plex Sans Condensed", "Arial Narrow", Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x + w / 2, y + h / 2);

    ctx.restore();
  }

  function fineMachining(ctx, S, u, alpha = 0.035) {
    ctx.save();
    ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
    ctx.lineWidth = 0.55 * u;

    for (let i = 0; i < 72; i++) {
      const y = S * (0.08 + i * 0.012);
      ctx.beginPath();
      ctx.moveTo(S * 0.08, y);
      ctx.lineTo(S * 0.92, y + Math.sin(i * 0.7) * 1.2 * u);
      ctx.stroke();
    }

    ctx.restore();
  }

  function topLidTexture() {
    return makeCanvasTexture((ctx, S) => {
      const u = S / 1024;

      const base = ctx.createLinearGradient(0, 0, S, S);
      base.addColorStop(0, '#e0deda');
      base.addColorStop(0.45, '#c8c6c2');
      base.addColorStop(1, '#a8a6a2');
      ctx.fillStyle = base;
      ctx.fillRect(0, 0, S, S);

      const soft = ctx.createRadialGradient(
        S * 0.44,
        S * 0.35,
        S * 0.03,
        S * 0.52,
        S * 0.52,
        S * 0.72
      );
      soft.addColorStop(0, 'rgba(255,255,255,0.32)');
      soft.addColorStop(0.52, 'rgba(255,255,255,0.06)');
      soft.addColorStop(1, 'rgba(0,0,0,0.13)');
      ctx.fillStyle = soft;
      ctx.fillRect(0, 0, S, S);

      fineMachining(ctx, S, u, 0.042);
      noise(ctx, S, 4200, 0.020, false);
      noise(ctx, S, 3000, 0.016, true);

      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      ctx.lineWidth = 2.2 * u;
      ctx.strokeRect(S * 0.135, S * 0.135, S * 0.73, S * 0.73);

      ctx.strokeStyle = 'rgba(60,60,55,0.13)';
      ctx.lineWidth = 1.5 * u;
      ctx.strokeRect(S * 0.155, S * 0.155, S * 0.69, S * 0.69);

      ctx.strokeStyle = 'rgba(255,255,255,0.24)';
      ctx.lineWidth = 1.1 * u;
      ctx.strokeRect(S * 0.178, S * 0.178, S * 0.644, S * 0.644);
      ctx.restore();

      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `400 ${44 * u}px "IBM Plex Sans Condensed", "Arial Narrow", Inter, sans-serif`;
      ctx.fillStyle = 'rgba(12,14,14,0.75)';
      drawTrackingText(ctx, 'Crypto3DStackCPU', S * 0.5, S * 0.505, 2.8 * u);
      ctx.restore();
    });
  }

  function substrateTexture() {
    return makeCanvasTexture((ctx, S) => {
      const u = S / 1024;

      const g = ctx.createLinearGradient(0, 0, S, S);
      g.addColorStop(0, '#2e7018');
      g.addColorStop(0.48, '#245a12');
      g.addColorStop(1, '#163a0a');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, S, S);

      const v = ctx.createRadialGradient(
        S * 0.47,
        S * 0.38,
        S * 0.04,
        S * 0.5,
        S * 0.52,
        S * 0.74
      );
      v.addColorStop(0, 'rgba(255,255,255,0.16)');
      v.addColorStop(1, 'rgba(0,0,0,0.20)');
      ctx.fillStyle = v;
      ctx.fillRect(0, 0, S, S);

      ctx.strokeStyle = 'rgba(120,200,100,0.18)';
      ctx.lineWidth = 1.25 * u;

      for (let i = 0; i < 18; i++) {
        const x = S * (0.11 + i * 0.047);
        ctx.beginPath();
        ctx.moveTo(x, S * 0.16);
        ctx.lineTo(x, S * 0.84);
        ctx.stroke();
      }

      for (let i = 0; i < 13; i++) {
        const y = S * (0.17 + i * 0.052);
        ctx.beginPath();
        ctx.moveTo(S * 0.13, y);
        ctx.lineTo(S * 0.87, y);
        ctx.stroke();
      }

      ctx.strokeStyle = 'rgba(140,220,120,0.22)';
      ctx.lineWidth = 2 * u;
      ctx.strokeRect(S * 0.075, S * 0.095, S * 0.85, S * 0.81);

      ctx.strokeStyle = 'rgba(140,220,120,0.15)';
      ctx.lineWidth = 1.7 * u;
      ctx.strokeRect(S * 0.145, S * 0.165, S * 0.71, S * 0.67);

      const traces = [
        [[120, 260], [270, 260], [360, 355], [525, 355], [650, 235], [905, 235]],
        [[120, 780], [270, 780], [405, 630], [565, 630], [735, 820], [905, 820]],
        [[180, 155], [260, 265], [430, 510], [700, 510], [850, 650]],
        [[850, 170], [765, 335], [585, 510], [315, 510], [165, 670]],
        [[175, 420], [315, 420], [390, 470], [560, 470], [700, 415], [835, 415]]
      ];

      traces.forEach((t) => {
        const pts = t.map(([x, y]) => [x * u, y * u]);
        line(ctx, pts, 5.2 * u, 'rgba(178,113,52,0.72)');
        line(ctx, pts, 1.35 * u, 'rgba(255,230,170,0.30)');
      });

      const pads = [
        [118, 160], [208, 160], [816, 160], [906, 160],
        [118, 862], [208, 862], [816, 862], [906, 862],
        [144, 322], [144, 702], [884, 322], [884, 702],
        [282, 244], [742, 784], [505, 356], [525, 640]
      ];

      pads.forEach(([x, y]) => {
        rr(ctx, x * u - 16 * u, y * u - 8 * u, 32 * u, 16 * u, 3.5 * u);
        ctx.fillStyle = 'rgba(188,119,56,0.78)';
        ctx.fill();

        ctx.fillStyle = 'rgba(255,238,185,0.16)';
        ctx.fillRect(x * u - 6 * u, y * u - 3 * u, 12 * u, 6 * u);
      });

      ctx.fillStyle = 'rgba(160,230,140,0.18)';
      ctx.font = `700 ${11 * u}px "IBM Plex Sans Condensed", "Arial Narrow", Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('SECURE PACKAGE SUBSTRATE', S * 0.5, S * 0.872);

      noise(ctx, S, 1200, 0.012);
      noise(ctx, S, 800, 0.010, true);
    });
  }

  function dieTexture({
    layer,
    title,
    subtitle,
    colorA,
    colorB,
    accent,
    secondary,
    blocks,
    viaType = 'gold'
  }) {
    return makeCanvasTexture((ctx, S) => {
      const u = S / 1024;

      const bg = ctx.createLinearGradient(0, 0, S, S);
      bg.addColorStop(0, colorA);
      bg.addColorStop(0.52, colorB);
      bg.addColorStop(1, colorB);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, S, S);

      const v = ctx.createRadialGradient(
        S * 0.45,
        S * 0.35,
        S * 0.04,
        S * 0.52,
        S * 0.52,
        S * 0.72
      );
      v.addColorStop(0, 'rgba(255,255,255,0.13)');
      v.addColorStop(0.55, 'rgba(255,255,255,0.03)');
      v.addColorStop(1, 'rgba(0,0,0,0.22)');
      ctx.fillStyle = v;
      ctx.fillRect(0, 0, S, S);

      ctx.strokeStyle = 'rgba(235,255,255,0.11)';
      ctx.lineWidth = 1.1 * u;

      for (let i = 0; i <= 8; i++) {
        const x = S * (0.16 + i * 0.085);
        ctx.beginPath();
        ctx.moveTo(x, S * 0.20);
        ctx.lineTo(x, S * 0.76);
        ctx.stroke();
      }

      for (let i = 0; i <= 6; i++) {
        const y = S * (0.22 + i * 0.085);
        ctx.beginPath();
        ctx.moveTo(S * 0.16, y);
        ctx.lineTo(S * 0.84, y);
        ctx.stroke();
      }

      ctx.strokeStyle = 'rgba(245,255,255,0.19)';
      ctx.lineWidth = 2.1 * u;
      ctx.strokeRect(S * 0.08, S * 0.10, S * 0.84, S * 0.80);

      ctx.strokeStyle = accent;
      ctx.lineWidth = 2.0 * u;
      ctx.strokeRect(S * 0.135, S * 0.155, S * 0.73, S * 0.69);

      const routes = [
        [[170, 360], [310, 360], [410, 450], [620, 450], [765, 340]],
        [[210, 700], [365, 650], [510, 650], [660, 720], [820, 720]],
        [[180, 245], [260, 290], [350, 520], [615, 520], [835, 585]],
        [[835, 245], [745, 330], [660, 490], [420, 490], [230, 585]]
      ];

      routes.forEach((r, i) => {
        line(
          ctx,
          r.map(([x, y]) => [x * u, y * u]),
          i % 2 === 0 ? 2.1 * u : 1.55 * u,
          i % 2 === 0 ? accent : secondary
        );
      });

      blocks.forEach((b) => {
        block(
          ctx,
          b.x * S,
          b.y * S,
          b.w * S,
          b.h * S,
          b.label,
          b.fill,
          b.stroke,
          u,
          b.fontScale || 1
        );
      });

      const vias = [
        [0.18, 0.23], [0.30, 0.22], [0.42, 0.23], [0.58, 0.22], [0.70, 0.23], [0.82, 0.22],
        [0.19, 0.40], [0.32, 0.40], [0.67, 0.40], [0.80, 0.40],
        [0.20, 0.64], [0.34, 0.63], [0.65, 0.64], [0.79, 0.63],
        [0.18, 0.80], [0.30, 0.81], [0.50, 0.80], [0.70, 0.81], [0.82, 0.80]
      ];

      vias.forEach(([x, y], i) => {
        via2d(ctx, S * x, S * y, (i % 3 === 0 ? 3.2 : 2.5) * u, u, viaType);
      });

      ctx.fillStyle = 'rgba(255,255,255,0.26)';
      ctx.font = `800 ${22 * u}px "IBM Plex Sans Condensed", "Arial Narrow", Inter, sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText(layer, S * 0.12, S * 0.153);

      ctx.fillStyle = 'rgba(255,255,255,0.21)';
      ctx.font = `700 ${12.5 * u}px "IBM Plex Sans Condensed", "Arial Narrow", Inter, sans-serif`;
      ctx.fillText(title, S * 0.205, S * 0.153);

      ctx.fillStyle = 'rgba(255,255,255,0.13)';
      ctx.font = `600 ${10.2 * u}px "IBM Plex Sans Condensed", "Arial Narrow", Inter, sans-serif`;
      ctx.fillText(subtitle, S * 0.19, S * 0.845);

      noise(ctx, S, 680, 0.012);
      noise(ctx, S, 460, 0.010, true);
    });
  }

  const yieldUI = () => new Promise((resolve) => setTimeout(resolve, 0));

  const texSubstrate = substrateTexture();
  await yieldUI();

  const texLogic = dieTexture({
    layer: 'CPU',
    title: 'SECURE MIPS-LIKE LOGIC',
    subtitle: 'fetch / decrypt / decode / execute / memory / writeback',
    colorA: '#5a6e96',
    colorB: '#3d4e6e',
    accent: 'rgba(200,145,55,0.55)',
    secondary: 'rgba(165,185,205,0.30)',
    viaType: 'gold',
    blocks: [
      { x: 0.17, y: 0.28, w: 0.13, h: 0.09, label: 'F', fill: 'rgba(50,65,90,0.55)', stroke: 'rgba(200,145,55,0.55)' },
      { x: 0.34, y: 0.28, w: 0.15, h: 0.09, label: 'DEC', fill: 'rgba(45,55,85,0.52)', stroke: 'rgba(190,135,50,0.50)', fontScale: 0.84 },
      { x: 0.54, y: 0.28, w: 0.13, h: 0.09, label: 'EX', fill: 'rgba(50,65,90,0.52)', stroke: 'rgba(200,145,55,0.50)' },
      { x: 0.71, y: 0.28, w: 0.13, h: 0.09, label: 'WB', fill: 'rgba(50,65,90,0.50)', stroke: 'rgba(200,145,55,0.46)' },
      { x: 0.22, y: 0.57, w: 0.20, h: 0.10, label: 'AES', fill: 'rgba(55,45,90,0.55)', stroke: 'rgba(185,155,220,0.42)' },
      { x: 0.57, y: 0.57, w: 0.24, h: 0.10, label: 'HMAC', fill: 'rgba(40,60,85,0.50)', stroke: 'rgba(165,185,205,0.38)' }
    ]
  });

  await yieldUI();

  const texBridge = dieTexture({
    layer: 'BRG',
    title: 'TSV REDISTRIBUTION BRIDGE',
    subtitle: 'RTL bridge / redistribution / memory-readiness routing',
    colorA: '#6e7a8e',
    colorB: '#525c6e',
    accent: 'rgba(195,140,52,0.52)',
    secondary: 'rgba(160,175,190,0.28)',
    viaType: 'pale',
    blocks: [
      { x: 0.18, y: 0.30, w: 0.22, h: 0.10, label: 'BUS A', fill: 'rgba(50,60,75,0.52)', stroke: 'rgba(195,140,52,0.46)', fontScale: 0.82 },
      { x: 0.59, y: 0.30, w: 0.22, h: 0.10, label: 'BUS B', fill: 'rgba(50,60,75,0.52)', stroke: 'rgba(195,140,52,0.46)', fontScale: 0.82 },
      { x: 0.34, y: 0.58, w: 0.32, h: 0.10, label: 'READY', fill: 'rgba(45,50,70,0.50)', stroke: 'rgba(160,175,190,0.36)', fontScale: 0.82 }
    ]
  });

  await yieldUI();

  const texL0 = dieTexture({
    layer: 'L0',
    title: 'TEXT / INSTRUCTION',
    subtitle: 'encrypted .text + secure fetch/decrypt path',
    colorA: '#4060a0',
    colorB: '#2e4878',
    accent: 'rgba(200,148,58,0.55)',
    secondary: 'rgba(158,178,198,0.28)',
    viaType: 'gold',
    blocks: [
      { x: 0.20, y: 0.30, w: 0.24, h: 0.11, label: 'TEXT', fill: 'rgba(48,62,88,0.54)', stroke: 'rgba(200,148,58,0.52)' },
      { x: 0.56, y: 0.30, w: 0.24, h: 0.11, label: 'FETCH', fill: 'rgba(42,58,82,0.50)', stroke: 'rgba(185,138,52,0.46)', fontScale: 0.86 },
      { x: 0.34, y: 0.58, w: 0.32, h: 0.11, label: 'DEC MAP', fill: 'rgba(48,42,78,0.50)', stroke: 'rgba(158,178,198,0.36)', fontScale: 0.82 }
    ]
  });

  await yieldUI();
  const texL1 = dieTexture({
    layer: 'L1',
    title: 'DATA REGION',
    subtitle: 'encrypted .data + secure lw/sw path',
    colorA: '#607898',
    colorB: '#485870',
    accent: 'rgba(198,142,54,0.52)',
    secondary: 'rgba(155,172,192,0.28)',
    viaType: 'gold',
    blocks: [
      { x: 0.20, y: 0.30, w: 0.24, h: 0.11, label: 'DATA', fill: 'rgba(50,60,80,0.54)', stroke: 'rgba(198,142,54,0.50)' },
      { x: 0.56, y: 0.30, w: 0.24, h: 0.11, label: 'LW/SW', fill: 'rgba(45,58,78,0.50)', stroke: 'rgba(182,132,48,0.44)', fontScale: 0.84 },
      { x: 0.34, y: 0.58, w: 0.32, h: 0.11, label: 'RESEAL', fill: 'rgba(48,42,72,0.48)', stroke: 'rgba(155,172,192,0.34)', fontScale: 0.84 }
    ]
  });

  await yieldUI();
  const texL2 = dieTexture({
    layer: 'L2',
    title: 'KEY / METADATA',
    subtitle: 'wrapped key + key tag + image tag',
    colorA: '#62528a',
    colorB: '#4a3e6a',
    accent: 'rgba(196,140,52,0.52)',
    secondary: 'rgba(152,168,188,0.28)',
    viaType: 'gold',
    blocks: [
      { x: 0.20, y: 0.30, w: 0.24, h: 0.11, label: 'WRAP', fill: 'rgba(52,44,82,0.55)', stroke: 'rgba(196,140,52,0.52)' },
      { x: 0.56, y: 0.30, w: 0.24, h: 0.11, label: 'KEYT', fill: 'rgba(52,44,82,0.52)', stroke: 'rgba(182,130,48,0.46)' },
      { x: 0.34, y: 0.58, w: 0.32, h: 0.11, label: 'IMGT', fill: 'rgba(45,55,75,0.50)', stroke: 'rgba(152,168,188,0.34)', fontScale: 0.86 }
    ]
  });

  await yieldUI();
  const texL3 = dieTexture({
    layer: 'L3',
    title: 'TAMPER / SENTINEL',
    subtitle: 'sentinels + redundancy/security markers',
    colorA: '#7e2a2a',
    colorB: '#5e1a1a',
    accent: 'rgba(194,138,50,0.52)',
    secondary: 'rgba(150,166,184,0.28)',
    viaType: 'gold',
    blocks: [
      { x: 0.20, y: 0.30, w: 0.24, h: 0.11, label: 'SENT', fill: 'rgba(42,62,62,0.54)', stroke: 'rgba(194,138,50,0.50)' },
      { x: 0.56, y: 0.30, w: 0.24, h: 0.11, label: 'TAMP', fill: 'rgba(44,58,72,0.50)', stroke: 'rgba(178,128,46,0.44)' },
      { x: 0.34, y: 0.58, w: 0.32, h: 0.11, label: 'REDUND', fill: 'rgba(46,42,70,0.48)', stroke: 'rgba(150,166,184,0.34)', fontScale: 0.78 }
    ]
  });

  await yieldUI();

  const texLid = topLidTexture();
  await yieldUI();

  function makeLayer({
    name,
    width,
    height,
    depth,
    texture,
    topColor,
    sideColor,
    bottomColor,
    metalness = 0.05,
    roughness = 0.62,
    radius = 0.006,
    env = 0.44
  }) {
    const geo = new RoundedBoxGeometry(width, height, depth, 7, Math.min(radius, height * 0.22));

    const side = new THREE.MeshPhysicalMaterial({
      color: sideColor,
      metalness,
      roughness: Math.max(0.54, roughness),
      clearcoat: 0.0,
      reflectivity: 0.05,
      envMapIntensity: env * 0.85
    });

    const bottom = new THREE.MeshPhysicalMaterial({
      color: bottomColor,
      metalness: Math.max(0, metalness - 0.01),
      roughness: Math.min(0.92, roughness + 0.14),
      clearcoat: 0.0,
      reflectivity: 0.035,
      envMapIntensity: env * 0.65
    });

    const top = new THREE.MeshPhysicalMaterial({
      color: topColor,
      map: texture,
      metalness,
      roughness,
      clearcoat: 0.0,
      reflectivity: 0.05,
      envMapIntensity: env
    });

    const mesh = new THREE.Mesh(geo, [side, side, top, bottom, side, side]);
    mesh.name = name;
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    return mesh;
  }

  function makePart({
    name,
    baseY,
    height,
    explodeOffset = 0,
    mesh,
    driftX = 0,
    driftZ = 0,
    unfolds = false,
    isLid = false
  }) {
    const group = new THREE.Group();
    group.name = name;
    group.position.y = baseY;
    if (mesh) group.add(mesh);

    return {
      name,
      group,
      baseY,
      height,
      explodeOffset,
      driftX,
      driftZ,
      unfolds,
      isLid
    };
  }

  const chipRoot = new THREE.Group();
  chipRoot.position.y = -0.10;
  chipRoot.scale.setScalar(0.70);
  scene.add(chipRoot);

  const baseRotX = -0.17;
  const baseRotZ = 0.010;

  const substratePart = makePart({
    name: 'fixed package substrate',
    baseY: 0.000,
    height: 0.22,
    mesh: makeLayer({
      name: 'light ceramic organic package substrate',
      width: 6.25,
      height: 0.22,
      depth: 6.25,
      texture: texSubstrate,
      topColor: 0x2e7018,
      sideColor: 0x0e2a08,
      bottomColor: 0x0a1e06,
      metalness: 0.012,
      roughness: 0.80,
      radius: 0.085,
      env: 0.48
    })
  });

  const logicPart = makePart({
    name: 'fixed secure CPU logic die',
    baseY: 0.160,
    height: 0.060,
    mesh: makeLayer({
      name: 'secure CPU and cryptographic logic die',
      width: 4.78,
      height: 0.060,
      depth: 4.78,
      texture: texLogic,
      topColor: 0x5a6e96,
      sideColor: 0x3d4e6e,
      bottomColor: 0x28364e,
      metalness: 0.008,
      roughness: 0.88,
      radius: 0.007,
      env: 0.42
    })
  });

  const bridgePart = makePart({
    name: 'fixed RTL TSV memory bridge',
    baseY: 0.207,
    height: 0.042,
    mesh: makeLayer({
      name: 'silicon interposer redistribution bridge',
      width: 4.70,
      height: 0.042,
      depth: 4.70,
      texture: texBridge,
      topColor: 0x6e7a8e,
      sideColor: 0x525c6e,
      bottomColor: 0x383e4e,
      metalness: 0.008,
      roughness: 0.88,
      radius: 0.005,
      env: 0.40
    })
  });

  const l0Part = makePart({
    name: 'unfolding L0 encrypted instruction text layer',
    baseY: 0.249,
    height: 0.040,
    explodeOffset: 0.58,
    driftX: -0.010,
    driftZ: -0.018,
    unfolds: true,
    mesh: makeLayer({
      name: 'L0 encrypted instruction text memory die',
      width: 4.56,
      height: 0.040,
      depth: 4.56,
      texture: texL0,
      topColor: 0x4060a0,
      sideColor: 0x2e4878,
      bottomColor: 0x1e3058,
      metalness: 0.008,
      roughness: 0.88,
      radius: 0.004,
      env: 0.40
    })
  });

  const l1Part = makePart({
    name: 'unfolding L1 encrypted data layer',
    baseY: 0.291,
    height: 0.040,
    explodeOffset: 1.02,
    driftX: 0.015,
    driftZ: 0.012,
    unfolds: true,
    mesh: makeLayer({
      name: 'L1 encrypted data memory die',
      width: 4.48,
      height: 0.040,
      depth: 4.48,
      texture: texL1,
      topColor: 0x607898,
      sideColor: 0x485870,
      bottomColor: 0x303e52,
      metalness: 0.008,
      roughness: 0.88,
      radius: 0.004,
      env: 0.39
    })
  });

  const l2Part = makePart({
    name: 'unfolding L2 key metadata layer',
    baseY: 0.333,
    height: 0.040,
    explodeOffset: 1.46,
    driftX: -0.012,
    driftZ: 0.018,
    unfolds: true,
    mesh: makeLayer({
      name: 'L2 key and metadata memory die',
      width: 4.40,
      height: 0.040,
      depth: 4.40,
      texture: texL2,
      topColor: 0x62528a,
      sideColor: 0x4a3e6a,
      bottomColor: 0x322848,
      metalness: 0.008,
      roughness: 0.88,
      radius: 0.004,
      env: 0.38
    })
  });

  const l3Part = makePart({
    name: 'unfolding L3 tamper sentinel redundancy layer',
    baseY: 0.375,
    height: 0.040,
    explodeOffset: 1.90,
    driftX: 0.014,
    driftZ: -0.012,
    unfolds: true,
    mesh: makeLayer({
      name: 'L3 tamper sentinel memory die',
      width: 4.32,
      height: 0.040,
      depth: 4.32,
      texture: texL3,
      topColor: 0x7e2a2a,
      sideColor: 0x5e1a1a,
      bottomColor: 0x3e1010,
      metalness: 0.008,
      roughness: 0.88,
      radius: 0.004,
      env: 0.38
    })
  });

  const lidPart = makePart({
    name: 'CPU-style engraved lid',
    baseY: 0.443,
    height: 0.080,
    explodeOffset: 2.28,
    isLid: true,
    mesh: makeLayer({
      name: 'engraved integrated heat spreader lid',
      width: 4.50,
      height: 0.080,
      depth: 4.50,
      texture: texLid,
      topColor: 0xd8d6d0,
      sideColor: 0xb4b2ac,
      bottomColor: 0x989690,
      metalness: 0.72,
      roughness: 0.18,
      radius: 0.018,
      env: 0.62
    })
  });

  const parts = [
    substratePart,
    logicPart,
    bridgePart,
    l0Part,
    l1Part,
    l2Part,
    l3Part,
    lidPart
  ];

  parts.forEach((part) => chipRoot.add(part.group));

  chipRoot.rotation.x = baseRotX;
  chipRoot.rotation.y = 0.76;
  chipRoot.rotation.z = baseRotZ;

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.065;
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.enableRotate = true;
  controls.autoRotate = !prefersReducedMotion3D;
  controls.autoRotateSpeed = 0.44;
  controls.target.set(0, 0.22, 0);
  controls.minPolarAngle = 0;
  controls.maxPolarAngle = Math.PI;
  controls.update();

  let explodeTarget = 0;
  let explodeValue = 0;
  let pointerStart = null;

  function toggleExplode() {
    explodeTarget = explodeTarget > 0.5 ? 0 : 1;
    canvas.setAttribute('aria-pressed', explodeTarget > 0.5 ? 'true' : 'false');
  }

  canvas.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    toggleExplode();
  });

  canvas.addEventListener('pointerdown', (e) => {
    pointerStart = {
      x: e.clientX,
      y: e.clientY,
      time: performance.now()
    };

    canvas.style.cursor = 'grabbing';
  }, { passive: true });

  canvas.addEventListener('pointerup', (e) => {
    canvas.style.cursor = 'grab';

    if (!pointerStart) return;

    const dx = e.clientX - pointerStart.x;
    const dy = e.clientY - pointerStart.y;
    const dist = Math.hypot(dx, dy);
    const elapsed = performance.now() - pointerStart.time;

    pointerStart = null;

    if (dist < 7 && elapsed < 700) {
      toggleExplode();
    }
  }, { passive: true });

  canvas.addEventListener('pointercancel', () => {
    pointerStart = null;
    canvas.style.cursor = 'grab';
  }, { passive: true });

  function updateExplodedStack() {
    explodeValue += (explodeTarget - explodeValue) * 0.072;
    const e = THREE.MathUtils.smoothstep(explodeValue, 0, 1);

    parts.forEach((part) => {
      if (part.unfolds || part.isLid) {
        part.group.position.y = part.baseY + part.explodeOffset * e;
        part.group.position.x = part.driftX * e;
        part.group.position.z = part.driftZ * e;
      } else {
        part.group.position.y = part.baseY;
        part.group.position.x = 0;
        part.group.position.z = 0;
      }
    });

    const scale = THREE.MathUtils.lerp(0.70, 0.55, e);
    chipRoot.scale.setScalar(scale);

    chipRoot.position.y = THREE.MathUtils.lerp(-0.10, -0.58, e);

    controls.target.y = THREE.MathUtils.lerp(0.22, 0.72, e);
    controls.autoRotateSpeed = THREE.MathUtils.lerp(0.44, 0.26, e);
  }

  function applyRendererSize(force = false) {
    const r = canvas.getBoundingClientRect();
    const cssW = Math.max(64, Math.round(r.width || 160));
    const cssH = Math.max(64, Math.round(r.height || 160));

    adaptive.currentDPR = THREE.MathUtils.clamp(adaptive.currentDPR, adaptive.minDPR, adaptive.maxDPR);

    const maxEdge = Math.max(cssW, cssH);
    const maxDPRForEdge = quality.maxRenderEdge / maxEdge;
    const effectiveDPR = Math.max(
      0.5,
      Math.min(adaptive.currentDPR, maxDPRForEdge)
    );

    const expectedW = Math.max(1, Math.round(cssW * effectiveDPR));
    const expectedH = Math.max(1, Math.round(cssH * effectiveDPR));

    if (!force && canvas.width === expectedW && canvas.height === expectedH) return;

    renderer.setPixelRatio(effectiveDPR);
    renderer.setSize(cssW, cssH, false);

    camera.aspect = cssW / cssH;
    camera.updateProjectionMatrix();
  }

  function scheduleResize(force = false) {
    // If render loop is active, delegate to animate() so resize+render happen in same frame
    if (running) {
      adaptive.resizePending = true;
      if (force) adaptive.resizeForce = true;
    } else {
      applyRendererSize(force);
    }
  }

  function updateAdaptiveQuality(frameMs) {
    if (frameMs <= 0 || frameMs > 200) return;

    adaptive.samples.push(frameMs);
    if (adaptive.samples.length > adaptive.maxSamples) adaptive.samples.shift();

    adaptive.frameCounter++;
    if (adaptive.frameCounter % adaptive.maxSamples !== 0) return;
    if (adaptive.samples.length < adaptive.maxSamples * 0.75) return;

    const sorted = [...adaptive.samples].sort((a, b) => a - b);
    const p50 = sorted[Math.floor(sorted.length * 0.5)];

    const tooSlow = p50 > adaptive.targetFrameMs * 1.25;
    const veryFast = p50 < adaptive.targetFrameMs * 0.72;

    if (tooSlow && adaptive.currentDPR > adaptive.minDPR + 0.05) {
      adaptive.currentDPR = Math.max(adaptive.minDPR, adaptive.currentDPR - 0.10);
      adaptive.resizePending = true;
    } else if (veryFast && adaptive.currentDPR < adaptive.maxDPR - 0.05) {
      adaptive.currentDPR = Math.min(adaptive.maxDPR, adaptive.currentDPR + 0.06);
      adaptive.resizePending = true;
    }
  }

  applyRendererSize(true);

  if (window.ResizeObserver) {
    let roDebounce;
    new ResizeObserver(() => {
      clearTimeout(roDebounce);
      roDebounce = setTimeout(() => scheduleResize(false), 100);
    }).observe(canvas);
  }

  let winResizeDebounce;
  window.addEventListener('resize', () => {
    clearTimeout(winResizeDebounce);
    winResizeDebounce = setTimeout(() => scheduleResize(true), 100);
  }, { passive: true });

  (function watchDPR() {
    const currentDPR = Math.max(1, window.devicePixelRatio || 1);
    const mq = window.matchMedia(`(resolution: ${currentDPR}dppx)`);

    mq.addEventListener('change', function handler() {
      mq.removeEventListener('change', handler);

      const nextDeviceDPR = Math.max(1, window.devicePixelRatio || 1);
      const preferredDPR = isMobile
        ? Math.min(Math.max(nextDeviceDPR * 0.9, 1.0), 1.8)
        : Math.min(Math.max(nextDeviceDPR, 1.25), 2.5);

      adaptive.currentDPR = THREE.MathUtils.clamp(
        preferredDPR,
        adaptive.minDPR,
        adaptive.maxDPR
      );

      scheduleResize(true);
      watchDPR();
    });
  })();

  if (window.visualViewport) {
    let vpDebounce;

    window.visualViewport.addEventListener('resize', () => {
      clearTimeout(vpDebounce);
      vpDebounce = setTimeout(() => scheduleResize(true), 60);
    }, { passive: true });
  }

  const clock = new THREE.Clock();

  let running = true;
  let rafId = null;
  let lastFrameTime = performance.now();
  let firstRenderDone = false;
  let stableFrameCount = 0;

  function animate(now = performance.now()) {
    if (!running) return;

    rafId = requestAnimationFrame(animate);

    const frameMs = now - lastFrameTime;
    lastFrameTime = now;

    updateAdaptiveQuality(frameMs);

    // Resize and render in the SAME frame — browser paints only the final rendered result
    if (adaptive.resizePending) {
      const wasForce = adaptive.resizeForce;
      adaptive.resizePending = false;
      adaptive.resizeForce = false;
      applyRendererSize(wasForce);
    }

    const t = clock.getElapsedTime();

    updateExplodedStack();

    if (prefersReducedMotion3D) {
      chipRoot.rotation.x = baseRotX;
      chipRoot.rotation.z = baseRotZ;
    } else {
      chipRoot.rotation.x = baseRotX + Math.sin(t * 0.70) * 0.004;
      chipRoot.rotation.z = baseRotZ + Math.sin(t * 0.43) * 0.0023;
    }

    controls.update();
    renderer.render(scene, camera);

    if (!firstRenderDone) {
      stableFrameCount++;
      if (stableFrameCount >= 8) {
        firstRenderDone = true;
        requestAnimationFrame(() => {
          canvas.classList.add('ready');
          window.dispatchEvent(new CustomEvent('chip3d-ready'));
        });
      }
    }
  }

  function startRenderLoop() {
    if (running && rafId !== null) return;

    running = true;
    lastFrameTime = performance.now();
    clock.start();
    scheduleResize(true);
    rafId = requestAnimationFrame(animate);
  }

  function stopRenderLoop() {
    running = false;
    clock.stop();

    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopRenderLoop();
    } else {
      startRenderLoop();
    }
  });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      const visible = entries[0]?.isIntersecting;

      if (visible) {
        startRenderLoop();
      } else {
        stopRenderLoop();
      }
    }, { threshold: 0.02 }).observe(canvas);
  }

  startRenderLoop();
})();
