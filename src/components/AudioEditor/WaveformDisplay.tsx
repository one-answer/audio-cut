import React, { useRef, useEffect, useState } from 'react';
import { Spin } from 'antd';
// 导入wavesurfer.js
const WaveSurfer = require('wavesurfer.js');
import { createWaveSurfer, addTimelinePlugin, addRegionsPlugin } from '../../services/waveformRenderer';

import './WaveformDisplay.css';

interface WaveformDisplayProps {
  audioUrl?: string;
  height?: number;
  waveColor?: string;
  progressColor?: string;
  cursorColor?: string;
  barWidth?: number;
  responsive?: boolean;
  hideScrollbar?: boolean;
  onReady?: (wavesurfer: any) => void;
  onLoading?: (progress: number) => void;
}

const WaveformDisplay: React.FC<WaveformDisplayProps> = ({
  audioUrl,
  height = 128,
  waveColor = '#4F4A85',
  progressColor = '#383351',
  cursorColor = '#383351',
  barWidth = 2,
  responsive = true,
  hideScrollbar = false,
  onReady,
  onLoading,
}) => {
  const waveformRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<any>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);

  // 初始化WaveSurfer
  useEffect(() => {
    if (waveformRef.current && !wavesurferRef.current) {
      const wavesurfer = createWaveSurfer(waveformRef.current, {
        height,
        waveColor,
        progressColor,
        cursorColor,
        barWidth,
        responsive,
        hideScrollbar,
      });

      if (timelineRef.current) {
        addTimelinePlugin(wavesurfer, timelineRef.current);
      }

      addRegionsPlugin(wavesurfer);

      wavesurfer.on('ready', () => {
        setLoading(false);
        if (onReady) {
          onReady(wavesurfer);
        }
      });

      wavesurfer.on('loading', (progress: number) => {
        setLoadingProgress(progress);
        if (onLoading) {
          onLoading(progress);
        }
      });

      wavesurferRef.current = wavesurfer;

      return () => {
        wavesurfer.destroy();
        wavesurferRef.current = null;
      };
    }
  }, [height, waveColor, progressColor, cursorColor, barWidth, responsive, hideScrollbar, onReady, onLoading]);

  // 加载音频
  useEffect(() => {
    if (wavesurferRef.current && audioUrl) {
      setLoading(true);
      setLoadingProgress(0);
      wavesurferRef.current.load(audioUrl);
    }
  }, [audioUrl]);

  return (
    <div className="waveform-display">
      {loading && (
        <div className="loading-overlay">
          <Spin tip={`加载中 ${loadingProgress}%`} />
        </div>
      )}
      <div ref={waveformRef} className="waveform" />
      <div ref={timelineRef} className="timeline" />
    </div>
  );
};

export default WaveformDisplay;
