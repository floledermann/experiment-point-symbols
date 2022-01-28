const filestorage = require("stimsrv/storage/filestorage");

module.exports = {
  devices: [
    {
      name: "Development PC",
      id: "dev",
      pixelDensity: 91,
      viewingDistance: 600,
      devicePixelRatio: 1,
      imageSize: "720x1280",
    },
    {
      name: "Supervisor",
      id: "supervisor",
      pixelDensity: 265,
      viewingDistance: 500,
    },
    {
      name: "Main Monitor",
      id: "main",
      pixelDensity: 91,
      viewingDistance: 600,
    },
    {
      name: "Response Input",
      id: "response",
      pixelDensity: 403,
      viewingDistance: 350
    },
    /*
    {
      name: "Station A TEST",
      id: "stationA",
      pixelDensity: 440,
      viewingDistance: 308,
      devicePixelRatio: 2.625
//      gamma: 2.6,
    },
*/
    {
      name: "Station A (Galaxy Note 4)",
      id: "stationA",
      pixelDensity: 520,
      viewingDistance: 308,
    },
    {
      name: "Station B (Sony Xperia Z5-P)",
      id: "stationB",
      pixelDensity: 807,
      viewingDistance: 308,
      //devicePixelRatio: 4,
    },
    {
      name: "Station C (LG K-52)",
      id: "stationC",
      pixelDensity: 265,
      viewingDistance: 308,
      //client: "browser-simple",
      //devicePixelRatio: 1.5,
      //imageSize: "480x520",
    },
  ],
  
  roles: [
    {
      role: "main",
      description: "Main Monitor",
      devices: ["main", "dev"],
      interfaces: ["display"]
    },
    {
      role: "stationA",
      description: "Station A",
      devices: ["stationA", "dev"],
      interfaces: ["display"],
    },
    {
      role: "stationB",
      description: "Station B",
      devices: ["stationB", "dev"],
      interfaces: ["display"]
    },
    {
      role: "stationC",
      description: "Station C",
      devices: ["stationC", "dev"],
      interfaces: ["display"]
    },
    {
      role: "response",
      description: "Response Input",
      devices: ["response","dev"],
      interfaces: ["response"],
      fullscreenButton: true
    },
    {
      role: "supervisor",
      description: "Supervisor",
      devices: ["supervisor","dev"],
      interfaces: ["monitor", "control"]
    },
  ],
  
}