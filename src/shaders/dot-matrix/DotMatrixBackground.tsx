import { useEffect, useRef } from "react";
import {THREE} from "../threeRuntime";
import { CORE_UPLINK_FRAGMENT_SHADER, CORE_UPLINK_VERTEX_SHADER } from "./dotMatrixShaders";
export type DotMatrixBackgroundProps = { speed?: number; gridScale?: number; mouseAmount?: number; pulseSpeed?: number; radius?: number; opacity?: number; hue?: number; className?: string };
export const DOT_MATRIX_DEFAULTS = { speed: 1, gridScale: 60, mouseAmount: 0.04, pulseSpeed: 0.4, radius: 0.15, opacity: 0.35, hue: 0 } as const;
export function DotMatrixBackground({ className = "", ...props }: DotMatrixBackgroundProps) {
  const hostRef = useRef<HTMLDivElement>(null), canvasRef = useRef<HTMLCanvasElement>(null), optionsRef = useRef({ ...DOT_MATRIX_DEFAULTS, ...props }); optionsRef.current = { ...DOT_MATRIX_DEFAULTS, ...props };
  const stationary=props.speed===0;
  useEffect(() => { const host = hostRef.current, canvas = canvasRef.current; if (!host || !canvas) return undefined;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true }); renderer.setPixelRatio(Math.min(window.devicePixelRatio||1, 1.5)); const scene = new THREE.Scene(), camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10); camera.position.z = 1;
    const uniforms = { uTime: { value: 0 }, uResolution: { value: new THREE.Vector2() }, uMouse: { value: new THREE.Vector2() }, uGridScale: { value: 60 }, uMouseAmount: { value: 0.04 }, uPulseSpeed: { value: 0.4 }, uRadius: { value: 0.15 }, uOpacity: { value: 0.35 } };
    const geometry = new THREE.PlaneGeometry(2, 2), material = new THREE.ShaderMaterial({ uniforms, vertexShader: CORE_UPLINK_VERTEX_SHADER, fragmentShader: CORE_UPLINK_FRAGMENT_SHADER, transparent: true, depthWrite: false }); scene.add(new THREE.Mesh(geometry, material));
    const mouse = new THREE.Vector2(), target = new THREE.Vector2();let frame = 0, visible = true;const startedAt = performance.now();
    const pointer = (event: PointerEvent) => { const bounds = canvas.getBoundingClientRect(); target.x = ((event.clientX - bounds.left) / Math.max(1, bounds.width)) * 2 - 1; target.y = -(((event.clientY - bounds.top) / Math.max(1, bounds.height)) * 2 - 1); };
    const render = (now: number) => { frame=0;const options = optionsRef.current; mouse.lerp(target, 0.05); uniforms.uTime.value = stationary?2.4:(now - startedAt) * 0.001 * options.speed; uniforms.uMouse.value = mouse; uniforms.uGridScale.value = options.gridScale; uniforms.uMouseAmount.value = stationary?0:options.mouseAmount; uniforms.uPulseSpeed.value = options.pulseSpeed; uniforms.uRadius.value = options.radius; uniforms.uOpacity.value = options.opacity; renderer.render(scene, camera); frame = !stationary&&visible&&!document.hidden ? requestAnimationFrame(render) : 0; };
    const resize = () => { const bounds = host.getBoundingClientRect();renderer.setSize(Math.max(1,bounds.width),Math.max(1,bounds.height),false);uniforms.uResolution.value.set(Math.max(1,canvas.width),Math.max(1,canvas.height));if(frame)cancelAnimationFrame(frame);render(performance.now()) };
    const update=()=>{if(frame){cancelAnimationFrame(frame);frame=0}if(visible&&!document.hidden)frame=requestAnimationFrame(render)};
    const resizeObserver = new ResizeObserver(resize), intersection = new IntersectionObserver(([entry]) => {visible=entry?.isIntersecting??true;update()});resizeObserver.observe(host);intersection.observe(host);canvas.addEventListener("pointermove", pointer,{passive:true});document.addEventListener('visibilitychange',update);resize();
    return () => { if (frame) cancelAnimationFrame(frame); resizeObserver.disconnect(); intersection.disconnect(); canvas.removeEventListener("pointermove", pointer);document.removeEventListener('visibilitychange',update);geometry.dispose();material.dispose();renderer.dispose()};
  }, [stationary]);
  return <div ref={hostRef} aria-hidden="true" className={`threeui-background dot-matrix${className ? ` ${className}` : ""}`}><canvas ref={canvasRef} style={{ filter: `hue-rotate(${optionsRef.current.hue}deg)` }} /></div>;
}
