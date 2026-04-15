import React, { useState } from 'react';
import { FaRegEyeSlash, FaRegEye } from "react-icons/fa6";
import { MdErrorOutline } from "react-icons/md"; // Added for Notice Icon
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
        } else {
          navigate("/");
        }
      }
    } catch (error) {
      AxiosToastError(error);
    }
  };

  return (
    <section className='w-full container mx-auto px-2'>
      <div className='bg-white my-4 w-full max-w-lg mx-auto rounded p-7 shadow-lg border border-gray-100'>
        
        {/* 🔥 DYNAMIC NOTICE BOX */}
        <div className='bg-red-50 border-l-4 border-red-600 p-4 mb-6 rounded'>
          <div className='flex items-center gap-2 mb-1'>
            <MdErrorOutline className='text-red-600 text-xl font-bold' />
            <span className='text-red-700 font-black text-sm uppercase tracking-tight'>Important Notice</span>
          </div>
          <p className='text-gray-900 text-xs font-bold leading-relaxed'>
            Register using your <span className='text-red-600 underline'>college email id only</span>. 
            Other personal IDs will not be receiving orders and will be deleted from the database!
          </p>
        </div>

        <form className='grid gap-4 py-2' onSubmit={handleSubmit}>
          
          {/* Label made Bold & Dark Black */}
          <div className='grid gap-1'>
            <label htmlFor='email' className='font-black text-black text-sm uppercase tracking-wide'>Email Address :</label>
            <input
              type='email'
              id='email'
              className='bg-blue-50 p-2.5 border rounded outline-none focus:border-primary-200 text-black font-semibold placeholder:text-gray-400'
              name='email'
              value={data.email}
              onChange={handleChange}
              placeholder='Enter your college email'
              required
            />
          </div>

          <div className='grid gap-1'>
            <label htmlFor='password' className='font-black text-black text-sm uppercase tracking-wide'>Password :</label>
            <div className='bg-blue-50 p-2.5 border rounded flex items-center focus-within:border-primary-200'>
              <input
                type={showPassword ? "text" : "password"}
                id='password'
                className='w-full outline-none bg-transparent text-black font-semibold'
                name='password'
                value={data.password}
                onChange={handleChange}
                placeholder='Enter your password'
                required
              />
              <div onClick={() => setShowPassword(prev => !prev)} className='cursor-pointer text-black ml-2'>
                {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
              </div>
            </div>
            
            <Link to={"/forgot-password"} className='block ml-auto text-xs font-bold text-gray-600 hover:text-red-600 transition-colors mt-1'>
              Forgot password? Use WhatsApp support below!
            </Link>
          </div>

          <button
            disabled={!isValid}
            className={`${isValid ? "bg-green-800 hover:bg-green-900" : "bg-gray-400"} text-white py-3 rounded font-black text-sm my-3 tracking-widest uppercase transition-all shadow-md`}
          >
            Login to AdiMart
          </button>
        </form>

        <p className='text-sm font-bold text-gray-700 text-center mt-2'>
          Don't have account?{" "}
          <Link to={"/register"} className='font-black text-green-700 hover:text-red-600 underline decoration-2'>
            Register Now
          </Link>
        </p>
      </div>
    </section>
  );
};

export default Login;
