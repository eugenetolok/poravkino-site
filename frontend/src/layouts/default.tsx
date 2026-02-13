import { ToastProvider } from "@heroui/toast";

import { Navbar } from "@/components/Navbar";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-[var(--surface-0)] text-[var(--text-primary)] transition-colors duration-500">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        <div className="absolute -left-28 -top-28 h-96 w-96 rounded-full bg-orange-400/20 blur-[120px] dark:bg-orange-500/15" />
        <div className="absolute right-[-8%] top-24 h-[28rem] w-[28rem] rounded-full bg-amber-300/25 blur-[130px] dark:bg-amber-500/10" />
        <div className="absolute bottom-[-12rem] left-[20%] h-[32rem] w-[32rem] rounded-full bg-cyan-300/20 blur-[150px] dark:bg-cyan-600/10" />
        <div
          className="absolute inset-0 opacity-30 dark:opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(20,20,20,0.08) 1px, transparent 0)",
            backgroundSize: "22px 22px",
          }}
        />
      </div>

      <ToastProvider />
      <Navbar />

      <main className="relative z-10 mx-auto w-full max-w-[1600px] flex-1 px-4 pb-16 pt-4 md:px-6 md:pt-6">
        {children}
      </main>

      <footer className="relative z-10 mt-auto border-t border-black/10 py-8 dark:border-white/10">
        <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-2 px-4 text-xs uppercase tracking-[0.15em] text-[var(--text-muted)] md:flex-row md:items-center md:justify-between md:px-6">
          <p>© {new Date().getFullYear()} Пора в кино</p>
          <p>Онлайн-расписание и покупка билетов</p>
        </div>
      </footer>
    </div>
  );
}
