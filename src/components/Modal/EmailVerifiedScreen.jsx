import React from 'react'
import checkmail from "../../assets/checkmail.png";
import { Link } from 'react-router-dom';

const EmailVerifiedScreen = () => {
  return (
    <div className="emailver-container    absolute top-0 left-0 w-[100%] h-screen fixed z-10">
      <div className="outer-black bg-black opacity-25 z-[-1]  absolute top-0 left-0 w-[100%] h-screen fixed"></div>
      <div className="flex justify-center h-[100%] items-center">
        <div className="emailver-wrapper z-10 opacity-100 bg-white w-[35%] h-[80%] rounded-[.8em] p-3">
          <div className="emailver-main flex flex-col items-center justify-center h-[100%] font-poppins text-center gap-6">
            <img src={checkmail} alt="" />
            <h1 className="text-[1.2rem] font-semibold max-w-[60%]">Email Verified Successfully!</h1>
            <p className="text-[0.8rem] max-w-[90%]">
              Your email has been successfully verified. You can now log in and start using the platform.
            </p>
            <Link to="/login" className='w-[100%]'><button className="bg-primary text-white w-[50%] py-2 rounded-lg cursor-pointer">Go to Login</button></Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmailVerifiedScreen