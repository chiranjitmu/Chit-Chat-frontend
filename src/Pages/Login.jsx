import React, { useEffect, useState, useRef } from "react";
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

// Decryption function
const decryptData = (ciphertext, secretKey) => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, secretKey);
  const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  return decryptedData;
};

const emailSchema = yup
  .string()
  .required("Please Enter Your Email")
  .matches(/^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/, "Please Enter Valid Email");

const passwordSchema = yup
  .string()
  .required("Please Enter Your Password")
  .min(6, "Atleast 6 Char length");

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailerror, setemailError] = useState(false);
  const [passworderror, setpasswordError] = useState(false);
  const navigate = useNavigate();
  const triggeronce = useRef("false");

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

  const validate = async () => {
    try {
      await emailSchema.validate(email);
      await passwordSchema.validate(password);
      handleLogin();
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
        error.message === "Atleast 6 Char length" ||
        error.message === "Please Enter Your Password"
      ) {
        setpasswordError(true);
      }
    }
  };

  useEffect(() => {
    if (triggeronce.current === "false") {
      let loginExists = false;
      // Iterate through all keys in localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        // Check if the key contains the string "login"
        if (key && key.includes("login")) {
          loginExists = true;
          break;
        }
      }
      if (!loginExists) {
        localStorage.setItem(
          "login",
          encryptData("false", import.meta.env.VITE_SCREATE_KEY)
        );
      } else if (loginExists) {
        const decryptlogin = localStorage.getItem("login");
        const loggedtrue = decryptData(
          decryptlogin,
          import.meta.env.VITE_SCREATE_KEY
        );
        if (loggedtrue == "true") {
          navigate("/home");
        }
      }
      return () => (triggeronce.current = "true");
    }
  }, []);

  const handleLogin = async () => {
    const lowerCaseEmail = email.trim().toLowerCase();
    const decryptcheckloggeduser = localStorage.getItem("login");
    const checkloggeduser = decryptData(
      decryptcheckloggeduser,
      import.meta.env.VITE_SCREATE_KEY
    );
    try {
      if (checkloggeduser === "true") {
        toast.error("Already you have loggedin! please log-out that first", {
          position: "top-center",
          autoClose: 1500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
        const clear = setTimeout(() => {
          navigate("/home");
        }, 2500);
        return () => clearTimeout(cleartime);
      } else if (checkloggeduser === "false" || checkloggeduser === "") {
        const response = await fetch(
          `${
            import.meta.env.VITE_BACKEND_BASE_URI
          }/api/v1/login?email=${lowerCaseEmail}&password=${password}`
        );

        const success = await response.json();

        if (success.message === "Login successful") {
          setEmail("");
          setPassword("");
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
          localStorage.setItem("jwtToken", success.token);
          localStorage.setItem(
            "email",
            encryptData(lowerCaseEmail, import.meta.env.VITE_SCREATE_KEY)
          );
          localStorage.setItem(
            "login",
            encryptData("true", import.meta.env.VITE_SCREATE_KEY)
          );
          const navigatetime = setTimeout(() => {
            navigate("/Home");
          }, 2000);
          return () => clearTimeout(navigatetime);
        } else if (success.message === "Invalid email or Register first") {
          setEmail("");
          setPassword("");
          setemailError(true);
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
        } else if (success.message === "Invalid password or Register first") {
          setEmail("");
          setPassword("");
          setpasswordError(true);
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
        } else if (success.message === "Not verified") {
          setEmail("");
          setPassword("");
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
          const navigatetime = setTimeout(() => {
            navigate("/Otp-verify", { state: { email: email } });
          }, 2000);
          return () => clearTimeout(navigatetime);
        }
      }
    } catch (error) {
      toast.error("An error occurred while logging in.", {
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
      <section className="fixed bg-whatsappbg  w-full h-full flex items-center justify-center">
        <ToastContainer />
        <div className="container bg-white p-6 m-10 rounded-xl sm:m-14 sm:p-10 md:p-14 md:m-16 lg:p-20 xl:p-24 xl:m-72">
          <h1 className="font-serif text-xl text-center md:text-2xl lg:text-3xl xl:text-4xl mb-6">
            Welcome to Chit-chat
          </h1>
          <form className="space-y-4">
            <input
              className={`${
                emailerror ? "border-red-700" : "border-gray-300"
              } p-2 border w-full focus:border-blue-500 focus:outline-none rounded`}
              type="email"
              placeholder="Email"
              value={email}
              required
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
              } p-2 border w-full focus:border-blue-500 focus:outline-none rounded`}
              type="password"
              placeholder="Password"
              value={password}
              required
              onClick={() => {
                setpasswordError(false);
              }}
              onChange={(event) => {
                setPassword(event.target.value);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  validate();
                }
              }}
            />
            <input
              className="bg-lime-200 rounded cursor-pointer hover:bg-lime-300 p-2 w-full"
              type="button"
              value="Login"
              onClick={validate}
            />
          </form>
          <span className="text-sm flex justify-center pt-2 pb-2">OR</span>
          <div className="flex justify-center">
            Don't Have an account?
            <a href="/register">
              <span className="text-gray-500 ml-2">Register</span>
            </a>
          </div>
        </div>
      </section>
    </motion.main>
  );
}

export default Login;
