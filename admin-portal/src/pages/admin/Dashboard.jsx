import { useEffect, useState } from "react";
import {
  FaCar,
  FaUsers,
  FaClipboardList,
  FaRoute,
} from "react-icons/fa";

import dashboardService from "../../services/dashboard.service.js";
import useAuth from "../../hooks/useAuth.js";

const Dashboard = () => {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);

  const [data, setData] = useState({
    drivers: [],
    guests: [],
    rideRequests: [],
    rides: [],
  });

  const fetchDashboard = async () => {
    try {
      const response = await dashboardService.getDashboardData();

      setData(response);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();

    const interval = setInterval(fetchDashboard, 5000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="text-center py-20 text-slate-500">
        Loading Dashboard...
      </div>
    );
  }

  const availableDrivers = data.drivers.filter(
    (driver) => driver.status === "AVAILABLE"
  ).length;

  const assignedDrivers = data.drivers.filter(
    (driver) => driver.status === "ASSIGNED"
  ).length;

  const pendingRequests = data.rideRequests.filter(
    (ride) => ride.status === "PENDING"
  ).length;

  const totalRequests = data.rideRequests.length;

  const activeRides = data.rides.filter(
    (ride) =>
      ride.status !== "COMPLETED" &&
      ride.status !== "CANCELLED"
  ).length;

  const completedRides = data.rides.filter(
    (ride) => ride.status === "COMPLETED"
  ).length;

  return (
    <div className="space-y-8">

      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Welcome, {user.fullName}
        </h1>

        <p className="text-slate-500 mt-1">
          Smart Cab Dispatch Admin Dashboard
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

        <Card
          icon={<FaCar />}
          title="Drivers"
          value={data.drivers.length}
          subtitle={`${availableDrivers} Available`}
        />

        <Card
          icon={<FaUsers />}
          title="Guests"
          value={data.guests.length}
          subtitle="Registered Guests"
        />

        <Card
          icon={<FaClipboardList />}
          title="Total Ride Requests"
          value={totalRequests}
          subtitle="Requests Received"
        />

        <Card
          icon={<FaRoute />}
          title="Active Rides"
          value={activeRides}
          subtitle={`${completedRides} Completed`}
        />

      </div>

      <div className="grid xl:grid-cols-2 gap-8">

        <section className="bg-white rounded-xl shadow border">

          <div className="border-b p-4">
            <h2 className="font-semibold">
              Recent Ride Requests
            </h2>
          </div>

          <div className="divide-y">

            {data.rideRequests.slice(0, 5).map((ride) => (
              <div
                key={ride._id}
                className="p-4 flex justify-between items-center"
              >

                <div>

                  <p className="font-medium">
                    {ride.guest?.user?.fullName}
                  </p>

                  <p className="text-sm text-slate-500">
                    {ride.pickupLocation?.name}
                  </p>

                </div>

                <span className="text-sm font-semibold">
                  {ride.status}
                </span>

              </div>
            ))}

          </div>

        </section>

        <section className="bg-white rounded-xl shadow border">

          <div className="border-b p-4">
            <h2 className="font-semibold">
              Driver Status
            </h2>
          </div>

          <div className="divide-y">

            {data.drivers.map((driver) => (
              <div
                key={driver._id}
                className="p-4 flex justify-between"
              >

                <div>

                  <p className="font-medium">
                    {driver.user?.fullName}
                  </p>

                  <p className="text-sm text-slate-500">
                    {driver.user?.phone}
                  </p>

                </div>

                <span className={`text-sm font-semibold ${driver.status === "AVAILABLE"
                    ? "text-green-600"
                    : "text-orange-500"
                  }`}>
                  {driver.status}
                </span>

              </div>
            ))}

          </div>

        </section>

      </div>

      <section className="bg-white rounded-xl shadow border">

        <div className="border-b p-4">
          <h2 className="font-semibold">
            Recent Rides
          </h2>
        </div>

        <table className="w-full">

          <thead>

            <tr className="text-left bg-slate-50">

              <th className="p-4">Driver</th>
              <th className="p-4">Guest</th>
              <th className="p-4">Status</th>

            </tr>

          </thead>

          <tbody>

            {data.rides.slice(0, 5).map((ride) => (
              <tr
                key={ride._id}
                className="border-t"
              >

                <td className="p-4">
                  {ride.driver?.user?.fullName}
                </td>

                <td className="p-4">
                  {ride.guests?.[0]?.user?.fullName}
                </td>

                <td className="p-4 font-semibold">
                  {ride.status}
                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </section>

    </div>
  );
};

const Card = ({ icon, title, value, subtitle }) => (
  <div className="bg-white rounded-xl shadow border p-6">

    <div className="flex justify-between">

      <div>

        <p className="text-slate-500 text-sm">
          {title}
        </p>

        <h2 className="text-3xl font-bold mt-2">
          {value}
        </h2>

        <p className="text-sm mt-2 text-slate-400">
          {subtitle}
        </p>

      </div>

      <div className="text-3xl text-slate-500">
        {icon}
      </div>

    </div>

  </div>
);

export default Dashboard;