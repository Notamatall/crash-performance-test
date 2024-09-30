const fs = require("fs");
const path = require("path");

function readCSV(filePath) {
  const localFilePath = path.join(__dirname, filePath);
  return new Promise((resolve, reject) => {
    fs.readFile(localFilePath, "utf8", (err, data) => {
      if (err) {
        reject("Error reading file: " + err);
        return;
      }

      const rows = data.split("\n"); // Split into rows
      const headers = rows[0].replace("\r", "").split(",");

      // Process the rows (starting from the second row)
      const users = rows.slice(1).map((row) => {
        const values = row
          .replace("\r", "")
          .replace(/^"|"$/g, "")
          .trim()
          .split(",");
        let user = {};
        try {
          headers.forEach((header, index) => {
            user[header.trim()] = values[index]?.trim(); // Use optional chaining in case of missing values
          });
        } catch (ex) {
          console.error("Error processing row:", ex);
        }
        return user;
      });

      resolve(users); // Resolve the Promise with the users array
    });
  });
}

function getJson(filePath) {
  return new Promise((resolve) => {
    const localFilePath = path.join(__dirname, filePath);
    const userData = require(localFilePath);
    resolve(userData);
  });
}

module.exports = { getJson, readCSV };
