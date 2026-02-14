import { Button } from "@heroui/button";

import { Calendar } from "@/components/calendar/calendar";

export type ViewMode = "grid" | "list";

interface ScheduleControlsProps {
  date: string;
  onDateChange: (date: string) => void;
  genres: string[];
  selectedGenre: string;
  onGenreChange: (genre: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

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

export const ScheduleControls = ({
  date,
  onDateChange,
  genres,
  selectedGenre,
  onGenreChange,
  viewMode,
  onViewModeChange,
}: ScheduleControlsProps) => {
  return (
    <section className="glass-panel rounded-3xl p-3 md:p-4">
      <div className="min-w-0">
        <Calendar
          className="w-full"
          initialDate={date}
          maxVisibleDays={7}
          variant="embedded"
          onDateChange={onDateChange}
        />
      </div>

      <div className="mt-3 border-t border-[var(--glass-border-dark)]/70 pt-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 flex-1 overflow-x-auto pb-1 scrollbar-hide">
            <div className="inline-flex min-w-max flex-nowrap gap-2 pr-2">
              {genres.map((genre) => {
                const isActive = selectedGenre === genre;

                return (
                  <Button
                    key={genre}
                    className={`type-label shrink-0 whitespace-nowrap ${isActive
                        ? "bg-gradient-to-br from-[#ff4f1f] via-[#ff7a2f] to-[#f0a640] text-white shadow-[0_10px_22px_-16px_rgba(255,106,56,0.72)]"
                        : "bg-[var(--glass-bg-soft)] text-[var(--text-muted)] hover:bg-[var(--glass-bg-strong)] hover:text-[var(--text-primary)]"
                      }`}
                    radius="full"
                    size="sm"
                    variant="flat"
                    onPress={() => onGenreChange(genre)}
                  >
                    {genre}
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="flex shrink-0 justify-end">
            <div className="grid w-full grid-cols-2 rounded-2xl border border-[var(--glass-border-dark)] bg-[var(--glass-bg-soft)] p-1 w-auto">
              <button
                aria-pressed={viewMode === "grid"}
                className={`type-label flex items-center justify-center gap-2 rounded-xl px-3 py-2 transition-colors ${viewMode === "grid"
                    ? "bg-gradient-to-br from-[#ff4f1f] via-[#ff7a2f] to-[#f0a640] text-white shadow-[0_10px_22px_-14px_rgba(255,106,56,0.72)]"
                    : "text-[var(--text-muted)] hover:bg-[var(--glass-bg-strong)] hover:text-[var(--text-primary)]"
                  }`}
                type="button"
                onClick={() => onViewModeChange("grid")}
              >
                <GridViewIcon />
                Постеры
              </button>
              <button
                aria-pressed={viewMode === "list"}
                className={`type-label flex items-center justify-center gap-2 rounded-xl px-3 py-2 transition-colors ${viewMode === "list"
                    ? "bg-gradient-to-br from-[#ff4f1f] via-[#ff7a2f] to-[#f0a640] text-white shadow-[0_10px_22px_-14px_rgba(255,106,56,0.72)]"
                    : "text-[var(--text-muted)] hover:bg-[var(--glass-bg-strong)] hover:text-[var(--text-primary)]"
                  }`}
                type="button"
                onClick={() => onViewModeChange("list")}
              >
                <ListViewIcon />
                Список
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
