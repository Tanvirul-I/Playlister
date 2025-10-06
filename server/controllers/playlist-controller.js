const mongoose = require("mongoose");
const Playlist = require("../models/playlist-model");
const User = require("../models/user-model");
const { sanitizeText } = require("../utils/profanity-filter");

const formatPlaylistForClient = (
  playlist,
  { viewerEmail = null, includeOwnerDetails = false, includeReactionAudience = false } = {}
) => {
  if (!playlist) {
    return null;
  }

  const rawPlaylist =
    typeof playlist.toObject === "function" ? playlist.toObject() : { ...playlist };

  const likedBy = Array.isArray(rawPlaylist.likedBy) ? [...rawPlaylist.likedBy] : [];
  const dislikedBy = Array.isArray(rawPlaylist.dislikedBy) ? [...rawPlaylist.dislikedBy] : [];
  const listens =
    typeof rawPlaylist?.ratings?.listens === "number" ? rawPlaylist.ratings.listens : 0;

  const normalizedViewerEmail =
    typeof viewerEmail === "string" && viewerEmail.length > 0 ? viewerEmail : null;
  const ownedByCurrentUser = !!(
    normalizedViewerEmail && rawPlaylist.ownerEmail === normalizedViewerEmail
  );
  const viewerHasLiked = normalizedViewerEmail ? likedBy.includes(normalizedViewerEmail) : false;
  const viewerHasDisliked = normalizedViewerEmail
    ? dislikedBy.includes(normalizedViewerEmail)
    : false;

  const formattedPlaylist = {
    ...rawPlaylist,
    ratings: {
      likes: likedBy.length,
      dislikes: dislikedBy.length,
      listens,
    },
    ownedByCurrentUser,
    viewerHasLiked,
    viewerHasDisliked,
  };

  delete formattedPlaylist.likedBy;
  delete formattedPlaylist.dislikedBy;

  if (!includeOwnerDetails) {
    delete formattedPlaylist.ownerEmail;
  }

  if (includeReactionAudience) {
    formattedPlaylist.likedBy = likedBy;
    formattedPlaylist.dislikedBy = dislikedBy;
  }

  return formattedPlaylist;
};

const formatPlaylistPairs = (playlists = [], options = {}) => {
  if (!Array.isArray(playlists)) {
    return [];
  }

  return playlists
    .map((playlist) => formatPlaylistForClient(playlist, options))
    .filter((playlist) => !!playlist);
};

const SortType = {
  NAME_ASC: "NAME_ASC",
  PUBLISH_NEWEST: "PUBLISH_NEWEST",
  LISTENS_DESC: "LISTENS_DESC",
  LIKES_DESC: "LIKES_DESC",
  DISLIKES_DESC: "DISLIKES_DESC",
};

const normalizeSortType = (sortKey) => {
  const sortValues = Object.values(SortType);
  return sortValues.includes(sortKey) ? sortKey : SortType.NAME_ASC;
};

const comparePlaylistNames = (a, b) => {
  const nameA = typeof a?.name === "string" ? a.name : "";
  const nameB = typeof b?.name === "string" ? b.name : "";

  return nameA.localeCompare(nameB, undefined, { sensitivity: "base" });
};

const getPublishedValue = (playlist) => {
  const value = typeof playlist?.published === "number" ? playlist.published : -1;
  return value >= 0 ? value : -Infinity;
};

const getRatingValue = (playlist, key) => {
  if (!playlist || !playlist.ratings) {
    return 0;
  }

  const ratingValue = playlist.ratings[key];
  return typeof ratingValue === "number" ? ratingValue : 0;
};

const sortPlaylistsByType = (playlists, sortKey) => {
  const normalizedSort = normalizeSortType(sortKey);
  const sortableLists = Array.isArray(playlists) ? [...playlists] : [];

  switch (normalizedSort) {
    case SortType.PUBLISH_NEWEST:
      sortableLists.sort((a, b) => {
        const difference = getPublishedValue(b) - getPublishedValue(a);
        return difference !== 0 ? difference : comparePlaylistNames(a, b);
      });
      break;
    case SortType.LISTENS_DESC:
      sortableLists.sort((a, b) => {
        const difference = getRatingValue(b, "listens") - getRatingValue(a, "listens");
        return difference !== 0 ? difference : comparePlaylistNames(a, b);
      });
      break;
    case SortType.LIKES_DESC:
      sortableLists.sort((a, b) => {
        const difference = getRatingValue(b, "likes") - getRatingValue(a, "likes");
        return difference !== 0 ? difference : comparePlaylistNames(a, b);
      });
      break;
    case SortType.DISLIKES_DESC:
      sortableLists.sort((a, b) => {
        const difference = getRatingValue(b, "dislikes") - getRatingValue(a, "dislikes");
        return difference !== 0 ? difference : comparePlaylistNames(a, b);
      });
      break;
    case SortType.NAME_ASC:
    default:
      sortableLists.sort((a, b) => comparePlaylistNames(a, b));
      break;
  }

  return sortableLists;
};

