import React, { useState } from 'react'
import { FaRegEyeSlash, FaRegEye } from "react-icons/fa6";
import { MdErrorOutline } from "react-icons/md"; // Added for Notice Icon
import toast from 'react-hot-toast';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import AxiosToastError from '../utils/AxiosToastError';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
    const [data, setData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    })
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const navigate = useNavigate()

    const handleChange = (e) => {
        const { name, value } = e.target
        setData((preve) => {
            return {
                ...preve,
                [name]: value
            }
        })
    }

    const valideValue = Object.values(data).every(el => el)

    const handleSubmit = async(e)=>{
        e.preventDefault()

        if(data.password !== data.confirmPassword){
            toast.error("password and confirm password must be same")
            return
        }

        try {
            const response = await Axios({
                ...SummaryApi.register,
                data : data
            })
            
            if(response.data.error){
                toast.error(response.data.message)
            }

            if(response.data.success){
                toast.success(response.data.message)
                setData({
                    name : "",
                    email : "",
                    password : "",
                    confirmPassword : ""
                })
                navigate("/login")
            }

        } catch (error) {
            AxiosToastError(error)
        }
    }

    return (
        <section className='w-full container mx-auto px-2'>
            <div className='bg-white my-8 w-full max-w-lg mx-auto rounded-xl p-8 shadow-2xl border border-gray-100'>
                
                {/* Branding Header */}
                <h2 className='text-center text-2xl font-black text-black mb-2 uppercase tracking-tighter'>
                    Join AdiMart
                </h2>
                <p className='text-center text-gray-500 font-bold text-xs mb-6 uppercase tracking-widest'>IIT Ropar Campus Delivery</p>

                {/* 🔥 DYNAMIC NOTICE BOX */}
                <div className='bg-red-50 border-l-4 border-red-600 p-4 mb-6 rounded-lg'>
                    <div className='flex items-center gap-2 mb-1'>
                        <MdErrorOutline className='text-red-600 text-xl font-bold' />
                        <span className='text-red-700 font-black text-xs uppercase tracking-tight'>Important Registration Policy</span>
                    </div>
                    <p className='text-gray-900 text-[11px] font-black leading-relaxed'>
                        Register using your <span className='text-red-600 underline decoration-2'>COLLEGE EMAIL ID ONLY!</span>. 
                        
                    </p>
                </div>

                <form className='grid gap-4 mt-6' onSubmit={handleSubmit}>
                    
                    {/* Name Field */}
                    <div className='grid gap-1.5'>
                        <label htmlFor='name' className='font-black text-black text-sm uppercase tracking-wide ml-1'>Name :</label>
                        <input
                            type='text'
                            id='name'
                            autoFocus
                            className='bg-blue-50 p-3 border-2 border-transparent rounded-lg outline-none focus:border-green-700 text-black font-bold placeholder:text-gray-400 transition-all'
                            name='name'
                            value={data.name}
                            onChange={handleChange}
                            placeholder='Enter your full name'
                        />
                    </div>

                    {/* Email Field */}
                    <div className='grid gap-1.5'>
                        <label htmlFor='email' className='font-black text-black text-sm uppercase tracking-wide ml-1'>Email :</label>
                        <input
                            type='email'
                            id='email'
                            className='bg-blue-50 p-3 border-2 border-transparent rounded-lg outline-none focus:border-green-700 text-black font-bold placeholder:text-gray-400 transition-all'
                            name='email'
                            value={data.email}
                            onChange={handleChange}
                            placeholder='Enter your college email'
                        />
                    </div>

                    {/* Password Field */}
                    <div className='grid gap-1.5'>
                        <label htmlFor='password' className='font-black text-black text-sm uppercase tracking-wide ml-1'>Password :</label>
                        <div className='bg-blue-50 p-3 border-2 border-transparent rounded-lg flex items-center focus-within:border-green-700 transition-all'>
                            <input
                                type={showPassword ? "text" : "password"}
                                id='password'
                                className='w-full outline-none bg-transparent text-black font-bold'
                                name='password'
                                value={data.password}
                                onChange={handleChange}
                                placeholder='Enter your password'
                            />
                            <div onClick={() => setShowPassword(preve => !preve)} className='cursor-pointer text-black ml-2 text-xl'>
                                {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
                            </div>
                        </div>
                    </div>

                    {/* Confirm Password Field */}
                    <div className='grid gap-1.5'>
                        <label htmlFor='confirmPassword' className='font-black text-black text-sm uppercase tracking-wide ml-1'>Confirm Password :</label>
                        <div className='bg-blue-50 p-3 border-2 border-transparent rounded-lg flex items-center focus-within:border-green-700 transition-all'>
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                id='confirmPassword'
                                className='w-full outline-none bg-transparent text-black font-bold'
                                name='confirmPassword'
                                value={data.confirmPassword}
                                onChange={handleChange}
                                placeholder='Confirm your password'
                            />
                            <div onClick={() => setShowConfirmPassword(preve => !preve)} className='cursor-pointer text-black ml-2 text-xl'>
                                {showConfirmPassword ? <FaRegEye /> : <FaRegEyeSlash />}
                            </div>
                        </div>
                    </div>

                    <button 
                        disabled={!valideValue} 
                        className={` ${valideValue ? "bg-green-800 hover:bg-black shadow-lg" : "bg-gray-400" } text-white py-4 rounded-xl font-black text-sm my-4 tracking-widest uppercase transition-all active:scale-95`}
                    >
                        Create Account
                    </button>

                </form>

                <p className='text-sm font-bold text-gray-600 text-center mt-4'>
                    Already have account?{" "}
                    <Link to={"/login"} className='font-black text-green-800 hover:text-red-600 underline decoration-2 underline-offset-4 transition-all'>
                        Login
                    </Link>
                </p>
            </div>
        </section>
    )
}

export default Register
