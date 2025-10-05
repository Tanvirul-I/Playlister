const path = require("path");

const playlists = [];

class PlaylistStub {
  constructor(data) {
    Object.assign(this, data);
    this._id = `${playlists.length + 1}`;
  }

  async save() {
    playlists.push({ ...this });
    return this;
  }

  static async exists({ name, ownerEmail }) {
    return playlists.some(
      (playlist) => playlist.name === name && playlist.ownerEmail === ownerEmail
    );
  }

  static async findOne(query, callback) {
    const keys = Object.keys(query || {});
    const playlist = playlists.find((candidate) =>
      keys.every((key) => candidate[key] === query[key])
    );

    if (typeof callback === "function") {
      callback(null, playlist || null);
    }

    return playlist || null;
  }

  static async find({ ownerEmail }) {
    return playlists.filter((playlist) => playlist.ownerEmail === ownerEmail);
  }
}

const users = [];

const UserStub = {
  async create(data) {
    const user = {
      ...data,
      _id: `${users.length + 1}`,
      playlists: [],
      save() {
        return Promise.resolve(this);
      },
    };
    users.push(user);
    return user;
  },
  findOne(query, callback) {
    const user = users.find((candidate) => candidate._id === `${query._id}`);
    callback(null, user);
  },
};

const playlistModelPath = path.join(__dirname, "../models/playlist-model.js");
const userModelPath = path.join(__dirname, "../models/user-model.js");

require.cache[require.resolve(playlistModelPath)] = { exports: PlaylistStub };
require.cache[require.resolve(userModelPath)] = { exports: UserStub };

const { createPlaylist } = require("../controllers/playlist-controller");

async function callCreatePlaylist(body, userId) {
  return new Promise((resolve, reject) => {
    const req = {
      body: {
        ...body,
        songs: body.songs.map((song) => ({ ...song })),
      },
      userId,
    };

    const res = {
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(payload) {
        resolve({ statusCode: this.statusCode, payload });
      },
    };

    createPlaylist(req, res).catch(reject);
  });
}

async function main() {
  const user = await UserStub.create({
    firstName: "Test",
    lastName: "User",
    email: "test@example.com",
    passwordHash: "hash",
    username: "tester",
  });

  const basePlaylist = {
    name: "Chill Mix",
    ownerEmail: user.email,
    username: user.username,
    songs: [
      {
        title: "Song 1",
        artist: "Artist 1",
        youTubeId: "id1",
      },
    ],
  };

  for (let i = 0; i < 3; i++) {
    const response = await callCreatePlaylist(basePlaylist, user._id);
    if (response.statusCode !== 201) {
      throw new Error(`Unexpected status code: ${response.statusCode}`);
    }
  }

  const savedPlaylists = await PlaylistStub.find({ ownerEmail: user.email });
  const names = savedPlaylists.map((playlist) => playlist.name);

  console.log("Created playlist names:", names);

  if (new Set(names).size !== names.length) {
    throw new Error("Duplicate playlist names detected");
  }

  console.log("Unique playlist names verified.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
