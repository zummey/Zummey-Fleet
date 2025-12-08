import React from 'react'
import { useForm } from 'react-hook-form'
import logo from "../../assets/logo.png"
import { FcGoogle } from "react-icons/fc";

const SignUp = () => {
    const {register, handleSubmit, formState: {errors}} = useForm()

    const onSubmit = (data) => console.log(data)

  return (
    <div className="signup-container flex justify-center">
        <div className="signup-wrapper w-[80%]">
            <img src={logo} alt="Zummey Logo" />

            <h4>Sign Up</h4>
            <FcGoogle />
            <p>Google</p>
            <p>Or</p>

            <form onSubmit={handleSubmit(onSubmit)} className=''>
                <div className="fullname">
                    <label htmlFor="fullname">Full Name</label>
                    <input type="text" name='fullname' id='fullname'/>
                </div>
                <div className="email">
                    <label htmlFor="email">Email Address</label>
                    <input type="email" name='email' id='email' />
                </div>
                <div className="company">
                    <label htmlFor="companyname">Company/Fleet Name</label>
                    <input type="text" name='companyname' id='companyname' />
                </div>
                <div className="number">
                    <label htmlFor="phonenum">Phone number</label>
                    <input type="tel" name='phonenum' id='phonenum'/>
                </div>
                <div className="password">
                    <label htmlFor="password">Password</label>
                    <input type="password" name='password' id='password'/>
                </div>
                <div className="confirmpass">
                    <label htmlFor="confirmpass">Confirm Password</label>
                    <input type="password" name='confirmpass' id='confirmpass'/>
                </div>
                <div className="terms">
                    <input type="checkbox" name='terms' id='terms'/>
                    <label htmlFor="terms">By creating an account you agree to the <span className='text-secondary underline-offset-2'>terms of use</span> and our <span className='text-secondary underline-offset-2'>privacy policy</span></label>
                </div>

                <button type='submit'>Sign Up</button>
            </form>

            <p>Already have an account? <span className='text-secondary'>Log in</span></p>
        </div>
    </div>
  )
}

export default SignUp