const getSortedPairsResponse = (playlists, sortKey, options = {}) => {
  const sortedLists = sortPlaylistsByType(playlists, sortKey);
  return formatPlaylistPairs(sortedLists, options);
};

const isPlaylistPublished = (playlist) =>
  typeof playlist?.published === "number" && playlist.published >= 0;

const isPlaylistOwner = (playlist, user) =>
  !!(playlist && user && playlist.ownerEmail === user.email);

const resolveUserById = async (userId) => {
  if (!userId || !User) {
    return null;
  }

  const executeQuery = async (query) => {
    if (!query) {
      return null;
    }

    if (typeof query.exec === "function") {
      return query.exec();
    }

    if (typeof query.then === "function") {
      return query;
    }

    return query;
  };

  try {
    if (typeof User.findById === "function") {
      const result = await executeQuery(User.findById(userId));
      if (result) {
        return result;
      }
    }

    if (typeof User.findOne === "function") {
      return await executeQuery(User.findOne({ _id: userId }));
    }
  } catch (error) {
    console.log(error);
  }

  return null;
};
/*
    This is our back-end API. It provides all the data services
    our database needs. Note that this file contains the controller
    functions for each endpoint.
    
*/
createPlaylist = async (req, res) => {
  const body = req.body;

  if (!body) {
    return res.status(400).json({
      success: false,
      error: "You must provide a Playlist",
    });
  }

  if (req.isGuest) {
    return res.status(403).json({
      success: false,
      errorMessage: "Guest users cannot create playlists.",
    });
  }

  try {
    if (!mongoose.Types.ObjectId.isValid(req.userId)) {
      return res.status(401).json({
        success: false,
        errorMessage: "Authentication error",
      });
    }

    const user = await resolveUserById(req.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        errorMessage: "Authentication error",
      });
    }

    let songsContainSevereProfanity = false;

    const sanitizedSongs = Array.isArray(body.songs)
      ? body.songs.map((song) => {
          const titleResult = sanitizeText(song?.title ?? "", { trim: true });
          const artistResult = sanitizeText(song?.artist ?? "", { trim: true });

          if (titleResult.containsSevere || artistResult.containsSevere) {
            songsContainSevereProfanity = true;
          }

          return {
            title: titleResult.sanitizedText,
            artist: artistResult.sanitizedText,
            youTubeId: typeof song?.youTubeId === "string" ? song.youTubeId.trim() : "",
          };
        })
      : [];

    if (songsContainSevereProfanity) {
      return res.status(400).json({
        success: false,
        errorMessage: "Playlist details contain language that is not allowed.",
      });
    }

    const playlistNameResult = sanitizeText(body.name ?? "", { trim: true });

    if (playlistNameResult.containsProfanity) {
      return res.status(400).json({
        success: false,
        errorMessage: "Playlist name contains language that is not allowed.",
      });
    }

    if (!playlistNameResult.sanitizedText) {
      return res.status(400).json({
        success: false,
        errorMessage: "Playlist name is required.",
      });
    }

    const playlistData = {
      ...body,
      name: playlistNameResult.sanitizedText,
      songs: sanitizedSongs,
      ratings: {
        likes: 0,
        dislikes: 0,
        listens: 0,
      },
    };

    playlistData["likedBy"] = [];
    playlistData["dislikedBy"] = [];
    playlistData["comments"] = [];
    playlistData["published"] = -1;
    playlistData["ownerEmail"] = user.email;
    playlistData["username"] = user.username;

    const baseName = typeof playlistData.name === "string" ? playlistData.name : "";
    let candidateName = baseName;
    let suffix = 1;

    while (
      await Playlist.exists({
        name: candidateName,
        ownerEmail: user.email,
      })
    ) {
      candidateName = `${baseName} ${suffix}`;
      suffix++;
    }

    playlistData.name = candidateName;

    const playlist = new Playlist(playlistData);
    if (!playlist) {
      return res.status(400).json({ success: false, error: "Invalid playlist" });
    }

    if (!Array.isArray(user.playlists)) {
      user.playlists = [];
    }

    user.playlists.push(playlist._id);
    if (typeof user.save === "function") {
      await user.save();
    }
    await playlist.save();

    return res.status(201).json({
      playlist: formatPlaylistForClient(playlist, {
        viewerEmail: user.email,
        includeOwnerDetails: true,
      }),
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      errorMessage: "Playlist Not Created!",
    });
  }
};
deletePlaylist = async (req, res) => {
  if (req.isGuest) {
    return res.status(403).json({
      success: false,
      errorMessage: "Guest users cannot delete playlists.",
    });
  }

  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({
        success: false,
        errorMessage: "Playlist not found!",
      });
    }

    const playlist = await Playlist.findById(req.params.id).exec();
    if (!playlist) {
      return res.status(404).json({
        success: false,
        errorMessage: "Playlist not found!",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(req.userId)) {
      return res.status(401).json({
        success: false,
        errorMessage: "Authentication error",
      });
    }

    const user = await resolveUserById(req.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        errorMessage: "Authentication error",
      });
    }

    if (playlist.ownerEmail !== user.email) {
      return res.status(403).json({
        success: false,
        errorMessage: "You do not have permission to delete this playlist.",
      });
    }

    await Playlist.deleteOne({ _id: playlist._id }).exec();

    if (Array.isArray(user.playlists)) {
      user.playlists = user.playlists.filter((id) => id?.toString() !== playlist._id.toString());
      if (typeof user.save === "function") {
        await user.save();
      }
    }

    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      errorMessage: "Failed to delete playlist.",
    });
  }
};
getPlaylistById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ success: false, error: "Playlist not found" });
    }

    const playlist = await Playlist.findById(req.params.id).exec();
    if (!playlist) {
      return res.status(404).json({ success: false, error: "Playlist not found" });
    }

    if (req.isGuest) {
      if (isPlaylistPublished(playlist)) {
        return res.status(200).json({
          success: true,
          playlist: formatPlaylistForClient(playlist),
        });
      }

      return res.status(403).json({
        success: false,
        errorMessage: "Authentication error",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(req.userId)) {
      return res.status(401).json({
        success: false,
        errorMessage: "Authentication error",
      });
    }

    const user = await resolveUserById(req.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        errorMessage: "Authentication error",
      });
    }

    const isOwner = playlist.ownerEmail === user.email;
    const isPublished = isPlaylistPublished(playlist);

    if (!isOwner && !isPublished) {
      return res.status(403).json({
        success: false,
        errorMessage: "You do not have permission to view this playlist.",
      });
    }

    return res.status(200).json({
      success: true,
      playlist: formatPlaylistForClient(playlist, {
        viewerEmail: user.email,
        includeOwnerDetails: isOwner,
      }),
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      errorMessage: "Failed to load playlist.",
    });
  }
};
getPlaylistPairs = async (req, res) => {
  const requestedSort = req?.query?.sort;

  if (req.isGuest) {
    await Playlist.find({ published: { $ne: -1 } }, (err, playlists) => {
      if (err) {
        return res.status(400).json({ success: false, error: err });
      }
      const pairs = getSortedPairsResponse(playlists, requestedSort);
      return res.status(200).json({ success: true, idNamePairs: pairs });
    }).catch((err) => console.log(err));
    return;
  }

  await User.findOne({ _id: req.userId }, async (err, user) => {
    async function asyncFindList(email) {
      await Playlist.find({ ownerEmail: email }, (err, playlists) => {
        if (err) {
          return res.status(400).json({ success: false, error: err });
        }
        if (!playlists) {
          return res.status(404).json({ success: false, error: "Playlists not found" });
        } else {
          // PUT ALL THE LISTS INTO ID, NAME PAIRS
          const pairs = getSortedPairsResponse(playlists, requestedSort, {
            viewerEmail: user?.email,
          });
          return res.status(200).json({ success: true, idNamePairs: pairs });
        }
      }).catch((err) => console.log(err));
    }
    asyncFindList(user.email);
  }).catch((err) => console.log(err));
};

