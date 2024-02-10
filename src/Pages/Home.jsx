import { BiMessageRoundedDetail } from "react-icons/bi";
import { FiPhoneCall } from "react-icons/fi";
import { BsSearch } from "react-icons/bs";
import { AiOutlineSend, AiOutlineLogout } from "react-icons/ai";
import React, { useEffect, useState, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";
import io from "socket.io-client";
import { useNavigate } from "react-router-dom";
import CryptoJS from "crypto-js";
import { IoIosContact } from "react-icons/io";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

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

function Home() {
  const [messagetosend, setMessagetosend] = useState("");
  const [search, setSearch] = useState("");
  const [index, setIndex] = useState("");
  const [userimchatting, setUserimchatting] = useState("");
  const [userimchattingemail, setUserimchattingemail] = useState("");
  const [userimage, setUserimage] = useState("");
  const [messagingwith, setMessagingwith] = useState("");
  const [messages, setMessages] = useState("");
  const [socket, setSocket] = useState(null);
  const [chatsection, setChatsection] = useState(false);
  const [contactsection, setContactsection] = useState(true);
  const [typing, setTyping] = useState(false);
  const [data, setData] = useState([]);
  const decryptemail = localStorage.getItem("email");
  const email = decryptData(decryptemail, import.meta.env.VITE_SCREATE_KEY);
  const [userList, setUserList] = useState([]);
  const navigate = useNavigate();
  const triggeronce = useRef("false");
  const messagesContainerRef = useRef(null);
  const sendmailtrue = useRef("true");
  const gptres = useRef("");

  // check mobile width or not
  const isMobile = window.innerWidth < 600;

  // driverjs
  let steps = [
    {
      element: "#main",
      popover: {
        title: "Guide",
        description: "Let make you a tour guide. How to start with.",
      },
    },
    {
      element: "#aside",
      popover: {
        title: "Side Bar",
        description: "For navigating message section or any other section",
      },
    },
    {
      element: "#message-icon",
      popover: {
        title: "Message",
        description: "Click here to go for message section",
      },
    },
    {
      element: "#phone-icon",
      popover: {
        title: "Phone",
        description: "This is to call someone. It will come soon",
      },
    },
    {
      element: "#logout-icon",
      popover: { title: "LogOut", description: "Click here to logout" },
    },
  ];

  if (isMobile) {
    steps.push(
      {
        element: "#contact-icon",
        popover: {
          title: "Contact",
          description: "Click here and select whom you want to chat",
        },
      },
      {
        element: "#search-bar",
        popover: {
          title: "Search Bar",
          description:
            "Click here and search anyone using their email. If exists it will display",
        },
      },
      {
        element: "#message-send-icon",
        popover: {
          title: "Message Send",
          description: "Click message icon to send message",
        },
      },
      {
        element: "#chatgpt-icon",
        popover: {
          title: "Chatgpt Response",
          description:
            "Once you typed your question then click gpt icon to send chatgpt response to your friend",
        },
      },
      {
        element: "#main",
        popover: {
          title: "Thank you",
          description:
            "Thank you for your time. Now you can enjoy the app by yourself. Hope you will like this App",
        },
      }
    );
  } else {
    steps.push(
      {
        element: "#search-bar",
        popover: {
          title: "Search Bar",
          description:
            "Click here and search anyone using their email. If exists it will display",
        },
      },
      {
        element: "#message-send-icon",
        popover: {
          title: "Message Send",
          description: "Click message icon to send message",
        },
      },
      {
        element: "#chatgpt-icon",
        popover: {
          title: "Chatgpt Response",
          description:
            "Once you typed your question then click gpt icon to send chatgpt response to your friend",
        },
      },
      {
        element: "#main",
        popover: {
          title: "Thank you",
          description:
            "Thank you for your time. Now you can enjoy the app by yourself. Hope you will like this App",
        },
      }
    );
  }

  const driverObj = driver({
    showProgress: true,
    allowClose: false,
    steps: steps,
  });

  useEffect(() => {
    const guide = localStorage.getItem("guide") || "";
    if (guide === "false" || guide === "") {
      driverObj.drive();
      localStorage.setItem("guide", "true");
    }
  }, []);

  // for framer motion
  const fadeInVariants = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        duration: 1,
      },
    },
  };

  // Using the scrollIntoView method to scroll to the bottom
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesContainerRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }, 100);
  };

  // open contact section
  const handleopencontact = () => {
    if (chatsection) {
      setContactsection(true);
      setChatsection(false);
    }
  };

  // open chat section
  const handleopenchatsection = () => {
    if (contactsection) {
      setContactsection(false);
      setChatsection(true);
    }
  };

  // chatgpt
  const handleSendgpt = async (messagetosend) => {
    try {
      const apiKey = import.meta.env.VITE_API_KEY;
      const message = [{ role: "user", content: messagetosend }];

      const result = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          messages: message,
          model: "gpt-3.5-turbo",
        }),
      });

      if (!result.ok) {
        throw new Error(
          `OpenAI API request failed with status ${result.status}`
        );
      }

      const data = await result.json();
      gptres.current = data.choices[0].message.content;
      sendgptres();
    } catch (error) {
      console.error("Error making OpenAI request:", error.message);
    }
  };
  // chatgpt send message
  const sendgptres = () => {
    const receiverusername = userList[index].email;
    const decryptsenderusername = localStorage.getItem("email");
    const senderusername = decryptData(
      decryptsenderusername,
      import.meta.env.VITE_SCREATE_KEY
    );
    socket.emit("message", {
      receiverusername,
      senderusername,
      messagetosend: `CHAT-GPT answer : ${gptres.current}`,
    });
    if (userList[index].email !== email) {
      setData((prevData) => [
        ...prevData,
        {
          senderusername: senderusername,
          message: `CHAT-GPT answer : ${gptres.current}`,
        },
      ]);
      scrollToBottom();
    }
    setMessagetosend("");
  };

  // search user
  const handlesearch = async () => {
    const lowerCaseEmail = email.trim().toLowerCase();
    const lowerCaseEmailSearch = search.trim().toLowerCase();
    const token = localStorage.getItem("jwtToken");
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_BASE_URI
        }/api/v1/getuser?email=${lowerCaseEmailSearch}&myemail=${lowerCaseEmail}`,
        {
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
          },
        }
      );

      const success = await response.json();

      if (success.message === "User Present") {
        setSearch("");
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
        setUserList([
          ...userList,
          {
            email: success.email,
            username: success.username,
            image: success.image,
            online: success.online,
          },
        ]);
      } else if (success.message === "User not Exist") {
        setSearch("");
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
      } else if (success.message === "Unauthorized User") {
        setSearch("");
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
        localStorage.setItem(
          "login",
          encryptData("false", import.meta.env.VITE_SCREATE_KEY)
        );
        const clearnav = setTimeout(() => {
          navigate("/");
        }, 2500);
        return () => clearTimeout(clearnav);
      } else if (success.message === "User already exist in your list") {
        setSearch("");
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
      // edit after for error pages
    } catch (error) {
      setSearch("");
      toast.error("An error occurred while fetch.", {
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

  // fetch message from db
  const fetchmessage = async () => {
    const lowerCaseEmail = email.trim().toLowerCase();
    const token = localStorage.getItem("jwtToken");
    let email2;
    if (userList[index] && userList[index].email) {
      email2 = userList[index].email;
    }
    const lowerCaseEmail2 = email2.trim().toLowerCase();

    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_BASE_URI
        }/api/v1/getmessage?email1=${lowerCaseEmail}&email2=${lowerCaseEmail2}`,
        {
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
          },
        }
      );

      const success = await response.json();

      if (success.message === "Fetch successfully") {
        setData(() => success.response);
        scrollToBottom();
      }

      // edit after for error pages
    } catch (error) {
      toast.error("An error occurred while fetch.", {
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

  // fetch userlist from db and store it
  const fetchuserlist = async () => {
    const lowerCaseEmail = email.trim().toLowerCase();
    const token = localStorage.getItem("jwtToken");
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_BASE_URI
        }/api/v1/getuserlist?email=${lowerCaseEmail}`,
        {
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
          },
        }
      );

      const success = await response.json();
      if (success.message === "Fetch successfully") {
        const newUserList = success.response.map((user) => ({
          email: user.email,
          username: user.username,
          image: user.image,
          online: user.online,
        }));
        setUserList([...newUserList]);
      } else if (success.message === "Unauthorized User") {
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
        localStorage.setItem(
          "login",
          encryptData("false", import.meta.env.VITE_SCREATE_KEY)
        );
        const clearnav = setTimeout(() => {
          navigate("/");
        }, 2500);
        return () => clearTimeout(clearnav);
      }
    } catch (error) {
      toast.error("An error occurred while fetch.", {
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

  const checkloggin = () => {
    const logintruedecrypt = localStorage.getItem("login");
    const logintrue = decryptData(
      logintruedecrypt,
      import.meta.env.VITE_SCREATE_KEY
    );
    if (logintrue == "false" || logintrue == "") {
      navigate("/");
    }
  };

  // socket initialize
  const initializeSocket = () => {
    const decryptemail = localStorage.getItem("email");
    const email = decryptData(decryptemail, import.meta.env.VITE_SCREATE_KEY);
    const newSocket = io(import.meta.env.VITE_BACKEND_BASE_URI);
    setSocket(newSocket);
    if (email) {
      newSocket.emit("join", email);
    } else {
      navigate("/");
    }
  };

  useEffect(() => {
    if (triggeronce.current === "false") {
      checkloggin();
      initializeSocket();

      // Cleanup function for socket events when component unmounts
      return () => (triggeronce.current = "true");
    }
  }, []);

  useEffect(() => {
    const clearinter = setInterval(() => {
      fetchuserlist();
    }, 1000);
    return () => clearInterval(clearinter);
  }, []);

  // when index changed then only run
  useEffect(() => {
    if (index !== "") {
      fetchmessage();
    }
  }, [index]);

  // sendmail when user not present in userlist
  const sendmail = async (email, sendermail) => {
    const token = localStorage.getItem("jwtToken");
    try {
      await fetch(
        `${
          import.meta.env.VITE_BACKEND_BASE_URI
        }/api/v1/sendmail?email=${email}&sendermail=${sendermail}`,
        {
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      toast.error("An error occurred while sending.", {
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

  // check for message every 1sec
  useEffect(() => {
    const decryptemail = localStorage.getItem("email");
    const email = decryptData(decryptemail, import.meta.env.VITE_SCREATE_KEY);
    const handlePrivateMessage = (data) => {
      setMessages(data);
      for (let i = 0; i < userList.length; i++) {
        let currentUser = userList[i];
        if (currentUser.email === data.senderUsername) {
          let username = currentUser.username;
          setMessagingwith(username);
          toast.success(`Message came from ${username}`, {
            position: "top-center",
            autoClose: 1500,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
          });
          sendmailtrue.current = "false";
          break;
        }
      }
      // send message notification when new user messaged and it will be not be in list
      if (data.receiverusername == email && sendmailtrue.current == "true") {
        toast.success(`Message came from ${data.senderUsername}`, {
          position: "top-center",
          autoClose: 1500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
        sendmail(email, data.senderUsername);
      }
    };

    if (socket) {
      socket.on("privateMessage", handlePrivateMessage);
      return () => {
        socket.off("privateMessage", handlePrivateMessage);
      };
    }
  }, [socket, userList]);

  // if typing by sender show typing
  const handleTyping = () => {
    if (userimchattingemail !== email) {
      socket.emit("typingtosend", userimchattingemail, email);
      const handleTypingTrue = (emailsend) => {
        if (userimchattingemail === emailsend.emailsend) {
          setTyping(true);
          const typingtrue = setTimeout(() => {
            setTyping(false);
          }, 5000);
          return () => clearTimeout(typingtrue);
        }
      };

      socket.on("typingtrue", handleTypingTrue);

      // Clean up the event listener on component unmount
      return () => {
        socket.off("typingtrue", handleTypingTrue);
      };
    }
  };

  const handleopenchat = (index) => {
    setIndex(index);
    const userimchatting = userList[index].username;
    const userimage = userList[index].image;
    const useremail = userList[index].email;
    setUserimchattingemail(useremail);
    setUserimchatting(userimchatting);
    setUserimage(userimage);
    setContactsection(false);
    setChatsection(true);
    setMessagetosend("");
    setTyping(false);
  };

  const sendmessage = () => {
    const receiverusername = userList[index].email;
    const decryptsenderusername = localStorage.getItem("email");
    const senderusername = decryptData(
      decryptsenderusername,
      import.meta.env.VITE_SCREATE_KEY
    );
    socket.emit("message", { receiverusername, senderusername, messagetosend });
    if (userList[index].email !== email) {
      setData((prevData) => [
        ...prevData,
        { senderusername: senderusername, message: messagetosend },
      ]);
      scrollToBottom();
    }
    setMessagetosend("");
  };

  // run when message arrive
  useEffect(() => {
    if (
      messages.receivedmessage &&
      messages.receivedmessage !== email &&
      messagingwith == userimchatting &&
      messagingwith !== "" &&
      userimchatting !== ""
    ) {
      setData((prevData) => [
        ...prevData,
        {
          senderusername: messages.senderUsername,
          message: messages.receivedmessage,
        },
      ]);
      var audio = new Audio("/notification-sound.mp3");
      audio.play();
      setTyping(false);
      scrollToBottom();
    }
  }, [messages]);

  // logout
  const logout = () => {
    localStorage.setItem(
      "login",
      encryptData("false", import.meta.env.VITE_SCREATE_KEY)
    );
    localStorage.setItem(
      "email",
      encryptData("", import.meta.env.VITE_SCREATE_KEY)
    );
    const clearlogout = setTimeout(() => {
      navigate("/");
    }, 1500);
    return () => clearTimeout(clearlogout);
  };

  return (
    <motion.main
      className="bg-whatsappbg2 w-full h-full fixed"
      initial="hidden"
      animate="visible"
      variants={fadeInVariants}
    >
      <ToastContainer />
      <section className="flex w-full mt-3 h-full" id="main">
        {/* side section */}
        <aside
          id="aside"
          className="text-white space-y-4 flex flex-col justify-between mt-4"
        >
          <div>
            <BiMessageRoundedDetail
              id="message-icon"
              className="text-4xl ml-2 cursor-pointer text-white p-2 sm:hover:text-black  hover:bg-gray-700 rounded"
              onClick={handleopenchatsection}
            />
            <FiPhoneCall
              id="phone-icon"
              className="text-4xl ml-2 cursor-pointer text-white p-2 sm:hover:text-black  hover:bg-gray-700 rounded"
            />
            <IoIosContact
              id="contact-icon"
              className="sm:hidden text-4xl ml-2 cursor-pointer text-white p-2 sm:hover:text-black  hover:bg-gray-700 rounded"
              onClick={handleopencontact}
            />
          </div>
          <div id="logout-icon">
            <AiOutlineLogout
              onClick={logout}
              className="text-4xl mb-10 ml-2 cursor-pointer text-white p-2 sm:hover:text-black  hover:bg-gray-700 rounded"
            />
          </div>
        </aside>
        {/* main section */}
        <section className="flex space-x-1 ml-3 w-full mt-2">
          {/* contact section */}
          <section
            className={`flex-initial w-full ${
              contactsection ? "block" : "hidden"
            } sm:block min-w-[12rem] mr-4 sm:mr-0 sm:w-1/3 overflow-auto border border-black bg-whatsappbg3 rounded-md h-full p-2`}
          >
            <span>
              <span
                className="bg-whatsappbg2 w-full flex rounded sticky top-0"
                id="search-bar"
              >
                <input
                  type="text"
                  className="p-2 w-full rounded bg-whatsappbg2 focus:outline-none text-white text-sm placeholder:text-white placeholder:text-sm"
                  placeholder="Search"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      handlesearch();
                    }
                  }}
                />
                <BsSearch
                  className="mt-2 mb-1 text-white p-2 text-4xl cursor-pointer"
                  onClick={handlesearch}
                />
              </span>
              {userList.length === 0 ? (
                <p className="flex justify-center text-white h-[80vh] items-center text-xl">
                  No User available
                </p>
              ) : (
                <div>
                  {userList.map((user, index) => (
                    <div key={index} onClick={() => handleopenchat(index)}>
                      <div className="p-2 mt-2 mb-4 rounded-md flex min-w-[5rem] m-0.5 sm:w-auto border border-chattextbg cursor-pointer">
                        <img
                          src={user.image}
                          alt=""
                          className="w-12 h-12 sm:w-16 sm:h-14 sm:p-1 sm:border-white sm:border rounded-full"
                        />
                        <span className="m-auto sm:ml-3 ml-1 sm:mt-2 text-white text-s sm:text-lg">
                          {user.username}
                        </span>
                        <span
                          className={`flex ${
                            user.online === "true" ? "block" : "hidden"
                          } text-green-500`}
                        >
                          Online
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </span>
          </section>

          {/* chat section */}
          <section
            className={`flex-initial w-full ${
              chatsection ? "block" : "hidden"
            } sm:block sm:w-2/3 border border-black bg-whatsappbg3 rounded-md`}
          >
            <div className="flex flex-col h-full">
              <div className="bg-whatsappbg2 w-full h-20 fixed p-2 flex items-center">
                <img
                  src={`${userimage === "" ? "/icon.png" : userimage}`}
                  alt=""
                  className="w-12 h-12 sm:w-16 sm:h-14 sm:p-1 sm:border-white sm:border rounded-full"
                />
                {/* typing true or false check */}
                {typing ? (
                  <div className="p-2 rounded-md text-green-500">Typing...</div>
                ) : (
                  <h1 className="flex items-center text-white text-lg font-bold ml-3">
                    {`${userimchatting == "" ? "No-user" : userimchatting}`}
                  </h1>
                )}
              </div>
              <div className="flex-grow mt-20 p-2 overflow-y-auto scrollbar-hide text-white">
                <div>
                  {data.length === 0 ? (
                    <p className="flex justify-center h-[70vh] items-center text-xl">
                      No messages available
                    </p>
                  ) : (
                    <div className="space-y-4" ref={messagesContainerRef}>
                      {data.map((message, index) => (
                        <div
                          className={`flex ${
                            email == message.senderusername
                              ? "justify-end"
                              : "justify-start"
                          }`}
                          key={index}
                        >
                          <div
                            className={`p-2 rounded-md ${
                              email === message.senderusername
                                ? "bg-gray-600"
                                : "bg-chattextbg"
                            }`}
                          >
                            {message.message}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="mb-3">
                <span
                  className={`${userimchatting === "" ? "hidden" : "block"} flex
                 bg-whatsappbg2 border-t-2 border-black rounded items-center`}
                >
                  <input
                    type="text"
                    className="w-full p-3 rounded focus:outline-none bg-whatsappbg2 text-white"
                    placeholder="Type a message"
                    value={messagetosend}
                    onChange={(event) => {
                      setMessagetosend(event.target.value);
                      handleTyping();
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        sendmessage();
                      }
                    }}
                  />
                  <img
                    src="/ChatGPT_logo.png"
                    alt="chatgpt-logo"
                    className="w-9 h-9 border border-white p-1 rounded mr-2 cursor-pointer"
                    onClick={() => handleSendgpt(messagetosend)}
                  />
                  <AiOutlineSend
                    className="mt-2 mb-1 cursor-pointer text-white p-2 text-4xl hover:bg-gray-600 hover:rounded mr-3"
                    onClick={sendmessage}
                  />
                </span>
              </div>
            </div>
          </section>
        </section>
      </section>
    </motion.main>
  );
}

export default Home;
