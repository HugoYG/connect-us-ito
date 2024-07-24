import React, { useState, useContext, useEffect, useRef } from "react";
import {
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Typography,
} from "@material-tailwind/react";
import AuthContext from "../context/AuthContext";
import { io } from "socket.io-client";

export function CallComponent({ currentCall, isVideo }) {
  const { user } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const socket = useRef(null);

  useEffect(() => {
    socket.current = io("http://localhost:5000");

    socket.current.on("receive-call", (callData) => {
      console.log("Call received:", callData.from);
      console.log("Call received by:", user?.id);
    });

    return () => {
      socket.current.disconnect();
    };
  }, [user]);

  useEffect(() => {
    if (currentCall) {
      setIsOpen(true);
      socket.current.emit("join-call-room", {
        from: user.id,
        to: currentCall.id,
        isVideo,
      });
    }
  }, [currentCall, isVideo, user.id]);

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} size="xxl" handler={handleClose}>
      <DialogHeader>
        {isVideo ? "Video Call with" : "Audio Call with"} {currentCall?.name}
      </DialogHeader>
      <DialogBody>
        <div className="call-content">
          <div>Call content will be here</div>
        </div>
      </DialogBody>
      <DialogFooter>
        <Button
          variant="text"
          color="red"
          onClick={handleClose}
          className="mr-1"
        >
          <span>End Call</span>
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
