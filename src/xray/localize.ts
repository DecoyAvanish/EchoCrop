import type {Clause} from './data';

type Explanation={plain:string;cost:string;ask:string};

// Authored per sample, retaining the English explanation's amounts and deadlines.
const sampleSpanish:Record<string,Explanation>={
  l1:{plain:'La vivienda solo puede usarse como residencia privada.',cost:'No hay un costo inusual. Es una cláusula de uso residencial.',ask:'No hace falta cambiarla.'},
  l2:{plain:'Tu arrendador puede entrar con solo 12 horas de aviso.',cost:'Un aviso tan corto puede interrumpir tu trabajo, descanso o privacidad.',ask:'Pide al menos 24 horas de aviso por escrito, salvo en una emergencia.'},
  l3:{plain:'Renuncias al derecho de demandar a tu arrendador ante un tribunal o unirte a una demanda colectiva.',cost:'Las tasas de presentación y los honorarios del árbitro pueden hacer costosa una reclamación pequeña.',ask:'Elimina el arbitraje obligatorio o haz que sea opcional después de que surja una disputa.'},
  l4:{plain:'Un pago atrasado empieza con un cargo de $125 y aumenta $25 por cada día adicional.',cost:'Con diez días de atraso, los cargos serían $250 además de la renta.',ask:'Pide un límite para los cargos por atraso y un período de gracia por escrito.'},
  l5:{plain:'Salir antes de tiempo podría costarte tres meses de renta y la pérdida del depósito.',cost:'Con una renta de $2,450 al mes, la penalización indicada es de al menos $7,350 antes de sumar el depósito.',ask:'Pide un cargo de un mes de renta o permiso para encontrar a un inquilino que te reemplace.'},
  l6:{plain:'Deben devolverte el depósito en 30 días con una lista de cualquier deducción.',cost:'El plazo y el desglose te dan un registro que puedes revisar.',ask:'No hace falta cambiarla. Conserva fotos y la lista del estado de la vivienda al mudarte.'},
  l7:{plain:'El contrato se renueva por un año completo si no cancelas al menos 90 días antes.',cost:'Si se te pasa el plazo, podrías quedar obligado a pagar otro año de renta.',ask:'Pide una renovación mes a mes y un recordatorio con 30 días de anticipación.'},
  s1:{plain:'Seguirán cobrándote hasta que canceles, y debes hacerlo al menos 48 horas antes de la renovación.',cost:'Cada mes que no canceles cuesta $16.99.',ask:'Pide un recordatorio de renovación y que puedas cancelar hasta la fecha de facturación.'},
  s2:{plain:'Pueden compartir tu actividad y los intereses que deduzcan sobre ti para publicidad.',cost:'El costo es perder privacidad y control sobre la creación de perfiles.',ask:'Pide que compartir datos esté desactivado por defecto y se limite a prestar el servicio.'},
  s3:{plain:'No puedes demandar a la empresa ante un tribunal ni unirte a una demanda colectiva.',cost:'Un arbitraje individual puede costar más de lo que vale la reclamación.',ask:'Haz que el arbitraje sea opcional.'},
  s4:{plain:'Puedes cancelar en línea desde tu cuenta sin llamar a atención al cliente.',cost:'No hay un costo inusual.',ask:'Conserva esta condición.'},
  f1:{plain:'La empresa reclama la propiedad de todo lo que crees durante el contrato, incluso trabajos que no estén relacionados.',cost:'Podrías perder derechos sobre proyectos personales o herramientas reutilizables.',ask:'Limita la cesión a entregables pagados y creados específicamente para este proyecto.'},
  f2:{plain:'Podrías tener que pagar pérdidas y gastos legales de la empresa sin límite.',cost:'No se establece un límite económico a tu responsabilidad.',ask:'Limita la responsabilidad a los honorarios pagados según el contrato.'},
  f3:{plain:'La empresa puede terminar el trabajo de inmediato y por cualquier motivo.',cost:'Podrías perder ingresos previstos sin tiempo para buscar otro trabajo.',ask:'Pide 14 días de aviso y el pago del trabajo ya comprometido.'},
  g1:{plain:'La membresía se renueva por un año y exige cancelar en persona con 60 días de anticipación.',cost:'Otro año a $69 al mes costaría $828.',ask:'Permite cancelar en línea en cualquier momento con 30 días de aviso.'},
  g2:{plain:'Hay un cargo anual de $149 para instalaciones que puede aumentar sin aviso.',cost:'Son $149 ahora, sin límite para futuros aumentos.',ask:'Fija un máximo y exige aviso previo.'},
  g3:{plain:'Puedes pausar la membresía por razones médicas documentadas sin pagar.',cost:'Es una protección favorable para el miembro.',ask:'No hace falta cambiarla.'},
};

