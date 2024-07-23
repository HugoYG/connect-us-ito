import React, { useState } from "react";
import { Card, Input, Button, Typography } from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [nickname, setNickname] = useState("");
  //const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/home");
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewURL = URL.createObjectURL(file);
      setPhotoPreview(previewURL);
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
        <form className="mt-8 mb-2 w-80 max-w-screen-lg sm:w-96">
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

          {photoPreview && (
            <div className="mt-4 flex justify-center">
              <img
                src={photoPreview}
                alt="profile"
                className="w-24 h-24 rounded-full"
              />
            </div>
          )}
          <Button className="mt-6" fullWidth>
            Start chatting
          </Button>
        </form>
      </Card>
    </div>
  );
}

export default Login;