getHomePlaylistPairs = async (req, res) => {
  try {
    const requestedSort = req?.query?.sort;

    if (req.isGuest) {
      const playlists = await Playlist.find({
        published: { $gte: 0 },
      }).exec();
      const pairs = getSortedPairsResponse(playlists, requestedSort);
      return res.status(200).json({ success: true, idNamePairs: pairs });
    }

    if (!mongoose.Types.ObjectId.isValid(req.userId)) {
      return res.status(400).json({ success: false, error: "Invalid user identifier" });
    }

    const user = await User.findOne({ _id: req.userId }).exec();

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const playlists = await Playlist.find({
      ownerEmail: user.email,
    }).exec();
    const pairs = getSortedPairsResponse(playlists, requestedSort, {
      viewerEmail: user.email,
    });
    return res.status(200).json({ success: true, idNamePairs: pairs });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: "Failed to load home playlists" });
  }
};

getCommunityPlaylistPairs = async (req, res) => {
  try {
    const playlists = await Playlist.find({
      published: { $gte: 0 },
    }).exec();
    const viewer = !req.isGuest ? await resolveUserById(req.userId) : null;
    const pairs = getSortedPairsResponse(playlists, req?.query?.sort, {
      viewerEmail: viewer?.email || null,
    });
    return res.status(200).json({ success: true, idNamePairs: pairs });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      error: "Failed to load community playlists",
    });
  }
};

