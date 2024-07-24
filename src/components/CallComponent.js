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
import Peer from "simple-peer";
import { useSocket } from "../context/SocketContext";

export function CallComponent({ currentCall, isVideo, incomingCallData }) {
  const { user } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [stream, setStream] = useState();
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();
  const socket = useSocket();

  const [callData, setCallData] = useState(null);

  useEffect(() => {
    if (user?.id && socket) {
      navigator.mediaDevices
        .getUserMedia({ video: isVideo, audio: true })
        .then((stream) => {
          setStream(stream);
          if (myVideo.current) {
            myVideo.current.srcObject = stream;
          }
        });

      socket.on("call-user", (callData) => {
        setCallData(callData);
        setIsOpen(true);
      });

      socket.on("call-accepted", (signal) => {
        setCallAccepted(true);
        if (connectionRef.current) {
          connectionRef.current.signal(signal);
        }
      });

      return () => {
        socket.off("call-user");
        socket.off("call-accepted");
      };
    }
  }, [user, isVideo, socket]);

  useEffect(() => {
    if (currentCall) {
      setIsOpen(true);
      if (!callData) {
        callUser(currentCall.id);
      } else {
        handleAcceptCall();
      }
    }
  }, [currentCall, callData]);

  const handleAcceptCall = () => {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream,
    });
    peer.on("signal", (data) => {
      socket.emit("answer-call", { signal: data, to: callData.from });
    });
    peer.on("stream", (stream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = stream;
      }
    });

    peer.signal(callData.signal);
    connectionRef.current = peer;
    setCallAccepted(true);
  };

  const callUser = (id) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream,
    });

    setIsCalling(true);

    peer.on("signal", (data) => {
      socket.emit("call-user", {
        userToCall: id,
        signalData: data,
        from: user?.id,
        name: user?.name,
        type: isVideo ? "video" : "audio",
      });
    });

    peer.on("stream", (stream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = stream;
      }
    });

    connectionRef.current = peer;
  };

  const handleClose = () => {
    setCallEnded(true);
    if (connectionRef.current) {
      connectionRef.current.destroy();
    }
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} size="xxl" handler={handleClose}>
      <DialogHeader>
        {isVideo ? "Video Call with" : "Audio Call with"}{" "}
        {currentCall?.name || callData?.name}
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
              ) : isCalling ? (
                <Typography variant="h6">Calling...</Typography>
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
