const EventEmitter = require("events");

const emitter = new EventEmitter();

// Registering an event listener for the 'greet' event
emitter.on("greet", (name) => {
  console.log(`Hello, ${name}! Welcome to the EventEmitter example.`);
});

// Emitting the 'greet' event with a name argument
emitter.emit("greet", "MD Abdur Razzak");

setTimeout(() => {
  emitter.emit("greet", "This is emitted after 2 seconds.");
}, 2000);
