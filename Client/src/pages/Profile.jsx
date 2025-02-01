import { Mail, Phone, MapPin, User } from "lucide-react";
import { useContext } from "react";
import { UserContext } from "../context/UserContext";

const Profile = ({ user }) => {
    const { userInfo } = useContext(UserContext);

    if (!userInfo) return <div className="text-center text-gray-500">No user data available.</div>;

    const { firstName, lastName, email, phone, role, avatar, gender, address } = userInfo;

    return (
        <div className="mx-auto p-6 bg-white dark:bg-gray-900">
            {/* Profile Header */}
            <div className="flex items-center gap-6">
                {/* Avatar */}
                {avatar ? (
                    <img src={avatar} alt={`${firstName} ${lastName}`} className="w-20 h-20 rounded-full object-cover" />
                ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-3xl font-bold">
                        {firstName[0]}{lastName[0]}
                    </div>
                )}

                {/* Name & Role */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                        {firstName} {lastName}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 capitalize">{role === "doctor" ? "Doctor" : "Patient"}</p>
                </div>
            </div>

            {/* User Details */}
            <div className="mt-6 space-y-4">
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                    <Mail className="w-5 h-5" />
                    <span>{email}</span>
                </div>

                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                    <Phone className="w-5 h-5" />
                    <span>{phone}</span>
                </div>

                <div className="flex items-start gap-3 text-gray-600 dark:text-gray-300">
                    <MapPin className="w-5 h-5" />
                    <span>
                        {address.street}, {address.city}, {address.state} {address.zip}
                    </span>
                </div>

                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                    <User className="w-5 h-5" />
                    <span>{gender}</span>
                </div>

                {/* Additional Details for Doctors */}
                {role === "doctor" && (
                    <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <p className="text-gray-700 dark:text-gray-300">
                            <span className="font-medium">Specialization:</span> {userInfo.specialization || "N/A"}
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                            <span className="font-medium">Experience:</span> {userInfo.experience || "N/A"} years
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                            <span className="font-medium">Working at:</span> {userInfo.workingPlace || "N/A"}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
