import React, { useEffect, useContext, useRef, useState } from "react";
import { io } from "socket.io-client";
import { Typography, Card, CardBody, Avatar } from "@material-tailwind/react";
import Peer from "simple-peer";
import RippleBackground from "./RippleBackground";
import "./Home.css";
import { Navigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import { SidebarWithBurgerMenu } from "./SidebarWithBurgerMenu";

function Home() {
  const { user, setUser } = useContext(AuthContext);
  const [users, setUsers] = useState([]);

  //TODO: test

  const [stream, setStream] = useState();
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState();
  const [callAccepted, setCallAccepted] = useState(false);
  const [idToCall, setIdToCall] = useState("");
  const [callEnded, setCallEnded] = useState(false);
  const myVideo = useRef();
  //const userVideo = useRef();
  //const connectionRef = useRef();

  useEffect(() => {
    const socket = io("http://localhost:5000");

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setStream(stream);
        if (myVideo.current) {
          myVideo.current.srcObject = stream;
        }
      });

    socket.on("connect", () => {
      console.log("Connected to socket server");
      socket.emit("new-user", {
        id: socket.id,
        name: user.nickname,
        photo: user.photo,
      });
    });

    socket.on("me", (id) => {
      console.log("My ID test:", id);
      setUser({
        ...user,
        id,
      });
    });

    socket.on("users-list", (users) => {
      const filteredUsers = users.filter((u) => u.id !== socket.id);
      console.log("Users list!:", users);

      setUsers(filteredUsers);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  if (!user.nickname || !user.photo) {
    return <Navigate to="/login" />;
  }

  return (
    <RippleBackground>
      <SidebarWithBurgerMenu />
      <div>
        <Typography variant="h1">Welcome, {user.nickname}!</Typography>
        <img
          src={user.photo}
          alt="profile"
          className="w-24 h-24 rounded-full"
        />

        <div className="video-container">
          <div className="video">
            {stream && (
              <video
                className="rounded-lg"
                playsInline
                muted
                ref={myVideo}
                autoPlay
                style={{ width: "900px" }}
              />
            )}
          </div>
        </div>

        <Card className="w-96">
          <CardBody>
            <div className="mb-4 flex items-center justify-between">
              <Typography variant="h5" color="blue-gray" className="">
                Online Users
              </Typography>
            </div>
            <div className="divide-y divide-gray-200">
              {users.map((user, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between pb-3 pt-3 last:pb-0"
                >
                  <div className="flex items-center gap-x-3">
                    <Avatar size="sm" src={user.photo} alt={user.name} />
                    <div>
                      <Typography color="blue-gray" variant="h6">
                        {user.name}
                      </Typography>
                    </div>
                  </div>
                  <Typography color="blue-gray" variant="h6">
                    ${user.id}
                  </Typography>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </RippleBackground>
  );
}

export default Home;
