import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Alert from "../../components/ui/Alert.jsx";
import Button from "../../components/ui/Button.jsx";
import Input from "../../components/ui/Input.jsx";
import useAuth from "../../hooks/useAuth.js";
import { roleHomePath } from "../../utils/constants.js";

const INITIAL_FORM = {
  email: "",
  password: "",
};

const validate = ({ email, password }) => {
  const errors = {};

  if (!email.trim()) {
    errors.email = "Email is required";
  } else if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
    errors.email = "Enter a valid email address";
  }

  if (!password) {
    errors.password = "Password is required";
  }

  return errors;
};

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({ ...previous, [name]: value }));

    // Clear the message for the field being corrected, plus any stale
    // server-side error, so feedback tracks what the user is doing.
    setFieldErrors((previous) => ({ ...previous, [name]: undefined }));
    setFormError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const errors = validate(form);

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);

      return;
    }

    setSubmitting(true);
    setFormError("");

    try {
      const user = await login(form.email.trim(), form.password);

      // Honour the URL the user was originally denied, else land on the
      // dashboard matching their role.
      const redirectTo =
        location.state?.from?.pathname ?? roleHomePath(user.role);

      navigate(redirectTo, { replace: true });
    } catch (error) {
      setFormError(error.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Smart Cab Dispatch
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Sign in to the admin portal
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <Alert>{formError}</Alert>

          <Input
            id="email"
            name="email"
            type="email"
            label="Email"
            autoComplete="email"
            placeholder="admin@smartcab.com"
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

          <Button type="submit" loading={submitting} className="mt-1 w-full">
            {submitting ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;
