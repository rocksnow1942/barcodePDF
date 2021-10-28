const PDFDocument = require('./pdfkit.standalone');
const fs = require('fs');
const filePath = './test.pdf';

const qrcode = require('qrcode');




async function main () {
    const pdf = new PDFDocument({size:'A4',margin:0});
    const dataurl = await qrcode.toDataURL('test url',{margin:0});    
    pdf.image(dataurl, 0, 841, { width: 595.28 });    
    pdf.pipe(fs.createWriteStream(filePath));    
    pdf.text(`Batch External ID:`,0.4, 0.4, {});
    pdf.text(`Batch Note: `, 500, 805 );    
    pdf.text(`Barcode ID:`);
    pdf.end();    
    return
}

main()
.then(() => console.log('Done'))
.catch(err => console.log(err));
