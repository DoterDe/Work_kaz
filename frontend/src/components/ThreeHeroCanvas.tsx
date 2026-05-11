import React, { useEffect, useRef, useState } from "react";

interface ThreeHeroCanvasProps {
  className?: string;
}

export function ThreeHeroCanvas({ className = "" }: ThreeHeroCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!shouldLoad) return;
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let disposed = false;
    let frameId = 0;
    let isBlockVisible = true;
    let isDocumentVisible = !document.hidden;

    let renderer: import("three").WebGLRenderer | null = null;
    let scene: import("three").Scene | null = null;
    let camera: import("three").PerspectiveCamera | null = null;
    let cleanup: (() => void) | null = null;

    const bootstrap = async () => {
      const THREE = await import("three");
      if (disposed) return;

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
      camera.position.set(0, 0.2, 5.6);

      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;

      const ambient = new THREE.AmbientLight(0xffffff, 0.7);
      const key = new THREE.DirectionalLight(0x9cd0ff, 1.2);
      key.position.set(4.5, 4, 3);
      const fill = new THREE.DirectionalLight(0x63efc4, 0.75);
      fill.position.set(-4, -2, 2);
      scene.add(ambient, key, fill);

      const group = new THREE.Group();
      scene.add(group);

      const coreGeometry = new THREE.IcosahedronGeometry(1.0, 1);
      const coreMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x2f8fff,
        metalness: 0.45,
        roughness: 0.26,
        transmission: 0.22,
        thickness: 0.6,
        emissive: 0x0b2a4a,
        emissiveIntensity: 0.3,
      });
      const core = new THREE.Mesh(coreGeometry, coreMaterial);
      group.add(core);

      const ringGeometry = new THREE.TorusGeometry(1.7, 0.05, 40, 180);
      const ringMaterial = new THREE.MeshStandardMaterial({
        color: 0x5fd6a6,
        metalness: 0.62,
        roughness: 0.2,
        transparent: true,
        opacity: 0.9,
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.rotation.x = Math.PI * 0.38;
      ring.rotation.z = Math.PI * 0.24;
      group.add(ring);

      const knotGeometry = new THREE.TorusKnotGeometry(1.25, 0.18, 160, 26, 2, 3);
      const knotMaterial = new THREE.MeshStandardMaterial({
        color: 0xffd34e,
        metalness: 0.82,
        roughness: 0.24,
      });
      const knot = new THREE.Mesh(knotGeometry, knotMaterial);
      knot.rotation.x = Math.PI * 0.34;
      knot.rotation.y = Math.PI * 0.14;
      group.add(knot);

      const pointsCount = 320;
      const pointsPosition = new Float32Array(pointsCount * 3);
      for (let i = 0; i < pointsCount; i += 1) {
        const radius = 3 + Math.random() * 2.2;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);

        pointsPosition[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        pointsPosition[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        pointsPosition[i * 3 + 2] = radius * Math.cos(phi);
      }

      const particlesGeometry = new THREE.BufferGeometry();
      particlesGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(pointsPosition, 3)
      );

      const particlesMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.032,
        transparent: true,
        opacity: 0.7,
        sizeAttenuation: true,
      });
      const particles = new THREE.Points(particlesGeometry, particlesMaterial);
      scene.add(particles);

      const clock = new THREE.Clock();

      const resize = () => {
        if (!renderer || !camera) return;
        const width = container.clientWidth;
        const height = container.clientHeight;
        if (width <= 0 || height <= 0) return;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height, false);
      };
      resize();
      window.addEventListener("resize", resize);

      const visibilityHandler = () => {
        isDocumentVisible = !document.hidden;
      };
      document.addEventListener("visibilitychange", visibilityHandler);

      const intersectionObserver = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (entry) {
            isBlockVisible = entry.isIntersecting;
          }
        },
        { threshold: 0.12 }
      );
      intersectionObserver.observe(container);

      setIsReady(true);
      setHasError(false);

      const animate = () => {
        if (disposed) return;
        frameId = window.requestAnimationFrame(animate);
        if (!renderer || !scene || !camera || !isBlockVisible || !isDocumentVisible) return;

        const t = clock.getElapsedTime();
        group.rotation.y = t * 0.24;
        group.rotation.x = Math.sin(t * 0.38) * 0.16;
        core.rotation.x += 0.003;
        core.rotation.y += 0.005;
        ring.rotation.z += 0.0045;
        knot.rotation.x += 0.0035;
        particles.rotation.y = t * 0.03;
        particles.rotation.x = Math.sin(t * 0.23) * 0.1;
        renderer.render(scene, camera);
      };
      animate();

      cleanup = () => {
        window.removeEventListener("resize", resize);
        document.removeEventListener("visibilitychange", visibilityHandler);
        intersectionObserver.disconnect();
        if (frameId !== 0) {
          window.cancelAnimationFrame(frameId);
        }

        coreGeometry.dispose();
        ringGeometry.dispose();
        knotGeometry.dispose();
        particlesGeometry.dispose();
        coreMaterial.dispose();
        ringMaterial.dispose();
        knotMaterial.dispose();
        particlesMaterial.dispose();

        if (renderer) {
          renderer.dispose();
        }

        scene = null;
        camera = null;
        renderer = null;
      };
    };

    void bootstrap().catch(() => {
      if (disposed) return;
      setHasError(true);
      setIsReady(false);
    });

    return () => {
      disposed = true;
      if (frameId !== 0) {
        window.cancelAnimationFrame(frameId);
      }
      if (cleanup) {
        cleanup();
      }
    };
  }, [shouldLoad]);

  return (
    <div ref={containerRef} className={`three-hero-root ${className}`}>
      <canvas ref={canvasRef} className="three-hero-canvas" />
      {!isReady && !hasError && (
        <div className="three-hero-fallback">Loading 3D scene...</div>
      )}
      {hasError && <div className="three-hero-fallback">3D scene unavailable</div>}
    </div>
  );
}
