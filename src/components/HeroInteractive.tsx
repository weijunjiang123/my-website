import { useEffect, useRef } from 'react';

type Node = { x: number; y: number; r: number; phase: number; accent?: boolean };

const baseNodes: Node[] = [
  { x: .18, y: .18, r: 2.4, phase: .1 }, { x: .47, y: .11, r: 2.2, phase: .9 },
  { x: .72, y: .22, r: 2.7, phase: 1.5 }, { x: .88, y: .43, r: 2.2, phase: 2.1 },
  { x: .76, y: .68, r: 2.4, phase: 2.7 }, { x: .52, y: .82, r: 2.7, phase: 3.2 },
  { x: .25, y: .73, r: 2.1, phase: 3.9 }, { x: .11, y: .49, r: 2.2, phase: 4.5 },
  { x: .48, y: .46, r: 6.2, phase: 5.1, accent: true }, { x: .63, y: .39, r: 2, phase: 5.8 },
  { x: .39, y: .61, r: 2, phase: 6.1 }, { x: .67, y: .57, r: 1.8, phase: 4.8 },
];

const edges = [[0,1],[0,7],[0,8],[1,2],[1,8],[2,3],[2,9],[3,4],[3,8],[4,5],[4,11],[5,6],[5,8],[6,7],[6,10],[7,8],[8,9],[8,10],[8,11],[9,11],[10,11]];

export default function HeroInteractive({ label = 'An interactive abstract knowledge graph' }: { label?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const hero = canvas.closest<HTMLElement>('.hero');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const startTime = performance.now();
    let frame = 0, width = 0, height = 0, raf = 0, running = true, visible = true;
    const pointer = { x: .5, y: .5, targetX: .5, targetY: .5, strength: 0, targetStrength: 0 };
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width; height = rect.height;
      canvas.width = width * dpr; canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      pointer.targetX = Math.max(-.22, Math.min(1.22, (e.clientX - r.left) / r.width));
      pointer.targetY = Math.max(-.18, Math.min(1.18, (e.clientY - r.top) / r.height));
      pointer.targetStrength = 1;
    };
    const onLeave = () => { pointer.targetStrength = 0; };
    const render = () => {
      if (!running || !visible || document.hidden) return;
      frame += reduce ? 0 : .006;
      const intro = reduce ? 1 : Math.min(1, (performance.now() - startTime) / 820);
      const introEase = 1 - Math.pow(1 - intro, 3);
      pointer.x += (pointer.targetX - pointer.x) * .075;
      pointer.y += (pointer.targetY - pointer.y) * .075;
      pointer.strength += (pointer.targetStrength - pointer.strength) * .08;
      ctx.clearRect(0, 0, width, height);
      const fieldShiftX = (pointer.x - .5) * width * .024 * pointer.strength;
      const fieldShiftY = (pointer.y - .5) * height * .018 * pointer.strength;
      const p = baseNodes.map((n) => {
        const driftX = Math.sin(frame + n.phase) * width * .008;
        const driftY = Math.cos(frame * .8 + n.phase) * height * .01;
        const dx = pointer.x - n.x, dy = pointer.y - n.y;
        const d = Math.max(Math.sqrt(dx*dx + dy*dy), .1);
        const pull = Math.max(0, .28 - d) * 32 * pointer.strength;
        return {
          ...n,
          px: n.x * width + driftX + dx/d*pull + fieldShiftX,
          py: n.y * height + driftY + dy/d*pull + fieldShiftY,
        };
      });
      ctx.lineWidth = 1;
      for (const [a,b] of edges) {
        const n1 = p[a], n2 = p[b];
        ctx.strokeStyle = `rgba(20, 21, 25, ${.15 * introEase})`;
        ctx.beginPath(); ctx.moveTo(n1.px, n1.py); ctx.lineTo(n2.px, n2.py); ctx.stroke();
      }
      ctx.setLineDash([3, 6]); ctx.strokeStyle = `rgba(91, 92, 226, ${.2 * introEase})`;
      ctx.beginPath(); ctx.ellipse(width*.5, height*.47, width*.42, height*.18, -.25 + frame*.05, 0, Math.PI*2); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(width*.5, height*.47, width*.27, height*.39, .48 - frame*.035, 0, Math.PI*2); ctx.stroke();
      ctx.setLineDash([]);
      for (const n of p) {
        const nodeIntro = Math.max(0, Math.min(1, (intro - n.phase * .018) / .72));
        const nodeScale = 1 - Math.pow(1 - nodeIntro, 3);
        ctx.beginPath(); ctx.arc(n.px, n.py, n.r * nodeScale, 0, Math.PI*2);
        ctx.fillStyle = n.accent ? '#5b5ce2' : '#141519'; ctx.fill();
        if (n.accent && nodeScale > .4) { ctx.beginPath(); ctx.arc(n.px, n.py, (n.r + 8 + Math.sin(frame*3)*2) * nodeScale, 0, Math.PI*2); ctx.strokeStyle=`rgba(91,92,226,${.25 * nodeScale})`; ctx.stroke(); }
      }
      if (!reduce) raf = requestAnimationFrame(render);
    };
    const resume = () => {
      cancelAnimationFrame(raf);
      if (running && visible && !document.hidden) {
        if (reduce) render();
        else raf = requestAnimationFrame(render);
      }
    };
    const onVisibility = () => resume();
    resize(); render();
    const ro = new ResizeObserver(resize); ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; resume(); }, { rootMargin: '120px' });
    io.observe(canvas);
    if (!reduce) {
      hero?.addEventListener('pointermove', onMove, { passive: true });
      hero?.addEventListener('pointerleave', onLeave);
    }
    document.addEventListener('visibilitychange', onVisibility);
    return () => { running = false; cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); hero?.removeEventListener('pointermove', onMove); hero?.removeEventListener('pointerleave', onLeave); document.removeEventListener('visibilitychange', onVisibility); };
  }, []);
  return <canvas ref={canvasRef} className="hero-canvas" aria-label={label} role="img" />;
}