getUserPlaylistPairs = async (req, res) => {
  try {
    const usernameParam = req.params.username ? req.params.username.trim() : "";

    if (!usernameParam) {
      return res.status(200).json({ success: true, idNamePairs: [] });
    }

    const playlists = await Playlist.find({
      username: { $regex: new RegExp(`^${usernameParam}$`, "i") },
      published: { $gte: 0 },
    }).exec();

    const viewer = !req.isGuest ? await resolveUserById(req.userId) : null;

    const pairs = getSortedPairsResponse(playlists, req?.query?.sort, {
      viewerEmail: viewer?.email || null,
    });
    return res.status(200).json({ success: true, idNamePairs: pairs });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: "Failed to load user playlists" });
  }
};
getPlaylists = async (req, res) => {
  if (req.isGuest) {
    return res.status(403).json({
      success: false,
      errorMessage: "Guest users cannot view playlists.",
    });
  }

  try {
    const user = await User.findById(req.userId).exec();
    if (!user) {
      return res.status(401).json({
        success: false,
        errorMessage: "Authentication error",
      });
    }

    const playlists = await Playlist.find({ ownerEmail: user.email }).exec();
    const sanitizedPlaylists = Array.isArray(playlists)
      ? playlists.map((playlist) =>
          formatPlaylistForClient(playlist, {
            viewerEmail: user.email,
            includeOwnerDetails: true,
          })
        )
      : [];

    return res.status(200).json({
      success: true,
      data: sanitizedPlaylists,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      errorMessage: "Failed to load playlists.",
    });
  }
};
updatePlaylist = async (req, res) => {
  const body = req.body;

  if (!body) {
    return res.status(400).json({
      success: false,
      error: "You must provide a body to update",
    });
  }

  if (req.isGuest) {
    return res.status(403).json({
      success: false,
      errorMessage: "Guest users cannot update playlists.",
    });
  }

  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({
        success: false,
        errorMessage: "Playlist not found!",
      });
    }

    const playlist = await Playlist.findById(req.params.id).exec();
    if (!playlist) {
      return res.status(404).json({
        success: false,
        errorMessage: "Playlist not found!",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(req.userId)) {
      return res.status(401).json({
        success: false,
        errorMessage: "Authentication error",
      });
    }

    const user = await resolveUserById(req.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        errorMessage: "Authentication error",
      });
    }

    if (playlist.ownerEmail !== user.email) {
      return res.status(403).json({
        success: false,
        errorMessage: "You do not have permission to update this playlist.",
      });
    }

    const updatedPlaylist = body.playlist || {};
    const playlistNameResult = sanitizeText(updatedPlaylist.name ?? "", { trim: true });

    if (playlistNameResult.containsSevere) {
      return res.status(400).json({
        success: false,
        errorMessage: "Playlist name contains language that is not allowed.",
      });
    }

    if (!playlistNameResult.sanitizedText) {
      return res.status(400).json({
        success: false,
        errorMessage: "Playlist name is required.",
      });
    }

    let songsContainSevereProfanity = false;

    const sanitizedSongs = Array.isArray(updatedPlaylist.songs)
      ? updatedPlaylist.songs.map((song) => {
          const titleResult = sanitizeText(song?.title ?? "", { trim: true });
          const artistResult = sanitizeText(song?.artist ?? "", { trim: true });

          if (titleResult.containsSevere || artistResult.containsSevere) {
            songsContainSevereProfanity = true;
          }

          return {
            title: titleResult.sanitizedText,
            artist: artistResult.sanitizedText,
            youTubeId: typeof song?.youTubeId === "string" ? song.youTubeId.trim() : "",
          };
        })
      : [];

    if (songsContainSevereProfanity) {
      return res.status(400).json({
        success: false,
        errorMessage: "Playlist details contain language that is not allowed.",
      });
    }

    const baseName = playlistNameResult.sanitizedText;
    let candidateName = baseName;
    let suffix = 1;

    while (
      await Playlist.exists({
        ownerEmail: playlist.ownerEmail,
        name: candidateName,
        _id: { $ne: playlist._id },
      })
    ) {
      candidateName = `${baseName} ${suffix}`;
      suffix++;
    }

    playlist.name = candidateName;
    playlist.songs = sanitizedSongs;
    playlist.published = updatedPlaylist.published;

    if (!Array.isArray(playlist.likedBy)) {
      playlist.likedBy = [];
    }
    if (!Array.isArray(playlist.dislikedBy)) {
      playlist.dislikedBy = [];
    }

    await playlist.save();

    return res.status(200).json({
      success: true,
      id: playlist._id,
      message: "Playlist updated!",
    });
  } catch (error) {
    console.log("FAILURE: " + JSON.stringify(error));
    return res.status(500).json({
      success: false,
      errorMessage: "Playlist not updated!",
    });
  }
};

