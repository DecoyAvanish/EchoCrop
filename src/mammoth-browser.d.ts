/** Mammoth ships types for its main entry but not this browser-only bundle. */
declare module 'mammoth/mammoth.browser' {
  export function extractRawText(input:{arrayBuffer:ArrayBuffer}):Promise<{
    value:string;
    messages:Array<{type:string;message:string}>;
  }>;
}
