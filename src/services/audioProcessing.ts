import { AudioEffect } from '../types/audio';

// 创建音频上下文
export const createAudioContext = (): AudioContext => {
  return new (window.AudioContext || (window as any).webkitAudioContext)();
};

// 从文件加载音频
export const loadAudioFromFile = async (file: File): Promise<AudioBuffer> => {
  const audioContext = createAudioContext();
  const arrayBuffer = await file.arrayBuffer();
  return await audioContext.decodeAudioData(arrayBuffer);
};

// 从URL加载音频
export const loadAudioFromUrl = async (url: string): Promise<AudioBuffer> => {
  const audioContext = createAudioContext();
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  return await audioContext.decodeAudioData(arrayBuffer);
};

// 应用音频效果
export const applyEffect = async (
  audioBuffer: AudioBuffer,
  effect: AudioEffect
): Promise<AudioBuffer> => {
  return await effect.apply(audioBuffer);
};

// 剪切音频
export const trimAudio = (
  audioBuffer: AudioBuffer,
  startTime: number,
  endTime: number
): AudioBuffer => {
  console.log('trimAudio called with:', { startTime, endTime });
  console.log('audioBuffer details:', {
    duration: audioBuffer.duration,
    length: audioBuffer.length,
    numberOfChannels: audioBuffer.numberOfChannels,
    sampleRate: audioBuffer.sampleRate
  });

  // 验证输入
  if (!audioBuffer || audioBuffer.numberOfChannels === 0) {
    throw new Error('无效的音频数据');
  }

  if (startTime < 0 || endTime > audioBuffer.duration || startTime >= endTime) {
    throw new Error(`无效的剪切范围: ${startTime} - ${endTime}, 音频时长: ${audioBuffer.duration}`);
  }

  try {
    const audioContext = createAudioContext();
    const sampleRate = audioBuffer.sampleRate;
    const channels = audioBuffer.numberOfChannels;

    const startOffset = Math.floor(startTime * sampleRate);
    const endOffset = Math.floor(endTime * sampleRate);
    const frameCount = endOffset - startOffset;

    console.log('Sample calculations:', { startOffset, endOffset, frameCount });

    if (frameCount <= 0) {
      throw new Error('剪切区域过小');
    }

    const newAudioBuffer = audioContext.createBuffer(
      channels,
      frameCount,
      sampleRate
    );

    // 复制每个通道的数据
    for (let channel = 0; channel < channels; channel++) {
      try {
        const channelData = audioBuffer.getChannelData(channel);
        const newChannelData = newAudioBuffer.getChannelData(channel);

        // 使用 Float32Array.set 方法复制数据，这比循环复制更高效
        if (startOffset >= 0 && startOffset < channelData.length && frameCount > 0) {
          // 创建一个子数组视图，范围从 startOffset 到 endOffset
          const sourceSegment = channelData.subarray(startOffset, endOffset);
          // 将这个子数组复制到新的通道数据中
          newChannelData.set(sourceSegment);

          console.log(`Channel ${channel} data copied successfully:`, {
            sourceLength: channelData.length,
            segmentLength: sourceSegment.length,
            targetLength: newChannelData.length
          });
        } else {
          console.warn(`Invalid segment for channel ${channel}:`, {
            startOffset,
            endOffset,
            channelDataLength: channelData.length,
            frameCount
          });

          // 备用方法：使用循环复制，并进行边界检查
          for (let i = 0; i < frameCount; i++) {
            if (startOffset + i < channelData.length) {
              newChannelData[i] = channelData[startOffset + i];
            } else {
              newChannelData[i] = 0; // 超出范围的样本设为 0
            }
          }
        }
      } catch (error) {
        console.error(`Error copying data for channel ${channel}:`, error);
        throw error;
      }
    }

    console.log('New audio buffer created successfully:', {
      duration: newAudioBuffer.duration,
      length: newAudioBuffer.length,
      numberOfChannels: newAudioBuffer.numberOfChannels
    });

    return newAudioBuffer;
  } catch (error: any) {
    console.error('Error in trimAudio:', error);
    throw new Error(`剪切音频失败: ${error.message || '未知错误'}`);
  }
};

// 调整音量
export const adjustVolume = (
  audioBuffer: AudioBuffer,
  volumeMultiplier: number
): AudioBuffer => {
  const audioContext = createAudioContext();
  const channels = audioBuffer.numberOfChannels;
  const frameCount = audioBuffer.length;

  const newAudioBuffer = audioContext.createBuffer(
    channels,
    frameCount,
    audioBuffer.sampleRate
  );

  for (let channel = 0; channel < channels; channel++) {
    const channelData = audioBuffer.getChannelData(channel);
    const newChannelData = newAudioBuffer.getChannelData(channel);

    for (let i = 0; i < frameCount; i++) {
      newChannelData[i] = channelData[i] * volumeMultiplier;
    }
  }

  return newAudioBuffer;
};

