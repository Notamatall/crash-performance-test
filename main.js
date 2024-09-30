require("dotenv").config({ path: "./.env" });
const { getJson } = require("./utils"); // './math' is the path to the file
const axios = require("axios");
const io = require("socket.io-client");

const usersCookies = new Map();
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

async function createUserSocketConnection(user) {
  const url = `${process.env.BACKEND_URL}${process.env.ME_ENDPOINT}`;
  const socket = io(url, {
    withCredentials: true,
    transports: ["websocket"],
  });

  socket.on;
}

function connectSocket(user) {
  const url = `${process.env.BACKEND_URL}${process.env.SOCKET_EVENT}`;

  return new Promise((resolve, reject) => {
    const socket = io(url, {
      withCredentials: true,
      transports: ["websocket"],
      extraHeaders: {
        cookie: usersCookies.get(user.id),
        origin: "allowed-origin",
      },
    });

    socket.on("connect", () => {
      resolve(socket);
    });

    socket.on("connect_error", (error) => {
      reject(error);
    });
  });
}

async function establishUserConnection(user) {
  await authenticate(user);
  await fetchUserData(user);
  const socket = await connectSocket(user);
  let useBetRegistered = false;
  let userBetPlaced = false;
  let isPlacingBet = Math.round(Math.random() * 1);

  setInterval(() => {
    socket.emit("CrashActiveGameBettorsRequest");
  }, Math.random() * 10000 + 5000);

  socket.on("CrashState", (data) => {
    const { status } = data;
    if (status === "CRASHED") {
      useBetRegistered = false;
      userBetPlaced = false;
      isPlacingBet = Math.round(Math.random() * 1);
    }

    if (status === "IN_PROGRESS" && !useBetRegistered && !isPlacingBet) {
      useBetRegistered = true;
      const autoCashoutAt = Math.random() * 2 + 1.01;
      const amount = Math.random() * 500;
      socket.emit("CrashRegisterBet", {
        amount,
        autoCashoutAt,
      });
    }

    if (status === "ACCEPTING_BETS" && !userBetPlaced && isPlacingBet) {
      userBetPlaced = true;
      const autoCashoutAt = Math.random() * 2 + 1.01;
      const amount = Math.random() * 500;
      socket.emit("CrashPlaceBet", {
        amount,
        autoCashoutAt,
      });
    }
  });
}

function waitSomeTime(time) {
  return new Promise((res) => {
    setTimeout(res, time);
  });
}

async function main() {
  try {
    const users = await getJson("users.json");
    let usersRegistered = 0;
    for (const user of users) {
      usersRegistered++;
      await establishUserConnection(user);
      await waitSomeTime(300);
    }
    console.log(usersRegistered);
  } catch (err) {
    console.error(err);
  }
}

main();
