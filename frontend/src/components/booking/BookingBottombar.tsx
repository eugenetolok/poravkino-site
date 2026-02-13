import React from "react";
import { Button } from "@heroui/button";
import { motion, AnimatePresence } from "framer-motion";

import { useBookingStore } from "@/store/bookingStore";

interface BookingBottomBarProps {
  onBuy: () => void;
}

export const BookingBottomBar: React.FC<BookingBottomBarProps> = ({
  onBuy,
}) => {
  const { totalPrice, selectedSeats, removeSeat } = useBookingStore();

  return (
    // КОНТЕЙНЕР:
    // fixed bottom-0 -> прижат к низу, но...
    // z-50 -> поверх всего
    // pointer-events-box-none -> чтобы клики по бокам (если будут отступы) проходили сквозь (опционально)
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
      {/* ГРАДИЕНТНАЯ ШТОРКА СНИЗУ:
                Чтобы зал плавно уходил в темноту под баром, а не обрезался резко.
            */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#09090b] via-[#09090b]/80 to-transparent pointer-events-none" />

      {/* ПЛАВАЮЩАЯ ПАНЕЛЬ:
                m-4 -> отступы со всех сторон (в том числе снизу)
                mb-safe-offset -> учет полоски iPhone (потребует настройки, см. ниже, или используем просто mb-6/8)
                rounded-2xl -> сильные скругления
            */}
      <div className="relative m-3 mb-6 bg-[#18181b]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-4 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* Фоновый шум/свет для красоты */}
        <div className="absolute top-0 left-0 right-0 h-full bg-primary/5 blur-2xl pointer-events-none -z-10" />

        {/* Горизонтальный скролл выбранных мест */}
        <AnimatePresence>
          {selectedSeats.length > 0 && (
            <motion.div
              animate={{ height: "auto", opacity: 1, marginBottom: 12 }}
              className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide mask-fade-right"
              exit={{ height: 0, opacity: 0, marginBottom: 0 }}
              initial={{ height: 0, opacity: 0, marginBottom: 0 }}
            >
              {selectedSeats.map((s) => (
                <motion.div
                  key={s.id}
                  layout
                  animate={{ scale: 1, opacity: 1 }}
                  className="shrink-0 flex items-center gap-3 bg-white/5 pl-3 pr-2 py-1.5 rounded-full border border-white/10"
                  exit={{ scale: 0.8, opacity: 0 }}
                  initial={{ scale: 0.8, opacity: 0 }}
                >
                  <div className="flex flex-col leading-none">
                    <span className="text-[9px] text-gray-400 font-bold uppercase">
                      Ряд {s.row}
                    </span>
                    <span className="text-xs font-bold text-white">
                      Место {s.seat}
                    </span>
                  </div>
                  {/* Кнопка удалить (крестик) */}
                  <button
                    className="w-5 h-5 flex items-center justify-center rounded-full bg-white/10 text-gray-400 hover:text-white hover:bg-red-500/80 transition-colors"
                    onClick={() => removeSeat(s.id)}
                  >
                    <svg
                      fill="none"
                      height="12"
                      stroke="currentColor"
                      strokeWidth="3"
                      viewBox="0 0 24 24"
                      width="12"
                    >
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-4 items-center justify-between">
          {/* Цена */}
          <div className="flex flex-col pl-2">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
              Итого
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-white tracking-tight">
                {totalPrice}
              </span>
              <span className="text-sm text-gray-500 font-medium">₽</span>
            </div>
          </div>

          {/* Кнопка "Купить" - Стиль как в Sidebar */}
          <Button
            className={`
                            h-12 px-8 font-bold text-base rounded-xl transition-all shadow-lg
                            ${
                              totalPrice > 0
                                ? "bg-gradient-to-r from-primary via-orange-500 to-primary bg-[length:200%_auto] animate-gradient-xy text-black shadow-primary/25 w-auto flex-grow"
                                : "bg-white/10 text-gray-500 border border-white/5 w-40"
                            }
                        `}
            isDisabled={totalPrice === 0}
            onPress={onBuy}
          >
            {totalPrice > 0 ? "Оплатить" : "Выберите"}
          </Button>
        </div>
      </div>
    </div>
  );
};
