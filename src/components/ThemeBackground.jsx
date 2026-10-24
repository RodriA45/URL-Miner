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
        ctx.fillStyle = 'rgba(2, 11, 5, 0.08)';
        ctx.fillRect(0, 0, width, height);

        ctx.font = `${fontSize}px "JetBrains Mono", monospace`;

        for (let i = 0; i < drops.length; i++) {
          const char = chars[Math.floor(Math.random() * chars.length)];
          const x = i * fontSize;
          const y = drops[i] * fontSize;

          ctx.fillStyle = drops[i] % 5 === 0 ? '#b3ffb3' : '#00ff41';
          ctx.fillText(char, x, y);

          if (y > height && Math.random() > 0.975) {
            drops[i] = 0;
          }
          drops[i]++;
        }

        animationFrameId = requestAnimationFrame(renderMatrix);
      };

      ctx.fillStyle = '#020b05';
      ctx.fillRect(0, 0, width, height);
      renderMatrix();
    }

    // ==========================================
    // 2. HALLOWEEN THEME: SKULLS, SPIDERWEBS, BATS & PUMPKINS
    // ==========================================
    else if (theme === 'halloween') {
      // Floating Skulls (Calaveras espectrales)
      const skullCount = 7;
      const skulls = Array.from({ length: skullCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        scale: Math.random() * 0.7 + 0.7,
        speedY: Math.random() * 0.5 + 0.25,
        swaySpeed: Math.random() * 0.02 + 0.01,
        swayRange: Math.random() * 20 + 10,
        color: Math.random() > 0.5 ? '#ff7518' : '#c084fc',
        alpha: Math.random() * 0.45 + 0.25
      }));

      // Floating Jack-o'-lantern Pumpkins (Calabazas talladas)
      const pumpkinCount = 5;
      const pumpkins = Array.from({ length: pumpkinCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 12 + 14,
        speedY: Math.random() * 0.6 + 0.3,
        swaySpeed: Math.random() * 0.02 + 0.015,
        alpha: Math.random() * 0.5 + 0.3
      }));

      // Rising fire embers
      const emberCount = 35;
      const embers = Array.from({ length: emberCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 3 + 1,
        speedY: Math.random() * 0.8 + 0.4,
        speedX: (Math.random() - 0.5) * 0.5,
        color: Math.random() > 0.4 ? '#ff7518' : '#c084fc',
        alpha: Math.random() * 0.7 + 0.3
      }));

      // Flying Bats
      const batCount = 5;
      const bats = Array.from({ length: batCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * (height * 0.5),
        size: Math.random() * 14 + 10,
        speedX: Math.random() * 2 + 1.2,
        wingPhase: Math.random() * Math.PI * 2,
        wingSpeed: Math.random() * 0.15 + 0.15
      }));

      // Spider hanging on web
      let spiderTime = 0;

      // Helper to draw a stylized skull
      const drawSkull = (x, y, scale, color, alpha) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = color;

        ctx.beginPath();
        // Cranium
        ctx.arc(0, -6, 12, 0, Math.PI * 2);
        // Jaw
        ctx.rect(-6, 2, 12, 8);
        ctx.fill();

        // Hollow Eye Sockets
        ctx.fillStyle = '#0c0814';
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.ellipse(-4, -6, 3.2, 4.2, -0.2, 0, Math.PI * 2);
        ctx.ellipse(4, -6, 3.2, 4.2, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Inverted heart nasal cavity
        ctx.beginPath();
        ctx.moveTo(0, -1);
        ctx.lineTo(-1.5, 2);
        ctx.lineTo(1.5, 2);
        ctx.closePath();
        ctx.fill();

        // Teeth notches
        ctx.strokeStyle = '#0c0814';
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.moveTo(-3, 3); ctx.lineTo(-3, 8);
        ctx.moveTo(0, 3);  ctx.lineTo(0, 8);
        ctx.moveTo(3, 3);  ctx.lineTo(3, 8);
        ctx.stroke();

        ctx.restore();
      };

      // Helper to draw a carved pumpkin
      const drawPumpkin = (x, y, size, alpha) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.globalAlpha = alpha;

        // Pumpkin body
        ctx.fillStyle = '#ff7518';
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#ff7518';
        ctx.beginPath();
        ctx.ellipse(0, 0, size, size * 0.85, 0, 0, Math.PI * 2);
        ctx.fill();

        // Stem
        ctx.fillStyle = '#55a630';
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.rect(-2, -size * 1.1, 4, size * 0.35);
        ctx.fill();

        // Glowing carved eyes
        ctx.fillStyle = '#ffea00';
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#ffea00';
        // Left eye triangle
        ctx.beginPath();
        ctx.moveTo(-size * 0.5, -size * 0.3);
        ctx.lineTo(-size * 0.2, -size * 0.3);
        ctx.lineTo(-size * 0.35, -size * 0.6);
        ctx.closePath();
        ctx.fill();
        // Right eye triangle
        ctx.beginPath();
        ctx.moveTo(size * 0.5, -size * 0.3);
        ctx.lineTo(size * 0.2, -size * 0.3);
        ctx.lineTo(size * 0.35, -size * 0.6);
        ctx.closePath();
        ctx.fill();

        // Jagged smile
        ctx.beginPath();
        ctx.moveTo(-size * 0.6, size * 0.1);
        ctx.lineTo(-size * 0.3, size * 0.35);
        ctx.lineTo(-size * 0.1, size * 0.15);
        ctx.lineTo(0, size * 0.35);
        ctx.lineTo(size * 0.1, size * 0.15);
        ctx.lineTo(size * 0.3, size * 0.35);
        ctx.lineTo(size * 0.6, size * 0.1);
        ctx.lineTo(size * 0.3, size * 0.5);
        ctx.lineTo(0, size * 0.55);
        ctx.lineTo(-size * 0.3, size * 0.5);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      };

      // Draw corner spiderwebs
      const drawCornerWeb = (originX, originY, flipX = 1) => {
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 117, 24, 0.22)';
        ctx.lineWidth = 1.2;
        const radius = 130;
        const spokes = 5;

        // Radial spokes
        for (let i = 0; i <= spokes; i++) {
          const angle = (Math.PI / 2 / spokes) * i;
          ctx.beginPath();
          ctx.moveTo(originX, originY);
          ctx.lineTo(originX + Math.cos(angle) * radius * flipX, originY + Math.sin(angle) * radius);
          ctx.stroke();
        }

        // Concentric connecting web arcs
        for (let r = 25; r <= radius; r += 25) {
          ctx.beginPath();
          for (let i = 0; i <= spokes; i++) {
            const angle = (Math.PI / 2 / spokes) * i;
            const px = originX + Math.cos(angle) * r * flipX;
            const py = originY + Math.sin(angle) * r;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.quadraticCurveTo(originX + Math.cos(angle - 0.15) * (r * 0.9) * flipX, originY + Math.sin(angle - 0.15) * (r * 0.9), px, py);
          }
          ctx.stroke();
        }
        ctx.restore();
      };

      const renderHalloween = () => {
        spiderTime += 0.02;
        ctx.fillStyle = 'rgba(12, 8, 20, 0.32)';
        ctx.fillRect(0, 0, width, height);

        // Draw corner webs
        drawCornerWeb(0, 0, 1);
        drawCornerWeb(width, 0, -1);

        // Dangling bobbing spider on right corner
        const spiderY = 70 + Math.sin(spiderTime * 1.5) * 25;
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 117, 24, 0.4)';
        ctx.beginPath();
        ctx.moveTo(width - 50, 0);
        ctx.lineTo(width - 50, spiderY);
        ctx.stroke();
        // Spider body
        ctx.fillStyle = '#ff7518';
        ctx.shadowBlur = 6;
        ctx.shadowColor = '#ff7518';
        ctx.beginPath();
        ctx.arc(width - 50, spiderY, 5, 0, Math.PI * 2);
        ctx.fill();
        // Spider legs
        ctx.strokeStyle = '#ff7518';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(width - 50, spiderY); ctx.lineTo(width - 58, spiderY - 4);
        ctx.moveTo(width - 50, spiderY); ctx.lineTo(width - 58, spiderY + 4);
        ctx.moveTo(width - 50, spiderY); ctx.lineTo(width - 42, spiderY - 4);
        ctx.moveTo(width - 50, spiderY); ctx.lineTo(width - 42, spiderY + 4);
        ctx.stroke();
        ctx.restore();

        // Draw and update rising glowing skulls
        for (const s of skulls) {
          const sway = Math.sin(spiderTime + s.swaySpeed * 10) * s.swayRange;
          drawSkull(s.x + sway, s.y, s.scale, s.color, s.alpha);
          s.y -= s.speedY;
          if (s.y < -40) {
            s.y = height + 40;
            s.x = Math.random() * width;
          }
        }

        // Draw and update rising pumpkins
        for (const p of pumpkins) {
          const sway = Math.cos(spiderTime + p.swaySpeed * 8) * 15;
          drawPumpkin(p.x + sway, p.y, p.size, p.alpha);
          p.y -= p.speedY;
          if (p.y < -40) {
            p.y = height + 40;
            p.x = Math.random() * width;
          }
        }

        // Draw rising embers
        for (const e of embers) {
          ctx.save();
          ctx.globalAlpha = e.alpha;
          ctx.fillStyle = e.color;
          ctx.shadowBlur = 6;
          ctx.shadowColor = e.color;
          ctx.beginPath();
          ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          e.y -= e.speedY;
          e.x += e.speedX;
          if (e.y < -10) {
            e.y = height + 10;
            e.x = Math.random() * width;
          }
        }

        // Draw flying bats
        for (const bat of bats) {
          bat.wingPhase += bat.wingSpeed;
          bat.x += bat.speedX;
          bat.y += Math.sin(bat.wingPhase * 0.5) * 0.8;

          if (bat.x > width + 50) {
            bat.x = -50;
            bat.y = Math.random() * (height * 0.5);
          }

          ctx.save();
          ctx.translate(bat.x, bat.y);
          ctx.fillStyle = '#ff7518';
          ctx.globalAlpha = 0.45;
          ctx.shadowBlur = 6;
          ctx.shadowColor = '#ff7518';

          const flap = Math.sin(bat.wingPhase) * (bat.size * 0.4);
          ctx.beginPath();
          ctx.arc(0, 0, bat.size * 0.2, 0, Math.PI * 2);
          ctx.moveTo(0, 0);
          ctx.quadraticCurveTo(-bat.size * 0.6, -flap - bat.size * 0.3, -bat.size, flap);
          ctx.quadraticCurveTo(-bat.size * 0.5, flap * 0.3, 0, 0);
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
    // 3. NAVIDAD THEME: SANTA WITH SLEIGH & CHRISTMAS TREES
    // ==========================================
    else if (theme === 'christmas') {
      // Falling snowflakes
      const flakeCount = 70;
      const flakes = Array.from({ length: flakeCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 3 + 1,
        density: Math.random() * flakeCount,
        alpha: Math.random() * 0.7 + 0.3,
        swaySpeed: Math.random() * 0.02 + 0.01,
        swayRange: Math.random() * 25 + 10,
        swayOffset: Math.random() * Math.PI * 2
      }));

      // Twinkling stars
      const starCount = 20;
      const stars = Array.from({ length: starCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * (height * 0.6),
        size: Math.random() * 2 + 1,
        phase: Math.random() * Math.PI * 2
      }));

      // Santa & Sleigh State
      let santaX = -220;
      let santaY = height * 0.14;
      const santaSpeed = 2.0;

      // Magical Stardust trail from Santa's sleigh
      const magicDust = [];

      // Static positions for Christmas trees at the bottom corners
      const treeConfigs = [
        { xRatio: 0.06, scale: 1.1 },
        { xRatio: 0.14, scale: 0.85 },
        { xRatio: 0.86, scale: 0.9 },
        { xRatio: 0.94, scale: 1.15 }
      ];

      // Draw a stylized snowy Christmas Tree with lights and star
      const drawChristmasTree = (treeX, baseY, scale, time) => {
        ctx.save();
        ctx.translate(treeX, baseY);
        ctx.scale(scale, scale);

        // Trunk
        ctx.fillStyle = '#3a2010';
        ctx.fillRect(-6, -15, 12, 15);

        // 3 Tiers of Pine Branches
        const tiers = [
          { yTop: -45, yBottom: -15, width: 44 },
          { yTop: -70, yBottom: -40, width: 34 },
          { yTop: -95, yBottom: -65, width: 24 }
        ];

        tiers.forEach((tier) => {
          // Pine foliage
          ctx.fillStyle = '#0d281e';
          ctx.beginPath();
          ctx.moveTo(0, tier.yTop);
          ctx.lineTo(tier.width, tier.yBottom);
          ctx.lineTo(-tier.width, tier.yBottom);
          ctx.closePath();
          ctx.fill();

          // Snow cap on bottom edge of each tier
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.moveTo(-tier.width, tier.yBottom);
          ctx.quadraticCurveTo(-tier.width * 0.5, tier.yBottom + 3, 0, tier.yBottom);
          ctx.quadraticCurveTo(tier.width * 0.5, tier.yBottom + 3, tier.width, tier.yBottom);
          ctx.lineTo(tier.width * 0.8, tier.yBottom - 3);
          ctx.lineTo(-tier.width * 0.8, tier.yBottom - 3);
          ctx.closePath();
          ctx.fill();
        });

        // Twinkling colored ornaments / baubles
        const ornaments = [
          { x: -16, y: -24, color: '#ef233c' },
          { x: 14, y: -26, color: '#ffd166' },
          { x: 0, y: -30, color: '#00f0ff' },
          { x: -10, y: -48, color: '#ffd166' },
          { x: 12, y: -50, color: '#ef233c' },
          { x: -6, y: -74, color: '#00f0ff' },
          { x: 7, y: -76, color: '#ffd166' }
        ];

        ornaments.forEach((o, idx) => {
          const glow = Math.sin(time * 3 + idx) * 0.3 + 0.7;
          ctx.save();
          ctx.globalAlpha = glow;
          ctx.fillStyle = o.color;
          ctx.shadowBlur = 8;
          ctx.shadowColor = o.color;
          ctx.beginPath();
          ctx.arc(o.x, o.y, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });

        // Shining golden star at the very top
        ctx.save();
        ctx.translate(0, -98);
        ctx.fillStyle = '#ffd166';
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#ffd166';
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          ctx.lineTo(Math.cos((18 + i * 72) * Math.PI / 180) * 8, -Math.sin((18 + i * 72) * Math.PI / 180) * 8);
          ctx.lineTo(Math.cos((54 + i * 72) * Math.PI / 180) * 3.5, -Math.sin((54 + i * 72) * Math.PI / 180) * 3.5);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        ctx.restore();
      };

      // Draw Santa in his sleigh pulled by flying reindeer
      const drawSantaSleigh = (sx, sy, time) => {
        ctx.save();
        ctx.translate(sx, sy);

        // 1. Two Reindeer ahead (Renos volando)
        const reindeers = [
          { x: 120, isRudolph: true },
          { x: 70, isRudolph: false }
        ];

        reindeers.forEach((r) => {
          const legSwing = Math.sin(time * 8) * 4;
          ctx.save();
          ctx.translate(r.x, 0);

          // Reindeer body
          ctx.fillStyle = '#8b5a2b';
          ctx.beginPath();
          ctx.ellipse(0, 0, 14, 8, 0, 0, Math.PI * 2);
          ctx.fill();

          // Neck & Head
          ctx.beginPath();
          ctx.moveTo(8, -2);
          ctx.lineTo(16, -10);
          ctx.lineTo(20, -10);
          ctx.lineTo(14, 2);
          ctx.closePath();
          ctx.fill();
          // Head
          ctx.beginPath();
          ctx.arc(19, -10, 5, 0, Math.PI * 2);
          ctx.fill();

          // Antlers (Cornamenta)
          ctx.strokeStyle = '#d4a373';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(18, -14);
          ctx.lineTo(16, -20);
          ctx.lineTo(13, -22);
          ctx.moveTo(16, -20);
          ctx.lineTo(19, -23);
          ctx.stroke();

          // Legs in flight pose
          ctx.strokeStyle = '#5c3a21';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(6, 6);   ctx.lineTo(14 + legSwing, 14);
          ctx.moveTo(-6, 6);  ctx.lineTo(-12 - legSwing, 14);
          ctx.stroke();

          // Rudolph's glowing red nose!
          if (r.isRudolph) {
            ctx.fillStyle = '#ff0033';
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#ff0033';
            ctx.beginPath();
            ctx.arc(24, -9, 3, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.restore();
        });

        // Golden harness / reins connecting reindeer to sleigh
        ctx.strokeStyle = '#ffd166';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(0, -4);
        ctx.lineTo(70, -2);
        ctx.lineTo(120, -2);
        ctx.stroke();

        // 2. Santa's Sleigh (Trineo rojo de Papá Noel)
        ctx.save();
        ctx.translate(-25, 0);

        // Curled golden runner / ski
        ctx.strokeStyle = '#ffd166';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-20, 10);
        ctx.lineTo(15, 10);
        ctx.quadraticCurveTo(25, 10, 26, 0);
        ctx.stroke();
        // Runner struts
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-10, 10); ctx.lineTo(-8, 3);
        ctx.moveTo(8, 10);   ctx.lineTo(6, 3);
        ctx.stroke();

        // Sleigh bucket in Santa red
        ctx.fillStyle = '#ef233c';
        ctx.beginPath();
        ctx.moveTo(-22, -8);
        ctx.quadraticCurveTo(-15, 3, 0, 3);
        ctx.lineTo(16, 3);
        ctx.quadraticCurveTo(22, -2, 20, -8);
        ctx.lineTo(12, -8);
        ctx.quadraticCurveTo(8, -1, 0, -1);
        ctx.lineTo(-18, -1);
        ctx.closePath();
        ctx.fill();

        // Toy sack (Bolsa de regalos)
        ctx.fillStyle = '#ffd166';
        ctx.beginPath();
        ctx.arc(-14, -10, 8, 0, Math.PI * 2);
        ctx.fill();

        // Santa Claus!
        // Red coat
        ctx.fillStyle = '#ef233c';
        ctx.beginPath();
        ctx.arc(3, -10, 7, 0, Math.PI * 2);
        ctx.fill();
        // Santa head
        ctx.fillStyle = '#fcd5ce';
        ctx.beginPath();
        ctx.arc(3, -18, 4.5, 0, Math.PI * 2);
        ctx.fill();
        // Santa white beard
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(3, -15, 4.5, 0, Math.PI);
        ctx.fill();
        // Santa red hat with pom-pom
        ctx.fillStyle = '#ef233c';
        ctx.beginPath();
        ctx.moveTo(-2, -21);
        ctx.lineTo(8, -21);
        ctx.lineTo(1, -28);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(1, -29, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
        ctx.restore();
      };

      let snowTime = 0;

      const renderChristmas = () => {
        snowTime += 0.02;
        ctx.fillStyle = 'rgba(7, 23, 17, 0.28)';
        ctx.fillRect(0, 0, width, height);

        // Draw twinkling stars in the sky
        for (const s of stars) {
          const glow = Math.sin(snowTime + s.phase) * 0.4 + 0.6;
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

        // Emit and draw magic dust from Santa's sleigh
        if (Math.random() > 0.3) {
          magicDust.push({
            x: santaX - 45 + (Math.random() - 0.5) * 10,
            y: santaY + Math.sin(snowTime * 2) * 8 + (Math.random() - 0.5) * 6,
            size: Math.random() * 2.5 + 1,
            alpha: 1.0
          });
        }

        for (let i = magicDust.length - 1; i >= 0; i--) {
          const d = magicDust[i];
          ctx.save();
          ctx.globalAlpha = d.alpha * 0.7;
          ctx.fillStyle = '#ffd166';
          ctx.shadowBlur = 6;
          ctx.shadowColor = '#ffd166';
          ctx.beginPath();
          ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          d.alpha -= 0.025;
          d.y += 0.3;
          if (d.alpha <= 0) magicDust.splice(i, 1);
        }

        // Animate & Draw Santa flying across the sky
        santaX += santaSpeed;
        const currentSantaY = santaY + Math.sin(snowTime * 2) * 8;
        drawSantaSleigh(santaX, currentSantaY, snowTime);

        if (santaX > width + 250) {
          santaX = -250;
          santaY = Math.random() * (height * 0.18) + 40;
        }

        // Draw snowy bottom hills and decorated Christmas Trees
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.beginPath();
        ctx.ellipse(width * 0.1, height + 40, width * 0.3, 100, 0, 0, Math.PI * 2);
        ctx.ellipse(width * 0.9, height + 40, width * 0.3, 100, 0, 0, Math.PI * 2);
        ctx.fill();

        treeConfigs.forEach((tree) => {
          drawChristmasTree(width * tree.xRatio, height, tree.scale, snowTime);
        });

        // Draw falling snow
        for (const f of flakes) {
          ctx.save();
          ctx.globalAlpha = f.alpha;
          ctx.fillStyle = '#f8f9fa';
          ctx.shadowBlur = 4;
          ctx.shadowColor = '#ffffff';
          ctx.beginPath();
          const swayX = f.x + Math.sin(snowTime * f.swaySpeed + f.swayOffset) * f.swayRange;
          ctx.arc(swayX, f.y, f.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          f.y += Math.cos(snowTime + f.density) + 1 + f.radius * 0.5;

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
