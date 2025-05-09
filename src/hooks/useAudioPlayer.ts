import { useState, useEffect, useRef, useCallback } from 'react';
import { PlaybackState } from '../types/audio';

interface UseAudioPlayerProps {
  url?: string;
  onEnded?: () => void;
}

interface UseAudioPlayerReturn {
  playbackState: PlaybackState;
  currentTime: number;
  duration: number;
  volume: number;
  play: () => void;
  pause: () => void;
  stop: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
}

export const useAudioPlayer = ({
  url,
  onEnded,
}: UseAudioPlayerProps = {}): UseAudioPlayerReturn => {
  const [playbackState, setPlaybackState] = useState<PlaybackState>(PlaybackState.STOPPED);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolumeState] = useState<number>(1);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<number | null>(null);
  
  // 初始化音频元素
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      
      audioRef.current.addEventListener('loadedmetadata', () => {
        if (audioRef.current) {
          setDuration(audioRef.current.duration);
        }
      });
      
      audioRef.current.addEventListener('ended', () => {
        setPlaybackState(PlaybackState.STOPPED);
        setCurrentTime(0);
        if (onEnded) {
          onEnded();
        }
      });
    }
    
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
      
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, [onEnded]);
  
  // 更新音频URL
  useEffect(() => {
    if (audioRef.current && url) {
      audioRef.current.src = url;
      audioRef.current.load();
      setPlaybackState(PlaybackState.STOPPED);
      setCurrentTime(0);
    }
  }, [url]);
  
  // 播放
  const play = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play()
        .then(() => {
          setPlaybackState(PlaybackState.PLAYING);
          
          if (intervalRef.current) {
            window.clearInterval(intervalRef.current);
          }
          
          intervalRef.current = window.setInterval(() => {
            if (audioRef.current) {
              setCurrentTime(audioRef.current.currentTime);
            }
          }, 100);
        })
        .catch((error) => {
          console.error('播放失败:', error);
        });
    }
  }, []);
  
  // 暂停
  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setPlaybackState(PlaybackState.PAUSED);
      
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, []);
  
  // 停止
  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setPlaybackState(PlaybackState.STOPPED);
      setCurrentTime(0);
      
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, []);
  
  // 跳转
  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);
  
  // 设置音量
  const setVolume = useCallback((newVolume: number) => {
    if (audioRef.current) {
      const clampedVolume = Math.max(0, Math.min(1, newVolume));
      audioRef.current.volume = clampedVolume;
      setVolumeState(clampedVolume);
    }
  }, []);
  
  return {
    playbackState,
    currentTime,
    duration,
    volume,
    play,
    pause,
    stop,
    seek,
    setVolume,
  };
};
