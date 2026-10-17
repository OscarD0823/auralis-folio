import {PDFDocument,PDFName,PDFNumber} from 'pdf-lib';
export async function pdfPageSizes(bytes:Uint8Array):Promise<[number,number][]> {
  const doc=await PDFDocument.load(bytes);
  if(doc.isEncrypted)throw Error('Este PDF está protegido. Abre una copia sin contraseña.');
  return doc.getPages().map(page=>{
    const media=page.getMediaBox(),crop=page.getCropBox();
    const right=Math.min(media.x+media.width,crop.x+crop.width),bottom=Math.min(media.y+media.height,crop.y+crop.height);
    const rawWidth=right-Math.max(media.x,crop.x),rawHeight=bottom-Math.max(media.y,crop.y);
    const value=page.node.get(PDFName.of('UserUnit'));
    const unit=value instanceof PDFNumber&&value.asNumber()>0?value.asNumber():1;
    const width=(rawWidth>0&&rawHeight>0?rawWidth:media.width)*unit,height=(rawWidth>0&&rawHeight>0?rawHeight:media.height)*unit;
    return Math.abs(page.getRotation().angle)%180 ? [height,width] : [width,height];
  });
}
