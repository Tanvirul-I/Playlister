import React, { useContext, useEffect, useState } from "react";
import { GlobalStoreContext } from "../store";
import AuthContext from "../auth";
import SongCard from "./SongCard.js";
import ListCard from "./ListCard.js";
import MUIEditSongModal from "./MUIEditSongModal.js";
import MUIRemoveSongModal from "./MUIRemoveSongModal.js";
import MUIDeleteModal from "./MUIDeleteModal";

import AddIcon from "@mui/icons-material/Add";
import Fab from "@mui/material/Fab";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import { Box } from "@mui/material";
/*
    This React component lists all the playlister lists in the UI.
    
    @author Tanvirul Islam
*/
const HomeScreen = () => {
  const { store } = useContext(GlobalStoreContext);
  const { auth } = useContext(AuthContext);
  const isGuest = Boolean(auth?.user?.isGuest);
  const [hasInitializedLists, setHasInitializedLists] = useState(false);

  useEffect(() => {
    if (hasInitializedLists) {
      return;
    }

    if (!store || typeof store.loadIdNamePairs !== "function") {
      return;
    }

    setHasInitializedLists(true);
    store.loadIdNamePairs();
  }, [store, hasInitializedLists]);

  if (!store) {
    return null;
  }

  const handleCreateNewList = async () => {
    await store.createNewList();
  };

  const listItems = Array.isArray(store.idNamePairs) ? store.idNamePairs : [];

  let modalJSX = null;
  if (
    typeof store.isEditSongModalOpen === "function" &&
    store.isEditSongModalOpen()
  ) {
    modalJSX = <MUIEditSongModal />;
  } else if (
    typeof store.isRemoveSongModalOpen === "function" &&
    store.isRemoveSongModalOpen()
  ) {
    modalJSX = <MUIRemoveSongModal />;
  } else if (
    typeof store.isDeleteListModalOpen === "function" &&
    store.isDeleteListModalOpen()
  ) {
    modalJSX = <MUIDeleteModal />;
  }

  if (store.editingList && store.currentList) {
    return (
      <div id="playlist-selector">
        <div id="list-selector-list">
          <Box className="song-list">
            {store.currentList.songs.map((song, index) => (
              <SongCard
                id={`playlist-song-${index}`}
                key={`playlist-song-${index}`}
                index={index}
                song={song}
              />
            ))}
          </Box>
          {modalJSX}
        </div>
        <div id="list-selector-footer">
          <Typography variant="h2">Your Lists</Typography>
        </div>
      </div>
    );
  }

  return (
    <div id="playlist-selector">
      <div id="list-selector-list">
        <List
          sx={{
            width: "100%",
            alignSelf: "stretch",
            bgcolor: "transparent",
            padding: 0,
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          {listItems.map((pair) => (
            <ListCard key={pair._id} idNamePair={pair} selected={false} />
          ))}
        </List>
      </div>
      <div id="list-selector-footer">
        <Fab
          color="primary"
          aria-label="add"
          id="add-list-button"
          onClick={handleCreateNewList}
          sx={{
            background: "#f5f5f5",
            color: "#111111",
            boxShadow: "0 18px 32px rgba(0, 0, 0, 0.45)",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
            ":hover": {
              bgcolor: "#111111",
              color: "#f5f5f5",
              transform: "translateY(-2px)",
              boxShadow: "0 24px 44px rgba(0, 0, 0, 0.55)",
            },
            "&.Mui-disabled": {
              background: "rgba(255, 255, 255, 0.12)",
              color: "rgba(255, 255, 255, 0.35)",
              border: "1px solid rgba(255, 255, 255, 0.18)",
              boxShadow: "none",
              transform: "none",
            },
          }}
          disabled={isGuest}
        >
          <AddIcon />
        </Fab>
        <Typography variant="h2">Your Lists</Typography>
      </div>
      {modalJSX}
    </div>
  );
};

export default HomeScreen;