likePlaylist = async (req, res) => {
  if (req.isGuest) {
    return res.status(403).json({
      success: false,
      errorMessage: "Guest users cannot like playlists.",
    });
  }
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      return res.status(404).json({
        success: false,
        errorMessage: "Playlist not found!",
      });
    }

    const user = await resolveUserById(req.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        errorMessage: "Authentication error",
      });
    }

    const isOwner = isPlaylistOwner(playlist, user);
    const isPublished = isPlaylistPublished(playlist);

    if (!isOwner && !isPublished) {
      return res.status(403).json({
        success: false,
        errorMessage: "You do not have permission to like this playlist.",
      });
    }

    if (!Array.isArray(playlist.likedBy)) {
      playlist.likedBy = [];
    }
    if (!Array.isArray(playlist.dislikedBy)) {
      playlist.dislikedBy = [];
    }
    if (!playlist.ratings) {
      playlist.ratings = {
        likes: 0,
        dislikes: 0,
        listens: 0,
      };
    }

    const alreadyLiked = playlist.likedBy.includes(user.email);
    const alreadyDisliked = playlist.dislikedBy.includes(user.email);

    if (alreadyLiked) {
      playlist.likedBy = playlist.likedBy.filter((email) => email !== user.email);
    } else {
      playlist.likedBy.push(user.email);
      if (alreadyDisliked) {
        playlist.dislikedBy = playlist.dislikedBy.filter((email) => email !== user.email);
      }
    }

    playlist.ratings.likes = playlist.likedBy.length;
    playlist.ratings.dislikes = playlist.dislikedBy.length;

    playlist.markModified("likedBy");
    playlist.markModified("dislikedBy");
    playlist.markModified("ratings");

    await playlist.save();

    return res.status(200).json({
      success: true,
      playlist: formatPlaylistForClient(playlist, {
        viewerEmail: user.email,
        includeOwnerDetails: isOwner,
      }),
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      errorMessage: "Failed to like playlist.",
    });
  }
};

