export interface AudioFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  duration?: number;
  waveform?: number[];
}

export interface AudioRegion {
  id: string;
  start: number;
  end: number;
  color?: string;
  drag?: boolean;
  resize?: boolean;
}

export interface AudioEffect {
  id: string;
  name: string;
  type: string;
  params: Record<string, number>;
  apply: (audioBuffer: AudioBuffer) => Promise<AudioBuffer>;
}

export enum PlaybackState {
  STOPPED = 'stopped',
  PLAYING = 'playing',
  PAUSED = 'paused',
}
