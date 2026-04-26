import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import Divider from './Divider'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import { logout } from '../store/userSlice'
import toast from 'react-hot-toast'
import AxiosToastError from '../utils/AxiosToastError'
import { HiOutlineExternalLink } from "react-icons/hi";

const UserMenu = ({close}) => {
   const user = useSelector((state)=> state.user)
   const dispatch = useDispatch()
   const navigate = useNavigate()

   const handleLogout = async()=>{
        try {
          const response = await Axios({
             ...SummaryApi.logout
          })
          if(response.data.success){
            if(close){
              close()
            }
            dispatch(logout())
            localStorage.clear()
            toast.success(response.data.message)
            navigate("/")
          }
        } catch (error) {
          AxiosToastError(error)
        }
   }

   const handleClose = ()=>{
      if(close){
        close()
      }
   }

   // Role checks
   const isMainAdmin = user.role === "ADMIN";
   const isCoAdmin = user.role === "COADMIN";

  return (
    <div>
        <div className='font-semibold'>My Account</div>
        <div className='text-sm flex items-center gap-2'>
          <span className='max-w-52 text-ellipsis line-clamp-1'>
            {user.name || user.mobile} 
            <span className='text-medium text-red-600 ml-1'>
                {isMainAdmin ? "(Admin)" : isCoAdmin ? "(Manager)" : ""}
            </span>
          </span>
          
          {/* PROFILE LINK: Hide for COADMIN (Security check) */}
          {!isCoAdmin && (
            <Link onClick={handleClose} to={"/dashboard/profile"} className='hover:text-primary-200'>
                <HiOutlineExternalLink size={15}/>
            </Link>
          )}
        </div>

        <Divider/>

        <div className='text-sm grid gap-1'>
            {/* --- ADMIN ONLY: Hidden for COADMIN --- */}
            {
              isMainAdmin && (
                <>
                    <Link onClick={handleClose} to={"/dashboard/category"} className='px-2 hover:bg-orange-200 py-1'>Category</Link>
                    <Link onClick={handleClose} to={"/dashboard/subcategory"} className='px-2 hover:bg-orange-200 py-1'>Sub Category</Link>
                    <Link onClick={handleClose} to={"/dashboard/upload-product"} className='px-2 hover:bg-orange-200 py-1'>Upload Product</Link>
                    <Link onClick={handleClose} to={"/dashboard/product"} className='px-2 hover:bg-orange-200 py-1'>Product</Link>
                </>
              )
            }

            {/* --- DASHBOARD: Visible to Admin and Co-Admin --- */}
            <Link onClick={handleClose} to={"/dashboard/myorders"} className='px-2 hover:bg-orange-200 py-1 font-bold text-primary-100'>
                {isCoAdmin ? "Order Dashboard 🚀" : "My Orders"}
            </Link>

            {/* --- SAVE ADDRESS: Hidden for COADMIN (Prevention from fake orders/memory bloat) --- */}
            {!isCoAdmin && (
               <Link onClick={handleClose} to={"/dashboard/address"} className='px-2 hover:bg-orange-200 py-1'>Save Address</Link>
            )}

            <button onClick={handleLogout} className='text-left px-2 hover:bg-orange-200 py-1 text-red-500 font-semibold'>Log Out</button>

        </div>
    </div>
  )
}

export default UserMenu