dislikePlaylist = async (req, res) => {
  if (req.isGuest) {
    return res.status(403).json({
      success: false,
      errorMessage: "Guest users cannot dislike playlists.",
    });
  }
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      return res.status(404).json({
        success: false,
        errorMessage: "Playlist not found!",
      });
    }

    const user = await resolveUserById(req.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        errorMessage: "Authentication error",
      });
    }

    const isOwner = isPlaylistOwner(playlist, user);
    const isPublished = isPlaylistPublished(playlist);

    if (!isOwner && !isPublished) {
      return res.status(403).json({
        success: false,
        errorMessage: "You do not have permission to dislike this playlist.",
      });
    }

    if (!Array.isArray(playlist.likedBy)) {
      playlist.likedBy = [];
    }
    if (!Array.isArray(playlist.dislikedBy)) {
      playlist.dislikedBy = [];
    }
    if (!playlist.ratings) {
      playlist.ratings = {
        likes: 0,
        dislikes: 0,
        listens: 0,
      };
    }

    const alreadyLiked = playlist.likedBy.includes(user.email);
    const alreadyDisliked = playlist.dislikedBy.includes(user.email);

    if (alreadyDisliked) {
      playlist.dislikedBy = playlist.dislikedBy.filter((email) => email !== user.email);
    } else {
      playlist.dislikedBy.push(user.email);
      if (alreadyLiked) {
        playlist.likedBy = playlist.likedBy.filter((email) => email !== user.email);
      }
    }

    playlist.ratings.likes = playlist.likedBy.length;
    playlist.ratings.dislikes = playlist.dislikedBy.length;

    playlist.markModified("likedBy");
    playlist.markModified("dislikedBy");
    playlist.markModified("ratings");

    await playlist.save();

    return res.status(200).json({
      success: true,
      playlist: formatPlaylistForClient(playlist, {
        viewerEmail: user.email,
        includeOwnerDetails: isOwner,
      }),
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      errorMessage: "Failed to dislike playlist.",
    });
  }
};

createPlaylistComment = async (req, res) => {
  if (req.isGuest) {
    return res.status(403).json({
      success: false,
      errorMessage: "Guest users cannot comment on playlists.",
    });
  }
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      return res.status(404).json({
        success: false,
        errorMessage: "Playlist not found!",
      });
    }

    const user = await resolveUserById(req.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        errorMessage: "Authentication error",
      });
    }

    const text = req.body.text ? req.body.text.trim() : "";
    if (!text) {
      return res.status(400).json({
        success: false,
        errorMessage: "Comment text is required.",
      });
    }

    const commentResult = sanitizeText(text);

    if (commentResult.containsSevere) {
      return res.status(400).json({
        success: false,
        errorMessage: "Comment contains language that is not allowed.",
      });
    }

    const isPublished = typeof playlist.published === "number" && playlist.published >= 0;
    const isOwner = playlist.ownerEmail === user.email;

    if (!isPublished && !isOwner) {
      return res.status(403).json({
        success: false,
        errorMessage: "You do not have permission to comment on this playlist.",
      });
    }

    playlist.comments.push({
      author: user.username,
      comment: commentResult.sanitizedText,
    });
    playlist.markModified("comments");
    await playlist.save();

    return res.status(200).json({
      success: true,
      playlist: formatPlaylistForClient(playlist, {
        viewerEmail: user.email,
        includeOwnerDetails: isOwner,
      }),
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      errorMessage: "Failed to add comment.",
    });
  }
};

getPlaylistComments = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      return res.status(404).json({
        success: false,
        errorMessage: "Playlist not found!",
      });
    }

    const isPublished = typeof playlist.published === "number" && playlist.published >= 0;

    if (!isPublished) {
      if (req.isGuest) {
        return res.status(403).json({
          success: false,
          errorMessage: "Authentication error",
        });
      }

      const user = await User.findById(req.userId).exec();
      if (!user || user.email !== playlist.ownerEmail) {
        return res.status(403).json({
          success: false,
          errorMessage: "You do not have permission to view these comments.",
        });
      }
    }

    return res.status(200).json({
      success: true,
      comments: playlist.comments,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      errorMessage: "Failed to load comments.",
    });
  }
};

