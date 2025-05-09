import React from 'react';
import { Layout } from 'antd';

import './Footer.css';

const { Footer: AntFooter } = Layout;

interface FooterProps {
  copyright?: string;
}

const Footer: React.FC<FooterProps> = ({
  copyright = `© ${new Date().getFullYear()} 音频剪辑工具`,
}) => {
  return (
    <AntFooter className="app-footer">
      <div className="footer-content">
        {copyright}
      </div>
    </AntFooter>
  );
};

export default Footer;
