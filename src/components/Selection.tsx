import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

export default function Selection  ({label,name,onChange,value,options})  {
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