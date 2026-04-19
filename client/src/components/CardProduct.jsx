import React from 'react'
import { DisplayPriceInRupees } from '../utils/DisplayPriceInRupees'
import { Link } from 'react-router-dom'
import { valideURLConvert } from '../utils/valideURLConvert'
import { pricewithDiscount } from '../utils/PriceWithDiscount'
import SummaryApi from '../common/SummaryApi'
import AxiosToastError from '../utils/AxiosToastError'
import Axios from '../utils/Axios'
import toast from 'react-hot-toast'
import { useState } from 'react'
import { useGlobalContext } from '../provider/GlobalProvider'
import AddToCartButton from './AddToCartButton'

const CardProduct = ({data}) => {
    const url = `/product/${valideURLConvert(data.name)}-${data._id}`
    const [loading,setLoading] = useState(false)
  
  return (
    <Link to={url} className='border py-2 lg:p-4 grid gap-1 lg:gap-3 min-w-36 lg:min-w-52 rounded cursor-pointer bg-white transition-shadow hover:shadow-lg' >
      <div className='min-h-20 w-full max-h-24 lg:max-h-32 rounded overflow-hidden'>
        <img 
          src={
            data.image?.[0]
              ? data.image[0].replace("http://", "https://") 
              : ""
          }
          alt={data.name}
          loading="lazy"
          referrerPolicy="origin"
          className='w-full h-full object-scale-down lg:scale-125'
        />
      </div>

      <div className='flex items-center gap-1'>
        <div className='rounded text-xs w-fit p-[1px] px-2 text-green-600 bg-green-50 font-bold'>
              100 min 
        </div>
        <div>
            {
              Boolean(data.discount) && (
                <p className='text-green-600 bg-green-100 px-2 w-fit text-xs rounded-full font-bold'>{data.discount}% discount</p>
              )
            }
        </div>
      </div>

      {/* ✅ Product Name - Changed to font-bold */}
      <div className='px-2 lg:px-0 font-bold text-ellipsis text-sm lg:text-base line-clamp-2 text-neutral-800'>
        {data.name}
      </div>

      {/* ✅ Unit - Changed to font-bold and added a slight color shift for hierarchy */}
      <div className='w-fit gap-1 px-2 lg:px-0 text-sm lg:text-base font-bold text-neutral-500'>
        {data.unit} 
      </div>

      <div className='px-2 lg:px-0 flex items-center justify-between gap-1 lg:gap-3 text-sm lg:text-base'>
        <div className='flex items-center gap-1'>
          {/* ✅ Price - Already font-semibold, but can be font-bold if you want more impact */}
          <div className='font-bold text-green-700'>
              {DisplayPriceInRupees(pricewithDiscount(data.price,data.discount))} 
          </div>
        </div>
        
        <div className=''>
          {
            data.stock == 0 ? (
              <p className='text-red-500 text-sm text-center font-bold'>Out of stock</p>
            ) : (
              <AddToCartButton data={data} />
            )
          }
        </div>
      </div>

    </Link>
  )
}

export default CardProduct
