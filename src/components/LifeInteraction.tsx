import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useAnimationControls, useReducedMotion } from 'motion/react';
import { Disc3, MapPin } from 'lucide-react';

type LifeCopy = {
  readonly interests: readonly string[];
  readonly interestNotes: readonly string[];
  readonly skateCaption: string;
  readonly skateLabel: string;
  readonly skateEasterLabel: string;
  readonly skateTrickLabel: string;
  readonly musicKicker: string;
  readonly musicStatement: string;
  readonly musicEssay: string;
  readonly musicListLabel: string;
  readonly travelCaption: string;
  readonly travelLabel: string;
};

const dylanTracks = [
  'One Too Many Mornings',
  'Desolation Row',
  'Born in Time',
  'Mr. Tambourine Man',
  'Is Your Love in Vain?',
  'My Back Pages',
  "Workingman's Blues #2",
  "A Hard Rain's A-Gonna Fall",
  'Tangled Up in Blue',
] as const;

function Skate({ copy }: { copy: LifeCopy }) {
  const reduce = useReducedMotion();
  const controls = useAnimationControls();
  const tapCount = useRef(0);
  const tapReset = useRef<number | null>(null);
  const flippingRef = useRef(false);
  const [flipping, setFlipping] = useState(false);

  useEffect(() => () => {
    if (tapReset.current) window.clearTimeout(tapReset.current);
    controls.stop();
  }, [controls]);

  const triggerFlip = async () => {
    if (reduce || flippingRef.current) return;
    flippingRef.current = true;
    setFlipping(true);
    await controls.start({
      x: [0, 10, 34, 22, 7, 0],
      y: [0, -20, -108, -82, -20, 0],
      rotateX: [0, 0, 198, 374, 360, 360],
      rotateY: [0, -4, 9, -5, 2, 0],
      rotateZ: [0, -7, 12, -5, 2, 0],
      scale: [1, 1.025, 1.07, 1.035, .985, 1],
      transition: { duration: 1.36, times: [0, .14, .43, .68, .88, 1], ease: [.16, 1, .3, 1] },
    });
    controls.set({ x: 0, y: 0, rotateX: 0, rotateY: 0, rotateZ: 0, scale: 1 });
    flippingRef.current = false;
    setFlipping(false);
  };

  const handleActivate = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (reduce || flippingRef.current) return;
    if (event.detail === 0) {
      void triggerFlip();
      return;
    }
    tapCount.current += 1;
    if (tapReset.current) window.clearTimeout(tapReset.current);
    if (tapCount.current >= 3) {
      tapCount.current = 0;
      if (tapReset.current) window.clearTimeout(tapReset.current);
      void triggerFlip();
      return;
    }
    void controls.start({
      x: [0, 6, 0],
      rotateZ: [0, -1.5, 0],
      transition: { duration: .24, ease: [.16, 1, .3, 1] },
    });
    tapReset.current = window.setTimeout(() => { tapCount.current = 0; }, 1200);
  };

  return <div className="life-art skate-art" data-flipping={flipping ? 'true' : undefined}>
    <svg viewBox="0 0 600 360" aria-hidden="true"><path className="trail" pathLength="1" d="M38 282C190 186 334 329 565 198M98 310C252 232 377 331 588 240"/></svg>
    <motion.button
      type="button"
      className="skate-trigger"
      aria-label={reduce ? copy.skateLabel : copy.skateEasterLabel}
      tabIndex={reduce ? -1 : 0}
      onClick={handleActivate}
    >
      <motion.span className="board-motion" animate={controls}>
        <svg viewBox="0 0 600 360" aria-hidden="true"><g className="board"><path pathLength="1" d="M183 178c66 21 168 4 231-46 14-12 28-8 32 3 5 14-6 24-17 31-84 58-174 79-271 49-16-5-24-16-17-27 8-13 23-15 42-10z"/><circle cx="208" cy="225" r="10"/><circle cx="397" cy="184" r="10"/></g></svg>
      </motion.span>
    </motion.button>
    <span className="kickflip-fx" aria-hidden="true">
      <span className="kickflip-speed"><i/><i/><i/></span>
      <span className="kickflip-ring"/>
      <span className="kickflip-sparks">{Array.from({ length: 12 }, (_, index) => <i key={index}/>)}</span>
      <b>{copy.skateTrickLabel}</b>
    </span>
    <span className="life-caption mono">{copy.skateCaption}</span>
  </div>;
}
function Music({ copy }: { copy: LifeCopy }) { return <div className="life-art music-art">
  <div className="music-mark" aria-hidden="true"><Disc3 /></div>
  <div className="music-notes">
    <span className="music-kicker mono">{copy.musicKicker}</span>
    <p>{copy.musicStatement}</p>
    <ol aria-label={copy.musicListLabel}>{dylanTracks.slice(0, 3).map((track,index)=><li key={track}><span className="mono">0{index+1}</span>{track}</li>)}</ol>
  </div>
</div> }
function Travel({ copy }: { copy: LifeCopy }) { return <div className="life-art travel-art"><svg viewBox="0 0 600 360" aria-label={copy.travelLabel}><path pathLength="1" d="M45 270C128 241 107 128 209 153s113 123 190 80 44-122 149-167"/><circle cx="45" cy="270" r="5"/><circle cx="209" cy="153" r="5"/><circle cx="399" cy="233" r="5"/><circle cx="548" cy="66" r="7"/></svg><MapPin aria-hidden="true"/><span className="life-caption mono">{copy.travelCaption}</span></div> }

export default function LifeInteraction({ copy }: { copy: LifeCopy }){
  const [active,setActive]=useState('skate');
  const reduce=useReducedMotion();
  const stageRef=useRef<HTMLDivElement>(null);
  const items = [
    { id:'skate', label:copy.interests[0], note:copy.interestNotes[0] },
    { id:'music', label:copy.interests[1], note:copy.interestNotes[1] },
    { id:'travel', label:copy.interests[2], note:copy.interestNotes[2] },
  ];
  const selectFromTap=(id:string)=>{
    setActive(id);
    if(window.matchMedia('(max-width: 640px)').matches){
      window.requestAnimationFrame(()=>stageRef.current?.scrollIntoView({behavior:reduce?'auto':'smooth',block:'center'}));
    }
  };
  return <div className="life-interactive" data-reveal>
    <div className="life-list" role="tablist" aria-label="Life interests">
      {items.map((item,i)=><button key={item.id} role="tab" aria-selected={active===item.id} aria-controls="life-art" onMouseEnter={()=>window.innerWidth>640&&setActive(item.id)} onFocus={()=>setActive(item.id)} onClick={()=>selectFromTap(item.id)} className={active===item.id?'is-active':''}><span className="mono">0{i+1}</span><b className="life-label">{item.label}</b>{item.note ? <em>{item.note}</em> : null}</button>)}
    </div>
    <div ref={stageRef} className="life-stage" id="life-art" role="tabpanel" data-interactive-surface>
      <AnimatePresence initial={false}>
        <motion.div
          key={active}
          className="life-swap"
          initial={reduce ? false : { opacity: 0, x: 10, y: 4 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={reduce ? { opacity: 1 } : { opacity: 0, x: -7, y: -2 }}
          transition={{ duration: reduce ? 0 : .42, ease: [.16, 1, .3, 1] }}
        >
          {active==='skate'?<Skate copy={copy}/>:active==='music'?<Music copy={copy}/>:<Travel copy={copy}/>}</motion.div>
      </AnimatePresence>
    </div>
  </div>
}
