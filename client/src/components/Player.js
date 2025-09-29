import { useContext, useEffect, useState } from "react";
import { Button, Typography } from "@mui/material";
import { SkipNext, SkipPrevious, Pause, PlayArrow } from "@mui/icons-material";
import YoutubePlayer from "./YoutubePlayer";
import CommentsPanel from "./CommentsPanel";
import { GlobalStoreContext } from "../store";

export default function Player() {
  const { store } = useContext(GlobalStoreContext);
  const [showComments, setShowComments] = useState(false);

  const hasPlaylist = !!store.currentList;
  const hasSongs =
    hasPlaylist && Array.isArray(store.currentList.songs)
      ? store.currentList.songs.length > 0
      : false;
  const playingSongs = store.songsPlaying ? store.songsPlaying.songs : [];
  const currentIndex = store.songsPlaying ? store.songsPlaying.index : -1;
  const currentSong =
    Array.isArray(playingSongs) &&
    currentIndex >= 0 &&
    currentIndex < playingSongs.length
      ? playingSongs[currentIndex]
      : null;

  const activePlaylist = hasPlaylist
    ? store.currentList.name
    : "No Playlist Playing";
  const songPosition = currentSong ? currentIndex + 1 : "N/A";
  const songTitle = currentSong ? currentSong.title : "No Song Playing";
  const songAuthor = currentSong ? currentSong.artist : "N/A";
  const isPlaying = !!store.isPlaying;

  const handleShowPlayer = () => {
    setShowComments(false);
  };

  const handleShowComments = () => {
    if (hasPlaylist) {
      setShowComments(true);
    }
  };

  useEffect(() => {
    if (!store.currentList && showComments) {
      setShowComments(false);
    }
  }, [store.currentList, showComments]);

  const handleSubmitComment = async (text) => {
    if (!hasPlaylist || !store.addComment) {
      return false;
    }
    return store.addComment(store.currentList._id, text);
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      if (typeof store.pauseCurrentSong === "function") {
        store.pauseCurrentSong();
      }
    } else if (hasSongs && typeof store.playCurrentSong === "function") {
      store.playCurrentSong();
    }
  };

  const handleNext = () => {
    if (hasSongs && typeof store.playNextSong === "function") {
      store.playNextSong();
    }
  };

  const handlePrevious = () => {
    if (hasSongs && typeof store.playPreviousSong === "function") {
      store.playPreviousSong();
    }
  };

  const activeToggleStyles = {
    backgroundColor: "#f0f0f0",
    backgroundImage: "linear-gradient(135deg, #fefefe, #dcdcdc)",
    color: "#101010",
    boxShadow: "0 14px 28px rgba(0, 0, 0, 0.28)",
  };

  const inactiveToggleStyles = {
    backgroundColor: "#212121",
    backgroundImage: "linear-gradient(135deg, #2f2f2f, #151515)",
    color: "#f5f5f5",
    boxShadow: "0 12px 24px rgba(0, 0, 0, 0.35)",
  };

  const sharedToggleStyles = {
    flex: 1,
    minWidth: "140px",
    paddingY: 1,
    fontWeight: 600,
    letterSpacing: "0.03em",
    textTransform: "none",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    ":hover": {
      transform: "translateY(-2px)",
    },
    "&.Mui-disabled": {
      backgroundColor: "#1a1a1a",
      backgroundImage: "linear-gradient(135deg, #262626, #121212)",
      color: "rgba(255, 255, 255, 0.35)",
      boxShadow: "none",
    },
  };

  const playerButtonStyles = {
    ...(showComments ? inactiveToggleStyles : activeToggleStyles),
    ...sharedToggleStyles,
    ":hover": {
      ...sharedToggleStyles[":hover"],
      backgroundColor: showComments ? "#2e2e2e" : "#f6f6f6",
      backgroundImage: showComments
        ? "linear-gradient(135deg, #353535, #1c1c1c)"
        : "linear-gradient(135deg, #ffffff, #e3e3e3)",
    },
  };

  const commentButtonStyles = {
    ...(showComments ? activeToggleStyles : inactiveToggleStyles),
    ...sharedToggleStyles,
    ":hover": {
      ...sharedToggleStyles[":hover"],
      backgroundColor: showComments ? "#f6f6f6" : "#2e2e2e",
      backgroundImage: showComments
        ? "linear-gradient(135deg, #ffffff, #e3e3e3)"
        : "linear-gradient(135deg, #353535, #1c1c1c)",
    },
  };

  return (
    <div className="youtube-player">
      <div className="player-toggle-row">
        <Button
          variant="contained"
          disableElevation
          sx={playerButtonStyles}
          onClick={handleShowPlayer}
        >
          Player
        </Button>
        <Button
          variant="contained"
          disableElevation
          sx={commentButtonStyles}
          onClick={handleShowComments}
          disabled={!hasPlaylist}
        >
          Comments
        </Button>
      </div>
      <div className="player-content">
        {showComments ? (
          <CommentsPanel onSubmit={handleSubmitComment} />
        ) : (
          <div className="player-video-wrapper">
            <YoutubePlayer />
          </div>
        )}
      </div>
      {!showComments && (
        <div className="player-buttons">
          <Button
            onClick={handlePrevious}
            disabled={!hasSongs}
            sx={{
              minWidth: "56px",
              minHeight: "56px",
              background: "linear-gradient(135deg, #2c2c2c, #151515)",
              color: "#f4f4f4",
              borderRadius: "50%",
              boxShadow: "0 12px 24px rgba(0,0,0,0.35)",
              ":hover": {
                background: "linear-gradient(135deg, #353535, #1c1c1c)",
                color: "#ffffff",
                boxShadow: "0 16px 30px rgba(0,0,0,0.45)",
              },
            }}
          >
            <SkipPrevious sx={{ fontSize: "2rem" }} />
          </Button>
          <Button
            onClick={handleTogglePlay}
            disabled={!hasSongs && !isPlaying}
            sx={{
              minWidth: "56px",
              minHeight: "56px",
              background: "linear-gradient(135deg, #2c2c2c, #151515)",
              color: "#f4f4f4",
              borderRadius: "50%",
              boxShadow: "0 12px 24px rgba(0,0,0,0.35)",
              ":hover": {
                background: "linear-gradient(135deg, #353535, #1c1c1c)",
                color: "#ffffff",
                boxShadow: "0 16px 30px rgba(0,0,0,0.45)",
              },
            }}
          >
            {isPlaying ? (
              <Pause sx={{ fontSize: "2rem" }} />
            ) : (
              <PlayArrow sx={{ fontSize: "2rem" }} />
            )}
          </Button>
          <Button
            onClick={handleNext}
            disabled={!hasSongs}
            sx={{
              minWidth: "56px",
              minHeight: "56px",
              background: "linear-gradient(135deg, #2c2c2c, #151515)",
              color: "#f4f4f4",
              borderRadius: "50%",
              boxShadow: "0 12px 24px rgba(0,0,0,0.35)",
              ":hover": {
                background: "linear-gradient(135deg, #353535, #1c1c1c)",
                color: "#ffffff",
                boxShadow: "0 16px 30px rgba(0,0,0,0.45)",
              },
            }}
          >
            <SkipNext sx={{ fontSize: "2rem" }} />
          </Button>
        </div>
      )}

      <div className="player-header">
        <Typography variant="h5" component="h2">
          Now Playing
        </Typography>
      </div>

      <div className="youtube-player-info">
        <Typography variant="body1">
          {`Playing: ${activePlaylist}\nSong #: ${songPosition}\nTitle: ${songTitle}\nAuthor: ${songAuthor}`}
        </Typography>
      </div>
    </div>
  );
}
