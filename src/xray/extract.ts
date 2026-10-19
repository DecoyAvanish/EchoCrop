import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

export type ExtractionResult={text:string;kind:'text'|'pdf'|'docx';pageCount?:number;imageOnly?:boolean};

export async function extractDocument(file:File):Promise<ExtractionResult>{
  const extension=file.name.split('.').pop()?.toLowerCase();
  if(file.size>10*1024*1024)throw new Error('That file is larger than 10 MB. Please choose a smaller document.');
  if(extension==='txt'||file.type==='text/plain')return{text:await file.text(),kind:'text'};
  if(extension==='docx'||file.type==='application/vnd.openxmlformats-officedocument.wordprocessingml.document'){
    const mammoth=await import('mammoth/mammoth.browser');
    const {value}=await mammoth.extractRawText({arrayBuffer:await file.arrayBuffer()});
    return{text:value.trim(),kind:'docx'};
  }
  if(extension==='pdf'||file.type==='application/pdf'){
    const {GlobalWorkerOptions,getDocument}=await import('pdfjs-dist');
    GlobalWorkerOptions.workerSrc=pdfWorker;
    const task=getDocument({data:new Uint8Array(await file.arrayBuffer())});
    const pdf=await task.promise;
    const pages:string[]=[];
    for(let pageNumber=1;pageNumber<=pdf.numPages;pageNumber++){
      const page=await pdf.getPage(pageNumber);
      const content=await page.getTextContent();
      pages.push(content.items.map(item=>'str'in item?item.str:'').join(' ').replace(/\s+/g,' ').trim());
    }
    const text=pages.filter(Boolean).join('\n\n').trim();
    return{text,kind:'pdf',pageCount:pdf.numPages,imageOnly:text.replace(/\s/g,'').length<20};
  }
  throw new Error('Unsupported file type. Choose a PDF, DOCX, or TXT file.');
}
