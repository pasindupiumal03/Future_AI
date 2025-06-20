import React, { useRef, useEffect } from "react";

const colors = [
  "rgba(120, 0, 255, 0.12)",
  "rgba(0, 200, 255, 0.10)",
  "rgba(255, 0, 120, 0.10)",
  "rgba(255, 255, 255, 0.08)",
];

function randomBetween(a, b) {
  return a + Math.random() * (b - a);
}

function NebulaOverlay() {
  const canvasRef = useRef(null);
  const animationRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Nebula blobs
    const blobs = Array.from({ length: 5 }).map(() => ({
      x: randomBetween(0, width),
      y: randomBetween(0, height),
      r: randomBetween(180, 400),
      dx: randomBetween(-0.08, 0.08),
      dy: randomBetween(-0.06, 0.06),
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    function draw() {
      ctx.clearRect(0, 0, width, height);
      blobs.forEach((blob) => {
        const grad = ctx.createRadialGradient(
          blob.x, blob.y, blob.r * 0.2,
          blob.x, blob.y, blob.r
        );
        grad.addColorStop(0, blob.color);
        grad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.beginPath();
        ctx.arc(blob.x, blob.y, blob.r, 0, 2 * Math.PI);
        ctx.fillStyle = grad;
        ctx.fill();
        // Animate
        blob.x += blob.dx;
        blob.y += blob.dy;
        // Bounce off edges
        if (blob.x < 0 || blob.x > width) blob.dx *= -1;
        if (blob.y < 0 || blob.y > height) blob.dy *= -1;
      });
      animationRef.current = requestAnimationFrame(draw);
    }

    draw();

    // Handle resize
    function handleResize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    }
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 1,
        pointerEvents: "none",
        mixBlendMode: "lighter",
      }}
    />
  );
}

export default NebulaOverlay;