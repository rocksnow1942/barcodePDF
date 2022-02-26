import { MemoryRouter as Router, Switch, Route } from 'react-router-dom';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import Button from '@mui/material/Button';
import {useState , useEffect} from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import ButtonGroup from '@mui/material/ButtonGroup';
import SettingsIcon from '@mui/icons-material/Settings';
import IconButton from '@mui/material/IconButton'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import ToolTip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
// Components
import BarcodeGrid from '../components/BarcodeGrid';
import UserHelp from '../components/Help';
import BadgeGrid from '../components/BadgeGrid';
import { ipcRenderer,shell } from 'electron';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({    
    spacing: 8,
    components: {
      MuiTextField: {
        defaultProps: {
          size:'small',
          variant:'filled'
        }
      },
      MuiFormControl: {
        defaultProps: {
          size:'small',
          variant:'filled'
        }
      }

    }
})



const getConfig = (dispatch)=>()=>{
  ipcRenderer.invoke('getConfig')
    .then(config => {
        dispatch(config)
    })
    .catch(err => {
      alert(`Error getting settings file: ${err}`)
    })
}

const persistConfig = dispatch =>(para)=>{
  ipcRenderer.invoke('setConfig',para)
    .then((res)=>{
      dispatch && dispatch(res)
    })
    .catch(err => {
     alert(`setConfig Error: ${err}`)
    })
}

const Main = () => {   
  const [showHelp, setShowHelp] = useState(false)
  const [tab,setTab] = useState('badge')
  const handleTabSelect = (tab) => ()=>setTab(tab)
  const [config,setConfig] = useState(null)
  
  // get config first
  useEffect(() => {    
    getConfig(setConfig)()
  },[])

  // persist config
  const saveConfig = (dispatch) => ()=>{
    persistConfig(dispatch)(config)
  }


  
  const showSettingsFile = ()=>{
    
    if (config && config.file) {      
      shell.showItemInFolder(config.file)      
    }    
  }

  if (!config) {
    return <Box sx={{display:'flex',height:'90vh',alignItems:'center',justifyContent:'center'}}>
      <CircularProgress size={82}/>
    </Box>
  }

  return (
    <Box sx={{m:'1em'}}>
      <Box sx={{p:'0em 1em 1em', display:'flex',alignItems:'center',justifyContent:'space-between'}} >
      <Box sx={{display:'flex',alignItems:'center'}} >
      <Typography sx={{mr:'2em'}}><b>Badger</b></Typography> 
      <ButtonGroup>
        <Button size='small' variant={tab==='grid'?'contained':'outlined'} onClick={handleTabSelect('grid')}>Grid</Button>
        <Button size='small' variant={tab==='badge'?'contained':'outlined'} onClick={handleTabSelect('badge')}>Badge</Button>        
      </ButtonGroup>
      </Box>
      <Box sx={{display:'flex',alignItems:'center'}} >
      <IconButton color='primary' onClick={()=>setShowHelp(!showHelp)}>
      <ToolTip title={showHelp?'Hide Help':'Show Help'}>
        {showHelp?<CancelOutlinedIcon/>:
        <HelpOutlineOutlinedIcon/>} 
      </ToolTip>
        </IconButton>
<IconButton color='primary' onClick={showSettingsFile}>
  <ToolTip title="Show Settings File">
    <SettingsIcon /> 
    </ToolTip>
  </IconButton>
      </Box>
    </Box>
      {
        showHelp &&  <Box sx={{m:'0.5em'}}><UserHelp tab={tab}/></Box>
      }
    
      {tab==='grid' && <BarcodeGrid config={config} setConfig={setConfig} saveConfig={saveConfig}/>}
      {tab==='badge' && <BadgeGrid config={config} setConfig={setConfig} saveConfig={saveConfig}/>}
    </Box>
  );
};

export default function App() {
  return (
    <ThemeProvider theme={theme}>
    <Router>
      <Switch>
        <Route path="/" component={Main} />
      </Switch>
    </Router>
    </ThemeProvider>
  );
}
