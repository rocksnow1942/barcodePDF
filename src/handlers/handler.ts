import { ipcMain,app } from 'electron';
import electron from 'electron'
import path from 'path'
import {codeFormatter} from '../util/func'
import PDFDocument from '../util/pdfkit.standalone'
import DATAMatrix from '../util/datamatrix';
import SVGtoPDF from 'svg-to-pdfkit';
import fs from 'fs';
import qrcode from 'qrcode';
import { PaperSize,DEFAULT_CONFIG } from '../util/defaults';
import { dialog } from 'electron';
import dayjs from 'dayjs';

PDFDocument.prototype.addSVG = function (svg:string , x:number, y:number, options:SVGtoPDF.SVGtoPDFOptions) {
    return SVGtoPDF(this, svg, x, y, options), this;
};


interface Config {
    path:string,
    data: {
        [index:string]:any
    },
}

class Config {    
    constructor() {
        const userPath = electron.app.getPath('userData')        
        this.path = path.join(userPath,`BabaCoderSettings-${app.getVersion()}.json`)
        console.log('*** config path ***',this.path)
        
        try {
            const data =  JSON.parse(fs.readFileSync(this.path,'utf-8'))        
            this.data = {...data,file:this.path}
        } catch (error) {
            this.data = {...DEFAULT_CONFIG,file:this.path}
        }
    }
    get(key:string){
        return this.data[key]
    }
    set(key:string,data:any){       
        this.data[key] = data 
        fs.writeFileSync(this.path,JSON.stringify(this.data,null,2))
    }    
}
  
const config  = new Config()




export async function makePDF(filePath,para) {    
    const paperSize = para.paperSize || 'LETTER'
    const [pw,ph] = PaperSize[paperSize]
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