import type {DocumentSample} from './data';

export type Page='home'|'intake'|'scan'|'report'|'learn';
export type Language='en'|'es';
export type Settings={reduced:boolean;contrast:boolean;light:boolean;large:boolean;dyslexic:boolean;language:Language};
export type Go=(page:Page,document?:DocumentSample)=>void;
