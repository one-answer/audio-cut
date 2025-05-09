declare module 'wavesurfer.js' {
  interface WaveSurferOptions {
    container: HTMLElement;
    waveColor?: string;
    progressColor?: string;
    cursorColor?: string;
    barWidth?: number;
    barRadius?: number;
    responsive?: boolean;
    height?: number;
    normalize?: boolean;
    hideScrollbar?: boolean;
    [key: string]: any;
  }

  class WaveSurfer {
    static create(options: Partial<WaveSurferOptions>): WaveSurfer;

    on(event: string, callback: Function): void;
    un(event: string, callback: Function): void;

    load(url: string): void;
    play(): void;
    pause(): void;
    stop(): void;

    getCurrentTime(): number;
    getDuration(): number;

    seekTo(progress: number): void;
    zoom(level: number): void;

    getDecodedData(): AudioBuffer | null;

    getActivePlugins(): any[];
    registerPlugin(plugin: any): any;

    destroy(): void;

    plugins: any[];
  }

  namespace WaveSurfer {
    interface WaveSurferOptions {
      container: HTMLElement;
      waveColor?: string;
      progressColor?: string;
      cursorColor?: string;
      barWidth?: number;
      barRadius?: number;
      responsive?: boolean;
      height?: number;
      normalize?: boolean;
      hideScrollbar?: boolean;
      [key: string]: any;
    }
  }

  const WaveSurfer: {
    create(options: Partial<WaveSurferOptions>): WaveSurfer;
  };
  export default WaveSurfer;
}

declare module 'wavesurfer.js/dist/plugin/regions' {
  class RegionsPlugin {
    static create(options?: any): RegionsPlugin;

    addRegion(options: {
      id: string;
      start: number;
      end: number;
      color?: string;
      drag?: boolean;
      resize?: boolean;
      [key: string]: any;
    }): void;

    getRegions(): any[];
    clearRegions(): void;
  }
  const RegionsPluginExport: {
    create(options?: any): RegionsPlugin;
  };
  export default RegionsPluginExport;
}

declare module 'wavesurfer.js/dist/plugin/timeline' {
  class TimelinePlugin {
    static create(options?: any): TimelinePlugin;
  }
  const TimelinePluginExport: {
    create(options?: any): TimelinePlugin;
  };
  export default TimelinePluginExport;
}
