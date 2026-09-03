import { useState } from "react";
import {
  FaCircleCheck,
  FaClock,
  FaUser,
  FaCarSide,
  FaUserShield,
  FaArrowRightLong,
} from "react-icons/fa6";

import { PORTAL_URLS } from "../utils/constants.js";

const PORTAL_SHORTCUTS = [
  { label: "Guest portal", href: PORTAL_URLS.GUEST, icon: FaUser, color: "text-emerald-400 hover:bg-emerald-500/10" },
  { label: "Driver portal", href: PORTAL_URLS.DRIVER, icon: FaCarSide, color: "text-violet-400 hover:bg-violet-500/10" },
  { label: "Admin portal", href: PORTAL_URLS.ADMIN, icon: FaUserShield, color: "text-blue-400 hover:bg-blue-500/10" },
];

const Contact = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="relative overflow-hidden bg-slate-950 py-16 sm:py-20">
      <div
        className="pointer-events-none absolute left-1/2 top-[-200px] -z-0 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-blue-600/15 blur-[110px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-blue-400">
          Contact
        </span>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
          Talk to the team.
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-400">
          Have a question or need help? Use the form below for a local demo
          interaction, or open the portal that matches your role.
        </p>

        <div className="mt-12 overflow-hidden rounded-2xl border border-white/10 shadow-[0_30px_80px_-25px_rgba(2,6,23,0.6)] lg:grid lg:grid-cols-[0.85fr_1.15fr]">
          <div className="flex flex-col justify-between gap-10 bg-white/[0.03] p-7 sm:p-8">
            <div>
              <div className="flex size-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20">
                <FaCircleCheck className="size-4.5" />
              </div>
              <h2 className="mt-5 text-sm font-bold text-white">Need immediate access?</h2>
              <p className="mt-1 text-sm leading-6 text-slate-400">
                Open the appropriate portal to use the existing ride, driver, or
                operations workflows.
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                <FaClock className="size-3" />
                Portal actions use the live application
              </div>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Open a portal
              </p>
              <div className="mt-3 flex flex-col gap-1.5">
                {PORTAL_SHORTCUTS.map(({ label, href, icon: Icon, color }) => (
                  <a
                    key={label}
                    href={href}
                    className={`flex items-center justify-between rounded-xl border border-white/10 px-3.5 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-white/30 ${color}`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon className="size-3.5" />
                      {label}
                    </span>
                    <FaArrowRightLong className="size-3 opacity-60" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {submitted ? (
            <div className="flex flex-col items-start justify-center gap-3 bg-white p-7 sm:p-8" role="status" aria-live="polite">
              <div className="flex size-11 items-center justify-center rounded-xl bg-amber-50 text-amber-700 ring-1 ring-amber-200">
                <FaCircleCheck className="size-5" />
              </div>
              <h2 className="text-base font-bold text-slate-950">
                Form submitted locally
              </h2>
              <p className="text-sm leading-relaxed text-slate-500">
                Thanks for trying the contact form. This landing page demo does
                not send or store messages yet.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="mt-2 inline-flex items-center rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5 bg-white p-7 sm:p-8">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="name"
                    className="text-xs font-bold uppercase tracking-wide text-slate-500"
                  >
                    Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="text-xs font-bold uppercase tracking-wide text-slate-500"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="topic"
                  className="text-xs font-bold uppercase tracking-wide text-slate-500"
                >
                  What's this about?
                </label>
                <select
                  id="topic"
                  name="topic"
                  defaultValue=""
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
                >
                  <option value="" disabled>
                    Select a topic
                  </option>
                  <option>Fleet / property onboarding</option>
                  <option>Report an issue</option>
                  <option>Account access</option>
                  <option>Something else</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="text-xs font-bold uppercase tracking-wide text-slate-500"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={4}
                  className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
                  placeholder="How can we help?"
                />
              </div>

              <button
                type="submit"
                className="mt-1 inline-flex w-fit items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-950/30 focus:ring-offset-2"
              >
                Submit demo form
                <FaArrowRightLong className="size-3.5" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contact;
