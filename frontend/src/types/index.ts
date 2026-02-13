import type { SVGProps } from "react";

export interface Movie {
  id: number;
  name: string;
  description: string;
  poster: string; // URL part e.g. "/uploads/..."
  backdrop: string;
  age: number;
  genres: string;
  duration: number;
  country: string;
  director: string;
  actors: string;
  is_pushkin: boolean;
  youtube: string;
  performances: Performance[];
}

export interface Performance {
  id: number;
  performance_id?: number; // Sometimes API returns this
  movie_id: number;
  hall_id: number;
  hall_name: string;
  time: string; // ISO String
  price: number;
  is3d: boolean;
  places?: Seat[]; // populated when fetching specific performance
}

export interface Seat {
  id: string; // Unique ID from sd.js
  row: string;
  seat: string;
  price: number;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  status: "free" | "taken" | "selected";
}

export interface BookingPayload {
  email: string;
  phone?: string;
  fio?: string;
  performance_id: number;
  places: string[]; // IDs of places
  pushkin: boolean;
}

export interface IconSvgProps extends SVGProps<SVGSVGElement> {
  size?: number;
}
