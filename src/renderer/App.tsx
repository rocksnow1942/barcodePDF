import { MemoryRouter as Router, Switch, Route } from 'react-router-dom';
import './App.css';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import Button from '@mui/material/Button';
import {useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import ButtonGroup from '@mui/material/ButtonGroup';
import SettingsIcon from '@mui/icons-material/Settings';
import IconButton from '@mui/material/IconButton'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import ToolTip from '@mui/material/Tooltip';
// Components
import BarcodeGrid from '../components/BarcodeGrid';
import UserHelp from '../components/Help';
import BadgeGrid from '../components/BadgeGrid';
import { ipcRenderer,shell } from 'electron';

const Main = () => {   
  const [showHelp, setShowHelp] = useState(false)
  const [tab,setTab] = useState('grid')
  const handleTabSelect = (tab) => ()=>setTab(tab)
  const handleGetSettings = ()=>{
    ipcRenderer.invoke('getConfig','file')
    .then(file => {
      shell.showItemInFolder(file)
    })
    .catch(err => {
      alert(`Error getting settings file: ${err}`)
    })
  }

  return (
    <Box sx={{m:'1em'}}>
      <Box sx={{p:'0em 1em 1em', display:'flex',alignItems:'center',justifyContent:'space-between'}} >
      <Box sx={{display:'flex',alignItems:'center'}} >
      <Typography sx={{mr:'2em'}}><b>BaBaCoder</b></Typography> 
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
<IconButton color='primary' onClick={handleGetSettings}>
  <ToolTip title="Show Settings File">
    <SettingsIcon /> 
    </ToolTip>
  </IconButton>
      </Box>
    </Box>
      {
        showHelp &&  <Box sx={{m:'0.5em'}}><UserHelp tab={tab}/></Box>
      }
    
      {tab==='grid' && <BarcodeGrid/>}
      {tab==='badge' && <BadgeGrid/>}
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
