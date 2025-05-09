import React from 'react';
import { Layout, Typography, Space } from 'antd';
import Divider from 'antd/es/divider';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import UserGuide from './UserGuide';
import { useTheme } from '../../contexts/ThemeContext';
import './Header.css';

const { Header: AntHeader } = Layout;
const { Title } = Typography;

const Header: React.FC = () => {
  // Theme context is used in CSS variables
  useTheme();

  return (
    <AntHeader className="app-header">
      <div className="header-content">
        <Space align="center" size={16} className="logo-container">
          <Logo size={36} />
          <Title
            level={3}
            className="app-title"
          >
            Audio Cut
          </Title>
        </Space>

        <div className="header-actions">
          <UserGuide />
          <Divider type="vertical" style={{ margin: '0 8px', height: '20px' }} />
          <ThemeToggle />
        </div>
      </div>
    </AntHeader>
  );
};

export default Header;
