import React, { useState, useRef, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Button, Slider, Space, message, Card, Tooltip } from 'antd';
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  ScissorOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  SoundOutlined,
  HighlightOutlined,
  DeleteOutlined,
  ControlOutlined,
  UploadOutlined,
  InfoCircleOutlined,
  ArrowLeftOutlined,
  SaveOutlined,
  CopyOutlined,
  SelectOutlined,
  EditOutlined,
  UndoOutlined,
} from '@ant-design/icons';
import { useWaveform } from '../../hooks/useWaveform';
import { AudioFile, AudioRegion, PlaybackState } from '../../types/audio';
import { formatTime } from '../../utils/audioHelpers';
import { trimAudio, audioBufferToBlob, loadAudioFromUrl } from '../../services/audioProcessing';
import { createAudioFileFromBlob, downloadAudioFile } from '../../services/fileHandling';
import SaveDialog from './SaveDialog';
// 这些组件暂时未使用，但保留导入以便将来使用
// import WaveformDisplay from './WaveformDisplay';
// import AudioControls from './AudioControls';
// import TimelineMarker from './TimelineMarker';
import './AudioEditor.css';

// 导入 RegionsPlugin
const RegionsPlugin = require('wavesurfer.js/dist/plugin/wavesurfer.regions.js');

interface AudioEditorProps {
  audioFile?: AudioFile;
  onSave?: (audioFile: AudioFile) => void;
  onBack?: () => void; // 返回按钮回调
}

