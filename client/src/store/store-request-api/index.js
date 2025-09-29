/*
    This is our http api, which we use to send requests to
    our back-end API. Note we`re using the Axios library
    for doing this, which is an easy to use AJAX-based
    library. We could (and maybe should) use Fetch, which
    is a native (to browsers) standard, but Axios is easier
    to use when sending JSON back and forth and it`s a Promise-
    based API which helps a lot with asynchronous communication.
    
*/

import axios from "axios";
import { attachCsrfInterceptor } from "../../common/csrf";
axios.defaults.withCredentials = true;
const api = axios.create({
  baseURL: "http://localhost:4000/api",
});
attachCsrfInterceptor(api);

// THESE ARE ALL THE REQUESTS WE`LL BE MAKING, ALL REQUESTS HAVE A
// REQUEST METHOD (like get) AND PATH . SOME ALSO
// REQUIRE AN id SO THAT THE SERVER KNOWS ON WHICH LIST TO DO ITS
// WORK, AND SOME REQUIRE DATA, WHICH WE WE WILL FORMAT HERE, FOR WHEN
// WE NEED TO PUT THINGS INTO THE DATABASE OR IF WE HAVE SOME
// CUSTOM FILTERS FOR QUERIES
export const createPlaylist = (playlistData = {}) => {
  const { name, songs = [] } = playlistData;

  const sanitizedSongs = Array.isArray(songs)
    ? songs.map((song) => ({
        title: song?.title ?? "",
        artist: song?.artist ?? "",
        youTubeId: song?.youTubeId ?? "",
      }))
    : [];

  return api.post(`/playlist/`, {
    // SPECIFY THE PAYLOAD
    name: typeof name === "string" ? name : "",
    songs: sanitizedSongs,
  });
};
export const deletePlaylistById = (id) => api.delete(`/playlist/${id}`);
export const getPlaylistById = (id) => api.get(`/playlist/${id}`);
const buildSortParams = (sortType) => {
  if (!sortType) {
    return {};
  }

  return {
    params: {
      sort: sortType,
    },
  };
};

export const getPlaylistPairs = (sortType) =>
  api.get(`/playlistpairs/`, buildSortParams(sortType));
export const getHomePlaylists = (sortType) =>
  api.get(`/playlistpairs/home`, buildSortParams(sortType));
export const getCommunityPlaylists = (sortType) =>
  api.get(`/playlistpairs/community`, buildSortParams(sortType));
export const getUserPlaylists = (username, sortType) =>
  api.get(
    `/playlistpairs/user/${encodeURIComponent(username)}`,
    buildSortParams(sortType),
  );
export const updatePlaylistById = (id, playlist) => {
  return api.put(`/playlist/${id}`, {
    // SPECIFY THE PAYLOAD
    playlist: playlist,
  });
};
export const getPlaylistComments = (id) => api.get(`/playlist/${id}/comments`);
export const createPlaylistComment = (id, data) =>
  api.post(`/playlist/${id}/comments`, data);
export const updatePlaylistComment = (id, commentId, data) =>
  api.put(`/playlist/${id}/comments/${commentId}`, data);
export const deletePlaylistComment = (id, commentId) =>
  api.delete(`/playlist/${id}/comments/${commentId}`);
export const likePlaylist = (id) => api.post(`/playlist/${id}/like`);
export const dislikePlaylist = (id) => api.post(`/playlist/${id}/dislike`);
export const incrementPlaylistListen = (id) =>
  api.post(`/playlist/${id}/listen`);

const apis = {
  createPlaylist,
  deletePlaylistById,
  getPlaylistById,
  getPlaylistPairs,
  getHomePlaylists,
  getCommunityPlaylists,
  getUserPlaylists,
  updatePlaylistById,
  getPlaylistComments,
  createPlaylistComment,
  updatePlaylistComment,
  deletePlaylistComment,
  likePlaylist,
  dislikePlaylist,
  incrementPlaylistListen,
};

export default apis;
