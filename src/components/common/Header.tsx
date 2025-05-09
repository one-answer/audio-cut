import React from 'react';
import { Layout, Typography, Space } from 'antd';
import Logo from './Logo';

const { Header: AntHeader } = Layout;
const { Title } = Typography;

const Header: React.FC = () => {
  return (
    <AntHeader style={{ 
      display: 'flex', 
      alignItems: 'center', 
      padding: '0 24px',
      background: '#383351'
    }}>
      <Space align="center" size={16}>
        <Logo size={36} />
        <Title 
          level={3} 
          style={{ 
            margin: 0, 
            color: '#fff',
            fontWeight: 600
          }}
        >
          Audio Cut
        </Title>
      </Space>
    </AntHeader>
  );
};

export default Header;