const AudioEditor: React.FC<AudioEditorProps> = ({ audioFile, onSave, onBack }) => {
  const [zoomLevel, setZoomLevel] = useState<number>(50);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPreviewing, setIsPreviewing] = useState<boolean>(false);
  const [previewInterval, setPreviewInterval] = useState<NodeJS.Timeout | null>(null);
  const [saveDialogVisible, setSaveDialogVisible] = useState<boolean>(false);
  const [trimmedAudioFile, setTrimmedAudioFile] = useState<AudioFile | null>(null);
  const [defaultFileName, setDefaultFileName] = useState<string>('');

  const waveformContainerRef = useRef<HTMLDivElement>(null);
  const timelineContainerRef = useRef<HTMLDivElement>(null);

  // 使用状态来跟踪容器是否已准备好
  const [containerReady, setContainerReady] = useState<boolean>(false);

  // 当ref有值时更新containerReady状态
  useEffect(() => {
    if (waveformContainerRef.current && timelineContainerRef.current) {
      setContainerReady(true);
    }
  }, []);

  const {
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
  } = useWaveform({
    url: audioFile?.url,
    container: containerReady ? waveformContainerRef.current : null,
    timelineContainer: containerReady ? timelineContainerRef.current : null,
    onReady: () => {
      // 当波形加载完成时，设置结束时间为音频时长
      if (wavesurfer) {
        const audioDuration = wavesurfer.getDuration();
        setEndTime(audioDuration);
      }
    },
    onSeek: (time) => {
      // 当用户点击波形时，更新当前时间
      if (!isPreviewing) {
        setStartTime(time);
      }
    },
  });

  // 应用缩放级别
  useEffect(() => {
    if (isReady) {
      zoom(zoomLevel);
    }
  }, [isReady, zoom, zoomLevel]);

  // 设置开始点
  const handleSetStartPoint = useCallback(() => {
    if (!isReady || !wavesurfer) {
      message.warning('音频波形还未准备好');
      return;
    }

    const time = wavesurfer.getCurrentTime();
    setStartTime(time);

    // 如果开始时间大于结束时间，则自动调整结束时间
    if (time >= endTime) {
      setEndTime(Math.min(time + 5, duration));
    }

    message.success(`已设置开始点: ${formatTime(time)}`);

    // 在波形上标记开始点
    drawMarker(time, 'start-marker');
  }, [isReady, wavesurfer, endTime, duration]);

  // 设置结束点
  const handleSetEndPoint = useCallback(() => {
    if (!isReady || !wavesurfer) {
      message.warning('音频波形还未准备好');
      return;
    }

    const time = wavesurfer.getCurrentTime();
    setEndTime(time);

    // 如果结束时间小于开始时间，则自动调整开始时间
    if (time <= startTime) {
      setStartTime(Math.max(time - 5, 0));
    }

    message.success(`已设置结束点: ${formatTime(time)}`);

    // 在波形上标记结束点
    drawMarker(time, 'end-marker');
  }, [isReady, wavesurfer, startTime]);

  // 在波形上绘制标记
  const drawMarker = useCallback((time: number, className: string) => {
    if (!wavesurfer) return;

    // 移除现有的标记
    const existingMarker = document.querySelector(`.${className}`);
    if (existingMarker) {
      existingMarker.remove();
    }

    // 创建新标记
    const container = waveformContainerRef.current;
    if (!container) return;

    const marker = document.createElement('div');
    marker.className = `time-marker ${className}`;
    marker.style.position = 'absolute';
    marker.style.top = '0';
    marker.style.height = '100%';
    marker.style.width = '2px';
    marker.style.backgroundColor = className === 'start-marker' ? '#52c41a' : '#f5222d';
    marker.style.zIndex = '5';
    marker.style.pointerEvents = 'none';

    // 计算标记位置
    const percent = time / duration;
    marker.style.left = `${percent * 100}%`;

    container.appendChild(marker);
  }, [wavesurfer, duration]);

  // 预览选定区域
  const handlePreview = useCallback(() => {
    if (!isReady || !wavesurfer) {
      message.warning('音频波形还未准备好');
      return;
    }

    if (isPreviewing) {
      // 停止预览
      if (previewInterval) {
        clearInterval(previewInterval);
        setPreviewInterval(null);
      }
      setIsPreviewing(false);
      stop();
      message.info('预览已停止');
      return;
    }

    // 开始预览
    setIsPreviewing(true);

    // 跳转到开始点
    seek(startTime);
    play();

    // 设置定时器检查是否超过结束点
    const interval = setInterval(() => {
      if (wavesurfer) {
        const currentTime = wavesurfer.getCurrentTime();
        if (currentTime >= endTime) {
          // 如果超过结束点，则跳回开始点继续播放
          seek(startTime);
        }
      }
    }, 100);

    setPreviewInterval(interval);
    message.success('正在预览选定区域');
  }, [isReady, wavesurfer, isPreviewing, previewInterval, startTime, endTime, play, stop, seek]);

  // 组件卸载时清除定时器
  useEffect(() => {
    return () => {
      if (previewInterval) {
        clearInterval(previewInterval);
      }
    };
  }, [previewInterval]);

  // 当开始点或结束点变化时，重新绘制标记和高亮区域
  useEffect(() => {
    if (isReady && wavesurfer) {
      // 绘制标记
      drawMarker(startTime, 'start-marker');
      drawMarker(endTime, 'end-marker');

      // 绘制选择区域高亮
      const container = waveformContainerRef.current;
      if (container) {
        // 移除现有的高亮
        const existingHighlight = document.querySelector('.selection-highlight');
        if (existingHighlight) {
          existingHighlight.remove();
        }

        // 创建新的高亮
        const highlight = document.createElement('div');
        highlight.className = 'selection-highlight';

        // 计算高亮位置和宽度
        const startPercent = startTime / duration * 100;
        const endPercent = endTime / duration * 100;
        highlight.style.left = `${startPercent}%`;
        highlight.style.width = `${endPercent - startPercent}%`;

        container.appendChild(highlight);
      }
    }
  }, [isReady, wavesurfer, startTime, endTime, drawMarker, duration]);

  // 剪切选定区域
  const handleTrimAudio = useCallback(async () => {
    console.log('handleTrimAudio called');
    console.log('wavesurfer:', wavesurfer);
    console.log('startTime:', startTime);
    console.log('endTime:', endTime);
    console.log('audioFile:', audioFile);

    if (!wavesurfer || !audioFile) {
      message.warning('请先加载音频文件');
      return;
    }

    if (startTime >= endTime) {
      message.warning('开始时间必须小于结束时间');
      return;
    }

    try {
      // 停止预览
      if (isPreviewing && previewInterval) {
        clearInterval(previewInterval);
        setPreviewInterval(null);
        setIsPreviewing(false);
      }

      setIsProcessing(true);
      message.loading('正在处理音频数据...');

      // 获取音频数据
      console.log('获取音频数据...');
      console.log('wavesurfer:', wavesurfer);
      console.log('wavesurfer.backend:', wavesurfer.backend);

      // 尝试不同的方法获取音频数据
      let audioData: AudioBuffer | null = null;

      // 方法 1: 尝试使用 getDecodedData
      if (typeof wavesurfer.getDecodedData === 'function') {
        console.log('尝试使用 getDecodedData 方法');
        audioData = wavesurfer.getDecodedData();
      }
      // 方法 2: 尝试使用 backend.buffer
      else if (wavesurfer.backend && wavesurfer.backend.buffer) {
        console.log('尝试使用 backend.buffer');
        audioData = wavesurfer.backend.buffer;
      }
      // 方法 3: 尝试使用 backend.getBuffer
      else if (wavesurfer.backend && typeof wavesurfer.backend.getBuffer === 'function') {
        console.log('尝试使用 backend.getBuffer 方法');
        audioData = wavesurfer.backend.getBuffer();
      }
      // 方法 4: 如果以上方法都失败，尝试从 URL 重新加载音频
      else if (audioFile && audioFile.url) {
        console.log('尝试从 URL 重新加载音频:', audioFile.url);
        message.info('正在重新加载音频数据...');
        try {
          // 从 URL 加载音频数据
          audioData = await loadAudioFromUrl(audioFile.url);
          console.log('从 URL 加载音频数据成功');
        } catch (loadError) {
          console.error('从 URL 加载音频数据失败:', loadError);
          throw new Error('无法从 URL 加载音频数据');
        }
      }

      console.log('audioData:', audioData);

      if (!audioData) {
        throw new Error('无法获取音频数据，请尝试重新加载音频');
      }

      // 剪切音频
      console.log(`剪切音频从 ${formatTime(startTime)} 到 ${formatTime(endTime)}...`);
      const trimmedAudio = trimAudio(
        audioData,
        startTime,
        endTime
      );
      console.log('trimmedAudio:', trimmedAudio);

      // 转换为Blob
      console.log('转换为 Blob...');
      const blob = await audioBufferToBlob(trimmedAudio);
      console.log('blob:', blob);

      // 创建默认文件名
      console.log('准备文件名...');
      const defaultName = `${audioFile.name.split('.')[0]}_${formatTime(startTime).replace(':', '-')}_${formatTime(endTime).replace(':', '-')}`;
      const extension = audioFile.name.split('.').pop() || 'wav';
      const newFileName = `${defaultName}.${extension}`;
      console.log('newFileName:', newFileName);

      // 创建新的音频文件
      const newAudioFile = await createAudioFileFromBlob(blob, newFileName);
      console.log('newAudioFile:', newAudioFile);

      // 设置剪切后的音频文件和默认文件名
      setTrimmedAudioFile(newAudioFile);
      setDefaultFileName(defaultName);

      // 显示保存对话框
      setSaveDialogVisible(true);

      message.success('音频剪切成功，请选择保存方式');
    } catch (error: any) {
      console.error('剪切音频失败:', error);
      message.error(`剪切音频失败: ${error.message || '未知错误'}`);
    } finally {
      setIsProcessing(false);
      stop(); // 停止播放
    }
  }, [wavesurfer, startTime, endTime, audioFile, onSave, isPreviewing, previewInterval, stop]);

  // 增加缩放级别
  const handleZoomIn = useCallback(() => {
    setZoomLevel((prev) => Math.min(prev + 10, 100));
  }, []);

  // 减少缩放级别
  const handleZoomOut = useCallback(() => {
    setZoomLevel((prev) => Math.max(prev - 10, 10));
  }, []);

  // 处理保存对话框的保存操作
  const handleSaveDialogSave = useCallback((audioFile: AudioFile, saveType: 'download' | 'library') => {
    console.log('Saving audio file:', audioFile, 'Save type:', saveType);

    try {
      if (saveType === 'download') {
        // 下载文件
        downloadAudioFile(audioFile);
        message.success('音频文件已开始下载');
      } else {
        // 保存到应用程序
        if (onSave) {
          onSave(audioFile);
          message.success('音频文件已保存到音频库');
        } else {
          // 如果没有 onSave 回调，则默认下载
          downloadAudioFile(audioFile);
          message.success('音频文件已开始下载');
        }
      }

      // 关闭对话框
      setSaveDialogVisible(false);
    } catch (error: any) {
      console.error('Error saving audio file:', error);
      message.error(`保存音频文件失败: ${error.message || '未知错误'}`);
    }
  }, [onSave]);

  // 处理保存对话框的取消操作
  const handleSaveDialogCancel = useCallback(() => {
    console.log('Save dialog cancelled');
    setSaveDialogVisible(false);

    // 释放临时音频文件的 URL
    if (trimmedAudioFile) {
      URL.revokeObjectURL(trimmedAudioFile.url);
    }

    setTrimmedAudioFile(null);
    setDefaultFileName('');
  }, [trimmedAudioFile]);

  // 播放/暂停切换
  const handlePlayPause = useCallback(() => {
    if (playbackState === PlaybackState.PLAYING) {
      pause();
    } else {
      play();
    }
  }, [playbackState, play, pause]);

  // 选择全部音频
  const handleSelectAll = useCallback(() => {
    if (!wavesurfer || !isReady) {
      message.warning('音频波形还未准备好');
      return;
    }

    // 设置开始时间为0，结束时间为音频时长
    setStartTime(0);
    setEndTime(duration);

    // 绘制标记
    drawMarker(0, 'start-marker');
    drawMarker(duration, 'end-marker');

    message.success('已选择全部音频');
  }, [wavesurfer, isReady, duration, drawMarker]);

  // 重置选择
  const handleResetSelection = useCallback(() => {
    if (!isReady) {
      return;
    }

    // 重置开始时间和结束时间
    setStartTime(0);
    setEndTime(duration);

    // 绘制标记
    drawMarker(0, 'start-marker');
    drawMarker(duration, 'end-marker');

    message.success('已重置选择');
  }, [isReady, duration, drawMarker]);

  // 添加快捷键支持
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isReady) return;

      // 禁用在输入框中的快捷键
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.code) {
        case 'Space': // 空格键播放/暂停
          e.preventDefault();
          handlePlayPause();
          break;
        case 'KeyS': // S 键停止
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            stop();
          }
          break;
        case 'KeyB': // B 键设置开始点
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            handleSetStartPoint();
          }
          break;
        case 'KeyE': // E 键设置结束点
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            handleSetEndPoint();
          }
          break;
        case 'KeyP': // P 键预览
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            handlePreview();
          }
          break;
        case 'KeyA': // A 键选择全部
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleSelectAll();
          }
          break;
        case 'KeyR': // R 键重置选择
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            handleResetSelection();
          }
          break;
        case 'KeyC': // C 键剪切
          if (e.ctrlKey || e.metaKey && e.shiftKey) {
            e.preventDefault();
            handleTrimAudio();
          }
          break;
        case 'Equal': // + 键放大
        case 'NumpadAdd':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleZoomIn();
          }
          break;
        case 'Minus': // - 键缩小
        case 'NumpadSubtract':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleZoomOut();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isReady, handlePlayPause, stop, handleSetStartPoint, handleSetEndPoint, handlePreview, handleSelectAll, handleResetSelection, handleTrimAudio, handleZoomIn, handleZoomOut]);

  // 渲染播放控制按钮
  const renderPlaybackControls = () => {
    return (
      <div className="controls-section">
        <h4><SoundOutlined /> 播放控制</h4>
        <Space wrap>
          <Tooltip title="播放/暂停 [空格]">
            <Button
              type="primary"
              icon={playbackState === PlaybackState.PLAYING ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
              onClick={handlePlayPause}
              disabled={!isReady}
              size="middle"
            >
              {playbackState === PlaybackState.PLAYING ? '暂停' : '播放'}
            </Button>
          </Tooltip>
          <Tooltip title="停止 [S]">
            <Button
              icon={<StopOutlined />}
              onClick={stop}
              disabled={!isReady || playbackState === PlaybackState.STOPPED}
              size="middle"
            >
              停止
            </Button>
          </Tooltip>

          {/* 进度条 */}
          {isReady && duration > 0 && (
            <div style={{ width: '100%', marginTop: 8 }}>
              <div className="progress-bar" style={{ height: 4, backgroundColor: '#f0f0f0', borderRadius: 2, overflow: 'hidden', marginBottom: 4 }}>
                <div
                  className="progress-bar-inner"
                  style={{
                    width: `${Math.min(Math.round((currentTime / duration) * 100), 100)}%`,
                    height: '100%',
                    backgroundColor: '#1890ff',
                    transition: 'width 0.3s'
                  }}
                />
              </div>
            </div>
          )}
        </Space>
      </div>
    );
  };

  // 渲染剪辑控制按钮
  const renderEditControls = () => {
    return (
      <div className="controls-section">
        <h4><EditOutlined /> 剪辑控制</h4>
        <Space wrap>
          <Tooltip title="设置开始点 [B]">
            <Button
              icon={<ScissorOutlined style={{ color: '#52c41a' }} />}
              onClick={handleSetStartPoint}
              disabled={!isReady}
              size="middle"
            >
              设置开始点
            </Button>
          </Tooltip>

          <Tooltip title="设置结束点 [E]">
            <Button
              icon={<ScissorOutlined style={{ color: '#f5222d' }} />}
              onClick={handleSetEndPoint}
              disabled={!isReady}
              size="middle"
            >
              设置结束点
            </Button>
          </Tooltip>

          <Tooltip title="选择全部 [Ctrl+A]">
            <Button
              icon={<HighlightOutlined />}
              onClick={handleSelectAll}
              disabled={!isReady}
              size="middle"
            >
              选择全部
            </Button>
          </Tooltip>

          <Tooltip title="重置选择 [R]">
            <Button
              icon={<UndoOutlined />}
              onClick={handleResetSelection}
              disabled={!isReady}
              size="middle"
            >
              重置选择
            </Button>
          </Tooltip>

          <Tooltip title="预览选定区域 [P]">
            <Button
              type={isPreviewing ? 'primary' : 'default'}
              icon={isPreviewing ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
              onClick={handlePreview}
              disabled={!isReady || startTime >= endTime}
              size="middle"
            >
              {isPreviewing ? '停止预览' : '预览区域'}
            </Button>
          </Tooltip>

          <Tooltip title="剪切选定区域 [Ctrl+Shift+C]">
            <Button
              type="primary"
              icon={<ScissorOutlined />}
              onClick={handleTrimAudio}
              disabled={!isReady || startTime >= endTime || isProcessing}
              loading={isProcessing}
              size="middle"
            >
              剪辑区域
            </Button>
          </Tooltip>
        </Space>
      </div>
    );
  };

  // 渲染缩放控制按钮
  const renderZoomControls = () => {
    return (
      <div className="controls-section">
        <h4><ControlOutlined /> 缩放控制</h4>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Space wrap>
            <Tooltip title="放大 [Ctrl/Cmd +]">
              <Button
                icon={<ZoomInOutlined />}
                onClick={handleZoomIn}
                disabled={!isReady || zoomLevel >= 100}
                size="middle"
              >
                放大
              </Button>
            </Tooltip>
            <Tooltip title="缩小 [Ctrl/Cmd -]">
              <Button
                icon={<ZoomOutOutlined />}
                onClick={handleZoomOut}
                disabled={!isReady || zoomLevel <= 10}
                size="middle"
              >
                缩小
              </Button>
            </Tooltip>
          </Space>

          <Slider
            min={10}
            max={100}
            value={zoomLevel}
            onChange={setZoomLevel}
            disabled={!isReady}
            className="zoom-slider"
            tipFormatter={(value) => `${value}%`}
          />
        </Space>
      </div>
    );
  };

  // 渲染选定区域信息
  const renderRegionInfo = () => {
    if (!isReady) return null;

    const selectionDuration = endTime - startTime;
    const selectionPercentage = duration > 0 ? (selectionDuration / duration) * 100 : 0;

    return (
      <div className="region-info">
        <h4><InfoCircleOutlined /> 选定区域信息</h4>
        <p>
          <span>开始时间</span>
          <span>{formatTime(startTime)}</span>
        </p>
        <p>
          <span>结束时间</span>
          <span>{formatTime(endTime)}</span>
        </p>
        <p>
          <span>区域长度</span>
          <span>{formatTime(selectionDuration)} ({selectionPercentage.toFixed(1)}%)</span>
        </p>
        <p>
          <span>当前位置</span>
          <span>{formatTime(currentTime)}</span>
        </p>
        <p>
          <span>总时长</span>
          <span>{formatTime(duration)}</span>
        </p>
      </div>
    );
  };

  // 渲染播放头指示器
  const renderPlayhead = () => {
    if (!isReady || duration === 0) return null;

    const position = (currentTime / duration) * 100;
    return (
      <div
        className="playhead-marker"
        style={{ left: `${position}%` }}
      />
    );
  };

  return (
    <div className="audio-editor">
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <SoundOutlined style={{ marginRight: 8, color: '#1890ff' }} />
              <span>音频剪辑器</span>
              {audioFile && (
                <span style={{ marginLeft: 12, fontSize: 14, color: '#8c8c8c', fontWeight: 'normal' }}>
                  {audioFile.name}
                </span>
              )}
            </div>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={onBack}
              type="primary"
              ghost
              style={{ marginLeft: 'auto' }}
            >
              返回
            </Button>
          </div>
        }
        bordered={false}
        style={{ boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)' }}
      >
        {audioFile ? (
          <>
            {/* 波形显示区域 */}
            <div className="waveform-container">
              <div ref={waveformContainerRef} className="waveform" />
              {renderPlayhead()}
              <div ref={timelineContainerRef} className="timeline" />
            </div>

            {/* 时间显示 */}
            <div className="time-display">
              <span className="current-time">{formatTime(currentTime)}</span>
              <span>/ {formatTime(duration)}</span>
            </div>

            {/* 控制区域 */}
            <div className="editor-controls">
              <div className="controls-group">
                {renderPlaybackControls()}
                {renderEditControls()}
              </div>

              <div className="controls-group">
                {renderZoomControls()}
                {renderRegionInfo()}
              </div>
            </div>

            {/* 快捷键提示 */}
            <div className="shortcut-guide">
              <h4><InfoCircleOutlined /> 快捷键指南</h4>
              <div className="shortcut-grid">
                <div><span className="shortcut-hint">空格</span> 播放/暂停</div>
                <div><span className="shortcut-hint">S</span> 停止</div>
                <div><span className="shortcut-hint">B</span> 设置开始点</div>
                <div><span className="shortcut-hint">E</span> 设置结束点</div>
                <div><span className="shortcut-hint">P</span> 预览区域</div>
                <div><span className="shortcut-hint">R</span> 重置选择</div>
                <div><span className="shortcut-hint">Ctrl+A</span> 选择全部</div>
                <div><span className="shortcut-hint">Ctrl+Shift+C</span> 剪切区域</div>
                <div><span className="shortcut-hint">Ctrl+/−</span> 缩放</div>
              </div>
            </div>
          </>
        ) : (
          <div className="no-audio-message">
            <UploadOutlined />
            <p>请上传音频文件以开始编辑</p>
            <Button
              type="primary"
              icon={<UploadOutlined />}
              style={{ marginTop: 16 }}
              onClick={() => {
                // 显示提示信息
                message.info('请从主页上传音频文件');
              }}
            >
              选择音频文件
            </Button>
          </div>
        )}
      </Card>

      {/* 保存对话框 */}
      <SaveDialog
        visible={saveDialogVisible}
        audioFile={trimmedAudioFile}
        defaultFileName={defaultFileName}
        onSave={handleSaveDialogSave}
        onCancel={handleSaveDialogCancel}
      />
    </div>
  );
};

export default AudioEditor;
