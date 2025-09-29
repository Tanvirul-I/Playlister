import React, { useContext } from "react";
import YouTube from "react-youtube";
import { GlobalStoreContext } from "../store";

export default function YoutubePlayer() {
  const { store } = useContext(GlobalStoreContext);
  const playlist = store.currentList ? store.currentList.songs : [];
  const hasSongs = playlist.length > 0;
  const currentIndex = store.currentSongIndex;
  const hasValidIndex = currentIndex > -1 && currentIndex < playlist.length;
  const fallbackIndex = hasSongs ? 0 : -1;
  const activeIndex = hasValidIndex ? currentIndex : fallbackIndex;
  const song = activeIndex > -1 ? playlist[activeIndex] : null;

  const playerOptions = {
    height: "100%",
    width: "100%",
    playerVars: {
      autoplay: 0,
    },
  };

  function onPlayerReady(event) {
    store.setYoutubePlayer(event.target);
    if (store.isPlaying) {
      store.playCurrentSong();
    } else if (song?.youTubeId) {
      event.target.cueVideoById(song.youTubeId);
    }
  }

  function onPlayerStateChange(event) {
    if (!hasSongs) {
      return;
    }

    const playerStatus = event.data;
    if (playerStatus === 0) {
      store.playNextSong();
    } else if (playerStatus === 1) {
      if (store.setIsPlaying) {
        store.setIsPlaying(true);
      }
    } else if (playerStatus === 2) {
      if (store.setIsPlaying) {
        store.setIsPlaying(false);
      }
    }
  }

  return (
    <YouTube
      videoId={song?.youTubeId}
      opts={playerOptions}
      onReady={onPlayerReady}
      onStateChange={onPlayerStateChange}
    />
  );
}
