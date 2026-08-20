import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaMapLocationDot,
    FaRoute,
    FaShieldHalved,
    FaArrowLeft,
} from "react-icons/fa6";

import useAuth from "../../hooks/useAuth.js";
import GoogleButton from "../../components/auth/GoogleButton.jsx";
import { ROUTES } from "../../utils/constants.js";

const INITIAL = {
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
};

const validate = (form) => {
    const errors = {};

    if (!form.fullName.trim()) errors.fullName = "Full name is required.";

    if (!form.email.trim())
        errors.email = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(form.email.trim()))
        errors.email = "Enter a valid email address.";

    if (!form.phone.trim()) errors.phone = "Phone number is required.";

    if (!form.password)
        errors.password = "Password is required.";
    else if (form.password.length < 6)
        errors.password = "Use at least 6 characters.";

    if (form.password !== form.confirmPassword)
        errors.confirmPassword = "Passwords do not match.";

    return errors;
};

const Logo = () => (
    <div className="flex size-12 shrink-0 items-center justify-center rounded-xl">
        <img
            src="/smart-cab-logo.png"
            alt="Smart Cab Dispatch"
            className="h-full w-full object-contain p-1.5 md:brightness-0 md:invert"
        />
    </div>
);

const FEATURES = [
    { icon: FaMapLocationDot, title: "Travel", text: "Simple trip management" },
    { icon: FaRoute, title: "Rides", text: "Follow your journey" },
    { icon: FaShieldHalved, title: "Secure", text: "Protected guest access" },
];

const Field = ({
    id,
    name,
    label,
    type = "text",
    placeholder,
    value,
    onChange,
    error,
    disabled,
    className = "",
    autoComplete,
}) => (
    <div className={className}>
        <label htmlFor={id} className="text-sm font-medium text-slate-700">
            {label}
        </label>

        <input
            id={id}
            name={name}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            disabled={disabled}
            autoComplete={autoComplete}
            aria-invalid={Boolean(error)}
            className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition placeholder:text-slate-400 ${
                error
                    ? "border-red-300 focus:ring-4 focus:ring-red-50"
                    : "border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50"
            } disabled:cursor-not-allowed disabled:bg-slate-50`}
        />

        {error && (
            <p className="mt-1.5 text-xs font-medium text-red-600">
                {error}
            </p>
        )}
    </div>
);

const Signup = () => {
    const { signup, googleLogin } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState(INITIAL);
    const [errors, setErrors] = useState({});
    const [formError, setFormError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleChange = ({ target }) => {
        setForm((prev) => ({
            ...prev,
            [target.name]: target.value,
        }));

        setErrors((prev) => ({
            ...prev,
            [target.name]: undefined,
        }));

        setFormError("");
    };

    const finish = () => {
        navigate(ROUTES.DASHBOARD, { replace: true });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const validation = validate(form);

        if (Object.keys(validation).length) {
            setErrors(validation);
            return;
        }

        try {
            setSubmitting(true);
            setFormError("");

            await signup({
                fullName: form.fullName.trim(),
                email: form.email.trim(),
                phone: form.phone.trim(),
                password: form.password,
            });

            finish();
        } catch (error) {
            setFormError(
                error?.message || "Unable to create your account."
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleGoogle = async (idToken) => {
        try {
            setSubmitting(true);
            setFormError("");

            await googleLogin(idToken);
            finish();
        } catch (error) {
            setFormError(
                error?.message || "Unable to continue with Google."
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-dvh bg-slate-950 px-4 py-4 sm:px-6 sm:py-6 lg:p-6">
            <div className="mx-auto flex min-h-[calc(100dvh-2rem)] max-w-[1180px] overflow-hidden rounded-[28px] border border-white/10 bg-white shadow-[0_25px_80px_rgba(0,0,0,0.35)] sm:min-h-[calc(100dvh-3rem)]">
                <section className="relative hidden overflow-hidden bg-slate-950 lg:flex lg:w-1/2">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(16,185,129,0.18),transparent_35%),radial-gradient(circle_at_15%_90%,rgba(5,150,105,0.16),transparent_35%)]" />

                    <div className="relative flex w-full flex-col px-10 py-9 xl:px-12 xl:py-10">
                        <div className="flex items-center gap-3">
                            <Logo />
                            <div>
                                <p className="text-base font-bold text-white">
                                    Smart Cab
                                </p>
                                <p className="text-xs text-slate-400">
                                    Dispatch platform
                                </p>
                            </div>
                        </div>

                        <div className="my-auto max-w-[500px]">
                            <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-400">
                                Guest Travel Portal
                            </p>
                            <h1 className="mt-4 text-[42px] font-bold leading-[1.08] tracking-tight text-white xl:text-5xl">
                                Your journey starts here.
                            </h1>
                            <p className="mt-5 max-w-[480px] text-[15px] leading-7 text-slate-400">
                                Create your account and manage every Smart Cab
                                journey from one place.
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

                <section className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto bg-white px-5 py-6 sm:px-8 sm:py-7 lg:px-10 xl:px-12">
                    <div className="w-full max-w-[460px]">
                        <div className="mb-5 flex items-center gap-3 lg:hidden">
                            <Logo />
                            <div>
                                <p className="text-base font-bold text-slate-950">
                                    Smart Cab
                                </p>
                                <p className="text-xs text-slate-500">
                                    Guest Portal
                                </p>
                            </div>
                        </div>

                        <div className="mb-4">
                            <p className="text-sm font-semibold text-emerald-600">
                                Guest Portal
                            </p>

                            <h2 className="mt-1.5 text-[30px] font-bold tracking-tight text-slate-950">
                                Create your account
                            </h2>

                            <p className="mt-1.5 text-sm leading-6 text-slate-500">
                                Sign up to book and manage your rides.
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

                            <div className="grid gap-3">
                                <Field
                                    id="fullName"
                                    name="fullName"
                                    label="Full name"
                                    placeholder="Your full name"
                                    value={form.fullName}
                                    onChange={handleChange}
                                    error={errors.fullName}
                                    disabled={submitting}
                                    autoComplete="name"
                                />

                                <Field
                                    id="email"
                                    name="email"
                                    type="email"
                                    label="Email address"
                                    placeholder="guest@smartcab.com"
                                    value={form.email}
                                    onChange={handleChange}
                                    error={errors.email}
                                    disabled={submitting}
                                    autoComplete="email"
                                />

                                <Field
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    label="Phone number"
                                    placeholder="+91 98765 43210"
                                    value={form.phone}
                                    onChange={handleChange}
                                    error={errors.phone}
                                    disabled={submitting}
                                    autoComplete="tel"
                                />

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <Field
                                        id="password"
                                        name="password"
                                        type="password"
                                        label="Password"
                                        placeholder="••••••••"
                                        value={form.password}
                                        onChange={handleChange}
                                        error={errors.password}
                                        disabled={submitting}
                                        autoComplete="new-password"
                                    />

                                    <Field
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        label="Confirm password"
                                        placeholder="••••••••"
                                        value={form.confirmPassword}
                                        onChange={handleChange}
                                        error={errors.confirmPassword}
                                        disabled={submitting}
                                        autoComplete="new-password"
                                    />
                                </div>

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
                                        ? "Creating account…"
                                        : "Create Guest Account"}
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
                            Already have an account?{" "}
                            <button
                                type="button"
                                onClick={() => navigate(ROUTES.LOGIN)}
                                className="cursor-pointer font-bold text-emerald-600 hover:text-emerald-700"
                            >
                                Sign in
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Signup;