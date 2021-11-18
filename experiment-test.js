
const tumblingE = require("stimsrv/task/tumblingE");
const tao = require("stimsrv/task/aucklandoptotypes");
const text = require("stimsrv/task/text");  

const pause = require("stimsrv/task/pause");
const loop = require("stimsrv/task/loop");

const staircase = require("stimsrv/controller/staircase");
const random = require("stimsrv/controller/random");
const sequence = require("stimsrv/controller/sequence");

const filestorage = require("stimsrv/storage/filestorage");

const resource = require("stimsrv/util/resource");
const htmlButtons = require("stimsrv/ui/htmlButtons");

const centerline = require("./src/task/centerline.js");   
const dashedline = require("./src/task/dashedline.js");  

const setup = require("./setup-lab.js");

const messages = require("./messages.js");

const canvasRenderer = require("stimsrv/stimulus/canvas/canvasRenderer");


pause.defaults({
  background: "#eeeeff",
  textcolor: "#000000",
  buttondisplay: "response",
});

htmlButtons.defaults({
  clickSound: "/static/resource/resources/sound/click1.wav"
});

// stimsrv experiment definition
module.exports = {
  
  name: "HD Map Symbolization - Experiment 1",
  
  devices: setup.devices,
  roles: setup.roles,
  
  settings: {
    simpleBrowserRefresh: 5
  },
  
  storage: filestorage({
    destination: "./data"
  }),
  
  resources: [
    "resources/images",
    "resources/sound"
  ],
  
  css: `
    body.has-ui-response {
      font-size: 24px;
    }
    
    body.is-device-stationB {
      font-size: 24px;
    }
    
    .content {
      max-width: 17em;
      text-align: left;
    }
    
    .has-role-main .content {
      max-width: 32em;
      font-size: 1.5em;
    }
    
    .buttons button .sub-ui {
      margin-top: 0.4em;
    }
        
    @media (orientation: portrait) {
      .buttons {
        display: grid;
        grid-template-columns: repeat(1, 10em);
        margin-top: 6em;
      }
      
      .current-task-survey-language .buttons,
      .current-task-survey-vision .buttons {
        margin-top: 0;
        grid-template-columns: repeat(1, 14em);
      }

      .current-task-survey-vision .buttons {
        grid-template-columns: repeat(1, 16em);
      }
      
      .current-task-parallel .buttons,
      .current-task-dashedline .buttons {
        display: grid;
        grid-template-columns: repeat(1, 8em);
      }
      .current-task-text .buttons {
        display: grid;
        grid-template-columns: repeat(1, 10em);
      }
      .current-task-tao .buttons {
        margin-top: 4em;
        display: grid;
        grid-template-columns: repeat(2, 6em);
      }
      
      .current-task-tao .buttons button .sub-ui {
        margin-top: 0;
      }

      .current-task-text .buttons button {
        height: 2.5em;
        margin: 0.5em;
      }

    }
  `,
  
  tasks: [

    loop({
      
      context: {
        targetStation: sequence(["A","B","C","D"]),
        minReversals: 5,
      },
      
      tasks: [

        tao({
          vanishing: true,
          backgroundIntensity: 0.5,
          foregroundIntensity: 0.0,
          outlineIntensity: 1.0,
          size: staircase({
            startValue: "2.315mm",
            stepSize: 1.2,
            stepSizeFine: Math.sqrt(1.2),
            numReversalsFine: 3,
            stepType: "multiply",
            minReversals: context => context.minReversals,
          }),
          stimulusDisplay: context => "station" + context.targetStation + ".display"
        }),
        
      ]
    }),

    pause({
      message: {
        display: "The experiment was completed successfully.\nThank you for your participation!",
        response: "The experiment was completed successfully.\nThank you for your participation!",
        monitor: "Experiment ended."
      },
      button: "Store Results & Restart",
      buttondisplay: "control"
    }),
  ]
  
}