import { SignupInput } from "@jagadeesh28/medium-common";
import axios from "axios";
import { ChangeEvent, useState } from "react"
import { Link, useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../config";

export const Auth = ({type}:{type:"signin" | "signup"}) =>{
    const navigate = useNavigate();
    const [postInputs,setPostInputs] = useState<SignupInput>({
        name : "",
        username : "",
        password : ""
    })
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [passwordError, setPasswordError] = useState<string>("");

    async function sendReq() {
        try{
            {if(type === "signup"){
                if(postInputs.password.length <= 6){
                    setPasswordError("Your password must be at least 6 characters long. Please try another.");
                    return;
                }
            }}
            const res = await axios.post(`${BACKEND_URL}/api/v1/user/${type === "signin" ? "signin" : "signup"}`,postInputs);
            const jwt = res.data.jwt;
            localStorage.setItem("token",jwt);
            navigate("/blogs");
        }catch(e){
            if (type === "signin") {
                setErrorMessage("Sorry, your password / Email was incorrect. Please double-check your Credentials.");
            } else {
                setErrorMessage("An error occurred during signup. Please try again.");
            }
        }
    }
    return (
        <div className="h-screen flex flex-col justify-center items-center">
            <h1 className="text-3xl font-bold p-1">Create an account</h1>
            <div className="flex my-2 text-slate-500">
                {type  === "signin" ? "Don't have an account" : "Already have an account?" }
                <Link className="underline underline-offset-2 mx-1 hover:cursor-pointer" to={type === "signin" ? "/signup" : "/signin"}>    {type==="signin" ? "Sign Up" : "Sign In"}
                </Link>
            </div>
            <div className="w-1/2">
                {type === "signup" && <LabelledInput  label={"Username"} placeholder={"Enter your username"} onChange={(e)=>{
                    setPostInputs({
                        ...postInputs,
                        name: e.target.value
                    })
                }} />}
                <LabelledInput label={"Email"} placeholder={"abc@example.com"} onChange={(e)=>{
                    setPostInputs({
                        ...postInputs,
                        username : e.target.value
                    })
                }} />
                <LabelledInput label={"Password"} type={"password"} placeholder={"enter the password"} onChange={(e)=>{
                    setPostInputs({
                        ...postInputs,
                        password : e.target.value
                    })
                }} />
                {passwordError && (
                    <p className="text-red-700 font-bold bg-red-200 mt-3 p-3 rounded-lg">
                        {passwordError}
                    </p>
                )}
                {errorMessage && (
                    <p className="text-red-700 font-bold bg-red-200 mt-3 p-3 rounded-lg">
                        {errorMessage}
                    </p>
                )}
                <button onClick={sendReq} type="button" className="my-7 w-full text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700">{type === "signup" ? "Sign Up" : "Sign In"}</button>
            </div>
        </div>
    )
}

interface LabelledInputType{
    label:string,
    placeholder  : string,
    type? : string,
    onChange : (e: ChangeEvent<HTMLInputElement>)=> void
}

function LabelledInput({label,placeholder,onChange,type}:LabelledInputType) {
    return <div>
        <label className="block mt-4 mb-2 text-sm font-semibold text-gray-900">{label}</label>
        <input type={ type || "text"} onChange={onChange}  id="first_name" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" placeholder={placeholder} required  />
</div>
}