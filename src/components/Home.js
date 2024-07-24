import React, { useEffect, useContext, useRef, useState } from "react";
import {
  Typography,
  Card,
  CardBody,
  Avatar,
  IconButton,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
} from "@material-tailwind/react";
import {
  ChatBubbleBottomCenterIcon,
  PhoneIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/outline";
import RippleBackground from "./RippleBackground";
import "./Home.css";
import { Navigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import { SidebarWithBurgerMenu } from "./SidebarWithBurgerMenu";
import { ChatComponent } from "./ChatComponent";
import { CallComponent } from "./CallComponent";
import { createSocket } from "../socket";
import { SocketProvider } from "../context/SocketContext";

function Home() {
  const { user, setUser } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [currentCall, setCurrentCall] = useState(null);
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [incomingCallData, setIncomingCallData] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  const socket = useRef(null);

  useEffect(() => {
    socket.current = createSocket();

    socket.current.on("connect", () => {
      console.log("Connected to server!");
      socket.current.emit("new-user", {
        id: socket.current.id,
        name: user.nickname,
        photo: user.photo,
      });
    });

    socket.current.on("me", (id) => {
      setUser((prevUser) => ({
        ...prevUser,
        id,
      }));
    });

    socket.current.on("users-list", (users) => {
      const filteredUsers = users.filter((u) => u.id !== socket.current.id);
      setUsers(filteredUsers);
    });

    socket.current.on("call-user", (callData) => {
      setIncomingCallData(callData);
      setIsVideoCall(callData.type === "video");
      setOpenDialog(true);
    });

    return () => {
      socket.current.disconnect();
    };
  }, [user.nickname, user.photo, setUser]);

  const handleStartCall = (user, isVideo) => {
    setCurrentCall(user);
    setIsVideoCall(isVideo);
  };

  const handleAcceptCall = () => {
    setCurrentCall({ id: incomingCallData.from, name: "Unknown Caller" }); // You can enhance this to fetch the user's name based on the ID
    setOpenDialog(false);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setIncomingCallData(null);
  };

  if (!user.nickname || !user.photo) {
    return <Navigate to="/login" />;
  }

  return (
    <SocketProvider socket={socket.current}>
      <RippleBackground>
        <div className="container">
          <div className="welcome">
            <SidebarWithBurgerMenu />
            <Typography variant="h1" className="text-white">
              Welcome, {user.nickname}!
            </Typography>
          </div>

          <Card className="card-container">
            <CardBody>
              <div className="card-title">
                <Typography variant="h5" color="blue-gray">
                  Online Users
                </Typography>
              </div>
              <div className="user-list">
                {users.map((user, index) => (
                  <div key={index} className="flex justify-between">
                    <div className="flex gap-x-9">
                      <Avatar
                        size="sm"
                        src={user.photo}
                        alt={user.name}
                        className="user-avatar"
                      />
                      <Typography color="blue-gray" className="user-name">
                        {user.name}
                      </Typography>
                    </div>
                    <div className="flex items-center gap-x-3">
                      <IconButton onClick={() => setCurrentChat(user)}>
                        <ChatBubbleBottomCenterIcon className="h-6 w-6 text-white-500" />
                      </IconButton>
                      <IconButton onClick={() => handleStartCall(user, false)}>
                        <PhoneIcon className="h-6 w-6 text-white-500" />
                      </IconButton>
                      <IconButton onClick={() => handleStartCall(user, true)}>
                        <VideoCameraIcon className="h-6 w-6 text-white-500" />
                      </IconButton>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
          <ChatComponent currentChat={currentChat} />
          <CallComponent
            currentCall={currentCall}
            isVideo={isVideoCall}
            incomingCallData={incomingCallData}
          />
        </div>

        <Dialog open={openDialog} size="sm" handler={handleCloseDialog}>
          <DialogHeader>Incoming Call</DialogHeader>
          <DialogBody>
            You have an incoming call. Do you want to accept it?
          </DialogBody>
          <DialogFooter>
            <Button
              variant="text"
              color="red"
              onClick={handleCloseDialog}
              className="mr-1"
            >
              <span>Decline</span>
            </Button>
            <Button variant="gradient" color="green" onClick={handleAcceptCall}>
              <span>Accept</span>
            </Button>
          </DialogFooter>
        </Dialog>
      </RippleBackground>
    </SocketProvider>
  );
}

export default Home;
