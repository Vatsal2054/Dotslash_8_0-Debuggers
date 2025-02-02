import { createContext } from "react";

export const UserContext = createContext({
    userInfo : {},
    role: "",
    currentAppointment: {},
    setAppointment: () => {},
    setUserInfo: () => {},
    pingUser: () => {},
    getDoctors: () => {},
    getDoctorsByCity: () => {},
    getAppointments: () => {},
    bookAppointment: () => {},
    acceptRequest: () => {},
    declineRequest: () => {},
    joinAppointment: () => {},
    submitPrescriptions: () => {},
})