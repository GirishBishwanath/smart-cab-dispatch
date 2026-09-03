import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, NavLink } from "react-router-dom";
import { FaBars, FaXmark, FaArrowRightLong, FaChevronDown, FaUser, FaCarSide, FaUserShield, FaListCheck, FaRoute, FaCircleInfo, FaEnvelope } from "react-icons/fa6";

import { NAV_LINKS, PORTAL_URLS, ROUTES } from "../utils/constants.js";

const NAV_ICONS = { Features: FaListCheck, "How it works": FaRoute, About: FaCircleInfo, Contact: FaEnvelope };
const SIGN_IN_OPTIONS = [
  { label: "Guest", href: PORTAL_URLS.GUEST, icon: FaUser, color: "text-emerald-400 hover:bg-emerald-500/10" },
  { label: "Driver", href: PORTAL_URLS.DRIVER, icon: FaCarSide, color: "text-violet-400 hover:bg-violet-500/10" },
  { label: "Admin", href: PORTAL_URLS.ADMIN, icon: FaUserShield, color: "text-blue-400 hover:bg-blue-500/10" },
];

const MobileDrawer = ({ open, onClose }) => {
  const closeButtonRef = useRef(null);
  const drawerRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement;
    closeButtonRef.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !drawerRef.current) return;
      const focusable = drawerRef.current.querySelectorAll("a[href], button:not([disabled])");
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, [open, onClose]);

  return createPortal(
    <div className={`fixed inset-0 z-[100] md:hidden ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div className={`absolute inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`} onClick={onClose} />
      <div
        ref={drawerRef}
        id="mobile-navigation"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        className={`absolute inset-y-0 right-0 flex w-[86%] max-w-sm flex-col border-l border-white/10 bg-slate-950 p-6 shadow-2xl transition-transform duration-300 ease-out ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-white">Navigation</span>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="flex size-10 items-center justify-center rounded-xl border border-white/10 text-slate-200 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-white/40"
            aria-label="Close menu"
          >
            <FaXmark className="size-4" />
          </button>
        </div>
        <nav className="mt-8 flex flex-col gap-1" aria-label="Mobile primary navigation">
          {NAV_LINKS.map((link) => {
            const Icon = NAV_ICONS[link.label];
            return (
              <NavLink
                key={link.label}
                to={link.to}
                onClick={onClose}
                className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-white/30 ${isActive ? "bg-white/10 text-white" : "text-slate-200 hover:bg-white/5"}`}
              >
                <Icon className="size-4 text-slate-500" />
                {link.label}
              </NavLink>
            );
          })}
        </nav>
        <div className="mt-auto border-t border-white/10 pt-6">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Open a portal</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {SIGN_IN_OPTIONS.map(({ label, href, icon: Icon, color }) => (
              <a key={label} href={href} className={`flex flex-col items-center gap-1.5 rounded-xl border border-white/10 py-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-white/30 ${color}`}>
                <Icon className="size-4" />
                {label}
              </a>
            ))}
          </div>
          <a href={PORTAL_URLS.GUEST} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-950 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-950">Book a ride <FaArrowRightLong className="size-3.5" /></a>
        </div>
      </div>
    </div>,
    document.body
  );
};

const SignInMenu = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => { const onClick = (event) => { if (ref.current && !ref.current.contains(event.target)) setOpen(false); }; document.addEventListener("mousedown", onClick); return () => document.removeEventListener("mousedown", onClick); }, []);
  return <div ref={ref} className="relative"><button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-haspopup="menu" className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-3.5 py-2.5 text-sm font-semibold text-slate-200 hover:border-white/20 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-white/30">Sign in <FaChevronDown className={`size-2.5 transition-transform ${open ? "rotate-180" : ""}`} /></button>{open && <div className="absolute right-0 top-[calc(100%+8px)] w-48 overflow-hidden rounded-xl border border-white/10 bg-slate-900 p-1.5 shadow-2xl" role="menu">{SIGN_IN_OPTIONS.map(({ label, href, icon: Icon, color }) => <a key={label} href={href} role="menuitem" className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-white/30 ${color}`}><Icon className="size-3.5" />Sign in as {label}</a>)}</div>}</div>;
};

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuButtonRef = useRef(null);
  const closeMobileMenu = () => setMobileOpen(false);

  useEffect(() => { const onScroll = () => setScrolled(window.scrollY > 12); onScroll(); window.addEventListener("scroll", onScroll, { passive: true }); return () => window.removeEventListener("scroll", onScroll); }, []);
  useEffect(() => { document.body.style.overflow = mobileOpen ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [mobileOpen]);

  return <>
    <header className={`sticky top-0 z-50 border-b transition-colors ${scrolled ? "border-white/10 bg-slate-950/85 backdrop-blur-xl" : "border-transparent bg-slate-950/40 backdrop-blur-sm"} `}>
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to={ROUTES.HOME} className="flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-slate-950">
          <img src="/smart-cab-logo.png" alt="Smart Cab Dispatch" className="logo-on-dark h-8 w-8 object-contain" />
          <span><span className="block text-[15px] font-bold tracking-tight text-white">Smart Cab</span><span className="block text-[10px] font-medium text-slate-500">Dispatch platform</span></span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">{NAV_LINKS.map((link) => <NavLink key={link.label} to={link.to} className={({ isActive }) => `rounded-lg px-3.5 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-white/30 ${isActive ? "text-white" : "text-slate-400 hover:text-white"}`}>{link.label}</NavLink>)}</nav>
        <div className="hidden items-center gap-2 md:flex"><SignInMenu /><a href={PORTAL_URLS.GUEST} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-950">Book a ride <FaArrowRightLong className="size-3.5" /></a></div>
        <button
          ref={menuButtonRef}
          type="button"
          onClick={() => setMobileOpen(true)}
          className="flex size-10 items-center justify-center rounded-xl border border-white/10 text-slate-200 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-white/40 md:hidden"
          aria-label="Open menu"
          aria-expanded={mobileOpen}
          aria-controls="mobile-navigation"
        >
          <FaBars className="size-4" />
        </button>
      </div>
    </header>
    <MobileDrawer open={mobileOpen} onClose={closeMobileMenu} />
  </>;
};

export default Navbar;
