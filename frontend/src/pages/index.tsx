import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Button } from "@heroui/button";
import { Spinner } from "@heroui/spinner";

import DefaultLayout from "@/layouts/default";
import { Calendar } from "@/components/calendar/calendar";
import { MovieCard } from "@/components/movies/MovieCard";
import { Movie } from "@/types";
import { apiClient } from "@/utils/apiClient";

type ViewMode = "grid" | "list";

interface HeroSlide {
  eyebrow: string;
  title: string;
  description: string;
  cta: string;
  note: string;
  background: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    eyebrow: "Премьеры и хиты",
    title: "Смотрите лучшие фильмы на большом экране",
    description:
      "Выбирайте время, зал и покупайте билеты онлайн за пару кликов. Все сеансы на одной странице без лишних переходов.",
    cta: "К сеансам",
    note: "Сегодня в афише фильмы разных жанров: от семейных до фантастики.",
    background:
      "linear-gradient(115deg, rgba(27,18,13,0.96) 0%, rgba(94,40,18,0.9) 45%, rgba(251,122,49,0.68) 100%)",
  },
  {
    eyebrow: "Комфорт и сервис",
    title: "Современные залы, удобная посадка и чистый звук",
    description:
      "Сразу видно, в каком зале проходит сеанс. Подбирайте удобное время и переходите к выбору мест прямо из карточки фильма.",
    cta: "Выбрать фильм",
    note: "В карточках сеансов теперь указаны и цена, и номер зала.",
    background:
      "linear-gradient(125deg, rgba(17,23,39,0.96) 0%, rgba(22,71,82,0.9) 48%, rgba(61,161,138,0.72) 100%)",
  },
  {
    eyebrow: "Онлайн-билеты",
    title: "Бронируйте заранее и проходите без очереди",
    description:
      "Электронный билет доступен сразу после оплаты. Выберите подходящий сеанс и оформите покупку на странице выбора мест.",
    cta: "Перейти к покупке",
    note: "На мобильных по умолчанию показываем компактный список с быстрым доступом к ценам.",
    background:
      "linear-gradient(112deg, rgba(30,16,53,0.96) 0%, rgba(62,25,93,0.88) 42%, rgba(179,82,136,0.72) 100%)",
  },
];

const getDefaultViewMode = (): ViewMode => {
  if (typeof window === "undefined") return "grid";

  return window.matchMedia("(max-width: 767px)").matches ? "list" : "grid";
};

const GridViewIcon = () => (
  <svg
    aria-hidden
    fill="none"
    height="16"
    viewBox="0 0 24 24"
    width="16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4 4H10V10H4V4ZM14 4H20V10H14V4ZM4 14H10V20H4V14ZM14 14H20V20H14V14Z"
      fill="currentColor"
    />
  </svg>
);

const ListViewIcon = () => (
  <svg
    aria-hidden
    fill="none"
    height="16"
    viewBox="0 0 24 24"
    width="16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4 6H20M4 12H20M4 18H20"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="2"
    />
  </svg>
);

