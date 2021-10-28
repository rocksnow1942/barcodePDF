import { MemoryRouter as Router, Switch, Route } from 'react-router-dom';
import './App.css';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { ipcRenderer,shell } from 'electron';

import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import electron from 'electron'
import path from 'path'
import fs from 'fs'
import { useEffect,useState } from 'react';
import Box from '@mui/material/Box';

import dayjs from 'dayjs'


import {codeFormatter} from '../util/func'
import { Typography } from '@mui/material';


const Link = ({children}) => {
  return <span onClick={()=>{shell.openExternal(children)}}
  style = {{textDecoration:'underline', cursor:'pointer', color:'blue'}}>
    {children}
  </span> 
}



const Main = () => {
  const [para,setPara] = useState({})
  const [sampleCode,setSampleCode] = useState('')
  const [error,setError] = useState('')

  const makePDF = (para) => {
    ipcRenderer.invoke('makePDF',para)
    .then(res => {
      shell.openPath(res.filePath)
      shell.showItemInFolder(res.filePath)
    })
    .catch(err => {
      setError(`Make PDF error: ${err}`)
    })
  }

  useEffect(() => {
    ipcRenderer.invoke('getConfig')
    .then(res => {
      setPara(res)
    })
    .catch(err => {
      setError(`getConfig Error: ${err}`)
    })
  },[])

  useEffect(() => {    
    ipcRenderer.invoke('setConfig',JSON.parse(JSON.stringify(para)))
    .then(res => {      
    })
    .catch(err => {
      setError(`setConfig Error: ${err}`)
    } )
  },[para])

  const handleChange = (e) => {
    setPara(p=>({...p,[e.target.name]:e.target.value}))
    
  }
  console.log(para)

  return (
    <Box sx={{m:'1em'}}>
      <Box sx={{p:'0em 1em 1em'}}>
      <Typography sx={{mt:'1em'}}>Barcode Generator v0.0.1</Typography>
      <Typography variant='subtitle2'> Code Format: use X for random char, 
      Use Dayjs Format String for date:
      <Link>https://day.js.org/docs/en/display/format</Link>
      </Typography>      
      <Typography variant='subtitle2'>Paper size definition: <Link>https://pdfkit.org/docs/paper_sizes.html</Link></Typography>
      <Typography variant='subtitle2'>Supported Font: <Link>https://pdfkit.org/docs/text.html#fonts</Link></Typography>
    </Box>
      <Grid container spacing={1}>
        {
          [
            {name:'code',label:'Code Format'},
            {name:'mt',label:'Margin Top'},
            {name:'mb',label:'Margin Bottom'},
            {name:'ml',label:'Margin Left'},
            {name:'mr',label:'Margin Right'},                        
            {name:'gx',label:'Grid X Count'},
            {name:'gy',label:'Grid Y Count'},
            {name:'qx',label:'QRCode X Position'},
            {name:'qy',label:'QRCode Y Position'},
            {name:'qs',label:'QRCode Size'},
            {name:'lx',label:'Label X Position'},
            {name:'ly',label:'Label Y Position'},
            {name:'ls',label:'Label Font Size'},
            {name:'font',label:'Label Font'},
            {name:'label',label:'Label Text'},
            {name:'paperSize',label:'Paper Size'},

          ].map(i=>(<Grid key={i.name} item xs={4}>
            <TextField 
              label={i.label}
              value={para[i.name] || ''}
              onChange={handleChange}
              name={i.name}   
              variant='filled'
              fullWidth 
             />
          </Grid>))
        }              
        
      </Grid>      
      <Grid container spacing={1} sx={{mt:'1em',textAlign:'center'}}>
      <Grid item xs={6}>
          <Button sx={{}} variant='contained'
          onClick={()=>makePDF(para)}>Generate Barcode PDF</Button>
        </Grid>
        <Grid item xs={6}>
          <Button sx={{}} variant='contained'
          onClick={
            () => {
              setSampleCode(codeFormatter(para.code))
            }
          }>Generate Sample Code</Button>
        </Grid>
        </Grid>
        <Typography sx={{mt:'1em'}}>Sample QR Code Text: {sampleCode}</Typography>
        {error && <Typography sx={{color:'red'}}>{error}</Typography>}

    </Box>
  );
};

export default function App() {
  return (
    <Router>
      <Switch>
        <Route path="/" component={Main} />
      </Switch>
    </Router>
  );
}
