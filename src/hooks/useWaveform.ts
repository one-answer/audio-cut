import { useState, useEffect, useRef, useCallback } from 'react';
import { createWaveSurfer, addTimelinePlugin, addRegionsPlugin } from '../services/waveformRenderer';
import { AudioRegion, PlaybackState } from '../types/audio';

// 导入wavesurfer.js
const WaveSurfer = require('wavesurfer.js');
const RegionsPlugin = require('wavesurfer.js/dist/plugin/wavesurfer.regions.js');

interface UseWaveformProps {
  url?: string;
  container: HTMLElement | null;
  timelineContainer: HTMLElement | null;
  onReady?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  onFinish?: () => void;
  onSeek?: (time: number) => void;
  onRegionCreated?: (region: AudioRegion) => void;
  onRegionUpdated?: (region: AudioRegion) => void;
  onRegionRemoved?: (regionId: string) => void;
}

interface UseWaveformReturn {
  wavesurfer: any;
  isReady: boolean;
  playbackState: PlaybackState;
  currentTime: number;
  duration: number;
  play: () => void;
  pause: () => void;
  stop: () => void;
  seek: (time: number) => void;
  zoom: (level: number) => void;
  createRegion: (region: AudioRegion) => void;
  updateRegion: (region: AudioRegion) => void;
  removeRegion: (regionId: string) => void;
  clearRegions: () => void;
}

