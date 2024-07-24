import React, { useState, useContext, useEffect, useRef } from "react";
import {
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";
import AuthContext from "../context/AuthContext";
import { io } from "socket.io-client";
import Peer from "simple-peer";

export function CallComponent({ currentCall, isVideo }) {
  const { user } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [stream, setStream] = useState();
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();
  const socket = useRef(null);

  useEffect(() => {
    if (user?.id) {
      socket.current = io("http://localhost:5000");

      navigator.mediaDevices
        .getUserMedia({ video: isVideo, audio: true })
        .then((stream) => {
          setStream(stream);
          if (myVideo.current) {
            myVideo.current.srcObject = stream;
          }
        });

      socket.current.on("receive-call", (callData) => {
        console.log("Call received:", callData.from);
        console.log("Call received by:", user?.id);
      });

      return () => {
        socket.current.disconnect();
      };
    }
  }, [user, isVideo]);

  useEffect(() => {
    if (currentCall) {
      setIsOpen(true);
      callUser(currentCall.id);
    }
  }, [currentCall]);

  const callUser = (id) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream,
    });

    peer.on("signal", (data) => {
      socket.current.emit("call-user", {
        userToCall: id,
        signalData: data,
        from: user?.id,
        name: user?.name,
      });
    });

    peer.on("stream", (stream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = stream;
      }
    });

    socket.current.on("callAccepted", (signal) => {
      setCallAccepted(true);
      peer.signal(signal);
    });

    connectionRef.current = peer;
  };

  const handleClose = () => {
    setCallEnded(true);
    connectionRef.current.destroy();
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} size="xxl" handler={handleClose}>
      <DialogHeader>
        {isVideo ? "Video Call with" : "Audio Call with"} {currentCall?.name}
      </DialogHeader>
      <DialogBody>
        <div className="call-content">
          <div className="video-container">
            <div className="video">
              {stream && (
                <video
                  playsInline
                  muted
                  ref={myVideo}
                  autoPlay
                  style={{ width: "300px" }}
                />
              )}
            </div>
            <div className="video">
              {callAccepted && !callEnded ? (
                <video
                  playsInline
                  ref={userVideo}
                  autoPlay
                  style={{ width: "300px" }}
                />
              ) : null}
            </div>
          </div>
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
