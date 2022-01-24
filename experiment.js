
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

let ICON_SETS = {
  "maki-triangular": {
    set: "maki",
    baseSize: 15,
    icons: [
      { icon: "construction", label: "Construction Site" },
      { icon: "mountain", label: "Mountain" },
      { icon: "place-of-worship", label: "Temple" },
      { icon: "triangle", label: "Triangle" },
      { icon: "volcano", label: "Volcano" },
    ]
  },
  "maki-rectangular": {
    set: "maki",
    baseSize: 15,
    icons: [
      { icon: "cemetery", label: "Cemetery" },
      { icon: "charging-station", label: "Charging Station" },
      { icon: "elevator", label: "Elevator" },
      { icon: "fuel", label: "Petrol Station" },
      { icon: "waste-basket", label: "Waste Basket" },
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
      { icon: "castle", label: "Castle" },
      { icon: "city_gate", label: "City Gate" },
      { icon: "fort", label: "Fort" },
      { icon: "fortress", label: "Fortress" },
      { icon: "palace", label: "Palace" },
    ]
  },
};

Object.values(ICON_SETS).forEach(s => s.icons.forEach(i => {
  i.svg = s.set + "/" + i.icon + ".svg";
}));

// sizes in mm        
let SIZES = [2, 1.5, 1.25, 1, 0.9, 0.8, 0.7, 0.6, 0.5];

// for debug on monitor, double size
//SIZES = SIZES.map(s => 2*s);

SIZES = SIZES.map(s => s+"mm");

let PIXEL_SIZES = [20,19,18,17,16,15,14,13,12,11,10,9,8,7,6].map(s => s+"px");

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

    /* buttons for icons selection - mayby define in variable and assign in each task, or add selector? */
    .has-ui-response .buttons button {
      height: 5.8em;
    }
    .has-ui-response .buttons button .label {
      height: 2em;
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
        minReversals: 2, // 5
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
          
          let SET = ICON_SETS["maki-rectangular"];
          let STEP_COUNT = 4;
          
          // TO DO: add random offset -0.5...+0.5 px
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
            size: sequence(PIXEL_SIZES, { stepCount: STEP_COUNT }),
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
            size: sequence(PIXEL_SIZES, { stepCount: STEP_COUNT }),
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
        
          let baseMaps = "map_1,map_2,map_3,map_4".split(",").map(f => "resources/basemaps/" + f + ".svg");
          
          let iconData = [
            // icon                   //size  // title             // similars
            /*
            ["maki/beer",             15,     "Beer Garden",      "cemetery,charging-station,fuel"],
            ["maki/charging-station", 15,     "Charging Station", "fuel,cemetery,beer"],
            ["maki/fuel",             15,     "Petrol Station",   "charging-station,cemetery,beer"],
            ["maki/cemetery",         15,     "Cemetery",         "beer,charging-station,fuel"],
            */

            ["maki/cemetery",         15,     "Cemetery",         "elevator,waste-basket,prison"],
            ["maki/prison",           15,     "Prison",           "elevator,cemetery,waste-basket"],
            ["maki/elevator",         15,     "Elevator",         "prison,cemetery,waste-basket"],
            ["maki/waste-basket",     15,     "Waste Basket",     "cemetery,elevator,prison"],
            
            ["osm/bird_hide",         14,     "Bird Watching Space", "castle,fortress,fort,city_gate"],
            ["osm/castle",            14,     "Castle",              "fortress,bird_hide,fort,city_gate"],
            ["osm/city_gate",         14,     "City Gate",           "fortress,castle,fort,bird_hide"],
            ["osm/fort",              14,     "Fort",                "bird_hide,fortress,castle,city_gate"],
            ["osm/fortress",          14,     "Fortress",            "castle,bird_hide,fort,city_gate"],

            ["maki/airfield",         15,     "Model Airplane Shop",  "furniture,airport,hospital"],
            ["maki/airport",          15,     "Airport",              "hospital,airfield,furniture"],
            ["maki/hospital",         15,     "Hospital",             "airport,airfield,furniture"],
            ["maki/furniture",        15,     "Furniture Shop",       "airfield,hospital,airport"],
            
            
          ].map(([i,s,t,sim]) => ({
            icon: i,
            set: i.split("/")[0],
            baseSize: s,
            title: t,
            similars: sim.split(",")
          }));
                    
          return augmentedSVGTask({
            name: "SVG-Basemap",
            svg: random.shuffle(baseMaps, {loop: true}),
            width: "80mm",
            height: "80mm",
            //countsByIndex: countsByIndex,
            count: random.pick([2,3,4,5,6]),
            iconData: random.pick(iconData),
            iconBaseURL: resource.url("resources/icons/"),
            locationSelector: 'g[id="map: multipoint_rural"] > g[fill="#ff0707"]',
            baseMap: sequence.loop([true, false]),
            // maybe do a coarse pass, store result in context and do a fine pass next
            iconSize: sequence(["3mm","2.5mm","2mm","1.5mm","1mm"], {stepCount: 4 }),
            /*
            iconSize: staircase({
              startValue: "3mm",
              stepType: "linear",
              stepSize: 0.1,
              stepSizeFine: 0.05,
              numReversalsFine: 3,
              minReversals: context => context.minReversals,
              isResponseCorrect: context => (cond, resp) => cond.countsByIndex[0] == +resp.label
            }),*/
            iconScaleFactor: 77,
            // static configuration
            transformCondition: context => condition => {
              console.log(condition.count);
              // first icon is target, count is given by condition
              // of remaining spaces, use half (rounded up) for next, recursively
              // (based on 12 spots)
              let countsByIndex = [condition.count];
              let remaining = 12 - condition.count;
              for (let i=0; i<condition.iconData.similars.length-1; i++) {
                let c = Math.ceil(remaining / 2);
                countsByIndex.push(c);
                remaining -= c;
              }
              countsByIndex.push(remaining);
              console.log(countsByIndex);
              
              let indices = [];
              for (let i=0; i<countsByIndex.length; i++) {
                for (let j=0; j<countsByIndex[i]; j++) indices.push(i);
              }
              condition.indices = Array.from(random.shuffle(indices)());
            },
            dimensions: "iconSize",
            interfaces: {
              response: config => htmlButtons({
                header: cond => {
                  let legendHTML = `<div><img src="${cond.iconBaseURL + cond.iconData.icon}.svg" width="20" height="20"> ${cond.iconData.title}</div>`;
                  for (let sim of cond.iconData.similars) {
                    let key = cond.iconData.set + "/" + sim;
                    let entry = iconData.find(e => e.icon == key);
                    legendHTML += `<div><img src="${cond.iconBaseURL + entry.icon}.svg" width="20" height="20"> ${entry.title}</div>`;
                  }
                  return `<h1>Count the number of:<br>
                          <img src="${cond.iconBaseURL + cond.iconData.icon}.svg" width="30" height="30">
                          ${cond.iconData.title}</h1>
                          <div class="legend">${legendHTML}</div>`
                },
                buttons: "0,1,2,3,4,5,6,7,8,9,10,11,12".split(",")
              })
            },
            resources: [
              "resources/basemaps/",
              "resources/icons"
            ]
          });
        
        }
        
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