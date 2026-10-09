import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RotateCcw, ChevronLeft, ChevronRight, Move } from "lucide-react";

export default function ThreeScene({ active, round }) {
  const host = useRef(null),
    api = useRef(null),
    settings = useRef({ active, round });
  const [status, setStatus] = useState("loading");
  useEffect(() => {
    settings.current = { active, round };
    api.current?.refresh();
  }, [active, round]);
  useEffect(() => {
    const element = host.current;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "low-power",
      });
    } catch {
      setStatus("fallback");
      return;
    }
    let disposed = false,
      visible = false,
      frameId = 0,
      previousTime = 0,
      elapsed = 0;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    const canvas = renderer.domElement;
    canvas.tabIndex = 0;
    canvas.setAttribute("role", "img");
    canvas.setAttribute(
      "aria-label",
      "Interactive 3D sculpture. Drag or use the arrow keys to rotate.",
    );
    element.appendChild(canvas);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 50);
    const home = new THREE.Vector3(0, 0.55, 8.5);
    camera.position.copy(home);
    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const environment = pmrem.fromScene(room, 0.04);
    scene.environment = environment.texture;
    room.dispose();
    pmrem.dispose();
    scene.add(new THREE.HemisphereLight(0xe9dcff, 0x352a5f, 2));
    const key = new THREE.DirectionalLight(0xffffff, 4);
    key.position.set(3, 6, 5);
    key.castShadow = true;
    key.shadow.mapSize.set(512, 512);
    key.shadow.camera.left = -5;
    key.shadow.camera.right = 5;
    key.shadow.camera.top = 5;
    key.shadow.camera.bottom = -5;
    key.shadow.bias = -0.001;
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xa7baff, 3);
    rim.position.set(-4, 1, -3);
    scene.add(rim);
    const group = new THREE.Group();
    scene.add(group);
    const materials = [
      new THREE.MeshPhysicalMaterial({
        color: 0x9a78ff,
        metalness: 0.5,
        roughness: 0.16,
        clearcoat: 1,
        clearcoatRoughness: 0.12,
      }),
      new THREE.MeshPhysicalMaterial({
        color: 0xff8b4d,
        metalness: 0.18,
        roughness: 0.2,
        clearcoat: 1,
      }),
      new THREE.MeshPhysicalMaterial({
        color: 0xd4ff69,
        metalness: 0.25,
        roughness: 0.2,
        clearcoat: 1,
      }),
      new THREE.MeshPhysicalMaterial({
        color: 0xf6a9cf,
        metalness: 0.4,
        roughness: 0.17,
        clearcoat: 1,
      }),
    ];
    const geometries = [
      new THREE.TorusKnotGeometry(1, 0.29, 144, 24, 2, 3),
      new THREE.TorusGeometry(0.57, 0.19, 24, 72),
      new THREE.SphereGeometry(0.48, 40, 28),
      new THREE.IcosahedronGeometry(0.48, 0),
    ];
    const meshes = geometries.map((geometry, i) => {
      const mesh = new THREE.Mesh(geometry, materials[i]);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);
      return mesh;
    });
    meshes[0].rotation.set(0.3, -0.3, -0.25);
    const orbitGeometry = new THREE.TorusGeometry(2.35, 0.012, 6, 120);
    const orbitMaterial = new THREE.MeshBasicMaterial({
      color: 0xb393fb,
      transparent: true,
      opacity: 0.4,
    });
    const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
    orbit.rotation.set(0.6, 0.4, 0.2);
    scene.add(orbit);
    const floorGeometry = new THREE.PlaneGeometry(15, 15);
    const floorMaterial = new THREE.ShadowMaterial({ opacity: 0.18 });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -2;
    floor.receiveShadow = true;
    scene.add(floor);
    const controls = new OrbitControls(camera, canvas);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.075;
    controls.minPolarAngle = 0.4;
    controls.maxPolarAngle = 2.6;
    controls.target.set(0, 0, 0);
    controls.update();
    canvas.style.touchAction = "pan-y";
    let baseRotation = 0;
    const arrangements = [
      [
        [0, 0, 0],
        [-1.7, 1, 0.3],
        [1.6, -0.85, 0.6],
        [1.6, 1.25, -0.3],
      ],
      [
        [0, 0.15, 0],
        [1.6, 0.8, 0.5],
        [-1.6, -0.8, 0.4],
        [-1.6, 1.25, -0.4],
      ],
      [
        [0, -0.1, 0],
        [-1.7, -0.6, 0.5],
        [1.4, 1.3, 0.1],
        [1.8, -1, -0.2],
      ],
    ];
    function schedule() {
      if (!disposed && visible && !document.hidden && !frameId)
        frameId = requestAnimationFrame(render);
    }
    function render(time) {
      frameId = 0;
      if (disposed || !visible || document.hidden) return;
      const delta = previousTime
        ? Math.min((time - previousTime) / 1000, 0.05)
        : 0.016;
      previousTime = time;
      const { active: motion, round: variation } = settings.current;
      if (motion) elapsed += delta;
      controls.enableDamping = motion;
      const parent = element.closest(".playground");
      const bounds = parent.getBoundingClientRect();
      const progress = motion
        ? THREE.MathUtils.clamp(
            (window.innerHeight - bounds.top) /
              (window.innerHeight + bounds.height),
            0,
            1,
          )
        : 0.5;
      const blend = motion ? 1 - Math.exp(-delta * 7) : 1;
      const arrangement = arrangements[variation % 3];
      meshes.forEach((mesh, i) => {
        const [x, y, z] = arrangement[i];
        mesh.position.lerp(
          new THREE.Vector3(
            x,
            y + (motion ? Math.sin(elapsed * 0.85 + i) * 0.1 : 0),
            z,
          ),
          blend,
        );
        if (motion) {
          mesh.rotation.y += delta * (i === 0 ? 0.12 : 0.22);
          if (i) mesh.rotation.z += delta * 0.12;
        }
      });
      group.rotation.y = baseRotation + (progress - 0.5) * 1.3;
      group.rotation.z = (progress - 0.5) * 0.22;
      const scale = 0.87 + progress * 0.22;
      group.scale.setScalar(scale);
      orbit.rotation.z = elapsed * 0.045;
      controls.update();
      renderer.render(scene, camera);
      canvas.dataset.pose = String(variation);
      canvas.dataset.rendered = "true";
      if (motion) schedule();
    }
    function rotate(horizontal, vertical = 0) {
      const spherical = new THREE.Spherical().setFromVector3(
        camera.position.clone().sub(controls.target),
      );
      spherical.theta += horizontal;
      spherical.phi = THREE.MathUtils.clamp(spherical.phi + vertical, 0.4, 2.6);
      camera.position.copy(
        new THREE.Vector3().setFromSpherical(spherical).add(controls.target),
      );
      camera.lookAt(controls.target);
      controls.update();
      schedule();
      canvas.dataset.rotation = String(
        Number(canvas.dataset.rotation || 0) + horizontal + vertical,
      );
    }
    function keydown(event) {
      const directions = {
        ArrowLeft: [-0.2, 0],
        ArrowRight: [0.2, 0],
        ArrowUp: [0, -0.16],
        ArrowDown: [0, 0.16],
      };
      if (directions[event.key]) {
        event.preventDefault();
        rotate(...directions[event.key]);
      }
    }
    function resize() {
      const { width, height } = element.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.fov = width < 340 ? 46 : 38;
      camera.updateProjectionMatrix();
      schedule();
    }
    function lost(event) {
      event.preventDefault();
      cancelAnimationFrame(frameId);
      setStatus("fallback");
    }
    canvas.addEventListener("keydown", keydown);
    canvas.addEventListener("webglcontextlost", lost);
    controls.addEventListener("change", schedule);
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) {
          previousTime = 0;
          schedule();
        } else {
          cancelAnimationFrame(frameId);
          frameId = 0;
        }
      },
      { rootMargin: "80px" },
    );
    observer.observe(element);
    const sizeObserver = new ResizeObserver(resize);
    sizeObserver.observe(element);
    const visibility = () => {
      if (!document.hidden) {
        previousTime = 0;
        schedule();
      }
    };
    document.addEventListener("visibilitychange", visibility);
    api.current = {
      refresh: schedule,
      rotate,
      reset: () => {
        camera.position.copy(home);
        controls.target.set(0, 0, 0);
        controls.update();
        canvas.dataset.rotation = "0";
        schedule();
      },
    };
    resize();
    setStatus("ready");
    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      api.current = null;
      observer.disconnect();
      sizeObserver.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      canvas.removeEventListener("keydown", keydown);
      canvas.removeEventListener("webglcontextlost", lost);
      controls.removeEventListener("change", schedule);
      controls.dispose();
      [...geometries, orbitGeometry, floorGeometry].forEach((g) => g.dispose());
      [...materials, orbitMaterial, floorMaterial].forEach((m) => m.dispose());
      environment.dispose();
      renderer.dispose();
      canvas.remove();
    };
  }, []);
  return (
    <div className="three-experience" data-scene-status={status}>
      <div className="three-ambient" aria-hidden="true" />
      <div ref={host} className="three-canvas" />
      {status !== "ready" && (
        <div className="three-fallback" aria-hidden="true">
          <div className="fallback-ring" />
          <div className="fallback-sphere" />
          <div className="fallback-cube" />
        </div>
      )}
      <div className="three-caption">
        <span className="scene-indicator" />
        {status === "ready"
          ? "REAL-TIME 3D · MADE TO EXPLORE"
          : status === "loading"
            ? "SCULPTING SOMETHING GOOD…"
            : "A LITTLE EXTRA DIMENSION"}
      </div>
      {status === "ready" && (
        <div className="three-controls">
          <span>
            <Move size={13} />
            Drag to explore
          </span>
          <div>
            <button
              className="icon-button"
              aria-label="Rotate sculpture left"
              onClick={() => api.current?.rotate(-0.25)}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              className="icon-button"
              aria-label="Reset sculpture view"
              onClick={() => api.current?.reset()}
            >
              <RotateCcw size={15} />
            </button>
            <button
              className="icon-button"
              aria-label="Rotate sculpture right"
              onClick={() => api.current?.rotate(0.25)}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
