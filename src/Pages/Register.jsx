import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as yup from "yup";
import { motion } from "framer-motion";
import CryptoJS from "crypto-js";

// Encryption function
const encryptData = (data, secretKey) => {
  const ciphertext = CryptoJS.AES.encrypt(
    JSON.stringify(data),
    secretKey
  ).toString();
  return ciphertext;
};

const fullnameSchema = yup
  .string()
  .required("Please Enter Your Name")
  .min(4, "Atleast 4 Char length")
  .matches(/^[a-zA-Z]+( [a-zA-Z]+)*$/, "Only alphabets are allowed");

const emailSchema = yup
  .string()
  .required("Please Enter Your Email")
  .matches(/^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/, "Please Enter Valid Email");

const passwordSchema = yup
  .string()
  .required("Please Enter Your Password")
  .min(6, "Atleast 6 Char length");

function Register() {
  const [fullname, setFullname] = useState("");
  const [postimage, setPostimage] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailerror, setemailError] = useState(false);
  const [nameerror, setnameError] = useState(false);
  const [passworderror, setpasswordError] = useState(false);
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
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    const base64 = await getBase64(file);
    setPostimage(base64);
  };

  const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const validate = async () => {
    try {
      await fullnameSchema.validate(fullname);
      await emailSchema.validate(email);
      await passwordSchema.validate(password);
      handleSignup();
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
      if (
        error.message === "Please Enter Valid Email" ||
        error.message === "Please Enter Your Email"
      ) {
        setemailError(true);
      } else if (
        error.message === "Only alphabets are allowed" ||
        error.message === "Please Enter Your Name" ||
        error.message === "Atleast 4 Char length"
      ) {
        setnameError(true);
      } else if (
        error.message === "Atleast 6 Char length" ||
        error.message === "Please Enter Your Password"
      ) {
        setpasswordError(true);
      }
    }
  };

  const handleSignup = async () => {
    const lowerCaseEmail = email.trim().toLowerCase();
    const lowerCaseFullname = fullname.trim().toLowerCase();
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_BASE_URI}/api/v1/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: lowerCaseEmail,
            password,
            fullname: lowerCaseFullname,
            image: postimage,
          }),
        }
      );

      const success = await response.json();

      if (success.message === "signup success") {
        setEmail("");
        setPassword("");
        setFullname("");
        toast.success("Succesfully registered", {
          position: "top-center",
          autoClose: 1000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
        const timeoutId = setTimeout(() => {
          navigate("/Otp-verify", { state: { email: email } });
        }, 2000);
        localStorage.setItem(
          "login",
          encryptData("", import.meta.env.VITE_SCREATE_KEY)
        );
        return () => clearTimeout(timeoutId);
      } else {
        // edit after for error pages
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
      }
    } catch (error) {
      toast.error("An error occurred while register.", {
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
      <section className="fixed w-full h-full bg-whatsappbg flex justify-center items-center">
        <ToastContainer />
        <div className="container bg-white rounded-xl p-6 m-10 sm:p-10 sm:m-24 md:p-14 md:m-36 lg:p-20 lg:m-72 xl:p-24 xl:m-962">
          <h1 className="font-serif text-xl text-center md:text-2xl lg:text-3xl xl:text-4xl mb-6">
            Welcome to Register
          </h1>
          <form className="space-y-4">
            <input
              className={` ${
                nameerror ? "border-red-700" : "border-gray-300"
              } w-full p-2 border rounded focus:outline-none focus:border-blue-500`}
              type="text"
              placeholder="Fullname"
              required
              value={fullname}
              onClick={() => {
                setnameError(false);
              }}
              onChange={(event) => {
                setFullname(event.target.value);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  document.getElementsByClassName("email-input")[0].focus();
                }
              }}
            />
            <input
              className={`email-input ${
                emailerror ? "border-red-700" : "border-gray-300"
              } w-full p-2 border rounded focus:outline-none focus:border-blue-500`}
              type="email"
              placeholder="Email"
              required
              value={email}
              onClick={() => {
                setemailError(false);
              }}
              onChange={(event) => {
                setEmail(event.target.value);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  document.getElementsByClassName("password-input")[0].focus();
                }
              }}
            />
            <input
              className={`password-input ${
                passworderror ? "border-red-700" : "border-gray-300"
              } w-full p-2 border rounded focus:outline-none focus:border-blue-500`}
              type="password"
              placeholder="Password"
              required
              value={password}
              onClick={() => {
                setpasswordError(false);
              }}
              onChange={(event) => {
                setPassword(event.target.value);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  document.getElementsByClassName("file-input")[0].focus();
                }
              }}
            />
            <input
              className="file-input"
              type="file"
              label="Image"
              required
              accept=".jpg, .jpeg, .png"
              onChange={(e) => handleFileUpload(e)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  validate();
                }
              }}
            />
            <input
              className="bg-lime-200 p-2 rounded cursor-pointer hover:bg-lime-300 w-full"
              type="button"
              value="Register"
              onClick={validate}
            />
          </form>
          <span className="text-sm flex justify-center p-2">OR</span>
          <div className="flex justify-center">
            Already Have an account?{" "}
            <a href="/">
              <span className="text-gray-500 ml-2">Log in</span>
            </a>
          </div>
        </div>
      </section>
    </motion.main>
  );
}

export default Register;
