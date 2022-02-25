const PDFDocument = require('./pdfkit.standalone');
const fs = require('fs');


const qrcode = require('qrcode');

const DATAMatrix = require('./datamatrix')

const SVGtoPDF = require('svg-to-pdfkit');

PDFDocument.prototype.addSVG = function (svg, x, y, options) {
    return SVGtoPDF(this, svg, x, y, options), this;
};


const filePath = './test.pdf';

async function main () {
    const pdf = new PDFDocument({size:'A4',margin:0});
    const dataurl = await qrcode.toDataURL('test url',{margin:0});    
    pdf.image(dataurl, 10, 10, { width: 100 });    

    const qrSize = 10;
    const svgText = DATAMatrix({msg:'hesasdf',dim:100,pad:0,rct:0,})
            

    pdf.addSVG(svgText,10,110,{assumePt:true});

    pdf.pipe(fs.createWriteStream(filePath));        
    pdf.text(`Batch Note: `, 500, 805 );    
    pdf.text(`Barcode ID:`);
    pdf.end();    
    return
}

main()
.then(() => console.log('Done'))
.catch(err => console.log(err));
