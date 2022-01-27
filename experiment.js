
const tumblingE = require("stimsrv/task/tumblingE");
const imageTask = require("stimsrv/task/image");

const pause = require("stimsrv/task/pause");
const loop = require("stimsrv/task/loop");

const staircase = require("stimsrv/controller/staircase");
const random = require("stimsrv/controller/random");
const sequence = require("stimsrv/controller/sequence");

const Dimension = require("another-dimension");

const filestorage = require("stimsrv/storage/filestorage");

const resource = require("stimsrv/util/resource");
const htmlButtons = require("stimsrv/ui/htmlButtons");

const iconTask = require("./tasks/iconTask.js");
const augmentedSVGTask = require("./tasks/augmentedSVGTask.js");
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


const DEBUG = true;  

let ICON_SETS = {
  "maki-triangular": {
    set: "maki",
    baseSize: 15,
    icons: [
      { icon: "construction", label: "Construction Site", similars: "mountain,triangle,place-of-worship,volcano" },
      { icon: "mountain", label: "Mountain", similars: "triangle,construction,volcano,place-of-worship" },
      { icon: "place-of-worship", label: "Temple", similars: "triangle,construction,mountain,volcano" },
      { icon: "triangle", label: "Triangle", similars: "mountain,place-of-worship,construction,volcano" },
      { icon: "volcano", label: "Volcano", plural: "Volcanoes", similars: "mountain,construction,triangle,place-of-worship" },
    ]
  },
  "maki-rectangular": {
    set: "maki",
    baseSize: 15,
    icons: [
      { icon: "cemetery", label: "Cemetery", plural: "Cemeteries", similars: "waste-basket,elevator,fuel,charging-station" },
      { icon: "charging-station", label: "Charging Station", similars: "fuel,elevator,cemetery,waste-basket" },
      { icon: "elevator", label: "Elevator", similars: "waste-basket,cemetery,fuel,charging-station" },
      { icon: "fuel", label: "Petrol Station", similars: "charging-station,elevator,cemetery,waste-basket" },
      { icon: "waste-basket", label: "Waste Basket", similars: "elevator,cemetery,charging-station,fuel" },
    ]
  },
  "nps-vertical": {
    set: "nps",
    baseSize: 22,
    icons: [
      { icon: "mens-restroom", label: "Men's Restroom" },
      { icon: "monument", label: "Monument" },
      { icon: "statue", label: "Statue" },
      { icon: "wilderness", label: "Large Tree" },
      { icon: "womens-restroom", label: "Women's Restroom" },
    ]
  },
  "osm-castles": {
    set: "osm",
    baseSize: 14,
    icons: [
      { icon: "castle", label: "Castle", similars: "fortress,city_gate,palace,fort" },
      { icon: "city_gate", label: "City Gate", similars: "palace,fortress,castle,fort" },
      { icon: "fort", label: "Fort", similars: "fortress,castle,palace,city_gate" },
      { icon: "fortress", label: "Fortress", plural: "Fortresses", similars: "castle,fort,city_gate,palace" },
      { icon: "palace", label: "Palace", similars: "city_gate,castle,fort,fortress" },
    ]
  },
};


Object.values(ICON_SETS).forEach(s => s.icons.forEach(i => {
  i.svg = s.set + "/" + i.icon + ".svg";
  i.baseSize = s.baseSize;
}));

Object.values(ICON_SETS).forEach(s => s.icons.forEach(i => {
  if (i.similars) {
    i.similars = i.similars.split(",").map(x => {
      // clone icon and remove similars to avoid infinite tree
      let i2 = Object.assign({}, s.icons.find(i2 => i2.icon == x));
      i2.similars = undefined;
      return i2;
    });
  }
}));

// sizes in mm        
let SIZES = [2, 1.5, 1.25, 1, 0.9, 0.8, 0.7, 0.6, 0.5];

// for debug on monitor, double size
if (DEBUG) SIZES = SIZES.map(s => 2*s);

SIZES = SIZES.map(s => s+"mm");

