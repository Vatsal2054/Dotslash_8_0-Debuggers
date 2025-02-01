import { useState } from "react";
import { UserContext } from "./UserContext";

export default function UserContextProvider({ children }) {
    const [userInfo, setUserInfo] = useState({
        role: "patient"
    });
    
    function setUserData(data){
        setUserInfo(data);
    }

    const ctxValue = {
        userInfo: userInfo,
        setUserInfo: setUserData,
        role: userInfo.role,
    }

    return (
        <UserContext.Provider value={ctxValue}>
            {children}
        </UserContext.Provider>
    )
}