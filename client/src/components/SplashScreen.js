import logo from "../logo.png";
import { Button, Stack, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "../auth";
import { GlobalStoreContext } from "../store";
import Copyright from "./Copyright";

const features = [
  {
    title: "Collaborative Playlists",
    description: "Curate songs with friends and keep the vibe going together.",
  },
  {
    title: "Community Feedback",
    description:
      "Like, dislike, and discuss playlists to discover hidden gems.",
  },
  {
    title: "Integrated Player",
    description:
      "Watch the YouTube video for every track without leaving the app.",
  },
];

export default function SplashScreen() {
  const { auth } = useContext(AuthContext);
  const { store } = useContext(GlobalStoreContext);

  const handleContinueAsGuest = () => auth.continueAsGuest(store);

  return (
    <div id="splash-screen">
      <div className="splash-overlay">
        <div className="splash-content">
          <div className="splash-hero">
            <div className="splash-logo-block">
              <img src={logo} alt="Playlister logo" className="splash-logo" />
              <Typography variant="h2" className="splash-title">
                Build Soundtracks Together
              </Typography>
              <Typography variant="h6" className="splash-subtitle">
                Design playlists, collaborate with your community, and enjoy
                every beat in one modern music hub.
              </Typography>
            </div>
            <Stack direction="row" spacing={2} className="splash-actions">
              <Button
                component={Link}
                to="/login"
                variant="contained"
                size="large"
                disableElevation
                className="splash-button splash-button-primary"
              >
                Login
              </Button>
              <Button
                component={Link}
                to="/register"
                variant="outlined"
                size="large"
                className="splash-button splash-button-secondary"
              >
                Create Account
              </Button>
              <Button
                variant="text"
                size="large"
                className="splash-button splash-button-ghost"
                onClick={handleContinueAsGuest}
              >
                Continue as Guest
              </Button>
            </Stack>
          </div>
          <div className="splash-feature-grid">
            {features.map((feature) => (
              <div className="splash-feature-card" key={feature.title}>
                <Typography variant="h6" className="splash-feature-title">
                  {feature.title}
                </Typography>
                <Typography
                  variant="body1"
                  className="splash-feature-description"
                >
                  {feature.description}
                </Typography>
              </div>
            ))}
          </div>
          <Copyright sx={{ mt: 8 }} />
        </div>
      </div>
    </div>
  );
}
