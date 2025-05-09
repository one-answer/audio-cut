import React, { useState, useRef } from 'react';
import { message, Layout } from 'antd';
import {
  SoundOutlined,
  UploadOutlined,
  FileOutlined,
  ScissorOutlined,
  PlayCircleOutlined,
  CustomerServiceOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
// 导入Ant Design样式
import 'antd/dist/reset.css';
import './App.css';

// 导入主题上下文
import { ThemeProvider } from './contexts/ThemeContext';

// 导入头部组件
import Header from './components/common/Header';

// 导入组件和服务
import AudioEditor from './components/AudioEditor/AudioEditor';
import { AudioFile } from './types/audio';
import { createAudioFileFromFile } from './services/fileHandling';

const AppContent = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [audioFile, setAudioFile] = useState<AudioFile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理文件上传
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      message.success(`文件 ${e.target.files[0].name} 已选择`);
    }
  };

  // 处理文件上传并开始编辑
  const handleStartEditing = async () => {
    if (file) {
      try {
        setIsLoading(true);
        // 创建AudioFile对象
        const newAudioFile = await createAudioFileFromFile(file);
        setAudioFile(newAudioFile);
        setIsEditing(true);
        message.success(`文件 ${file.name} 已准备好编辑`);
      } catch (error) {
        console.error('Error preparing file for editing:', error);
        message.error('准备文件编辑时出错');
      } finally {
        setIsLoading(false);
      }
    } else {
      message.error('请先选择文件');
    }
  };

  // 返回到上传页面
  const handleBackToUpload = () => {
    setIsEditing(false);
  };

  // 处理保存编辑后的文件
  const handleSaveEditedFile = (editedAudioFile: AudioFile) => {
    message.success(`文件 ${editedAudioFile.name} 已保存`);
    // 返回上传页面
    setIsEditing(false);
  };

  // 处理拖放事件
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type.startsWith('audio/')) {
        setFile(droppedFile);
        message.success(`文件 ${droppedFile.name} 已选择`);
      } else {
        message.error('请上传音频文件');
      }
    }
  };

  // 触发文件选择器
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // 格式列表
  const audioFormats = [
    { name: 'MP3', ext: '.mp3', icon: <SoundOutlined /> },
    { name: 'WAV', ext: '.wav', icon: <SoundOutlined /> },
    { name: 'OGG', ext: '.ogg', icon: <SoundOutlined /> },
    { name: 'FLAC', ext: '.flac', icon: <SoundOutlined /> },
    { name: 'AAC', ext: '.aac', icon: <SoundOutlined /> },
    { name: 'M4A', ext: '.m4a', icon: <SoundOutlined /> },
    { name: 'WebM', ext: '.webm', icon: <SoundOutlined /> },
  ];

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const { Content } = Layout;

  return (
    <Layout className="app-container">
      <Header />
      <Content style={{ padding: '24px', minHeight: 'calc(100vh - 64px)' }}>
      {isEditing && audioFile ? (
        // 编辑模式
        <div className="content-area fade-in">
          <div className="editor-header">
            <h1 className="editor-title">编辑音频: {audioFile.name}</h1>
          </div>

          <AudioEditor
            audioFile={audioFile}
            onSave={handleSaveEditedFile}
            onBack={handleBackToUpload}
          />
        </div>
      ) : (
        // 上传模式
        <div className="content-area fade-in">
          <h1 className="page-title">音频剪辑工具</h1>
          <p className="page-subtitle">简单高效的在线音频编辑工具，无需下载软件</p>

          <div className="modern-card">
            <h2 className="card-title">
              <UploadOutlined className="icon" />
              上传音频
            </h2>

            <div
              className={`upload-area ${isDragging ? 'upload-area-active' : ''}`}
              onClick={triggerFileInput}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="audio/*"
                className="file-input"
                style={{ display: 'none' }}
              />
              <UploadOutlined className="upload-icon" />
              <div className="upload-text">点击或拖放文件到这里</div>
              <div className="upload-hint">支持 MP3, WAV, OGG 等格式</div>
            </div>

            {file && (
              <div className="file-info fade-in">
                <div className="file-info-item">
                  <span className="file-info-label">文件名</span>
                  <span className="file-info-value">{file.name}</span>
                </div>
                <div className="file-info-item">
                  <span className="file-info-label">文件大小</span>
                  <span className="file-info-value">{formatFileSize(file.size)}</span>
                </div>
                <div className="file-info-item">
                  <span className="file-info-label">文件类型</span>
                  <span className="file-info-value">{file.type}</span>
                </div>
              </div>
            )}

            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              <button
                className="modern-button"
                onClick={handleStartEditing}
                disabled={!file || isLoading}
              >
                {isLoading ? (
                  <>加载中...</>
                ) : (
                  <>
                    <ScissorOutlined className="icon" />
                    开始编辑
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="modern-card">
            <h2 className="card-title">
              <CustomerServiceOutlined className="icon" />
              支持的音频格式
            </h2>

            <div className="format-list">
              {audioFormats.map((format, index) => (
                <div className="format-item" key={index}>
                  {format.icon}
                  <div className="format-name">{format.name}</div>
                  <div className="format-ext">{format.ext}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="modern-card">
            <h2 className="card-title">
              <PlayCircleOutlined className="icon" />
              功能亮点
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
              <div className="feature-item">
                <h3>波形可视化</h3>
                <p>直观地查看音频波形，精确定位编辑点</p>
              </div>
              <div className="feature-item">
                <h3>精确剪切</h3>
                <p>按需剪切音频片段，轻松移除不需要的部分</p>
              </div>
              <div className="feature-item">
                <h3>多格式支持</h3>
                <p>支持多种音频格式，包括 MP3, WAV, OGG 等</p>
              </div>
              <div className="feature-item">
                <h3>实时预览</h3>
                <p>编辑时实时预览效果，确保编辑结果符合预期</p>
              </div>
            </div>
          </div>
        </div>
      )}
      </Content>
    </Layout>
  );
}

const App = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;
