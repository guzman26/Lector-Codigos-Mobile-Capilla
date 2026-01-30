import { Button as MuiButton } from '@mui/material';
import type { ButtonProps } from '@mui/material';

export const Button = (props: ButtonProps) => (
  <MuiButton variant="outlined" size="medium" {...props} />
);
