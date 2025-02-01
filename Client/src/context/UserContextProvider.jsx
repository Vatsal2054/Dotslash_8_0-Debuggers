import { useState } from "react";
import { UserContext } from "./UserContext";

export default function UserContextProvider({ children }) {
    const [userInfo, setUserInfo] = useState({});
    
    function setUserData(data){
        setUserInfo(data);
    }

    const ctxValue = {
        userInfo: userInfo,
        setUserInfo: setUserData,
    }

    return (
        <UserContext.Provider value={ctxValue}>
            {children}
        </UserContext.Provider>
    )
}