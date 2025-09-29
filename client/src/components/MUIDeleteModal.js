import { useContext } from "react";
import GlobalStoreContext from "../store";
import * as React from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Button from "@mui/material/Button";
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

const confirmButtonSx = {
  textTransform: "none",
  borderRadius: "999px",
  fontWeight: 600,
  letterSpacing: "0.01em",
  px: 2.75,
  py: 1,
  background: "linear-gradient(135deg, #ef4444, #b91c1c)",
  color: "#fef2f2",
  boxShadow: "0 14px 30px rgba(185, 28, 28, 0.45)",
  transition: "transform 0.18s ease, box-shadow 0.18s ease",
  ":hover": {
    background: "linear-gradient(135deg, #dc2626, #991b1b)",
    boxShadow: "0 20px 34px rgba(153, 27, 27, 0.5)",
    transform: "translateY(-1px)",
  },
};

const cancelButtonSx = {
  textTransform: "none",
  borderRadius: "999px",
  fontWeight: 600,
  letterSpacing: "0.01em",
  px: 2.75,
  py: 1,
  color: "#e2e8f0",
  borderColor: "rgba(148, 163, 184, 0.6)",
  ":hover": {
    borderColor: "rgba(226, 232, 240, 0.8)",
    backgroundColor: "rgba(226, 232, 240, 0.08)",
  },
};

export default function MUIDeleteModal() {
  const { store } = useContext(GlobalStoreContext);
  let name = "";
  if (store.listMarkedForDeletion) {
    name = store.listMarkedForDeletion.name;
  }
  function handleDeleteList(event) {
    event.stopPropagation();
    store.deleteMarkedList();
  }
  function handleCloseModal(event) {
    event.stopPropagation();
    store.unmarkListForDeletion();
  }

  return (
    <Modal open={store.listMarkedForDeletion !== null} style={{ zIndex: 1250 }}>
      <Box sx={modalSurfaceSx}>
        <Typography
          component="h2"
          variant="h5"
          sx={{ fontWeight: 600, letterSpacing: "0.02em" }}
        >
          Delete the {name} playlist?
        </Typography>
        <Typography
          sx={{ color: "rgba(226, 232, 240, 0.75)", lineHeight: 1.6 }}
        >
          This action cannot be undone. Are you sure you want to remove this
          playlist permanently?
        </Typography>
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button
            id="dialog-yes-button"
            className="modal-button"
            variant="contained"
            onClick={handleDeleteList}
            sx={confirmButtonSx}
          >
            Confirm
          </Button>
          <Button
            id="dialog-no-button"
            className="modal-button"
            variant="outlined"
            onClick={handleCloseModal}
            sx={cancelButtonSx}
          >
            Cancel
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
}
