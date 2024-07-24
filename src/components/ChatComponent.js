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
import { useSocket } from "../context/SocketContext";

export function ChatComponent({ currentChat }) {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const socket = useSocket();

  useEffect(() => {
    if (socket) {
      socket.on("receive-private-message", (message) => {
        console.log("Message received:", message.from);
        console.log("Message received:", user?.id);

        if (message.from !== user?.id) {
          setMessages((prevMessages) => [...prevMessages, message]);
        }
      });

      return () => {
        socket.off("receive-private-message");
      };
    }
  }, [user, socket]);

  useEffect(() => {
    if (currentChat && socket) {
      setIsOpen(true);
      socket.emit("join-private-room", {
        from: user.id,
        to: currentChat.id,
      });
    }
  }, [currentChat, socket]);

  const handleSendMessage = () => {
    if (message.trim() === "") return;
    const messageData = {
      from: user.id,
      to: currentChat.id,
      content: message,
    };
    socket.emit("send-private-message", messageData);
    setMessages((prevMessages) => [...prevMessages, messageData]);
    setMessage("");
  };

  const handleClose = () => {
    setIsOpen(false);
    setMessages([]);
  };

  return (
    <Dialog open={isOpen} size="xxl" handler={handleClose}>
      <DialogHeader>Chat with {currentChat?.name}</DialogHeader>
      <DialogBody>
        <div className="messages">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`mt-2 flex ${
                msg.from !== user?.id ? "justify-end" : "justify-start"
              }`}
            >
              <Typography
                color="blue-gray"
                className={`p-2 rounded-lg ${
                  msg.from !== user?.id ? "bg-blue-200" : "bg-green-200"
                }`}
              >
                {msg.content}
              </Typography>
            </div>
          ))}
        </div>
        <input
          type="text"
          placeholder="Type a message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && message.trim() !== "") {
              handleSendMessage();
            }
          }}
          className="w-full p-2 mt-2 border border-gray-300 rounded"
        />
      </DialogBody>
      <DialogFooter>
        <Button
          variant="text"
          color="red"
          onClick={handleClose}
          className="mr-1"
        >
          <span>Close</span>
        </Button>
        <Button variant="gradient" color="green" onClick={handleSendMessage}>
          <span>Send</span>
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
