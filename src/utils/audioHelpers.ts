// 格式化时间（秒）为 MM:SS 格式
export const formatTime = (seconds: number): string => {
  if (isNaN(seconds) || seconds < 0) {
    return '00:00';
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// 格式化时间（秒）为 HH:MM:SS 格式
export const formatTimeHMS = (seconds: number): string => {
  if (isNaN(seconds) || seconds < 0) {
    return '00:00:00';
  }
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// 格式化文件大小
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 从文件名中提取名称（不含扩展名）
export const getFileNameWithoutExtension = (filename: string): string => {
  return filename.replace(/\.[^/.]+$/, '');
};

// 生成随机颜色
export const generateRandomColor = (): string => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

// 检查浏览器是否支持Web Audio API
export const isWebAudioSupported = (): boolean => {
  return !!(window.AudioContext || (window as any).webkitAudioContext);
};

// 检查浏览器是否支持MediaRecorder API（用于录音）
export const isMediaRecorderSupported = (): boolean => {
  return !!window.MediaRecorder;
};

// 将秒转换为采样点索引
export const secondsToSamples = (seconds: number, sampleRate: number): number => {
  return Math.floor(seconds * sampleRate);
};

// 将采样点索引转换为秒
export const samplesToSeconds = (samples: number, sampleRate: number): number => {
  return samples / sampleRate;
};

// 计算音频的峰值电平（dB）
export const calculatePeakLevel = (buffer: Float32Array): number => {
  let max = 0;
  for (let i = 0; i < buffer.length; i++) {
    const abs = Math.abs(buffer[i]);
    if (abs > max) {
      max = abs;
    }
  }
  
  // 转换为分贝值 (dB)
  return max > 0 ? 20 * Math.log10(max) : -100;
};

// 计算音频的RMS电平（dB）
export const calculateRMSLevel = (buffer: Float32Array): number => {
  let sum = 0;
  for (let i = 0; i < buffer.length; i++) {
    sum += buffer[i] * buffer[i];
  }
  
  const rms = Math.sqrt(sum / buffer.length);
  
  // 转换为分贝值 (dB)
  return rms > 0 ? 20 * Math.log10(rms) : -100;
};
