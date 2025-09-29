import { createContext, useContext, useState } from "react";
import { useHistory } from "react-router-dom";
import jsTPS from "../common/jsTPS";
import api from "./store-request-api";
import CreateSong_Transaction from "../transactions/CreateSong_Transaction";
import MoveSong_Transaction from "../transactions/MoveSong_Transaction";
import RemoveSong_Transaction from "../transactions/RemoveSong_Transaction";
import UpdateSong_Transaction from "../transactions/UpdateSong_Transaction";
import AuthContext from "../auth";
/*
    This is our global data store. Note that it uses the Flux design pattern,
    which makes use of things like actions and reducers. 
    
    @author Tanvirul Islam
*/

// THIS IS THE CONTEXT WE'LL USE TO SHARE OUR STORE
export const GlobalStoreContext = createContext({});

// THESE ARE ALL THE TYPES OF UPDATES TO OUR GLOBAL
// DATA STORE STATE THAT CAN BE PROCESSED
export const GlobalStoreActionType = {
  CHANGE_LIST_NAME: "CHANGE_LIST_NAME",
  CLOSE_CURRENT_LIST: "CLOSE_CURRENT_LIST",
  CREATE_NEW_LIST: "CREATE_NEW_LIST",
  LOAD_ID_NAME_PAIRS: "LOAD_ID_NAME_PAIRS",
  FILTER_ID_NAME_PAIRS: "FILTER_ID_NAME_PAIRS",
  MARK_LIST_FOR_DELETION: "MARK_LIST_FOR_DELETION",
  UNMARK_LIST_FOR_DELETION: "UNMARK_LIST_FOR_DELETION",
  SET_CURRENT_LIST: "SET_CURRENT_LIST",
  SET_LIST_NAME_EDIT_ACTIVE: "SET_LIST_NAME_EDIT_ACTIVE",
  EDIT_SONG: "EDIT_SONG",
  REMOVE_SONG: "REMOVE_SONG",
  ERROR: "ERROR",
  HIDE_MODALS: "HIDE_MODALS",
  TOGGLE_LIST_EDIT: "TOGGLE_LIST_EDIT",
};

// WE'LL NEED THIS TO PROCESS TRANSACTIONS
const tps = new jsTPS();

const CurrentModal = {
  NONE: "NONE",
  DELETE_LIST: "DELETE_LIST",
  EDIT_SONG: "EDIT_SONG",
  REMOVE_SONG: "REMOVE_SONG",
  ERROR: "ERROR",
};

const SortType = {
  NAME_ASC: "NAME_ASC",
  PUBLISH_NEWEST: "PUBLISH_NEWEST",
  LISTENS_DESC: "LISTENS_DESC",
  LIKES_DESC: "LIKES_DESC",
  DISLIKES_DESC: "DISLIKES_DESC",
};

const cloneSongs = (songs) =>
  Array.isArray(songs) ? songs.map((song) => ({ ...song })) : [];

const normalizeSongIndex = (songs, index) => {
  if (!Array.isArray(songs) || songs.length === 0) {
    return -1;
  }

  const parsedIndex = typeof index === "number" ? index : 0;
  if (!Number.isFinite(parsedIndex)) {
    return -1;
  }

  if (parsedIndex < 0) {
    return 0;
  }

  if (parsedIndex >= songs.length) {
    return songs.length - 1;
  }

  return parsedIndex;
};

const getPlayerVideoId = (player) => {
  if (!player || typeof player.getVideoData !== "function") {
    return null;
  }

  try {
    const data = player.getVideoData();
    return data && typeof data.video_id === "string" ? data.video_id : null;
  } catch (error) {
    console.log("FAILED TO READ VIDEO DATA", error);
    return null;
  }
};

const safelyInvokePlayer = (player, methodName, ...args) => {
  if (!player || typeof player[methodName] !== "function") {
    return false;
  }

  try {
    player[methodName](...args);
    return true;
  } catch (error) {
    console.warn(`FAILED TO CALL PLAYER METHOD: ${methodName}`, error);
    return false;
  }
};

