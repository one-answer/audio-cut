import { AudioRegion } from '../types/audio';

// 导入wavesurfer.js
const WaveSurfer = require('wavesurfer.js');

// 导入wavesurfer.js 4.x版本的插件
const RegionsPlugin = require('wavesurfer.js/dist/plugin/wavesurfer.regions.js');
const TimelinePlugin = require('wavesurfer.js/dist/plugin/wavesurfer.timeline.js');

// 创建WaveSurfer实例
export const createWaveSurfer = (
  container: HTMLElement,
  options: any = {}
): any => {
  const wavesurfer = WaveSurfer.create({
    container,
    waveColor: '#4F4A85',
    progressColor: '#383351',
    cursorColor: '#383351',
    barWidth: 2,
    barRadius: 3,
    responsive: true,
    height: 100,
    normalize: true,
    ...options,
  });

  // 初始化 plugins 数组
  if (!wavesurfer.plugins) {
    wavesurfer.plugins = [];
  }

  // 添加 registerPlugin 方法
  if (!wavesurfer.registerPlugin) {
    wavesurfer.registerPlugin = function(plugin: any): any {
      this.plugins.push(plugin);
      return plugin;
    };
  }

  return wavesurfer;
};

// 添加时间轴插件
export const addTimelinePlugin = (
  wavesurfer: any,
  container: HTMLElement
): any => {
  try {
    console.log('Adding timeline plugin');
    // WaveSurfer.js 4.x 版本中插件的正确创建方式
    const timeline = TimelinePlugin.create({
      container: container,
      primaryLabelInterval: 10,
      secondaryLabelInterval: 1,
      primaryColor: '#000',
      secondaryColor: '#666',
    });

    // 直接初始化插件
    timeline.init();
    timeline.render();

    // 将插件添加到 wavesurfer 实例
    if (!wavesurfer.plugins) {
      wavesurfer.plugins = [];
    }
    wavesurfer.plugins.push(timeline);

    return timeline;
  } catch (error) {
    console.error('Error adding timeline plugin:', error);
    return null;
  }
};

// 添加区域插件
export const addRegionsPlugin = (
  wavesurfer: any
): any => {
  try {
    console.log('Adding regions plugin');

    // 检查是否已经有区域插件
    if (wavesurfer.regions) {
      console.log('Regions plugin already exists');
      return wavesurfer.regions;
    }

    // 尝试使用不同版本的 wavesurfer.js 的方式添加插件
    console.log('Trying different methods to add regions plugin');

    // 检查 wavesurfer 是否有 registerPlugin 方法
    if (typeof wavesurfer.registerPlugin === 'function') {
      console.log('Using registerPlugin method');
      try {
        // 使用 registerPlugin 方法注册插件
        const regions = wavesurfer.registerPlugin(RegionsPlugin.create({
          dragSelection: true,
          slop: 5,
          color: 'rgba(0, 123, 255, 0.2)'
        }));

        // 将插件实例存储在 wavesurfer.regions 属性中
        wavesurfer.regions = regions;

        console.log('Regions plugin registered successfully');
        console.log('wavesurfer.plugins:', wavesurfer.plugins);
        console.log('Plugin constructor name:', regions.constructor ? regions.constructor.name : 'unknown');
        console.log('regions.on exists:', typeof regions.on === 'function');
        console.log('regions.enableDragSelection exists:', typeof regions.enableDragSelection === 'function');

        return regions;
      } catch (registerError) {
        console.error('Error using registerPlugin method:', registerError);
      }
    }

    // 如果没有 registerPlugin 方法，尝试手动创建和添加插件
    console.log('No registerPlugin method, creating plugin manually');

    // 创建插件实例
    const regions = RegionsPlugin.create();

    // 确保插件有正确的构造函数名
    if (regions.constructor) {
      // 如果没有名称，手动设置一个
      if (!regions.constructor.name) {
        Object.defineProperty(regions.constructor, 'name', { value: 'RegionsPlugin' });
      }
      console.log('Plugin constructor name set to:', regions.constructor.name);
    }

    try {
      // 初始化插件
      console.log('Initializing regions plugin');
      if (typeof regions.init === 'function') {
        regions.init({
          wavesurfer: wavesurfer,
          dragSelection: {
            slop: 5,
            color: 'rgba(0, 123, 255, 0.2)',
          },
        });
      }

      // 初始化插件数组
      if (!wavesurfer.plugins) {
        wavesurfer.plugins = [];
      }

      // 添加插件到数组
      wavesurfer.plugins.push(regions);

      // 添加直接访问属性
      wavesurfer.regions = regions;

      // 添加事件监听
      console.log('Checking if regions plugin supports event listeners');
      console.log('regions.on exists:', typeof regions.on === 'function');

      // 如果插件支持事件监听，添加事件处理程序
      if (typeof regions.on === 'function') {
        console.log('Adding event listeners to regions plugin');
        try {
          regions.on('region-created', (region: any) => {
            console.log('Region created:', region);
          });

          regions.on('region-updated', (region: any) => {
            console.log('Region updated:', region);
          });

          regions.on('region-removed', (region: any) => {
            console.log('Region removed:', region);
          });
        } catch (error) {
          console.error('Error adding event listeners to regions plugin:', error);
        }
      } else {
        console.log('regions.on is not a function, will rely on wavesurfer events');

        // 如果插件不支持事件监听，添加事件处理程序到 wavesurfer 实例
        wavesurfer.on('region-created', (region: any) => {
          console.log('Wavesurfer region created:', region);
        });

        wavesurfer.on('region-updated', (region: any) => {
          console.log('Wavesurfer region updated:', region);
        });

        wavesurfer.on('region-removed', (region: any) => {
          console.log('Wavesurfer region removed:', region);
        });
      }

      // 添加拖动选择功能
      if (typeof regions.enableDragSelection === 'function') {
        console.log('Enabling drag selection by default');
        regions.enableDragSelection({
          color: 'rgba(0, 123, 255, 0.2)'
        });
      }

      console.log('Regions plugin created and attached successfully');
      console.log('wavesurfer.plugins:', wavesurfer.plugins);
      return regions;
    } catch (error) {
      console.error('Error initializing regions plugin:', error);

      // 尝试更简单的方式
      try {
        console.log('Trying simpler initialization');
        const regions = RegionsPlugin.create();

        // 直接调用 init 方法并传入 wavesurfer 实例
        if (typeof regions.init === 'function') {
          regions.init(wavesurfer);
        }

        // 初始化插件数组
        if (!wavesurfer.plugins) {
          wavesurfer.plugins = [];
        }

        // 添加插件到数组
        wavesurfer.plugins.push(regions);

        // 添加直接访问属性
        wavesurfer.regions = regions;

        console.log('Simple initialization successful');
        return regions;
      } catch (fallbackError) {
        console.error('All initialization methods failed:', fallbackError);
        return null;
      }
    }
  } catch (error) {
    console.error('Error adding regions plugin:', error);
    return null;
  }
};