export default function IndexPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGenre, setSelectedGenre] = useState("Все");
  const [viewMode, setViewMode] = useState<ViewMode>(getDefaultViewMode);
  const [isViewModePinned, setIsViewModePinned] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (isViewModePinned) return;

    const media = window.matchMedia("(max-width: 767px)");
    const applyDefaultViewMode = () => {
      setViewMode(media.matches ? "list" : "grid");
    };

    applyDefaultViewMode();
    media.addEventListener("change", applyDefaultViewMode);

    return () => {
      media.removeEventListener("change", applyDefaultViewMode);
    };
  }, [isViewModePinned]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const intervalId = window.setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 7000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    setLoading(true);
    setError(null);

    apiClient
      .get<Movie[]>(`/api/schedule?date=${date}`)
      .then((data) => {
        if (!isMounted) return;
        setMovies(data);
      })
      .catch(() => {
        if (!isMounted) return;
        setMovies([]);
        setError(
          "Не удалось загрузить расписание. Попробуйте обновить страницу.",
        );
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [date]);

  const genres = useMemo(() => {
    const parsedGenres = movies
      .flatMap((movie) => (movie.genres || "").split(","))
      .map((genre) => genre.trim())
      .filter(Boolean);

    return ["Все", ...Array.from(new Set(parsedGenres))];
  }, [movies]);

  useEffect(() => {
    if (genres.includes(selectedGenre)) return;
    setSelectedGenre("Все");
  }, [genres, selectedGenre]);

  const filteredMovies = useMemo(
    () =>
      movies.filter((movie) => {
        if (selectedGenre === "Все") return true;

        const movieGenres = movie.genres
          ?.toLowerCase()
          .split(",")
          .map((genre) => genre.trim());

        return movieGenres?.includes(selectedGenre.toLowerCase());
      }),
    [movies, selectedGenre],
  );

  const activeHero = HERO_SLIDES[activeSlide];

  const handleViewModeChange = (nextMode: ViewMode) => {
    setViewMode(nextMode);
    setIsViewModePinned(true);
  };

  const scrollToSchedule = () => {
    const element = document.getElementById("schedule-grid");

    if (!element) return;

    element.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <DefaultLayout>
      <div className="flex flex-col gap-6 pb-20">
        <section className="relative overflow-hidden rounded-[34px] border border-black/10 bg-white/70 p-6 shadow-[0_28px_80px_-38px_rgba(0,0,0,0.5)] dark:border-white/10 dark:bg-[#141a24]/80 md:p-8">
          <div
            className="absolute inset-0 transition-all duration-700"
            style={{ background: activeHero.background }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_46%)]" />
          <div className="absolute -right-14 top-1/2 h-44 w-44 -translate-y-1/2 rounded-full border border-white/20 bg-white/10 blur-2xl" />

          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="type-eyebrow text-white/80">{activeHero.eyebrow}</p>
              <h1 className="font-banner mt-3 text-3xl uppercase text-white md:text-5xl">
                {activeHero.title}
              </h1>
              <p className="type-body mt-4 max-w-2xl text-white/85">
                {activeHero.description}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <Button
                  className="type-label bg-white text-black"
                  radius="full"
                  size="sm"
                  onPress={scrollToSchedule}
                >
                  {activeHero.cta}
                </Button>
                <Button
                  className="type-label border border-white/30 bg-white/15 text-white"
                  radius="full"
                  size="sm"
                  variant="flat"
                  onPress={() =>
                    setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length)
                  }
                >
                  Следующий блок
                </Button>
              </div>
            </div>

            <div className="w-full max-w-md rounded-3xl border border-white/20 bg-white/10 p-4 backdrop-blur-md lg:w-[360px]">
              <p className="type-eyebrow text-white/75">Сегодня в расписании</p>
              <p className="type-title mt-2 text-xl text-white">
                {format(new Date(date), "d MMMM, EEEE", { locale: ru })}
              </p>
              <p className="type-body mt-3 text-white/80">{activeHero.note}</p>
            </div>
          </div>

          <div className="relative z-10 mt-6 flex flex-wrap items-center gap-2">
            {HERO_SLIDES.map((slide, index) => {
              const isActive = index === activeSlide;

              return (
                <button
                  key={slide.title}
                  className={`type-meta rounded-full px-3 py-1.5 text-[10px] tracking-[0.11em] transition-colors ${
                    isActive
                      ? "bg-white text-black"
                      : "bg-white/15 text-white/85 hover:bg-white/25"
                  }`}
                  type="button"
                  onClick={() => setActiveSlide(index)}
                >
                  {slide.eyebrow}
                </button>
              );
            })}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2 lg:items-stretch">
          <div className="glass-panel h-full min-w-0 overflow-hidden rounded-3xl p-3 md:p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="type-eyebrow text-[var(--text-muted)]">
                  Фильтр по жанрам
                </p>
              </div>

              <div className="inline-grid grid-cols-2 rounded-2xl border border-black/10 bg-white/70 p-1 dark:border-white/10 dark:bg-white/[0.04]">
                <button
                  className={`type-label flex items-center gap-2 rounded-xl px-3 py-2 transition-colors ${
                    viewMode === "grid"
                      ? "bg-[var(--accent)] text-white"
                      : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  }`}
                  type="button"
                  onClick={() => handleViewModeChange("grid")}
                >
                  <GridViewIcon />
                  Постеры
                </button>
                <button
                  className={`type-label flex items-center gap-2 rounded-xl px-3 py-2 transition-colors ${
                    viewMode === "list"
                      ? "bg-[var(--accent)] text-white"
                      : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  }`}
                  type="button"
                  onClick={() => handleViewModeChange("list")}
                >
                  <ListViewIcon />
                  Список
                </button>
              </div>
            </div>

            <div className="mt-3 w-full max-w-full overflow-x-auto pb-1 scrollbar-hide">
              <div className="inline-flex min-w-max flex-nowrap gap-2 pr-2">
                {genres.map((genre) => {
                  const isActive = selectedGenre === genre;

                  return (
                    <Button
                      key={genre}
                      className={`type-label shrink-0 whitespace-nowrap ${
                        isActive
                          ? "bg-black text-white dark:bg-white dark:text-black"
                          : "text-[var(--text-muted)]"
                      }`}
                      radius="full"
                      size="sm"
                      variant={isActive ? "solid" : "flat"}
                      onPress={() => setSelectedGenre(genre)}
                    >
                      {genre}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="min-w-0 lg:h-full">
            <Calendar
              className="glass-panel h-full rounded-3xl p-2 lg:flex lg:items-center"
              initialDate={date}
              onDateChange={setDate}
            />
          </div>
        </section>

        {loading ? (
          <div className="flex h-[45vh] items-center justify-center">
            <Spinner color="current" label="Загружаем расписание" size="lg" />
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-500/30 bg-red-500/10 px-5 py-10 text-center">
            <p className="text-lg font-bold text-red-600 dark:text-red-300">
              {error}
            </p>
          </div>
        ) : filteredMovies.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-black/15 bg-white/50 px-5 py-16 text-center dark:border-white/15 dark:bg-white/[0.02]">
            <p className="type-section">Нет фильмов по выбранному жанру</p>
            <p className="type-body pt-2 text-[var(--text-muted)]">
              Попробуйте другую дату или выберите другой жанр.
            </p>
          </div>
        ) : (
          <section
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "flex flex-col gap-4"
            }
            id="schedule-grid"
          >
            {filteredMovies.map((movie, index) => (
              <div
                key={movie.id}
                className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-backwards"
                style={{ animationDelay: `${index * 35}ms` }}
              >
                <MovieCard movie={movie} viewMode={viewMode} />
              </div>
            ))}
          </section>
        )}
      </div>
    </DefaultLayout>
  );
}
