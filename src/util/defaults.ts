import fs from 'fs';
import path from 'path';
import { app } from 'electron';
export const PaperSize = {
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
const RESOURCES_PATH = app?.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

export const fontPath = path.join(RESOURCES_PATH,'fonts')
let fontList = []
if (fs.existsSync(fontPath)) {    
    fontList = fs.readdirSync(fontPath).filter(f=>f.endsWith('.ttf') || f.endsWith('.otf'))    
}

export const fonts = [
'Courier',
'Courier-Bold',
'Courier-Oblique',
'Courier-BoldOblique',
'Helvetica',
'Helvetica-Bold',
'Helvetica-Oblique',
'Helvetica-BoldOblique',
'Times-Roman',
'Times-Bold',
'Times-Italic',
'Times-BoldItalic',
...fontList,
]

export const getTxtSetting = (index:number)=>({
    fontSize: [14,10,12][index] || 12,
    font: ['LeagueSpartan-Bold.otf','Courier-Oblique','Courier'][index] || 'Helvetica',
    width:1.925,
    align:'center',
    x: 0.1,
    y: [2,2.55,2.85][index] || -1,

})

const getBadgeSetting = ()=>({
    desc:'Default',
    // paper settings
    paperSize:'LETTER',
    top:0,
    left:0,
    width: 0,
    height:0,
    // pannel settings
    pWidth:2.125,
    pHeight:3.37,   
    marginX: 0,
    marginY: 0,
    cWidth: 1.5,
    cX: 0.3125,
    cY: 0.3125,
    cType:'qrcode',
    txt:Array.from({length:3},(_,i)=>getTxtSetting(i)),
})

export const DEFAULT_CONFIG = {
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
    badge: Array.from({length:10},()=>getBadgeSetting()),
}
