// 格式化日期
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

// 格式化日期和时间
export const formatDateTime = (date: Date): string => {
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

// 格式化百分比
export const formatPercentage = (value: number): string => {
  return `${(value * 100).toFixed(1)}%`;
};

// 格式化数字（添加千位分隔符）
export const formatNumber = (value: number): string => {
  return value.toLocaleString('zh-CN');
};

// 格式化持续时间（毫秒转为可读格式）
export const formatDuration = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}小时 ${minutes % 60}分钟`;
  } else if (minutes > 0) {
    return `${minutes}分钟 ${seconds % 60}秒`;
  } else {
    return `${seconds}秒`;
  }
};

// 格式化分贝值
export const formatDecibels = (db: number): string => {
  return `${db.toFixed(1)} dB`;
};

// 格式化频率
export const formatFrequency = (hz: number): string => {
  if (hz >= 1000) {
    return `${(hz / 1000).toFixed(1)} kHz`;
  } else {
    return `${Math.round(hz)} Hz`;
  }
};

// 截断文本（超过指定长度时添加省略号）
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {
    return text;
  }
  
  return text.slice(0, maxLength) + '...';
};