// WITH THIS WE'RE MAKING OUR GLOBAL DATA STORE
// AVAILABLE TO THE REST OF THE APPLICATION
function GlobalStoreContextProvider(props) {
  // THESE ARE ALL THE THINGS OUR DATA STORE WILL MANAGE
  const [store, setStore] = useState({
    currentModal: CurrentModal.NONE,
    idNamePairs: [],
    allIdNamePairs: [],
    currentList: null,
    currentSongIndex: -1,
    currentSong: null,
    isPlaying: false,
    youtubePlayer: null,
    newListCounter: 0,
    listNameActive: false,
    listIdMarkedForDeletion: null,
    listMarkedForDeletion: null,
    errorMessage: null,
    editingList: false,
    sortType: SortType.NAME_ASC,
    sortLoc: "home",
    searchTerm: "",
    registeredListens: [],
  });
  const history = useHistory();

  // SINCE WE'VE WRAPPED THE STORE IN THE AUTH CONTEXT WE CAN ACCESS THE USER HERE
  const { auth } = useContext(AuthContext);
  const isGuestUser = () => !!(auth && auth.user && auth.user.isGuest);

  const applyPlaylistRatingUpdate = (updatedPlaylist) => {
    if (!updatedPlaylist) {
      return;
    }

    setStore((prevStore) => {
      const updatePairs = (pairs) => {
        if (!Array.isArray(pairs)) {
          return pairs;
        }
        return pairs.map((pair) => {
          if (pair._id === updatedPlaylist._id) {
            return { ...pair, ...updatedPlaylist };
          }
          return pair;
        });
      };

      const shouldUpdateCurrent =
        prevStore.currentList &&
        prevStore.currentList._id === updatedPlaylist._id;

      return {
        ...prevStore,
        idNamePairs: updatePairs(prevStore.idNamePairs),
        allIdNamePairs: updatePairs(prevStore.allIdNamePairs),
        currentList: shouldUpdateCurrent
          ? { ...prevStore.currentList, ...updatedPlaylist }
          : prevStore.currentList,
      };
    });
  };

  const hasRegisteredListen = (candidateStore, playlistId) => {
    if (!candidateStore || !playlistId) {
      return false;
    }

    const registrations = Array.isArray(candidateStore.registeredListens)
      ? candidateStore.registeredListens
      : [];

    return registrations.includes(playlistId);
  };

  const registerPlaylistListen = async (playlistId, ownedByCurrentUser) => {
    if (!playlistId || !auth.user || !auth.user.email) {
      return;
    }

    if (isGuestUser()) {
      return;
    }

    if (ownedByCurrentUser) {
      return;
    }

    if (hasRegisteredListen(store, playlistId)) {
      return;
    }

    try {
      const response = await api.incrementPlaylistListen(playlistId);
      if (response.data.success) {
        applyPlaylistRatingUpdate(response.data.playlist);
        setStore((prevStore) => {
          if (hasRegisteredListen(prevStore, playlistId)) {
            return prevStore;
          }

          const registrations = Array.isArray(prevStore.registeredListens)
            ? prevStore.registeredListens
            : [];

          return {
            ...prevStore,
            registeredListens: [...registrations, playlistId],
          };
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  // HERE'S THE DATA STORE'S REDUCER, IT MUST
  // HANDLE EVERY TYPE OF STATE CHANGE
  const storeReducer = (action) => {
    const { type, payload } = action;
    switch (type) {
      // LIST UPDATE OF ITS NAME
      case GlobalStoreActionType.CHANGE_LIST_NAME: {
        return setStore({
          ...store,
          currentModal: CurrentModal.NONE,
          idNamePairs: payload.idNamePairs,
          allIdNamePairs: payload.allIdNamePairs
            ? payload.allIdNamePairs
            : store.allIdNamePairs,
          currentList: null,
          currentSongIndex: -1,
          currentSong: null,
          isPlaying: false,
          listNameActive: false,
          listIdMarkedForDeletion: null,
          listMarkedForDeletion: null,
          errorMessage: null,
          editingList: store.editingList,
          sortType:
            payload.sortType !== undefined ? payload.sortType : store.sortType,
          sortLoc: store.sortLoc,
          searchTerm:
            payload.searchTerm !== undefined
              ? payload.searchTerm
              : store.searchTerm,
        });
      }
      // STOP EDITING THE CURRENT LIST
      case GlobalStoreActionType.CLOSE_CURRENT_LIST: {
        return setStore({
          ...store,
          currentModal: CurrentModal.NONE,
          idNamePairs: store.idNamePairs,
          allIdNamePairs: store.allIdNamePairs,
          currentList: null,
          currentSongIndex: -1,
          currentSong: null,
          isPlaying: false,
          listNameActive: false,
          listIdMarkedForDeletion: null,
          listMarkedForDeletion: null,
          errorMessage: null,
          editingList: store.editingList,
          sortType:
            payload.sortType !== undefined ? payload.sortType : store.sortType,
          sortLoc: store.sortLoc,
          searchTerm: store.searchTerm,
          songsPlaying: {
            songs: [],
            index: -1,
          },
        });
      }
      // CREATE A NEW LIST
      case GlobalStoreActionType.CREATE_NEW_LIST: {
        return setStore({
          ...store,
          currentModal: CurrentModal.NONE,
          idNamePairs: store.idNamePairs,
          allIdNamePairs: store.allIdNamePairs,
          currentList: payload,
          currentSongIndex: -1,
          currentSong: null,
          isPlaying: false,
          newListCounter: store.newListCounter + 1,
          listNameActive: false,
          listIdMarkedForDeletion: null,
          listMarkedForDeletion: null,
          errorMessage: null,
          editingList: store.editingList,
          sortType:
            payload.sortType !== undefined ? payload.sortType : store.sortType,
          sortLoc: store.sortLoc,
          searchTerm: store.searchTerm,
        });
      }
      // GET ALL THE LISTS SO WE CAN PRESENT THEM
      case GlobalStoreActionType.LOAD_ID_NAME_PAIRS: {
        return setStore({
          ...store,
          currentModal: CurrentModal.NONE,
          idNamePairs: payload.idNamePairs,
          allIdNamePairs: payload.allIdNamePairs
            ? payload.allIdNamePairs
            : store.allIdNamePairs,
          currentList: null,
          currentSongIndex: -1,
          currentSong: null,
          isPlaying: false,
          listNameActive: false,
          listIdMarkedForDeletion: null,
          listMarkedForDeletion: null,
          errorMessage: null,
          editingList: store.editingList,
          sortType:
            payload.sortType !== undefined ? payload.sortType : store.sortType,
          sortLoc: store.sortLoc,
          searchTerm:
            payload.searchTerm !== undefined
              ? payload.searchTerm
              : store.searchTerm,
        });
      }
      case GlobalStoreActionType.FILTER_ID_NAME_PAIRS: {
        return setStore({
          currentModal: store.currentModal,
          idNamePairs: payload.idNamePairs,
          allIdNamePairs: payload.allIdNamePairs
            ? payload.allIdNamePairs
            : store.allIdNamePairs,
          currentList: store.currentList,
          currentSongIndex: store.currentSongIndex,
          currentSong: store.currentSong,
          newListCounter: store.newListCounter,
          listNameActive: store.listNameActive,
          listIdMarkedForDeletion: store.listIdMarkedForDeletion,
          listMarkedForDeletion: store.listMarkedForDeletion,
          errorMessage: store.errorMessage,
          editingList: store.editingList,
          sortType: store.sortType,
          sortLoc: store.sortLoc,
          searchTerm:
            payload.searchTerm !== undefined
              ? payload.searchTerm
              : store.searchTerm,
          registeredListens: store.registeredListens,
        });
      }
      // PREPARE TO DELETE A LIST
      case GlobalStoreActionType.MARK_LIST_FOR_DELETION: {
        return setStore({
          ...store,
          currentModal: CurrentModal.DELETE_LIST,
          idNamePairs: store.idNamePairs,
          allIdNamePairs: store.allIdNamePairs,
          currentList: null,
          currentSongIndex: -1,
          currentSong: null,
          isPlaying: false,
          listNameActive: false,
          listIdMarkedForDeletion: payload.id,
          listMarkedForDeletion: payload.playlist,
          errorMessage: null,
          editingList: store.editingList,
          sortType: store.sortType,
          sortLoc: store.sortLoc,
          searchTerm: store.searchTerm,
        });
      }
      // REMOVE DELETE LIST
      case GlobalStoreActionType.UNMARK_LIST_FOR_DELETION: {
        return setStore({
          ...store,
          currentModal: CurrentModal.NONE,
          idNamePairs: store.idNamePairs,
          allIdNamePairs: store.allIdNamePairs,
          currentSongIndex: -1,
          currentSong: null,
          isPlaying: false,
          listNameActive: false,
          listIdMarkedForDeletion: null,
          listMarkedForDeletion: null,
          errorMessage: null,
          editingList: null,
          sortType: store.sortType,
          sortLoc: store.sortLoc,
          searchTerm: store.searchTerm,
        });
      }
      // UPDATE A LIST
      case GlobalStoreActionType.SET_CURRENT_LIST: {
        const sourceSongs = Array.isArray(payload?.songs) ? payload.songs : [];
        const songs = cloneSongs(sourceSongs);
        const nextIndex = normalizeSongIndex(
          sourceSongs,
          store.currentSongIndex,
        );
        const nextSong = nextIndex > -1 ? sourceSongs[nextIndex] : null;
        const shouldKeepPlaying = nextIndex > -1 && store.isPlaying;

        return setStore({
          ...store,
          currentModal: CurrentModal.NONE,
          idNamePairs: store.idNamePairs,
          allIdNamePairs: store.allIdNamePairs,
          currentList: payload,
          currentSongIndex: nextIndex,
          currentSong: nextSong,
          isPlaying: shouldKeepPlaying,
          listNameActive: false,
          listIdMarkedForDeletion: null,
          listMarkedForDeletion: null,
          errorMessage: null,
          editingList: store.editingList,
          sortType: store.sortType,
          sortLoc: store.sortLoc,
          searchTerm: store.searchTerm,
          songsPlaying: {
            songs,
            index: nextIndex,
          },
        });
      }
      // START EDITING A LIST NAME
      case GlobalStoreActionType.SET_LIST_NAME_EDIT_ACTIVE: {
        return setStore({
          ...store,
          currentModal: CurrentModal.NONE,
          idNamePairs: store.idNamePairs,
          allIdNamePairs: store.allIdNamePairs,
          currentList: payload,
          currentSongIndex: -1,
          currentSong: null,
          isPlaying: false,
          listNameActive: true,
          listIdMarkedForDeletion: null,
          listMarkedForDeletion: null,
          errorMessage: null,
          editingList: store.editingList,
          sortType: store.sortType,
          sortLoc: store.sortLoc,
          searchTerm: store.searchTerm,
        });
      }
      //
      case GlobalStoreActionType.EDIT_SONG: {
        return setStore({
          ...store,
          currentModal: CurrentModal.EDIT_SONG,
          idNamePairs: store.idNamePairs,
          allIdNamePairs: store.allIdNamePairs,
          currentList: store.currentList,
          currentSongIndex: payload.currentSongIndex,
          currentSong: payload.currentSong,
          listNameActive: false,
          listIdMarkedForDeletion: null,
          listMarkedForDeletion: null,
          errorMessage: null,
          editingList: store.editingList,
          sortType: store.sortType,
          sortLoc: store.sortLoc,
          searchTerm: store.searchTerm,
        });
      }
      case GlobalStoreActionType.REMOVE_SONG: {
        return setStore({
          ...store,
          currentModal: CurrentModal.REMOVE_SONG,
          idNamePairs: store.idNamePairs,
          allIdNamePairs: store.allIdNamePairs,
          currentList: store.currentList,
          currentSongIndex: payload.currentSongIndex,
          currentSong: payload.currentSong,
          listNameActive: false,
          listIdMarkedForDeletion: null,
          listMarkedForDeletion: null,
          errorMessage: null,
          editingList: store.editingList,
          sortType: store.sortType,
          sortLoc: store.sortLoc,
          searchTerm: store.searchTerm,
        });
      }
      case GlobalStoreActionType.ERROR: {
        return setStore({
          ...store,
          currentModal: CurrentModal.ERROR,
          idNamePairs: store.idNamePairs,
          allIdNamePairs: store.allIdNamePairs,
          currentList: store.currentList,
          currentSongIndex: -1,
          currentSong: null,
          isPlaying: false,
          listNameActive: false,
          listIdMarkedForDeletion: null,
          listMarkedForDeletion: null,
          errorMessage: payload.message,
          editingList: store.editingList,
          sortType: store.sortType,
          sortLoc: store.sortLoc,
          searchTerm: store.searchTerm,
        });
      }
      case GlobalStoreActionType.HIDE_MODALS: {
        return setStore({
          ...store,
          currentModal: CurrentModal.NONE,
          idNamePairs: store.idNamePairs,
          allIdNamePairs: store.allIdNamePairs,
          currentList: store.currentList,
          currentSongIndex: -1,
          currentSong: null,
          isPlaying: false,
          listNameActive: false,
          listIdMarkedForDeletion: null,
          listMarkedForDeletion: null,
          errorMessage: null,
          editingList: store.editingList,
          sortType: store.sortType,
          sortLoc: store.sortLoc,
          searchTerm: store.searchTerm,
        });
      }
      case GlobalStoreActionType.TOGGLE_LIST_EDIT: {
        return setStore({
          ...store,
          currentModal: CurrentModal.NONE,
          idNamePairs: store.idNamePairs,
          allIdNamePairs: store.allIdNamePairs,
          currentList: store.currentList,
          currentSongIndex: -1,
          currentSong: null,
          isPlaying: false,
          listNameActive: false,
          listIdMarkedForDeletion: null,
          listMarkedForDeletion: null,
          errorMessage: null,
          editingList: payload,
          sortType: store.sortType,
          sortLoc: store.sortLoc,
          searchTerm: store.searchTerm,
        });
      }
      default:
        return store;
    }
  };

  const filterPairsBySearch = (pairs, searchTerm, location) => {
    const sourcePairs = Array.isArray(pairs) ? pairs : [];
    const normalizedTerm = searchTerm ? searchTerm.trim().toLowerCase() : "";

    if (normalizedTerm.length === 0) {
      return [...sourcePairs];
    }

    return sourcePairs.filter((pair) => {
      const name = pair.name ? pair.name.toLowerCase() : "";
      const username = pair.username ? pair.username.toLowerCase() : "";

      switch (location) {
        case "person":
          return username.includes(normalizedTerm);
        case "groups":
          return (
            name.includes(normalizedTerm) || username.includes(normalizedTerm)
          );
        case "home":
        default:
          return name.includes(normalizedTerm);
      }
    });
  };

  const sortPairsByType = (pairs, sortType) => {
    const sortablePairs = Array.isArray(pairs) ? [...pairs] : [];

    const compareNames = (a, b) => {
      const nameA = typeof a?.name === "string" ? a.name : "";
      const nameB = typeof b?.name === "string" ? b.name : "";

      return nameA.localeCompare(nameB, undefined, {
        sensitivity: "base",
      });
    };

    const getPublishedValue = (pair) => {
      const value = typeof pair?.published === "number" ? pair.published : -1;
      return value >= 0 ? value : -Infinity;
    };

    const getRatingValue = (pair, key) => {
      const ratingContainer = pair && pair.ratings ? pair.ratings : null;
      const ratingValue = ratingContainer ? ratingContainer[key] : undefined;

      return typeof ratingValue === "number" ? ratingValue : 0;
    };

    switch (sortType) {
      case SortType.PUBLISH_NEWEST:
        sortablePairs.sort((a, b) => {
          const difference = getPublishedValue(b) - getPublishedValue(a);
          return difference !== 0 ? difference : compareNames(a, b);
        });
        break;
      case SortType.LISTENS_DESC:
        sortablePairs.sort((a, b) => {
          const difference =
            getRatingValue(b, "listens") - getRatingValue(a, "listens");
          return difference !== 0 ? difference : compareNames(a, b);
        });
        break;
      case SortType.LIKES_DESC:
        sortablePairs.sort((a, b) => {
          const difference =
            getRatingValue(b, "likes") - getRatingValue(a, "likes");
          return difference !== 0 ? difference : compareNames(a, b);
        });
        break;
      case SortType.DISLIKES_DESC:
        sortablePairs.sort((a, b) => {
          const difference =
            getRatingValue(b, "dislikes") - getRatingValue(a, "dislikes");
          return difference !== 0 ? difference : compareNames(a, b);
        });
        break;
      case SortType.NAME_ASC:
      default:
        sortablePairs.sort((a, b) => compareNames(a, b));
        break;
    }

    return sortablePairs;
  };

  const normalizeSortType = (sortKey) => {
    const sortValues = Object.values(SortType);
    return sortValues.includes(sortKey) ? sortKey : SortType.NAME_ASC;
  };

  const applyPairsToStore = (
    pairsArray,
    location,
    searchTermOverride,
    sortTypeOverride,
  ) => {
    const targetLocation = location || store.sortLoc;
    const overrideTerm =
      typeof searchTermOverride === "string"
        ? searchTermOverride
        : store.searchTerm;
    const effectiveSortType = normalizeSortType(
      sortTypeOverride || store.sortType,
    );
    const sortedPairs = sortPairsByType(pairsArray, effectiveSortType);
    const filteredPairs = filterPairsBySearch(
      sortedPairs,
      overrideTerm,
      targetLocation,
    );

    storeReducer({
      type: GlobalStoreActionType.LOAD_ID_NAME_PAIRS,
      payload: {
        idNamePairs: filteredPairs,
        allIdNamePairs: sortedPairs,
        searchTerm: overrideTerm,
        sortType: effectiveSortType,
      },
    });
  };

  store.loadHomeLists = function (searchTermOverride, sortOverride) {
    if (isGuestUser()) {
      store.sortLoc = "groups";
      store.loadCommunityLists(searchTermOverride, sortOverride);
      return;
    }
    async function asyncLoadHomeLists() {
      try {
        const effectiveSort = normalizeSortType(sortOverride || store.sortType);
        const response = await api.getHomePlaylists(effectiveSort);

        if (response.data.success) {
          store.sortLoc = "home";
          store.sortType = effectiveSort;
          applyPairsToStore(
            response.data.idNamePairs,
            "home",
            searchTermOverride,
            effectiveSort,
          );
        } else {
          console.log("API FAILED TO GET THE HOME LISTS");
        }
      } catch (error) {
        console.log("FAILED TO LOAD HOME PLAYLISTS", error);
      }
    }

    asyncLoadHomeLists();
  };

  store.loadCommunityLists = function (searchTermOverride, sortOverride) {
    async function asyncLoadCommunityLists() {
      try {
        const effectiveSort = normalizeSortType(sortOverride || store.sortType);
        const response = await api.getCommunityPlaylists(effectiveSort);

        if (response.data.success) {
          store.sortLoc = "groups";
          store.sortType = effectiveSort;
          applyPairsToStore(
            response.data.idNamePairs,
            "groups",
            searchTermOverride,
            effectiveSort,
          );
        } else {
          console.log("API FAILED TO GET COMMUNITY LISTS");
        }
      } catch (error) {
        console.log("FAILED TO LOAD COMMUNITY PLAYLISTS", error);
      }
    }

    asyncLoadCommunityLists();
  };

  store.loadUserLists = function (username, sortOverride) {
    const overrideTerm =
      typeof username === "string" ? username : store.searchTerm;
    const normalizedUser = overrideTerm ? overrideTerm.trim() : "";

    async function asyncLoadUserLists() {
      try {
        let response;
        const effectiveSort = normalizeSortType(sortOverride || store.sortType);

        if (normalizedUser.length > 0) {
          response = await api.getUserPlaylists(normalizedUser, effectiveSort);
        } else {
          response = await api.getCommunityPlaylists(effectiveSort);
        }

        if (response.data.success) {
          store.sortLoc = "person";
          store.sortType = effectiveSort;
          const effectiveTerm =
            typeof overrideTerm === "string" ? overrideTerm : "";
          applyPairsToStore(
            response.data.idNamePairs,
            "person",
            effectiveTerm,
            effectiveSort,
          );
        } else {
          console.log("API FAILED TO GET USER LISTS");
        }
      } catch (error) {
        console.log("FAILED TO LOAD USER PLAYLISTS", error);
      }
    }

    asyncLoadUserLists();
  };

  const playSongAtIndex = (index) => {
    const songs = Array.isArray(store.currentList?.songs)
      ? store.currentList.songs
      : [];

    if (songs.length === 0) {
      return;
    }

    const normalizedIndex = normalizeSongIndex(songs, index);
    if (normalizedIndex === -1) {
      return;
    }

    const song = songs[normalizedIndex];
    const videoId = song?.youTubeId ?? "";
    const hasVideo = videoId.length > 0;

    if (
      store.currentSongIndex === -1 &&
      store.currentList &&
      store.currentList._id
    ) {
      registerPlaylistListen(
        store.currentList._id,
        Boolean(store.currentList.ownedByCurrentUser),
      );
    }

    if (store.youtubePlayer) {
      if (hasVideo) {
        const activeVideoId = getPlayerVideoId(store.youtubePlayer);
        if (
          activeVideoId === videoId &&
          store.currentSongIndex === normalizedIndex
        ) {
          safelyInvokePlayer(store.youtubePlayer, "playVideo");
        } else {
          safelyInvokePlayer(store.youtubePlayer, "loadVideoById", videoId);
        }
      } else {
        safelyInvokePlayer(store.youtubePlayer, "stopVideo");
      }
    }

    const clonedSongs = cloneSongs(songs);
    setStore((prevStore) => ({
      ...prevStore,
      currentSongIndex: normalizedIndex,
      currentSong: song,
      isPlaying: hasVideo,
      songsPlaying: {
        songs: clonedSongs,
        index: normalizedIndex,
      },
    }));
  };

  store.setYoutubePlayer = (player) => {
    store.youtubePlayer = player;
    setStore((prevStore) => ({
      ...prevStore,
      youtubePlayer: player,
    }));
  };

  store.clearYoutubePlayer = () => {
    store.youtubePlayer = null;
    setStore((prevStore) => ({
      ...prevStore,
      youtubePlayer: null,
      isPlaying: false,
      songsPlaying: {
        songs: prevStore.songsPlaying?.songs ?? [],
        index: -1,
      },
    }));
  };

  store.setIsPlaying = (isPlaying) => {
    setStore((prevStore) => ({
      ...prevStore,
      isPlaying,
    }));
  };

  store.playCurrentSong = function () {
    const songs = Array.isArray(store.currentList?.songs)
      ? store.currentList.songs
      : [];
    if (songs.length === 0) {
      return;
    }

    let index = store.currentSongIndex;
    if (index < 0 || index >= songs.length) {
      index = 0;
    }
    playSongAtIndex(index);
  };

  store.pauseCurrentSong = function () {
    safelyInvokePlayer(store.youtubePlayer, "pauseVideo");
    setStore((prevStore) => ({
      ...prevStore,
      isPlaying: false,
      songsPlaying: {
        songs: prevStore.songsPlaying?.songs ?? [],
        index: prevStore.currentSongIndex,
      },
    }));
  };

  store.playNextSong = function () {
    const songs = Array.isArray(store.currentList?.songs)
      ? store.currentList.songs
      : [];
    if (songs.length === 0) {
      return;
    }

    if (store.currentSongIndex === -1) {
      playSongAtIndex(0);
      return;
    }

    const nextIndex = (store.currentSongIndex + 1) % songs.length;
    playSongAtIndex(nextIndex);
  };

  store.playPreviousSong = function () {
    const songs = Array.isArray(store.currentList?.songs)
      ? store.currentList.songs
      : [];
    if (songs.length === 0) {
      return;
    }

    if (store.currentSongIndex === -1) {
      playSongAtIndex(songs.length - 1);
      return;
    }

    const previousIndex =
      (store.currentSongIndex - 1 + songs.length) % songs.length;
    playSongAtIndex(previousIndex);
  };

  store.playSongAt = (index) => {
    playSongAtIndex(index);
  };

  // THESE ARE THE FUNCTIONS THAT WILL UPDATE OUR STORE AND
  // DRIVE THE STATE OF THE APPLICATION. WE'LL CALL THESE IN
  // RESPONSE TO EVENTS INSIDE OUR COMPONENTS.

  // THIS FUNCTION PROCESSES CHANGING A LIST NAME
  store.changeListName = function (id, newName) {
    // GET THE LIST
    async function asyncChangeListName(id) {
      let response = await api.getPlaylistById(id);
      if (response.data.success) {
        let playlist = response.data.playlist;
        playlist.name = newName;
        async function updateList(playlist) {
          response = await api.updatePlaylistById(playlist._id, playlist);
          if (response.data.success) {
            async function getListPairs(playlist) {
              response = await api.getHomePlaylists();
              if (response.data.success) {
                let pairsArray = response.data.idNamePairs;
                const filteredPairs = filterPairsBySearch(
                  pairsArray,
                  store.searchTerm,
                  store.sortLoc,
                );
                storeReducer({
                  type: GlobalStoreActionType.CHANGE_LIST_NAME,
                  payload: {
                    idNamePairs: filteredPairs,
                    allIdNamePairs: pairsArray,
                    searchTerm: store.searchTerm,
                  },
                });
                history.push("/");
              }
            }
            getListPairs(playlist);
          }
        }
        updateList(playlist);
      }
    }
    asyncChangeListName(id);
  };

  // THIS FUNCTION PROCESSES CLOSING THE CURRENTLY LOADED LIST
  store.closeCurrentList = function () {
    store.pauseCurrentSong();
    storeReducer({
      type: GlobalStoreActionType.CLOSE_CURRENT_LIST,
      payload: {},
    });
    tps.clearAllTransactions();
  };

  // THIS FUNCTION CREATES A NEW LIST
  store.createNewList = async function () {
    if (isGuestUser()) {
      store.showErrorModal("Guest users cannot create playlists.");
      return;
    }
    let newListName = "Untitled";
    const response = await api.createPlaylist({
      name: newListName,
      songs: [],
    });
    if (response.status === 201) {
      tps.clearAllTransactions();
      let newList = response.data.playlist;
      storeReducer({
        type: GlobalStoreActionType.CREATE_NEW_LIST,
        payload: newList,
      });
      const refreshVisiblePlaylists = () => {
        const currentSearch = store.searchTerm;
        const currentSort = store.sortType;

        switch (store.sortLoc) {
          case "person":
            store.loadUserLists(currentSearch, currentSort);
            break;
          case "groups":
            store.loadCommunityLists(currentSearch, currentSort);
            break;
          case "home":
          default:
            store.loadHomeLists(currentSearch, currentSort);
            break;
        }
      };

      refreshVisiblePlaylists();
    } else {
      console.log("API FAILED TO CREATE A NEW LIST");
    }
  };

  store.duplicateList = async function () {
    if (isGuestUser()) {
      store.showErrorModal("Guest users cannot duplicate playlists.");
      return;
    }

    if (!store.currentList) {
      return;
    }

    const duplicatedSongs = Array.isArray(store.currentList.songs)
      ? store.currentList.songs.map((song) => ({
          title: song?.title ?? "",
          artist: song?.artist ?? "",
          youTubeId: song?.youTubeId ?? "",
        }))
      : [];

    const response = await api.createPlaylist({
      name: store.currentList.name,
      songs: duplicatedSongs,
    });

    if (response.status === 201) {
      tps.clearAllTransactions();
      let newList = response.data.playlist;
      storeReducer({
        type: GlobalStoreActionType.CREATE_NEW_LIST,
        payload: newList,
      });
      window.location.reload();
    } else {
      console.log("API FAILED TO CREATE A NEW LIST");
    }
  };

  store.publishList = async function () {
    if (isGuestUser()) {
      store.showErrorModal("Guest users cannot publish playlists.");
      return;
    }

    store.currentList.published = Date.now();

    async function asyncUpdateCurrentList() {
      const response = await api.updatePlaylistById(
        store.currentList._id,
        store.currentList,
      );
      if (response.data.success) {
        window.location.reload();
      }
    }
    asyncUpdateCurrentList();
  };

  // THIS FUNCTION LOADS ALL THE ID, NAME PAIRS SO WE CAN LIST ALL THE LISTS
  store.loadIdNamePairs = function () {
    store.loadHomeLists(store.searchTerm);
  };

  store.filterBySearch = function (searchTerm) {
    const updatedTerm = typeof searchTerm === "string" ? searchTerm : "";

    if (store.sortLoc === "person") {
      store.loadUserLists(updatedTerm);
      return;
    }

    const filteredPairs = filterPairsBySearch(
      store.allIdNamePairs,
      updatedTerm,
      store.sortLoc,
    );

    storeReducer({
      type: GlobalStoreActionType.FILTER_ID_NAME_PAIRS,
      payload: {
        idNamePairs: filteredPairs,
        searchTerm: updatedTerm,
      },
    });
  };

  // THE FOLLOWING 5 FUNCTIONS ARE FOR COORDINATING THE DELETION
  // OF A LIST, WHICH INCLUDES USING A VERIFICATION MODAL. THE
  // FUNCTIONS ARE markListForDeletion, deleteList, deleteMarkedList,
  // showDeleteListModal, and hideDeleteListModal
  store.markListForDeletion = function (id) {
    if (isGuestUser()) {
      store.showErrorModal("Guest users cannot delete playlists.");
      return;
    }
    async function getListToDelete(id) {
      let response = await api.getPlaylistById(id);
      if (response.data.success) {
        let playlist = response.data.playlist;
        storeReducer({
          type: GlobalStoreActionType.MARK_LIST_FOR_DELETION,
          payload: { id: id, playlist: playlist },
        });
      }
    }
    getListToDelete(id);
  };
  store.unmarkListForDeletion = function () {
    tps.clearAllTransactions();
    storeReducer({
      type: GlobalStoreActionType.UNMARK_LIST_FOR_DELETION,
      payload: {},
    });
  };
  store.deleteList = function (id) {
    if (isGuestUser()) {
      return;
    }
    async function processDelete(id) {
      let response = await api.deletePlaylistById(id);
      if (response.data.success) {
        store.loadIdNamePairs();
        history.push("/");
      }
    }
    processDelete(id);
  };
  store.deleteMarkedList = function () {
    store.deleteList(store.listIdMarkedForDeletion);
    store.hideModals();
  };
  // THIS FUNCTION SHOWS THE MODAL FOR PROMPTING THE USER
  // TO SEE IF THEY REALLY WANT TO DELETE THE LIST

  store.showEditSongModal = (songIndex, songToEdit) => {
    storeReducer({
      type: GlobalStoreActionType.EDIT_SONG,
      payload: { currentSongIndex: songIndex, currentSong: songToEdit },
    });
  };
  store.showRemoveSongModal = (songIndex, songToRemove) => {
    storeReducer({
      type: GlobalStoreActionType.REMOVE_SONG,
      payload: { currentSongIndex: songIndex, currentSong: songToRemove },
    });
  };
  store.showErrorModal = (errorMessage) => {
    storeReducer({
      type: GlobalStoreActionType.ERROR,
      payload: { message: errorMessage },
    });
  };
  store.hideModals = () => {
    storeReducer({
      type: GlobalStoreActionType.HIDE_MODALS,
      payload: {},
    });
  };
  store.isDeleteListModalOpen = () => {
    return store.currentModal === CurrentModal.DELETE_LIST;
  };
  store.isEditSongModalOpen = () => {
    return store.currentModal === CurrentModal.EDIT_SONG;
  };
  store.isRemoveSongModalOpen = () => {
    return store.currentModal === CurrentModal.REMOVE_SONG;
  };
  store.isErrorModalOpen = () => {
    return store.currentModal === CurrentModal.ERROR;
  };

  store.toggleListEdit = (toggle) => {
    tps.clearAllTransactions();
    storeReducer({
      type: GlobalStoreActionType.TOGGLE_LIST_EDIT,
      payload: toggle,
    });
  };

  store.isEditingList = () => {
    return !!store.editingList;
  };

  // THE FOLLOWING 8 FUNCTIONS ARE FOR COORDINATING THE UPDATING
  // OF A LIST, WHICH INCLUDES DEALING WITH THE TRANSACTION STACK. THE
  // FUNCTIONS ARE setCurrentList, addMoveItemTransaction, addUpdateItemTransaction,
  // moveItem, updateItem, updateCurrentList, undo, and redo
  store.setCurrentList = function (id) {
    async function asyncSetCurrentList(id) {
      try {
        const response = await api.getPlaylistById(id);
        if (!response.data.success) {
          return;
        }

        const playlist = response.data.playlist;
        const userEmail =
          auth && auth.user && typeof auth.user.email === "string"
            ? auth.user.email
            : null;
        const ownsPlaylist =
          Boolean(playlist?.ownedByCurrentUser) ||
          (!isGuestUser() &&
            userEmail &&
            playlist &&
            playlist.ownerEmail === userEmail);

        if (!ownsPlaylist) {
          storeReducer({
            type: GlobalStoreActionType.SET_CURRENT_LIST,
            payload: playlist,
          });
          return;
        }

        const updateResponse = await api.updatePlaylistById(
          playlist._id,
          playlist,
        );

        if (updateResponse.data.success) {
          storeReducer({
            type: GlobalStoreActionType.SET_CURRENT_LIST,
            payload: playlist,
          });
          return;
        }

        console.log("FAILED TO UPDATE PLAYLIST BEFORE SETTING CURRENT LIST");
        storeReducer({
          type: GlobalStoreActionType.SET_CURRENT_LIST,
          payload: playlist,
        });
      } catch (error) {
        console.log("FAILED TO SET CURRENT LIST", error);
      }
    }
    asyncSetCurrentList(id);
  };

  store.loadComments = async function (playlistId) {
    if (!playlistId) {
      return false;
    }
    try {
      const response = await api.getPlaylistComments(playlistId);
      if (response.data.success) {
        if (store.currentList && store.currentList._id === playlistId) {
          const updatedList = {
            ...store.currentList,
            comments: response.data.comments,
          };
          storeReducer({
            type: GlobalStoreActionType.SET_CURRENT_LIST,
            payload: updatedList,
          });
        }
        return true;
      }
    } catch (error) {
      console.log(error);
    }
    storeReducer({
      type: GlobalStoreActionType.ERROR,
      payload: { message: "Failed to load comments." },
    });
    return false;
  };

  store.likePlaylist = async function (playlistId) {
    if (isGuestUser()) {
      store.showErrorModal("Guest users cannot rate playlists.");
      return false;
    }

    if (!playlistId || !auth.user || !auth.user.email) {
      return false;
    }

    try {
      const response = await api.likePlaylist(playlistId);
      if (response.data.success) {
        applyPlaylistRatingUpdate(response.data.playlist);
        return true;
      }
    } catch (error) {
      console.log(error);
    }

    storeReducer({
      type: GlobalStoreActionType.ERROR,
      payload: { message: "Failed to like playlist." },
    });
    return false;
  };

  store.dislikePlaylist = async function (playlistId) {
    if (isGuestUser()) {
      store.showErrorModal("Guest users cannot rate playlists.");
      return false;
    }

    if (!playlistId || !auth.user || !auth.user.email) {
      return false;
    }

    try {
      const response = await api.dislikePlaylist(playlistId);
      if (response.data.success) {
        applyPlaylistRatingUpdate(response.data.playlist);
        return true;
      }
    } catch (error) {
      console.log(error);
    }

    storeReducer({
      type: GlobalStoreActionType.ERROR,
      payload: { message: "Failed to dislike playlist." },
    });
    return false;
  };

  store.addComment = async function (playlistId, text) {
    if (isGuestUser()) {
      store.showErrorModal("Guest users cannot comment on playlists.");
      return false;
    }
    if (!playlistId) {
      return false;
    }
    const trimmedText = text ? text.trim() : "";
    if (!trimmedText) {
      return false;
    }
    try {
      const response = await api.createPlaylistComment(playlistId, {
        text: trimmedText,
      });
      if (response.data.success) {
        storeReducer({
          type: GlobalStoreActionType.SET_CURRENT_LIST,
          payload: response.data.playlist,
        });
        return true;
      }
    } catch (error) {
      console.log(error);
    }
    storeReducer({
      type: GlobalStoreActionType.ERROR,
      payload: { message: "Failed to post comment." },
    });
    return false;
  };

  store.updateComment = async function (playlistId, commentId, text) {
    if (isGuestUser()) {
      store.showErrorModal("Guest users cannot update comments.");
      return false;
    }
    if (!playlistId || !commentId) {
      return false;
    }
    const trimmedText = text ? text.trim() : "";
    if (!trimmedText) {
      return false;
    }
    try {
      const response = await api.updatePlaylistComment(playlistId, commentId, {
        text: trimmedText,
      });
      if (response.data.success) {
        storeReducer({
          type: GlobalStoreActionType.SET_CURRENT_LIST,
          payload: response.data.playlist,
        });
        return true;
      }
    } catch (error) {
      console.log(error);
    }
    storeReducer({
      type: GlobalStoreActionType.ERROR,
      payload: { message: "Failed to update comment." },
    });
    return false;
  };

  store.deleteComment = async function (playlistId, commentId) {
    if (isGuestUser()) {
      store.showErrorModal("Guest users cannot delete comments.");
      return false;
    }
    if (!playlistId || !commentId) {
      return false;
    }
    try {
      const response = await api.deletePlaylistComment(playlistId, commentId);
      if (response.data.success) {
        storeReducer({
          type: GlobalStoreActionType.SET_CURRENT_LIST,
          payload: response.data.playlist,
        });
        return true;
      }
    } catch (error) {
      console.log(error);
    }
    storeReducer({
      type: GlobalStoreActionType.ERROR,
      payload: { message: "Failed to delete comment." },
    });
    return false;
  };

  store.getPlaylistSize = function () {
    return store.currentList.songs.length;
  };
  store.addNewSong = function () {
    let index = this.getPlaylistSize();
    this.addCreateSongTransaction(index, "Untitled", "?", "dQw4w9WgXcQ");
  };
  // THIS FUNCTION CREATES A NEW SONG IN THE CURRENT LIST
  // USING THE PROVIDED DATA AND PUTS THIS SONG AT INDEX
  store.createSong = function (index, song) {
    let list = store.currentList;
    list.songs.splice(index, 0, song);
    // NOW MAKE IT OFFICIAL
    store.updateCurrentList();
  };
  // THIS FUNCTION MOVES A SONG IN THE CURRENT LIST FROM
  // start TO end AND ADJUSTS ALL OTHER ITEMS ACCORDINGLY
  store.moveSong = function (start, end) {
    let list = store.currentList;

    // WE NEED TO UPDATE THE STATE FOR THE APP
    if (start < end) {
      let temp = list.songs[start];
      for (let i = start; i < end; i++) {
        list.songs[i] = list.songs[i + 1];
      }
      list.songs[end] = temp;
    } else if (start > end) {
      let temp = list.songs[start];
      for (let i = start; i > end; i--) {
        list.songs[i] = list.songs[i - 1];
      }
      list.songs[end] = temp;
    }

    // NOW MAKE IT OFFICIAL
    store.updateCurrentList();
  };
  // THIS FUNCTION REMOVES THE SONG AT THE index LOCATION
  // FROM THE CURRENT LIST
  store.removeSong = function (index) {
    let list = store.currentList;
    list.songs.splice(index, 1);

    // NOW MAKE IT OFFICIAL
    store.updateCurrentList();
  };
  // THIS FUNCTION UPDATES THE TEXT IN THE ITEM AT index TO text
  store.updateSong = function (index, songData) {
    let list = store.currentList;
    let song = list.songs[index];
    song.title = songData.title;
    song.artist = songData.artist;
    song.youTubeId = songData.youTubeId;

    // NOW MAKE IT OFFICIAL
    store.updateCurrentList();
  };
  store.addNewSong = () => {
    let playlistSize = store.getPlaylistSize();
    store.addCreateSongTransaction(
      playlistSize,
      "Untitled",
      "?",
      "dQw4w9WgXcQ",
    );
  };
  // THIS FUNCDTION ADDS A CreateSong_Transaction TO THE TRANSACTION STACK
  store.addCreateSongTransaction = (index, title, artist, youTubeId) => {
    // ADD A SONG ITEM AND ITS NUMBER
    let song = {
      title: title,
      artist: artist,
      youTubeId: youTubeId,
    };
    let transaction = new CreateSong_Transaction(store, index, song);
    tps.addTransaction(transaction);
  };
  store.addMoveSongTransaction = function (start, end) {
    let transaction = new MoveSong_Transaction(store, start, end);
    tps.addTransaction(transaction);
  };
  // THIS FUNCTION ADDS A RemoveSong_Transaction TO THE TRANSACTION STACK
  store.addRemoveSongTransaction = () => {
    let index = store.currentSongIndex;
    let song = store.currentList.songs[index];
    let transaction = new RemoveSong_Transaction(store, index, song);
    tps.addTransaction(transaction);
  };
  store.addUpdateSongTransaction = function (index, newSongData) {
    let song = store.currentList.songs[index];
    let oldSongData = {
      title: song.title,
      artist: song.artist,
      youTubeId: song.youTubeId,
    };
    let transaction = new UpdateSong_Transaction(
      this,
      index,
      oldSongData,
      newSongData,
    );
    tps.addTransaction(transaction);
  };
  store.updateCurrentList = function () {
    async function asyncUpdateCurrentList() {
      const response = await api.updatePlaylistById(
        store.currentList._id,
        store.currentList,
      );
      if (response.data.success) {
        storeReducer({
          type: GlobalStoreActionType.SET_CURRENT_LIST,
          payload: store.currentList,
        });
      }
    }
    asyncUpdateCurrentList();
  };
  store.setSortLoc = function (location) {
    const targetLocation =
      isGuestUser() && location !== "groups" ? "groups" : location;

    store.sortLoc = targetLocation;
    history.push("/");
  };

  store.setSortType = function (sortKey) {
    const nextSortKey = normalizeSortType(sortKey);

    store.sortType = nextSortKey;

    switch (store.sortLoc) {
      case "home":
        store.loadHomeLists(store.searchTerm, nextSortKey);
        break;
      case "groups":
        store.loadCommunityLists(store.searchTerm, nextSortKey);
        break;
      case "person":
        store.loadUserLists(store.searchTerm, nextSortKey);
        break;
      default:
        applyPairsToStore(
          store.allIdNamePairs,
          store.sortLoc,
          store.searchTerm,
          nextSortKey,
        );
        break;
    }

    history.push("/");
  };

  store.undo = function () {
    tps.undoTransaction();
  };
  store.redo = function () {
    tps.doTransaction();
  };
  store.canAddNewSong = function () {
    return store.currentList !== null;
  };
  store.canUndo = function () {
    return store.currentList !== null && tps.hasTransactionToUndo();
  };
  store.canRedo = function () {
    return store.currentList !== null && tps.hasTransactionToRedo();
  };
  store.canClose = function () {
    return store.currentList !== null;
  };

  // THIS FUNCTION ENABLES THE PROCESS OF EDITING A LIST NAME
  store.setIsListNameEditActive = function () {
    storeReducer({
      type: GlobalStoreActionType.SET_LIST_NAME_EDIT_ACTIVE,
      payload: null,
    });
  };

  return (
    <GlobalStoreContext.Provider
      value={{
        store,
      }}
    >
      {props.children}
    </GlobalStoreContext.Provider>
  );
}

export default GlobalStoreContext;
export { GlobalStoreContextProvider };
