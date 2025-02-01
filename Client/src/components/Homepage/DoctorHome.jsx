import { useContext } from "react";
import { UserContext } from "../../context/UserContext";
import { HiOutlineUsers, HiOutlineClock, HiOutlineCheckCircle, HiOutlineCalendar } from "react-icons/hi";

export default function DoctorHome() {
    const { userInfo } = useContext(UserContext);

    const stats = [
        {
            title: "Today's Appointments",
            value: "8",
            color: "from-blue-500 to-blue-600",
            icon: <HiOutlineCalendar className="w-6 h-6" />
        },
        {
            title: "Pending Appointments",
            value: "12",
            color: "from-yellow-500 to-yellow-600",
            icon: <HiOutlineClock className="w-6 h-6" />
        },
        {
            title: "Total Patients",
            value: "145",
            color: "from-emerald-400 to-green",
            icon: <HiOutlineUsers className="w-6 h-6" />
        },
        {
            title: "Completed Appointments",
            value: "1,234",
            color: "from-purple-500 to-purple-600",
            icon: <HiOutlineCheckCircle className="w-6 h-6" />
        }
    ];

    const appointments = [
        { time: "09:00 AM", patient: "John Doe", status: "Confirmed" },
        { time: "10:30 AM", patient: "Jane Smith", status: "Pending" },
        { time: "02:00 PM", patient: "Robert Johnson", status: "Confirmed" }
    ];

    return (
        <div className="p-8 space-y-10 max-w-7xl mx-auto">
            {/* Welcome Section */}
            <div className="relative">
                <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
                    Welcome, <span className="text-blue-600 dark:text-blue-400">Dr. {userInfo?.firstName || "Doctor"}!</span>
                </h1>
                <div className="absolute -top-4 -left-6 w-20 h-20 bg-blue-50 rounded-full filter blur-xl opacity-70 dark:opacity-20"></div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div
                        key={stat.title}
                        className="relative overflow-hidden bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 dark:border-gray-700"
                    >
                        <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-10 rounded-full transform translate-x-8 -translate-y-8`}></div>
                        <div className={`inline-flex items-center justify-center p-3 rounded-lg bg-gradient-to-br ${stat.color} text-white mb-4`}>
                            {stat.icon}
                        </div>
                        <h3 className="text-gray-600 dark:text-gray-300 mb-2">{stat.title}</h3>
                        <p className="text-3xl font-bold text-gray-800 dark:text-white">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Today's Appointments */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Today&apos;s Appointments</h2>
                <div className="space-y-4">
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
                                className={`px-4 py-2 rounded-full text-sm font-medium ${
                                    apt.status === "Confirmed"
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