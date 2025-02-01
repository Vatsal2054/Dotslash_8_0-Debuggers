import { JitsiMeeting } from '@jitsi/react-sdk';
import { UserContext } from '../context/UserContext';
import { useContext } from 'react';
import { useLocation } from 'react-router';
// import { useState } from 'react';
// import ChatWindow from './ChatWindow';
// import PrescriptionWindow from './PrescriptionWindow';

const MeetingRoom = ({ roomName, isDoctor }) => {
    const location = useLocation();
    const roomId = location.state;

    const { userInfo } = useContext(UserContext);

    return (
        <div className="flex h-screen">
            {/* Video Call Section */}
            <div className="w-2/3 h-[100vh]">
                <JitsiMeeting
                    roomName={roomId}
                    configOverwrite={{
                        disableSimulcast: false,
                        startWithAudioMuted: true,
                        startWithVideoMuted: true,
                    }}
                    interfaceConfigOverwrite={{
                        SHOW_JITSI_WATERMARK: false,
                        SHOW_BRAND_WATERMARK: false,
                        SHOW_WATERMARK_FOR_GUESTS: false,
                    }}
                    userInfo={{ displayName: userInfo.firstName }}
                    getIFrameRef={(iframeRef) => {
                        iframeRef.style.height = '100%';
                    }}
                />
            </div>

            {/* Right Panel */}
            <div className="w-1/3 h-full flex flex-col border-l border-gray-300 bg-white">
                {/* Prescription Window */}
                <div className="flex-1 border-b border-gray-300 p-4 overflow-auto">
                    {/* <PrescriptionWindow 
                        prescriptions={prescriptions} 
                        addPrescription={isDoctor ? addPrescription : null} 
                    /> */}
                </div>

                {/* Chat Window */}
                <div className="flex-1 p-4 overflow-auto">
                    {/* <ChatWindow roomName={roomName} user={user} /> */}
                </div>
            </div>
        </div>
    );
};

export default MeetingRoom;
