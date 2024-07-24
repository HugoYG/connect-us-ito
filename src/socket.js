import { io } from "socket.io-client";

export const URL = "http://192.168.0.44:5000";

export const createSocket = () => {
  return io(URL);
};
