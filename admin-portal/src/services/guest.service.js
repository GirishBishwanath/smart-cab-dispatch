import api from "./api.js";

const getGuests = async () => {
  const response = await api.get("/guests");
  return response.data;
};

const createGuest = async (guest) => {
  const response = await api.post("/guests", guest);
  return response.data;
};

const updateGuest = async (id, guest) => {
  const response = await api.patch(`/guests/${id}`, guest);
  return response.data;
};

const deleteGuest = async (id) => {
  const response = await api.delete(`/guests/${id}`);
  return response.data;
};

export default {
  getGuests,
  createGuest,
  updateGuest,
  deleteGuest,
};