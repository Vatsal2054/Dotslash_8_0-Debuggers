import { Phone, Mail, MapPin } from 'lucide-react';
import Button from '../UI/Buttons';
import Container from '../UI/Container';
import AppointmentModal from '../Appointment/AppointmentModal';
import { useContext, useState } from 'react';
import { UserContext } from '../../context/UserContext';

const DoctorCards = ({ doctors }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState(null);

    const { bookAppointment } = useContext(UserContext);

    if (!doctors || doctors.length === 0) {
        return <div className="text-center text-gray-500">No doctors found</div>;
    }

    const handleBookAppointment = (id) => {
        setSelectedDoctor(id);
        setIsModalOpen(true);
    };

    const handleSubmit = async (data) => {
        console.log(data);
        
        const res = bookAppointment({
            ...data,
            doctorId: selectedDoctor
        })
        if (res) {
            setIsModalOpen(false);
        }
    };

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {doctors.map((doctor) => (
                    <Container key={doctor._id} classes="flex flex-col justify-between p-4 text-sm">
                        <div className="flex flex-col space-y-4">
                            <div className="flex items-center gap-4">
                                {doctor.avatar ? (
                                    <img
                                        src={doctor.avatar}
                                        alt={`${doctor.firstName} ${doctor.lastName}`}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xl font-semibold">
                                        {doctor.firstName[0]}{doctor.lastName[0]}
                                    </div>
                                )}
                                <div>
                                    <div className="text-[1.1rem] font-[700]">
                                        Dr. {doctor.firstName} {doctor.lastName}
                                    </div>
                                    <div className="text-gray-500 text-sm">{doctor.specialization}</div>
                                </div>
                            </div>

                            <div className="flex flex-col space-y-2">
                                <div className="flex items-center gap-3">
                                    <Mail className="w-5 h-5 text-gray-400" />
                                    <span>{doctor.email}</span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Phone className="w-5 h-5 text-gray-400" />
                                    <span>{doctor.phone}</span>
                                </div>

                                <div className="flex items-start gap-3">
                                    <MapPin className="w-5 h-5 text-gray-400" />
                                    <span>
                                        {doctor.address.street}, {doctor.address.city},
                                        {' '}{doctor.address.state} {doctor.address.zip}
                                    </span>
                                </div>

                                <div className="space-y-1 pt-1">
                                    <p>
                                        <span className="font-medium">Experience:</span> {doctor.experience} years
                                    </p>
                                    <p>
                                        <span className="font-medium">Working at:</span> {doctor.workingPlace}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4">
                            <Button
                                type="PRIMARY"
                                disabled={!doctor.isAvailable}
                                classes="w-full"
                                onClick={() => handleBookAppointment(doctor._id)}
                            >
                                {doctor.isAvailable ? 'Book Appointment' : 'Not Available'}
                            </Button>
                        </div>
                    </Container>
                ))}
            </div>


            <AppointmentModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedDoctor(null);
                }}
                onSubmit={handleSubmit}
            />
        </>
    );
};

export default DoctorCards;