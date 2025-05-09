import React from 'react';
import { Button, Slider, Space, Tooltip } from 'antd';
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  SoundOutlined,
  ColumnWidthOutlined,
} from '@ant-design/icons';
import { PlaybackState } from '../../types/audio';
import { formatTime } from '../../utils/audioHelpers';

import './AudioControls.css';

interface AudioControlsProps {
  playbackState: PlaybackState;
  currentTime: number;
  duration: number;
  volume: number;
  isReady: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
}

const AudioControls: React.FC<AudioControlsProps> = ({
  playbackState,
  currentTime,
  duration,
  volume,
  isReady,
  onPlay,
  onPause,
  onStop,
  onSeek,
  onVolumeChange,
}) => {
  // 播放/暂停切换
  const handlePlayPause = () => {
    if (playbackState === PlaybackState.PLAYING) {
      onPause();
    } else {
      onPlay();
    }
  };
  
  // 处理时间滑块变化
  const handleTimeChange = (value: number) => {
    onSeek(value);
  };
  
  // 处理音量滑块变化
  const handleVolumeChange = (value: number) => {
    onVolumeChange(value / 100);
  };
  
  return (
    <div className="audio-controls">
      <div className="transport-controls">
        <Space>
          <Tooltip title={playbackState === PlaybackState.PLAYING ? '暂停' : '播放'}>
            <Button
              type="primary"
              shape="circle"
              icon={playbackState === PlaybackState.PLAYING ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
              onClick={handlePlayPause}
              disabled={!isReady}
            />
          </Tooltip>
          
          <Tooltip title="停止">
            <Button
              shape="circle"
              icon={<StopOutlined />}
              onClick={onStop}
              disabled={!isReady || playbackState === PlaybackState.STOPPED}
            />
          </Tooltip>
        </Space>
      </div>
      
      <div className="time-controls">
        <span className="time-display">{formatTime(currentTime)}</span>
        <Slider
          className="time-slider"
          min={0}
          max={duration}
          step={0.1}
          value={currentTime}
          onChange={handleTimeChange}
          disabled={!isReady}
          tooltip={{ formatter: (value) => formatTime(value || 0) }}
        />
        <span className="time-display">{formatTime(duration)}</span>
      </div>
      
      <div className="volume-controls">
        <SoundOutlined />
        <Slider
          className="volume-slider"
          min={0}
          max={100}
          value={volume * 100}
          onChange={handleVolumeChange}
          disabled={!isReady}
          tooltip={{ formatter: (value) => `${value}%` }}
        />
      </div>
    </div>
  );
};

export default AudioControls;
