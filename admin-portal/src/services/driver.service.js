import api from "./api.js";

const getDrivers = async () => {
  const response = await api.get("/drivers");
  return response.data;
};

const createDriver = async (driver) => {
  const response = await api.post("/drivers", driver);
  return response.data;
};

const updateDriver = async (id, driver) => {
  const response = await api.patch(`/drivers/${id}`, driver);
  return response.data;
};

const updateDriverStatus = async (id, status) => {
  const response = await api.patch(
    `/drivers/${id}/status`,
    { status }
  );

  return response.data;
};

const deleteDriver = async (id) => {
  const response = await api.delete(`/drivers/${id}`);
  return response.data;
};

export default {
  getDrivers,
  createDriver,
  updateDriver,
  updateDriverStatus,
  deleteDriver,
};