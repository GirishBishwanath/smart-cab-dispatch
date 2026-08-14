import { useEffect, useState } from "react";
import { FaCar, FaPlus, FaUser, FaPhone, FaPen, FaTrash } from "react-icons/fa";

import driverService from "../services/driver.service.js";
import Modal from "../components/common/Modal.jsx";
import DriverForm from "../components/drivers/DriverForm.jsx";


const STATUS_STYLES = {
    AVAILABLE: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    ASSIGNED: "bg-orange-50 text-orange-700 ring-orange-200",
    ON_BREAK: "bg-amber-50 text-amber-700 ring-amber-200",
    OFFLINE: "bg-slate-100 text-slate-600 ring-slate-200",
};


const formatStatus = (status = "") =>
    status.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());


const StatusBadge = ({ status }) => (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${STATUS_STYLES[status] || "bg-slate-100 text-slate-600 ring-slate-200"}`}>
        <span className={`mr-1.5 mt-1 size-1.5 rounded-full ${status === "AVAILABLE" ? "bg-emerald-500" : status === "ASSIGNED" ? "bg-orange-500" : status === "ON_BREAK" ? "bg-amber-500" : "bg-slate-400"}`} />
        {formatStatus(status)}
    </span>
);


const PageHeader = ({ count, onAdd }) => (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-600">Fleet management</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Drivers</h1>
            <p className="mt-1.5 text-sm text-slate-500">Manage your driver fleet and live availability.</p>
        </div>

        <button onClick={onAdd} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800">
            <FaPlus className="size-3" />
            Add Driver
        </button>
    </div>
);


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
            const response = await driverService.getDrivers();
            setDrivers(response);
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
            await driverService.updateDriver(editingDriver._id, driverData);
            setEditingDriver(null);
            setOpenModal(false);
            await fetchDrivers();
        } catch (err) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };

    const updateDriverStatus = async (id, status) => {
        try {
            setStatusLoading(id);
            await driverService.updateDriverStatus(id, status);
            await fetchDrivers();
        } catch (err) {
            alert(err.message);
            await fetchDrivers();
        } finally {
            setStatusLoading(null);
        }
    };

    const deleteDriver = async (id) => {
        if (!window.confirm("Delete this driver?")) return;

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
        return <div className="h-48 animate-pulse rounded-2xl bg-slate-200" />;
    }

    const available = drivers.filter((d) => d.status === "AVAILABLE").length;
    const assigned = drivers.filter((d) => d.status === "ASSIGNED").length;
    const offline = drivers.filter((d) => d.status === "OFFLINE").length;

    return (
        <div className="space-y-6">
            <PageHeader
                count={drivers.length}
                onAdd={() => {
                    setEditingDriver(null);
                    setOpenModal(true);
                }}
            />

            <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold text-slate-500">Total drivers</p>
                    <p className="mt-1 text-2xl font-bold text-slate-950">{drivers.length}</p>
                </div>
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
                    <p className="text-xs font-semibold text-emerald-700">Available</p>
                    <p className="mt-1 text-2xl font-bold text-emerald-800">{available}</p>
                </div>
                <div className="rounded-2xl border border-orange-100 bg-orange-50/60 p-4">
                    <p className="text-xs font-semibold text-orange-700">Assigned</p>
                    <p className="mt-1 text-2xl font-bold text-orange-800">{assigned}</p>
                </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="hidden overflow-x-auto md:block">
                    <table className="w-full min-w-[850px]">
                        <thead className="border-b border-slate-100 bg-slate-50">
                            <tr>
                                {["Driver", "Vehicle", "Contact", "Status", "Actions"].map((title) => (
                                    <th key={title} className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">{title}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {drivers.map((driver) => (
                                <tr key={driver._id} className="transition hover:bg-slate-50/70">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                                                {driver.user?.fullName?.split(" ").map((x) => x[0]).join("").slice(0, 2).toUpperCase() || "DR"}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-semibold text-slate-900">{driver.user?.fullName || "—"}</p>
                                                <p className="mt-0.5 text-xs text-slate-500">{driver.user?.email || "—"}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <p className="text-sm font-semibold text-slate-800">{driver.vehicle?.vehicleNumber || "—"}</p>
                                        <p className="mt-0.5 text-xs text-slate-500">{driver.vehicle?.model || "Vehicle model unavailable"}</p>
                                    </td>
                                    <td className="px-5 py-4 text-sm font-medium text-slate-700">{driver.user?.phone || "—"}</td>
                                    <td className="px-5 py-4">
                                        <select
                                            value={driver.status}
                                            disabled={
                                                driver.status === "ASSIGNED" ||
                                                statusLoading === driver._id
                                            }
                                            onChange={(e) => updateDriverStatus(driver._id, e.target.value)}
                                            className={`rounded-xl border-0 px-3 py-2 text-xs font-bold ring-1 ring-inset transition ${STATUS_STYLES[driver.status]}`}
                                        >
                                            <option value="AVAILABLE">Available</option>
                                            <option value="ON_BREAK">On Break</option>
                                            <option value="OFFLINE">Offline</option>
                                            <option value="ASSIGNED" disabled>Assigned</option>
                                        </select>

                                        {driver.status === "ASSIGNED" && (
                                            <p className="mt-1 text-[11px] text-slate-400">
                                                Active ride
                                            </p>
                                        )}
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => { setEditingDriver(driver); setOpenModal(true); }} className="inline-flex size-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-950">
                                                <FaPen className="size-3" />
                                            </button>
                                            <button onClick={() => deleteDriver(driver._id)} disabled={deleteLoading} className="inline-flex size-9 items-center justify-center rounded-lg border border-red-100 text-red-500 hover:bg-red-50 disabled:opacity-50">
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
                    {drivers.map((driver) => (
                        <div key={driver._id} className="p-4">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                                        {driver.user?.fullName?.split(" ").map((x) => x[0]).join("").slice(0, 2).toUpperCase() || "DR"}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="truncate font-semibold text-slate-900">{driver.user?.fullName || "—"}</p>
                                        <p className="truncate text-xs text-slate-500">{driver.user?.email || "—"}</p>
                                    </div>
                                </div>
                                <StatusBadge status={driver.status} />
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Vehicle</p>
                                    <p className="mt-1 text-sm font-semibold text-slate-700">{driver.vehicle?.vehicleNumber || "—"}</p>
                                    <p className="text-xs text-slate-500">{driver.vehicle?.model || "—"}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Phone</p>
                                    <p className="mt-1 text-sm font-semibold text-slate-700">{driver.user?.phone || "—"}</p>
                                </div>
                            </div>

                            <div className="mt-3 flex items-center gap-2">
                                <select
                                    value={driver.status}
                                    disabled={driver.status === "ASSIGNED" || statusLoading === driver._id}
                                    onChange={(e) => updateDriverStatus(driver._id, e.target.value)}
                                    className={`min-w-0 flex-1 rounded-xl border-0 px-3 py-2.5 text-xs font-bold ring-1 ring-inset ${STATUS_STYLES[driver.status]}`}
                                >
                                    <option value="AVAILABLE">Available</option>
                                    <option value="ON_BREAK">On Break</option>
                                    <option value="OFFLINE">Offline</option>
                                    <option value="ASSIGNED" disabled>Assigned</option>
                                </select>
                                <button onClick={() => { setEditingDriver(driver); setOpenModal(true); }} className="flex size-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600">
                                    <FaPen className="size-3" />
                                </button>
                                <button onClick={() => deleteDriver(driver._id)} disabled={deleteLoading} className="flex size-10 items-center justify-center rounded-xl border border-red-100 text-red-500 disabled:opacity-50">
                                    <FaTrash className="size-3" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {drivers.length === 0 && <div className="p-12 text-center text-sm text-slate-400">No drivers found.</div>}
            </div>

            <Modal
                open={openModal}
                title={editingDriver ? "Edit Driver" : "Add Driver"}
                onClose={() => { setEditingDriver(null); setOpenModal(false); }}
            >
                <DriverForm
                    initialData={editingDriver ? {
                        _id: editingDriver._id,
                        fullName: editingDriver.user?.fullName,
                        email: editingDriver.user?.email,
                        phone: editingDriver.user?.phone,
                        vehicleNumber: editingDriver.vehicle?.vehicleNumber || "",
                        model: editingDriver.vehicle?.model || "",
                        seatCapacity: editingDriver.vehicle?.seatCapacity || 4,
                        luggageCapacity: editingDriver.vehicle?.luggageCapacity || 2,
                    } : {}}
                    loading={saving}
                    onSubmit={editingDriver ? updateDriver : createDriver}
                    onCancel={() => setOpenModal(false)}
                />
            </Modal>
        </div>
    );
};

export default Drivers;