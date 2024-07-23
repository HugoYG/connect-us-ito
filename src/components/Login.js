import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import { Card, Typography, Input, Button } from "@material-tailwind/react";

function Login() {
  const [nickname, setNickname] = useState("");
  const [photo, setPhoto] = useState(null);
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setUser({ nickname, photo, id: null });
    navigate("/home");
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card color="transparent" shadow={false}>
        <Typography variant="h4" color="blue-gray">
          Connect Us
        </Typography>
        <Typography color="gray" className="mt-1 font-normal">
          Welcome to start Connect Us by Focus.
        </Typography>
        <form
          className="mt-8 mb-2 w-80 max-w-screen-lg sm:w-96"
          onSubmit={handleSubmit}
        >
          <div className="mb-1 flex flex-col gap-6">
            <Input
              size="lg"
              label="Your Nickname"
              value={nickname}
              required
              onChange={(e) => setNickname(e.target.value)}
            />
          </div>

          <div className="mb-1 flex flex-col gap-6 mt-8">
            <Input
              type="file"
              variant="static"
              size="lg"
              accept="image/*"
              label="Your Profile Photo"
              required
              onChange={handlePhotoChange}
            />
          </div>

          {photo && (
            <div className="mt-4 flex justify-center">
              <img
                src={photo}
                alt="profile"
                className="w-24 h-24 rounded-full"
              />
            </div>
          )}
          <Button className="mt-6" fullWidth type="submit">
            Start chatting
          </Button>
        </form>
      </Card>
    </div>
  );
}

export default Login;
