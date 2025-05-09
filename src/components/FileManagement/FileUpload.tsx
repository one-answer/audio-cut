import React, { useState } from 'react';
import { Upload, Button, message, Alert } from 'antd';
import { UploadOutlined, InboxOutlined } from '@ant-design/icons';
import type { RcFile, UploadFile, UploadProps } from 'antd/es/upload/interface';
import { AudioFile } from '../../types/audio';
import { createAudioFileFromFile, isSupportedAudioFormat } from '../../services/fileHandling';

import './FileUpload.css';

interface FileUploadProps {
  onFileUploaded: (audioFile: AudioFile) => void;
  maxSize?: number; // 最大文件大小（字节）
}

const { Dragger } = Upload;

const FileUpload: React.FC<FileUploadProps> = ({
  onFileUploaded,
  maxSize = 100 * 1024 * 1024, // 默认100MB
}) => {
  const [uploading, setUploading] = useState<boolean>(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  
  // 检查文件是否有效
  const isValidFile = (file: RcFile): boolean => {
    // 检查文件类型
    if (!isSupportedAudioFormat(file)) {
      message.error('不支持的音频格式，请上传MP3、WAV、OGG等格式的音频文件');
      return false;
    }
    
    // 检查文件大小
    if (file.size > maxSize) {
      message.error(`文件大小不能超过 ${maxSize / 1024 / 1024} MB`);
      return false;
    }
    
    return true;
  };
  
  // 处理文件上传
  const handleUpload = async () => {
    const file = fileList[0];
    if (!file) {
      message.warning('请先选择音频文件');
      return;
    }
    
    try {
      setUploading(true);
      
      // 创建AudioFile对象
      const audioFile = await createAudioFileFromFile(file.originFileObj as File);
      
      // 调用回调函数
      onFileUploaded(audioFile);
      
      // 清空文件列表
      setFileList([]);
      
      message.success('文件上传成功');
    } catch (error) {
      console.error('文件上传失败:', error);
      message.error('文件上传失败');
    } finally {
      setUploading(false);
    }
  };
  
  // 上传组件属性
  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    fileList,
    beforeUpload: (file) => {
      if (!isValidFile(file)) {
        return Upload.LIST_IGNORE;
      }
      
      setFileList([file]);
      return false;
    },
    onRemove: () => {
      setFileList([]);
    },
  };
  
  return (
    <div className="file-upload">
      <Alert
        message="支持的音频格式"
        description="MP3, WAV, OGG, FLAC, AAC, M4A, WEBM"
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />
      
      <Dragger {...uploadProps}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
        <p className="ant-upload-hint">
          支持单个音频文件上传，文件大小不超过 {maxSize / 1024 / 1024} MB
        </p>
      </Dragger>
      
      <div className="upload-actions">
        <Button
          type="primary"
          onClick={handleUpload}
          disabled={fileList.length === 0}
          loading={uploading}
          icon={<UploadOutlined />}
        >
          {uploading ? '处理中' : '上传'}
        </Button>
      </div>
    </div>
  );
};

export default FileUpload;
