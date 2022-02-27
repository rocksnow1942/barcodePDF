import { ipcMain,app } from 'electron';
import electron from 'electron'
import path from 'path'
import fs from 'fs';
import { DEFAULT_CONFIG, fontPath,fonts } from '../util/defaults';
import { dialog } from 'electron';
import dayjs from 'dayjs';
import {parseCsv} from '../util/csvParser'
import {makePDFGrid,makePDFBadge} from '../util/pdfMaker'

 


interface Config {
    path:string,
    data: {
        [index:string]:any
    },    
}

class Config {
    constructor() {
        const userPath = electron.app.getPath('userData')        
        const version = app.getVersion() 
        const name = app.getName()
        this.path = path.join(userPath,`BadgerSettings-${version}.json`)
        
        try {
            const data =  JSON.parse(fs.readFileSync(this.path,'utf-8'))
            this.data = {...data,file:this.path,version,name}
        } catch (error) {
            this.data = {...DEFAULT_CONFIG,file:this.path,version,name}
            fs.writeFileSync(this.path,JSON.stringify(this.data,null,2))    
        }
    }
    get(){
        return this.data
    }
    set(data:any){       
        this.data = data 
        fs.writeFileSync(this.path,JSON.stringify(this.data,null,2))
    }
}
  
const config  = new Config()



ipcMain.handle('makePDF',async (e,para)=>{
    const { filePath } = await dialog.showSaveDialog({
        title: 'Export QR Code PDF',
        filters: [{ name: 'pdf file', extensions: ['pdf'] }],
        defaultPath: `QR-Code-${dayjs().format('YYYY_MM_DD_HH_mm_ss')}`,
        properties: ['showOverwriteConfirmation', 'createDirectory'],
        message:'Save QR code pdf'
    });
    if (filePath) {
        await makePDFGrid(filePath,para)
        return {filePath}
    } else {
        return {payload:'Cancel'}
    }
})

ipcMain.handle('makeBadge',async (e,para)=>{
    const {filePaths} = await dialog.showOpenDialog({
        title: 'Select CSV file',
        filters: [{ name: 'csv file', extensions: ['csv'] }],        
    })        
    if (filePaths.length > 0) {
        const filePath = filePaths[0]
        const rows = (await parseCsv(filePath)).filter(row=>row && Object.values(row).some(Boolean))
        let currentProgress = 0
        await makePDFBadge(rows,para,filePath+'.pdf',(progress)=>{
            if (progress - currentProgress > 0.01) {
                currentProgress = progress
                e.sender.send('makeBadgeProgress',progress)
            }
            
        })
        return {filePath:filePath+'.pdf'}
    } else {
        return {payload:'Cancel'}
    }
})

ipcMain.handle('choose-file',async (e,filters)=>{
    const {filePaths} = await dialog.showOpenDialog({
        title: 'Select Image file',
        filters: filters,
    })        
    if (filePaths.length > 0) {
        const filePath = filePaths[0]        
        return filePath
    } else {
        return ''
    }
})



ipcMain.handle('setConfig', async (e,data)=>{    
    config.set(data)
    return null
})

ipcMain.handle('getConfig', async (e)=>{
    return {config:config.get(),fontPath,fonts}
})