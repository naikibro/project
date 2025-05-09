export enum AlertType {
  INFO = "info",
  WARNING = "warning",
  ERROR = "error",
  ACCIDENT = "accident",
  TRAFFIC_JAM = "traffic_jam",
  ROAD_CLOSED = "road_closed",
  POLICE_CONTROL = "police_control",
  OBSTACLE_ON_ROAD = "obstacle_on_road",
}

export interface Alert {
  id: number;
  title: string;
  description: string;
  type: AlertType;
  date: string;
  coordinates: {
    latitude: number;
    longitude: number;
    accuracy: string;
  };
  locationContext?: {
    address?: {
      name?: string;
    };
    place?: {
      name: string;
    };
    region?: {
      name: string;
    };
  };
  ratings: {
    upvotes: number;
    downvotes: number;
  };
}
