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
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_8%_6%,rgba(255,150,106,0.38),transparent_34%),radial-gradient(circle_at_88%_12%,rgba(133,199,255,0.34),transparent_36%),radial-gradient(circle_at_52%_94%,rgba(132,232,214,0.28),transparent_42%)] dark:bg-[radial-gradient(circle_at_8%_6%,rgba(255,120,84,0.2),transparent_34%),radial-gradient(circle_at_88%_12%,rgba(95,140,255,0.2),transparent_38%),radial-gradient(circle_at_52%_94%,rgba(66,181,164,0.16),transparent_42%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.55)_0%,rgba(255,255,255,0.2)_34%,rgba(255,164,120,0.18)_66%,rgba(120,190,255,0.24)_100%)] dark:bg-[linear-gradient(135deg,rgba(8,14,24,0.66)_0%,rgba(8,16,29,0.82)_38%,rgba(35,22,30,0.42)_68%,rgba(20,37,61,0.62)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_16%,rgba(255,255,255,0.56),transparent_44%)] dark:bg-[radial-gradient(circle_at_50%_16%,rgba(255,255,255,0.08),transparent_44%)]" />
        <div
          className="absolute inset-0 opacity-[0.14] dark:opacity-[0.08]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(31,49,77,0.16) 1px, transparent 0)",
            backgroundSize: "20px 20px",
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
