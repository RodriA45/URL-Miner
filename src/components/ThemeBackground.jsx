import { useEffect, useRef } from 'react';

export default function ThemeBackground({ theme }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // ==========================================
    // 1. MATRIX THEME: DIGITAL RAIN
    // ==========================================
    if (theme === 'matrix') {
      const chars = '0123456789ABCDEFｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜURLMINER';
      const fontSize = 14;
      const columns = Math.floor(width / fontSize);
      const drops = Array.from({ length: columns }, () => Math.floor(Math.random() * -50));

      const renderMatrix = () => {
        // Fade canvas slightly for trailing effect
        ctx.fillStyle = 'rgba(2, 11, 5, 0.08)';
        ctx.fillRect(0, 0, width, height);

        ctx.font = `${fontSize}px "JetBrains Mono", monospace`;

        for (let i = 0; i < drops.length; i++) {
          const char = chars[Math.floor(Math.random() * chars.length)];
          const x = i * fontSize;
          const y = drops[i] * fontSize;

          // Head character is glowing white/bright lime, tail is matrix green
          ctx.fillStyle = drops[i] % 5 === 0 ? '#b3ffb3' : '#00ff41';
          ctx.fillText(char, x, y);

          if (y > height && Math.random() > 0.975) {
            drops[i] = 0;
          }
          drops[i]++;
        }

        animationFrameId = requestAnimationFrame(renderMatrix);
      };

      // Fill initial black background
      ctx.fillStyle = '#020b05';
      ctx.fillRect(0, 0, width, height);
      renderMatrix();
    }

    // ==========================================
    // 2. HALLOWEEN THEME: SPOOKY EMBERS & BATS
    // ==========================================
    else if (theme === 'halloween') {
      // Create rising embers
      const emberCount = 45;
      const embers = Array.from({ length: emberCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 3 + 1.5,
        speedY: Math.random() * 0.8 + 0.3,
        speedX: (Math.random() - 0.5) * 0.6,
        color: Math.random() > 0.4 ? '#ff7518' : '#c084fc',
        alpha: Math.random() * 0.7 + 0.3,
        decay: Math.random() * 0.008 + 0.003
      }));

      // Create animated bats
      const batCount = 6;
      const bats = Array.from({ length: batCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * (height * 0.6),
        size: Math.random() * 12 + 10,
        speedX: Math.random() * 1.8 + 1.2,
        wingPhase: Math.random() * Math.PI * 2,
        wingSpeed: Math.random() * 0.15 + 0.15
      }));

      const renderHalloween = () => {
        // Deep witch mist background
        ctx.fillStyle = 'rgba(12, 8, 20, 0.3)';
        ctx.fillRect(0, 0, width, height);

        // Draw rising glowing embers
        for (const e of embers) {
          ctx.save();
          ctx.globalAlpha = e.alpha;
          ctx.fillStyle = e.color;
          ctx.shadowBlur = 8;
          ctx.shadowColor = e.color;
          ctx.beginPath();
          ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          e.y -= e.speedY;
          e.x += e.speedX;
          e.alpha -= e.decay;

          if (e.y < -10 || e.alpha <= 0) {
            e.y = height + 10;
            e.x = Math.random() * width;
            e.alpha = Math.random() * 0.7 + 0.3;
          }
        }

        // Draw animated flying bats
        for (const bat of bats) {
          bat.wingPhase += bat.wingSpeed;
          bat.x += bat.speedX;
          bat.y += Math.sin(bat.wingPhase * 0.5) * 0.8;

          if (bat.x > width + 50) {
            bat.x = -50;
            bat.y = Math.random() * (height * 0.6);
          }

          ctx.save();
          ctx.translate(bat.x, bat.y);
          ctx.fillStyle = '#ff7518';
          ctx.globalAlpha = 0.45;
          ctx.shadowBlur = 6;
          ctx.shadowColor = '#ff7518';

          // Simple bat silhouette
          const flap = Math.sin(bat.wingPhase) * (bat.size * 0.4);
          ctx.beginPath();
          // Center body
          ctx.arc(0, 0, bat.size * 0.2, 0, Math.PI * 2);
          // Left wing
          ctx.moveTo(0, 0);
          ctx.quadraticCurveTo(-bat.size * 0.6, -flap - bat.size * 0.3, -bat.size, flap);
          ctx.quadraticCurveTo(-bat.size * 0.5, flap * 0.3, 0, 0);
          // Right wing
          ctx.moveTo(0, 0);
          ctx.quadraticCurveTo(bat.size * 0.6, -flap - bat.size * 0.3, bat.size, flap);
          ctx.quadraticCurveTo(bat.size * 0.5, flap * 0.3, 0, 0);
          ctx.fill();
          ctx.restore();
        }

        animationFrameId = requestAnimationFrame(renderHalloween);
      };

      ctx.fillStyle = '#0c0814';
      ctx.fillRect(0, 0, width, height);
      renderHalloween();
    }

    // ==========================================
    // 3. NAVIDAD THEME: DRIFTING SNOWFALL & TWINKLES
    // ==========================================
    else if (theme === 'christmas') {
      const flakeCount = 75;
      const flakes = Array.from({ length: flakeCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 3 + 1,
        density: Math.random() * flakeCount,
        alpha: Math.random() * 0.7 + 0.3,
        swaySpeed: Math.random() * 0.02 + 0.01,
        swayRange: Math.random() * 30 + 10,
        swayOffset: Math.random() * Math.PI * 2
      }));

      // Subtle twinkling gold stars
      const starCount = 25;
      const stars = Array.from({ length: starCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * (height * 0.7),
        size: Math.random() * 2 + 1,
        phase: Math.random() * Math.PI * 2
      }));

      let time = 0;
      const renderChristmas = () => {
        time += 0.02;
        ctx.fillStyle = 'rgba(7, 23, 17, 0.25)';
        ctx.fillRect(0, 0, width, height);

        // Draw twinkling stars
        for (const s of stars) {
          const glow = Math.sin(time + s.phase) * 0.4 + 0.6;
          ctx.save();
          ctx.globalAlpha = glow * 0.6;
          ctx.fillStyle = '#ffd166';
          ctx.shadowBlur = 6;
          ctx.shadowColor = '#ffd166';
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // Draw falling snow
        for (const f of flakes) {
          ctx.save();
          ctx.globalAlpha = f.alpha;
          ctx.fillStyle = '#f8f9fa';
          ctx.shadowBlur = 4;
          ctx.shadowColor = '#ffffff';
          ctx.beginPath();
          const swayX = f.x + Math.sin(time * f.swaySpeed + f.swayOffset) * f.swayRange;
          ctx.arc(swayX, f.y, f.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          f.y += Math.cos(time + f.density) + 1 + f.radius * 0.5;

          if (f.y > height) {
            f.y = -5;
            f.x = Math.random() * width;
          }
        }

        animationFrameId = requestAnimationFrame(renderChristmas);
      };

      ctx.fillStyle = '#071711';
      ctx.fillRect(0, 0, width, height);
      renderChristmas();
    }

    // ==========================================
    // 4. CYBER DARK / NEO LIGHT: SUBTLE CYBER GRID
    // ==========================================
    else {
      // Clean static or subtle dot blueprint grid
      ctx.clearRect(0, 0, width, height);
      const isLight = theme === 'light';
      ctx.fillStyle = isLight ? '#000000' : '#ffffff';
      ctx.globalAlpha = isLight ? 0.05 : 0.035;

      const dotSpacing = 32;
      for (let x = 0; x < width; x += dotSpacing) {
        for (let y = 0; y < height; y += dotSpacing) {
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [theme]);

  return (
    <div className={`theme-background-wrapper theme-bg-${theme}`} aria-hidden="true">
      <canvas ref={canvasRef} className="theme-background-canvas" />
      <div className="theme-ambient-overlay" />
    </div>
  );
}