// 淡入效果
export const fadeIn = (
  audioBuffer: AudioBuffer,
  fadeTime: number
): AudioBuffer => {
  const audioContext = createAudioContext();
  const channels = audioBuffer.numberOfChannels;
  const frameCount = audioBuffer.length;
  const sampleRate = audioBuffer.sampleRate;
  const fadeSamples = Math.min(Math.floor(fadeTime * sampleRate), frameCount);

  const newAudioBuffer = audioContext.createBuffer(
    channels,
    frameCount,
    sampleRate
  );

  for (let channel = 0; channel < channels; channel++) {
    const channelData = audioBuffer.getChannelData(channel);
    const newChannelData = newAudioBuffer.getChannelData(channel);

    // 应用淡入
    for (let i = 0; i < fadeSamples; i++) {
      const gain = i / fadeSamples;
      newChannelData[i] = channelData[i] * gain;
    }

    // 复制剩余样本
    for (let i = fadeSamples; i < frameCount; i++) {
      newChannelData[i] = channelData[i];
    }
  }

  return newAudioBuffer;
};

// 淡出效果
export const fadeOut = (
  audioBuffer: AudioBuffer,
  fadeTime: number
): AudioBuffer => {
  const audioContext = createAudioContext();
  const channels = audioBuffer.numberOfChannels;
  const frameCount = audioBuffer.length;
  const sampleRate = audioBuffer.sampleRate;
  const fadeSamples = Math.min(Math.floor(fadeTime * sampleRate), frameCount);

  const newAudioBuffer = audioContext.createBuffer(
    channels,
    frameCount,
    sampleRate
  );

  for (let channel = 0; channel < channels; channel++) {
    const channelData = audioBuffer.getChannelData(channel);
    const newChannelData = newAudioBuffer.getChannelData(channel);

    // 复制前面的样本
    for (let i = 0; i < frameCount - fadeSamples; i++) {
      newChannelData[i] = channelData[i];
    }

    // 应用淡出
    for (let i = 0; i < fadeSamples; i++) {
      const gain = 1 - (i / fadeSamples);
      newChannelData[frameCount - fadeSamples + i] = channelData[frameCount - fadeSamples + i] * gain;
    }
  }

  return newAudioBuffer;
};

