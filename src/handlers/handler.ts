import { ipcMain,app } from 'electron';
import electron from 'electron'
import path from 'path'
import {codeFormatter} from '../util/func'
// const PDFDocument = require('./pdfkit.standalone');
import PDFDocument from '../util/pdfkit.standalone'
import DATAMatrix from '../util/datamatrix';
// const SVGtoPDF = require('svg-to-pdfkit');
import SVGtoPDF from 'svg-to-pdfkit';
import fs from 'fs';
import qrcode from 'qrcode';

import { dialog } from 'electron';
import dayjs from 'dayjs';

PDFDocument.prototype.addSVG = function (svg, x, y, options) {
    return SVGtoPDF(this, svg, x, y, options), this;
};

const DEFAULT = {
    grid : {code: 'YYMMDD-****-[001]',
    mt: 15,
    mr: 15,
    ml: 15,
    mb: 15,
    gx: 9,
    gy: 13,
    qx: 0.15,
    qy: 0.1,
    qs: 0.7,
    lx: 0.12,
    ly: 0.84,
    ls:6,
    font: 'Helvetica',
    label: '730-00008 RevA',
    paperSize:'A4',
    type:'qrcode'},
    badge: [
        {
            slot:'Custom Style 1',
        },        
    ]
}

function getConfigFromFile (file){
    try {
        const data =  JSON.parse(fs.readFileSync(file,'utf-8'))        
        return {...data,file}
    } catch (error) {
        return {...DEFAULT,file}
    }
}


class Config {
    
    constructor() {
        const userPath = electron.app.getPath('userData')        
        this.path = path.join(userPath,`BabaCoderSettings-${app.getVersion()}.json`)
        console.log('*** config path ***',this.path)
        this.data = getConfigFromFile(this.path)
    }
    get(key){
        return this.data[key]
    }
    set(key,data){       
        this.data[key] = data 
        fs.writeFileSync(this.path,JSON.stringify(this.data,null,2))
    }    
}
  
const config  = new Config()


const PaperSize = {
A0 : [2383.94 ,3370.39],
A1 : [1683.78 ,2383.94],
A2 : [1190.55 ,1683.78],
A3 : [841.89 ,1190.55],
A4 : [595.28, 841.89],
A5 : [419.53, 595.28],
A6 : [297.64, 419.53],
A7 : [209.76, 297.64],
A8 : [147.40, 209.76],
A9 : [104.88, 147.40],
A10: [73.70, 104.88],
B0        :[2834.65 , 4008.19],
B1        :[2004.09 , 2834.65],
B2        :[1417.32 , 2004.09],
B3        :[1000.63 , 1417.32],
B4        :[708.66  , 1000.63],
B5        :[498.90  , 708.66],
B6        :[354.33  , 498.90],
B7        :[249.45  , 354.33],
B8        :[175.75  , 249.45],
B9        :[124.72  , 175.75],
B10       :[87.87   , 124.72],
C0        :[2599.37 , 3676.54],
C1        :[1836.85 , 2599.37],
C2        :[1298.27 , 1836.85],
C3        :[918.43  , 1298.27],
C4        :[649.13  , 918.43],
C5        :[459.21  , 649.13],
C6        :[323.15  , 459.21],
C7        :[229.61  , 323.15],
C8        :[161.57  , 229.61],
C9        :[113.39  , 161.57],
C10       :[79.37   , 113.39],
RA0       :[2437.80 , 3458.27],
RA1       :[1729.13 , 2437.80],
RA2       :[1218.90 , 1729.13],
RA3       :[864.57  , 1218.90],
RA4       :[609.45  , 864.57],
SRA0      :[2551.18 , 3628.35],
SRA1      :[1814.17 , 2551.18],
SRA2      :[1275.59 , 1814.17],
SRA3      :[907.09  , 1275.59],
SRA4      :[637.80  , 907.09],
EXECUTIVE :[521.86  , 756.00],
LEGAL     :[612.00  , 1008.00],
LETTER    :[612.00  , 792.00],
TABLOID   :[792.00  , 1224.00],
FOLIO     :[612.00  , 936.00],
}


