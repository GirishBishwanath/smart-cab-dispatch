import { useEffect, useState } from "react";
import { FaUsers, FaPlus, FaPen, FaTrash, FaHotel, FaUserFriends } from "react-icons/fa";

import guestService from "../services/guest.service.js";
import Modal from "../components/common/Modal.jsx";
import GuestForm from "../components/guests/GuestForm.jsx";


const Guests = () => {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingGuest, setEditingGuest] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchGuests = async () => {
    try {
      const response = await guestService.getGuests();
      setGuests(response);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createGuest = async (guest) => {
    try {
      setSaving(true);
      await guestService.createGuest(guest);
      await fetchGuests();
      setOpenModal(false);
    } catch (err) {
      console.error(err);
      alert(JSON.stringify(err, null, 2));
    } finally {
      setSaving(false);
    }
  };

  const updateGuest = async (guest) => {
    try {
      setSaving(true);
      await guestService.updateGuest(editingGuest._id, guest);
      await fetchGuests();
      setEditingGuest(null);
      setOpenModal(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteGuest = async (id) => {
    if (!window.confirm("Delete this guest?")) return;

    try {
      setDeleteLoading(true);
      await guestService.deleteGuest(id);
      await fetchGuests();
    } finally {
      setDeleteLoading(false);
    }
  };

  useEffect(() => {
    fetchGuests();
    const interval = setInterval(fetchGuests, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="h-48 animate-pulse rounded-2xl bg-slate-200" />;

  const totalPeople = guests.reduce((sum, guest) => sum + (Number(guest.groupSize) || 0), 0);
  const totalLuggage = guests.reduce((sum, guest) => sum + (Number(guest.luggageCount) || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-600">Guest management</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Guests</h1>
          <p className="mt-1.5 text-sm text-slate-500">Manage guest profiles and travel requirements.</p>
        </div>
        <button onClick={() => { setEditingGuest(null); setOpenModal(true); }} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-bold text-white shadow-sm hover:bg-slate-800">
          <FaPlus className="size-3" />
          Add Guest
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Registered guests</p>
          <p className="mt-1 text-2xl font-bold text-slate-950">{guests.length}</p>
        </div>
        <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
          <p className="text-xs font-semibold text-blue-700">Total people</p>
          <p className="mt-1 text-2xl font-bold text-blue-800">{totalPeople}</p>
        </div>
        <div className="rounded-2xl border border-violet-100 bg-violet-50/60 p-4">
          <p className="text-xs font-semibold text-violet-700">Luggage items</p>
          <p className="mt-1 text-2xl font-bold text-violet-800">{totalLuggage}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="hidden md:block">
          <table className="w-full">
            <thead className="border-b border-slate-100 bg-slate-50">
              <tr>
                {["Guest", "Accommodation", "Group size", "Luggage", "Actions"].map((title) => (
                  <th key={title} className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">{title}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {guests.map((guest) => (
                <tr key={guest._id} className="transition hover:bg-slate-50/70">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                        <FaUsers className="size-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{guest.user?.fullName || "—"}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{guest.user?.email || "—"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <FaHotel className="size-3 text-slate-400" />
                      {guest.accommodation || "—"}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <FaUserFriends className="size-3 text-slate-400" />
                      {guest.groupSize || 0}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold text-slate-700">{guest.luggageCount || 0}</td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => { setEditingGuest(guest); setOpenModal(true); }} className="flex size-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">
                        <FaPen className="size-3" />
                      </button>
                      <button onClick={() => deleteGuest(guest._id)} disabled={deleteLoading} className="flex size-9 items-center justify-center rounded-lg border border-red-100 text-red-500 hover:bg-red-50 disabled:opacity-50">
                        <FaTrash className="size-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="divide-y divide-slate-100 md:hidden">
          {guests.map((guest) => (
            <div key={guest._id} className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <FaUsers className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900">{guest.user?.fullName || "—"}</p>
                    <p className="truncate text-xs text-slate-500">{guest.user?.email || "—"}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditingGuest(guest); setOpenModal(true); }} className="flex size-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600">
                    <FaPen className="size-3" />
                  </button>
                  <button onClick={() => deleteGuest(guest._id)} disabled={deleteLoading} className="flex size-9 items-center justify-center rounded-lg border border-red-100 text-red-500">
                    <FaTrash className="size-3" />
                  </button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-3">
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Stay</p>
                  <p className="mt-1 truncate text-xs font-semibold text-slate-700">{guest.accommodation || "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Group</p>
                  <p className="mt-1 text-xs font-semibold text-slate-700">{guest.groupSize || 0}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Luggage</p>
                  <p className="mt-1 text-xs font-semibold text-slate-700">{guest.luggageCount || 0}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {guests.length === 0 && <div className="p-12 text-center text-sm text-slate-400">No guests found.</div>}
      </div>

      <Modal
        open={openModal}
        title={editingGuest ? "Edit Guest" : "Add Guest"}
        onClose={() => { setEditingGuest(null); setOpenModal(false); }}
      >
        <GuestForm
          initialData={editingGuest ? {
            _id: editingGuest._id,
            fullName: editingGuest.user?.fullName,
            email: editingGuest.user?.email,
            phone: editingGuest.user?.phone,
            accommodation: editingGuest.accommodation,
            groupSize: editingGuest.groupSize,
            luggageCount: editingGuest.luggageCount,
          } : {}}
          loading={saving}
          onSubmit={editingGuest ? updateGuest : createGuest}
          onCancel={() => setOpenModal(false)}
        />
      </Modal>
    </div>
  );
};

export default Guests;