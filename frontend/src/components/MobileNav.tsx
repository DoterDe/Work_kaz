import React from "react";
import { Menu, X } from "lucide-react";

/* =========================
   TOP NAVBAR (APPLE STYLE)
========================= */

export function TopNavbar({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
}) {
  const [hidden, setHidden] = React.useState(false);

  const lastY = React.useRef(0);
  const ticking = React.useRef(false);

  React.useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;

      if (!ticking.current) {
        requestAnimationFrame(() => {
          const diff = y - lastY.current;

          if (Math.abs(diff) > 8) {
            if (diff > 0 && y > 80) setHidden(true);
            else setHidden(false);
          }

          lastY.current = y;
          ticking.current = false;
        });

        ticking.current = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
  }, [isOpen]);

  return (
    <header
      style={{ zIndex: 2147483647 }}
      className="fixed top-0 inset-x-0 h-14 md:h-16"
    >
      {/* glass layer */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-2xl border-b border-white/10" />

      <div
        className="relative h-full flex items-center justify-between px-4 max-w-6xl mx-auto transition-all duration-300"
        style={{
          transform:
            hidden && !isOpen ? "translateY(-110%)" : "translateY(0)",
          opacity: hidden && !isOpen ? 0 : 1,
        }}
      >
        <div className="font-semibold text-lg text-white tracking-tight">
          AppName
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-xl hover:bg-white/10 transition"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
    </header>
  );
}

/* =========================
   FULL SCREEN MENU (APPLE)
========================= */

export function AppleMenu({
  isOpen,
  onClose,
  onNavigate,
}: {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: string) => void;
}) {
  React.useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
  }, [isOpen]);

  return (
    <div
      style={{ zIndex: 2147483646 }}
      className={`fixed inset-0 transition ${
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      {/* backdrop */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/40 backdrop-blur-xl transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* panel */}
      <div
        className={`absolute top-0 right-0 h-full w-full max-w-sm bg-white/10 backdrop-blur-2xl border-l border-white/10 shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6 flex flex-col gap-4 text-white">
          <MenuItem label="Home" onClick={() => onNavigate("home")} />
          <MenuItem label="Lessons" onClick={() => onNavigate("catalog")} />
          <MenuItem label="Vocabulary" onClick={() => onNavigate("vocabulary")} />
          <MenuItem label="Profile" onClick={() => onNavigate("dashboard")} />
        </div>
      </div>
    </div>
  );
}

/* =========================
   MENU ITEM
========================= */

function MenuItem({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="text-left text-lg py-3 px-3 rounded-xl hover:bg-white/10 transition"
    >
      {label}
    </button>
  );
}

/* =========================
   APP LAYOUT EXAMPLE
========================= */

export default function AppLayout({
  children,
  navigate,
}: {
  children: React.ReactNode;
  navigate: (page: string) => void;
}) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-black text-white">
      <TopNavbar isOpen={isMenuOpen} setIsOpen={setIsMenuOpen} />

      <AppleMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onNavigate={(page) => {
          navigate(page);
          setIsMenuOpen(false);
        }}
      />

      {/* page content */}
      <main className="pt-16">{children}</main>
    </div>
  );
}