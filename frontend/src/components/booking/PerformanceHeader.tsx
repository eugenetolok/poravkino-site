import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";

import { Movie, Performance } from "@/types";
import { getBackdropUrl } from "@/utils/imageUtils";

interface PerformanceHeaderProps {
  movie: Movie;
  performance: Performance;
  relatedPerformances?: Performance[];
}

export const PerformanceHeader = ({
  movie,
  performance,
  relatedPerformances = [],
}: PerformanceHeaderProps) => {
  const navigate = useNavigate();
  const backdrop = getBackdropUrl(movie.poster, movie.backdrop);
  const currentPerformanceId = String(
    performance.id || performance.performance_id || "",
  );

  const sortedRelated = useMemo(
    () =>
      [...relatedPerformances].sort(
        (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime(),
      ),
    [relatedPerformances],
  );

  return (
    <header className="relative z-30 overflow-hidden border-b border-white/10">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${backdrop})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-[#09090b]/90 to-[#09090b]" />
      <div className="absolute inset-0 backdrop-blur-[24px]" />

      <div className="relative z-10 mx-auto w-full max-w-[1800px] px-4 pb-4 pt-4 md:px-6 md:pb-5">
        <div className="type-meta mb-3 flex flex-wrap items-center gap-2 text-[11px] tracking-[0.11em] text-white/75">
          <Button
            isIconOnly
            aria-label="Назад"
            className="h-9 min-h-9 min-w-9 bg-white/10 text-white"
            radius="full"
            variant="flat"
            onPress={() => navigate(-1)}
          >
            <svg
              fill="none"
              height="18"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.2"
              viewBox="0 0 24 24"
              width="18"
            >
              <path d="M15 18L9 12L15 6" />
            </svg>
          </Button>
          <Link className="hover:text-white" to="/">
            Афиша
          </Link>
          <span>•</span>
          <Link className="hover:text-white" to={`/movie/${movie.id}`}>
            {movie.name}
          </Link>
          <span>•</span>
          <span className="text-white">Сеанс</span>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <h1 className="type-section line-clamp-1 text-[1.8rem] text-white md:text-[2.05rem]">
                {movie.name}
              </h1>
              <Chip
                className="border border-white/20 bg-white/15 font-semibold text-white"
                size="sm"
              >
                {movie.age}+
              </Chip>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-white/75 md:text-sm">
              <span className="type-meta rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] tracking-[0.08em]">
                {format(new Date(performance.time), "d MMMM", { locale: ru })}
              </span>
              <span className="type-meta type-numeric rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] tracking-[0.08em] text-white">
                {format(new Date(performance.time), "HH:mm")}
              </span>
              <span className="type-meta rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] tracking-[0.08em]">
                Зал {performance.hall_name}
              </span>
              <span className="type-meta rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] tracking-[0.08em]">
                {movie.duration} мин
              </span>
              <span className="type-meta type-numeric rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] tracking-[0.08em] font-bold text-[var(--accent)]">
                {performance.price} ₽
              </span>
            </div>
          </div>
        </div>

        {sortedRelated.length > 0 && (
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {sortedRelated.map((item) => {
              const relatedId = String(item.id || item.performance_id || "");
              const isCurrent = relatedId === currentPerformanceId;

              return (
                <Link
                  key={relatedId}
                  className={`rounded-xl border px-3 py-2 text-center text-xs transition-colors md:text-sm ${
                    isCurrent
                      ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                      : "border-white/20 bg-white/10 text-white hover:border-white/45"
                  }`}
                  to={`/performance/${relatedId}`}
                >
                  <span className="type-numeric block font-bold leading-none">
                    {format(new Date(item.time), "HH:mm")}
                  </span>
                  <span className="type-meta type-numeric pt-1 text-[10px] tracking-[0.08em] opacity-85">
                    {item.price} ₽
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
};
