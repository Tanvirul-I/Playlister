const mongoose = require("mongoose");
const Schema = mongoose.Schema;
/*
    This is where we specify the format of the data we're going to put into
    the database.
    
    @author Tanvirul Islam
*/
const playlistSchema = new Schema(
  {
    name: { type: String, required: true },
    ownerEmail: { type: String, required: true },
    published: { type: Number, required: true },
    username: { type: String, required: true },
    songs: {
      type: [
        {
          title: String,
          artist: String,
          youTubeId: String,
        },
      ],
      required: true,
    },
    ratings: {
      type: {
        likes: Number,
        dislikes: Number,
        listens: Number,
      },
      required: true,
    },
    likedBy: { type: [String], required: true, default: [] },
    dislikedBy: { type: [String], required: true, default: [] },
    comments: {
      type: [
        {
          author: String,
          comment: String,
        },
      ],
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Playlist", playlistSchema);
