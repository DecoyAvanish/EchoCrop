import type {Clause} from './data';

const spanish:Record<Clause['category'],{plain:string;cost:string;ask:string}>={
  Arbitration:{plain:'Renuncias al derecho de llevar la disputa ante un tribunal o participar en una demanda colectiva.',cost:'El arbitraje privado puede incluir tasas de presentación y honorarios del árbitro.',ask:'Pide que el arbitraje sea opcional después de que surja una disputa.'},
  'Auto-renewal':{plain:'El contrato puede renovarse y seguir cobrándote si no cancelas dentro del plazo.',cost:'Podrías quedar obligado a pagar otro período completo del contrato.',ask:'Pide un recordatorio previo y una forma sencilla de cancelar.'},
  Fees:{plain:'Esta cláusula añade cargos que pueden aumentar más allá del precio anunciado.',cost:'Los cargos pueden acumularse o aumentar sin un límite claro.',ask:'Pide un límite fijo, aviso previo y un período de gracia.'},
  'Data rights':{plain:'La cláusula concede derechos amplios sobre tus datos, tu actividad o tu trabajo.',cost:'Puedes perder privacidad o control sobre información y trabajo valiosos.',ask:'Limita los derechos a lo estrictamente necesario para prestar el servicio.'},
  Termination:{plain:'Terminar el acuerdo puede ser costoso o favorecer demasiado a la otra parte.',cost:'Podrías deber penalizaciones o perder ingresos esperados.',ask:'Pide aviso previo, tiempo para corregir el problema y una penalización limitada.'},
  'Entry rights':{plain:'La otra parte puede acceder a tu espacio con poco aviso.',cost:'El impacto principal es la pérdida de privacidad y posibles interrupciones.',ask:'Exige al menos 24 horas de aviso por escrito, salvo emergencias.'},
  Liability:{plain:'Podrías asumir responsabilidad por pérdidas demasiado amplias.',cost:'La responsabilidad financiera podría no tener límite.',ask:'Limita la responsabilidad a tu propia negligencia y establece un máximo.'},
  'Fair terms':{plain:'No se detectó un patrón común de alto riesgo en esta cláusula.',cost:'No se identificó un costo inusual directo.',ask:'Conserva esta cláusula y verifica los detalles importantes en contexto.'},
};

export function localizeClause(clause:Clause,language:'en'|'es'){
  if(language==='en')return{plain:clause.plainEnglish,cost:clause.costImpact,ask:clause.askInstead};
  const translated=spanish[clause.category];
  const figures=clause.numbers?.length?` Cifras mencionadas: ${clause.numbers.join(', ')}.`:'';
  return{plain:translated.plain,cost:translated.cost+figures,ask:translated.ask};
}
