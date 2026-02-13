import React from "react";
import { Button } from "@heroui/button";

import { useBookingStore } from "@/store/bookingStore";
import { Movie, Performance } from "@/types";
import { getImageUrl } from "@/utils/apiClient";

interface BookingSidebarProps {
  movie: Movie;
  performance: Performance;
  onBuy: () => void;
}

export const BookingSidebar: React.FC<BookingSidebarProps> = ({
  movie,
  onBuy,
}) => {
  const { selectedSeats, totalPrice, removeSeat } = useBookingStore();

  return (
    // КОНТЕЙНЕР: Глубокий черный с легкой прозрачностью (тонировка) и размытием.
    // border-l border-white/5 - очень тонкая линия раздела
    <div className="hidden md:flex w-96 bg-[#0a0e1f]/90 backdrop-blur-xl border-l border-white/5 flex-col z-20 shadow-2xl h-full relative shrink-0 font-sans">
      {/* Ambient Glow: Мягкий цветной свет сверху, создающий атмосферу */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-primary/20 blur-[100px] pointer-events-none -z-10 opacity-20" />

      {/* --- HEADER: Фильм --- */}
      <div className="p-6 relative z-10 flex gap-5 items-start border-b border-white/5 shrink-0">
        {/* Постер с "парящим" эффектом */}
        <div className="relative group shrink-0">
          <div className="absolute inset-0 bg-primary rounded-lg blur opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
          <img
            alt={movie.name}
            className="relative w-24 rounded-lg shadow-2xl object-cover aspect-[2/3] ring-1 ring-white/10 group-hover:scale-[1.02] transition-transform duration-300"
            src={getImageUrl(movie.poster)}
          />
        </div>

        {/* Текстовая информация */}
        <div className="flex flex-col gap-2 pt-1">
          {/* Бейдж жанра */}
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/5 border border-primary/10 w-fit">
            {movie.genres?.split(",")[0] || "Кино"}
          </span>

          <h2 className="text-xl font-bold leading-tight text-white drop-shadow-sm">
            {movie.name}
          </h2>

          <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
            <span className="flex items-center gap-1">
              Страна: {movie.country}
            </span>
          </div>
        </div>
      </div>

      {/* --- BODY: Список билетов --- */}
      <div className="flex-grow overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-white/10 relative z-10">
        {/* Заголовок списка */}
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            Ваши места
          </h3>
          {selectedSeats.length > 0 && (
            <span className="flex h-5 items-center justify-center px-2 rounded-full text-[10px] font-bold bg-white text-black">
              {selectedSeats.length}
            </span>
          )}
        </div>

        {selectedSeats.length === 0 ? (
          // Empty State: Стильный минимализм
          <div className="flex flex-col items-center justify-center h-48 border border-dashed border-white/5 rounded-2xl bg-white/[0.02]">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-400">
              Корзина пуста
            </span>
            <span className="text-xs text-gray-600 mt-1">
              Выберите места на схеме
            </span>
          </div>
        ) : (
          // Карточки билетов
          <div className="space-y-3 pb-4">
            {selectedSeats.map((seat) => (
              <div
                key={seat.id}
                className="relative flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-primary/30 hover:bg-white/[0.06] transition-all group"
              >
                <div className="flex items-center gap-4">
                  {/* Номер ряда (Акцент) */}
                  <div className="flex flex-col items-center justify-center w-10 h-10 rounded-lg bg-[#121212] border border-white/10 group-hover:border-primary/40 transition-colors">
                    <span className="text-[9px] text-gray-500 uppercase">
                      Ряд
                    </span>
                    <span className="text-sm font-bold text-white leading-none">
                      {seat.row}
                    </span>
                  </div>

                  {/* Номер места */}
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white">
                      Место {seat.seat}
                    </span>
                    <span className="text-[10px] text-primary/80 uppercase tracking-wider font-medium">
                      {seat.type || "Standard"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-bold text-white/90">
                    {seat.price} ₽
                  </span>

                  {/* Кнопка удаления (Появляется при ховере) */}
                  <button
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-white hover:bg-red-500/80 hover:shadow-lg hover:shadow-red-500/20 transition-all opacity-0 group-hover:opacity-100"
                    onClick={() => removeSeat(seat.id)}
                  >
                    <svg
                      fill="none"
                      height="16"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      width="16"
                    >
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- FOOTER: Итого и Кнопка --- */}
      <div className="p-6 bg-[#09090b] border-t border-white/5 relative z-30 shrink-0">
        {/* Легкое свечение снизу вверх */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />

        <div className="flex justify-between items-end mb-6 relative">
          <div className="flex flex-col gap-1">
            <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">
              К оплате
            </span>
            {/* Маленький индикатор валидности */}
            <div
              className={`h-1 w-6 rounded-full transition-colors ${selectedSeats.length > 0 ? "bg-primary shadow-[0_0_8px_rgba(var(--primary),0.6)]" : "bg-white/10"}`}
            />
          </div>

          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-black text-white tracking-tighter">
              {totalPrice}
            </span>
            <span className="text-lg text-gray-500 font-medium">₽</span>
          </div>
        </div>

        <Button
          className={`
                        w-full h-14 font-bold text-base tracking-wide rounded-xl transition-all duration-500
                        ${
                          selectedSeats.length > 0
                            ? "bg-gradient-to-r from-primary via-orange-500 to-primary bg-[length:200%_auto] animate-gradient-xy text-black shadow-[0_0_20px_-5px_rgba(255,165,0,0.5)] hover:shadow-[0_0_30px_-5px_rgba(255,165,0,0.7)] hover:scale-[1.02] border-none"
                            : "bg-white/5 text-gray-600 border border-white/5 cursor-not-allowed hover:bg-white/5"
                        }
                    `}
          isDisabled={selectedSeats.length === 0}
          size="lg"
          onPress={onBuy}
        >
          {selectedSeats.length > 0 ? "Купить билеты" : "Выберите места"}
        </Button>
      </div>
    </div>
  );
};