//let PIXEL_SIZES = [20,19,18,17,16,15,14,13,12,11,10,9,8,7,6].map(s => s+"px");

let PIXEL_SIZES = {
  "A": [12,10,9,8,7,6].map(s => s+"px"),
  "B": [20,18,16,14,13,12,11,10,9,8,7,6].map(s => s+"px"),
  "C": [20,18,17,15,14,12,11,9,8,7,6].map(s => s+"px"),
}

let MAP_SIZES = [1,2,3,5,6,7,8].map(i => SIZES[i]);

// TODO check/optimize results output
// TODO subjective tasks

// helper functions for svg map task
// calculate random indices for a given number of targetIcons, map positions and icon types

// first icon is target, count is given by condition
// of remaining spaces, use half (rounded up) for next, recursively
function calculateCountsByIndex(firstCount, totalCount, numberOfKinds) {
  let countsByIndex = [firstCount];
  let remaining = totalCount - firstCount;
  for (let i=0; i<numberOfKinds-1; i++) {
    let c = Math.ceil(remaining / 2);
    countsByIndex.push(c);
    remaining -= c;
  }
  countsByIndex.push(remaining);
  return countsByIndex;
}

// generate array with random indices (0..numberOfKinds-1) for the given parameters
// according to above rules
function randomIndices(firstCount, totalCount, numberOfKinds) {
  let countsByIndex = calculateCountsByIndex(firstCount, totalCount, numberOfKinds);
  let indices = [];
  for (let i=0; i<countsByIndex.length; i++) {
    for (let j=0; j<countsByIndex[i]; j++) indices.push(i);
  }
  return Array.from(random.shuffle(indices)());
}

function legendHeader(baseURL, icon) {
  let legendHTML = `<div><img src="${baseURL + icon.svg}" width="20" height="20"> ${icon.label}</div>`;
  for (let sim of icon.similars) {
    legendHTML += `<div><img src="${baseURL + sim.svg}" width="20" height="20"> ${sim.label}</div>`;
  }
  return `<h1>Count the number of:<br>
          <img src="${baseURL + icon.svg}" width="30" height="30">
          ${icon.plural || (icon.label + "s")}</h1>
          <div class="legend">${legendHTML}</div>`
}

