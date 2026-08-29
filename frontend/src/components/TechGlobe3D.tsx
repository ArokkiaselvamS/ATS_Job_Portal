import { useEffect, useRef } from "react";

export default function TechGlobe3D() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    const handleResize = () => {
      if (!canvas.parentElement) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.parentElement.clientWidth || 600;
      height = canvas.parentElement.clientHeight || 520;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0); // reset transform
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    // 3D Sphere Parameters
    const sphereRadius = Math.min(width, height) * 0.38;
    const numPoints = 320;
    const points: { phi: number; theta: number; size: number; alpha: number }[] = [];

    // Golden Spiral distribution for smooth globe coverage
    const phiInc = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < numPoints; i++) {
      const y = 1 - (i / (numPoints - 1)) * 2;
      const theta = phiInc * i;
      points.push({
        phi: Math.asin(y),
        theta: theta,
        size: Math.random() * 2 + 1.2,
        alpha: Math.random() * 0.5 + 0.4,
      });
    }

    // Global Tech Hubs
    const hubs = [
      { name: "Silicon Valley", lat: 37.77, lon: -122.41 },
      { name: "London", lat: 51.50, lon: -0.12 },
      { name: "Tokyo", lat: 35.67, lon: 139.65 },
      { name: "Singapore", lat: 1.35, lon: 103.81 },
      { name: "Berlin", lat: 52.52, lon: 13.40 },
      { name: "Bangalore", lat: 12.97, lon: 77.59 },
      { name: "New York", lat: 40.71, lon: -74.00 },
      { name: "Sydney", lat: -33.86, lon: 151.20 },
    ];

    const hubPoints = hubs.map((h) => {
      const latRad = (h.lat * Math.PI) / 180;
      const lonRad = (h.lon * Math.PI) / 180;
      return {
        name: h.name,
        phi: latRad,
        theta: lonRad,
        pulse: Math.random() * Math.PI,
      };
    });

    const connections = [
      [0, 1], // Silicon Valley -> London
      [1, 4], // London -> Berlin
      [1, 5], // London -> Bangalore
      [0, 2], // Silicon Valley -> Tokyo
      [2, 3], // Tokyo -> Singapore
      [3, 5], // Singapore -> Bangalore
      [0, 6], // Silicon Valley -> New York
      [6, 1], // New York -> London
      [3, 7], // Singapore -> Sydney
    ];

    let rotationY = 0;
    let rotationX = 0.22;
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0.22;
    let targetRotationY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      mouseX = x * 0.4;
      mouseY = -y * 0.4;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Orbit Rings
    const rings = [
      { tiltX: 0.45, tiltZ: -0.3, radiusMult: 1.3, speed: 0.015, angle: 0, color: "0, 120, 212" },
      { tiltX: -0.35, tiltZ: 0.5, radiusMult: 1.45, speed: -0.012, angle: Math.PI / 3, color: "99, 102, 241" },
      { tiltX: 0.6, tiltZ: 0.2, radiusMult: 1.2, speed: 0.02, angle: Math.PI, color: "14, 165, 233" },
    ];

    let time = 0;

    const render = () => {
      time += 0.016;
      rotationY += 0.0035;

      targetRotationX = 0.22 + mouseY * 0.3;
      targetRotationY = rotationY + mouseX * 0.4;
      rotationX += (targetRotationX - rotationX) * 0.05;

      ctx.clearRect(0, 0, width, height);

      const cx = width * 0.5;
      const cy = height * 0.5;

      // Ambient radial background glow
      const glowGrad = ctx.createRadialGradient(cx, cy, sphereRadius * 0.2, cx, cy, sphereRadius * 1.5);
      glowGrad.addColorStop(0, "rgba(0, 120, 212, 0.09)");
      glowGrad.addColorStop(0.5, "rgba(99, 102, 241, 0.04)");
      glowGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, sphereRadius * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Project 3D coordinate to 2D screen
      const project = (phi: number, theta: number, radius = sphereRadius) => {
        const x0 = radius * Math.cos(phi) * Math.sin(theta + targetRotationY);
        const y0 = radius * Math.sin(phi);
        const z0 = radius * Math.cos(phi) * Math.cos(theta + targetRotationY);

        const cosX = Math.cos(rotationX);
        const sinX = Math.sin(rotationX);
        const y1 = y0 * cosX - z0 * sinX;
        const z1 = y0 * sinX + z0 * cosX;

        const fov = 600;
        const scale = fov / (fov + z1);
        return {
          x: cx + x0 * scale,
          y: cy - y1 * scale,
          z: z1,
          scale,
          visible: z1 > -sphereRadius * 0.85,
        };
      };

      // Draw Orbiting Rings with Particle Heads
      rings.forEach((ring) => {
        ring.angle += ring.speed;
        const ringRadius = sphereRadius * ring.radiusMult;
        ctx.beginPath();
        const steps = 72;
        for (let i = 0; i <= steps; i++) {
          const a = (i / steps) * Math.PI * 2;
          const rx = ringRadius * Math.cos(a);
          const ry = 0;
          const rz = ringRadius * Math.sin(a);

          const cosTX = Math.cos(ring.tiltX);
          const sinTX = Math.sin(ring.tiltX);
          const cosTZ = Math.cos(ring.tiltZ);
          const sinTZ = Math.sin(ring.tiltZ);

          const x1 = rx * cosTZ - ry * sinTZ;
          const y1 = rx * sinTZ + ry * cosTZ;
          const z1 = rz;

          const y2 = y1 * cosTX - z1 * sinTX;
          const z2 = y1 * sinTX + z1 * cosTX;

          const fov = 600;
          const scale = fov / (fov + z2);
          const sx = cx + x1 * scale;
          const sy = cy - y2 * scale;

          if (i === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        }
        ctx.strokeStyle = `rgba(${ring.color}, 0.25)`;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Particle on ring
        const headAngle = ring.angle;
        const px = ringRadius * Math.cos(headAngle);
        const py = 0;
        const pz = ringRadius * Math.sin(headAngle);

        const cosTX = Math.cos(ring.tiltX);
        const sinTX = Math.sin(ring.tiltX);
        const cosTZ = Math.cos(ring.tiltZ);
        const sinTZ = Math.sin(ring.tiltZ);

        const x1 = px * cosTZ - py * sinTZ;
        const y1 = px * sinTZ + py * cosTZ;
        const z1 = pz;

        const y2 = y1 * cosTX - z1 * sinTX;
        const z2 = y1 * sinTX + z1 * cosTX;

        const fov = 600;
        const scale = fov / (fov + z2);
        const sx = cx + x1 * scale;
        const sy = cy - y2 * scale;

        const pGlow = ctx.createRadialGradient(sx, sy, 0, sx, sy, 7 * scale);
        pGlow.addColorStop(0, `rgba(${ring.color}, 0.95)`);
        pGlow.addColorStop(0.5, `rgba(${ring.color}, 0.4)`);
        pGlow.addColorStop(1, `rgba(${ring.color}, 0)`);
        ctx.fillStyle = pGlow;
        ctx.beginPath();
        ctx.arc(sx, sy, 7 * scale, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(sx, sy, 1.8 * scale, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw Grid Latitude / Longitude lines
      for (let lat = -60; lat <= 60; lat += 30) {
        const phi = (lat * Math.PI) / 180;
        ctx.beginPath();
        let started = false;
        for (let lon = 0; lon <= 360; lon += 6) {
          const theta = (lon * Math.PI) / 180;
          const p = project(phi, theta);
          if (p.z > -sphereRadius * 0.2) {
            if (!started) {
              ctx.moveTo(p.x, p.y);
              started = true;
            } else {
              ctx.lineTo(p.x, p.y);
            }
          } else {
            started = false;
          }
        }
        ctx.strokeStyle = "rgba(0, 103, 184, 0.08)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Draw Connection Arcs between hubs
      connections.forEach(([i1, i2]) => {
        const h1 = hubPoints[i1];
        const h2 = hubPoints[i2];
        const p1 = project(h1.phi, h1.theta);
        const p2 = project(h2.phi, h2.theta);

        if (p1.visible && p2.visible) {
          const midPhi = (h1.phi + h2.phi) / 2;
          const midTheta = (h1.theta + h2.theta) / 2;
          const arcElev = sphereRadius * 1.15;
          const pMid = project(midPhi, midTheta, arcElev);

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.quadraticCurveTo(pMid.x, pMid.y, p2.x, p2.y);
          const alpha = Math.max(0.1, (p1.z + p2.z) / (sphereRadius * 2) + 0.4);
          ctx.strokeStyle = `rgba(0, 120, 212, ${alpha * 0.4})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();

          // Traveling pulse along connection arc
          const arcTime = (time * 0.8 + i1 * 0.3) % 1;
          const t = arcTime;
          const px = (1 - t) * (1 - t) * p1.x + 2 * (1 - t) * t * pMid.x + t * t * p2.x;
          const py = (1 - t) * (1 - t) * p1.y + 2 * (1 - t) * t * pMid.y + t * t * p2.y;

          ctx.fillStyle = "rgba(0, 164, 239, 0.9)";
          ctx.beginPath();
          ctx.arc(px, py, 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Draw Sphere Point Matrix
      points.forEach((pt) => {
        const p = project(pt.phi, pt.theta);
        if (p.visible) {
          const depthNorm = (p.z + sphereRadius) / (sphereRadius * 2);
          const alpha = Math.max(0.08, depthNorm * pt.alpha * 0.75);
          const radius = Math.max(0.8, pt.size * p.scale * (0.5 + depthNorm * 0.7));

          ctx.fillStyle = `rgba(0, 103, 184, ${alpha})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Draw Global Tech Hub Nodes with Pulsing Rings
      hubPoints.forEach((hub) => {
        const p = project(hub.phi, hub.theta);
        if (p.visible && p.z > -sphereRadius * 0.2) {
          hub.pulse += 0.04;
          const pulseSize = (Math.sin(hub.pulse) * 0.5 + 0.5) * 10 * p.scale;
          const pulseAlpha = Math.max(0, 1 - (Math.sin(hub.pulse) * 0.5 + 0.5));

          ctx.strokeStyle = `rgba(0, 120, 212, ${pulseAlpha * 0.6})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 4 + pulseSize, 0, Math.PI * 2);
          ctx.stroke();

          const nodeGlow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 6 * p.scale);
          nodeGlow.addColorStop(0, "#0078d4");
          nodeGlow.addColorStop(0.7, "#6366f1");
          nodeGlow.addColorStop(1, "rgba(99, 102, 241, 0)");
          ctx.fillStyle = nodeGlow;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 6 * p.scale, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2 * p.scale, 0, Math.PI * 2);
          ctx.fill();

          if (p.z > sphereRadius * 0.3) {
            ctx.font = `600 ${Math.round(10 * p.scale)}px "Inter", -apple-system, sans-serif`;
            ctx.fillStyle = "rgba(15, 23, 42, 0.75)";
            ctx.fillText(hub.name, p.x + 8 * p.scale, p.y + 3 * p.scale);
          }
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="relative w-full h-full min-h-[420px] lg:min-h-[500px] flex items-center justify-center pointer-events-none select-none">
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
