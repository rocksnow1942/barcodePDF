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
import { useEffect,useState } from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import {codeFormatter} from '../util/func'

import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';


const Selection = ({label,name,onChange,value,options}) => {
  return <FormControl variant="filled" fullWidth>
  <InputLabel >{label}</InputLabel>
  <Select
    name={name}    
    value={value}
    onChange={onChange}
  >
    {
      options.map((option,idx) => <MenuItem key={idx} value={option.value || option}>{option.label || option}</MenuItem>)
    }        
  </Select>
</FormControl>
}

const Link = ({children}) => {
  return <span onClick={()=>{shell.openExternal(children)}}
  style = {{textDecoration:'underline', cursor:'pointer', color:'blue'}}>
    {children}
  </span> 
}
const UserHelp = ()=>{
  return <Box sx={{m:'0.5em'}}>
    <Typography variant='subtitle2'>&diams; Code Format:</Typography>
      <Typography variant='subtitle2' component='li' sx={{marginLeft:'1em'}}>Use Dayjs Format String for date:<Link>https://day.js.org/docs/en/display/format</Link></Typography>      
      <Typography variant='subtitle2' component='li' sx={{marginLeft:'1em'}}>For random characters: use * for [A-Za-z0-9], ? for [A-Z0-9], # for [0-9], @ for [A-Za-z], % for [A-Z], & for [a-z].</Typography>
      <Typography variant='subtitle2' component='li' sx={{marginLeft:'1em'}}>Use [ ] for auto-incremental number. [0123] starts at 0123. At most one incremental field is allowed.</Typography>
      <Typography variant='subtitle2'>&diams; Paper Margin unit is the unit from paper size definition. (PostScript points)</Typography>      
      <Typography variant='subtitle2'>&diams; Paper size definition: <Link>https://pdfkit.org/docs/paper_sizes.html</Link></Typography>
      <Typography variant='subtitle2'>&diams; QRCode position is relative position to each grid. Size is relative to the smaller dimension of each grid. Value should be 0-1.</Typography>
      <Typography variant='subtitle2'>&diams; Label X and Y position is similar to QRCode position.</Typography>      
      <Typography variant='subtitle2'>&diams; Supported Label Font: <Link>https://pdfkit.org/docs/text.html#fonts</Link></Typography>        
  </Box>
}



const Main = () => {
  const [para,setPara] = useState({})
  const [sampleCode,setSampleCode] = useState(-1)
  const [error,setError] = useState('')
  const [loading,setLoading] = useState(false)
  const [showHelp, setShowHelp] = useState(false)

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
    ipcRenderer.invoke('getConfig')
    .then(res => {
      setPara(res)
    })
    .catch(err => {
      setError(`getConfig Error: ${err}`)
    })
  },[])

  useEffect(() => {    
    ipcRenderer.invoke('setConfig',para)
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
  return (
    <Box sx={{m:'1em'}}>
      <Box sx={{p:'0em 1em 1em'}}>
      <Typography sx={{mt:'1.2em'}}><b>BaBaCoder</b></Typography> 
      <Button onClick={()=>setShowHelp(!showHelp)} 
      startIcon={<HelpOutlineOutlinedIcon/>}      
      sx={{position:'absolute', top:'1em',right:'1em'}}
      >{showHelp?'Hide Help':'Show Help'}</Button>
      {
        showHelp && <UserHelp/>
      }

    </Box>
      <Grid container spacing={1}>
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
