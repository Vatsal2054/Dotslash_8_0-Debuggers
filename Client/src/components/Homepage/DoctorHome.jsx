import { useContext } from "react";
import { UserContext } from "../../context/UserContext";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";

export default function DoctorHome(){
    const { role } = useContext(UserContext);

    const navigate = useNavigate();

    if(role !== "doctor"){
        toast.error("You are not authorized to view this page");
        navigate("/");
    }

    return (
        <div>
            <h1>Welcome Doctor</h1>
        </div>
    )
}