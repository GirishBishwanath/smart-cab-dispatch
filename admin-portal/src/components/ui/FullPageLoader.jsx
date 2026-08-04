import Spinner from "./Spinner.jsx";

/**
 * Shown while the persisted session is being revalidated, so protected routes
 * never flash the login screen for an already-authenticated user.
 */
const FullPageLoader = ({ message = "Loading…" }) => {
  return (
    <div className="flex h-full min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 text-slate-500">
      <Spinner size="lg" />
      <p className="text-sm">{message}</p>
    </div>
  );
};

export default FullPageLoader;
