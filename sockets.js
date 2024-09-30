const { env } = require("process");

function connectSocket(accessToken) {
  return new Promise((resolve, reject) => {
    const socket = io(env.BACKEND_URL, {
      query: {
        token: accessToken,
      },
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      resolve(socket);
    });

    socket.on("connect_error", (error) => {
      reject(error);
    });
  });
}
