import LegacyXrayScene from './XrayScene';
import {ThreeDPaperRuntime} from '../shaders/3d-paper/ThreeDPaperRuntime';
import {StructureFlowCollection} from '../shaders/structure-flow/StructureFlowCollection';

type SceneProps={
  mode?:'hero'|'chamber';
  active?:number;
  scanning?:boolean;
  reduced?:boolean;
};

export default function HeroPaper(props:SceneProps){
  if(props.mode==='chamber')return <LegacyXrayScene {...props}/>;
  const speed=props.reduced?0:1;
  return <div className="hero-visual">
    <StructureFlowCollection variant="orbital-sphere" speed={speed} particleSize={0.022} particleOpacity={0.92} orbitOpacity={0.42} hue={0} scale={1.25} haloOpacity={0.34} className="hero-orbital"/>
    <ThreeDPaperRuntime className="hero-paper" reduced={props.reduced}/>
  </div>;
}
