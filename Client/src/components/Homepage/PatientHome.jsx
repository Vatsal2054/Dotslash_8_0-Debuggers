import { useContext } from "react";
import { UserContext } from "../../context/UserContext";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import HomeLayout from "./HomeLayout";

export default function PatientHome(){
    const { role } = useContext(UserContext);

    const navigate = useNavigate();

    if(role !== "patient"){
        toast.error("You are not authorized to view this page");
        navigate("/");
    }

    return (
        <HomeLayout />
    )
}