export async function makePDF(filePath,para) {    
    const paperSize = para.paperSize || 'A4'
    const [pw,ph ] = PaperSize[paperSize]
    const code = para.code
    const mt = parseFloat(para.mt)  // margin top
    const mr = parseFloat(para.mr)  // margin right
    const mb = parseFloat(para.mb)  // margin bottom
    const ml = parseFloat(para.ml)  // margin left
    const gx = parseInt(para.gx)    // grid x count
    const gy = parseInt(para.gy)    // grid y count
    const qx = parseFloat(para.qx)  // QR code X position, 0.0 - 1.0
    const qy = parseFloat(para.qy)  // QR code Y postion, 0.0 - 1.0
    const qs = parseFloat(para.qs)  // QR code size, 0.0 - 1.0, ratio of the grid width or gird height, whichever is the smaller one
    const lx = parseFloat(para.lx)  // Label X position, 0.0 - 1.0
    const ly = parseFloat(para.ly)  // Label Y position, 0.0 - 1.0
    const ls = parseInt(para.ls)    // Label size, 0 - 9
    const font = para.font || 'Helvetica' // font name
    const label = para.label || ''
    const type = para.type || 'qrcode'
    

    const gridSizeX = (pw-ml-mr) / gx
    const gridSizeY = (ph-mt-mb) / gy
    const qrSize = Math.min(gridSizeX,gridSizeY) * qs


    const pdf = new PDFDocument({size:paperSize,margin:0});
    pdf.pipe(fs.createWriteStream(filePath));
    // draw grid first
    for (let i = 0; i <= gx; i++) {
        pdf.lineWidth(0.1)
        pdf.moveTo(ml+i*gridSizeX,mt)
        pdf.lineTo(ml+i*gridSizeX,ph-mb)
        pdf.stroke()
    }
    for (let i = 0; i <= gy; i++) {
        pdf.lineWidth(0.1)
        pdf.moveTo(ml,mt+i*gridSizeY)
        pdf.lineTo(pw-mr,mt+i*gridSizeY)
        pdf.stroke()
    }

    pdf.fontSize(ls)
    pdf.font(font)
    let x,y;
    const barcodes = []
    for (let j=0; j<gy; j++){
        for (let i=0; i<gx; i++){
             x = ml + i * gridSizeX
             y = mt + j * gridSizeY
             const id = codeFormatter(code, j*gx + i)
             barcodes.push(id)
                if (type === 'qrcode'){
                    const qr = await qrcode.toDataURL(id,{margin:0,scale:12});
                    pdf.image(qr,x+gridSizeX*qx,y+gridSizeY*qy,{width:qrSize})
                } else if (type === 'datamatrix'){ 
                    const svgText = DATAMatrix({msg:id,dim:qrSize,pad:0,rct:0})
                    pdf.addSVG(svgText,x+gridSizeX*qx,y+gridSizeY*qy,{assumePt:true})
                }             
            pdf.text(label || id,x+gridSizeX*lx,y+gridSizeY*ly)
        }
    }
    pdf.text(`Created At: ${dayjs().format('MM/DD/YYYY HH:mm:ss')}`,pw/2 - 10,ph - mb + 2);
    pdf.end();
    fs.writeFileSync(filePath+'.csv',"Barcodes\n"+barcodes.join('\n'))
}



ipcMain.handle('makePDF',async (e,para)=>{
    const { filePath } = await dialog.showSaveDialog({
        title: 'Export QR Code PDF',
        filters: [{ name: 'pdf file', extensions: ['pdf'] }],
        defaultPath: `QR-Code-${dayjs().format('YYYY_MM_DD_HH_mm_ss')}`,
        properties: ['showOverwriteConfirmation', 'createDirectory'],
        message:'Save QR code pdf'
    });
    if (filePath) {
        await makePDF(filePath,para)
        return {filePath}
    } else {
        return {payload:'Cancel'}
    }
})

ipcMain.handle('setConfig', async (e,key,data)=>{    
    config.set(key,data)
    return null
})

ipcMain.handle('getConfig', async (e,key:string)=>{
    return config.get(key)
})