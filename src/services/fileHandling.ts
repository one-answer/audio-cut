import { AudioFile } from '../types/audio';
import { v4 as uuidv4 } from 'uuid';

// 从文件创建AudioFile对象
export const createAudioFileFromFile = async (file: File): Promise<AudioFile> => {
  console.log('createAudioFileFromFile called with:', { name: file.name, type: file.type, size: file.size });

  try {
    const url = URL.createObjectURL(file);
    console.log('URL created:', url);

    const audioFile: AudioFile = {
      id: uuidv4(),
      name: file.name,
      type: file.type,
      size: file.size,
      url,
    };

    console.log('AudioFile created:', audioFile);
    return audioFile;
  } catch (error: any) {
    console.error('Error creating AudioFile from File:', error);
    throw new Error(`创建AudioFile失败: ${error.message || '未知错误'}`);
  }
};

// 从Blob创建AudioFile对象
export const createAudioFileFromBlob = async (
  blob: Blob,
  name: string
): Promise<AudioFile> => {
  console.log('createAudioFileFromBlob called with:', { name, type: blob.type, size: blob.size });

  if (!blob || blob.size === 0) {
    console.error('Invalid blob:', blob);
    throw new Error('无效的Blob对象');
  }

  try {
    const url = URL.createObjectURL(blob);
    console.log('URL created:', url);

    const audioFile: AudioFile = {
      id: uuidv4(),
      name,
      type: blob.type || 'audio/wav', // 默认为 WAV 格式
      size: blob.size,
      url,
    };

    console.log('AudioFile created:', audioFile);
    return audioFile;
  } catch (error: any) {
    console.error('Error creating AudioFile from Blob:', error);
    throw new Error(`创建AudioFile失败: ${error.message || '未知错误'}`);
  }
};

// 下载AudioFile
export const downloadAudioFile = (audioFile: AudioFile): void => {
  console.log('Downloading audio file:', audioFile);

  try {
    // 创建下载链接
    const a = document.createElement('a');
    a.href = audioFile.url;
    a.download = audioFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    console.log('Download initiated successfully');
  } catch (error: any) {
    console.error('Error downloading audio file:', error);
    throw new Error(`下载音频文件失败: ${error.message || '未知错误'}`);
  }
};

// 释放AudioFile的URL
export const releaseAudioFileUrl = (audioFile: AudioFile): void => {
  URL.revokeObjectURL(audioFile.url);
};

// 检查文件类型是否为支持的音频格式
export const isSupportedAudioFormat = (file: File): boolean => {
  const supportedTypes = [
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/wave',
    'audio/x-wav',
    'audio/webm',
    'audio/ogg',
    'audio/aac',
    'audio/flac',
    'audio/x-flac',
    'audio/m4a',
  ];

  return supportedTypes.includes(file.type);
};

// 获取文件扩展名
export const getFileExtension = (filename: string): string => {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
};

// 从扩展名获取MIME类型
export const getMimeTypeFromExtension = (extension: string): string => {
  const mimeTypes: Record<string, string> = {
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    ogg: 'audio/ogg',
    webm: 'audio/webm',
    aac: 'audio/aac',
    flac: 'audio/flac',
    m4a: 'audio/m4a',
  };

  return mimeTypes[extension.toLowerCase()] || 'audio/mpeg';
};
