import React, { useContext } from "react";
import { GlobalStoreContext } from "../store";

import { Delete } from "@mui/icons-material";
import { Box, Button } from "@mui/material";

function SongCard(props) {
  const { store } = useContext(GlobalStoreContext);
  const { song, index } = props;

  function handleDragStart(event) {
    event.dataTransfer.setData("song", index);
  }

  function handleDragOver(event) {
    event.preventDefault();
  }

  function handleDragEnter(event) {
    event.preventDefault();
  }

  function handleDragLeave(event) {
    event.preventDefault();
  }

  function handleDrop(event) {
    event.preventDefault();
    let targetIndex = index;
    let sourceIndex = Number(event.dataTransfer.getData("song"));

    // UPDATE THE LIST
    store.addMoveSongTransaction(sourceIndex, targetIndex);
  }
  function handleRemoveSong(event) {
    event.preventDefault();
    store.showRemoveSongModal(index, song);
  }
  function handleClick(event) {
    if (store.editingList) {
      if (event.detail === 2) {
        store.showEditSongModal(index, song);
      }
      return;
    }

    if (event.detail === 1 && typeof store.playSongAt === "function") {
      store.playSongAt(index);
    }
  }
  let cardClass = "list-card unselected-list-card";
  return (
    <Button
      key={index}
      id={"song-" + index + "-card"}
      className={cardClass}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      draggable="true"
      onClick={handleClick}
      disableElevation
      sx={{
        justifyContent: "flex-start",
        gap: 1,
        textTransform: "none",
        padding: "0.85rem 1.25rem",
        background: "linear-gradient(135deg, #1f1f1f, #141414)",
        color: "#f4f4f4",
        fontSize: "1.1rem",
        boxShadow: "0 10px 22px rgba(0, 0, 0, 0.3)",
        ":hover": {
          background: "linear-gradient(135deg, #2a2a2a, #1c1c1c)",
          color: "#ffffff",
          boxShadow: "0 14px 28px rgba(0, 0, 0, 0.38)",
        },
      }}
    >
      {index + 1}. {song.title} by {song.artist}
      {store && store.editingList ? (
        <Box sx={{ marginLeft: "auto", display: "flex", alignItems: "center" }}>
          <Delete
            type="button"
            id={"remove-song-" + index}
            onClick={handleRemoveSong}
            sx={{
              color: "#f4f4f4",
              fontSize: "2rem",
              ":hover": {
                color: "#ffffff",
              },
            }}
          />
        </Box>
      ) : null}
    </Button>
  );
}

export default SongCard;
