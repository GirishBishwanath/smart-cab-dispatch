import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    FaMapLocationDot,
    FaRoute,
    FaShieldHalved,
    FaArrowRight,
    FaArrowLeft,
} from "react-icons/fa6";

import useAuth from "../../hooks/useAuth.js";
import GoogleButton from "../../components/auth/GoogleButton.jsx";
import { roleHomePath, ROUTES, LANDING_URL } from "../../utils/constants.js";

const INITIAL_FORM = { email: "", password: "" };

const DEMO_CREDENTIALS = { email: "girish@smartcab.com", password: "Guest123" };

const FEATURES = [
    { icon: FaMapLocationDot, title: "Travel", text: "Simple trip management" },
    { icon: FaRoute, title: "Rides", text: "Follow your journey" },
    { icon: FaShieldHalved, title: "Secure", text: "Protected guest access" },
];

const validate = ({ email, password }) => {
    const errors = {};

    if (!email.trim()) errors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(email.trim()))
        errors.email = "Enter a valid email address";

    if (!password) errors.password = "Password is required";

    return errors;
};

const Logo = ({ size = "md", invert = false }) => (
    <div
        className={`flex shrink-0 items-center justify-center overflow-hidden bg-transparent ${size === "sm" ? "size-11 rounded-xl" : "size-14 rounded-2xl"
            }`}
    >
        <img
            src="/smart-cab-logo.png"
            alt="Smart Cab Dispatch"
            className={`h-full w-full object-contain p-1.5 ${invert ? "brightness-0 invert" : ""}`}
        />
    </div>
);

