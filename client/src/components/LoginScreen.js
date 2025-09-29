import { useContext } from "react";
import { useHistory } from "react-router-dom";
import AuthContext from "../auth";
import { GlobalStoreContext } from "../store";
import MUIErrorModal from "./MUIErrorModal";

import Copyright from "./Copyright";

import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

export default function LoginScreen() {
  const { auth } = useContext(AuthContext);
  const { store } = useContext(GlobalStoreContext);
  store.history = useHistory();

  if (auth.loggedIn) {
    store.history.push("/");
    return null;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    try {
      const rememberMeSelected = formData.get("remember") === "remember";

      await auth.loginUser(
        formData.get("email"),
        formData.get("password"),
        rememberMeSelected,
      );
    } catch (e) {
      const message = e?.data?.errorMessage || "Failed to sign in.";
      store.showErrorModal(message);
    }
  };

  return (
    <Box
      component="main"
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: { xs: 6, md: 8 },
        px: { xs: 3, md: 4 },
        background:
          "radial-gradient(circle at top left, rgba(120, 120, 120, 0.16), transparent 52%), radial-gradient(circle at bottom right, rgba(50, 50, 50, 0.2), transparent 60%), linear-gradient(135deg, #050505 0%, #101010 50%, #181818 100%)",
      }}
    >
      <CssBaseline />
      <MUIErrorModal />
      <Container maxWidth="sm" sx={{ px: 0 }}>
        <Paper
          elevation={24}
          sx={{
            px: { xs: 3, sm: 6 },
            py: { xs: 4, sm: 6 },
            borderRadius: 4,
            background: "rgba(18, 18, 18, 0.92)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            boxShadow: "0 34px 68px rgba(0, 0, 0, 0.65)",
            color: "#f5f5f5",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Avatar
              sx={{
                mb: 1.5,
                bgcolor: "rgba(245, 245, 245, 0.12)",
                color: "#f5f5f5",
                border: "1px solid rgba(255, 255, 255, 0.14)",
                boxShadow: "0 18px 36px rgba(0, 0, 0, 0.45)",
              }}
            >
              <LockOutlinedIcon />
            </Avatar>
            <Typography
              component="h1"
              variant="h4"
              sx={{ fontWeight: 600, letterSpacing: "-0.01em" }}
            >
              Welcome Back
            </Typography>
            <Typography
              variant="body1"
              sx={{
                mb: 3.5,
                color: "rgba(229, 229, 229, 0.78)",
                textAlign: "center",
              }}
            >
              Sign in to continue curating and sharing your playlists.
            </Typography>
            <Box
              component="form"
              noValidate
              onSubmit={handleSubmit}
              sx={{ width: "100%" }}
            >
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                InputProps={{
                  sx: {
                    backgroundColor: "rgba(10, 10, 10, 0.92)",
                    borderRadius: 2,
                    input: {
                      color: "#f5f5f5",
                    },
                  },
                }}
                InputLabelProps={{
                  sx: {
                    color: "rgba(229, 229, 229, 0.64)",
                    "&.Mui-focused": {
                      color: "#f5f5f5",
                    },
                  },
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                InputProps={{
                  sx: {
                    backgroundColor: "rgba(10, 10, 10, 0.92)",
                    borderRadius: 2,
                    input: {
                      color: "#f5f5f5",
                    },
                  },
                }}
                InputLabelProps={{
                  sx: {
                    color: "rgba(229, 229, 229, 0.64)",
                    "&.Mui-focused": {
                      color: "#f5f5f5",
                    },
                  },
                }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    name="remember"
                    value="remember"
                    sx={{
                      color: "rgba(229, 229, 229, 0.54)",
                      "&.Mui-checked": {
                        color: "#f5f5f5",
                      },
                    }}
                  />
                }
                label="Remember me"
                sx={{
                  color: "rgba(229, 229, 229, 0.74)",
                  mt: 1,
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  mt: 3,
                  mb: 2,
                  py: 1.5,
                  borderRadius: 999,
                  fontWeight: 600,
                  textTransform: "none",
                  fontSize: "1rem",
                  background: "linear-gradient(140deg, #f5f5f5, #d1d1d1)",
                  color: "#111111",
                  boxShadow: "0 18px 32px rgba(0, 0, 0, 0.45)",
                  ":hover": {
                    background: "linear-gradient(140deg, #ffffff, #e0e0e0)",
                    boxShadow: "0 24px 44px rgba(0, 0, 0, 0.55)",
                  },
                }}
              >
                Sign In
              </Button>
              <Grid container justifyContent="center">
                <Grid item>
                  <Link
                    href="/register"
                    variant="body2"
                    sx={{
                      color: "rgba(229, 229, 229, 0.85)",
                      fontWeight: 600,
                      textDecorationColor: "rgba(229, 229, 229, 0.32)",
                      ":hover": {
                        color: "#ffffff",
                        textDecorationColor: "rgba(255, 255, 255, 0.6)",
                      },
                    }}
                  >
                    {"Don't have an account? Sign Up"}
                  </Link>
                </Grid>
              </Grid>
            </Box>
            <Box sx={{ width: "100%", mt: 5 }}>
              <Copyright sx={{ color: "rgba(229, 229, 229, 0.6)" }} />
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
