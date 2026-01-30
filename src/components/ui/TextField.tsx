import { TextField as MuiTextField } from '@mui/material';
import type { TextFieldProps } from '@mui/material';

export const TextField = (props: TextFieldProps) => (
  <MuiTextField variant="outlined" size="small" {...props} />
);
