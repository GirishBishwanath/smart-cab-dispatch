import { Outlet } from "react-router-dom";

import PortalHeader from "../components/layout/PortalHeader.jsx";

const DriverLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <PortalHeader title="Driver" />

      <main className="mx-auto max-w-6xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default DriverLayout;
