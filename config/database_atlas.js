require('dotenv').config();
const user = process.env.ATLAS_USER;
const pass = process.env.ATLAS_PASS;

module.exports = {
    url : "mongodb+srv://" + user + ":" + pass + "@cluster0.gzqfth2.mongodb.net/sample_mflix"
};