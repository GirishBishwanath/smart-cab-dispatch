import { useState } from "react";
import { Outlet } from "react-router-dom";

import PortalHeader from "../components/layout/PortalHeader.jsx";
import DriverSidebar from "../components/layout/DriverSidebar.jsx";
import useSocket from "../hooks/useSocket.js";

const DriverLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  useSocket();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <DriverSidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <PortalHeader onMenuClick={() => setMobileOpen(true)} />

        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DriverLayout;