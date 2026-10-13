import LegacyXrayScene from './XrayScene';
import {ThreeDPaper} from '../shaders/3d-paper/ThreeDPaper';

type SceneProps={
  mode?:'hero'|'chamber';
  active?:number;
  scanning?:boolean;
  reduced?:boolean;
};

export default function HeroPaper(props:SceneProps){
  if(props.mode==='chamber'||props.reduced)return <LegacyXrayScene {...props}/>;
  return <ThreeDPaper variant="site-of-the-year" className="hero-paper"/>;
}