// 将AudioBuffer转换为Blob
export const audioBufferToBlob = async (
  audioBuffer: AudioBuffer,
  format = 'audio/wav'
): Promise<Blob> => {
  console.log('audioBufferToBlob called with:', {
    numberOfChannels: audioBuffer.numberOfChannels,
    length: audioBuffer.length,
    sampleRate: audioBuffer.sampleRate,
    duration: audioBuffer.duration,
    format
  });

  try {
    const audioContext = createAudioContext();
    const offlineContext = new OfflineAudioContext(
      audioBuffer.numberOfChannels,
      audioBuffer.length,
      audioBuffer.sampleRate
    );

    const source = offlineContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(offlineContext.destination);
    source.start(0);

    console.log('Starting offline rendering...');
    const renderedBuffer = await offlineContext.startRendering();
    console.log('Rendering complete:', {
      numberOfChannels: renderedBuffer.numberOfChannels,
      length: renderedBuffer.length,
      sampleRate: renderedBuffer.sampleRate,
      duration: renderedBuffer.duration
    });

    return new Promise((resolve, reject) => {
      try {
        console.log('Creating Web Worker for WAV encoding...');
        const worker = new Worker(
          URL.createObjectURL(
            new Blob([
              `
              onmessage = function(e) {
                try {
                  const { buffer, channels, sampleRate } = e.data;
                  console.log('Web Worker received data:', { channels, sampleRate, bufferLength: buffer.length });
                  const wav = encodeWAV(buffer, channels, sampleRate);
                  postMessage(wav);
                } catch (error) {
                  console.error('Error in Web Worker:', error);
                  postMessage({ error: error.message });
                }
              }

              function encodeWAV(samples, numChannels, sampleRate) {
                // 计算数据长度
                let dataLength;
                if (samples[0] instanceof Float32Array) {
                  // 如果数据是按通道分组的（每个通道是一个 Float32Array）
                  dataLength = samples[0].length * numChannels * 2;
                } else {
                  // 如果数据是按采样点分组的（每个采样点包含所有通道的数据）
                  dataLength = samples.length * numChannels * 2;
                }

                console.log('Data length calculation:', { dataLength, headerSize: 44, totalSize: 44 + dataLength });

                const buffer = new ArrayBuffer(44 + dataLength);
                const view = new DataView(buffer);

                // RIFF identifier
                writeString(view, 0, 'RIFF');
                // file length
                view.setUint32(4, 36 + dataLength, true);
                // RIFF type
                writeString(view, 8, 'WAVE');
                // format chunk identifier
                writeString(view, 12, 'fmt ');
                // format chunk length
                view.setUint32(16, 16, true);
                // sample format (raw)
                view.setUint16(20, 1, true);
                // channel count
                view.setUint16(22, numChannels, true);
                // sample rate
                view.setUint32(24, sampleRate, true);
                // byte rate (sample rate * block align)
                view.setUint32(28, sampleRate * numChannels * 2, true);
                // block align (channel count * bytes per sample)
                view.setUint16(32, numChannels * 2, true);
                // bits per sample
                view.setUint16(34, 16, true);
                // data chunk identifier
                writeString(view, 36, 'data');
                // data chunk length
                view.setUint32(40, dataLength, true);

                // write the PCM samples
                let offset = 44;

                // 检查数据格式
                console.log('Sample data format check:', {
                  samplesLength: samples.length,
                  firstSample: samples[0] ? typeof samples[0] : 'undefined',
                  isFloat32Array: samples[0] instanceof Float32Array
                });

                // 处理不同的数据格式
                if (samples[0] instanceof Float32Array) {
                  // 如果数据是按通道分组的（每个通道是一个 Float32Array）
                  for (let i = 0; i < samples[0].length; i++) {
                    for (let channel = 0; channel < numChannels; channel++) {
                      if (samples[channel] && i < samples[channel].length) {
                        const sample = Math.max(-1, Math.min(1, samples[channel][i]));
                        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
                      } else {
                        view.setInt16(offset, 0, true);
                      }
                      offset += 2;
                    }
                  }
                } else {
                  // 如果数据是按采样点分组的（每个采样点包含所有通道的数据）
                  for (let i = 0; i < samples.length; i++) {
                    for (let channel = 0; channel < numChannels; channel++) {
                      if (samples[i] && typeof samples[i][channel] === 'number') {
                        const sample = Math.max(-1, Math.min(1, samples[i][channel]));
                        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
                      } else {
                        view.setInt16(offset, 0, true); // 如果样本不存在，则使用 0
                      }
                      offset += 2;
                    }
                  }
                }

                return buffer;
              }

              function writeString(view, offset, string) {
                for (let i = 0; i < string.length; i++) {
                  view.setUint8(offset + i, string.charCodeAt(i));
                }
              }
              `
            ], { type: 'application/javascript' })
          )
        );

        worker.onmessage = (e) => {
          if (e.data.error) {
            console.error('Error from Web Worker:', e.data.error);
            reject(new Error(e.data.error));
            worker.terminate();
            return;
          }

          console.log('Web Worker completed, creating Blob...');
          const blob = new Blob([e.data], { type: format });
          console.log('Blob created:', { size: blob.size, type: blob.type });
          resolve(blob);
          worker.terminate();
        };

        worker.onerror = (error) => {
          console.error('Web Worker error:', error);
          reject(new Error('Web Worker error: ' + error.message));
          worker.terminate();
        };

        console.log('Preparing channel data...');
        const channels = [];
        for (let i = 0; i < renderedBuffer.numberOfChannels; i++) {
          channels.push(renderedBuffer.getChannelData(i));
        }
        console.log('Channel data prepared, sending to Web Worker...');

        // 检查通道数据
        console.log('Channel data details:', {
          numberOfChannels: channels.length,
          channel0Length: channels[0] ? channels[0].length : 0,
          channel0Type: channels[0] ? channels[0].constructor.name : 'none',
          sampleRate: renderedBuffer.sampleRate
        });

        // 检查通道数据的有效性
        let hasValidData = false;
        for (let i = 0; i < channels.length; i++) {
          const channelData = channels[i];
          if (channelData && channelData.length > 0) {
            // 检查数据是否全为 0
            let nonZeroFound = false;
            for (let j = 0; j < Math.min(1000, channelData.length); j++) {
              if (Math.abs(channelData[j]) > 0.0001) {
                nonZeroFound = true;
                break;
              }
            }

            if (nonZeroFound) {
              hasValidData = true;
              console.log(`Channel ${i} has valid audio data`);
            } else {
              console.warn(`Channel ${i} may contain only zeros or very low values`);
            }
          } else {
            console.warn(`Channel ${i} has no data`);
          }
        }

        if (!hasValidData) {
          console.warn('Warning: No valid audio data found in any channel');
        }

        // 发送数据到 Web Worker
        worker.postMessage({
          buffer: channels,
          channels: renderedBuffer.numberOfChannels,
          sampleRate: renderedBuffer.sampleRate
        });
      } catch (error: any) {
        console.error('Error in audioBufferToBlob:', error);
        reject(new Error(error.message || '音频转换失败'));
      }
    });
  } catch (error: any) {
    console.error('Error in audioBufferToBlob:', error);
    throw new Error(`音频转换失败: ${error.message || '未知错误'}`);
  }
};
