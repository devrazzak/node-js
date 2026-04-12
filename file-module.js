const file = require("fs");

// file.writeFileSync(
//   "newFile.txt",
//   "This is a new file created using Node.js! \n",
// );

// file.appendFileSync(
//   "newFile.txt",
//   "This is an updated content for the new file.",
// );

// const data = file.readFileSync("newFile.txt");

// console.log(data.toString());

file.readFile("newFile.txt", (err, data) => {
  console.log(data.toString());
});

console.log(
  "This will be printed before the file content due to asynchronous nature of readFile.",
);
