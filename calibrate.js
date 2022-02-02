
const snellen = require("stimsrv/task/tumblingE");
const pause = require("stimsrv/task/pause");
const loop = require("stimsrv/task/loop");

const sequence = require("stimsrv/controller/sequence");

const filestorage = require("stimsrv/storage/filestorage");

const resource = require("stimsrv/util/resource");

const setup = require("./setup-lab.js");

// stimsrv experiment definition
module.exports = {
  
  name: "HD Map Symbolization - Experiment 1 Calibration",
  
  devices: setup.devices,
  roles: setup.roles,

  storage: filestorage({
    destination: "./data_calibrate"
  }),
  
  resources: [
    "resources/sound"
  ],

  
  tasks: [

    snellen({
      angle: sequence.loop([0,90,180,270,270]),
      pixelAlign: false,
      foregroundIntensity: sequence.loop([0,0,0,0,1]),
      backgroundIntensity: 1,
      size: "64mm",
      responseCondition: { size: "5mm" }
    }),
/*
    text({
      text: "ABCabc",
      angle: 0,
      outline: true,
      backgroundIntensity: 0.5,
      outlineIntensity: 1,
      outlineWidth: 0.25,
      xfontFamily: "Roboto",
      fontSize: "40mm",
      xfonts: [{
        family: "Roboto",
        resource: resource("font/Roboto-Regular.ttf","resources/font/Roboto-Regular.ttf"),
      }],
    })
*/
  ]
  
}