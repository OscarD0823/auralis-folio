import test from 'node:test';
import assert from 'node:assert/strict';
import {PDFDocument,degrees,PDFName,PDFNumber} from 'pdf-lib';
import {appendPdf,emptyWorkspace,buildPdf} from '../src/pdf';
import {pdfPageSizes} from '../src/pdf-metadata';

test('a 500-page PDF retains every page, mixed sizes and rotations through opening/export',async()=>{
  const pdf=await PDFDocument.create();
  for(let i=0;i<500;i++){
    const page=pdf.addPage(i%2?[842,595]:[595,842]);
    if(i%3===0)page.setRotation(degrees(90));
    page.drawText('Page '+(i+1),{x:40,y:80});
  }
  const bytes=await pdf.save(),workspace=await appendPdf(emptyWorkspace(),bytes,'500.pdf');
  assert.equal(workspace.pages.length,500);
  assert.equal(new Set(workspace.pages.map(p=>p.id)).size,500);
  assert.deepEqual(workspace.pages[0].size,[842,595]);
  assert.equal(workspace.pages.at(-1)!.index,499);
  assert.ok(workspace.pages.every(page=>!page.marks.length&&!page.textReady));
  assert.deepEqual(await buildPdf(workspace),bytes);
});
test('initial page placeholders match cropped, scaled and rotated viewports',async()=>{
  const pdf=await PDFDocument.create(),page=pdf.addPage([600,800]);
  page.setCropBox(20,40,300,500);page.setRotation(degrees(90));
  page.node.set(PDFName.of('UserUnit'),PDFNumber.of(2));
  assert.deepEqual(await pdfPageSizes(await pdf.save()),[[1000,600]]);
  await assert.rejects(pdfPageSizes(new Uint8Array([1,2,3])));
});
