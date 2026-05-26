export interface MenuItem {
  path: string;
  label: string;
  order: number;
  type: string | null;
  submenu: MenuItem[];
}

export type DynamicPath = {
  label: string;
  path: string;
};

export type Paths = {
  events: DynamicPath | undefined;
  sermons: DynamicPath | undefined;
};