import {Component,lazy,Suspense,type ReactNode} from 'react';
import type {DotMatrixBackgroundProps} from '../dot-matrix/DotMatrixBackground';
import type {OrbitalSphereBackgroundProps} from '../orbital-sphere/OrbitalSphereBackground';
import {useDeferredScene} from '../sceneSupport';
import '../scene-performance.css';

const DotMatrixBackground=lazy(()=>import('../dot-matrix/DotMatrixBackground').then(module=>({default:module.DotMatrixBackground})));
const OrbitalSphereBackground=lazy(()=>import('../orbital-sphere/OrbitalSphereBackground').then(module=>({default:module.OrbitalSphereBackground})));

type DotMatrixProps=DotMatrixBackgroundProps&{variant:'dot-matrix'};
type OrbitalSphereProps=OrbitalSphereBackgroundProps&{variant:'orbital-sphere'};
export type StructureFlowCollectionProps=DotMatrixProps|OrbitalSphereProps;

class SceneBoundary extends Component<{children:ReactNode;fallback:ReactNode},{failed:boolean}>{
  state={failed:false};
  static getDerivedStateFromError(){return {failed:true}}
  render(){return this.state.failed?this.props.fallback:this.props.children}
}

export function StructureFlowCollection(props:StructureFlowCollectionProps){
  const {hostRef,enabled}=useDeferredScene();
  const fallback=<div ref={hostRef} aria-hidden="true" className={`threeui-background ${props.variant==='dot-matrix'?'dot-matrix':'orbital-sphere'} ${props.className||''}`}><i className={props.variant==='dot-matrix'?'scene-static-dot':'scene-static-orbit'}/></div>;
  if(!enabled)return fallback;
  if(props.variant==='dot-matrix'){
    const {variant:_,...options}=props;
    return <SceneBoundary fallback={fallback}><Suspense fallback={fallback}><DotMatrixBackground {...options}/></Suspense></SceneBoundary>;
  }
  const {variant:_,...options}=props;
  return <SceneBoundary fallback={fallback}><Suspense fallback={fallback}><OrbitalSphereBackground {...options}/></Suspense></SceneBoundary>;
}
