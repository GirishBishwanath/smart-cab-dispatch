import { useEffect, useState } from "react";
import api from "../../services/api.js";

const STATUS = [
  "ARRIVED",
  "PICKED_UP",
  "COMPLETED",
];

const Rides = () => {
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

          </tr>

        </thead>

        <tbody>

          {rides.map((ride) => (

            <tr
              key={ride._id}
              className="border-t"
            >

              <td className="p-4">

                {ride.guests?.[0]?.user?.fullName}

              </td>

              <td className="p-4">

                {ride.driver?.user?.fullName}

              </td>

              <td className="p-4 font-semibold">

                {ride.status}

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
                  className="border rounded px-3 py-2"
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

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
};

export default Rides;