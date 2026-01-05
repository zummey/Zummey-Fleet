import React, { useState } from "react";
import { FaEyeSlash } from "react-icons/fa6";
import { IoMdEye } from "react-icons/io";


const PasswordInput = ({ label, name, register, errors, placeholder }) => {

  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="form-inner">
      <label htmlFor={name}>{label}</label>
      <div className="pass-wrap relative">
        <input
          type={showPassword ? "text" : "password"}
          id={name}
          placeholder={placeholder}
          className="signin-input text-[#979797] w-[100%]"
          {...register(name, { required: `${label} is required` })}
        />
        {showPassword ? (
          <IoMdEye
            className="absolute top-[30%] right-[5%] cursor-pointer text-[#979797]"
            onClick={() => setShowPassword(false)}
          />
        ) : (
          <FaEyeSlash
            className="absolute top-[30%] right-[5%] cursor-pointer text-[#979797]"
            onClick={() => setShowPassword(true)}
          />
        )}
      </div>
      {errors[name] && (
        <p className="text-red-500 text-sm mt-1">{errors[name].message}</p>
      )}
    </div>
  );
};

export default PasswordInput;