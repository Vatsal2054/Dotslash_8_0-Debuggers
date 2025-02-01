import { get } from "mongoose";
import { createContext } from "react";

export const UserContext = createContext({
    userInfo : {},
    role: "",
    setUserInfo: () => {},
    pingUser: () => {},
    getDoctors: () => {},
    getDoctorsByCity: () => {},
    getAppointments: () => {},
    bookAppointment: () => {},
})