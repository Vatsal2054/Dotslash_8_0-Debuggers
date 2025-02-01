import { useContext, useEffect, useState } from "react";
import { Calendar, Clock, MapPin, Video, User } from "lucide-react";
import Button from "../components/UI/Buttons";
import { UserContext } from "../context/UserContext";
import { formatDate, getAge } from "../helpers/Data/formatDate";
import { PiMapPin } from "react-icons/pi";
import { useNavigate } from "react-router";
import Container from "../components/UI/Container";

const getStatusColor = (status) => {
    switch (status) {
        case "pending":
            return "text-yellow-500";
        case "approved":
            return "text-green-500";
        case "completed":
            return "text-blue-500";
        case "cancelled":
            return "text-red-500";
        default:
            return "text-gray-500";
    }
};

const AppointmentsPage = () => {
    const [appointments, setAppointments] = useState([]);

    const { role, getAppointments, acceptRequest, declineRequest, joinAppointment } = useContext(UserContext);

    const navigate = useNavigate();

    useEffect(() => {
        handleGetAppointments();
    }, []);

    async function handleGetAppointments() {
        const res = await getAppointments();
        console.log(res);
        if (res) {
            setAppointments(res);
        }
    } 

    const handleUpdateTime = (appointmentId) => {
        alert(`Update time for appointment ${appointmentId}`);
    };

    const handleCancel = (appointmentId) => {
        alert(`Cancel appointment ${appointmentId}`);
    };

    async function handleAcceptRequest(appointmentId) {
        const res = await acceptRequest(appointmentId);
        if (res) {
            handleGetAppointments();
        }
    }

    async function handleDeclineRequest(appointmentId) {
        const res = await declineRequest(appointmentId);
        if (res) {
            handleGetAppointments();
        }
    }

    // async function handleJoinRoom(appointmentId) {
    //     const res = await joinAppointment(appointmentId);
    //     if (res != "") {
    //         navigate(`/meeting/${res}`);
    //     }
    // }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">
                {role === "doctor" ? "Patient Appointments" : "My Appointments"}
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {appointments.map((appointment) => (
                    <Container
                        key={appointment._id}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
                    >
                        <div className="p-4">
                            <div className="flex justify-between items-center mb-2">
                                <h2 className="text-lg font-semibold">
                                    {role === "doctor"
                                        ? appointment.user.firstName + " " + appointment.user.lastName
                                        : appointment.doctor.firstName + " " + appointment.doctor.lastName}
                                </h2>
                                <span
                                    className={`text-sm capitalize ${getStatusColor(
                                        appointment.status
                                    )}`}
                                >
                                    {appointment.status}
                                </span>
                            </div>

                            {role === "doctor" ? (
                                // Doctor view - show patient details
                                <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                                    <div className="flex items-center gap-2 mb-1">
                                        <User className="w-4 h-4" />
                                        <span>{getAge(appointment.user.dob)} years old</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <PiMapPin className="!w-4 !h-4 mt-1" />
                                        <span>
                                        {appointment.user.address.street}, {appointment.user.address.city}, {appointment.user.address.state }, {appointment.user.address.zip}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                // Patient view - show doctor details
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                    {appointment.doctor.specialization} •{" "}
                                    {appointment.doctor.experience} years exp.
                                </p>
                            )}

                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                    <Calendar className="w-4 h-4" />
                                    <span>{formatDate(appointment.date)}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                    <Clock className="w-4 h-4" />
                                    <span>{appointment.time}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                    {appointment.type === "online" ? (
                                        <Video className="w-4 h-4" />
                                    ) : (
                                        <MapPin className="w-4 h-4" />
                                    )}
                                    <span className="capitalize">
                                        {appointment.type} Consultation
                                    </span>
                                </div>
                            </div>
                        </div>

                        {(appointment.status === "pending" && role === "patient") && (
                            <div className="p-4 bg-gray-50 dark:bg-gray-700 flex gap-2">
                                <Button
                                    type="PRIMARY"
                                    extraClasses="flex-1"
                                    onClick={() => handleUpdateTime(appointment.id)}
                                >
                                    Update Time
                                </Button>
                                <Button
                                    type="DANGER"
                                    extraClasses="flex-1"
                                    onClick={() => handleCancel(appointment.id)}
                                >
                                    Cancel
                                </Button>
                            </div>
                        )}

                        {(appointment.status === "approved" && role === "patient") && (
                            <div className="p-4 bg-gray-50 dark:bg-gray-700 flex gap-2">
                                <Button type="PRIMARY" extraClasses="flex-1" onClick={() => handleCancel(appointment.id)}>
                                    Join Room
                                </Button>
                            </div>
                        )}

                        {(appointment.status === "pending" && role === "doctor") && (
                            <div className="p-4 bg-gray-50 dark:bg-gray-700 flex gap-2">
                                <Button
                                    type="PRIMARY"
                                    extraClasses="flex-1"
                                    onClick={() => handleAcceptRequest(appointment._id)}
                                >
                                    Accept
                                </Button>
                                <Button
                                    type="DANGER"
                                    extraClasses="flex-1"
                                    onClick={() => handleDeclineRequest(appointment._id)}
                                >
                                    Decline
                                </Button>
                            </div>
                        )}
                    </Container>
                ))}
            </div>
        </div>
    );
};

export default AppointmentsPage;