const Field = ({ id, label, error, className = "", ...props }) => (
    <div className="flex min-w-0 flex-col gap-1.5">
        <label htmlFor={id} className="text-sm font-medium text-slate-700">
            {label}
        </label>

        <input
            id={id}
            aria-invalid={Boolean(error)}
            className={`w-full rounded-lg border px-3.5 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-50 ${error
                    ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                    : "border-slate-300 focus:border-emerald-600 focus:ring-emerald-100"
                } ${className}`}
            {...props}
        />

        {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
);

const Login = () => {
    const { login, googleLogin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [form, setForm] = useState(INITIAL_FORM);
    const [fieldErrors, setFieldErrors] = useState({});
    const [formError, setFormError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleChange = ({ target }) => {
        setForm((previous) => ({
            ...previous,
            [target.name]: target.value,
        }));
        setFieldErrors((previous) => ({
            ...previous,
            [target.name]: undefined,
        }));
        setFormError("");
    };

    const redirect = (user) => {
        const redirectTo =
            location.state?.from?.pathname ?? roleHomePath(user.role);

        navigate(redirectTo, { replace: true });
    };

    const handleDemoLogin = () => {
        setForm(DEMO_CREDENTIALS);
        setFieldErrors({});
        setFormError("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const errors = validate(form);

        if (Object.keys(errors).length) {
            setFieldErrors(errors);
            return;
        }

        setSubmitting(true);
        setFormError("");

        try {
            const user = await login(form.email.trim(), form.password);
            redirect(user);
        } catch (error) {
            setFormError(
                error?.message || "Unable to sign in. Please try again."
            );
            setSubmitting(false);
        }
    };

    const handleGoogle = async (idToken) => {
        setSubmitting(true);
        setFormError("");

        try {
            const user = await googleLogin(idToken);
            redirect(user);
        } catch (error) {
            setFormError(
                error?.message || "Unable to continue with Google."
            );
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-dvh bg-slate-950 px-4 py-4 sm:px-6 sm:py-6 lg:p-6">
            <div className="mx-auto flex min-h-[calc(100dvh-2rem)] max-w-[1180px] overflow-hidden rounded-[28px] border border-white/10 bg-white shadow-[0_25px_80px_rgba(0,0,0,0.35)] sm:min-h-[calc(100dvh-3rem)]">
                <section className="relative hidden overflow-hidden bg-slate-950 lg:flex lg:w-1/2">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(16,185,129,0.18),transparent_35%),radial-gradient(circle_at_15%_90%,rgba(5,150,105,0.16),transparent_35%)]" />

                    <div className="relative flex w-full flex-col px-10 py-9 xl:px-12 xl:py-10">
                        <div className="flex items-center justify-between gap-3">
                            <a href={LANDING_URL} className="flex items-center gap-3">
                                <Logo invert />
                                <div>
                                    <p className="text-base font-bold tracking-tight text-white">
                                        Smart Cab
                                    </p>
                                    <p className="mt-0.5 text-xs text-slate-400">
                                        Dispatch Platform
                                    </p>
                                </div>
                            </a>

                            <a href={LANDING_URL} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-400 transition hover:bg-white/5 hover:text-white">
                                <FaArrowLeft className="size-3" />
                                Back to home
                            </a>
                        </div>

                        <div className="my-auto max-w-[510px]">
                            <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-400">
                                Guest Travel Portal
                            </p>

                            <h1 className="mt-4 text-[42px] font-bold leading-[1.08] tracking-tight text-white xl:text-5xl">
                                Travel comfortably. Ride confidently.
                            </h1>

                            <p className="mt-5 max-w-[480px] text-[15px] leading-7 text-slate-400">
                                Manage your ride requests, view your assigned cab
                                and stay informed throughout your journey.
                            </p>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            {FEATURES.map(({ icon: Icon, title, text }) => (
                                <div
                                    key={title}
                                    className="rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3.5"
                                >
                                    <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10">
                                        <Icon className="size-4 text-emerald-400" />
                                    </div>
                                    <p className="mt-3 text-sm font-semibold text-white">
                                        {title}
                                    </p>
                                    <p className="mt-0.5 text-xs text-slate-500">
                                        {text}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto bg-white px-5 py-7 sm:px-8 sm:py-8 lg:px-10 xl:px-12">
                    <div className="w-full max-w-[460px]">
                        <div className="mb-6 flex items-center justify-between gap-3 lg:hidden">
                            <a href={LANDING_URL} className="flex items-center gap-3">
                                <Logo size="sm" />
                                <div>
                                    <p className="text-base font-bold text-slate-950">
                                        Smart Cab
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        Dispatch Platform
                                    </p>
                                </div>
                            </a>

                            <a href={LANDING_URL} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-slate-950">
                                <FaArrowLeft className="size-3" />
                                Home
                            </a>
                        </div>

                        <div className="mb-5">
                            <p className="text-sm font-semibold text-emerald-600">
                                Guest Portal
                            </p>
                            <h2 className="mt-1.5 text-[30px] font-bold tracking-tight text-slate-950 sm:text-[32px]">
                                Welcome back
                            </h2>
                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                Sign in to manage your Smart Cab journey.
                            </p>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            noValidate
                            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)] sm:p-6"
                        >
                            {formError && (
                                <div
                                    role="alert"
                                    className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700"
                                >
                                    {formError}
                                </div>
                            )}

                            <div className="space-y-4">
                                <Field
                                    id="email"
                                    name="email"
                                    type="email"
                                    label="Email address"
                                    autoComplete="email"
                                    placeholder="guest@smartcab.com"
                                    value={form.email}
                                    onChange={handleChange}
                                    error={fieldErrors.email}
                                    disabled={submitting}
                                />

                                <Field
                                    id="password"
                                    name="password"
                                    type="password"
                                    label="Password"
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    value={form.password}
                                    onChange={handleChange}
                                    error={fieldErrors.password}
                                    disabled={submitting}
                                />

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="mt-1 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {submitting && (
                                        <span
                                            role="status"
                                            aria-label="Loading"
                                            className="inline-block size-4 animate-spin rounded-full border-2 border-current border-r-transparent"
                                        />
                                    )}
                                    {submitting
                                        ? "Signing in…"
                                        : "Sign in to Guest Portal"}
                                </button>

                                <button
                                    type="button"
                                    onClick={handleDemoLogin}
                                    disabled={submitting}
                                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-emerald-300 bg-emerald-50/60 px-4 text-sm font-semibold text-emerald-700 transition hover:border-emerald-400 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <span aria-hidden="true">✨</span>
                                    Use demo credentials
                                </button>
                            </div>

                            <div className="my-4 flex items-center gap-3 sm:my-5">
                                <div className="h-px flex-1 bg-slate-200" />
                                <span className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                    Or continue with
                                </span>
                                <div className="h-px flex-1 bg-slate-200" />
                            </div>

                            <GoogleButton
                                disabled={submitting}
                                onSuccess={handleGoogle}
                            />
                        </form>

                        <div className="mt-4 text-center text-sm text-slate-500">
                            New to Smart Cab?{" "}
                            <button
                                type="button"
                                onClick={() => navigate(ROUTES.SIGNUP)}
                                className="cursor-pointer font-bold text-emerald-600 hover:text-emerald-700"
                            >
                                Create an account
                                <FaArrowRight className="ml-1 inline size-3" />
                            </button>
                        </div>

                        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
                            <FaShieldHalved className="size-3 text-emerald-500" />
                            <span>Secure guest access</span>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Login;