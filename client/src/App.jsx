import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import './App.css'
import Header from './components/Header'
import Footer from './components/Footer'
import toast, { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import fetchUserDetails from './utils/fetchUserDetails';
import { setUserDetails } from './store/userSlice';
import { setAllCategory, setAllSubCategory, setLoadingCategory } from './store/productSlice';
import { useDispatch, useSelector } from 'react-redux';
import Axios from './utils/Axios';
import SummaryApi from './common/SummaryApi';
import GlobalProvider from './provider/GlobalProvider';
import CartMobileLink from './components/CartMobile';

function App() {
  const dispatch = useDispatch()
  const location = useLocation()
  const navigate = useNavigate()
  
  // Redux store se user state nikaali
  const user = useSelector((state) => state.user)

  const fetchUser = async () => {
    const userData = await fetchUserDetails()
    console.log("🔥 Final userData in App.jsx:", userData)

    // ✅ Only dispatch if successful
    if (userData?.success && userData.data) {
      dispatch(setUserDetails(userData.data))
    }
  }

  const fetchCategory = async () => {
    try {
      dispatch(setLoadingCategory(true))
      const response = await Axios({
        ...SummaryApi.getCategory
      })

      const { data: responseData } = response
      if (responseData.success) {
        dispatch(setAllCategory(
          responseData.data.sort((a, b) => a.name.localeCompare(b.name))
        ))
      }
    } catch (error) {
      console.error("❌ Error loading category", error)
    } finally {
      dispatch(setLoadingCategory(false))
    }
  }

  const fetchSubCategory = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.getSubCategory
      })

      const { data: responseData } = response
      if (responseData.success) {
        dispatch(setAllSubCategory(
          responseData.data.sort((a, b) => a.name.localeCompare(b.name))
        ))
      }
    } catch (error) {
      console.error("❌ Error loading subcategory", error)
    }
  }

  useEffect(() => {
    fetchUser()
    fetchCategory()
    fetchSubCategory()
  }, [])

  // --- 🛡️ MANAGER (COADMIN) ACCESS CONTROL ---
  useEffect(() => {
    // Agar user logged in hai aur uska role COADMIN hai
    if (user?._id && user?.role === "COADMIN") {
      
      // Ye raste Manager ke liye allowed hain
      const allowedPaths = ["/dashboard/myorders", "/dashboard/profile"];
      
      // Agar wo kisi aisi jagah hai jo allowed nahi hai (Home, Shop, Cart etc.)
      const isPathAllowed = allowedPaths.some(path => location.pathname.startsWith(path));

      if (!isPathAllowed) {
        // Dhakke maar ke wapas MyOrders par bhejo
        // replace: true history record clean rakhta hai
        navigate("/dashboard/myorders", { replace: true });
      }
    }
  }, [user, location.pathname, navigate]);

  return (
    <GlobalProvider>
      <Header />
      
      <main className='min-h-[78vh]'>
        <Outlet />
      </main>

      {/* Manager ko extra navigation ya footer dikhane ki zarurat nahi hai */}
      {user?.role !== "COADMIN" && <Footer />}
      
      <Toaster />

      {/* Checkout aur Manager dono ke liye Cart floating link hide kar diya */}
      {location.pathname !== '/checkout' && user?.role !== "COADMIN" && (
        <CartMobileLink />
      )}
    </GlobalProvider>
  )
}

export default App
