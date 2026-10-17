import {pdfPageSizes} from './pdf-metadata';
export async function readPdfPages(bytes:Uint8Array):Promise<[number,number][]> {
  if(typeof Worker==='undefined')return pdfPageSizes(bytes);
  const worker=new Worker(new URL('./pdf-metadata.worker.ts',import.meta.url),{type:'module'});
  return new Promise((resolve,reject)=>{
    worker.onmessage=({data})=>{worker.terminate();data.error?reject(new Error(data.error)):resolve(data.sizes);};
    worker.onerror=()=>{worker.terminate();reject(Error('No se pudo leer la estructura del PDF.'));};
    const copy=bytes.slice();
    try{worker.postMessage(copy,[copy.buffer]);}catch(error){worker.terminate();reject(error);}
  });
}
