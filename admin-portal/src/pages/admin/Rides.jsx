import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api.js";

const STATUS = [
  "ARRIVED",
  "PICKED_UP",
  "COMPLETED",
];

const Rides = () => {
  const navigate = useNavigate();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRides = async () => {
    try {
      const response = await api.get("/rides");
      setRides(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/rides/${id}/status`, {
        status,
      });

      fetchRides();
    } catch (err) {
      alert(err.message);
    }
  };

  useEffect(() => {
    fetchRides();

    const interval = setInterval(fetchRides, 5000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border shadow p-8">
        Loading rides...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border shadow">

      <div className="border-b p-5">
        <h1 className="text-2xl font-bold">
          Rides
        </h1>
      </div>

      <table className="w-full">

        <thead className="bg-slate-100">

          <tr>

            <th className="p-4 text-left">Guest</th>

            <th className="p-4 text-left">Driver</th>

            <th className="p-4 text-left">Status</th>

            <th className="p-4 text-left">Update</th>

            <th className="p-4 text-left">Details</th>

          </tr>

        </thead>

        <tbody>

          {rides.map((ride) => (

            <tr
              key={ride._id}
              className="border-t"
            >

              <td className="p-4">

                <div className="space-y-1">

                  {ride.guests?.map((guest) => (

                    <p
                      key={guest._id}
                      className="font-medium"
                    >
                      {guest.user?.fullName}
                    </p>

                  ))}

                  <p className="text-xs text-slate-500">
                    {ride.guests?.length} Guest
                    {ride.guests?.length > 1 ? "s" : ""}
                  </p>

                </div>

              </td>

              <td className="p-4">

                <div>

                  <p className="font-medium">
                    {ride.driver?.user?.fullName}
                  </p>

                  <p className="text-xs text-slate-500">
                    {ride.driver?.status}
                  </p>

                </div>

              </td>

              <td className="p-4">

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${ride.status === "COMPLETED"
                    ? "bg-green-100 text-green-700"
                    : ride.status === "PICKED_UP"
                      ? "bg-blue-100 text-blue-700"
                      : ride.status === "ARRIVED"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-slate-100 text-slate-700"
                    }`}
                >
                  {ride.status
                    .replaceAll("_", " ")
                    .toLowerCase()
                    .replace(/\b\w/g, c => c.toUpperCase())}
                </span>

              </td>

              <td className="p-4">

                <select
                  value={ride.status}
                  onChange={(e) =>
                    updateStatus(
                      ride._id,
                      e.target.value
                    )
                  }
                  disabled={ride.status === "COMPLETED"}
                  className="border rounded px-3 py-2 disabled:bg-slate-100 disabled:text-slate-500"
                >

                  {STATUS.map((status) => (

                    <option
                      key={status}
                      value={status}
                    >
                      {status}
                    </option>

                  ))}

                </select>

              </td>


              <td className="p-4">

                <button
                  onClick={() =>
                    navigate(`/admin/rides/${ride._id}`)
                  }
                  className="rounded-lg bg-slate-900 px-4 py-2 text-white hover:bg-slate-800"
                >
                  View Details
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
};

export default Rides;