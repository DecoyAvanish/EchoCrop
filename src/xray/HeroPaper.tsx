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
  if(props.mode==='chamber'||props.reduced)return <LegacyXrayScene {...props}/>;
  return <div className="hero-visual">
    <StructureFlowCollection variant="orbital-sphere" speed={1.00} particleSize={0.015} particleOpacity={0.80} orbitOpacity={0.25} hue={0} scale={1.00} haloOpacity={0.20} className="hero-orbital"/>
    <ThreeDPaperRuntime className="hero-paper"/>
  </div>;
}
