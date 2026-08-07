import { useEffect, useState } from "react";

import driverService from "../../services/driver.service.js";
import Modal from "../../components/common/Modal.jsx";
import DriverForm from "../../components/drivers/DriverForm.jsx";


const STATUS_STYLES = {
    AVAILABLE:
        "bg-green-100 text-green-700",

    ASSIGNED:
        "bg-orange-100 text-orange-700",

    ON_BREAK:
        "bg-yellow-100 text-yellow-700",

    OFFLINE:
        "bg-slate-200 text-slate-700",
};

const Drivers = () => {
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openModal, setOpenModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editingDriver, setEditingDriver] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [statusLoading, setStatusLoading] = useState(null);

    const fetchDrivers = async () => {
        try {
            const drivers = await driverService.getDrivers();
            setDrivers(drivers);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const createDriver = async (driver) => {
        try {
            setSaving(true);

            await driverService.createDriver(driver);

            await fetchDrivers();

            setOpenModal(false);
        } catch (err) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };

    const updateDriver = async (driverData) => {
        try {
            setSaving(true);

            await driverService.updateDriver(
                editingDriver._id,
                driverData
            );

            setEditingDriver(null);

            setOpenModal(false);

            await fetchDrivers();

        } catch (err) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };

    const updateDriverStatus = async (
        id,
        status
    ) => {
        try {
            setStatusLoading(id);

            await driverService.updateDriverStatus(
                id,
                status
            );

            await fetchDrivers();

        } catch (err) {
            alert(err.message);

            await fetchDrivers();
        } finally {
            setStatusLoading(null);
        }
    };

    const deleteDriver = async (id) => {
        const confirmDelete = window.confirm(
            "Delete this driver?"
        );

        if (!confirmDelete) return;

        try {
            setDeleteLoading(true);

            await driverService.deleteDriver(id);

            await fetchDrivers();
        } catch (err) {
            alert(err.message);
        } finally {
            setDeleteLoading(false);
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
                    onClick={() => {
                        setEditingDriver(null);
                        setOpenModal(true);
                    }}
                    className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800"
                >
                    + Add Driver
                </button>
            </div>

            <table className="w-full">

                <thead className="bg-slate-100">

                    <tr>

                        <th className="text-left p-4">Driver</th>

                        <th className="text-left p-4">Vehicle</th>

                        <th className="text-left p-4">Phone</th>

                        <th className="text-left p-4">Status</th>

                        <th className="text-left p-4">Actions</th>

                    </tr>

                </thead>

                <tbody>

                    {drivers.map((driver) => (

                        <tr
                            key={driver._id}
                            className="border-t"
                        >

                            <td className="p-4">

                                <div className="font-semibold text-slate-900">
                                    {driver.user?.fullName}
                                </div>

                                <div className="text-sm text-slate-500 mt-1">
                                    {driver.user?.email}
                                </div>

                            </td>

                            <td className="p-4">

                                <div className="font-medium text-slate-900">
                                    {driver.vehicle?.vehicleNumber || "-"}
                                </div>

                                <div className="text-sm text-slate-500 mt-1">
                                    {driver.vehicle?.model || "-"}
                                </div>

                            </td>

                            <td className="p-4 font-medium">
                                {driver.user?.phone}
                            </td>

                            <td className="p-4">

                                <select
                                    value={driver.status}
                                    disabled={
                                        driver.status === "ASSIGNED" ||
                                        statusLoading === driver._id
                                    }
                                    onChange={(e) => updateDriverStatus(driver._id, e.target.value)}
                                    className={`rounded-full px-3 py-2 text-xs font-semibold border cursor-pointer transition 
                                        ${STATUS_STYLES[driver.status]}`}
                                >

                                    <option value="AVAILABLE">🟢 Available</option>

                                    <option value="ON_BREAK">🟡 On Break</option>

                                    <option value="OFFLINE">⚫ Offline</option>

                                    <option value="ASSIGNED" disabled>🟠 Assigned</option>

                                </select>

                                {driver.status === "ASSIGNED" && (
                                    <p className="mt-1 text-[11px] text-slate-500">
                                        Active Ride
                                    </p>
                                )}

                            </td>

                            <td className="p-4">

                                <div className="flex items-center gap-2">

                                    <button
                                        onClick={() => {
                                            setEditingDriver(driver);
                                            setOpenModal(true);
                                        }}
                                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                                    >
                                        Edit
                                    </button>

                                    <button
                                        onClick={() => deleteDriver(driver._id)}
                                        disabled={deleteLoading}
                                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
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
                    editingDriver
                        ? "Edit Driver"
                        : "Add Driver"
                }
                onClose={() => {
                    setEditingDriver(null);
                    setOpenModal(false);
                }}
            >
                <DriverForm
                    initialData={
                        editingDriver
                            ? {
                                _id: editingDriver._id,

                                fullName: editingDriver.user?.fullName,

                                email: editingDriver.user?.email,

                                phone: editingDriver.user?.phone,

                                vehicleNumber: editingDriver.vehicle?.vehicleNumber || "",

                                model: editingDriver.vehicle?.model || "",

                                seatCapacity: editingDriver.vehicle?.seatCapacity || 4,

                                luggageCapacity: editingDriver.vehicle?.luggageCapacity || 2,
                            }
                            : {}
                    }
                    loading={saving}
                    onSubmit={
                        editingDriver
                            ? updateDriver
                            : createDriver
                    }
                    onCancel={() => setOpenModal(false)}
                />
            </Modal>

        </div>
    );
};

export default Drivers;