import api from "./api.js";

const getDashboardData = async () => {
  const [drivers, guests, rideRequests, rides] = await Promise.all([
    api.get("/drivers"),
    api.get("/guests"),
    api.get("/ride-requests"),
    api.get("/rides"),
  ]);

  return {
    drivers: drivers.data,
    guests: guests.data,
    rideRequests: rideRequests.data,
    rides: rides.data,
  };
};

export default {
  getDashboardData,
};