import { useState } from "react";
import { Outlet } from "react-router-dom";

import GuestSidebar from "../components/layout/GuestSidebar.jsx";
import PortalHeader from "../components/layout/PortalHeader.jsx";

const GuestLayout = () => {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50">
            <GuestSidebar
                mobileOpen={mobileOpen}
                onClose={() => setMobileOpen(false)}
            />

            <div className="flex min-w-0 flex-1 flex-col">
                <PortalHeader
                    onMenuClick={() => setMobileOpen(true)}
                />

                <main className="min-h-0 flex-1 overflow-y-auto">
                    <div className="mx-auto w-full max-w-[1500px] p-4 sm:p-6 lg:p-8">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default GuestLayout;