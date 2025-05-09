import React, { useState } from 'react';
import { Modal, Input, Radio, Button, Space, Typography, message } from 'antd';
import { SaveOutlined, DownloadOutlined, EditOutlined } from '@ant-design/icons';
import { AudioFile } from '../../types/audio';

const { Text } = Typography;

interface SaveDialogProps {
  visible: boolean;
  audioFile: AudioFile | null;
  defaultFileName: string;
  onSave: (audioFile: AudioFile, saveType: 'download' | 'library') => void;
  onCancel: () => void;
}

const SaveDialog: React.FC<SaveDialogProps> = ({
  visible,
  audioFile,
  defaultFileName,
  onSave,
  onCancel,
}) => {
  const [fileName, setFileName] = useState(defaultFileName);
  const [saveType, setSaveType] = useState<'download' | 'library'>('download');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSave = async () => {
    if (!audioFile) {
      message.error('没有可保存的音频文件');
      return;
    }

    if (!fileName.trim()) {
      message.warning('请输入文件名');
      return;
    }

    setIsProcessing(true);

    try {
      // 创建一个新的 AudioFile 对象，使用用户输入的文件名
      const newAudioFile: AudioFile = {
        ...audioFile,
        name: fileName.includes('.') ? fileName : `${fileName}.${audioFile.name.split('.').pop()}`,
      };

      // 调用保存回调
      onSave(newAudioFile, saveType);
    } catch (error) {
      console.error('保存音频失败:', error);
      message.error('保存音频失败');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal
      title="保存剪辑音频"
      open={visible}
      onCancel={onCancel}
      footer={null}
      maskClosable={false}
      destroyOnClose
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div>
          <Text strong>文件名</Text>
          <Input
            prefix={<EditOutlined />}
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            placeholder="输入文件名"
            allowClear
            style={{ marginTop: 8 }}
          />
        </div>

        <div>
          <Text strong>保存方式</Text>
          <Radio.Group
            value={saveType}
            onChange={(e) => setSaveType(e.target.value)}
            style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: '8px' }}
          >
            <Radio value="download">
              <Space>
                <DownloadOutlined />
                <span>下载到本地</span>
                <Text type="secondary">(保存到您的计算机)</Text>
              </Space>
            </Radio>
            <Radio value="library">
              <Space>
                <SaveOutlined />
                <span>保存到音频库</span>
                <Text type="secondary">(保存到应用程序中)</Text>
              </Space>
            </Radio>
          </Radio.Group>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: 8 }}>
          <Button onClick={onCancel}>取消</Button>
          <Button
            type="primary"
            icon={saveType === 'download' ? <DownloadOutlined /> : <SaveOutlined />}
            onClick={handleSave}
            loading={isProcessing}
          >
            {saveType === 'download' ? '下载' : '保存'}
          </Button>
        </div>
      </Space>
    </Modal>
  );
};

export default SaveDialog;
