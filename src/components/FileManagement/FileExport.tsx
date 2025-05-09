import React, { useState } from 'react';
import { Button, Select, Form, Card, message } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { AudioFile } from '../../types/audio';
import { downloadAudioFile } from '../../services/fileHandling';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

import './FileExport.css';

interface FileExportProps {
  audioFile: AudioFile;
}

const { Option } = Select;

// 支持的导出格式
const exportFormats = [
  { label: 'MP3', value: 'mp3', mimeType: 'audio/mpeg' },
  { label: 'WAV', value: 'wav', mimeType: 'audio/wav' },
  { label: 'OGG', value: 'ogg', mimeType: 'audio/ogg' },
  { label: 'FLAC', value: 'flac', mimeType: 'audio/flac' },
  { label: 'AAC', value: 'aac', mimeType: 'audio/aac' },
];

const FileExport: React.FC<FileExportProps> = ({ audioFile }) => {
  const [form] = Form.useForm();
  const [exporting, setExporting] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  // 直接下载原始文件
  const handleDirectDownload = () => {
    downloadAudioFile(audioFile);
    message.success('下载开始');
  };

  // 转换并下载文件
  const handleConvertAndDownload = async (values: { format: string }) => {
    const { format } = values;

    // 如果选择的格式与原始格式相同，直接下载
    const originalFormat = audioFile.name.split('.').pop()?.toLowerCase();
    if (originalFormat === format) {
      handleDirectDownload();
      return;
    }

    try {
      setExporting(true);
      setProgress(0);

      // 初始化FFmpeg
      const ffmpeg = createFFmpeg({
        log: true,
        progress: ({ ratio }) => {
          setProgress(Math.round(ratio * 100));
        },
      });

      await ffmpeg.load();

      // 获取文件数据
      const inputData = await fetchFile(audioFile.url);
      const inputName = 'input.' + originalFormat;
      const outputName = `output.${format}`;

      // 写入输入文件
      ffmpeg.FS('writeFile', inputName, inputData);

      // 执行转换
      await ffmpeg.run('-i', inputName, outputName);

      // 读取输出文件
      const outputData = ffmpeg.FS('readFile', outputName);

      // 创建下载链接
      const outputFormat = exportFormats.find(f => f.value === format);
      const blob = new Blob([outputData.buffer], { type: outputFormat?.mimeType });
      const url = URL.createObjectURL(blob);

      // 下载文件
      const a = document.createElement('a');
      a.href = url;
      a.download = audioFile.name.replace(/\.[^/.]+$/, `.${format}`);
      a.click();

      // 释放资源
      URL.revokeObjectURL(url);
      ffmpeg.FS('unlink', inputName);
      ffmpeg.FS('unlink', outputName);

      message.success('转换并下载成功');
    } catch (error) {
      console.error('转换失败:', error);
      message.error('转换失败，请重试');
    } finally {
      setExporting(false);
      setProgress(0);
    }
  };

  return (
    <div className="file-export">
      <Card title="导出音频" bordered={false}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleConvertAndDownload}
          initialValues={{ format: 'mp3' }}
        >
          <Form.Item
            name="format"
            label="导出格式"
            rules={[{ required: true, message: '请选择导出格式' }]}
          >
            <Select placeholder="选择导出格式">
              {exportFormats.map((format) => (
                <Option key={format.value} value={format.value}>
                  {format.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={exporting}
              icon={<DownloadOutlined />}
            >
              {exporting ? `转换中 ${progress}%` : '转换并下载'}
            </Button>

            <Button
              style={{ marginLeft: 8 }}
              onClick={handleDirectDownload}
              icon={<DownloadOutlined />}
            >
              直接下载原始文件
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default FileExport;
