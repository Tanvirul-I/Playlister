import { useContext } from "react";
import GlobalStoreContext from "../store";
import * as React from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

const modalSurfaceSx = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: "92vw", sm: 440 },
  bgcolor: "rgba(20, 20, 20, 0.96)",
  borderRadius: 3,
  border: "1px solid rgba(255, 255, 255, 0.08)",
  boxShadow: "0 36px 70px rgba(0, 0, 0, 0.55)",
  p: { xs: 3, sm: 4 },
  display: "flex",
  flexDirection: "column",
  gap: 3,
  color: "#f4f4f4",
  backdropFilter: "blur(12px)",
};

const dismissButtonSx = {
  textTransform: "none",
  borderRadius: "999px",
  fontWeight: 600,
  letterSpacing: "0.01em",
  px: 2.75,
  py: 1,
  background: "linear-gradient(135deg, #3b82f6, #1e3a8a)",
  color: "#f8fafc",
  boxShadow: "0 12px 28px rgba(30, 64, 175, 0.35)",
  transition: "transform 0.18s ease, box-shadow 0.18s ease",
  ":hover": {
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    boxShadow: "0 18px 34px rgba(29, 78, 216, 0.45)",
    transform: "translateY(-1px)",
  },
};

export default function MUIErrorModal() {
  const { store } = useContext(GlobalStoreContext);
  const errorMessage = store.errorMessage;
  function handleCloseModal(event) {
    store.hideModals();
  }

  return (
    <Modal open={errorMessage !== null} style={{ zIndex: 1250 }}>
      <Box sx={modalSurfaceSx}>
        <Stack spacing={2.5}>
          <Typography component="h2" variant="h5" sx={{ fontWeight: 600, letterSpacing: "0.02em" }}>
            Something went wrong
          </Typography>
          <Alert
            severity="error"
            sx={{
              bgcolor: "rgba(239, 68, 68, 0.12)",
              color: "#fecaca",
              borderRadius: 2,
              "& .MuiAlert-icon": { color: "#fca5a5" },
            }}
          >
            {errorMessage}
          </Alert>
          <Button
            variant="contained"
            id="dialog-no-button"
            className="modal-button"
            onClick={handleCloseModal}
            sx={dismissButtonSx}
          >
            Dismiss
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
}
