import { useEffect, useState } from "react";
import api from "../../services/api.js";

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const response = await api.get("/ride-requests");
      setRequests(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const approveRide = async (id) => {
    try {
      await api.patch(`/ride-requests/${id}/approve`);
      fetchRequests();
      alert("Ride approved successfully.");
    } catch (err) {
      alert(err.message);
    }
  };

  useEffect(() => {
    fetchRequests();

    const interval = setInterval(fetchRequests, 5000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border shadow p-8">
        Loading ride requests...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border shadow">

      <div className="border-b p-5">
        <h1 className="text-2xl font-bold">
          Ride Requests
        </h1>
      </div>

      <table className="w-full">

        <thead className="bg-slate-100">

          <tr>

            <th className="text-left p-4">
              Guest
            </th>

            <th className="text-left p-4">
              Pickup
            </th>

            <th className="text-left p-4">
              Destination
            </th>

            <th className="text-left p-4">
              Status
            </th>

            <th className="text-left p-4">
              Action
            </th>

          </tr>

        </thead>

        <tbody>

          {requests.map((request) => (

            <tr
              key={request._id}
              className="border-t"
            >

              <td className="p-4">
                {request.guest?.user?.fullName}
              </td>

              <td className="p-4">
                {request.pickupLocation?.name}
              </td>

              <td className="p-4">
                {request.dropLocation?.name}
              </td>

              <td className="p-4">

                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    request.status === "PENDING"
                      ? "bg-yellow-100 text-yellow-700"
                      : request.status === "APPROVED"
                      ? "bg-green-100 text-green-700"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {request.status}
                </span>

              </td>

              <td className="p-4">

                {request.status === "PENDING" ? (

                  <button
                    onClick={() => approveRide(request._id)}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg"
                  >
                    Approve
                  </button>

                ) : (

                  <span className="text-green-600 font-semibold">
                    Approved
                  </span>

                )}

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
};

export default Requests;