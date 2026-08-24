import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    FaCarSide,
    FaRoute,
    FaShieldHalved,
    FaArrowLeft,
} from "react-icons/fa6";

import Alert from "../../components/ui/Alert.jsx";
import Button from "../../components/ui/Button.jsx";
import Input from "../../components/ui/Input.jsx";
import useAuth from "../../hooks/useAuth.js";
import { roleHomePath, LANDING_URL } from "../../utils/constants.js";

const INITIAL_FORM = { email: "", password: "" };

const FEATURES = [
    { icon: FaCarSide, title: "Fleet", text: "Your vehicle & profile" },
    { icon: FaRoute, title: "Rides", text: "Assigned ride control" },
    { icon: FaShieldHalved, title: "Secure", text: "Protected driver access" },
];

const validate = ({ email, password }) => {
    const errors = {};

    if (!email.trim()) {
        errors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
        errors.email = "Enter a valid email address";
    }

    if (!password) errors.password = "Password is required";

    return errors;
};

const Logo = ({ size = "md", invert = false }) => {
    const sizes = {
        sm: "size-11 rounded-xl",
        md: "size-14 rounded-2xl",
    };

    return (
        <div className={`flex shrink-0 items-center justify-center ${sizes[size]}`}>
            <img
                src="/smart-cab-logo.png"
                alt="Smart Cab Dispatch"
                className={`h-full w-full object-contain p-1.5 ${invert ? "brightness-0 invert" : ""}`}
            />
        </div>
    );
};

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [form, setForm] = useState(INITIAL_FORM);
    const [fieldErrors, setFieldErrors] = useState({});
    const [formError, setFormError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleChange = ({ target: { name, value } }) => {
        setForm((previous) => ({ ...previous, [name]: value }));
        setFieldErrors((previous) => ({ ...previous, [name]: undefined }));
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
            const redirectTo =
                location.state?.from?.pathname ?? roleHomePath(user.role);

            navigate(redirectTo, { replace: true });
        } catch (error) {
            setFormError(
                error?.message || "Unable to sign in. Please try again."
            );
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-dvh bg-slate-950 px-4 py-4 sm:px-6 sm:py-6 lg:p-6">
            <div className="mx-auto flex min-h-[calc(100dvh-2rem)] max-w-[1180px] overflow-hidden rounded-[28px] border border-white/10 bg-white shadow-[0_25px_80px_rgba(0,0,0,0.35)] sm:min-h-[calc(100dvh-3rem)] lg:min-h-[calc(100dvh-3rem)]">
                <section className="relative hidden overflow-hidden bg-slate-950 lg:flex lg:w-[50%]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(139,92,246,0.20),transparent_35%),radial-gradient(circle_at_15%_90%,rgba(124,58,237,0.16),transparent_35%)]" />

                    <div className="relative flex w-full flex-col px-10 py-9 xl:px-12 xl:py-10">
                        <div className="flex items-center justify-between gap-3">
                            <a href={LANDING_URL} className="flex items-center gap-3">
                                <Logo size="md" invert />
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
                            <p className="text-xs font-bold uppercase tracking-[0.22em] text-violet-400">
                                Driver Operations
                            </p>

                            <h1 className="mt-4 text-[42px] font-bold leading-[1.08] tracking-tight text-white xl:text-5xl">
                                Keep every ride moving.
                            </h1>

                            <p className="mt-5 max-w-[480px] text-[15px] leading-7 text-slate-400">
                                Manage assigned rides, update trip status and stay connected
                                with the Smart Cab dispatch team.
                            </p>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            {FEATURES.map(({ icon: Icon, title, text }) => (
                                <div
                                    key={title}
                                    className="rounded-xl border border-violet-400/10 bg-slate-900/80 px-4 py-3.5"
                                >
                                    <div className="flex size-9 items-center justify-center rounded-lg bg-violet-500/10">
                                        <Icon className="size-4 text-violet-400" />
                                    </div>

                                    <p className="mt-3 text-sm font-semibold text-white">
                                        {title}
                                    </p>

                                    <p className="mt-0.5 text-xs text-slate-500">{text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="flex flex-1 items-center justify-center bg-white px-5 py-8 sm:px-8 lg:px-10 xl:px-12">
                    <div className="w-full max-w-[460px]">
                        <div className="mb-7 flex items-center justify-between gap-3 lg:hidden">
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

                        <div className="mb-6">
                            <p className="text-sm font-semibold text-violet-600">
                                Driver Portal
                            </p>

                            <h2 className="mt-1.5 text-[30px] font-bold tracking-tight text-slate-950 sm:text-[32px]">
                                Welcome back
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                Sign in to manage your assigned rides.
                            </p>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            noValidate
                            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)] sm:p-6"
                        >
                            {formError && (
                                <div className="mb-4">
                                    <Alert>{formError}</Alert>
                                </div>
                            )}

                            <div className="space-y-4">
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    label="Email address"
                                    autoComplete="email"
                                    placeholder="driver@smartcab.com"
                                    value={form.email}
                                    onChange={handleChange}
                                    error={fieldErrors.email}
                                    disabled={submitting}
                                />

                                <Input
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

                                <Button
                                    type="submit"
                                    loading={submitting}
                                    className="mt-2 h-11 w-full rounded-xl !bg-violet-600 !text-white shadow-sm hover:!bg-violet-700"
                                >
                                    {submitting ? "Signing in…" : "Sign in to Driver Portal"}
                                </Button>
                            </div>
                        </form>

                        <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-400">
                            <FaShieldHalved className="size-3 text-violet-500" />
                            <span>Secure driver access</span>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Login;