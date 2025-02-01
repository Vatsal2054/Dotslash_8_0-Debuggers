import { useState } from "react";
import { UserContext } from "./UserContext";
import getApi from "../helpers/API/getApi";

export default function UserContextProvider({ children }) {
    const [userInfo, setUserInfo] = useState({});
    const [doctors, setDoctors] = useState([]);
    
    function setUserData(data){
        setUserInfo(data);
    }

    async function handlePingUser(){
        console.log("Pinging User...")
        const res = await getApi("/auth/ping");
        console.log(res);
        if(res.status === 200){
            console.log("Authorized User");
            setUserInfo(res.data.data);
            return true;
        }
        return false;
    }

    async function handleGetDoctors(){
        const res = await getApi("/doctor/getDoctor");
        console.log(res);
        if(res.status === 200){
            console.log("Doctors fetched successfully");
            return res.data.data;
        }
        return false;
    }
    
    async function handleGetDoctorsByCity(){
        const res = await getApi("/doctor/getDoctorBycity");
        console.log(res);
        if(res.status === 200){
            console.log("Doctors fetched successfully");
            return res.data.data;
        }
        return false;
    }

    const ctxValue = {
        userInfo: userInfo,
        setUserInfo: setUserData,
        role: userInfo.role,
        pingUser: handlePingUser,
        getDoctors: handleGetDoctors,
        getDoctorsByCity: handleGetDoctorsByCity
    }

    return (
        <UserContext.Provider value={ctxValue}>
            {children}
        </UserContext.Provider>
    )
}