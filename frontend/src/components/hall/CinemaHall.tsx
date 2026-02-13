import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useLayoutEffect,
} from "react";

// --- КОНСТАНТЫ ---
const SEAT_SIZE = 40;
const SCREEN_CURVE = 40;

const COLORS = {
  bg: "#121212",
  freeStroke: "#0d76ff",
  freeFill: "#0d76ff",
  selectedFill: "#fc754a",
  selectedStroke: "#fc754a",
  takenFill: "#333333",
  takenStroke: "#333333",
  text: "#666666",
  screen: "#fc754a",
};

interface CinemaHallProps {
  places: any[];
  selectedIds: string[];
  onSelectToggle: (seatId: string) => void;
}

interface TransformedSeat {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  row: string;
  seat: string;
  status: "free" | "taken";
  price: number;
  type?: string;
}

// Вспомогательная функция для расчета расстояния между пальцами
const getDistance = (touch1: React.Touch, touch2: React.Touch) => {
  const dx = touch1.clientX - touch2.clientX;
  const dy = touch1.clientY - touch2.clientY;

  return Math.hypot(dx, dy);
};

// Вспомогательная функция для получения центра между пальцами
const getMidPoint = (touch1: React.Touch, touch2: React.Touch) => {
  return {
    x: (touch1.clientX + touch2.clientX) / 2,
    y: (touch1.clientY + touch2.clientY) / 2,
  };
};

