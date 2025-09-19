// src/components/icons/IconWrapper.tsx
import React from 'react';

export const ICON_SIZES = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 40
} as const;

interface IconWrapperProps {
  children: React.ReactNode;
  size?: keyof typeof ICON_SIZES | number;
  className?: string;
  onClick?: () => void;
}

export const IconWrapper: React.FC<IconWrapperProps> = ({ 
  children, 
  size = 'md',
  className = '',
  onClick 
}) => {
  const iconSize = typeof size === 'number' ? size : ICON_SIZES[size];
  
  return (
    <span 
      className={`inline-flex items-center justify-center ${className}`}
      style={{ width: iconSize, height: iconSize }}
      onClick={onClick}
    >
      {React.cloneElement(children as React.ReactElement, { size: iconSize })}
    </span>
  );
};