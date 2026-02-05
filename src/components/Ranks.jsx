"use client";
import useStore from "@/store/useStore";
import { parse } from "path";
import { useRef, useState } from "react";

export default function Ranks() {
    const {
        historyRank,
        ranks,
        addRank,
        updateRank,
        deleteRank,
        selectRank,
    } = useStore();

    const [updateForm, setUpdateForm] = useState(false);
    const [selectedRankId, setSelectedRankId] = useState(null);

    const startingDate = useRef("");
    const rank = useRef("");

    const newStartingDate = useRef("");
    const newRank = useRef("");

    const openUpdateForm = (rankId) => {
        setSelectedRankId(rankId);
        setUpdateForm(true);
        selectRank(rankId);
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        const selected = ranks.find((r) => r.rank_id == newRank.current.value);
        const year = new Date(newStartingDate.current.value).getFullYear();

        if (selected && year != parseInt(selected.fiscal_year)) {
            alert(
                `Fiscal year mismatch! Starting date year must match ${selected.fiscal_year}`
            );
            return;
        }

        updateRank({
            newStartingDate: newStartingDate.current.value,
            newRank: selected.rank_name,
        });

        setUpdateForm(false);
        setSelectedRankId(null);
    };

    const handleAdd = () => {
        const selected = ranks.find((r) => r.rank_id == rank.current.value);
        const year = new Date(startingDate.current.value).getFullYear();
        console.log(year)
        console.log(parseInt(selected.fiscal_year))
        if (selected && year != parseInt(selected.fiscal_year)) {
            alert(
                `Fiscal year mismatch! Starting date year must match ${selected.fiscal_year}`
            );
            return;
        }

        addRank({
            startingDate: startingDate.current.value,
            rank: selected.rank_name,
        });

        startingDate.current.value = "";
        rank.current.value = "";
    };

    return (
        <div className="w-full mx-auto p-6 bg-gray-100 rounded-lg shadow-md">
            <h1 className="ml-3 p-3 text-[#141F75] font-bold text-3xl">Ranks</h1>

            {historyRank?.length === 0 && (
                <div className="p-4 bg-white rounded-lg shadow-sm text-gray-600">
                    No ranks history available
                </div>
            )}

            {!updateForm && historyRank?.length > 0 && (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white rounded-lg overflow-hidden">
                        <thead className="bg-[#141F75] text-white">
                            <tr>
                                <th className="py-3 px-4 text-left">Date</th>
                                <th className="py-3 px-4 text-left">Rank</th>
                                <th className="py-3 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {historyRank.map((rankItem) => (
                                <tr key={rankItem.rank_id} className="hover:bg-gray-50">
                                    <td
                                        className="py-3 px-4 cursor-pointer"
                                        onClick={() => openUpdateForm(rankItem.rank_id)}
                                    >
                                        {new Date(rankItem.starting_date).toLocaleDateString("en-GB")}
                                    </td>
                                    <td
                                        className="py-3 px-4 font-semibold cursor-pointer"
                                        onClick={() => openUpdateForm(rankItem.rank_id)}
                                    >
                                        {rankItem.rank}
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        <button
                                            onClick={() => deleteRank(rankItem.rank_id)}
                                            className="px-3 cursor-pointer py-1 text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {updateForm && (
                <div className="mt-6">
                    <div className="flex items-center mb-4">
                        <button
                            className="bg-[#141F75] cursor-pointer text-white p-2 rounded-lg hover:bg-[#0e1757] transition-colors flex items-center"
                            onClick={() => {
                                setUpdateForm(false);
                                setSelectedRankId(null);
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                            </svg>
                            Back
                        </button>
                        <h1 className="ml-3 text-[#141F75] font-bold text-2xl">Update rank</h1>
                    </div>
                    <form onSubmit={handleUpdate} className="bg-white p-6 rounded-lg shadow-md">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-gray-700 mb-2">Updated starting date:</label>
                                <input
                                    ref={newStartingDate}
                                    type="date"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#141F75] focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-2">Updated rank:</label>
                                <select
                                    ref={newRank}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#141F75] focus:border-transparent cursor-pointer"
                                    required
                                >
                                    <option value="" disabled>Select rank</option>
                                    {ranks.map((r) => (
                                        <option key={r.rank_id} value={r.rank_id}>
                                            {r.rank_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="mt-6 px-6 py-2 cursor-pointer text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors w-full md:w-auto"
                        >
                            Confirm Update
                        </button>
                    </form>
                </div>
            )}

            {!updateForm && (
                <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
                    <h1 className="text-[#141F75] font-bold text-2xl mb-4">Add new rank</h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-gray-700 mb-2">Starting date:</label>
                            <input
                                ref={startingDate}
                                type="date"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#141F75] focus:border-transparent"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-2">Rank:</label>
                            <select
                                ref={rank}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#141F75] focus:border-transparent cursor-pointer"
                                required
                            >
                                <option value="" disabled>Select rank</option>
                                {ranks.map((r) => (
                                    <option key={r.rank_id} value={r.rank_id}>
                                        {r.rank_name}{" of year "}{r.fiscal_year}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <button
                        onClick={handleAdd}
                        className="mt-6 px-6 py-2 cursor-pointer text-white bg-[#141F75] rounded-lg hover:bg-[#141F75] transition-colors w-full md:w-auto"
                    >
                        Add Rank
                    </button>
                </div>
            )}
        </div>
    );
}
