import { useEffect, useRef } from "react";
import { createOrbitalSphereRenderer, ORBITAL_SPHERE_DEFAULTS, type OrbitalSphereOptions } from "./orbitalSphereRenderer";
export type OrbitalSphereBackgroundProps = Partial<OrbitalSphereOptions> & { className?: string };
export function OrbitalSphereBackground({ className = "", ...props }: OrbitalSphereBackgroundProps) {
  const hostRef = useRef<HTMLDivElement>(null), canvasRef = useRef<HTMLCanvasElement>(null), optionsRef = useRef({ ...ORBITAL_SPHERE_DEFAULTS, ...props }); optionsRef.current = { ...ORBITAL_SPHERE_DEFAULTS, ...props };
  const stationary=props.speed===0;
  useEffect(() => {
    const host = hostRef.current, canvas = canvasRef.current;
    if (!host || !canvas) return undefined;
    const renderer = createOrbitalSphereRenderer(canvas, () => optionsRef.current);
    let frame = 0, visible = true, previous=0;
    const tick = (now:number) => {
      frame=0;
      if(!visible||document.hidden)return;
      const delta=previous?Math.min((now-previous)/1000,.05):1/60;previous=now;
      renderer.render(stationary?0:delta);
      if(!stationary)frame=requestAnimationFrame(tick);
    };
    const update=()=>{
      if(frame){cancelAnimationFrame(frame);frame=0}
      previous=0;
      if(visible&&!document.hidden)frame=requestAnimationFrame(tick);
    };
    const resize = () => {
      const bounds = host.getBoundingClientRect();
      renderer.resize(Math.max(1,bounds.width),Math.max(1,bounds.height));
      renderer.render(0);
    };
    const resizeObserver = new ResizeObserver(resize), intersection = new IntersectionObserver(([entry]) => {visible=entry?.isIntersecting??true;update()});
    resizeObserver.observe(host);intersection.observe(host);document.addEventListener('visibilitychange',update);
    resize();update();
    return () => {if(frame)cancelAnimationFrame(frame);resizeObserver.disconnect();intersection.disconnect();document.removeEventListener('visibilitychange',update);renderer.dispose()};
  }, [stationary]);
  return <div ref={hostRef} aria-hidden="true" className={`threeui-background orbital-sphere${className ? ` ${className}` : ""}`}><canvas ref={canvasRef} style={{ filter: `hue-rotate(${optionsRef.current.hue}deg)` }} /></div>;
}
