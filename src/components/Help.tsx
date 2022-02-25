import { shell } from 'electron';
import Typography from '@mui/material/Typography';


const Link = ({children}) => {
    return <span onClick={()=>{shell.openExternal(children)}}
    style = {{textDecoration:'underline', cursor:'pointer', color:'blue'}}>
      {children}
    </span> 
  }
  
  
 export default function UserHelp ({tab}:{tab:string}) {
     switch (tab) {
         case 'grid':
            return <>
            <Typography variant='subtitle2'>&diams; Code Format:</Typography>
              <Typography variant='subtitle2' component='li' sx={{marginLeft:'1em'}}>Use Dayjs Format String for date:<Link>https://day.js.org/docs/en/display/format</Link></Typography>      
              <Typography variant='subtitle2' component='li' sx={{marginLeft:'1em'}}>For random characters: use * for [A-Za-z0-9], ? for [A-Z0-9], # for [0-9], @ for [A-Za-z], % for [A-Z], & for [a-z].</Typography>
              <Typography variant='subtitle2' component='li' sx={{marginLeft:'1em'}}>Use [ ] for auto-incremental number. [0123] starts at 0123. At most one incremental field is allowed.</Typography>
              <Typography variant='subtitle2'>&diams; Paper Margin unit is the unit from paper size definition. (PostScript points)</Typography>      
              <Typography variant='subtitle2'>&diams; Paper size definition: <Link>https://pdfkit.org/docs/paper_sizes.html</Link></Typography>
              <Typography variant='subtitle2'>&diams; QRCode position is relative position to each grid. Size is relative to the smaller dimension of each grid. Value should be 0-1.</Typography>
              <Typography variant='subtitle2'>&diams; Label X and Y position is similar to QRCode position.</Typography>      
              <Typography variant='subtitle2'>&diams; Supported Label Font: <Link>https://pdfkit.org/docs/text.html#fonts</Link></Typography>        
              </>          
        default:
            return <Typography>
              Help Page is not available at this time.
              </Typography>
            


     }
    
  }