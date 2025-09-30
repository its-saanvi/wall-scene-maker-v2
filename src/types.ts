export interface Position {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Grid {
  rows: number;
  columns: number;
  x: number;
  y: number;
  width: number;
  height: number;
  instance_background?: boolean;
  cosmetic?: boolean;
}

export interface Positions {
  positions: Position[];
  instance_background?: boolean;
  cosmetic?: boolean;
}

export interface GridGroup extends Grid {
  id?: string;
  type: 'grid';
}

export interface PositionsGroup extends Position, Positions {
  id?: string;
  type: 'positions';
}

export type Group = GridGroup | PositionsGroup;

export type GroupUnparsed = Grid | (Positions & Position);

export interface Layout {
  main?: Group;
  preparing?: Group[];
  locked?: Group;
  replaceLockedInstances?: boolean;
}

export interface LayoutUnparsed {
  main?: GroupUnparsed;
  preparing?: GroupUnparsed[];
  locked?: GroupUnparsed;
  replaceLockedInstances?: boolean;
}
