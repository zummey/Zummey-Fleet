import { useForm } from "react-hook-form";
import logo from "../../assets/logo.png";
import line from "../../assets/line.png";
import { FcGoogle } from "react-icons/fc";
import { Link } from "react-router-dom";
import { useLogin } from "../../api/auth.mutations";
import { setAuth } from "../../auth/auth.store";
import { useNavigate } from "react-router-dom";
import PasswordInput from "../../components/Ui/PasswordInput";

const Login = () => {
  const navigate = useNavigate();

  const { mutate, isPending, isError, error } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    mutate(data, {
      onSuccess: (res) => {
        console.log("LOGIN RAW RESPONSE 👉", res);

        const details = res?.data?.responseDetails;

        if (!details) {
          console.error("Login succeeded but responseDetails is missing", res);
          return;
        }

        const { tokenData, userData } = details;

        console.log("ACCESS TOKEN 👉", tokenData.access);
        console.log("REFRESH TOKEN 👉", tokenData.refresh);
        console.log("USER DATA 👉", userData);

        setAuth({
          access: tokenData.access,
          refresh: tokenData.refresh,
          user: userData,
        });

        console.log("AUTH STATE SET SUCCESSFULLY ✅");

        navigate("/dashboard");
      },
    });
  };

  return (
    <div className="signup-container flex justify-center items-center h-screen">
      <div className="signup-wrapper w-[70%]">
        <div className="signup-cen flex flex-col items-center gap-3 font-poppins">
          <img src={logo} alt="Zummey Logo" className="w-[60px] ml-5" />
          <h4 className="font-semibold text-[1.2rem]">Log In</h4>
          <div className="google flex items-center justify-center gap-1 bg-[#F7F7F8] w-[100%] py-2.5 rounded-lg cursor-pointer">
            <FcGoogle />
            <p>Google</p>
          </div>
          <div className="or flex items-center gap-3">
            <img src={line} alt="" />
            <p className="font-semibold">Or</p>
            <img src={line} alt="" />
          </div>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-5 font-primary font-medium"
        >
          <div className="email form-inner">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="example@gmail.com"
              id="email"
              className="signin-input"
              {...register("email", { required: "Email is required" })}
            />
          </div>
          <div className="password form-inner">
            <PasswordInput
              label="Password"
              name="password"
              register={register}
              errors={errors}
              placeholder="Input Password"
            />
          </div>
          {isError && (() => {
            const raw = error?.response?.data?.responseMessage?.toLowerCase() || "";
            const msg =
              raw.includes("password") || raw.includes("credential") || raw.includes("invalid") || raw.includes("authentication")
                ? "Incorrect email address or password. Please try again."
                : raw.includes("not found") || raw.includes("no account") || raw.includes("user")
                  ? "No account found with that email address."
                  : raw.includes("inactive") || raw.includes("disabled")
                    ? "Your account has been deactivated. Please contact support."
                    : "Something went wrong. Please try again.";
            return (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 mb-2">
                <span className="text-red-500 mt-0.5">⚠</span>
                <p className="text-red-600 text-sm">{msg}</p>
              </div>
            );
          })()}
          <div className="terms mt-4 mb-4 flex">
            <input type="checkbox" name="terms" id="terms" className="" />
            <label
              htmlFor="terms"
              className="ml-2 flex justify-between w-[100%]"
            >
              <span className="text-primary cursor-pointer">Remember me</span>
              <Link to="/reset_password" className="text-secondary cursor-pointer hover:underline">
                Reset Password?
              </Link>
            </label>
          </div>

          <button
            disabled={isPending}
            type="submit"
            className="mb-4 bg-primary w-[100%] text-white rounded-lg py-2.5 cursor-pointer font-semibold"
          >
            {isPending ? "Logging in..." : "Login"}
          </button>
        </form>

        <Link to="/">
          <p className="text-center">
            Don't have an account?{" "}
            <span className="text-secondary">Sign Up</span>
          </p>
        </Link>
      </div>
    </div>
  );
};

export default Login;
