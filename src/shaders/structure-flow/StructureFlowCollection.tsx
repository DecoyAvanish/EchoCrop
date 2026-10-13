import {DotMatrixBackground, type DotMatrixBackgroundProps} from '../dot-matrix/DotMatrixBackground';
import {OrbitalSphereBackground, type OrbitalSphereBackgroundProps} from '../orbital-sphere/OrbitalSphereBackground';

type DotMatrixProps=DotMatrixBackgroundProps&{variant:'dot-matrix'};
type OrbitalSphereProps=OrbitalSphereBackgroundProps&{variant:'orbital-sphere'};
export type StructureFlowCollectionProps=DotMatrixProps|OrbitalSphereProps;

export function StructureFlowCollection(props:StructureFlowCollectionProps){
  if(props.variant==='dot-matrix'){
    const {variant:_,...options}=props;
    return <DotMatrixBackground {...options}/>;
  }
  const {variant:_,...options}=props;
  return <OrbitalSphereBackground {...options}/>;
}
