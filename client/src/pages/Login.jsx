import React, { useState } from 'react';
import { FaRegEyeSlash, FaRegEye } from "react-icons/fa6";
import toast from 'react-hot-toast';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import AxiosToastError from '../utils/AxiosToastError';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUserDetails } from '../store/userSlice';

const Login = () => {
  const [data, setData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
  };

  const isValid = Object.values(data).every(el => el);

const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await Axios({
        ...SummaryApi.login,
        data,
      });

      if (response.data.error) {
        toast.error(response.data.message);
        return;
      }

      if (response.data.success) {
        toast.success(response.data.message);
        const { accessToken, refreshToken, user } = response.data.data;

        if (accessToken && refreshToken) {
          localStorage.setItem('accesstoken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
        }

        dispatch(setUserDetails(user));
        localStorage.setItem("user", JSON.stringify({ data: user }));
        setData({ email: "", password: "" });

        const role = user?.role || '';
        
        if (role === "ADMIN") {
          navigate("/admin");
        } 
        else if (role === "COADMIN") {
          
          navigate("/dashboard/myorders");
        } 
        else {
          navigate("/");
        }

      }
    } catch (error) {
      AxiosToastError(error);
    }
  };

  return (
    <section className='w-full container mx-auto px-2'>
      <div className='bg-white my-8 w-full max-w-lg mx-auto rounded-xl p-8 shadow-2xl border border-gray-100'>
        
        {/* Branding Header */}
        <h2 className='text-center text-2xl font-black text-black mb-6 uppercase tracking-tighter'>
          Welcome to AdiMart
        </h2>

        <form className='grid gap-5 py-2' onSubmit={handleSubmit}>
          
          {/* Email Field - Bold & Dark */}
          <div className='grid gap-1.5'>
            <label htmlFor='email' className='font-black text-black text-sm uppercase tracking-wide ml-1'>
              Email Address :
            </label>
            <input
              type='email'
              id='email'
              className='bg-blue-50 p-3 border-2 border-transparent rounded-lg outline-none focus:border-green-700 text-black font-bold placeholder:text-gray-400 transition-all'
              name='email'
              value={data.email}
              onChange={handleChange}
              placeholder='Enter your college email'
              required
            />
          </div>

          {/* Password Field - Bold & Dark */}
          <div className='grid gap-1.5'>
            <label htmlFor='password' className='font-black text-black text-sm uppercase tracking-wide ml-1'>
              Password :
            </label>
            <div className='bg-blue-50 p-3 border-2 border-transparent rounded-lg flex items-center focus-within:border-green-700 transition-all'>
              <input
                type={showPassword ? "text" : "password"}
                id='password'
                className='w-full outline-none bg-transparent text-black font-bold'
                name='password'
                value={data.password}
                onChange={handleChange}
                placeholder='Enter your password'
                required
              />
              <div onClick={() => setShowPassword(prev => !prev)} className='cursor-pointer text-black ml-2 text-xl'>
                {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
              </div>
            </div>
            
            {/* ✅ FIXED: WhatsApp Redirect for Forgot Password */}
            <a 
              href='https://wa.me/919369250645?text=Hello%20Aditya!%20I%20need%20help%20with%20my%20password.'
              target="_blank"
              rel="noopener noreferrer"
              className='block ml-auto text-xs font-black text-gray-500 hover:text-red-600 transition-colors mt-1'
            >
              Forgot password?
            </a>
          </div>

          <button
            disabled={!isValid}
            className={`${isValid ? "bg-green-800 hover:bg-black" : "bg-gray-400"} text-white py-4 rounded-xl font-black text-sm my-4 tracking-widest uppercase transition-all shadow-lg active:scale-95`}
          >
            Login to AdiMart
          </button>
        </form>

        <p className='text-sm font-bold text-gray-600 text-center mt-4'>
          New to the campus?{" "}
          <Link to={"/register"} className='font-black text-green-800 hover:text-red-600 underline decoration-2 underline-offset-4 transition-all'>
            Register Now
          </Link>
        </p>
      </div>
    </section>
  );
};

export default Login;
