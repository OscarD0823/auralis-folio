import {pdfPageSizes} from './pdf-metadata';
self.onmessage=async({data})=>{
  try {self.postMessage({sizes:await pdfPageSizes(data)});}
  catch(error){self.postMessage({error:error instanceof Error?error.message:String(error)});}
};
