const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

const environment = process.env.NODE_ENV === "production" ? "production" : "development";
const envFile = environment === "production" ? ".env.production" : ".env.development";
const serverRoot = path.resolve(__dirname, "..");
const candidatePaths = [path.join(serverRoot, envFile), path.resolve(serverRoot, "..", envFile)];

const existingPath = candidatePaths.find((possiblePath) => fs.existsSync(possiblePath));

if (existingPath) {
  dotenv.config({ path: existingPath });
} else {
  dotenv.config();
}
