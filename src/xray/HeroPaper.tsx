import {ThreeDPaperRuntime} from '../shaders/3d-paper/ThreeDPaperRuntime';
import {StructureFlowCollection} from '../shaders/structure-flow/StructureFlowCollection';
import type {Clause} from './data';

type SceneProps={
  mode?:'hero'|'chamber';
  active?:number;
  scanning?:boolean;
  reduced?:boolean;
  clauses?:Clause[];
  onClauseSelect?:(index:number)=>void;
  zoom?:number;
};

export default function HeroPaper(props:SceneProps){
  const speed=props.reduced?0:1;
  if(props.mode==='chamber')return <div className="chamber-paper-visual">
    <StructureFlowCollection
      variant="orbital-sphere"
      speed={props.reduced?0:0.32}
      particleSize={0.012}
      particleOpacity={0.32}
      orbitOpacity={0.14}
      hue={0}
      scale={0.9}
      haloOpacity={0.12}
      className="chamber-orbital"
    />
    <ThreeDPaperRuntime className="chamber-paper" mode="chamber" clauses={props.clauses} reduced={props.reduced} onClauseSelect={props.onClauseSelect} zoom={props.zoom} focusIndex={(props.zoom??1)>1?props.active:-1}/>
  </div>;
  return <div className="hero-visual">
    <StructureFlowCollection variant="orbital-sphere" speed={speed} particleSize={0.015} particleOpacity={0.80} orbitOpacity={0.25} hue={0} scale={1.00} haloOpacity={0.20} className="hero-orbital"/>
    <ThreeDPaperRuntime className="hero-paper" reduced={props.reduced}/>
  </div>;
}
