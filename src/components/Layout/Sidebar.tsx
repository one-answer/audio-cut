import React from 'react';
import { Layout, Menu } from 'antd';
import {
  FileAddOutlined,
  ScissorOutlined,
  SettingOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { MenuItem } from '../../types/ui';

import './Sidebar.css';

const { Sider } = Layout;

interface SidebarProps {
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  menuItems?: MenuItem[];
  selectedKey?: string;
  onMenuSelect?: (key: string) => void;
}

const defaultMenuItems: MenuItem[] = [
  {
    key: 'upload',
    label: '上传音频',
    icon: <FileAddOutlined />,
  },
  {
    key: 'edit',
    label: '编辑音频',
    icon: <ScissorOutlined />,
  },
  {
    key: 'settings',
    label: '设置',
    icon: <SettingOutlined />,
  },
  {
    key: 'about',
    label: '关于',
    icon: <InfoCircleOutlined />,
  },
];

const Sidebar: React.FC<SidebarProps> = ({
  collapsed = false,
  onCollapse,
  menuItems = defaultMenuItems,
  selectedKey = 'upload',
  onMenuSelect,
}) => {
  // 处理菜单选择
  const handleMenuSelect = ({ key }: { key: string }) => {
    if (onMenuSelect) {
      onMenuSelect(key);
    }
  };
  
  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      className="app-sidebar"
    >
      <div className="sidebar-logo">
        {!collapsed && <span>音频剪辑</span>}
      </div>
      
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[selectedKey]}
        items={menuItems}
        onSelect={handleMenuSelect}
      />
    </Sider>
  );
};

export default Sidebar;