export const CinemaHall: React.FC<CinemaHallProps> = ({
  places,
  selectedIds,
  onSelectToggle,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });

  // --- Состояние мыши ---
  const [isDragging, setIsDragging] = useState(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  // --- Состояние тача ---
  const lastTouchDistance = useRef<number | null>(null);
  const lastTouchCenter = useRef<{ x: number; y: number } | null>(null);
  const isTouchMoving = useRef(false); // Флаг, было ли движение (для отличия тапа от скролла)

  const [renderData, setRenderData] = useState<{
    seats: TransformedSeat[];
    bounds: {
      minX: number;
      maxX: number;
      minY: number;
      maxY: number;
      width: number;
      height: number;
    };
    rows: { [key: string]: number };
  } | null>(null);

  const hasCenteredRef = useRef(false);

  // 1. Подготовка данных
  useEffect(() => {
    if (!places || places.length === 0) return;

    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;
    const rowYMap: { [key: string]: number } = {};
    const seats: TransformedSeat[] = [];

    places.forEach((p) => {
      if (p.ObjectType && p.ObjectType !== "Place") return;
      // if (!p.Row || !p.Seat) return;
      const seatId = String(p.ID ?? p.id ?? "");

      if (!seatId) return;
      const rowName = String(p.Row ?? "");
      const seatName = String(p.Seat ?? "");

      const rawX = Number(p.CX ?? p.x ?? 0);
      const rawY = Number(p.CY ?? p.y ?? 0);
      const w = SEAT_SIZE;
      const h = SEAT_SIZE;

      if (rawX < minX) minX = rawX;
      if (rawX + w > maxX) maxX = rawX + w;
      if (rawY < minY) minY = rawY;
      if (rawY + h > maxY) maxY = rawY + h;

      if (!(rowName in rowYMap)) rowYMap[rowName] = rawY;

      seats.push({
        id: seatId,
        x: rawX,
        y: rawY,
        w: w,
        h: h,
        row: rowName,
        seat: seatName,
        status: p.avail ? "free" : "taken",
        price: Number(p.Price ?? 0),
        type: String(p.Name_sec ?? p.name_sec ?? ""),
      });
    });

    if (minX === Infinity) return;

    setRenderData({
      seats,
      bounds: {
        minX,
        maxX,
        minY,
        maxY,
        width: maxX - minX,
        height: maxY - minY,
      },
      rows: rowYMap,
    });

    hasCenteredRef.current = false;
  }, [places]);

  // 2. ResizeObserver
  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];

      if (entry) {
        const width = Math.floor(entry.contentRect.width);
        const height = Math.floor(entry.contentRect.height);

        if (width > 0 && height > 0) {
          setCanvasSize({ width, height });
        }
      }
    });

    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  // 3. Функция центрирования
  const fitToScreen = useCallback(() => {
    if (!renderData || canvasSize.width === 0 || canvasSize.height === 0)
      return;

    const { minX, minY, width, height } = renderData.bounds;
    const PADDING_X = 80;
    const PADDING_Y = 160;

    const scaleX = (canvasSize.width - PADDING_X) / width;
    const scaleY = (canvasSize.height - PADDING_Y) / height;

    let newK = Math.min(Math.min(scaleX, scaleY), 1.5);

    if (newK < 0.2) newK = 0.2;

    const contentCenterX = minX + width / 2;
    const contentCenterY = minY + height / 2;

    const canvasCenterX = canvasSize.width / 2;
    const canvasCenterY = canvasSize.height / 2;

    const newX = canvasCenterX - contentCenterX * newK;
    const newY = canvasCenterY - contentCenterY * newK;

    if (Number.isFinite(newX) && Number.isFinite(newY)) {
      setTransform({ x: newX, y: newY, k: newK });
    }
  }, [renderData, canvasSize]);

  // Вызов центрирования
  useEffect(() => {
    if (renderData && canvasSize.width > 0 && !hasCenteredRef.current) {
      fitToScreen();
      hasCenteredRef.current = true;
    }
  }, [renderData, canvasSize, fitToScreen]);

  // 4. Отрисовка
  const draw = useCallback(() => {
    const canvas = canvasRef.current;

    if (!canvas || !renderData || canvasSize.width === 0) return;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

    const { x, y, k } = transform;

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(k, k);

    // Экран
    const { minX, maxX, minY } = renderData.bounds;
    const centerX = (minX + maxX) / 2;
    const screenWidth = (maxX - minX) * 0.9;
    const screenY = minY - 80;

    ctx.beginPath();
    ctx.moveTo(centerX - screenWidth / 2, screenY + SCREEN_CURVE);
    ctx.quadraticCurveTo(
      centerX,
      screenY,
      centerX + screenWidth / 2,
      screenY + SCREEN_CURVE,
    );
    ctx.lineWidth = 6;
    ctx.strokeStyle = COLORS.screen;
    ctx.lineCap = "round";
    ctx.shadowColor = COLORS.screen;
    ctx.shadowBlur = 25;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Места
    renderData.seats.forEach((seat) => {
      const isSelected = selectedIds.includes(seat.id);

      const { x: sx, y: sy, w, h, status } = seat;

      const padding = w * 0.05;
      const boxW = w - padding * 2;
      const boxH = h - padding * 2;
      const scaleX = boxW / 130;
      const scaleY = boxH / 115;
      const startX = sx + padding;
      const startY = sy + padding;

      let fill, stroke;

      if (isSelected) {
        fill = COLORS.selectedFill;
        stroke = COLORS.selectedStroke;
      } else if (status === "taken") {
        fill = COLORS.takenFill;
        stroke = COLORS.takenStroke;
      } else {
        fill = COLORS.freeFill;
        stroke = COLORS.freeStroke;
      }

      ctx.lineWidth = boxW * 0.12;
      ctx.strokeStyle = stroke;
      ctx.fillStyle = fill;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // Спинка
      const brX = startX + 15 * scaleX;
      const brY = startY;
      const brW = 100 * scaleX;
      const brH = 95 * scaleY;
      const brR = 35 * scaleX;

      ctx.beginPath();
      ctx.roundRect(brX, brY, brW, brH, brR);
      ctx.fill();
      ctx.stroke();

      // Сидушка
      ctx.beginPath();
      const left = -7 * scaleX;
      const right = 137 * scaleX;
      const bCenterX = 65 * scaleX;
      const topY = 45 * scaleY;
      const curveStartY = 70 * scaleY;
      const bottomY = 119 * scaleY;

      ctx.moveTo(startX + left, startY + topY);
      ctx.lineTo(startX + left, startY + curveStartY);
      ctx.bezierCurveTo(
        startX + left,
        startY + bottomY,
        startX + (bCenterX - 20 * scaleX),
        startY + bottomY,
        startX + bCenterX,
        startY + bottomY,
      );
      ctx.bezierCurveTo(
        startX + (bCenterX + 20 * scaleX),
        startY + bottomY,
        startX + right,
        startY + bottomY,
        startX + right,
        startY + curveStartY,
      );
      ctx.lineTo(startX + right, startY + topY);
      ctx.stroke();

      if (isSelected) {
        ctx.fillStyle = "#ffffff";
        ctx.font = `bold ${boxW * 0.38}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(seat.seat, brX + brW / 2, brY + brH / 2);
      }
    });

    // Номера рядов
    ctx.fillStyle = COLORS.text;
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";

    Object.entries(renderData.rows).forEach(([rowName, rowY]) => {
      const centerY = rowY + SEAT_SIZE / 2;

      ctx.fillText(rowName, minX - 30, centerY);

      ctx.textAlign = "left";
      ctx.fillText(rowName, maxX + 30, centerY);
      ctx.textAlign = "right";
    });

    ctx.restore();
  }, [renderData, transform, canvasSize, selectedIds]);

  useLayoutEffect(() => {
    requestAnimationFrame(draw);
  }, [draw]);

  // --- ЛОГИКА ВЗАИМОДЕЙСТВИЯ ---

  // Функция поиска места по координатам (универсальная для мыши и тача)
  const checkClick = (clientX: number, clientY: number) => {
    if (!renderData || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const worldX = (x - transform.x) / transform.k;
    const worldY = (y - transform.y) / transform.k;

    const clickedSeat = renderData.seats.find(
      (s) =>
        worldX >= s.x &&
        worldX <= s.x + s.w &&
        worldY >= s.y &&
        worldY <= s.y + s.h,
    );

    if (clickedSeat && clickedSeat.status === "free") {
      onSelectToggle(clickedSeat.id);
    }
  };

  // --- MOUSE HANDLERS ---
  const handleWheel = (e: React.WheelEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const worldX = (mouseX - transform.x) / transform.k;
    const worldY = (mouseY - transform.y) / transform.k;

    const zoomIntensity = 0.0015;
    const newK = Math.min(
      Math.max(transform.k - e.deltaY * zoomIntensity, 0.2),
      4,
    );

    const newX = mouseX - worldX * newK;
    const newY = mouseY - worldY * newK;

    setTransform({ x: newX, y: newY, k: newK });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;

    lastMousePos.current = { x: e.clientX, y: e.clientY };
    setTransform((prev) => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
  };

  const handleMouseClick = (e: React.MouseEvent) => {
    // Если тащили, клик не засчитывается (обычно это можно проверить по дельте движения, но isDragging сбрасывается)
    // Для мыши стандартный onClick работает хорошо, если не было долгого драга.
    // Но чтобы унифицировать, используем checkClick
    checkClick(e.clientX, e.clientY);
  };

  // --- TOUCH HANDLERS ---

  const handleTouchStart = (e: React.TouchEvent) => {
    // Предотвращаем стандартное поведение (скролл страницы и т.д.)
    // e.preventDefault(); // <-- В React пассивные ивенты, preventDefault может ругаться. Лучше CSS touch-action: none.

    isTouchMoving.current = false;

    if (e.touches.length === 1) {
      // Начало драга одним пальцем
      const touch = e.touches[0];

      lastMousePos.current = { x: touch.clientX, y: touch.clientY };
    } else if (e.touches.length === 2) {
      // Начало зума двумя пальцами
      const dist = getDistance(e.touches[0], e.touches[1]);
      const center = getMidPoint(e.touches[0], e.touches[1]);

      lastTouchDistance.current = dist;
      lastTouchCenter.current = center;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // При движении флагаем, что это не тап
    isTouchMoving.current = true;

    if (e.touches.length === 1) {
      // Перемещение (Pan)
      const touch = e.touches[0];
      const dx = touch.clientX - lastMousePos.current.x;
      const dy = touch.clientY - lastMousePos.current.y;

      lastMousePos.current = { x: touch.clientX, y: touch.clientY };
      setTransform((prev) => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
    } else if (e.touches.length === 2) {
      // Зум (Pinch)
      const newDist = getDistance(e.touches[0], e.touches[1]);
      const newCenter = getMidPoint(e.touches[0], e.touches[1]);

      if (lastTouchDistance.current && lastTouchCenter.current) {
        // 1. Рассчитываем изменение масштаба
        const scaleFactor = newDist / lastTouchDistance.current;
        const newK = Math.min(Math.max(transform.k * scaleFactor, 0.2), 4);

        // 2. Рассчитываем смещение
        // Сначала находим точку в мире, которая была под центром зума
        const rect = canvasRef.current!.getBoundingClientRect();

        // Центр пальцев относительно канваса
        const centerX = newCenter.x - rect.left;
        const centerY = newCenter.y - rect.top;

        // Старый центр в мировых координатах (до зума)
        // Важно использовать предыдущий transform.k, но тут мы меняем стейт,
        // поэтому лучше использовать логику "зум в точку" как в handleWheel.

        // Логика как в Wheel:
        // World = (Center - Translate) / Scale
        // NewTranslate = Center - World * NewScale
        // + добавляем смещение самих пальцев (Pan во время зума)

        const oldCenterX = lastTouchCenter.current.x - rect.left;
        const oldCenterY = lastTouchCenter.current.y - rect.top;

        // Координаты точки под старым центром в мире
        const worldX = (oldCenterX - transform.x) / transform.k;
        const worldY = (oldCenterY - transform.y) / transform.k;

        // Новая позиция = (НовыйЦентр) - (World * NewScale)
        // Но так как мы двигаем пальцы, NewCenter сам по себе уже включает dx/dy.
        // Формула: NewX = NewCenterCanvasPos - WorldPos * NewScale

        const newX = centerX - worldX * newK;
        const newY = centerY - worldY * newK;

        setTransform({ x: newX, y: newY, k: newK });
      }

      lastTouchDistance.current = newDist;
      lastTouchCenter.current = newCenter;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    lastTouchDistance.current = null;
    lastTouchCenter.current = null;

    // Эмуляция клика (Tap)
    // Если не было движения и палец убран (touches.length === 0 означает, что последний палец убран)
    if (!isTouchMoving.current && e.changedTouches.length > 0) {
      const touch = e.changedTouches[0];

      checkClick(touch.clientX, touch.clientY);
    }
  };

  // Глобальный слушатель mouseup
  useEffect(() => {
    const onGlobalMouseUp = () => setIsDragging(false);

    window.addEventListener("mouseup", onGlobalMouseUp);

    return () => window.removeEventListener("mouseup", onGlobalMouseUp);
  }, []);

  return (
    // touch-action: none ОЧЕНЬ ВАЖЕН для мобильных браузеров, чтобы они не перехватывали жесты
    <div
      ref={containerRef}
      className="w-full h-full bg-[#121212] relative overflow-hidden select-none touch-none"
    >
      <canvas
        ref={canvasRef}
                height={canvasSize.height}
                width={canvasSize.width}
                className="block cursor-grab active:cursor-grabbing w-full h-full"

                // Мышь
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onTouchEnd={handleTouchEnd}
                onClick={handleMouseClick}

                // Тач
                onTouchMove={handleTouchMove}
                onTouchStart={handleTouchStart}
                onWheel={handleWheel}
      />
      {/* Легенда */}
      <div className="absolute bottom-4 left-0 w-full flex justify-center gap-8 pointer-events-none z-10">
        <LegendItem filled color={COLORS.freeStroke} label="Свободно" />
        <LegendItem filled color={COLORS.takenFill} label="Занято" />
        <LegendItem filled glow color={COLORS.selectedFill} label="Выбрано" />
      </div>

      {/* Кнопка сброса */}
      <button
        className="absolute top-4 right-4 bg-white/10 p-2 rounded text-white hover:bg-white/20 transition z-20 cursor-pointer"
        title="Центрировать"
        onClick={fitToScreen}
      >
        <svg
          fill="none"
          height="20"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          width="20"
        >
          <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </button>
    </div>
  );
};

const LegendItem = ({
  color,
  label,
  filled,
  glow,
}: {
  color: string;
  label: string;
  filled?: boolean;
  glow?: boolean;
}) => (
  <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">
    <div
      className={`w-5 h-5 rounded-md ${filled ? "" : "border-2"}`}
      style={{
        backgroundColor: filled ? color : "transparent",
        borderColor: color,
        boxShadow: glow ? `0 0 10px ${color}` : "none",
      }}
    />
    <span className="text-gray-300 text-sm font-medium">{label}</span>
  </div>
);
