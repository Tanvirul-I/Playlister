import { useContext, useState } from "react";
import { GlobalStoreContext } from "../store";
import AuthContext from "../auth";
import SongCard from "./SongCard.js";

import { Box, ListItem, TextField, Typography, List, Button, IconButton } from "@mui/material";
import { ExpandMore, ExpandLess, ThumbUp, ThumbDown } from "@mui/icons-material";

/*
    This is a card in our list of playlists. It lets select
    a list for editing and it has controls for changing its
    name or deleting it.

    @author Tanvirul Islam
*/
function ListCard(props) {
  const { store } = useContext(GlobalStoreContext);
  const { auth } = useContext(AuthContext);
  const [editActive, setEditActive] = useState(false);
  const [text, setText] = useState("");
  const { idNamePair } = props;

  const isGuest = !!(auth && auth.user && auth.user.isGuest);
  const isPublished = idNamePair.published !== -1;
  const isCurrentList = !!(store.currentList && store.currentList._id === idNamePair._id);
  const songs = isCurrentList && store.currentList ? store.currentList.songs : [];
  const listensCount = idNamePair?.ratings?.listens ?? 0;
  const likesCount = idNamePair?.ratings?.likes ?? 0;
  const dislikesCount = idNamePair?.ratings?.dislikes ?? 0;
  const likedByUser = Boolean(idNamePair?.viewerHasLiked);
  const dislikedByUser = Boolean(idNamePair?.viewerHasDisliked);

  const getRatingButtonSx = (isActive, activeColor, disabled) => ({
    color: disabled ? "rgba(255, 255, 255, 0.32)" : isActive ? activeColor : "#f5f5f5",
    backgroundColor: disabled
      ? "rgba(255, 255, 255, 0.04)"
      : isActive
        ? `${activeColor}1f`
        : "rgba(255, 255, 255, 0.04)",
    border: `1px solid ${
      disabled
        ? "rgba(255, 255, 255, 0.08)"
        : isActive
          ? `${activeColor}4d`
          : "rgba(255, 255, 255, 0.08)"
    }`,
    transition:
      "transform 0.2s var(--bounceEasing), color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease",
    ":hover": {
      color: disabled ? "rgba(255, 255, 255, 0.32)" : isActive ? activeColor : "#ffffff",
      backgroundColor: disabled
        ? "rgba(255, 255, 255, 0.04)"
        : isActive
          ? `${activeColor}33`
          : "rgba(255, 255, 255, 0.12)",
      borderColor: disabled
        ? "rgba(255, 255, 255, 0.08)"
        : isActive
          ? `${activeColor}66`
          : "rgba(255, 255, 255, 0.18)",
    },
    ":active": {
      transform: "scale(0.9)",
    },
    ":focus-visible": {
      outline: "none",
      boxShadow: `0 0 0 3px ${isActive ? `${activeColor}33` : "rgba(255, 255, 255, 0.2)"}`,
    },
    "&.Mui-disabled": {
      color: "rgba(255, 255, 255, 0.32)",
      backgroundColor: "rgba(255, 255, 255, 0.04)",
      borderColor: "rgba(255, 255, 255, 0.08)",
      boxShadow: "none",
    },
  });

  const expandButtonSx = {
    background: "linear-gradient(135deg, #202020, #101010)",
    color: "#f5f5f5",
    alignSelf: "center",
    boxShadow: "0 18px 34px rgba(0,0,0,0.5)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    transition: "background 0.2s ease, transform 0.2s ease, border-color 0.2s ease",
    ":hover": {
      color: "#ffffff",
      background: "linear-gradient(135deg, #292929, #161616)",
      borderColor: "rgba(255, 255, 255, 0.18)",
      transform: "scale(1.05)",
    },
  };

  function handleLoadList(event, id) {
    if (!event.target.disabled) {
      store.setCurrentList(id);
    }
  }

  function handleEditList(event) {
    event.stopPropagation();
    store.toggleListEdit(true);
  }

  function handleDuplicateList(event) {
    event.stopPropagation();
    store.duplicateList();
  }

  function handleCloseList() {
    store.closeCurrentList();
  }

  function handleToggleEdit(event) {
    event.stopPropagation();
    toggleEdit();
  }

  function handleCardDoubleClick(event) {
    if (isGuest) {
      return;
    }

    handleToggleEdit(event);
  }

  function toggleEdit() {
    const newActive = !editActive;
    if (newActive) {
      store.setIsListNameEditActive();
    }
    setEditActive(newActive);
  }

  async function handleDeleteList(event, id) {
    event.stopPropagation();
    store.markListForDeletion(id);
  }

  function handleLikeList(event, id) {
    event.stopPropagation();
    store.likePlaylist(id);
  }

  function handleDislikeList(event, id) {
    event.stopPropagation();
    store.dislikePlaylist(id);
  }

  function handleKeyPress(event) {
    if (event.code === "Enter") {
      const id = event.target.id.substring("list-".length);
      store.changeListName(id, text);
      toggleEdit();
    }
  }

  function handleUpdateText(event) {
    setText(event.target.value);
  }

  function handleToggleExpand(event) {
    event.stopPropagation();
    if (isCurrentList) {
      handleCloseList();
    } else {
      handleLoadList(event, idNamePair._id);
    }
  }

  const renderHeader = () => (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 1.25,
      }}
    >
      <Typography
        variant="h4"
        component="h3"
        sx={{
          flexGrow: 1,
          fontSize: "1.9rem",
          letterSpacing: "0.01em",
          color: "#ffffff",
        }}
      >
        {idNamePair.name}
      </Typography>
      {isPublished && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.25,
            }}
          >
            <IconButton
              disableRipple
              disableFocusRipple
              onMouseDown={(event) => event.stopPropagation()}
              onClick={(event) => handleLikeList(event, idNamePair._id)}
              disabled={isGuest}
              sx={getRatingButtonSx(likedByUser, "#4ade80", isGuest)}
            >
              <ThumbUp
                sx={{
                  fontSize: "2rem",
                  color: likedByUser ? "#4ade80" : undefined,
                }}
              />
            </IconButton>
            <Typography
              variant="h6"
              component="span"
              sx={{
                minWidth: "2ch",
                textAlign: "center",
                color: "#d7fbe1",
              }}
            >
              {likesCount}
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.25,
            }}
          >
            <IconButton
              disableRipple
              disableFocusRipple
              onMouseDown={(event) => event.stopPropagation()}
              onClick={(event) => handleDislikeList(event, idNamePair._id)}
              disabled={isGuest}
              sx={getRatingButtonSx(dislikedByUser, "#f87171", isGuest)}
            >
              <ThumbDown
                sx={{
                  fontSize: "2rem",
                  color: dislikedByUser ? "#f87171" : undefined,
                }}
              />
            </IconButton>
            <Typography
              variant="h6"
              component="span"
              sx={{
                minWidth: "2ch",
                textAlign: "center",
                color: "#fde4e4",
              }}
            >
              {dislikesCount}
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );

  const renderMetaRow = () => {
    if (!isPublished) {
      return null;
    }

    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        <Typography variant="h6" sx={{ color: "rgba(240, 240, 240, 0.72)" }}>
          Published: {new Date(idNamePair.published).toLocaleString()}
        </Typography>
        <Typography variant="h6" sx={{ color: "rgba(240, 240, 240, 0.72)" }}>
          Listens: {listensCount}
        </Typography>
      </Box>
    );
  };

  const renderAuthorRow = () => (
    <Typography variant="h6" sx={{ color: "rgba(240, 240, 240, 0.72)" }}>
      Author: {idNamePair.username}
    </Typography>
  );

  const renderExpandedActions = () => (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
      {!isPublished && (
        <Button
          type="button"
          variant="contained"
          sx={{
            background: "linear-gradient(135deg, #202020, #111111)",
            color: "#f5f5f5",
            boxShadow: "0 16px 30px rgba(0,0,0,0.45)",
            ":hover": {
              background: "linear-gradient(135deg, #2a2a2a, #151515)",
              color: "#ffffff",
              boxShadow: "0 20px 38px rgba(0,0,0,0.55)",
            },
          }}
          disabled={isGuest}
          onClick={handleEditList}
        >
          Edit
        </Button>
      )}
      <Button
        type="button"
        variant="contained"
        sx={{
          background: "linear-gradient(135deg, #202020, #111111)",
          color: "#f5f5f5",
          boxShadow: "0 16px 30px rgba(0,0,0,0.45)",
          ":hover": {
            background: "linear-gradient(135deg, #2a2a2a, #151515)",
            color: "#ffffff",
            boxShadow: "0 20px 38px rgba(0,0,0,0.55)",
          },
        }}
        disabled={isGuest}
        onClick={(event) => handleDeleteList(event, idNamePair._id)}
      >
        Delete
      </Button>
      <Button
        type="button"
        variant="contained"
        sx={{
          background: "linear-gradient(135deg, #202020, #111111)",
          color: "#f5f5f5",
          boxShadow: "0 16px 30px rgba(0,0,0,0.45)",
          ":hover": {
            background: "linear-gradient(135deg, #2a2a2a, #151515)",
            color: "#ffffff",
            boxShadow: "0 20px 38px rgba(0,0,0,0.55)",
          },
        }}
        disabled={isGuest}
        onClick={handleDuplicateList}
      >
        Duplicate
      </Button>
    </Box>
  );

  const hasSongs = Array.isArray(songs) && songs.length > 0;

  const expandedContent = (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1.5 }}>
      <List
        id="playlist-cards"
        disablePadding
        sx={{
          width: "100%",
          backgroundColor: "transparent",
          maxHeight: { xs: "40vh", lg: "45vh" },
          overflowY: "auto",
          pr: 1,
          "& > *:not(style) + *:not(style)": {
            marginTop: "0.75rem",
          },
          scrollbarGutter: "stable both-edges",
        }}
      >
        {hasSongs ? (
          songs.map((song, index) => (
            <SongCard
              id={"playlist-song-" + index}
              key={"playlist-song-" + index}
              index={index}
              song={song}
              type="song"
            />
          ))
        ) : (
          <Typography
            variant="body2"
            sx={{
              paddingY: 1.5,
              paddingX: 0.5,
              color: "rgba(244, 244, 244, 0.6)",
            }}
          >
            Empty Playlist
          </Typography>
        )}
      </List>
      {renderExpandedActions()}
    </Box>
  );

  const baseListItemSx = {
    marginTop: "15px",
    display: "flex",
    alignItems: "flex-start",
    gap: "1.25rem",
    p: 2,
    width: "100%",
    borderRadius: "18px",
    background: "linear-gradient(160deg, rgba(18, 18, 18, 0.95), rgba(6, 6, 6, 0.92))",
    border: "1px solid rgba(255, 255, 255, 0.06)",
    boxShadow: "0 28px 44px rgba(0, 0, 0, 0.45)",
    transition: "transform 0.2s var(--bounceEasing), box-shadow 0.2s ease, border-color 0.2s ease",
    color: "#f5f5f5",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 34px 56px rgba(0, 0, 0, 0.55)",
      borderColor: "rgba(255, 255, 255, 0.14)",
    },
    "& .MuiTypography-root": {
      color: "#f5f5f5",
    },
  };

  const collapsedCard = (
    <ListItem
      id={idNamePair._id}
      key={idNamePair._id}
      sx={baseListItemSx}
      button
      disableRipple
      onDoubleClick={isGuest ? undefined : handleCardDoubleClick}
    >
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        {renderHeader()}
        {renderMetaRow()}
        {renderAuthorRow()}
      </Box>
      <IconButton
        disableRipple
        disableFocusRipple
        onMouseDown={(event) => event.stopPropagation()}
        onClick={handleToggleExpand}
        sx={expandButtonSx}
      >
        <ExpandMore sx={{ fontSize: "2.5rem" }} />
      </IconButton>
    </ListItem>
  );

  const expandedCard = (
    <ListItem
      id={idNamePair._id}
      key={idNamePair._id}
      sx={baseListItemSx}
      button
      disableRipple
      onDoubleClick={isGuest ? undefined : handleCardDoubleClick}
    >
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        {renderHeader()}
        {renderMetaRow()}
        {renderAuthorRow()}
        {expandedContent}
      </Box>
      <IconButton
        disableRipple
        disableFocusRipple
        onMouseDown={(event) => event.stopPropagation()}
        onClick={handleToggleExpand}
        sx={expandButtonSx}
      >
        <ExpandLess sx={{ fontSize: "2.5rem" }} />
      </IconButton>
    </ListItem>
  );

  if (editActive) {
    return (
      <TextField
        margin="normal"
        required
        fullWidth
        id={"list-" + idNamePair._id}
        label="Playlist Name"
        name="name"
        autoComplete="Playlist Name"
        className="list-card"
        onKeyPress={handleKeyPress}
        onChange={handleUpdateText}
        defaultValue={idNamePair.name}
        autoFocus
        sx={{
          "& .MuiOutlinedInput-root": {
            backgroundColor: "rgba(12, 12, 12, 0.9)",
            borderRadius: "16px",
            "& fieldset": {
              borderColor: "rgba(255, 255, 255, 0.22)",
            },
            "&:hover fieldset": {
              borderColor: "rgba(255, 255, 255, 0.38)",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#ffffff",
            },
          },
        }}
        InputProps={{
          sx: {
            color: "#f5f5f5",
            "& .MuiInputBase-input": {
              fontSize: 40,
              color: "#f5f5f5",
            },
          },
        }}
        InputLabelProps={{
          sx: {
            fontSize: 24,
            color: "rgba(245, 245, 245, 0.64)",
            "&.Mui-focused": {
              color: "#ffffff",
            },
          },
        }}
      />
    );
  }

  return isCurrentList ? expandedCard : collapsedCard;
}

export default ListCard;
