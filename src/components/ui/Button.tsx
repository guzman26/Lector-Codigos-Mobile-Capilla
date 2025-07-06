import React from 'react';
import styles from './Button.module.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ children, ...rest }) => (
  <button className={styles.button} {...rest}>
    {children}
  </button>
);

export default Button;
