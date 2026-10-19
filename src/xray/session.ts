import type {DocumentSample} from './data';

const prefix='xray-tab:';
export function readSession<T>(key:string,fallback:T):T{
  try{const saved=sessionStorage.getItem(prefix+key);return saved?JSON.parse(saved) as T:fallback}catch{return fallback}
}
export function writeSession(key:string,value:unknown){
  try{sessionStorage.setItem(prefix+key,JSON.stringify(value));return true}catch{return false}
}
export function documentKey(doc:DocumentSample){
  let hash=2166136261;
  const content=doc.name+'|'+doc.type+'|'+doc.clauses.map(c=>c.originalText).join('|');
  for(let i=0;i<content.length;i++){hash^=content.charCodeAt(i);hash=Math.imul(hash,16777619)}
  return `${doc.id}-${(hash>>>0).toString(36)}`;
}
export function saveDocument(doc:DocumentSample){
  const id=documentKey(doc);
  return writeSession(`document:${id}`,doc)?id:null;
}
export function loadDocument(id:string|null):DocumentSample|null{
  if(!id)return null;
  const doc=readSession<DocumentSample|null>(`document:${id}`,null);
  return doc&&typeof doc.name==='string'&&Array.isArray(doc.clauses)&&doc.clauses.length?doc:null;
}
export function clearDocument(doc:DocumentSample){
  const id=documentKey(doc);
  try{for(let i=sessionStorage.length-1;i>=0;i--){const key=sessionStorage.key(i);if(key?.startsWith(prefix)&&key.includes(id))sessionStorage.removeItem(key)}}catch{}
}
