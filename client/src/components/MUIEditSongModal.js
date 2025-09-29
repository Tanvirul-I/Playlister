import { useContext, useEffect, useMemo, useState } from "react";
import GlobalStoreContext from "../store";
import {
  Box,
  Button,
  Modal,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

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

const modalButtonBaseSx = {
  textTransform: "none",
  borderRadius: "999px",
  fontWeight: 600,
  letterSpacing: "0.01em",
  px: 2.75,
  py: 1,
  transition: "transform 0.18s ease, box-shadow 0.18s ease",
};

const filledButtonSx = {
  ...modalButtonBaseSx,
  background: "linear-gradient(135deg, #3b82f6, #1e3a8a)",
  color: "#f8fafc",
  boxShadow: "0 12px 28px rgba(30, 64, 175, 0.35)",
  ":hover": {
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    boxShadow: "0 18px 34px rgba(29, 78, 216, 0.45)",
    transform: "translateY(-1px)",
  },
};

const outlinedButtonSx = {
  ...modalButtonBaseSx,
  borderColor: "rgba(148, 163, 184, 0.6)",
  color: "#e2e8f0",
  ":hover": {
    borderColor: "rgba(226, 232, 240, 0.8)",
    backgroundColor: "rgba(226, 232, 240, 0.08)",
  },
};

const textFieldSx = {
  "& .MuiOutlinedInput-root": {
    color: "#f8fafc",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 2.5,
    "& fieldset": {
      borderColor: "rgba(148, 163, 184, 0.35)",
    },
    "&:hover fieldset": {
      borderColor: "rgba(226, 232, 240, 0.6)",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#60a5fa",
      boxShadow: "0 0 0 3px rgba(96, 165, 250, 0.25)",
    },
  },
  "& .MuiInputLabel-root": {
    color: "rgba(226, 232, 240, 0.75)",
    "&.Mui-focused": {
      color: "#bfdbfe",
    },
  },
};

export default function MUIEditSongModal() {
  const { store } = useContext(GlobalStoreContext);
  const modalOpen = store.isEditSongModalOpen();
  const currentSong = useMemo(
    () => store.currentSong || { title: "", artist: "", youTubeId: "" },
    [store.currentSong],
  );

  const [title, setTitle] = useState(currentSong.title);
  const [artist, setArtist] = useState(currentSong.artist);
  const [youTubeId, setYouTubeId] = useState(currentSong.youTubeId);

  useEffect(() => {
    if (modalOpen) {
      setTitle(currentSong.title || "");
      setArtist(currentSong.artist || "");
      setYouTubeId(currentSong.youTubeId || "");
    }
  }, [modalOpen, currentSong]);

  function handleConfirmEditSong() {
    const newSongData = {
      title,
      artist,
      youTubeId,
    };
    store.addUpdateSongTransaction(store.currentSongIndex, newSongData);
  }

  function handleCancelEditSong() {
    store.hideModals();
  }

  return (
    <Modal
      open={modalOpen}
      onClose={handleCancelEditSong}
      style={{ zIndex: 1250 }}
    >
      <Box id="edit-song-modal" sx={modalSurfaceSx}>
        <Typography
          id="edit-song-modal-header"
          component="h2"
          variant="h5"
          sx={{ fontWeight: 600, letterSpacing: "0.02em" }}
        >
          Edit Song
        </Typography>
        <Stack id="edit-song-modal-content" spacing={2.5}>
          <TextField
            id="edit-song-modal-title-textfield"
            label="Title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            fullWidth
            sx={textFieldSx}
          />
          <TextField
            id="edit-song-modal-artist-textfield"
            label="Artist"
            value={artist}
            onChange={(event) => setArtist(event.target.value)}
            fullWidth
            sx={textFieldSx}
          />
          <TextField
            id="edit-song-modal-youTubeId-textfield"
            label="YouTube Id"
            value={youTubeId}
            onChange={(event) => setYouTubeId(event.target.value)}
            fullWidth
            sx={textFieldSx}
          />
        </Stack>
        <Stack
          direction="row"
          spacing={2}
          justifyContent="flex-end"
          className="modal-south"
        >
          <Button
            id="edit-song-confirm-button"
            className="modal-button"
            variant="contained"
            onClick={handleConfirmEditSong}
            sx={filledButtonSx}
          >
            Confirm
          </Button>
          <Button
            id="edit-song-cancel-button"
            className="modal-button"
            variant="outlined"
            onClick={handleCancelEditSong}
            sx={outlinedButtonSx}
          >
            Cancel
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
}
