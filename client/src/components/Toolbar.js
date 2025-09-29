import { useContext } from "react";
import { GlobalStoreContext } from "../store";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import RedoIcon from "@mui/icons-material/Redo";
import UndoIcon from "@mui/icons-material/Undo";
import CloseIcon from "@mui/icons-material/HighlightOff";

/*
    This toolbar is a functional React component that
    manages the undo/redo/close buttons.
    
*/
function Toolbar() {
  const { store } = useContext(GlobalStoreContext);

  function handleAddNewSong() {
    store.addNewSong();
  }
  function handleUndo() {
    store.undo();
  }
  function handleRedo() {
    store.redo();
  }
  function handleClose() {
    store.toggleListEdit(false);
  }
  const modalOpen =
    store.isEditSongModalOpen() ||
    store.isRemoveSongModalOpen() ||
    store.isDeleteListModalOpen() ||
    store.isErrorModalOpen();
  const addSong = !store.canAddNewSong() || modalOpen;
  const undo = !store.canUndo() || modalOpen;
  const redo = !store.canRedo() || modalOpen;
  const close = !store.canClose() || modalOpen;
  return (
    <div id="toolbar">
      <Button
        disabled={addSong}
        id="add-song-button"
        onClick={handleAddNewSong}
        variant="contained"
        disableElevation
        sx={{
          background: "black",
          color: "white",
          ":hover": {
            background: "white",
            color: "black",
          },
        }}
      >
        <AddIcon />
      </Button>
      <Button
        disabled={undo}
        id="undo-button"
        onClick={handleUndo}
        variant="contained"
        disableElevation
        sx={{
          background: "black",
          color: "white",
          ":hover": {
            background: "white",
            color: "black",
          },
        }}
      >
        <UndoIcon />
      </Button>
      <Button
        disabled={redo}
        id="redo-button"
        onClick={handleRedo}
        variant="contained"
        disableElevation
        sx={{
          background: "black",
          color: "white",
          ":hover": {
            background: "white",
            color: "black",
          },
        }}
      >
        <RedoIcon />
      </Button>
      <Button
        disabled={close}
        id="close-button"
        onClick={handleClose}
        variant="contained"
        disableElevation
        sx={{
          background: "black",
          color: "white",
          ":hover": {
            background: "white",
            color: "black",
          },
        }}
      >
        <CloseIcon />
      </Button>
    </div>
  );
}

export default Toolbar;
