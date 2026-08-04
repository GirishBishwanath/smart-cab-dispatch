import Button from "../ui/Button.jsx";
import useAuth from "../../hooks/useAuth.js";

/**
 * Shared chrome for every authenticated layout: identity on the left,
 * sign-out on the right. Navigation links belong to the individual layouts
 * and are added as their sections are built.
 */
const PortalHeader = ({ title }) => {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3.5">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-slate-900">
            Smart Cab Dispatch
          </span>
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
            {title}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-slate-900">
              {user?.fullName}
            </p>
            <p className="text-xs text-slate-500">{user?.email}</p>
          </div>

          <Button variant="secondary" onClick={logout}>
            Sign out
          </Button>
        </div>
      </div>
    </header>
  );
};

export default PortalHeader;
