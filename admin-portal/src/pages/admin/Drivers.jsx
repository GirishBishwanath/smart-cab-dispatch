import { useEffect, useState } from "react";
import api from "../../services/api.js";

const Drivers = () => {
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDrivers = async () => {
        try {
            const response = await api.get("/drivers");
            setDrivers(response.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDrivers();

        const interval = setInterval(fetchDrivers, 5000);

        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="bg-white rounded-xl border shadow p-8">
                Loading drivers...
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border shadow">

            <div className="border-b p-5 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Drivers</h1>

                <button
                    disabled
                    title="Coming Soon"
                    className="bg-slate-400 text-white px-4 py-2 rounded-lg cursor-not-allowed"
                >
                    + Add Driver
                </button>
            </div>

            <table className="w-full">

                <thead className="bg-slate-100">

                    <tr>

                        <th className="text-left p-4">Driver</th>

                        <th className="text-left p-4">Email</th>

                        <th className="text-left p-4">Phone</th>

                        <th className="text-left p-4">Status</th>

                    </tr>

                </thead>

                <tbody>

                    {drivers.map((driver) => (

                        <tr
                            key={driver._id}
                            className="border-t"
                        >

                            <td className="p-4">
                                {driver.user?.fullName}
                            </td>

                            <td className="p-4">
                                {driver.user?.email}
                            </td>

                            <td className="p-4">
                                {driver.user?.phone}
                            </td>

                            <td className="p-4">

                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-semibold ${driver.status === "AVAILABLE"
                                        ? "bg-green-100 text-green-700"
                                        : driver.status === "ASSIGNED"
                                            ? "bg-orange-100 text-orange-700"
                                            : "bg-slate-100 text-slate-700"
                                        }`}
                                >
                                    {driver.status}
                                </span>

                            </td>

                        </tr>

                    ))}

                </tbody>

            </table>

        </div>
    );
};

export default Drivers;