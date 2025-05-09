import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 40, className = '' }) => {
  return (
    <div className={`logo ${className}`} style={{ width: size, height: size }}>
      <img src="/logo.svg" alt="Audio Cut Logo" style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default Logo;
