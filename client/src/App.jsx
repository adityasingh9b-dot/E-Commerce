import { Outlet, useLocation } from 'react-router-dom'
import './App.css'
import Header from './components/Header'
import Footer from './components/Footer'
import toast, { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import fetchUserDetails from './utils/fetchUserDetails';
import { setUserDetails } from './store/userSlice';
import { setAllCategory, setAllSubCategory, setLoadingCategory } from './store/productSlice';
import { useDispatch } from 'react-redux';
import Axios from './utils/Axios';
import SummaryApi from './common/SummaryApi';
import GlobalProvider from './provider/GlobalProvider';
import CartMobileLink from './components/CartMobile';

function App() {
  const dispatch = useDispatch()
  const location = useLocation()

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

  return (
    <GlobalProvider>
      <Header />
      <main className='min-h-[78vh]'>
        <Outlet />
      </main>
      <Footer />
      <Toaster />
      {location.pathname !== '/checkout' && (
        <CartMobileLink />
      )}
    </GlobalProvider>
  )
}

export default App

