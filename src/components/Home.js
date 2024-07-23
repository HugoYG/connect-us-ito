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

  const [stream, setStream] = useState();
  const myVideo = useRef();

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
      <div className="container">
        <div className="welcome">
          <SidebarWithBurgerMenu />
          <Typography variant="h1">Welcome, {user.nickname}!</Typography>
        </div>

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

        <Card className="card-container">
          <CardBody>
            <div className="card-title">
              <Typography variant="h5" color="blue-gray">
                Online Users
              </Typography>
            </div>
            <div className="user-list">
              {users.map((user, index) => (
                <div key={index} className="user-item">
                  <div className="user-info">
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
                  <Typography color="blue-gray" className="user-id">
                    {user.id}
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
