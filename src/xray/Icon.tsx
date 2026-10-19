type IconName='upload'|'scan'|'check'|'gavel'|'shield'|'refresh'|'door'|'document'|'data'|'edit'|'lock';
const paths:Record<IconName,string>={
 upload:'M12 16V3m-5 5 5-5 5 5M4 15v6h16v-6',
 scan:'M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5M3 12h18',
 check:'m5 12 4 4L19 6',
 gavel:'m7 4 8 8m-5-11 8 8-3 3-8-8 3-3m1 10-7 7m-2 3h12',
 shield:'m12 2 9 4v6c0 5-9 10-9 10S3 17 3 12V6l9-4m-4 10 3 3 5-6',
 refresh:'M20 7a9 9 0 0 0-15-2L2 8m0-6v6h6m-4 9a9 9 0 0 0 15 2l3-3m0 6v-6h-6',
 door:'M4 22V3h13v19M8 3l9-2v21H8V3m5 9h1m3 0h5m-2-2 2 2-2 2',
 document:'M5 2h10l4 4v16H5V2m9 0v5h5M8 11h8m-8 4h8m-8 4h5',
 data:'M12 3c5 0 9 2 9 4s-4 4-9 4-9-2-9-4 4-4 9-4M3 7v10c0 2 4 4 9 4s9-2 9-4V7M3 12c0 2 4 4 9 4s9-2 9-4',
 edit:'m15 3 6 6-12 12H3v-6L15 3m-3 3 6 6',
 lock:'M7 10V7a5 5 0 0 1 10 0v3M4 10h16v12H4V10m8 5v3',
};
export function Icon({name,className}:{name:IconName;className?:string}){return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]}/></svg>}
