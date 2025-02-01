import { useContext, useEffect } from "react";
import { UserContext } from "../context/UserContext";
import PatientHome from "../components/Homepage/PatientHome";
import DoctorHome from "../components/Homepage/DoctorHome";
import HomeLayout from "../components/Homepage/HomeLayout";
import { useNavigate } from "react-router";

export default function Home() {
    const { role, pingUser } = useContext(UserContext);

    const navigate = useNavigate();

    useEffect(() => {
        pingUserHandler();
    }, []);

    async function pingUserHandler(){
        const res = await pingUser();
        if(!res){
            console.log("User not authorized");
            navigate("/login");
        }
    }

    if(!role) {
        return (
            <main className="flex w-[100vw] h-[100vh] items-center justify-center">
                <h1 className="text-[2.2rem] font-[500]">Loading...</h1>
            </main>
        )
    }

    return (
        <>
            <HomeLayout role={role} />
        </>
    )
}