// stimsrv experiment definition
module.exports = {
  
  name: "HD Map Symbolization - Experiment 1",
  
  devices: setup.devices,
  roles: setup.roles,
  
  settings: {
    simpleBrowserRefresh: 5
  },
  
  serverConfigFile: "stimsrv-config.js",
  
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

    /* buttons for icons selection - mayby define in variable and assign in each task, or add selector? */
    .has-ui-response .buttons button {
      xheight: 5.8em;
    }
    .has-ui-response .buttons button .label {
      xheight: 2em;
    }
    
    @media (orientation: portrait) {
      .buttons {
        display: grid;
        grid-template-columns: repeat(1, 12em);
        margin-top: 2em;
        font-size: 0.8em;
      }
      .legend {
        font-size: 0.8em;
      }
      header img {
        vertical-align: -0.15em;
      }
      header h1 img {
        vertical-align: -0.2em;
      }
      body[class*="current-task-icon-basemap-"] h1 {
        font-size: 1em;
        margin-top: 2.5em;
      }     
      body[class*="current-task-icon-basemap-"] .buttons {
        grid-template-columns: repeat(3, 5em);
        grid-template-rows: repeat(5, 3em);
        font-size: 1em;
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
      },
      
      tasks: [

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
/* 
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

        tumblingE({
          // condition
          //rotate: random([-5,+5]), // add random rotation to prevent aliasing
          angle: random.shuffle([0,90,180,270], { loop: true, preventContinuation: true }),
          pixelAlign: false,
          foregroundIntensity: 0,
          backgroundIntensity: 1,
          size: context => {
            // hack: if we are not at station A, immediately jump to next task
            if (context.targetStation != "B") return () => null;
            return staircase({
              startValue: "1.0mm",
              stepSize: 0.1,
              stepSizeFine: 0.05,
              numReversalsFine: 3,
              stepType: "linear", 
              minReversals: DEBUG ? 2 : 5,
            })(context)
          },
          // config (static)
          stimulusDisplay: context => "station" + context.targetStation + ".display"
        }),


        // Icon task with real icons

        () => {
          
          let SET = ICON_SETS["maki-rectangular"];
          let STEP_COUNT = 4;
          
          return iconTask({
            name: "icon-default-" + SET.set,
            icon: random.shuffle(SET.icons.map(i => i.svg), { multiple: 2, loop: true, preventContinuation: true }),
            choices: SET.icons.map((i) => ({label: i.label, icon: i.svg, response: {icon: i.svg}})),
            size: sequence(SIZES, { stepCount: STEP_COUNT }),
            scaleFactor: 1/SET.baseSize,
            offset: sequence.array([random.range(-0.5,0.5), random.range(-0.5,0.5)]), // random subpixel offset
            buttonCondition: { size: "8mm", offset: null, threshold: false },
            baseURL: resource.url("resources/icons/"),
            resources: "resources/icons",
            interfaces: {
              display: config => context => "station" + context.targetStation == context.role ? iconTask.renderer(context) : null
            },
          })
        },

        () => {
          
          let SET = ICON_SETS["maki-triangular"];
          let STEP_COUNT = 4;
          
          return iconTask({
            name: "icon-default-" + SET.set,
            icon: random.shuffle(SET.icons.map(i => i.svg), { loop: true, preventContinuation: false }),
            choices: SET.icons.map((i) => ({label: i.label, icon: i.svg, response: {icon: i.svg}})),
            size: sequence(SIZES, { stepCount: STEP_COUNT }),
            scaleFactor: 1/SET.baseSize,
            offset: sequence.array([random.range(-0.5,0.5), random.range(-0.5,0.5)]), // random subpixel offset
            buttonCondition: { size: "8mm", offset: null, threshold: false },
            baseURL: resource.url("resources/icons/"),
            resources: "resources/icons",
            interfaces: {
              display: config => context => "station" + context.targetStation == context.role ? iconTask.renderer(context) : null
            },
          })
        },

        () => {
          
          let SET = ICON_SETS["nps-vertical"];
          let STEP_COUNT = 2;
          
          return iconTask({
            name: "icon-default-" + SET.set,
            icon: random.shuffle(SET.icons.map(i => i.svg), { loop: true, preventContinuation: false }),
            choices: SET.icons.map((i) => ({label: i.label, icon: i.svg, response: {icon: i.svg}})),
            size: sequence(SIZES, { stepCount: STEP_COUNT }),
            scaleFactor: 1/SET.baseSize,
            offset: sequence.array([random.range(-0.5,0.5), random.range(-0.5,0.5)]), // random subpixel offset
            buttonCondition: { size: "8mm", offset: null, threshold: false },
            baseURL: resource.url("resources/icons/"),
            resources: "resources/icons",
            interfaces: {
              display: config => context => "station" + context.targetStation == context.role ? iconTask.renderer(context) : null
            },
          })
        },

        () => {
          
          let SET = ICON_SETS["osm-castles"];
          let STEP_COUNT = 2;
          
          return iconTask({
            name: "icon-default-" + SET.set,
            icon: random.shuffle(SET.icons.map(i => i.svg), { loop: true, preventContinuation: false }),
            choices: SET.icons.map((i) => ({label: i.label, icon: i.svg, response: {icon: i.svg}})),
            size: sequence(SIZES, { stepCount: STEP_COUNT }),
            scaleFactor: 1/SET.baseSize,
            offset: sequence.array([random.range(-0.5,0.5), random.range(-0.5,0.5)]), // random subpixel offset
            buttonCondition: { size: "8mm", offset: null, threshold: false },
            baseURL: resource.url("resources/icons/"),
            resources: "resources/icons",
            interfaces: {
              display: config => context => "station" + context.targetStation == context.role ? iconTask.renderer(context) : null
            },
          })
        },

        // Icon task with threshold
       
        () => {
          
          let SET = ICON_SETS["maki-rectangular"];
          let STEP_COUNT = 4;
          
          return iconTask({
            name: "icon-threshold-" + SET.set,
            icon: random.shuffle(SET.icons.map(i => i.svg), { loop: true, preventContinuation: false }),
            choices: SET.icons.map((i) => ({label: i.label, icon: i.svg, response: {icon: i.svg}})),
            size: context => {
              return sequence(PIXEL_SIZES[context.targetStation], { stepCount: STEP_COUNT })(context)
            },
            scaleFactor: 1/SET.baseSize,
            pixelAlign: true,
            threshold: 128,
            buttonCondition: { size: "8mm", offset: null, threshold: false },
            baseURL: resource.url("resources/icons/"),
            resources: "resources/icons",
            interfaces: {
              display: config => context => "station" + context.targetStation == context.role ? iconTask.renderer(context) : null
            },
          })
        },

        // Icon task with hinting

        () => {
          
          let SET = ICON_SETS["maki-rectangular"];
          let STEP_COUNT = 4;
          
          return iconTask({
            name: "icon-hinted-" + SET.set,
            iconId: random.shuffle(SET.icons.map(i => SET.set + "/" + i.icon), { loop: true, preventContinuation: false }),
            choices: SET.icons.map((i) => ({label: i.label, icon: "icons/" + i.svg, response: {iconId: SET.set + "/" + i.icon}})),
            size: context => {
              return sequence(PIXEL_SIZES[context.targetStation], { stepCount: STEP_COUNT })(context)
            },
            pixelAlign: true,
            buttonCondition: context => condition => ({ size: "8mm", icon: "icons/" + condition.iconId + ".svg" }),
            transformCondition: context => condition => {
              condition.icon = "icons_hinted/" + condition.iconId + "_" + Math.round(parseFloat(condition.size)) + ".png"
            },
            baseURL: resource.url("resources/"),
            resources: ["resources/icons", "resources/icons_hinted"],
            interfaces: {
              display: config => context => "station" + context.targetStation == context.role ? iconTask.renderer(context) : null
            },
          })
        },
        
        () => {
          
          let SET = ICON_SETS["maki-triangular"];
          let STEP_COUNT = 4;
          
          return iconTask({
            name: "icon-hinted-" + SET.set,
            iconId: random.shuffle(SET.icons.map(i => SET.set + "/" + i.icon), { loop: true, preventContinuation: false }),
            choices: SET.icons.map((i) => ({label: i.label, icon: "icons/" + i.svg, response: {iconId: SET.set + "/" + i.icon}})),
            size: context => {
              return sequence(PIXEL_SIZES[context.targetStation], { stepCount: STEP_COUNT })(context)
            },
            pixelAlign: true,
            buttonCondition: context => condition => ({ size: "8mm", icon: "icons/" + condition.iconId + ".svg" }),
            transformCondition: context => condition => {
              condition.icon = "icons_hinted/" + condition.iconId + "_" + Math.round(parseFloat(condition.size)) + ".png"
            },
            baseURL: resource.url("resources/"),
            resources: ["resources/icons", "resources/icons_hinted"],
            interfaces: {
              display: config => context => "station" + context.targetStation == context.role ? iconTask.renderer(context) : null
            },
          })
        },
        
        // Contrast-enhanced icons
        // TODO: takes too long on low resolution
        () => {
                    
          let SET = ICON_SETS["nps-vertical"];
          let STEP_COUNT = 4;
          
          return iconTask({
            name: "icon-enhanced-" + SET.set,
            iconId: random.shuffle(SET.icons.map(i => SET.set + "/" + i.icon), { loop: true, preventContinuation: false }),
            choices: SET.icons.map((i) => ({label: i.label, icon: "icons/" + i.svg, response: {iconId: SET.set + "/" + i.icon}})),
            size: sequence(SIZES, { stepCount: STEP_COUNT }),
            scaleFactor: 1/SET.baseSize,
            offset: sequence.array([random.range(-0.5,0.5), random.range(-0.5,0.5)]), // random subpixel offset
            buttonCondition: context => condition => ({ size: "8mm", offset: null, icon: "icons/" + condition.iconId + ".svg" }),
            transformCondition: context => condition => {
              condition.icon = "icons_enhanced/" + condition.iconId + ".svg"
            },
            baseURL: resource.url("resources/"),
            resources: "resources/icons_enhanced",
            interfaces: {
              display: config => context => "station" + context.targetStation == context.role ? iconTask.renderer(context) : null
            },
          })
        },

        // TODO: Subjective judgement of shape distortion without antialiasing
        
        // TODO: Subjective judgement of shape distortion with contrast enhancement
        
        // "How confident are you that the shown graphics resembles exactly the icon: "

        // Count icons on map
        
        () => {
        
          let BASE_MAPS = "map_1,map_2,map_3,map_4".split(",").map(f => "resources/basemaps/" + f + ".svg");       
          let SET = ICON_SETS["maki-triangular"];
          let STEP_COUNT = 4;
                    
          return augmentedSVGTask({
            name: "icon-basemap-" + SET.set,
            svg: random.shuffle(BASE_MAPS, {loop: true}),
            width: "60mm",
            height: "60mm",
            //countsByIndex: countsByIndex,
            count: random.pick([2,3,4,5,6]),
            iconData: random.pick(SET.icons),
            iconBaseURL: resource.url("resources/icons/"),
            locationSelector: 'g[id="map: multipoint_rural"] > g[fill="#ff0707"]',
            baseMap: random.shuffle([true, false], {loop: true}),
            // maybe do a coarse pass, store result in context and do a fine pass next
            iconSize: sequence(MAP_SIZES, {stepCount: STEP_COUNT }),
            // TODO: ???? is this needed?
            iconScaleFactor: 77,
            // static configuration
            transformCondition: context => condition => {
              // count is number of first icon, always 12 spots
              condition.indices = randomIndices(condition.count, 12, condition.iconData.similars.length);
            },
            dimensions: "iconSize",
            interfaces: {
              display: config => context => 
                "station" + context.targetStation == context.role ? augmentedSVGTask.renderer(context) : null,
              response: config => htmlButtons({
                header: cond => legendHeader(cond.iconBaseURL, cond.iconData),
                buttons: "0,1,2,3,4,5,6,7,8,9,10,11,12".split(",")
              })
            },
            resources: [
              "resources/basemaps/",
              "resources/icons"
            ]
          });
        
        },
        
        () => {
        
          let BASE_MAPS = "map_1,map_2,map_3,map_4".split(",").map(f => "resources/basemaps/" + f + ".svg");       
          let SET = ICON_SETS["maki-rectangular"];
          let STEP_COUNT = 4;
                    
          return augmentedSVGTask({
            name: "icon-basemap-" + SET.set,
            svg: random.shuffle(BASE_MAPS, {loop: true}),
            width: "60mm",
            height: "60mm",
            //countsByIndex: countsByIndex,
            count: random.pick([2,3,4,5,6]),
            iconData: random.pick(SET.icons),
            iconBaseURL: resource.url("resources/icons/"),
            locationSelector: 'g[id="map: multipoint_rural"] > g[fill="#ff0707"]',
            baseMap: random.shuffle([true, false], {loop: true}),
            // maybe do a coarse pass, store result in context and do a fine pass next
            iconSize: sequence(MAP_SIZES, {stepCount: STEP_COUNT }),
            // TODO: ???? is this needed?
            iconScaleFactor: 77,
            // static configuration
            transformCondition: context => condition => {
              // count is number of first icon, always 12 spots
              condition.indices = randomIndices(condition.count, 12, condition.iconData.similars.length);
            },
            dimensions: "iconSize",
            interfaces: {
              display: config => context => 
                "station" + context.targetStation == context.role ? augmentedSVGTask.renderer(context) : null,
              response: config => htmlButtons({
                header: cond => legendHeader(cond.iconBaseURL, cond.iconData),
                buttons: "0,1,2,3,4,5,6,7,8,9,10,11,12".split(",")
              })
            },
            resources: [
              "resources/basemaps/",
              "resources/icons"
            ]
          });
        
        },
        
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