import { useEffect, useState } from "react";

import guestService from "../../services/guest.service.js";
import Modal from "../../components/common/Modal.jsx";
import GuestForm from "../../components/guests/GuestForm.jsx";

const Guests = () => {
    const [guests, setGuests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openModal, setOpenModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editingGuest, setEditingGuest] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const fetchGuests = async () => {
        try {
            const guests = await guestService.getGuests();
            setGuests(guests);
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

            await guestService.updateGuest(
                editingGuest._id,
                guest
            );

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

        if (!window.confirm("Delete this guest?")) {
            return;
        }

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

    if (loading) {
        return (
            <div className="bg-white rounded-xl border shadow p-8">
                Loading guests...
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border shadow">

            <div className="border-b p-5 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Guests</h1>

                <button
                    onClick={() => {
                        setEditingGuest(null);
                        setOpenModal(true);
                    }}
                    className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800"
                >
                    + Add Guest
                </button>
            </div>

            <table className="w-full">

                <thead className="bg-slate-100">

                    <tr>

                        <th className="text-left p-4">Guest</th>

                        <th className="text-left p-4">Accommodation</th>

                        <th className="text-left p-4">Group Size</th>

                        <th className="text-left p-4">Luggage</th>

                        <th className="text-left p-4">Actions</th>

                    </tr>

                </thead>

                <tbody>

                    {guests.map((guest) => (

                        <tr
                            key={guest._id}
                            className="border-t"
                        >

                            <td className="p-4">
                                {guest.user?.fullName}
                            </td>

                            <td className="p-4">
                                {guest.accommodation}
                            </td>

                            <td className="p-4">
                                {guest.groupSize}
                            </td>

                            <td className="p-4">
                                {guest.luggageCount}
                            </td>

                            <td className="p-4">
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            setEditingGuest(guest);
                                            setOpenModal(true);
                                        }}
                                        className="rounded bg-blue-600 px-3 py-1 text-sm text-white"
                                    >
                                        Edit
                                    </button>

                                    <button
                                        onClick={() => deleteGuest(guest._id)}
                                        disabled={deleteLoading}
                                        className="rounded bg-red-600 px-3 py-1 text-sm text-white"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </td>

                        </tr>

                    ))}

                </tbody>

            </table>

            <Modal
                open={openModal}
                title={
                    editingGuest
                        ? "Edit Guest"
                        : "Add Guest"
                }
                onClose={() => {
                    setEditingGuest(null);
                    setOpenModal(false);
                }}
            >

                <GuestForm
                    initialData={
                        editingGuest ? {
                            _id: editingGuest._id,
                            fullName: editingGuest.user?.fullName,
                            email: editingGuest.user?.email,
                            phone: editingGuest.user?.phone,
                            accommodation: editingGuest.accommodation,
                            groupSize: editingGuest.groupSize,
                            luggageCount: editingGuest.luggageCount,
                        } : {}
                    }

                    loading={saving}

                    onSubmit={
                        editingGuest ? updateGuest : createGuest
                    }

                    onCancel={() => setOpenModal(false)}
                />

            </Modal>

        </div>
    );
};

export default Guests;