"use client"

import Shedule from "@/components/Shedule";
import { useState , useEffect } from "react";
import dynamic from "next/dynamic";

export default function Sessions() {



const Periods = dynamic(() => import("../../../components/Periods"), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});
const ManageRanks = dynamic(() => import("../../../components/ManageRanks"), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});
const Holidays = dynamic(() => import("../../../components/Holidays"), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});
const ProfilAdmin = dynamic(() => import("../../../components/ProfilAdmin"), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});

const [ isActive , setIsActive] = useState([true , false , false , false]);
 


    return (
      <div className=" w-full">
        <div className="border-b border-gray-200">
      <nav className="flex w-full space-x-8">
          <div
            className={` w-1/4 py-4 px-1 border-b-2 font-medium text-sm cursor-pointer ${
              isActive[0]
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={()=>{setIsActive([true,false,false,false])}}
          >
            Admin details
          </div>
        
          <div
            className={`w-1/4 py-4 px-1 border-b-2 font-medium text-sm cursor-pointer ${
              isActive[1]
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={()=>{setIsActive([false,true,false,false])}}
          >
            Handle Periods
          </div>
        
          <div
            className={`w-1/4 py-4 px-1 border-b-2 font-medium text-sm cursor-pointer ${
              isActive[2]
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={()=>{setIsActive([false,false,true,false])}}
          >
            Handle Holidays
          </div>
        
       
          <div
            className={`w-1/4 py-4 px-1 border-b-2 font-medium text-sm cursor-pointer ${
              isActive[3]
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={()=>{setIsActive([false,false,false,true])}}
          >
            Handle Ranks
          </div>
       
      </nav>
    </div>
    <div > 
       {isActive[0] && <div className=" w-full"><ProfilAdmin /></div>}
       {isActive[1] && <div><Periods /></div>}
       {isActive[2] && <div><Holidays/></div>}
       {isActive[3] && <div><ManageRanks /></div>}
    </div>
      </div>
    );
  }
  