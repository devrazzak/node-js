const path = require("path");

console.log(__dirname);
console.log(__filename);

console.log(path.basename(__dirname));
console.log(path.basename(__filename));
console.log(path.extname(__filename));

console.log(path.parse(__filename));
console.log(path.isAbsolute(__dirname));
console.log(path.isAbsolute("./content"));

const filePath = path.join("/content", "subfolder", "test.txt");
console.log(filePath);

const absolute = path.resolve(__dirname, "content", "subfolder", "test.txt");
console.log(absolute);
