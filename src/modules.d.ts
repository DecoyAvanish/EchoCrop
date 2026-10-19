declare module 'three128'{export * from 'three';}
declare module 'mammoth/mammoth.browser'{
  export function extractRawText(input:{arrayBuffer:ArrayBuffer}):Promise<{value:string}>;
}
