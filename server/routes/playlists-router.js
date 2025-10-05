/*
    This is where we'll route all of the received http requests
    into controller response functions.
    
*/
const express = require("express");
const PlaylistController = require("../controllers/playlist-controller");
const router = express.Router();
const auth = require("../auth");
const {
  createRateLimiter,
  userAwareKeyGenerator,
  createScopedKeyGenerator,
} = require("../middleware/rate-limiter");

const writeLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000,
  max: 30,
  keyGenerator: userAwareKeyGenerator,
  message: "Too many playlist updates detected. Please try again in a few minutes.",
});

const playlistScopedKey = createScopedKeyGenerator((req) => {
  const playlistId = req?.params?.id;
  return playlistId ? `playlist:${playlistId}` : null;
});

const reactionLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 60,
  keyGenerator: playlistScopedKey,
  message: "Too many interactions with this playlist. Please slow down.",
});

const listenLimiter = createRateLimiter({
  windowMs: 30 * 60 * 1000,
  max: 20,
  keyGenerator: createScopedKeyGenerator((req) => {
    const playlistId = req?.params?.id;
    return playlistId ? `listen:${playlistId}` : null;
  }),
  message: "Playback limit reached for this playlist. Please try again later.",
});

router.post("/playlist", auth.verify, writeLimiter, PlaylistController.createPlaylist);
router.delete("/playlist/:id", auth.verify, writeLimiter, PlaylistController.deletePlaylist);
router.get("/playlist/:id", auth.verify, PlaylistController.getPlaylistById);
router.get("/playlistpairs", auth.verify, PlaylistController.getPlaylistPairs);
router.get("/playlistpairs/home", auth.verify, PlaylistController.getHomePlaylistPairs);
router.get("/playlistpairs/community", auth.verify, PlaylistController.getCommunityPlaylistPairs);
router.get("/playlistpairs/user/:username", auth.verify, PlaylistController.getUserPlaylistPairs);
router.get("/playlists", auth.verify, PlaylistController.getPlaylists);
router.put("/playlist/:id", auth.verify, writeLimiter, PlaylistController.updatePlaylist);
router.post("/playlist/:id/like", auth.verify, reactionLimiter, PlaylistController.likePlaylist);
router.post(
  "/playlist/:id/dislike",
  auth.verify,
  reactionLimiter,
  PlaylistController.dislikePlaylist
);
router.post(
  "/playlist/:id/listen",
  auth.verify,
  listenLimiter,
  PlaylistController.incrementPlaylistListen
);
router.get("/playlist/:id/comments", auth.verify, PlaylistController.getPlaylistComments);
router.post(
  "/playlist/:id/comments",
  auth.verify,
  writeLimiter,
  PlaylistController.createPlaylistComment
);
router.put(
  "/playlist/:id/comments/:commentId",
  auth.verify,
  writeLimiter,
  PlaylistController.updatePlaylistComment
);
router.delete(
  "/playlist/:id/comments/:commentId",
  auth.verify,
  writeLimiter,
  PlaylistController.deletePlaylistComment
);

module.exports = router;
