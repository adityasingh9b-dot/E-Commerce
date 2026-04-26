import React, { useEffect, useState, useRef } from 'react'
import logo from '../assets/logo.png'
import Search from './Search'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FaRegCircleUser } from "react-icons/fa6";
import useMobile from '../hooks/useMobile';
import { BsCart4 } from "react-icons/bs";
import { useSelector } from 'react-redux';
import { GoTriangleDown, GoTriangleUp } from "react-icons/go";
import UserMenu from './UserMenu';
import { DisplayPriceInRupees } from '../utils/DisplayPriceInRupees';
import { useGlobalContext } from '../provider/GlobalProvider';
import DisplayCartItem from './DisplayCartItem';
// --- NEW IMPORTS FOR SIREN ---
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import sirenFile from '../assets/siren.mp3'; 

const Header = () => {
    const [isMobile] = useMobile()
    const location = useLocation()
    const isSearchPage = location.pathname === "/search"
    const navigate = useNavigate()
    const user = useSelector((state) => state?.user)
    const [openUserMenu, setOpenUserMenu] = useState(false)
    const cartItem = useSelector(state => state.cartItem.cart)
    const { totalPrice, totalQty } = useGlobalContext()
    const [openCartSection, setOpenCartSection] = useState(false)

    // Role checks
    const isCoAdmin = user?.role === "COADMIN";
    const isAdminOrCoAdmin = user?.role === "ADMIN" || user?.role === "COADMIN";

    // --- SIREN STATES & REFS ---
    const [lastOrderCount, setLastOrderCount] = useState(0)
    const [isSirenActive, setIsSirenActive] = useState(false)
    const audioRef = useRef(null) 

    // 1. Order Monitoring Logic
    useEffect(() => {
        if (!audioRef.current) {
            audioRef.current = new Audio(sirenFile);
        }

        // --- FIXED: Ab check har bar chalega agar user Admin ya CoAdmin hai ---
        if (!isAdminOrCoAdmin) return;

        const checkNewOrders = async () => {
            try {
                const response = await Axios({ ...SummaryApi.getOrderItems });
                const orderList = response.data?.data || response.data || [];
                const currentCount = orderList.length;

                // Log for debugging
                console.log("Monitoring Orders - Role:", user?.role, "Count:", currentCount);

                if (lastOrderCount !== 0 && currentCount > lastOrderCount) {
                    playSiren();
                }
                setLastOrderCount(currentCount);
            } catch (error) {
                console.log("Order Monitor Error:", error);
            }
        };

        // Initial check and then interval
        checkNewOrders();
        const interval = setInterval(checkNewOrders, 30000); 
        return () => clearInterval(interval);
    }, [user, lastOrderCount, isAdminOrCoAdmin]); // Added isAdminOrCoAdmin to dependency

    // 2. Play Siren Function
    const playSiren = () => {
        if (audioRef.current) {
            audioRef.current.loop = true;
            audioRef.current.play().catch(e => console.log("Audio play blocked", e));
        }
        setIsSirenActive(true);

        if (Notification.permission === "granted") {
            const n = new Notification("🚨 Naya Order Aaya Hai!", {
                body: "Check karo store ka naya order.",
                icon: logo
            });
            n.onclick = () => {
                window.focus();
                // --- FIXED: Manager ko sahi page par bhejne ke liye ---
                navigate(isCoAdmin ? "/dashboard/myorders" : "/dashboard/orders");
                stopSiren();
            };
        } else {
            alert("🚨 NAYA ORDER MILA HAI!");
        }
    };

    // 3. Stop Siren
    const stopSiren = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        setIsSirenActive(false);
    };

    useEffect(() => {
        if (typeof window !== "undefined" && "Notification" in window) {
            if (Notification.permission !== "granted") {
                Notification.requestPermission();
            }
        }
    }, []);

    const redirectToLoginPage = () => { navigate("/login") }
    const handleCloseUserMenu = () => { setOpenUserMenu(false) }
    const handleMobileUser = () => {
        if (!user._id) { navigate("/login"); return; }
        navigate(isCoAdmin ? "/dashboard/myorders" : "/user")
    }

    return (
        <header className='h-24 lg:h-20 lg:shadow-md sticky top-0 z-40 flex flex-col justify-center gap-1 bg-white'>
            {/* Siren Alert Strip - Enabled for COADMIN */}
            {isSirenActive && isAdminOrCoAdmin && (
                <div className='bg-red-600 text-white text-center py-2 animate-pulse flex justify-center items-center gap-4 fixed top-0 left-0 w-full z-50'>
                    <span className='font-bold'>🚨 NAYA ORDER MILA HAI!</span>
                    <button onClick={stopSiren} className='bg-white text-red-600 px-4 py-1 rounded-full font-bold text-sm shadow-lg'>
                        STOP SIREN
                    </button>
                </div>
            )}

            {
                !(isSearchPage && isMobile) && (
                    <div className='container mx-auto flex items-center px-2 justify-between'>
                        <div className='h-full'>
                            <Link to={isCoAdmin ? "/dashboard/myorders" : "/"} className='h-full flex justify-center items-center'>
                                <img src={logo} width={170} height={60} alt='logo' className='hidden lg:block' />
                                <img src={logo} width={120} height={60} alt='logo' className='lg:hidden' />
                            </Link>
                        </div>

                        {!isCoAdmin && (
                            <div className='hidden lg:block'>
                                <Search />
                            </div>
                        )}

                        <div className=''>
                            <button className='text-neutral-600 lg:hidden' onClick={handleMobileUser}>
                                <FaRegCircleUser size={26} />
                            </button>

                            <div className='hidden lg:flex items-center gap-10'>
                                {
                                    user?._id ? (
                                        <div className='relative'>
                                            <div onClick={() => setOpenUserMenu(preve => !preve)} className='flex select-none items-center gap-1 cursor-pointer'>
                                                <p className='font-bold'>{user.name || "Account"}</p>
                                                {openUserMenu ? <GoTriangleUp size={25} /> : <GoTriangleDown size={25} />}
                                            </div>
                                            {
                                                openUserMenu && (
                                                    <div className='absolute right-0 top-12'>
                                                        <div className='bg-white rounded p-4 min-w-52 lg:shadow-lg border'>
                                                            <UserMenu close={handleCloseUserMenu} />
                                                        </div>
                                                    </div>
                                                )
                                            }
                                        </div>
                                    ) : (
                                        <button onClick={redirectToLoginPage} className='text-lg px-2'>Login</button>
                                    )
                                }
                                
                                {!isCoAdmin && (
                                    <button onClick={() => setOpenCartSection(true)} className='flex items-center gap-2 bg-green-800 hover:bg-green-700 px-3 py-2 rounded text-white'>
                                        <div className='animate-bounce'>
                                            <BsCart4 size={26} />
                                        </div>
                                        <div className='font-semibold text-sm'>
                                            {cartItem[0] ? (
                                                <div>
                                                    <p>{totalQty} Items</p>
                                                    <p>{DisplayPriceInRupees(totalPrice)}</p>
                                                </div>
                                            ) : (
                                                <p>My Cart</p>
                                            )}
                                        </div>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }

            {!isCoAdmin && (
                <div className='container mx-auto px-2 lg:hidden'>
                    <Search />
                </div>
            )}

            {openCartSection && !isCoAdmin && (
                <DisplayCartItem close={() => setOpenCartSection(false)} />
            )}
        </header>
    )
}

export default Header
