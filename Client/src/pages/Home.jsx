import { useContext } from "react";
import { UserContext } from "../context/UserContext";
import PatientHome from "../components/Homepage/PatientHome";
import DoctorHome from "../components/Homepage/DoctorHome";
import HomeLayout from "../components/Homepage/HomeLayout";

export default function Home() {
    const { role } = useContext(UserContext);

    return (
        <>
            <HomeLayout role={role}>
                {role === "patient" && <PatientHome />}
                {role === "doctor" && <DoctorHome />}
            </HomeLayout>
        </>
    )
}