import { JitsiMeeting } from '@jitsi/react-sdk';
import { useState } from 'react';
import ChatWindow from './ChatWindow';
import PrescriptionWindow from './PrescriptionWindow';

const MeetingRoom = ({ roomName, user, isDoctor }) => {
    const [prescriptions, setPrescriptions] = useState([]);
    
    const addPrescription = (newPrescription) => {
        setPrescriptions([...prescriptions, newPrescription]);
    };

    return (
        <div className="flex h-screen">
            {/* Video Call Section */}
            <div className="w-2/3 h-full">
                <JitsiMeeting
                    roomName={roomName}
                    configOverwrite={{ disableThirdPartyRequests: true }}
                    interfaceConfigOverwrite={{ filmStripOnly: false }}
                    userInfo={{ displayName: user.name }}
                />
            </div>

            {/* Right Panel */}
            <div className="w-1/3 h-full flex flex-col border-l border-gray-300 bg-white">
                {/* Prescription Window */}
                <div className="flex-1 border-b border-gray-300 p-4 overflow-auto">
                    <PrescriptionWindow 
                        prescriptions={prescriptions} 
                        addPrescription={isDoctor ? addPrescription : null} 
                    />
                </div>
                
                {/* Chat Window */}
                <div className="flex-1 p-4 overflow-auto">
                    <ChatWindow roomName={roomName} user={user} />
                </div>
            </div>
        </div>
    );
};

export default MeetingRoom;