const spanish:Record<Clause['category'],Explanation>={
  Arbitration:{plain:'Esta cláusula exige arbitraje privado o limita los derechos a acudir a un tribunal o participar en una demanda colectiva.',cost:'El arbitraje puede incluir tasas de presentación y honorarios del árbitro.',ask:'Pide que el arbitraje sea opcional después de que surja una disputa y conserva el acceso a los tribunales.'},
  'Auto-renewal':{plain:'El contrato puede renovarse y seguir cobrándote si no cancelas dentro del plazo.',cost:'Podrías quedar obligado a pagar otro período completo.',ask:'Pide un recordatorio previo y una forma sencilla de cancelar.'},
  Fees:{plain:'Esta cláusula añade cargos al precio anunciado.',cost:'Los cargos pueden repetirse o acumularse. Revisa las cantidades exactas en el texto original.',ask:'Pide que todos los cargos estén indicados, tengan un límite y un período de gracia.'},
  'Data rights':{plain:'La cláusula concede derechos amplios sobre tus datos o la propiedad de tu trabajo.',cost:'Puedes perder privacidad o control sobre información y trabajo valiosos.',ask:'Limita el uso de datos a prestar el servicio y la cesión de trabajo a entregables identificados y pagados.'},
  Termination:{plain:'Terminar el acuerdo puede ser costoso o favorecer demasiado a la otra parte.',cost:'Podrías deber penalizaciones o perder ingresos esperados.',ask:'Pide aviso previo, tiempo para corregir el problema y una penalización limitada.'},
  'Entry rights':{plain:'La otra parte puede acceder a tu espacio, posiblemente con poco aviso.',cost:'El impacto principal es la pérdida de privacidad y las interrupciones.',ask:'Exige al menos 24 horas de aviso por escrito, salvo emergencias.'},
  Liability:{plain:'Esta cláusula puede trasladarte pérdidas o limitar mucho lo que puedes recuperar.',cost:'Tu responsabilidad y la de la otra parte pueden estar desequilibradas.',ask:'Pide límites recíprocos razonables y conserva recursos ante fraude o conducta deliberada.'},
  'Fair terms':{plain:'Una regla reconoce una protección concreta en esta cláusula.',cost:'Esta protección solo se refiere al texto identificado; revisa el resto del acuerdo.',ask:'Conserva la protección y verifica sus condiciones.'},
  'Unilateral changes':{plain:'La otra parte puede cambiar las condiciones después de que aceptes el acuerdo.',cost:'Podrían aplicarse nuevas obligaciones sin un nuevo consentimiento.',ask:'Pide aviso previo, consentimiento expreso y la posibilidad de salir sin penalización.'},
  'Non-compete':{plain:'Esta restricción puede limitar dónde trabajas o a qué clientes puedes contactar.',cost:'Su duración y alcance pueden reducir tus ingresos futuros.',ask:'Elimina la restricción o limita claramente su plazo, alcance y clientes afectados.'},
  'Non-refundable charges':{plain:'El dinero pagado podría no devolverse aunque canceles o no uses el servicio.',cost:'Podrías perder el depósito, el anticipo o el saldo pagado por adelantado.',ask:'Pide un reembolso proporcional por servicios no utilizados y deducciones justificadas.'},
  'Venue and law':{plain:'La cláusula elige dónde presentar una disputa o qué ley se aplica.',cost:'Un tribunal lejano puede aumentar los gastos de viaje y de representación.',ask:'Pide un tribunal accesible y conserva las protecciones obligatorias para consumidores o trabajadores.'},
  'Price increases':{plain:'La otra parte puede aumentar el precio o la renta sin un límite o aviso claros.',cost:'Los pagos futuros pueden superar el precio que aceptaste.',ask:'Fija el precio durante el plazo actual y exige aviso y derecho a cancelar antes de un aumento.'},
  'Content license':{plain:'Concedes permiso amplio o duradero para usar tu contenido sin pagarte.',cost:'Podrías perder control sobre su reutilización, distribución o eliminación.',ask:'Limita la licencia a prestar el servicio, conserva la propiedad y exige que termine al eliminar el contenido.'},
  Cancellation:{plain:'Cancelar exige un paso adicional, como llamar o acudir en persona.',cost:'Un proceso difícil puede causar cobros adicionales que no deseas.',ask:'Permite cancelar en línea por el mismo medio usado para contratar, antes del siguiente cobro.'},
  Confidentiality:{plain:'La cláusula puede limitar opiniones honestas, reclamaciones o la comunicación de problemas.',cost:'Podrían amenazarte con una penalización por hablar de tu experiencia.',ask:'Protege las opiniones honestas y las comunicaciones con asesores, autoridades y destinatarios protegidos por ley.'},
  'Personal guarantee':{plain:'Podrías tener que pagar las deudas del negocio con tu propio dinero o bienes.',cost:'La obligación personal puede superar el precio del contrato.',ask:'Elimina la garantía personal o establece un importe máximo, una fecha final y condiciones de liberación.'},
  'Notice waiver':{plain:'Puedes estar renunciando a recibir aviso o a responder antes de una medida en tu contra.',cost:'Tendrías menos tiempo para corregir un impago o disputar una reclamación.',ask:'Conserva los avisos obligatorios y un plazo razonable para responder o corregir un incumplimiento.'},
  Assignment:{plain:'El contrato puede transferirse a otra parte sin tu aprobación.',cost:'Podrías tener que tratar con alguien que no ofrece las mismas garantías.',ask:'Exige aviso y consentimiento cuando la transferencia afecte tus derechos o el servicio.'},
  'Not flagged':{plain:'Ninguna regla de riesgo ni de protección concreta reconoció este texto. Aún debes revisarlo.',cost:'No hay una estimación de costos para una condición no reconocida.',ask:'Lee el contexto y pregunta por obligaciones, límites o costos que no estén claros.'},
};

export function localizeClause(clause:Clause,language:'en'|'es'):Explanation{
  if(language==='en')return{plain:clause.plainEnglish,cost:clause.costImpact,ask:clause.askInstead};
  const authored=sampleSpanish[clause.id];
  if(authored)return authored;
  const translated=spanish[clause.category]||spanish['Not flagged'];
  const figures=clause.numbers?.length?` Cifras del texto original: ${clause.numbers.join(', ')}.`:'';
  return{plain:translated.plain,cost:translated.cost+figures,ask:translated.ask};
}
