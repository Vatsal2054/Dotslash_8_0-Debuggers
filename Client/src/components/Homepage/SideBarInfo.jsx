import { PiChats, PiChatsDuotone, PiClipboardText, PiClipboardTextDuotone, PiGearSix, PiGearSixDuotone, PiHouse, PiHouseDuotone, PiMagnifyingGlass, PiMagnifyingGlassDuotone, PiUserCircle, PiUserCircleDuotone } from "react-icons/pi";

export const PatientNavContentInfo = [
    {
        name: "Home",
        path: "/",
        icon: <PiHouse />,
        fillIcon: <PiHouseDuotone />
    },
    {
        name: "Appointments",
        path: "/appointments",
        icon: <PiClipboardText />,
        fillIcon: <PiClipboardTextDuotone />
    },
    {
        name: "Find Doctor",
        path: "/find-doctor",
        icon: <PiMagnifyingGlass />,
        fillIcon: <PiMagnifyingGlassDuotone  />
    },
    {
        name: "Settings",
        path: "/settings",
        icon: <PiGearSix />,
        fillIcon: <PiGearSixDuotone />
    }
]

export const DoctorNavContentInfo = [
    {
        name: "Home",
        path: "/",
        icon: <PiHouse />,
        fillIcon: <PiHouseDuotone />
    },
    {
        name: "Appointments",
        path: "/appointments",
        icon: <PiUserCircle />,
        fillIcon: <PiUserCircleDuotone />
    },
    {
        name: "History",
        path: "/history",
        icon: <PiChats />,
        fillIcon: <PiChatsDuotone />
    },
    {
        name: "Settings",
        path: "/settings",
        icon: <PiGearSix />,
        fillIcon: <PiGearSixDuotone />
    }
]

