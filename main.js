require("dotenv").config({ path: "./.env" });
const { getJson } = require("./utils"); // './math' is the path to the file
const axios = require("axios");

const usersCookies = new Map();
const users = [];
async function authenticate(user) {
  try {
    const body = {
      id: user.id,
      name: user.display_name,
      email: user.email,
    };

    const url = `${process.env.BACKEND_URL}${process.env.AUTH_ENDPOINT}`;

    const response = await axios.post(url, body, {
      headers: {
        "x-debug-token": "yw74DcaSHU1qaYm1m2Tlr8SLO4vmYC",
      },
    });
    if (response.headers["set-cookie"]) {
      const cookies = response.headers["set-cookie"].join(";");
      usersCookies.set(user.id, cookies);
    }
  } catch (ex) {
    console.log(ex);
  }
}

async function getUserInfo(user) {}

async function fetchUserData(user) {
  const url = `${process.env.BACKEND_URL}${process.env.ME_ENDPOINT}`;
  const cookies = usersCookies.get(user.id);
  const response = await axios.get(url, {
    headers: {
      Cookie: cookies,
    },
  });

  console.log(response.data);
}
async function main() {
  try {
    const users = await getJson("users.json");
    await authenticate(users[0]);
    await fetchUserData(users[0]);
  } catch (err) {
    console.error(err);
  }
}

main();
