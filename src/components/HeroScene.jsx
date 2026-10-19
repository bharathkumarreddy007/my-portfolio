import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

/* ------------------------------------------------------------------ *
 * A single, self-contained WebGL centrepiece: an iridescent blob that
 * breathes, wrapped in a wireframe cage and a slow field of dust.
 * Written as raw ShaderMaterial so nothing is loaded over the network.
 * ------------------------------------------------------------------ */

const vertexShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uAmp;
  uniform float uFreq;

  varying vec3 vNormal;
  varying vec3 vView;
  varying float vFlow;

  float flow(vec3 p) {
    float t = uTime * 0.5;
    return sin(p.x * 1.6 + t) * 0.55
         + sin(p.y * 2.05 - t * 1.15) * 0.42
         + sin(p.z * 1.35 + t * 0.75) * 0.50
         + sin((p.x + p.y + p.z) * 0.85 - t * 0.55) * 0.30;
  }

  vec3 warp(vec3 p) {
    return p + normalize(p) * flow(p * uFreq) * uAmp;
  }

  void main() {
    vec3 p = position;
    vec3 center = warp(p);

    // Rebuild the normal from two neighbouring samples so the lighting
    // follows the displacement instead of the original sphere.
    float eps = 0.09;
    vec3 tangentA = warp(p + vec3(eps, 0.0, 0.0));
    vec3 tangentB = warp(p + vec3(0.0, eps, 0.0));
    vec3 n = normalize(cross(tangentA - center, tangentB - center));
    n *= sign(dot(n, normalize(p)));

    vNormal = normalize(normalMatrix * n);
    vFlow = flow(p * uFreq);

    vec4 mv = modelViewMatrix * vec4(center, 1.0);
    vView = -mv.xyz;
    gl_Position = projectionMatrix * mv;
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;

  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;

  varying vec3 vNormal;
  varying vec3 vView;
  varying float vFlow;

  void main() {
    vec3 n = normalize(vNormal);
    vec3 v = normalize(vView);

    float fresnel = pow(1.0 - clamp(abs(dot(n, v)), 0.0, 1.0), 1.8);
    float band = clamp(vFlow * 0.5 + 0.5, 0.0, 1.0);

    vec3 base = mix(uColorA, uColorB, smoothstep(0.1, 0.9, band));
    vec3 color = mix(base, uColorC, pow(fresnel, 0.9));
    // warm rim — the iridescent edge that makes it read as glass
    color = mix(color, vec3(0.98, 0.45, 0.72), pow(fresnel, 3.2) * 0.75);
    color += pow(fresnel, 1.3) * 0.55;
    color *= 0.66 + 0.58 * band;

    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`;

export default function HeroScene({ active = true }) {
  const host = useRef(null);
  const [status, setStatus] = useState("loading");
  const motionRef = useRef(active);
  const apiRef = useRef(null);

  useEffect(() => {
    motionRef.current = active;
    apiRef.current?.wake();
  }, [active]);

  useEffect(() => {
    const element = host.current;
    if (!element) return;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: (window.devicePixelRatio || 1) < 2,
        powerPreference: "high-performance",
      });
    } catch {
      setStatus("fallback");
      return;
    }
    if (!renderer.getContext()) {
      setStatus("fallback");
      return;
    }

    const narrow = window.innerWidth < 760;
    const dispose = [];
    let disposed = false;
    let visible = false;
    let frame = 0;
    let previous = 0;
    let elapsed = 0;
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, narrow ? 1.4 : 1.75),
    );
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const canvas = renderer.domElement;
    canvas.setAttribute("aria-hidden", "true");
    element.appendChild(canvas);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 60);
    camera.position.set(0, 0, 5.4);

    const uniforms = {
      uTime: { value: 0 },
      uAmp: { value: 0.3 },
      uFreq: { value: 1.35 },
      uColorA: { value: new THREE.Color().setStyle("#2e1065") },
      uColorB: { value: new THREE.Color().setStyle("#7c3aed") },
      uColorC: { value: new THREE.Color().setStyle("#22d3ee") },
    };

    const group = new THREE.Group();
    scene.add(group);

    // --- the blob -------------------------------------------------
    const blobGeometry = new THREE.IcosahedronGeometry(1.18, narrow ? 10 : 20);
    const blobMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
    });
    const blob = new THREE.Mesh(blobGeometry, blobMaterial);
    group.add(blob);
    dispose.push(
      () => blobGeometry.dispose(),
      () => blobMaterial.dispose(),
    );

    // --- geodesic cage -------------------------------------------
    const cageGeometry = new THREE.IcosahedronGeometry(1.85, 1);
    const cageMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color().setStyle("#8b7bff"),
      wireframe: true,
      transparent: true,
      opacity: 0.16,
    });
    const cage = new THREE.Mesh(cageGeometry, cageMaterial);
    cage.rotation.set(0.6, 0.2, 0.1);
    group.add(cage);
    dispose.push(
      () => cageGeometry.dispose(),
      () => cageMaterial.dispose(),
    );

    // --- halo rings ----------------------------------------------
    const ringGeometry = new THREE.TorusGeometry(2.55, 0.006, 3, 190);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color().setStyle("#67e8f9"),
      transparent: true,
      opacity: 0.3,
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.set(1.15, 0.4, 0);
    group.add(ring);
    dispose.push(
      () => ringGeometry.dispose(),
      () => ringMaterial.dispose(),
    );

    // --- dust field ----------------------------------------------
    const count = narrow ? 500 : 1300;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      const radius = 4 + Math.random() * 9;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.cos(phi) * 0.6;
      positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }
    const dustGeometry = new THREE.BufferGeometry();
    dustGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3),
    );
    const dustMaterial = new THREE.PointsMaterial({
      color: new THREE.Color().setStyle("#c4b5fd"),
      size: 0.035,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.75,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const dust = new THREE.Points(dustGeometry, dustMaterial);
    scene.add(dust);
    dispose.push(
      () => dustGeometry.dispose(),
      () => dustMaterial.dispose(),
    );

    /* ------------------------- loop ---------------------------- */

    function renderFrame(time) {
      frame = 0;
      if (disposed || !visible || document.hidden) return;

      const delta = previous ? Math.min((time - previous) / 1000, 0.05) : 0.016;
      previous = time;

      if (motionRef.current) elapsed += delta;
      uniforms.uTime.value = elapsed;

      pointer.x += (pointer.tx - pointer.x) * (1 - Math.exp(-delta * 4));
      pointer.y += (pointer.ty - pointer.y) * (1 - Math.exp(-delta * 4));

      const scroll = window.scrollY / Math.max(window.innerHeight, 1);

      // On wide screens the sculpture moves out of the headline's way.
      const width = element.clientWidth || window.innerWidth;
      const targetX = width < 900 ? 0 : Math.min(1.25, width * 0.0016);
      group.position.x +=
        (targetX - group.position.x) * (1 - Math.exp(-delta * 3));
      const anchor = group.position.x * 0.42;

      group.rotation.y = elapsed * 0.09 + pointer.x * 0.25 + scroll * 0.9;
      group.rotation.x = pointer.y * -0.18 + scroll * 0.25;
      group.scale.setScalar(1 + Math.sin(elapsed * 0.5) * 0.015);

      cage.rotation.y = -elapsed * 0.06;
      cage.rotation.z = elapsed * 0.03;
      ring.rotation.z = elapsed * 0.14;
      dust.rotation.y = elapsed * 0.02;
      dust.rotation.x = pointer.y * 0.05;

      camera.position.x = pointer.x * 0.5 + anchor;
      camera.position.y = pointer.y * -0.4 + scroll * 0.3;
      camera.position.z = 5.6 + scroll * 1.6;
      camera.lookAt(anchor, 0, 0);

      renderer.render(scene, camera);
      canvas.dataset.rendered = "true";

      if (motionRef.current) frame = requestAnimationFrame(renderFrame);
    }

    function wake() {
      if (disposed || !visible || document.hidden || frame) return;
      previous = 0;
      frame = requestAnimationFrame(renderFrame);
    }

    function resize() {
      const { width, height } = element.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.fov = width < 560 ? 58 : width < 900 ? 50 : 46;
      camera.updateProjectionMatrix();
      wake();
    }

    function onPointerMove(event) {
      pointer.tx = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.ty = (event.clientY / window.innerHeight) * 2 - 1;
      wake();
    }

    function onLost(event) {
      event.preventDefault();
      cancelAnimationFrame(frame);
      frame = 0;
      setStatus("fallback");
    }

    function onVisibility() {
      if (!document.hidden) wake();
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) wake();
        else {
          cancelAnimationFrame(frame);
          frame = 0;
        }
      },
      { rootMargin: "120px" },
    );
    observer.observe(element);

    const sizeObserver = new ResizeObserver(resize);
    sizeObserver.observe(element);

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    canvas.addEventListener("webglcontextlost", onLost);

    apiRef.current = { wake };
    resize();
    setStatus("ready");

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      apiRef.current = null;
      observer.disconnect();
      sizeObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("webglcontextlost", onLost);
      dispose.forEach((fn) => fn());
      renderer.dispose();
      canvas.remove();
    };
  }, []);

  return (
    <div className="hero-scene" data-scene={status} aria-hidden="true">
      <div ref={host} className="hero-scene-canvas" />
      {status !== "ready" && <div className="hero-scene-fallback" />}
    </div>
  );
}