// 创建区域
export const createRegion = (
  wavesurfer: any,
  region: AudioRegion
): void => {
  try {
    console.log('Creating region:', region);

    // 直接使用 wavesurfer.regions 属性
    if (wavesurfer.regions) {
      wavesurfer.regions.addRegion({
        id: region.id,
        start: region.start,
        end: region.end,
        color: region.color || 'rgba(0, 0, 0, 0.1)',
        drag: region.drag !== undefined ? region.drag : true,
        resize: region.resize !== undefined ? region.resize : true,
      });
      return;
    }

    // 如果没有 regions 属性，尝试从插件中查找
    const regionsPlugin = wavesurfer.plugins?.find(
      (plugin: any) => plugin.constructor && plugin.constructor.name === 'RegionsPlugin'
    );

    if (regionsPlugin) {
      regionsPlugin.addRegion({
        id: region.id,
        start: region.start,
        end: region.end,
        color: region.color || 'rgba(0, 0, 0, 0.1)',
        drag: region.drag !== undefined ? region.drag : true,
        resize: region.resize !== undefined ? region.resize : true,
      });
    } else {
      console.error('Regions plugin not found');
    }
  } catch (error) {
    console.error('Error creating region:', error);
  }
};

// 获取所有区域
export const getAllRegions = (
  wavesurfer: any
): Record<string, any> => {
  try {
    // 直接使用 wavesurfer.regions 属性
    if (wavesurfer.regions) {
      return wavesurfer.regions.getRegions();
    }

    // 如果没有 regions 属性，尝试从插件中查找
    const regionsPlugin = wavesurfer.plugins?.find(
      (plugin: any) => plugin.constructor && plugin.constructor.name === 'RegionsPlugin'
    );

    if (regionsPlugin) {
      return regionsPlugin.getRegions();
    }

    console.error('Regions plugin not found');
    return {};
  } catch (error) {
    console.error('Error getting regions:', error);
    return {};
  }
};

// 清除所有区域
export const clearAllRegions = (
  wavesurfer: any
): void => {
  try {
    // 直接使用 wavesurfer.regions 属性
    if (wavesurfer.regions) {
      wavesurfer.regions.clearRegions();
      return;
    }

    // 如果没有 regions 属性，尝试从插件中查找
    const regionsPlugin = wavesurfer.plugins?.find(
      (plugin: any) => plugin.constructor && plugin.constructor.name === 'RegionsPlugin'
    );

    if (regionsPlugin) {
      regionsPlugin.clearRegions();
    } else {
      console.error('Regions plugin not found');
    }
  } catch (error) {
    console.error('Error clearing regions:', error);
  }
};

// 从音频缓冲区生成波形数据
export const generateWaveformData = (
  audioBuffer: AudioBuffer,
  numberOfPoints: number = 1000
): number[] => {
  const channelData = audioBuffer.getChannelData(0);
  const blockSize = Math.floor(channelData.length / numberOfPoints);
  const waveform: number[] = [];

  for (let i = 0; i < numberOfPoints; i++) {
    const start = i * blockSize;
    const end = start + blockSize;
    let max = 0;

    for (let j = start; j < end; j++) {
      const abs = Math.abs(channelData[j]);
      if (abs > max) {
        max = abs;
      }
    }

    waveform.push(max);
  }

  return waveform;
};
