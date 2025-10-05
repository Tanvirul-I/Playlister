import { useContext } from "react";
import { GlobalStoreContext } from "../store";
import AuthContext from "../auth";

import { Toolbar as MuiToolbar, Button, Box, AppBar, IconButton } from "@mui/material";
import { Add, Redo, Undo, HighlightOff } from "@mui/icons-material";

export default function EditToolbar() {
  const { store } = useContext(GlobalStoreContext);
  const { auth } = useContext(AuthContext);

  const isGuest = auth && auth.user && auth.user.isGuest;
  const hasCurrentList = !!store.currentList;

  const handleAddNewSong = () => {
    store.addNewSong();
  };

  const handleUndo = () => {
    store.undo();
  };

  const handleRedo = () => {
    store.redo();
  };

  const handleClose = () => {
    store.toggleListEdit(false);
  };

  const handleDeleteList = () => {
    if (hasCurrentList) {
      store.markListForDeletion(store.currentList._id);
    }
  };

  const handleDuplicateList = () => {
    if (hasCurrentList) {
      store.duplicateList();
    }
  };

  const handlePublishList = () => {
    if (hasCurrentList) {
      store.publishList();
    }
  };

  const modalOpen =
    store.isEditSongModalOpen() ||
    store.isRemoveSongModalOpen() ||
    store.isDeleteListModalOpen() ||
    store.isErrorModalOpen();

  const disableAddSong = !store.canAddNewSong() || modalOpen;
  const disableUndo = !store.canUndo() || modalOpen;
  const disableRedo = !store.canRedo() || modalOpen;
  const disableClose = !store.canClose() || modalOpen;

  const disableListManagement = isGuest || !hasCurrentList;

  return (
    <Box sx={{ flex: "0 0 auto" }} id="edit-toolbar">
      <AppBar
        position="static"
        sx={{
          background: "linear-gradient(135deg, #1d1d1d, #0f0f0f)",
          borderRadius: "12px",
          boxShadow: "0 18px 32px rgba(0,0,0,0.35)",
        }}
        elevation={0}
      >
        <MuiToolbar
          sx={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexWrap: "wrap",
            }}
          >
            <Button
              variant="contained"
              onClick={handleDeleteList}
              disabled={disableListManagement}
              sx={{
                background: "linear-gradient(135deg, #2d2d2d, #151515)",
                color: "#f4f4f4",
                textTransform: "none",
                boxShadow: "0 12px 24px rgba(0,0,0,0.35)",
                ":hover": {
                  background: "linear-gradient(135deg, #363636, #1c1c1c)",
                  boxShadow: "0 16px 30px rgba(0,0,0,0.45)",
                },
              }}
            >
              Delete
            </Button>
            <Button
              variant="contained"
              onClick={handleDuplicateList}
              disabled={disableListManagement}
              sx={{
                background: "linear-gradient(135deg, #f5f5f5, #dcdcdc)",
                color: "#111111",
                textTransform: "none",
                boxShadow: "0 12px 24px rgba(0,0,0,0.25)",
                ":hover": {
                  background: "linear-gradient(135deg, #ffffff, #e6e6e6)",
                  boxShadow: "0 16px 30px rgba(0,0,0,0.35)",
                },
              }}
            >
              Duplicate
            </Button>
            <Button
              variant="contained"
              onClick={handlePublishList}
              disabled={disableListManagement}
              sx={{
                background: "linear-gradient(135deg, #2a2a2a, #141414)",
                color: "#f4f4f4",
                textTransform: "none",
                boxShadow: "0 12px 24px rgba(0,0,0,0.35)",
                ":hover": {
                  background: "linear-gradient(135deg, #333333, #1b1b1b)",
                  boxShadow: "0 16px 30px rgba(0,0,0,0.45)",
                },
              }}
            >
              Publish
            </Button>
          </Box>
          {store.editingList && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                marginLeft: "auto",
                flexWrap: "wrap",
              }}
            >
              <IconButton
                disabled={disableAddSong}
                onClick={handleAddNewSong}
                sx={{
                  background: disableAddSong
                    ? "rgba(255, 255, 255, 0.08)"
                    : "linear-gradient(135deg, #f5f5f5, #dedede)",
                  color: disableAddSong ? "rgba(255, 255, 255, 0.38)" : "#111111",
                  boxShadow: disableAddSong ? "none" : "0 10px 20px rgba(0,0,0,0.25)",
                  ":hover": {
                    bgcolor: disableAddSong ? "rgba(255, 255, 255, 0.08)" : undefined,
                    background: disableAddSong
                      ? "rgba(255, 255, 255, 0.08)"
                      : "linear-gradient(135deg, #ffffff, #e6e6e6)",
                    boxShadow: disableAddSong ? "none" : "0 14px 26px rgba(0,0,0,0.35)",
                  },
                }}
              >
                <Add />
              </IconButton>
              <IconButton
                disabled={disableUndo}
                onClick={handleUndo}
                sx={{
                  background: disableUndo
                    ? "rgba(255, 255, 255, 0.08)"
                    : "linear-gradient(135deg, #2c2c2c, #141414)",
                  color: disableUndo ? "rgba(255, 255, 255, 0.38)" : "#f4f4f4",
                  boxShadow: disableUndo ? "none" : "0 10px 20px rgba(0,0,0,0.3)",
                  ":hover": {
                    bgcolor: disableUndo ? "rgba(255, 255, 255, 0.08)" : undefined,
                    background: disableUndo
                      ? "rgba(255, 255, 255, 0.08)"
                      : "linear-gradient(135deg, #333333, #1b1b1b)",
                    boxShadow: disableUndo ? "none" : "0 14px 26px rgba(0,0,0,0.4)",
                  },
                }}
              >
                <Undo />
              </IconButton>
              <IconButton
                disabled={disableRedo}
                onClick={handleRedo}
                sx={{
                  background: disableRedo
                    ? "rgba(255, 255, 255, 0.08)"
                    : "linear-gradient(135deg, #2c2c2c, #141414)",
                  color: disableRedo ? "rgba(255, 255, 255, 0.38)" : "#f4f4f4",
                  boxShadow: disableRedo ? "none" : "0 10px 20px rgba(0,0,0,0.3)",
                  ":hover": {
                    bgcolor: disableRedo ? "rgba(255, 255, 255, 0.08)" : undefined,
                    background: disableRedo
                      ? "rgba(255, 255, 255, 0.08)"
                      : "linear-gradient(135deg, #333333, #1b1b1b)",
                    boxShadow: disableRedo ? "none" : "0 14px 26px rgba(0,0,0,0.4)",
                  },
                }}
              >
                <Redo />
              </IconButton>
              <IconButton
                disabled={disableClose}
                onClick={handleClose}
                sx={{
                  background: disableClose
                    ? "rgba(255, 255, 255, 0.08)"
                    : "linear-gradient(135deg, #2c2c2c, #141414)",
                  color: disableClose ? "rgba(255, 255, 255, 0.38)" : "#f4f4f4",
                  boxShadow: disableClose ? "none" : "0 10px 20px rgba(0,0,0,0.3)",
                  ":hover": {
                    bgcolor: disableClose ? "rgba(255, 255, 255, 0.08)" : undefined,
                    background: disableClose
                      ? "rgba(255, 255, 255, 0.08)"
                      : "linear-gradient(135deg, #333333, #1b1b1b)",
                    boxShadow: disableClose ? "none" : "0 14px 26px rgba(0,0,0,0.4)",
                  },
                }}
              >
                <HighlightOff />
              </IconButton>
            </Box>
          )}
        </MuiToolbar>
      </AppBar>
    </Box>
  );
}
