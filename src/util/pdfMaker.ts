
import fs from 'fs';
import qrcode from 'qrcode';
import PDFDocument from './pdfkit.standalone'
import DATAMatrix from './datamatrix';
import SVGtoPDF from 'svg-to-pdfkit';
import {codeFormatter} from './func'
import {PaperSize} from './defaults'
    

PDFDocument.prototype.addSVG = function (svg, x, y, options) {
    return SVGtoPDF(this, svg, x, y, options), this;
};



export async function makePDFGrid(filePath,para) {    
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



export async function makePDFBadge (gridData,config,outputPath) {
    const PPI = 72 // all values in config are in inches. this is PS pixels per inch
    Object.keys(config).forEach(key => {
        if (typeof config[key] ==='number') {
            config[key] = config[key] * PPI
        }
    })
    const paperConfig = {size:config.paperSize,margin:0}
    const paperSize = {w:0,h:0}
    if (config.paperSize === 'custom') {
        paperConfig.size = [config.width, config.height]
        paperSize.w = config.width
        paperSize.h = config.height
    } else {
        paperSize.w = PaperSize[config.paperSize][0]
        paperSize.h = PaperSize[config.paperSize][1]
    }

    const pdf = new PDFDocument(paperConfig);
        
    const {top,left,pWidth,pHeight,marginX,marginY,cWidth,cX,cY,cType,txt} = config
    
    let drawX = left;
    let drawY = top;
    


    for (let gData of gridData) {                
        // draw grid:
        pdf.lineWidth(0.1)
        pdf.rect(drawX,drawY,pWidth,pHeight)
            .stroke()

        // draw qr code:
        if (cType === 'qrcode'){            
            const qr = await qrcode.toDataURL(gData.code,{margin:0,scale:12});            
            pdf.image(qr,drawX + cX, drawY + cY ,{width:cWidth})
        } else if (cType === 'datamatrix'){ 
            const svgText = DATAMatrix({msg:gData.code,dim:cWidth,pad:0,rct:0})
            pdf.addSVG(svgText,drawX + cX,drawY + cY,{assumePt:true})
        }

        // draw text:
        txt.forEach((cfg,idx)=>{
            const {x,y,fontSize,font,width,align} = cfg
            const text = gData[`t${idx+1}`]
            if (x>=0 && y>=0 && text) {
                pdf.font(font)
                   .fontSize(fontSize)
                   .text(text,drawX + x*PPI,drawY + y*PPI,{
                        width:width*PPI,
                        align:align
                   })
            }

        })

        // move to next grid:
        drawX += pWidth + marginX        
        if (drawX + pWidth > paperSize.w) {
            drawX = left
            drawY += pHeight + marginY
        }
        if (drawY + pHeight > paperSize.h) {
            if (gridData.indexOf(gData) !== gridData.length-1) {
                pdf.addPage(paperConfig)
                drawY = top
            }            
        }
    }
    
    pdf.pipe(fs.createWriteStream(outputPath))
    pdf.end()    
}

 