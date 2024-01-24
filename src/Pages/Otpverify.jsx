import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as yup from "yup";
import { motion } from "framer-motion";

const otpSchema = yup
  .string()
  .required("Please Enter Your Otp")
  .matches(/^[0-9]+$/, "Please Enter only Number")
  .min(6, "Atleast 6 Char length");

function Otpverify() {
  const location = useLocation();
  const [email, setEmail] = useState(location.state.email.trim().toLowerCase());
  const [otp, setOtp] = useState("");
  const [remainingSeconds, setRemainingSeconds] = useState(180);
  const [otperror, setotpError] = useState(false);
  const navigate = useNavigate();

  const fadeInVariants = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        duration: 3, // Adjust the duration as needed
      },
    },
  };

  // timer
  useEffect(() => {
    if (remainingSeconds > 0) {
      const timer = setTimeout(() => {
        setRemainingSeconds(remainingSeconds - 1);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [remainingSeconds]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const validate = async () => {
    try {
      await otpSchema.validate(otp);
      handleVerify();
    } catch (error) {
      toast.error(error.message, {
        position: "top-center",
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      setotpError(true);
    }
  };

  const handleVerify = async () => {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_BASE_URI
        }/api/v1/otp-verify?otp=${otp}&email=${email}`
      );

      const success = await response.json();

      if (success.message === "OTP verified") {
        setOtp("");
        toast.success(success.message, {
          position: "top-center",
          autoClose: 1500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
        const navigatetime = setTimeout(() => {
          navigate("/");
        }, 2000);
        return () => clearTimeout(navigatetime);
      } else if (
        success.message === "Wrong OTP" ||
        success.message === "User not Register" ||
        success.message === "Your OTP has expired"
      ) {
        toast.error(success.message, {
          position: "top-center",
          autoClose: 1500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
        setotpError(true);
      }
    } catch (error) {
      toast.error("An error occurred while verify.", {
        position: "top-center",
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    }
  };

  const resendOtp = async () => {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_BASE_URI
        }/api/v1/resend-otp?email=${email}`
      );

      const resend = await response.json();

      if (resend.message === "Resend successfully") {
        setRemainingSeconds(180);
        setOtp("");
        toast.success(resend.message, {
          position: "top-center",
          autoClose: 1500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
      }
    } catch (error) {
      toast.error("An error occurred while resend-otp.", {
        position: "top-center",
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    }
  };

  return (
    <motion.main initial="hidden" animate="visible" variants={fadeInVariants}>
      <section className="flex justify-center bg-whatsappbg h-full w-full fixed items-center">
        <ToastContainer />
        <div className="container flex flex-col items-center bg-white rounded-xl p-6 m-10 sm:p-10 sm:m-24 md:p-14 md:m-36 lg:p-20 lg:m-72 xl:p-2 xl:m-96">
          <h1 className="font-serif text-2xl">Verify OTP</h1>
          <input
            className={`${
              otperror ? "border-red-700" : "border-gray-300"
            } mt-9 ml-4 p-2 sm:w-64 rounded focus:outline-none focus:border-blue-500 border appearance-none`}
            type="type"
            value={otp}
            placeholder="Enter Your OTP"
            onClick={() => {
              setotpError(false);
            }}
            onChange={(event) => {
              setOtp(event.target.value);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                validate();
              }
            }}
          />
          <span className="text-red-500 ml-40">
            {formatTime(remainingSeconds)}
          </span>
          <span
            className="mt-10 mr-36 opacity-60 hover:opacity-100 cursor-pointer"
            onClick={resendOtp}
          >
            Resend
          </span>
          <a
            href="/register"
            className="mt-4 mr-36 opacity-60 hover:opacity-100"
          >
            Go Back
          </a>
          <button
            className="bg-lime-200 p-2 rounded cursor-pointer hover:bg-lime-300 w-20 mt-7"
            onClick={validate}
          >
            Verify
          </button>
        </div>
      </section>
    </motion.main>
  );
}

export default Otpverify;
