import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { format } from "date-fns";
import { Spinner } from "@heroui/spinner";
import { useDisclosure } from "@heroui/modal";
import { addToast } from "@heroui/toast";

import DefaultLayout from "@/layouts/default";
import { apiClient } from "@/utils/apiClient";
import { Movie, Performance, Seat } from "@/types";
import { CinemaHall } from "@/components/hall/CinemaHall";
import { BookingSidebar } from "@/components/booking/BookingSidebar";
import { BookingBottomBar } from "@/components/booking/BookingBottombar";
import { PerformanceHeader } from "@/components/booking/PerformanceHeader";
import { PaymentModal } from "@/components/booking/PaymentModal";
import { useBookingStore } from "@/store/bookingStore";

interface RawPerformanceResponse {
  id: number;
  hall_name: string;
  time: string;
  price: number;
  is3d: boolean;
  movie: Movie;
  places: RawPlace[];
}

interface RawPlace {
  ID?: string | number;
  id?: string | number;
  Row?: string | number;
  Seat?: string | number;
  Price?: string | number;
  Name_sec?: string;
  name_sec?: string;
}

const normalizePerformance = (data: {
  id?: number;
  performance_id?: number;
  hall_name?: string;
  time?: string;
  price?: number;
  is3d?: boolean;
  hall_id?: number;
  movie_id?: number;
}): Performance => ({
  id: data.id || data.performance_id || 0,
  performance_id: data.performance_id,
  hall_name: data.hall_name || "",
  time: data.time || new Date().toISOString(),
  price: data.price || 0,
  is3d: Boolean(data.is3d),
  hall_id: data.hall_id || 0,
  movie_id: data.movie_id || 0,
});

export default function PerformancePage() {
  const { id } = useParams();

  const [performance, setPerformance] = useState<Performance | null>(null);
  const [movie, setMovie] = useState<Movie | null>(null);
  const [places, setPlaces] = useState<RawPlace[]>([]);
  const [relatedPerformances, setRelatedPerformances] = useState<Performance[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    clearSeats,
    totalPrice,
    selectedSeats,
    addSeat,
    removeSeat,
    maxSeats,
  } = useBookingStore();

  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    if (!id) return;

    let isMounted = true;

    const loadPerformance = async () => {
      clearSeats();
      setLoading(true);

      try {
        const data = await apiClient.get<RawPerformanceResponse>(
          `/api/performances/${id}`,
        );

        if (!isMounted) return;

        const normalized = normalizePerformance(data);

        setPerformance(normalized);
        setMovie(data.movie);
        setPlaces(data.places || []);

        if (data.movie?.id) {
          try {
            const queryDate = format(new Date(data.time), "yyyy-MM-dd");
            const movieWithSchedule = await apiClient.get<Movie>(
              `/api/movies/${data.movie.id}?date=${queryDate}`,
            );

            if (!isMounted) return;
            const nextPerformances = (movieWithSchedule.performances || []).map(
              (item) => normalizePerformance(item),
            );

            setRelatedPerformances(nextPerformances);
          } catch {
            setRelatedPerformances([]);
          }
        }
      } catch {
        addToast({
          title: "Ошибка",
          description: "Не удалось загрузить данные сеанса",
          color: "danger",
        });
        if (!isMounted) return;
        setPerformance(null);
        setMovie(null);
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    };

    loadPerformance();

    return () => {
      isMounted = false;
    };
  }, [clearSeats, id]);

  const handleSeatToggle = (seatId: string) => {
    const normalizedSeatId = String(seatId);
    const isSelected = selectedSeats.some(
      (seat) => String(seat.id) === normalizedSeatId,
    );
    const rawSeat = places.find(
      (place) => String(place.ID ?? place.id ?? "") === normalizedSeatId,
    );

    if (!rawSeat) return;

    if (isSelected) {
      removeSeat(normalizedSeatId);

      return;
    }

    if (selectedSeats.length >= maxSeats) {
      addToast({
        title: "Лимит мест",
        description: `Максимум ${maxSeats} билетов в одной покупке`,
        color: "warning",
      });

      return;
    }

    addSeat({
      id: normalizedSeatId,
      row: String(rawSeat.Row ?? ""),
      seat: String(rawSeat.Seat ?? ""),
      price: Number(rawSeat.Price ?? 0),
      status: "selected",
      type: String(rawSeat.Name_sec ?? rawSeat.name_sec ?? "Standard"),
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    } as Seat);
  };

  const handlePaymentSubmit = async (email: string, phone: string) => {
    if (!performance) return;

    setIsSubmitting(true);

    try {
      const payload = {
        email,
        phone,
        performance_id: performance.id,
        places: selectedSeats.map((seat) => String(seat.id)),
        pushkin: false,
      };

      const response = await apiClient.post<{ url: string }>(
        "/api/sales",
        payload,
      );

      window.location.href = response.url;
    } catch (submitError: unknown) {
      const errorMessage =
        submitError instanceof Error ? submitError.message : "Ошибка сервера";

      addToast({ title: "Ошибка", description: errorMessage, color: "danger" });
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#09090b] text-white">
        <Spinner color="primary" label="Загрузка схемы зала" size="lg" />
      </div>
    );
  }

  if (!performance || !movie) {
    return (
      <DefaultLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="rounded-3xl border border-dashed border-black/15 bg-white/60 px-8 py-10 text-center dark:border-white/15 dark:bg-white/[0.04]">
            <h1 className="type-section text-2xl">Сеанс не найден</h1>
            <p className="type-body pt-2 text-[var(--text-muted)]">
              Возможно, сеанс уже завершился или ссылка некорректна.
            </p>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <>
      <div className="flex h-screen overflow-hidden bg-[#09090b] text-white">
        <div className="flex min-w-0 flex-grow flex-col md:flex-row">
          <div className="flex min-w-0 flex-grow flex-col">
            <PerformanceHeader
              movie={movie}
              performance={performance}
              relatedPerformances={relatedPerformances}
            />

            <div className="relative flex-grow bg-[#09090b] pb-32 md:pb-0">
              <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_center,transparent_0%,#09090b_100%)] opacity-20" />
              <CinemaHall
                places={places}
                selectedIds={selectedSeats.map((seat) => String(seat.id))}
                onSelectToggle={handleSeatToggle}
              />
            </div>

            <BookingBottomBar onBuy={onOpen} />
          </div>

          <BookingSidebar
            movie={movie}
            performance={performance}
            onBuy={onOpen}
          />
        </div>
      </div>

      <PaymentModal
        isLoading={isSubmitting}
        isOpen={isOpen}
        movie={movie}
        performance={performance}
        selectedSeats={selectedSeats}
        totalPrice={totalPrice}
        onClose={onClose}
        onSubmit={handlePaymentSubmit}
      />
    </>
  );
}
