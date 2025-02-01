import { useContext, useEffect, useState } from "react"
import { UserContext } from "../context/UserContext";

export default function FindDoctors(){
    const [doctors, setDoctors] = useState([]);
    const [doctorsinCity, setDoctorsInCity] = useState([]);

    const { getDoctors, getDoctorsByCity } = useContext(UserContext);

    useEffect(() => {
        handleGetDoctors();
    },[]);

    async function handleGetDoctors(){
        let res = await getDoctors();
        console.log(res);
        
        if(res){
            setDoctors(res);
        }
        res = await getDoctorsByCity();
        console.log(res);
        if(res){
            setDoctorsInCity(res);
        }
    }

    return (
        <div className="p-4">
            <h1 className="text-[2rem] font-[700]">Find Doctors</h1>
        </div>
    )
}