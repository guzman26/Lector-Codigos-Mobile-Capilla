import { Card as MuiCard } from '@mui/material';
import type { CardProps } from '@mui/material';

export const Card = (props: CardProps) => <MuiCard variant="outlined" {...props} />;
