import { useSyncExternalStore } from "react";

import { Seat } from "@/types";

interface BookingStoreData {
  selectedSeats: Seat[];
  totalPrice: number;
  maxSeats: number;
}

interface BookingActions {
  addSeat: (seat: Seat) => void;
  removeSeat: (seatId: string) => void;
  clearSeats: () => void;
  setMaxSeats: (count: number) => void;
}

export type BookingState = BookingStoreData & BookingActions;

let store: BookingStoreData = {
  selectedSeats: [],
  totalPrice: 0,
  maxSeats: 5,
};

const listeners = new Set<() => void>();

const emitChange = () => {
  listeners.forEach((listener) => listener());
};

const actions: BookingActions = {
  addSeat: (seat: Seat) => {
    setStore((state) => {
      if (state.selectedSeats.length >= state.maxSeats) return state;
      if (state.selectedSeats.some((item) => item.id === seat.id)) return state;

      return {
        ...state,
        selectedSeats: [...state.selectedSeats, seat],
        totalPrice: state.totalPrice + seat.price,
      };
    });
  },

  removeSeat: (seatId: string) => {
    setStore((state) => {
      const seat = state.selectedSeats.find((item) => item.id === seatId);

      if (!seat) return state;

      return {
        ...state,
        selectedSeats: state.selectedSeats.filter((item) => item.id !== seatId),
        totalPrice: state.totalPrice - seat.price,
      };
    });
  },

  clearSeats: () => {
    setStore((state) => ({
      ...state,
      selectedSeats: [],
      totalPrice: 0,
    }));
  },

  setMaxSeats: (count: number) => {
    setStore((state) => ({
      ...state,
      maxSeats: count,
    }));
  },
};

const buildSnapshot = (): BookingState => ({
  ...store,
  ...actions,
});
let snapshot = buildSnapshot();

const setStore = (updater: (state: BookingStoreData) => BookingStoreData) => {
  const nextStore = updater(store);

  if (nextStore === store) return;

  store = nextStore;
  snapshot = buildSnapshot();
  emitChange();
};

const getSnapshot = (): BookingState => snapshot;

const subscribe = (listener: () => void) => {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};

export const useBookingStore = (): BookingState =>
  useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
