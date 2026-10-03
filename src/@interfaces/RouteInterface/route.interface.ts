export interface ISubMenuItem {
  id: number;
  name: string;
  route: string;
  category?: string;
}

export interface IMenuItem {
  id: number;
  name: string;
  route: string;
  category?: string;
  submenu?: ISubMenuItem[];
  icon?: string;
  color?: string;
}
