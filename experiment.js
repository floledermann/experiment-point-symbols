
const tumblingE = require("stimsrv/task/tumblingE");

const pause = require("stimsrv/task/pause");
const loop = require("stimsrv/task/loop");

const staircase = require("stimsrv/controller/staircase");
const random = require("stimsrv/controller/random");
const sequence = require("stimsrv/controller/sequence");

const filestorage = require("stimsrv/storage/filestorage");

const resource = require("stimsrv/util/resource");
const htmlButtons = require("stimsrv/ui/htmlButtons");

const iconTask = require("./tasks/iconTask.js");
//const dashedline = require("./tasks/dashedline.js");

const setup = require("./setup-lab.js");

const messages = require("./messages.js");

pause.defaults({
  background: "#eeeeff",
  textcolor: "#000000",
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
    
    .buttons-tao {
      display: grid;
      grid-template-columns: repeat(5, 6em);
    }
    
    @media (orientation: portrait) {
      .buttons {
        display: grid;
        grid-template-columns: repeat(1, 10em);
        margin-top: 6em;
      }
    }
  `,
  
  tasks: [
/*
    pause({
      message: {
        "*": "Please start the experiment at the Main Monitor.",
         "main.display": messages.welcome
      },
    }),

    pause({
      message: {
        "*": "Please start the experiment at the Main Monitor.",
        "main.display": messages.survey1_age
      },
      button: htmlButtons([
        "16-25",
        "26-35",
        "36-45",
        "46-55",
        "56-65",
        "66 or older"
      ]),
      name: "survey-age",
      store: true
    }),  

    pause({
      message: {
        "*": "Please start the experiment at the Main Monitor.",
        "main.display": messages.survey2_gender
      },
      button: htmlButtons([
        "Female",
        "Male",
        "Non-binary or other",
        "Would prefer not to answer",
      ]),
      name: "survey-gender",
      store: true
    }),  

    pause({
      message: {
        "*": "Please start the experiment at the Main Monitor.",
        "main.display": messages.survey3_language
      },
      button: htmlButtons([
        "English",
        "German",
        "Greek",
        "Russian or other cyrillic",
        "Other European\nor Latin American",
        "Chinese",
        "Japanese",
        "Other Asian or African"
      ]),
      name: "survey-language",
      store: true
    }),  

    pause({
      message: {
        "*": "Please start the experiment at the Main Monitor.",
        "main.display": messages.survey4_vision
      },
      button: htmlButtons([
        "Normal vision",
        "Corrected to normal\n(wearing glasses or contact lenses suitable for reading)",
        "Short-sighted\n(far objects appear blurred)",
        "Far-sighted\n(near objects appear blurred)",
        "Other vision impairment",
        "Would prefer not to answer"
      ]),
      name: "survey-vision",
      store: true
    }),  

    pause({
      message: {
        "*": "Please start the experiment at the Main Monitor.",
        "main.display": messages.start1
      },
    }),  

    pause({
      message: {
        "*": "Please start the experiment at the Main Monitor.",
        "main.display": messages.start2
      },
    }),  

    pause({
      message: {
        "*": "Please start the experiment at the Main Monitor.",
        "main.display": messages.start3
      },
    }),  

    pause({
      message: {
        "*": "Please start the experiment at the Main Monitor.",
        "main.display": messages.start4
      },
    }),  
*/
    loop({
      
      context: {
        //targetStation: random.sequence(["A","B","C"]),
        targetStation: sequence(["A","B","C"]),
        minReversals: 5,
      },
      
      tasks: [
/* 
        pause({
          message: context => {
            let msg = {
              "*": "Please continue the experiment at Station " + context.targetStation + ".",
              "control": "Transition to Station " + context.targetStation
            };
            msg["station" + context.targetStation + ".display"] = "Continue the experiment here.\n\nPress «Continue» when you have arrived.";
            return msg;
          },
        }),  

        pause({
          message: context => {
            let msg = {
              "*": "Press «Continue» when you are ready at Station " + context.targetStation + ".",
              "control": "Transition to Station " + context.targetStation
            };
            msg["station" + context.targetStation + ".display"] = "You may take a short break and/or adjust the chair.\n\nPress «Continue» when you are ready to continue the experiment here.";
            return msg;
          },
        }),  

        pause({
          message: context => {
            let msg = {
              "*": "Press «Continue» when you are ready at Station " + context.targetStation + ".",
              "control": "Transition to Station " + context.targetStation
            };
            msg["station" + context.targetStation + ".display"] = "Press the button on the repsonse device that best matches the shown graphics.";
            return msg;
          },
        }),  
*/
/*
        tumblingE({
          // condition
          //rotate: random([-5,+5]), // add random rotation to prevent aliasing
          angle: random.shuffle([0,90,180,270], { loop: true, preventContinuation: true }),
          pixelAlign: false,
          foregroundIntensity: 0,
          backgroundIntensity: 1,
          size: staircase({
            startValue: "1.0mm",
            stepSize: 0.1,
            stepSizeFine: 0.05,
            numReversalsFine: 3,
            stepType: "linear", 
            minReversals: context => context.minReversals,
          }),
          // config (static)
          stimulusDisplay: context => "station" + context.targetStation + ".display"
        }),
*/
        // Icon task with real icons
        () => {
          
          let icons = {
            "Beer": "beer.svg",
            "Cemetery": "cemetery.svg",
            "Charging Station": "charging-station.svg"
          };
          
          let choices = Object.entries(icons).map(([k,v]) => ({label: k, icon: v, response: {icon: v}}));
          
          return iconTask({
            icon: random.shuffle(Object.values(icons), { loop: true, preventContinuation: true }),
            baseURL: resource.url("resources/icons/maki"),
            size: staircase({
              startValue: "5.0mm",
              stepSize: 0.1,
              stepSizeFine: 0.05,
              numReversalsFine: 3,
              stepType: "linear", 
              minReversals: context => context.minReversals,
            }),
            choices: choices,
            resources: "resources/icons/maki",
            interfaces: {
              display: deviceContext => deviceContext.targetStation == deviceContext.deviceId ? icon.renderer : null,
            },
          })
        },
        
        // TODO: Icon task with/without antialiasing
        
        // TODO: Subjective judgement of shape distortion without antialiasing
        
        // TODO: Icon task with shape contrast enhancement
        
        // TODO: Subjective judgement of shape distortion with contrast enhancement

        // TODO: Count icons on map
        
      ] // end of loop tasks
    }),

    pause({
      message: {
        "*": "Please continue the experiment at the Main Monitor.",
        "main.display": "Thank you for your effort!\n\nThe experiment was completed successfully.\nThank you for your participation!"
      },
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