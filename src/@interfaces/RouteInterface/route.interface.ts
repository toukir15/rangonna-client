export interface ISubMenuItem {
  id: number;
  name: string;
  route: string;
}

export interface IMenuItem {
  id: number;
  name: string;
  route: string;
  submenu?: ISubMenuItem[];
  icon?: string;
  color?: string;
}
