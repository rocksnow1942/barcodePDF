import { shell } from 'electron';
import Typography from '@mui/material/Typography';
import badgeDemo from '../images/badgedemo.png';
import Box from '@mui/material/Box';

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
              {/* <Typography variant='subtitle2'>&diams; Paper Margin unit is the unit from paper size definition. (PostScript points)</Typography>       */}
              <Typography variant='subtitle2'>&diams; Paper size definition: <Link>https://pdfkit.org/docs/paper_sizes.html</Link></Typography>
              <Typography variant='subtitle2'>&diams; QRCode position is relative position to each grid. Size is relative to the smaller dimension of each grid. Value should be 0-1.</Typography>
              <Typography variant='subtitle2'>&diams; Label X and Y position is similar to QRCode position.</Typography>      
              <Typography variant='subtitle2'>&diams; Supported Label Font: <Link>https://pdfkit.org/docs/text.html#fonts</Link></Typography>        
              </>      
          case 'badge':
            return <Box sx={{display:'flex'}}>
              <Box sx={{textAlign:'center'}}>
              <Typography ><strong>Dimension definition</strong></Typography>
              <img style={{maxWidth:300,width:'30vw',padding:'5px',border:'1px solid gray',borderRadius:'3px'}} src={badgeDemo}/>
              <Typography variant='subtitle2'>Showing the top left corner of the badges printed on a paper (size LETTER).</Typography>
              </Box>            
            <Box sx={{pl:3,'& h6':{mt:'0.3em',lineHeight:'1.25em'}}}>
            <Typography variant='subtitle2' sx={{ml:'1em'}}><b>&diams; How To Use</b> </Typography>
            <Typography variant='subtitle2'>Adjust the configuration or select a saved configuration preset. Click "Background Image" to load background Image. Click "Generate Badge" to generate pdf from csv file. PDF file is saved to the same location as the csv file.</Typography>
            <Typography variant='subtitle2'><b>csv File format:</b> First row must be headers. Valid headers: <b>code, T1, T2, T3,...</b>. All headers are case in-sensitive and optional. </Typography>
              <Typography variant='subtitle2'><b>code:</b> If provided, text in this column is used for generating the 2D code.</Typography>
              <Typography variant='subtitle2'><b>T1,T2,T3,...:</b> If provided, each text column is placed on the badge according to respective text settings.</Typography>

            <Typography variant='subtitle2' sx={{ml:'1em',pt:'0.5em'}}><b>&diams; Configuration Guide</b> </Typography>
            <Typography variant='subtitle2' ><b>Presets:</b> 10 save slots available. Use "Description" to add a note. Click "Save Settings" to save parameters.</Typography>            
            <Typography variant='subtitle2'><b>Dimension Units:</b> All dimension units are in inches.</Typography>
            <Typography variant='subtitle2'><b>Paper Size:</b> Select "Custom Paper Size" to define your paper size. A list of paper size are provided.</Typography>
            <Typography variant='subtitle2'><b>Layout Dimensions:</b> See left figure for the definition of each parameter. 
              These values define the layout of each <b>badge panel</b> and the relative position of <b>badge panels</b> to the paper and to each other.
              The <b>badge panels</b> are then layed out onto the paper from left to right, top to bottom.
            </Typography>
              
              <Typography variant='subtitle2'><b>Background Image:</b> A background image file in .jpeg or .png format can be added to each <b>badge panel</b>.
              The image is fit to the badge panel while maintaining its aspect ratio. It works the best if the image has the same aspect ratio as your badge panel (Badge Width x Badge Height).
              </Typography>

              <Typography variant='subtitle2'><b>Text Box Settings:</b> Text fields can be provided in the input file and placed on the badge. 
              Each text field has its position and text format settings. If any of the <b>Position Settings is set to &lt; 0</b>, then this text field is ignored. Click + / - to add / remove textbox..
              </Typography>

              <Typography variant='subtitle2'><b>Use External Fonts:</b> Some common fonts are provided. Also support external fonts in .ttf or .otf formats. Click 'Import Fonts'
              then copy font files to the fonts folder. Restart app to use the added fonts.
              </Typography>
              <Typography variant='subtitle2'><b>Save Settings:</b> Save the current settings to a preset. If not saved, changes will be lost after restart the app.
              </Typography>

            </Box>
            </Box>    
        default:
            return <Typography>
              Help Page is not available at this time.
              </Typography>
            


     }
    
  }