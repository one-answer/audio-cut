import React from 'react';
import { Alert, Typography } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import './QuickGuide.css';

const { Text } = Typography;

interface QuickGuideProps {
  className?: string;
}

const QuickGuide: React.FC<QuickGuideProps> = ({ className = '' }) => {
  return (
    <Alert
      className={`quick-guide ${className}`}
      icon={<InfoCircleOutlined />}
      message={
        <div className="quick-guide-content">
          <Text strong>操作指引：</Text>
          <Text>1. 播放音频</Text>
          <Text>→</Text>
          <Text>2. 在播放过程中设置开始点和结束点</Text>
          <Text>→</Text>
          <Text>3. 预览选择区域</Text>
          <Text>→</Text>
          <Text>4. 点击剪辑完成</Text>
        </div>
      }
      type="info"
      showIcon
      closable
    />
  );
};

export default QuickGuide;
