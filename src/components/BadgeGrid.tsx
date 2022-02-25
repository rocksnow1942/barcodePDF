import { ipcRenderer,shell } from 'electron';

import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { useEffect,useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import {codeFormatter} from '../util/func'
import Selection from './Selection';
 

export default function BadgeGrid () {

  const [para,setPara] = useState({})
  const [sampleCode,setSampleCode] = useState(-1)
  const [error,setError] = useState('')
  const [loading,setLoading] = useState(false)
  
  const makePDF = (para) => {
    setError('')
    setLoading(true)
    ipcRenderer.invoke('makePDF',para)
    .then(res => {
      if (res.filePath){
        shell.openPath(res.filePath)
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

  useEffect(() => {    
    ipcRenderer.invoke('getConfig','grid')
    .then(res => {
      setPara(res)
    })
    .catch(err => {
      setError(`getConfig Error: ${err}`)
    })
  },[])

  useEffect(() => {    
    ipcRenderer.invoke('setConfig','grid',para)
    .then(res => {      
        setError('')
    })
    .catch(err => {
      setError(`setConfig Error: ${err}`)
    } )
  },[para])

  const handleChange = (e) => {
    setPara(p=>({...p,[e.target.name]:e.target.value}))
    setSampleCode(-1)
  }  

    
    return <><Grid container spacing={1}>
          {
            [
              {name:'code',label:'Code Format'},
              {name:'gy',label:'Grid Row Count'},
              {name:'gx',label:'Grid Column Count'},            
              {name:'mt',label:'Paper Margin Top'},
              {name:'mb',label:'Paper Margin Bottom'},
              {name:'ml',label:'Paper Margin Left'},
              {name:'mr',label:'Paper Margin Right'},            
              {name:'qx',label:'QRCode X Position'},
              {name:'qy',label:'QRCode Y Position'},
              {name:'qs',label:'QRCode Size'},
              {name:'lx',label:'Label X Position'},
              {name:'ly',label:'Label Y Position'},
              {name:'ls',label:'Label Font Size'},
              {name:'font',label:'Label Font'},
              {name:'label',label:'Label Text'},
              {name:'paperSize',label:'Paper Size'},
              {name:'type',label:'Barcode Type',options:[{value:'datamatrix',label:'Data Matrix'},{value:'qrcode',label:'QR Code'}]}
            ].map(i=>(<Grid key={i.name} item xs={4}>
              {
                i.options ? 
                <Selection
                label={i.label}
                value={para[i.name] || ''}
                onChange={handleChange}
                name={i.name}   
                options={i.options}
                />
                :<TextField 
                label={i.label}
                value={para[i.name] || ''}
                onChange={handleChange}
                name={i.name}   
                variant='filled'
                fullWidth 
               />
              }
            </Grid>))
          }              
          
        </Grid>      
        <Grid container spacing={1} sx={{mt:'1em',textAlign:'center'}}>
        <Grid item xs={6}>
            <Button sx={{}} variant='contained' disabled={loading}
            onClick={()=>makePDF(para)}>Generate Barcode PDF
            {loading && <CircularProgress size={24} sx={{position:'absolute'}}/>}
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button sx={{}} variant='contained'
            onClick={
              () => {
                setSampleCode(sampleCode+1)
              }
            }>Generate Sample Code</Button>
          </Grid>
          </Grid>
          {sampleCode >=0 && <Typography sx={{mt:'1em'}}>Sample QR Code Text: {codeFormatter(para.code,sampleCode)}</Typography>}
          {error && <Typography sx={{color:'red'}}>{error}</Typography>}
          </>
  }