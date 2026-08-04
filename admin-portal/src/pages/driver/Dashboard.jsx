import useAuth from "../../hooks/useAuth.js";

/**
 * Placeholder landing page — it exists so the post-login redirect has a target.
 * The real driver dashboard is a separate, not-yet-started feature.
 */
const Dashboard = () => {
  const { user } = useAuth();

  return (
    <section>
      <h1 className="text-xl font-semibold text-slate-900">
        Welcome, {user.fullName}
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Signed in as {user.role}. The driver dashboard is not built yet.
      </p>
    </section>
  );
};

export default Dashboard;
