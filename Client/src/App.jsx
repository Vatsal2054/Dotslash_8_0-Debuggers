import { BrowserRouter, Routes, Route } from "react-router";
import Home from "./pages/Home";
import Login from "./pages/Login";
import PatientSignUp from "./pages/PatientSignUp";
import DoctorSignUp from "./pages/DoctorSignUp";
import SignUp from "./pages/Signup";
import Appointment from "./pages/Appointment";
import FindDoctors from "./pages/FindDoctors";
import Chat from "./pages/ChatBot";
import Profile from "./pages/Profile";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />}>
            <Route path="/appointments" element={<Appointment />} />
            <Route path="/find-doctor" element={<FindDoctors />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/profile" element={<Profile />} />
            {/* <Route path="/" /> */}
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signup/patient" element={<PatientSignUp />} />
          <Route path="/signup/doctor" element={<DoctorSignUp />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
