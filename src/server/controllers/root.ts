import Controller, { Verb } from "../Controller";

const root = new Controller();

root.on(Verb.GET, "/", [], () => "Yes?");

// Health checks
root.on(Verb.GET, "/ping", [], () => "pong");
root.on(Verb.GET, "/marco", [], () => "polo");
root.on(Verb.GET, "/healthCheck", [], () => "SUCCESS");

export default root;
