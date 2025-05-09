declare module 'antd' {
  // Common event types
  export interface InputChangeEvent {
    target: {
      value: string;
    };
  }

  export interface RadioChangeEvent {
    target: {
      value: string;
    };
  }

  // Component exports
  export const Button: any;
  export const Slider: any;
  export const Space: any;
  export const Tooltip: any;
  export const message: any;
  export const Card: any;
  export const Modal: any;
  export const Input: any;
  export const Radio: any;
  export const Typography: any;
  export const Spin: any;
  export const Select: any;
  export const Form: any;
  export const Upload: any;
  export const Alert: any;
  export const Layout: any;
  export const Menu: any;

  // Slider component types
  export interface SliderTooltipProps {
    formatter: (value: number) => string;
  }

  export interface SliderProps {
    value?: number;
    defaultValue?: number;
    min?: number;
    max?: number;
    step?: number;
    onChange?: (value: number) => void;
    disabled?: boolean;
    tooltip?: SliderTooltipProps;
    tipFormatter?: (value: number) => string;
    className?: string;
  }

  // Input component types
  export namespace Input {
    interface InputProps {
      value?: string;
      defaultValue?: string;
      onChange?: (e: InputChangeEvent) => void;
      placeholder?: string;
      prefix?: React.ReactNode;
      allowClear?: boolean;
      style?: React.CSSProperties;
    }
  }

  // Radio component types
  export namespace Radio {
    interface RadioProps {
      value?: string | number;
      onChange?: (e: RadioChangeEvent) => void;
      style?: React.CSSProperties;
    }

    export const Group: any;
  }
}

declare module 'antd/es/upload/interface' {
  export interface RcFile extends File {
    uid: string;
  }

  export interface UploadFile {
    uid: string;
    name: string;
    status?: 'error' | 'success' | 'done' | 'uploading' | 'removed';
    response?: any;
    linkProps?: any;
    size: number;
    type: string;
    percent?: number;
    originFileObj?: File;
    thumbUrl?: string;
  }

  export interface UploadProps {
    accept?: string;
    action?: string | ((file: RcFile) => string) | ((file: RcFile) => Promise<string>);
    beforeUpload?: (file: RcFile, FileList: RcFile[]) => boolean | Promise<void | boolean | File>;
    customRequest?: (options: any) => void;
    data?: object | ((file: UploadFile) => object);
    defaultFileList?: Array<UploadFile>;
    directory?: boolean;
    disabled?: boolean;
    fileList?: Array<UploadFile>;
    headers?: object;
    listType?: 'text' | 'picture' | 'picture-card';
    method?: string;
    multiple?: boolean;
    name?: string;
    openFileDialogOnClick?: boolean;
    previewFile?: (file: UploadFile) => Promise<string>;
    showUploadList?: boolean | { showRemoveIcon?: boolean; showPreviewIcon?: boolean };
    withCredentials?: boolean;
    onChange?: (info: any) => void;
    onPreview?: (file: UploadFile) => void;
    onRemove?: (file: UploadFile) => void | boolean | Promise<void | boolean>;
    onDrop?: (event: React.DragEvent<HTMLDivElement>) => void;
    transformFile?: (file: RcFile) => string | Blob | File | Promise<string | Blob | File>;
  }
}
