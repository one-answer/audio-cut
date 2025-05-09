import React, { useEffect, useRef } from 'react';
import { formatTime } from '../../utils/audioHelpers';

import './TimelineMarker.css';

interface TimelineMarkerProps {
  duration: number;
  currentTime: number;
  markerInterval?: number;
  height?: number;
}

const TimelineMarker: React.FC<TimelineMarkerProps> = ({
  duration,
  currentTime,
  markerInterval = 1,
  height = 30,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // 绘制时间线
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    
    // 设置canvas尺寸
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    
    // 清除画布
    ctx.clearRect(0, 0, width, height);
    
    // 绘制背景
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, width, height);
    
    // 计算标记间隔
    const pixelsPerSecond = width / duration;
    const numMarkers = Math.ceil(duration / markerInterval);
    
    // 绘制标记和时间文本
    ctx.fillStyle = '#333';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    
    for (let i = 0; i <= numMarkers; i++) {
      const time = i * markerInterval;
      const x = time * pixelsPerSecond;
      
      if (x > width) break;
      
      // 绘制标记线
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, i % 5 === 0 ? height / 2 : height / 3);
      ctx.strokeStyle = '#999';
      ctx.stroke();
      
      // 每5个标记绘制时间文本
      if (i % 5 === 0) {
        ctx.fillText(formatTime(time), x, height - 5);
      }
    }
    
    // 绘制当前时间指示器
    const currentX = currentTime * pixelsPerSecond;
    ctx.beginPath();
    ctx.moveTo(currentX, 0);
    ctx.lineTo(currentX, height);
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.stroke();
    
  }, [duration, currentTime, markerInterval, height]);
  
  return (
    <div className="timeline-marker" style={{ height: `${height}px` }}>
      <canvas ref={canvasRef} className="timeline-canvas" />
    </div>
  );
};

export default TimelineMarker;
