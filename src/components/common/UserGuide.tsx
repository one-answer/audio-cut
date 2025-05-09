import React, { useState } from 'react';
import { Modal, Button, Typography } from 'antd';
import Steps from 'antd/es/steps';
import {
  QuestionCircleOutlined,
  PlayCircleOutlined,
  ScissorOutlined,
  HighlightOutlined,
  CheckCircleOutlined,
  UploadOutlined
} from '@ant-design/icons';
import './UserGuide.css';

const { Title, Paragraph } = Typography;
// const { Step } = Steps;

interface UserGuideProps {
  className?: string;
}

const UserGuide: React.FC<UserGuideProps> = ({ className = '' }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const steps = [
    {
      title: '上传音频',
      description: '点击上传区域或拖放音频文件到应用中。支持MP3、WAV、OGG等常见格式。',
      icon: <UploadOutlined />
    },
    {
      title: '播放音频',
      description: '点击播放按钮聆听音频内容，熟悉需要剪辑的部分。',
      icon: <PlayCircleOutlined />
    },
    {
      title: '设置剪辑点',
      description: '在播放过程中，点击"设置开始点"按钮标记剪辑起点，再点击"设置结束点"按钮标记剪辑终点。您也可以直接在波形上拖动选择区域。',
      icon: <HighlightOutlined />
    },
    {
      title: '预览剪辑区域',
      description: '点击"预览"按钮试听已选择的剪辑区域，确保选择正确。',
      icon: <PlayCircleOutlined />
    },
    {
      title: '导出剪辑',
      description: '确认选择无误后，点击"剪辑"按钮导出所选区域的音频片段。',
      icon: <ScissorOutlined />
    },
    {
      title: '完成',
      description: '剪辑完成后，您可以下载处理后的音频文件或继续编辑。',
      icon: <CheckCircleOutlined />
    }
  ];

  return (
    <>
      <Button
        type="text"
        icon={<QuestionCircleOutlined />}
        onClick={showModal}
        className={`user-guide-button ${className}`}
      >
        使用指南
      </Button>
      <Modal
        title="音频剪辑使用指南"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={[
          <Button key="ok" type="primary" onClick={handleOk}>
            我知道了
          </Button>
        ]}
        width={700}
        className="user-guide-modal"
      >
        <div className="guide-content">
          <Paragraph className="guide-intro">
            音频剪辑工具可以帮助您快速剪切音频文件中的特定片段。按照以下步骤操作，轻松完成音频剪辑：
          </Paragraph>

          <Steps
            direction="vertical"
            current={-1}
            className="guide-steps"
            items={steps}
          />

          <div className="guide-tips">
            <Title level={5}>小贴士：</Title>
            <ul>
              <li>波形图可以帮助您直观地看到音频的强弱变化，便于精确定位。</li>
              <li>您可以使用缩放控件放大波形，以便更精确地选择剪辑点。</li>
              <li>如需重新选择剪辑区域，只需再次点击"设置开始点"重新开始。</li>
              <li>所有处理都在浏览器中完成，您的音频文件不会上传到服务器。</li>
            </ul>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default UserGuide;
