import { useContext, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AuthContext from "../auth";
import { GlobalStoreContext } from "../store";
import logo from "../logo.png";

import AccountCircle from "@mui/icons-material/AccountCircle";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import { Home, Groups, Person } from "@mui/icons-material";
import SORT_OPTIONS from "../common/sortOptions";

const imageStyle = {
  maxWidth: "140px",
  height: "auto",
};

export default function AppBanner() {
  const { auth } = useContext(AuthContext);
  const { store } = useContext(GlobalStoreContext);
  const [accountAnchorEl, setAccountAnchorEl] = useState(null);
  const [sortAnchorEl, setSortAnchorEl] = useState(null);
  const isAccountMenuOpen = Boolean(accountAnchorEl);
  const isSortMenuOpen = Boolean(sortAnchorEl);

  const activeSelection = store.sortLoc;
  const activeSortType = store.sortType;
  const isGuestUser = Boolean(auth?.user?.isGuest);

  const showWorkspaceControls = useMemo(() => auth.loggedIn, [auth.loggedIn]);

  const accountMenuId = "primary-account-menu";
  const sortMenuId = "primary-sort-menu";

  const handleProfileMenuOpen = (event) => {
    setAccountAnchorEl(event.currentTarget);
  };

  const handleAccountMenuClose = () => {
    setAccountAnchorEl(null);
  };

  const handleLogout = () => {
    handleAccountMenuClose();
    auth.logoutUser();
  };

  const handleViewChange = (type) => {
    const targetType = isGuestUser && type !== "groups" ? "groups" : type;

    store.setSortLoc(targetType);

    switch (targetType) {
      case "home":
        store.loadHomeLists();
        break;
      case "groups":
        store.loadCommunityLists();
        break;
      case "person":
        store.loadUserLists();
        break;
      default:
        break;
    }
  };

  const handleSortMenuClose = () => {
    setSortAnchorEl(null);
  };

  const handleSortSelection = (sortKey) => {
    store.setSortType(sortKey);
    handleSortMenuClose();
  };

  const accountMenuItems = auth.loggedIn
    ? [
        <MenuItem key="logout" onClick={handleLogout}>
          Logout
        </MenuItem>,
      ]
    : [
        <MenuItem key="login" component={Link} to="/login/" onClick={handleAccountMenuClose}>
          Login
        </MenuItem>,
        <MenuItem key="register" component={Link} to="/register/" onClick={handleAccountMenuClose}>
          Create New Account
        </MenuItem>,
      ];

  const accountMenu = (
    <Menu
      anchorEl={accountAnchorEl}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      id={accountMenuId}
      keepMounted
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={isAccountMenuOpen}
      onClose={handleAccountMenuClose}
    >
      {accountMenuItems}
    </Menu>
  );

  const sortMenu = (
    <Menu
      anchorEl={sortAnchorEl}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      id={sortMenuId}
      keepMounted
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={isSortMenuOpen}
      onClose={handleSortMenuClose}
    >
      {SORT_OPTIONS.map((option) => (
        <MenuItem
          key={option.key}
          onClick={() => handleSortSelection(option.key)}
          selected={activeSortType === option.key}
        >
          {option.label}
        </MenuItem>
      ))}
    </Menu>
  );

  const accountIcon = auth.loggedIn ? auth.getUserInitials() : <AccountCircle />;

  return (
    <Box sx={{ width: "100%" }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: "linear-gradient(135deg, #1b1b1b, #090909)",
          paddingX: { xs: 2, lg: 6 },
          paddingY: 1,
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)",
        }}
      >
        <Toolbar
          disableGutters
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 1.5, md: 2 },
            flexWrap: "wrap",
          }}
        >
          <Box component={Link} to="/" sx={{ display: "inline-flex", alignItems: "center" }}>
            <img style={imageStyle} src={logo} alt="Playlister logo" />
          </Box>
          {showWorkspaceControls && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: { xs: 1, md: 1.5 },
                flexWrap: "wrap",
                flex: 1,
              }}
            >
              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", color: "#f4f4f4" }}>
                <IconButton
                  onClick={() => handleViewChange("home")}
                  disabled={isGuestUser}
                  sx={{
                    color: activeSelection === "home" ? "#ffffff" : "rgba(244, 244, 244, 0.75)",
                    backgroundColor:
                      activeSelection === "home" ? "rgba(255, 255, 255, 0.12)" : "transparent",
                    transition: "background-color 0.2s ease, color 0.2s ease, transform 0.2s ease",
                    boxShadow:
                      activeSelection === "home" ? "0 12px 20px rgba(0, 0, 0, 0.35)" : "none",
                    ":hover": {
                      color: "#ffffff",
                      backgroundColor: "rgba(255, 255, 255, 0.12)",
                      transform: "translateY(-1px)",
                    },
                    "&.Mui-disabled": {
                      color: "rgba(244, 244, 244, 0.25)",
                      backgroundColor: "rgba(255, 255, 255, 0.04)",
                      boxShadow: "none",
                    },
                  }}
                >
                  <Home fontSize="medium" />
                </IconButton>
                <IconButton
                  onClick={() => handleViewChange("groups")}
                  sx={{
                    color: activeSelection === "groups" ? "#ffffff" : "rgba(244, 244, 244, 0.75)",
                    backgroundColor:
                      activeSelection === "groups" ? "rgba(255, 255, 255, 0.12)" : "transparent",
                    transition: "background-color 0.2s ease, color 0.2s ease, transform 0.2s ease",
                    boxShadow:
                      activeSelection === "groups" ? "0 12px 20px rgba(0, 0, 0, 0.35)" : "none",
                    ":hover": {
                      color: "#ffffff",
                      backgroundColor: "rgba(255, 255, 255, 0.12)",
                      transform: "translateY(-1px)",
                    },
                  }}
                >
                  <Groups fontSize="medium" />
                </IconButton>
                <IconButton
                  onClick={() => handleViewChange("person")}
                  disabled={isGuestUser}
                  sx={{
                    color: activeSelection === "person" ? "#ffffff" : "rgba(244, 244, 244, 0.75)",
                    backgroundColor:
                      activeSelection === "person" ? "rgba(255, 255, 255, 0.12)" : "transparent",
                    transition: "background-color 0.2s ease, color 0.2s ease, transform 0.2s ease",
                    boxShadow:
                      activeSelection === "person" ? "0 12px 20px rgba(0, 0, 0, 0.35)" : "none",
                    ":hover": {
                      color: "#ffffff",
                      backgroundColor: "rgba(255, 255, 255, 0.12)",
                      transform: "translateY(-1px)",
                    },
                    "&.Mui-disabled": {
                      color: "rgba(244, 244, 244, 0.25)",
                      backgroundColor: "rgba(255, 255, 255, 0.04)",
                      boxShadow: "none",
                    },
                  }}
                >
                  <Person fontSize="medium" />
                </IconButton>
              </Stack>
            </Box>
          )}
          <Box
            sx={{
              marginLeft: "auto",
              marginRight: showWorkspaceControls ? 0 : "0",
            }}
          >
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls={accountMenuId}
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              sx={{
                color: "#f4f4f4",
                background: "rgba(255, 255, 255, 0.12)",
                boxShadow: "0 12px 24px rgba(0, 0, 0, 0.35)",
                ":hover": {
                  background: "rgba(255, 255, 255, 0.18)",
                  transform: "translateY(-1px)",
                },
              }}
            >
              {accountIcon}
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      {accountMenu}
      {showWorkspaceControls && sortMenu}
    </Box>
  );
}
