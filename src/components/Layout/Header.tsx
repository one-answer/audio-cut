import React from 'react';
import { Layout, Menu, Button, Space } from 'antd';
import { GithubOutlined, QuestionCircleOutlined } from '@ant-design/icons';

import './Header.css';

const { Header: AntHeader } = Layout;

interface HeaderProps {
  title?: string;
  onHelpClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  title = '音频剪辑工具',
  onHelpClick,
}) => {
  return (
    <AntHeader className="app-header">
      <div className="logo">{title}</div>
      
      <Space>
        <Button
          type="text"
          icon={<QuestionCircleOutlined />}
          onClick={onHelpClick}
        >
          帮助
        </Button>
        
        <Button
          type="text"
          icon={<GithubOutlined />}
          href="https://github.com/yourusername/audio-cut"
          target="_blank"
        >
          GitHub
        </Button>
      </Space>
    </AntHeader>
  );
};

export default Header;
