export interface Coord {
  lat: number;
  lng: number;
}

export interface Post {
  id: number;
  content: string;
  savedStyle?: string;
  coord?: {
    [key: string]: Coord;
  };
}