updatePlaylistComment = async (req, res) => {
  if (req.isGuest) {
    return res.status(403).json({
      success: false,
      errorMessage: "Guest users cannot update comments.",
    });
  }
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      return res.status(404).json({
        success: false,
        errorMessage: "Playlist not found!",
      });
    }

    const user = await User.findById(req.userId).exec();
    if (!user) {
      return res.status(401).json({
        success: false,
        errorMessage: "Authentication error",
      });
    }

    const comment = playlist.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        errorMessage: "Comment not found!",
      });
    }

    const isCommentAuthor = comment.author === user.username;
    const isPlaylistOwner = playlist.ownerEmail === user.email;

    if (!isCommentAuthor && !isPlaylistOwner) {
      return res.status(403).json({
        success: false,
        errorMessage: "You do not have permission to update this comment.",
      });
    }

    const text = req.body.text ? req.body.text.trim() : "";
    if (!text) {
      return res.status(400).json({
        success: false,
        errorMessage: "Comment text is required.",
      });
    }

    const commentResult = sanitizeText(text);

    if (commentResult.containsSevere) {
      return res.status(400).json({
        success: false,
        errorMessage: "Comment contains language that is not allowed.",
      });
    }

    comment.comment = commentResult.sanitizedText;
    playlist.markModified("comments");
    await playlist.save();

    return res.status(200).json({
      success: true,
      playlist: formatPlaylistForClient(playlist, {
        viewerEmail: user.email,
        includeOwnerDetails: isPlaylistOwner,
      }),
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      errorMessage: "Failed to update comment.",
    });
  }
};

deletePlaylistComment = async (req, res) => {
  if (req.isGuest) {
    return res.status(403).json({
      success: false,
      errorMessage: "Guest users cannot delete comments.",
    });
  }
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      return res.status(404).json({
        success: false,
        errorMessage: "Playlist not found!",
      });
    }

    const user = await User.findById(req.userId).exec();
    if (!user) {
      return res.status(401).json({
        success: false,
        errorMessage: "Authentication error",
      });
    }

    const comment = playlist.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        errorMessage: "Comment not found!",
      });
    }

    const isCommentAuthor = comment.author === user.username;
    const isPlaylistOwner = playlist.ownerEmail === user.email;

    if (!isCommentAuthor && !isPlaylistOwner) {
      return res.status(403).json({
        success: false,
        errorMessage: "You do not have permission to delete this comment.",
      });
    }

    comment.remove();
    playlist.markModified("comments");
    await playlist.save();

    return res.status(200).json({
      success: true,
      playlist: formatPlaylistForClient(playlist, {
        viewerEmail: user.email,
        includeOwnerDetails: isPlaylistOwner,
      }),
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      errorMessage: "Failed to delete comment.",
    });
  }
};

incrementPlaylistListen = async (req, res) => {
  if (req.isGuest) {
    return res.status(403).json({
      success: false,
      errorMessage: "Guest users cannot increment listens.",
    });
  }

  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      return res.status(404).json({
        success: false,
        errorMessage: "Playlist not found!",
      });
    }

    const user = await User.findOne({ _id: req.userId });
    if (!user) {
      return res.status(401).json({
        success: false,
        errorMessage: "Authentication error",
      });
    }

    const isOwner = isPlaylistOwner(playlist, user);
    const isPublished = isPlaylistPublished(playlist);

    if (!isOwner && !isPublished) {
      return res.status(403).json({
        success: false,
        errorMessage: "You do not have permission to register listens for this playlist.",
      });
    }

    if (isOwner) {
      return res.status(200).json({
        success: true,
        playlist: formatPlaylistForClient(playlist, {
          viewerEmail: user.email,
          includeOwnerDetails: true,
        }),
      });
    }

    if (!playlist.ratings) {
      playlist.ratings = {
        likes: 0,
        dislikes: 0,
        listens: 0,
      };
    }

    const currentListens =
      typeof playlist.ratings.listens === "number" ? playlist.ratings.listens : 0;

    playlist.ratings.listens = currentListens + 1;

    playlist.markModified("ratings");
    await playlist.save();

    return res.status(200).json({
      success: true,
      playlist: formatPlaylistForClient(playlist, {
        viewerEmail: user.email,
        includeOwnerDetails: isOwner,
      }),
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      errorMessage: "Failed to increment listens.",
    });
  }
};

module.exports = {
  createPlaylist,
  deletePlaylist,
  getPlaylistById,
  getPlaylistPairs,
  getHomePlaylistPairs,
  getCommunityPlaylistPairs,
  getUserPlaylistPairs,
  getPlaylists,
  updatePlaylist,
  likePlaylist,
  dislikePlaylist,
  incrementPlaylistListen,
  createPlaylistComment,
  getPlaylistComments,
  updatePlaylistComment,
  deletePlaylistComment,
};
