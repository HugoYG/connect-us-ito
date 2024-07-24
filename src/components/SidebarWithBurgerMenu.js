import React, { useContext } from "react";
import AuthContext from "../context/AuthContext";

import {
  IconButton,
  Typography,
  List,
  ListItem,
  ListItemPrefix,
  Drawer,
  Card,
  Avatar,
} from "@material-tailwind/react";
import { PowerIcon } from "@heroicons/react/24/solid";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

export function SidebarWithBurgerMenu() {
  const { user, setUser } = useContext(AuthContext);
  const [open, setOpen] = React.useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);

  const handleOpen = (value) => {
    setOpen(open === value ? 0 : value);
  };

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  const handleLogout = () => {
    setUser({
      nickname: null,
      photo: null,
      id: null,
    });
  };

  return (
    <>
      <IconButton
        className="text-black"
        variant="text"
        size="lg"
        onClick={openDrawer}
      >
        {isDrawerOpen ? (
          <XMarkIcon className="h-8 w-8 stroke-2" />
        ) : (
          <Bars3Icon className="h-8 w-8 stroke-2" />
        )}
      </IconButton>

      <Drawer open={isDrawerOpen} onClose={closeDrawer}>
        <Card
          color="transparent"
          shadow={false}
          className="h-[calc(100vh-2rem)] w-full p-4"
        >
          <div className="mb-2 flex items-center gap-4 p-4">
            <Avatar src={user.photo} alt="avatar" />

            <Typography variant="h5" color="blue-gray">
              {user.nickname}
            </Typography>
          </div>
          <List>
            <ListItem onClick={handleLogout}>
              <ListItemPrefix>
                <PowerIcon className="h-5 w-5" />
              </ListItemPrefix>
              Log Out
            </ListItem>
          </List>
        </Card>
      </Drawer>
    </>
  );
}
