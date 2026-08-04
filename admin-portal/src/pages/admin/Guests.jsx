import { useEffect, useState } from "react";
import api from "../../services/api.js";

const Guests = () => {
    const [guests, setGuests] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchGuests = async () => {
        try {
            const response = await api.get("/guests");
            setGuests(response.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
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
                    disabled
                    title="Coming Soon"
                    className="bg-slate-400 text-white px-4 py-2 rounded-lg cursor-not-allowed"
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

                        </tr>

                    ))}

                </tbody>

            </table>

        </div>
    );
};

export default Guests;