export const useWaveform = ({
  url,
  container,
  timelineContainer,
  onReady,
  onPlay,
  onPause,
  onFinish,
  onSeek,
  onRegionCreated,
  onRegionUpdated,
  onRegionRemoved,
}: UseWaveformProps): UseWaveformReturn => {
  const [wavesurfer, setWavesurfer] = useState<any>(null);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [playbackState, setPlaybackState] = useState<PlaybackState>(PlaybackState.STOPPED);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  const intervalRef = useRef<number | null>(null);

  // 初始化WaveSurfer
  useEffect(() => {
    // 如果已经有wavesurfer实例，先销毁它
    if (wavesurfer) {
      wavesurfer.destroy();
      setWavesurfer(null);
      setIsReady(false);
    }

    // 只有当container存在时才创建wavesurfer
    if (container) {
      console.log('Creating WaveSurfer instance with container:', container);
      const ws = createWaveSurfer(container);

      if (timelineContainer) {
        console.log('Adding timeline plugin with container:', timelineContainer);
        addTimelinePlugin(ws, timelineContainer);
      }

      console.log('Adding regions plugin');
      addRegionsPlugin(ws);

      ws.on('ready', () => {
        setIsReady(true);
        setDuration(ws.getDuration());
        if (onReady) {
          onReady();
        }
      });

      ws.on('play', () => {
        setPlaybackState(PlaybackState.PLAYING);
        if (onPlay) {
          onPlay();
        }

        if (intervalRef.current) {
          window.clearInterval(intervalRef.current);
        }

        intervalRef.current = window.setInterval(() => {
          setCurrentTime(ws.getCurrentTime());
        }, 100);
      });

      ws.on('pause', () => {
        setPlaybackState(PlaybackState.PAUSED);
        if (onPause) {
          onPause();
        }

        if (intervalRef.current) {
          window.clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      });

      ws.on('finish', () => {
        setPlaybackState(PlaybackState.STOPPED);
        if (onFinish) {
          onFinish();
        }

        if (intervalRef.current) {
          window.clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      });

      ws.on('seek', () => {
        setCurrentTime(ws.getCurrentTime());
        if (onSeek) {
          onSeek(ws.getCurrentTime());
        }
      });

      // 监听区域事件
      console.log('Setting up region event listeners');

      try {
        // 添加 wavesurfer 实例的事件监听器
        ws.on('region-created', (region: any) => {
          console.log('region-created event triggered:', region);
          if (onRegionCreated) {
            const regionData = {
              id: region.id,
              start: region.start,
              end: region.end,
              color: region.color,
              drag: region.drag,
              resize: region.resize,
            };
            console.log('Calling onRegionCreated with:', regionData);
            onRegionCreated(regionData);
          }
        });

        ws.on('region-updated', (region: any) => {
          console.log('region-updated event triggered:', region);
          if (onRegionUpdated) {
            const regionData = {
              id: region.id,
              start: region.start,
              end: region.end,
              color: region.color,
              drag: region.drag,
              resize: region.resize,
            };
            console.log('Calling onRegionUpdated with:', regionData);
            onRegionUpdated(regionData);
          }
        });

        ws.on('region-removed', (region: any) => {
          console.log('region-removed event triggered:', region);
          if (onRegionRemoved) {
            console.log('Calling onRegionRemoved with:', region.id);
            onRegionRemoved(region.id);
          }
        });
      } catch (error) {
        console.error('Error setting up wavesurfer event listeners:', error);
      }

      // 手动添加区域事件监听
      if (ws.regions) {
        console.log('Checking regions plugin capabilities');
        console.log('ws.regions:', ws.regions);
        console.log('ws.regions.on exists:', typeof ws.regions.on === 'function');

        // 检查 regions 插件是否支持 on 方法
        if (typeof ws.regions.on === 'function') {
          console.log('Adding event listeners directly to regions plugin');
          try {
            ws.regions.on('region-created', (region: any) => {
              console.log('regions.region-created event triggered:', region);
              if (onRegionCreated) {
                const regionData = {
                  id: region.id,
                  start: region.start,
                  end: region.end,
                  color: region.color,
                  drag: region.drag,
                  resize: region.resize,
                };
                console.log('Calling onRegionCreated with:', regionData);
                onRegionCreated(regionData);
              }
            });
          } catch (error) {
            console.error('Error adding event listener to regions plugin:', error);
          }
        } else {
          console.log('regions.on is not a function, using wavesurfer events instead');

          // 如果 regions 插件不支持 on 方法，我们可以尝试使用其他方法
          // 检查是否有 enableDragSelection 方法
          if (typeof ws.regions.enableDragSelection === 'function') {
            console.log('regions.enableDragSelection exists, enabling drag selection');
            try {
              ws.regions.enableDragSelection({
                color: 'rgba(0, 123, 255, 0.2)'
              });
            } catch (dragError) {
              console.error('Error enabling drag selection:', dragError);
            }
          }
        }
      } else {
        console.log('No regions property found on wavesurfer instance');

        // 如果没有 regions 属性，尝试创建它
        try {
          console.log('Attempting to create regions plugin');
          const regions = addRegionsPlugin(ws);
          console.log('Regions plugin created:', regions);
        } catch (createError) {
          console.error('Error creating regions plugin:', createError);
        }
      }

      setWavesurfer(ws);

      // 如果有URL，立即加载
      if (url) {
        console.log('Loading URL:', url);
        ws.load(url);
      }

      return () => {
        console.log('Cleaning up WaveSurfer instance');
        if (intervalRef.current) {
          window.clearInterval(intervalRef.current);
        }
        ws.destroy();
      };
    }
  }, [container, timelineContainer]);

  // 加载音频URL
  useEffect(() => {
    if (wavesurfer && url) {
      console.log('URL changed, loading new URL:', url);
      wavesurfer.load(url);
      setIsReady(false);
      setPlaybackState(PlaybackState.STOPPED);
      setCurrentTime(0);
    }
  }, [wavesurfer, url]);

  // 播放
  const play = useCallback(() => {
    if (wavesurfer && isReady) {
      wavesurfer.play();
    }
  }, [wavesurfer, isReady]);

  // 暂停
  const pause = useCallback(() => {
    if (wavesurfer && isReady) {
      wavesurfer.pause();
    }
  }, [wavesurfer, isReady]);

  // 停止
  const stop = useCallback(() => {
    if (wavesurfer && isReady) {
      wavesurfer.stop();
      setPlaybackState(PlaybackState.STOPPED);
    }
  }, [wavesurfer, isReady]);

  // 跳转
  const seek = useCallback((time: number) => {
    if (wavesurfer && isReady) {
      wavesurfer.seekTo(time / duration);
    }
  }, [wavesurfer, isReady, duration]);

  // 缩放
  const zoom = useCallback((level: number) => {
    if (wavesurfer && isReady) {
      wavesurfer.zoom(level);
    }
  }, [wavesurfer, isReady]);

  // 创建区域
  const createRegion = useCallback((region: AudioRegion) => {
    console.log('createRegion called with:', region);
    console.log('wavesurfer:', wavesurfer);
    console.log('isReady:', isReady);

    if (wavesurfer && isReady) {
      try {
        // 检查是否需要初始化区域插件
        if (!wavesurfer.regions && typeof RegionsPlugin !== 'undefined') {
          console.log('Regions plugin not found, initializing it now');
          // 尝试初始化区域插件
          const regionsPlugin = addRegionsPlugin(wavesurfer);
          console.log('Regions plugin initialized:', regionsPlugin);
        }

        // 直接使用 wavesurfer.regions 属性
        if (wavesurfer.regions) {
          console.log('Using wavesurfer.regions to add region');
          try {
            const newRegion = wavesurfer.regions.addRegion({
              id: region.id,
              start: region.start,
              end: region.end,
              color: region.color || 'rgba(0, 123, 255, 0.2)',
              drag: region.drag !== undefined ? region.drag : true,
              resize: region.resize !== undefined ? region.resize : true,
            });
            console.log('Region added successfully:', newRegion);
            return;
          } catch (addRegionError) {
            console.error('Error adding region via wavesurfer.regions:', addRegionError);
          }
        }

        // 如果没有 regions 属性，尝试从插件数组中查找
        console.log('wavesurfer.plugins:', wavesurfer.plugins);
        if (Array.isArray(wavesurfer.plugins) && wavesurfer.plugins.length > 0) {
          console.log('Searching for RegionsPlugin in plugins array');

          // 尝试查找任何可能的区域插件
          let regionsPlugin: any = null;

          // 首先尝试按构造函数名查找
          regionsPlugin = wavesurfer.plugins.find(
            (plugin: any) => plugin.constructor && plugin.constructor.name === 'RegionsPlugin'
          );

          // 如果没找到，尝试查找具有 addRegion 方法的插件
          if (!regionsPlugin) {
            regionsPlugin = wavesurfer.plugins.find(
              (plugin: any) => typeof plugin.addRegion === 'function'
            );
          }

          // 如果找到了插件，尝试添加区域
          if (regionsPlugin) {
            console.log('RegionsPlugin found, adding region');
            try {
              const newRegion = regionsPlugin.addRegion({
                id: region.id,
                start: region.start,
                end: region.end,
                color: region.color || 'rgba(0, 123, 255, 0.2)',
                drag: region.drag !== undefined ? region.drag : true,
                resize: region.resize !== undefined ? region.resize : true,
              });
              console.log('Region added successfully via plugin:', newRegion);

              // 将插件存储在 wavesurfer.regions 中以便于以后使用
              if (!wavesurfer.regions) {
                wavesurfer.regions = regionsPlugin;
              }

              return;
            } catch (addRegionError) {
              console.error('Error adding region via plugin:', addRegionError);
            }
          } else {
            console.error('RegionsPlugin not found in plugins array');
          }
        } else {
          console.error('wavesurfer.plugins is not an array or is empty');
        }

        // 如果上述方法都失败，尝试直接创建区域插件
        console.log('Attempting to create regions plugin directly');
        try {
          const regions = RegionsPlugin.create();

          // 初始化插件
          if (typeof regions.init === 'function') {
            try {
              regions.init({
                wavesurfer: wavesurfer,
                dragSelection: {
                  slop: 5,
                  color: 'rgba(0, 123, 255, 0.2)',
                },
              });
            } catch (initError) {
              console.error('Error initializing with options:', initError);
              // 尝试简单初始化
              regions.init(wavesurfer);
            }
          }

          // 初始化插件数组
          wavesurfer.plugins = wavesurfer.plugins || [];
          wavesurfer.plugins.push(regions);
          wavesurfer.regions = regions;

          console.log('Adding region to newly created plugin');
          const newRegion = wavesurfer.regions.addRegion({
            id: region.id,
            start: region.start,
            end: region.end,
            color: region.color || 'rgba(0, 123, 255, 0.2)',
            drag: region.drag !== undefined ? region.drag : true,
            resize: region.resize !== undefined ? region.resize : true,
          });
          console.log('Region added successfully to new plugin:', newRegion);
        } catch (createPluginError) {
          console.error('Failed to create regions plugin directly:', createPluginError);
          throw new Error('Unable to create or find regions plugin');
        }
      } catch (error) {
        console.error('Error creating region:', error);
      }
    } else {
      console.error('Cannot create region: wavesurfer not ready or not initialized');
    }
  }, [wavesurfer, isReady]);

  // 更新区域
  const updateRegion = useCallback((region: AudioRegion) => {
    if (wavesurfer && isReady) {
      // 直接使用 wavesurfer.regions 属性
      if (wavesurfer.regions) {
        const existingRegion = wavesurfer.regions.getRegions().find((r: any) => r.id === region.id);
        if (existingRegion) {
          existingRegion.update({
            start: region.start,
            end: region.end,
            color: region.color,
            drag: region.drag,
            resize: region.resize,
          });
        }
        return;
      }

      // 如果没有 regions 属性，尝试从插件数组中查找
      if (Array.isArray(wavesurfer.plugins)) {
        const regionsPlugin = wavesurfer.plugins.find(
          (plugin: any) => plugin.constructor && plugin.constructor.name === 'RegionsPlugin'
        );

        if (regionsPlugin) {
          const existingRegion = regionsPlugin.getRegions().find((r: any) => r.id === region.id);
          if (existingRegion) {
            existingRegion.update({
              start: region.start,
              end: region.end,
              color: region.color,
              drag: region.drag,
              resize: region.resize,
            });
          }
        }
      }
    }
  }, [wavesurfer, isReady]);

  // 删除区域
  const removeRegion = useCallback((regionId: string) => {
    if (wavesurfer && isReady) {
      // 直接使用 wavesurfer.regions 属性
      if (wavesurfer.regions) {
        const existingRegion = wavesurfer.regions.getRegions().find((r: any) => r.id === regionId);
        if (existingRegion) {
          existingRegion.remove();
        }
        return;
      }

      // 如果没有 regions 属性，尝试从插件数组中查找
      if (Array.isArray(wavesurfer.plugins)) {
        const regionsPlugin = wavesurfer.plugins.find(
          (plugin: any) => plugin.constructor && plugin.constructor.name === 'RegionsPlugin'
        );

        if (regionsPlugin) {
          const existingRegion = regionsPlugin.getRegions().find((r: any) => r.id === regionId);
          if (existingRegion) {
            existingRegion.remove();
          }
        }
      }
    }
  }, [wavesurfer, isReady]);

  // 清除所有区域
  const clearRegions = useCallback(() => {
    if (wavesurfer && isReady) {
      // 直接使用 wavesurfer.regions 属性
      if (wavesurfer.regions) {
        wavesurfer.regions.clearRegions();
        return;
      }

      // 如果没有 regions 属性，尝试从插件数组中查找
      if (Array.isArray(wavesurfer.plugins)) {
        const regionsPlugin = wavesurfer.plugins.find(
          (plugin: any) => plugin.constructor && plugin.constructor.name === 'RegionsPlugin'
        );

        if (regionsPlugin) {
          regionsPlugin.clearRegions();
        }
      }
    }
  }, [wavesurfer, isReady]);

  return {
    wavesurfer,
    isReady,
    playbackState,
    currentTime,
    duration,
    play,
    pause,
    stop,
    seek,
    zoom,
    createRegion,
    updateRegion,
    removeRegion,
    clearRegions,
  };
};
