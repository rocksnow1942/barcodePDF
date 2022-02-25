import { ipcRenderer,shell } from 'electron';

import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Selection from './Selection';
import Box from '@mui/material/Box';
import { PaperSize, fonts} from '../util/defaults';

const PaperSizeOptions = Object.keys(PaperSize).map((key) => ({
  value:key,
  label:`${key} : (${Math.round(PaperSize[key][0]/72*100)/100}' x ${Math.round(PaperSize[key][1]/72*100)/100}')`,
}))
PaperSizeOptions.push({
  value:'custom',
  label:'Custom Paper Size'
})

const EditConfig = ({config,handleChange,para,gridSize})=> <Grid item xs={gridSize||4}>
{
  config.options ? 
  <Selection
  label={config.label}
  value={para[config.name]}
  onChange={handleChange}                
  name={config.name}   
  options={config.options}
  />
  :<TextField 
  label={config.label}
  type={typeof(para[config.name])==='number'?'number':'text'}
  value={para[config.name]}
  onChange={handleChange}
  name={config.name}   
  variant='filled'
  fullWidth 
 />
}
</Grid>


const TxtConfig = ({cfg,handleChange,index}) =>{
  const configs = [
    {name:'fontSize',label:'Font Size'},
    {name:'font',label:'Font',options:fonts},
    {name:'align',label:'Text Align',options:['center','left','right']},
    {name:'width',label:'Label Width'},
    {name:'y',label:'Position Top'},
    {name:'x',label:'Position Left'},

  ]
  return <Grid container spacing={1}>
    {
      configs.map(i=>(<EditConfig key={i.name} config={i} para={cfg} 
        handleChange={e=>{          
          handleChange({target:{
            value:e.target.value,
            type:e.target.type,
            name:`${index}_${e.target.name}`,
            }})}} 
        gridSize={2}/>))
    }
  </Grid>
}


export default function BadgeGrid ({
  config,setConfig,saveConfig
}) {

  const badgePresets = config.badge
  
  const [slot,setSlot] = useState(0)
  
  const [error,setError] = useState('')
  const [loading,setLoading] = useState(false)  
  const [needSave,setNeedSave] = useState(false)

  const badgePara = badgePresets[slot]

  const setPara = (dispatch)=>{
    const newConfig = dispatch(badgePara)
    const newBadgePresets = [...badgePresets]
    newBadgePresets[slot] = newConfig
    setConfig({...config,badge:newBadgePresets})
    setNeedSave(true)
 }
  
  const makePDF = () => {
    setError('')
    setLoading(true)
    ipcRenderer.invoke('makeBadge',badgePara)
    .then(res => {
      if (res.filePath){        
        shell.showItemInFolder(res.filePath)
        setError(`Saved barcode file to ${res.filePath}`)
      } else if (res.payload ==='Cancel') {
        setError('User Cancelled')
      }      
      setLoading(false)
    })
    .catch(err => {
      setLoading(false)
      setError(`Make PDF error: ${err}`)
    })
  }
 

  const handleChange = (e) => {    
    let value = e.target.value
    if (e.target.type === 'number'){
      value = parseFloat(value)
    }
    setPara(p=>({...p,[e.target.name]:value}))
  }
  
  const handleTxtChange = (e) => {
    let value = e.target.value
    console.log('text',value,e.target.type)
    if (e.target.type === 'number'){
      value = parseFloat(value)
    }
    setPara(p=>{
      let [idx,name] = e.target.name.split('_')
      idx = parseInt(idx)
      const txtCfg = p.txt[idx]
      const newTxtCfg = {...txtCfg,[name]:value}
      return {...p,txt:[...p.txt.slice(0,idx),newTxtCfg,...p.txt.slice(idx+1)]}
    })
  }

    
    return <><Grid container spacing={1}>
      <Grid item xs={4}>      
      <Selection
        label='Select Preset'
        value={slot}
        name='slot'
        onChange={e=>setSlot(e.target.value)}          
        options={badgePresets.map((p,idx)=>({label:`Preset ${idx+1}: ${p.desc}`,value:`${idx}`}))}
      />
      </Grid>


          {
            [              
              {name:'desc',label:'Preset Description'},
              {name:'cType',label:'Barcode Type',options:[{value:'datamatrix',label:'Data Matrix'},{value:'qrcode',label:'QR Code'}]},
              {name:'paperSize',label:'Paper Size (W x H)',options:PaperSizeOptions},              
            ].map((i,idx)=><EditConfig key={idx} config={i} handleChange={handleChange} para={badgePara}/>)
          }

          <Grid item xs={4}>
          <TextField 
            label='Custom Paper Width'
            type='number'
            disabled={badgePara.paperSize !=='custom'}
            value={badgePara.width}
            onChange={handleChange}
            name='width'
            variant='filled'
            fullWidth 
          />
          </Grid>
          <Grid item xs={4}>
          <TextField 
            label='Custom Paper Height'
            type='number'
            disabled={badgePara.paperSize !=='custom'}
            value={badgePara.height}
            onChange={handleChange}
            name='height'
            variant='filled'
            fullWidth 
          />
          </Grid>

          {
            [                            
              {name:'top',label:'Layout Top Margin'},
              {name:'left',label:'Layout Left Margin'},
              {name:'pWidth',label:'Badge Width'},
              {name:'pHeight',label:'Badge Height'},
              {name:'marginX',label:'Badge Spacing X'},
              {name:'marginY',label:'Badge Spacing Y'},
              {name:'cWidth',label:'QR Code Width'},
              {name:'cY',label:'2D Code Position Top'},
              {name:'cX',label:'2D Code Position Left'},              
            ].map((i,idx)=><EditConfig key={idx} config={i} handleChange={handleChange} para={badgePara}/>)
          } 
          {
            badgePara.txt.map((txtCfg,idx)=><Box key={idx} sx={{m:1,display:'flex',justifyContent:'space-around',alignItems:'center',width:'100%'}}>
              <Typography sx={{width:'4em'}}>
                Text {idx+1}
              </Typography>
              <TxtConfig cfg={txtCfg} handleChange={handleTxtChange} index={idx} />
            </Box>)
          }
        </Grid>      
        <Grid container spacing={1} sx={{mt:'1em',textAlign:'center'}}>
        <Grid item xs={6}>
            <Button sx={{}} variant='contained' disabled={loading}
            onClick={makePDF}>Generate Badge
            {loading && <CircularProgress size={24} sx={{position:'absolute'}}/>}
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button sx={{}} variant='contained'
            color={needSave?'primary':'inherit'}
            onClick={saveConfig(()=>setNeedSave(false))}>Save Settigns</Button>
          </Grid>
          </Grid>          
          {error && <Typography sx={{color:'red'}}>{error}</Typography>}
          </>
  }