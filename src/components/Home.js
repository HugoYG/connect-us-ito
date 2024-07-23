import React, { useEffect, useContext } from "react";
import { io } from "socket.io-client";
import { Navigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";

function Home() {
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const socket = io("http://localhost:5000");

    socket.on("connect", () => {
      console.log("Connected to socket server");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  if (!user.nickname || !user.photo) {
    return <Navigate to="/login" />;
  }

  return (
    <div>
      <h2>Hello, {user.nickname}!</h2>
      <img src={user.photo} alt="profile" className="w-24 h-24 rounded-full" />
    </div>
  );
}

export default Home;
