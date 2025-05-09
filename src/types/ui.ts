export interface MenuItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  children?: MenuItem[];
  onClick?: () => void;
  disabled?: boolean;
}

export interface TabItem {
  key: string;
  label: string;
  children: React.ReactNode;
}

export interface ButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  type?: 'primary' | 'default' | 'dashed' | 'link' | 'text';
  icon?: React.ReactNode;
  children?: React.ReactNode;
}
