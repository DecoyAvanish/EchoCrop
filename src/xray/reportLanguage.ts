import type {ExposureScenario} from './actions';
import type {Language} from './types';

export function exposureExplanation(language:Language){
  return language==='es'?'Estas cantidades dependen de situaciones distintas. No las sumes. Revisa las condiciones y los importes en el acuerdo original.':'Each scenario has its own trigger. Do not add these amounts together.';
}
export function scenarioExplanation(scenario:ExposureScenario,language:Language){
  if(language==='en')return scenario.assumptions;
  switch(scenario.kind){
    case 'exit':return 'Costo de salida anticipada según el número de meses y la renta indicada en el acuerdo o la explicación de muestra. Solo se aplica si se activa esta cláusula; el depósito puede ser adicional.';
    case 'renewal':return 'Compromiso de pago si se pierde el plazo de aviso y se renueva el acuerdo. No es necesariamente una multa. Consulta el cálculo original para comprobar el plazo y el precio.';
    case 'fees':return 'Ejemplo de atraso: cargo inicial más cinco días adicionales al precio diario indicado. No es una predicción.';
    case 'stated':return 'Cargo o depósito expresamente indicado en la cláusula. Comprueba cuándo se cobra, si se repite y si puede aumentar.';
  }
}
export function scenarioTitle(scenario:ExposureScenario,language:Language){
  if(language==='en')return scenario.title;
  return {exit:'Salida anticipada',renewal:'Compromiso de renovación',fees:'Ejemplo de cargo por atraso',stated:'Cargo indicado'}[scenario.kind];
}
