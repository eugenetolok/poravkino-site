import React, { useState, useEffect, useMemo } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/modal";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Checkbox } from "@heroui/checkbox";
import { addToast } from "@heroui/toast";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

import { Movie, Performance, Seat } from "@/types";

// --- Список известных доменов ---
const KNOWN_DOMAINS = [
  "yandex.ru",
  "ya.ru",
  "mail.ru",
  "xmail.ru",
  "rambler.ru",
  "bk.ru",
  "list.ru",
  "inbox.ru",
  "gmail.com",
  "yahoo.com",
  "outlook.com",
  "icloud.com",
  "me.com",
  "hotmail.com",
  "live.com",
  "aol.com",
  "googlemail.com",
];

// --- Вспомогательный компонент для предупреждений ---
const WarningDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Продолжить",
  cancelText = "Исправить",
}: any) => (
  <Modal
    backdrop="blur"
    classNames={{
      base: "bg-[#18181b] border border-white/10 shadow-2xl z-[60]",
    }}
    isOpen={isOpen}
    placement="center"
    size="xs"
    onClose={onClose}
  >
    <ModalContent>
      <ModalHeader className="flex flex-col gap-1 text-white text-base">
        {title}
      </ModalHeader>
      <ModalBody>
        <p className="text-gray-400 text-sm">{description}</p>
      </ModalBody>
      <ModalFooter>
        <Button
          className="text-white hover:bg-white/10"
          size="sm"
          variant="flat"
          onPress={onClose}
        >
          {cancelText}
        </Button>
        <Button color="warning" size="sm" variant="shadow" onPress={onConfirm}>
          {confirmText}
        </Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
);

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalPrice: number;
  movie: Movie | null;
  performance: Performance | null;
  selectedSeats: Seat[];
  onSubmit: (email: string, phone: string) => void;
  isLoading: boolean;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  totalPrice,
  movie,
  performance,
  selectedSeats,
  onSubmit,
  isLoading,
}) => {
  // --- State ---
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [agreed, setAgreed] = useState(true);

  const emailWarning = useDisclosure();
  const phoneWarning = useDisclosure();

  useEffect(() => {
    if (isOpen) {
      const savedEmail = localStorage.getItem("user_email");
      const savedPhone = localStorage.getItem("user_phone");

      if (savedEmail) setEmail(savedEmail);
      if (savedPhone) setPhone(savedPhone);
    }
  }, [isOpen]);

  const isEmailValidFormat = useMemo(() => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }, [email]);

  const isPhoneValidFormat = useMemo(() => {
    const digits = phone.replace(/\D/g, "");

    return digits.length >= 10;
  }, [phone]);

  const handleEmailBlur = () => {
    if (!email) return;
    const domain = email.split("@")[1];

    if (domain && !KNOWN_DOMAINS.includes(domain.toLowerCase())) {
      emailWarning.onOpen();
    }
  };

  const handleMainSubmit = () => {
    if (!agreed) {
      addToast({
        title: "Внимание",
        description: "Примите соглашение",
        color: "warning",
      });

      return;
    }
    if (!isEmailValidFormat) {
      addToast({
        title: "Ошибка",
        description: "Некорректный Email",
        color: "danger",
      });

      return;
    }

    if (!isPhoneValidFormat) {
      phoneWarning.onOpen();

      return;
    }

    proceedWithSubmission();
  };

  const proceedWithSubmission = () => {
    localStorage.setItem("user_email", email);
    localStorage.setItem("user_phone", phone);

    emailWarning.onClose();
    phoneWarning.onClose();

    onSubmit(email, phone);
  };

  // Safety check
  if (!movie || !performance) return null;

  return (
    <>
      <Modal
        backdrop="blur"
        classNames={{
          base: "bg-[#09090b] border border-white/10 shadow-[0_0_40px_-10px_rgba(0,0,0,0.8)] rounded-2xl mx-4 my-auto max-h-[90vh]",
          header: "border-b border-white/5 pb-3 pt-4 px-5",
          body: "py-4 px-5 gap-5", // Уменьшили вертикальные отступы
          footer: "border-t border-white/5 py-3 px-5 bg-white/[0.02]",
          closeButton: "top-3 right-3 text-white/50 hover:text-white",
        }}
        isOpen={isOpen}
        scrollBehavior="inside"
        size="md" // Уменьшили размер контейнера
        onClose={onClose}
        // На мобильном лучше работает placement="center" или "bottom" с отступом
        placement="center"
      >
        <ModalContent>
          {() => (
            <>
              {/* --- Header --- */}
              {/* <ModalHeader className="flex flex-col gap-0.5">
                                <h2 className="text-xl font-bold text-white uppercase tracking-tight">
                                    Оплата билетов
                                </h2>
                                <p className="text-[11px] text-gray-500 font-normal">
                                    Введите контакты для получения чека
                                </p>
                            </ModalHeader> */}

              <ModalBody>
                {/* --- 1. Compact Info Block (No Poster) --- */}
                <div className="flex flex-col gap-2 pb-2">
                  {/* Movie Title */}
                  <h3 className="text-lg md:text-xl font-bold text-white leading-tight pr-4">
                    {movie.name}
                  </h3>

                  {/* Meta Tags */}
                  <div className="flex flex-wrap gap-2 items-center text-xs md:text-sm text-gray-400">
                    <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded border border-white/10">
                      <span className="text-gray-200 font-medium">
                        {format(new Date(performance.time), "d MMMM", {
                          locale: ru,
                        })}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-gray-600" />
                      <span className="text-white font-bold">
                        {format(new Date(performance.time), "HH:mm")}
                      </span>
                    </div>
                    <div className="px-2 py-1 rounded border border-white/10 bg-white/5 text-gray-300">
                      Зал {performance.hall_name}
                    </div>
                  </div>

                  {/* Seats String */}
                  <div className="mt-1 text-sm text-gray-500">
                    Места:{" "}
                    <span className="text-primary font-medium">
                      {selectedSeats
                        .map((s) => `${s.row} ряд ${s.seat}`)
                        .join(", ")}
                    </span>
                  </div>
                </div>

                {/* --- 2. Form Inputs --- */}
                <div className="flex flex-col gap-4">
                  <Input
                    classNames={{
                      label:
                        "text-gray-500 group-data-[filled-within=true]:text-primary",
                      inputWrapper:
                        "bg-white/5 border-white/10 data-[hover=true]:border-white/20 group-data-[focus=true]:border-primary/50",
                      input: "text-white text-base", // Базовый размер шрифта, чтобы iPhone не зумил
                    }}
                    errorMessage={
                      email !== "" && !isEmailValidFormat
                        ? "Проверьте адрес почты"
                        : undefined
                    }
                    inputMode="email"
                    isInvalid={email !== "" && !isEmailValidFormat}
                    label="Email"
                    placeholder="ticket@mail.ru"
                    type="email"
                    value={email}
                    variant="faded"
                    onBlur={handleEmailBlur}
                    onValueChange={setEmail}
                  />

                  <Input
                    classNames={{
                      label:
                        "text-gray-500 group-data-[filled-within=true]:text-primary",
                      inputWrapper:
                        "bg-white/5 border-white/10 data-[hover=true]:border-white/20 group-data-[focus=true]:border-primary/50",
                      input: "text-white text-base",
                    }}
                    inputMode="tel"
                    label="Телефон"
                    placeholder="+7"
                    type="tel"
                    value={phone}
                    variant="faded"
                    onValueChange={setPhone}
                  />
                </div>

                {/* --- 3. Compact Agreement --- */}
                <div className="flex items-start pt-1">
                  <Checkbox
                    classNames={{
                      wrapper:
                        "mt-0.5 before:border-white/30 after:bg-primary text-white",
                      label:
                        "text-[11px] text-gray-500 leading-tight w-full ml-1",
                      icon: "text-black",
                    }}
                    isSelected={agreed}
                    size="sm"
                    onValueChange={setAgreed}
                  >
                    Я принимаю условия{" "}
                    <a
                      className="text-gray-300 hover:text-primary underline decoration-1 underline-offset-2"
                      href="/offer"
                      target="_blank"
                    >
                      оферты
                    </a>
                    ,{" "}
                    <a
                      className="text-gray-300 hover:text-primary underline decoration-1 underline-offset-2"
                      href="/rules"
                      target="_blank"
                    >
                      правила посещения
                    </a>{" "}
                    и даю согласие на обработку данных.
                  </Checkbox>
                </div>
              </ModalBody>

              {/* --- Footer --- */}
              <ModalFooter className="flex flex-row items-center justify-between gap-3">
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                    Итого
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-white tracking-tight">
                      {totalPrice}
                    </span>
                    <span className="text-sm font-medium text-gray-500">₽</span>
                  </div>
                </div>

                <Button
                  className={`
                                        flex-grow md:flex-grow-0 md:w-auto px-8 h-11 text-sm font-bold rounded-xl shadow-lg
                                        bg-gradient-to-r from-primary via-orange-500 to-primary bg-[length:200%_auto]
                                        ${isLoading ? "" : "animate-gradient-xy"}
                                        text-black border-none
                                    `}
                  isDisabled={!agreed}
                  isLoading={isLoading}
                  onPress={handleMainSubmit}
                >
                  {isLoading ? "Оплата..." : "Оплатить"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* --- Warnings --- */}
      <WarningDialog
        confirmText="Да, верно"
        description={
          <>
            Домен{" "}
            <span className="text-white font-medium">
              @{email.split("@")[1]}
            </span>{" "}
            выглядит необычно. Уверены, что адрес верный?
          </>
        }
        isOpen={emailWarning.isOpen}
        title="Опечатка в почте?"
        onClose={emailWarning.onClose}
        onConfirm={() => {
          emailWarning.onClose();
          // Try to focus next input naturally
        }}
      />

      <WarningDialog
        cancelText="Ввести"
        confirmText="Без номера"
        description="Телефон помогает восстановить билеты при ошибке в почте. Продолжить без него?"
        isOpen={phoneWarning.isOpen}
        title="Номер телефона"
        onClose={phoneWarning.onClose}
        onConfirm={proceedWithSubmission}
      />
    </>
  );
};
