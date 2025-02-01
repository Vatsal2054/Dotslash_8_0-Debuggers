import { useContext, useState } from "react";
import Button from "../UI/Buttons";
import Input from "../UI/Inputs";
import { FcGoogle } from "react-icons/fc";
import { AuthContext } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router";
import ThemeToggle from "../UI/ThemeToggle";
import { Logo } from "../UI/Logo";

export default function SignupContent() {
    const [error, setError] = useState({
        field: "",
        message: ""
    });
    // const [disabled, setDisabled] = useState({
    //     name: "",
    // });

    const { signUpCredentials, setSignUpCredentials, signUpUser, googleLogin } = useContext(AuthContext);

    const navigate = useNavigate()

    function handleChange(e) {
        const { name, value } = e.target;

        if (value !== "" && value.includes(" ")) {
            setError({
                field: name,
                message: "Spaces are not allowed!"
            });
            return;
        } else {
            setError({
                field: "",
                message: ""
            });
        }

        setSignUpCredentials(prevValue => {
            return {
                ...prevValue,
                [name]: value
            };
        });
    }

    function verifyEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function checkEmptyFields() {
        for (let key in signUpCredentials) {
            if (!signUpCredentials[key] || signUpCredentials[key].trim() === "") {
                setError({
                    field: key,
                    message: "This field is required!"
                });
                return true;
            }
        }
        return false;
    }

    async function handleSubmit() {
        console.table(signUpCredentials);
        if (checkEmptyFields()) return;
        if (!verifyEmail(signUpCredentials.email)) return;
        const res = await signUpUser();
        if (res) navigate("/");
    }

    return (
        <main>
            <div className="w-[100vw] h-[100vh] p-8 flex flex-row">
                <section className="h-[100%] flex-[6] sm:hidden md:block rounded-xl overflow-hidden bg-loginBackground bg-cover bg-right bg-no-repeat flex items-center justify-start">
                    <div className="relative z-[-2] p-8 w-[80%] h-[100%] rounded-xl bg-background-light dark:bg-background-dark">
                        {/* <h1 className="text-2xl">Welcome!</h1> */}
                    </div>
                </section>
                <section className="flex-[4] flex justify-center items-center">
                    <div className="w-[70%] flex flex-col">
                        <Logo size={50} className="pb-3" />
                        <h1 className="text-[2.6rem] mb-4 font-medium stretched flex justify-between items-center">
                            <span>
                                <span className="font-light">Sign Up to </span>
                                Vidify
                            </span>
                            <div className="pr-1">
                                <ThemeToggle />
                            </div>
                        </h1>
                        <form onSubmit={(e) => e.preventDefault()} className="">
                            <Input
                                Type={"PRIMARY"}
                                labelText={"Username"}
                                type={"text"}
                                name={"username"}
                                value={signUpCredentials.username}
                                onChange={handleChange}
                                errorText={error.field === "username" ? error.message : ""}
                            />
                            <Input
                                Type={"PRIMARY"}
                                labelText={"Email"}
                                type={"email"}
                                name={"email"}
                                value={signUpCredentials.email}
                                onChange={handleChange}
                                errorText={error.field === "email" ? error.message : ""}
                            />
                            <Input
                                Type={"PRIMARY"}
                                labelText={"Password"}
                                type={"password"}
                                name={"password"}
                                value={signUpCredentials.password}
                                onChange={handleChange}
                                errorText={error.field === "password" ? error.message : ""}
                                extraClasses={"mb-4"}
                            />
                            <Button
                                type={"MAIN"}
                                onClick={handleSubmit}
                                disabled={!signUpCredentials.username || !signUpCredentials.email || !signUpCredentials.password}
                                extraClasses={"mb-4"}
                            >
                                Sign Up
                            </Button>
                        </form>
                        <div className="w-full mb-4 flex items-center">
                            <div className="text-sm pr-2 dark:text-font-darkGrey text-font-grey">Or continue with</div>
                            <div className="flex-1 h-[1px] dark:bg-font-darkGrey bg-font-grey"></div>
                        </div>
                        <Button
                            type={"TERTIARY"}
                            onClick={googleLogin}
                            extraClasses={"mb-4"}
                        >
                            <FcGoogle className="inline-block text-xl mb-[2px]" /> Sign up using Google
                        </Button>
                        <div className="pt-2 text-[15px] text-center text-font-grey dark:text-font-darkGrey">
                            Already have an account? <Link to={"/login"} className="text-font-dark dark:text-font-light hover:text-primary dark:hover:text-primary">Login</Link>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}
