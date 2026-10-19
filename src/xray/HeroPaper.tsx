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
  pageNumber?:number;
  pageCount?:number;
  totalClauses?:number;
  clauseOffset?:number;
  documentTitle?:string;
};

export default function HeroPaper(props:SceneProps){
  const speed=props.reduced?0:1;
  if(props.mode==='chamber')return <div className="chamber-paper-visual">
    <StructureFlowCollection
      variant="orbital-sphere"
      speed={props.reduced?0:0.42}
      particleSize={0.018}
      particleOpacity={0.72}
      orbitOpacity={0.34}
      hue={0}
      scale={1.35}
      haloOpacity={0.30}
      className="chamber-orbital"
    />
    <ThreeDPaperRuntime className="chamber-paper" mode="chamber" clauses={props.clauses} reduced={props.reduced} onClauseSelect={props.onClauseSelect} zoom={props.zoom} focusIndex={(props.zoom??1)>1?props.active:-1} pageNumber={props.pageNumber} pageCount={props.pageCount} totalClauses={props.totalClauses} clauseOffset={props.clauseOffset} documentTitle={props.documentTitle}/>
  </div>;
  return <div className="hero-visual">
    <StructureFlowCollection variant="orbital-sphere" speed={speed} particleSize={0.018} particleOpacity={0.92} orbitOpacity={0.38} hue={0} scale={1.38} haloOpacity={0.34} className="hero-orbital"/>
    <ThreeDPaperRuntime className="hero-paper" reduced={props.reduced}/>
  </div>;
}
