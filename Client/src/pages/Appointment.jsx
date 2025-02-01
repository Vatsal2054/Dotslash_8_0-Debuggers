import { useContext } from "react";
import { Calendar, Clock, MapPin, Video, User } from "lucide-react";
import Button from "../components/UI/Buttons";
import { UserContext } from "../context/UserContext";

// Extended dummy data with patient information
const dummyAppointments = [
  {
    id: "1",
    type: "online",
    date: new Date("2025-02-15"),
    time: "10:00 AM",
    status: "pending",
    doctor: {
      name: "Dr. Sarah Wilson",
      degree: "MD",
      specialization: "Cardiologist",
      experience: 8,
      workingPlace: "Heart Care Center",
    },
    patient: {
      name: "John Smith",
      age: 35,
      address: "123 Park Avenue, New York, NY",
      phone: "+1 234-567-8900",
    },
  },
  {
    id: "2",
    type: "inperson",
    date: new Date("2025-02-16"),
    time: "2:30 PM",
    status: "approved",
    doctor: {
      name: "Dr. Michael Chen",
      degree: "MBBS",
      specialization: "Dermatologist",
      experience: 12,
      workingPlace: "Skin & Care Clinic",
    },
    patient: {
      name: "Emma Johnson",
      age: 28,
      address: "456 Oak Street, Brooklyn, NY",
      phone: "+1 234-567-8901",
    },
  },
  {
    id: "3",
    type: "online",
    date: new Date("2025-02-17"),
    time: "11:15 AM",
    status: "pending",
    doctor: {
      name: "Dr. Emily Brown",
      degree: "MD",
      specialization: "Neurologist",
      experience: 10,
      workingPlace: "Brain & Spine Institute",
    },
    patient: {
      name: "Michael Davis",
      age: 42,
      address: "789 Maple Road, Queens, NY",
      phone: "+1 234-567-8902",
    },
  },
];

const AppointmentsPage = () => {
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

  const { role } = useContext(UserContext);

  const handleUpdateTime = (appointmentId) => {
    alert(`Update time for appointment ${appointmentId}`);
  };

  const handleCancel = (appointmentId) => {
    alert(`Cancel appointment ${appointmentId}`);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        {role === "doctor" ? "Patient Appointments" : "My Appointments"}
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dummyAppointments.map((appointment) => (
          <div
            key={appointment.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
          >
            <div className="p-4">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold">
                  {role === "doctor"
                    ? appointment.patient.name
                    : appointment.doctor.name}
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
                    <span>{appointment.patient.age} years old</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-1" />
                    <span>{appointment.patient.address}</span>
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
                  <span>{appointment.date.toLocaleDateString()}</span>
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

            {appointment.status === "pending" && (
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
          </div>
        ))}
      </div>
    </div>
  );
};

export default AppointmentsPage;
