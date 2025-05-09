import React from 'react';
import Switch from 'antd/es/switch';
import { BulbOutlined, BulbFilled } from '@ant-design/icons';
import { useTheme } from '../../contexts/ThemeContext';
import './ThemeToggle.css';

interface ThemeToggleProps {
  className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className={`theme-toggle ${className}`}>
      <Switch
        checked={theme === 'light'}
        onChange={toggleTheme}
        checkedChildren={<BulbFilled />}
        unCheckedChildren={<BulbOutlined />}
        className="theme-switch"
      />
    </div>
  );
};

export default ThemeToggle;
