import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../context/UserContext";
import { HiOutlineUsers, HiOutlineClock, HiOutlineCheckCircle, HiOutlineCalendar } from "react-icons/hi";

export default function DoctorHome() {
    const [dashboardInfo, setDashboardInfo] = useState({});

    const { userInfo, getDashboardInfo } = useContext(UserContext);

    useEffect(() => {
        handleGetDashboardInfo();
    }, []);

    async function handleGetDashboardInfo() {
        const res = await getDashboardInfo();
        console.log(res);
        if (res) {
            setDashboardInfo(res);
        }
    }


    const appointments = [
        { time: "09:00 AM", patient: "John Doe", status: "Confirmed" },
        { time: "10:30 AM", patient: "Jane Smith", status: "Pending" },
        { time: "02:00 PM", patient: "Robert Johnson", status: "Confirmed" }
    ];

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* Welcome Section */}
            <div className="relative">
                <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
                    Welcome, <span className="text-blue-600 dark:text-blue-400">Dr. {userInfo?.firstName || "Doctor"}!</span>
                </h1>
                <div className="absolute -top-4 -left-6 w-20 h-20 bg-blue-50 rounded-full filter blur-xl opacity-70 dark:opacity-20"></div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Today's Appointments Card */}
                <div className="relative overflow-hidden bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 dark:border-gray-700">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 opacity-10 rounded-full transform translate-x-8 -translate-y-8"></div>
                    <div className="inline-flex items-center justify-center p-3 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white mb-4">
                        <HiOutlineCalendar className="w-6 h-6" />
                    </div>
                    <h3 className="text-gray-600 dark:text-gray-300 mb-2">{dashboardInfo.stats[0].title}</h3>
                    <p className="text-3xl font-bold text-gray-800 dark:text-white">{dashboardInfo.stats[0].value}</p>
                </div>

                {/* Pending Appointments Card */}
                <div className="relative overflow-hidden bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 dark:border-gray-700">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-yellow-500 to-yellow-600 opacity-10 rounded-full transform translate-x-8 -translate-y-8"></div>
                    <div className="inline-flex items-center justify-center p-3 rounded-lg bg-gradient-to-br from-yellow-500 to-yellow-600 text-white mb-4">
                        <HiOutlineClock className="w-6 h-6" />
                    </div>
                    <h3 className="text-gray-600 dark:text-gray-300 mb-2">{dashboardInfo.stats[1].title}</h3>
                    <p className="text-3xl font-bold text-gray-800 dark:text-white">{dashboardInfo.stats[1].value}</p>
                </div>

                {/* Total Patients Card */}
                <div className="relative overflow-hidden bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 dark:border-gray-700">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-400 to-green opacity-10 rounded-full transform translate-x-8 -translate-y-8"></div>
                    <div className="inline-flex items-center justify-center p-3 rounded-lg bg-gradient-to-br from-emerald-400 to-green text-white mb-4">
                        <HiOutlineUsers className="w-6 h-6" />
                    </div>
                    <h3 className="text-gray-600 dark:text-gray-300 mb-2">{dashboardInfo.stats[2].title}</h3>
                    <p className="text-3xl font-bold text-gray-800 dark:text-white">{dashboardInfo.stats[2].value}</p>
                </div>

                {/* Completed Appointments Card */}
                <div className="relative overflow-hidden bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 dark:border-gray-700">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500 to-purple-600 opacity-10 rounded-full transform translate-x-8 -translate-y-8"></div>
                    <div className="inline-flex items-center justify-center p-3 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white mb-4">
                        <HiOutlineCheckCircle className="w-6 h-6" />
                    </div>
                    <h3 className="text-gray-600 dark:text-gray-300 mb-2">{dashboardInfo.stats[3].title}</h3>
                    <p className="text-3xl font-bold text-gray-800 dark:text-white">{dashboardInfo.stats[3].value}</p>
                </div>
            </div>

            {/* Today's Appointments */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Today&apos;s Appointments</h2>
                <div className="space-y-2">
                    {appointments.map((apt, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                        >
                            <div className="flex items-center gap-6">
                                <div className="w-16 text-gray-600 dark:text-gray-300 font-medium">
                                    {apt.time}
                                </div>
                                <div className="font-semibold text-gray-800 dark:text-white">
                                    {apt.patient}
                                </div>
                            </div>
                            <div
                                className={`px-4 py-2 rounded-full text-sm font-medium ${apt.status === "Confirmed"
                                        ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100"
                                    }`}
                            >
                                {apt.status}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}