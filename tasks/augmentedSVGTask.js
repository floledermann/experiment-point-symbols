
const simpleTask = require("stimsrv/task/simpleTask");
const htmlButtons = require("stimsrv/ui/htmlButtons");
const resource = require("stimsrv/util/resource");
const displayConfig = require("stimsrv/stimulus/displayConfig");
const random = require("stimsrv/controller/random");

const DEFAULTS = {
  name: "SVG",
  description: "Display a SVG-based stimulus",
  choices: [{label: "Continue"}],
  iconScaleFactor: 1
};

function svgRenderer(options) {

  options = Object.assign({
    dimensions: [],
    defaultDimensions: ["width", "height"],
  }, options);

  options.dimensions = options.dimensions.concat(options.defaultDimensions);
  
  function augmentSVG(svg, condition, context) {
    let indices = [];
    for (let i=0; i<condition.countsByIndex.length; i++) {
      for (let j=0; j<condition.countsByIndex[i]; j++) indices.push(i);
    }
    indices = random.shuffle(indices)();
    
    let locations = svg.querySelectorAll(condition.locationSelector);
    
    for (let i=0; i<locations.length; i++) {
      
      // clear contents
      //locations[i].innerHTML = '';
      
      // let scaleFactor = sizePX / baseIconSize;
      // let offset = baseIconSize * 2 * pixelWidth / 1000 / 2; /// scaleFactor;
      let scaleFactor = condition.iconSize * condition.iconScaleFactor / condition.width;
      let offset = 15 / 2;
      let iconIndex = indices.next();
      if (!iconIndex.done) {
        locations[i].innerHTML = '<image href="' + resource.url(condition.icons[condition.iconSet[iconIndex.value]].src) + '" transform="scale(' + scaleFactor + ')" x="' + (-offset) + '" y="-' + offset + '" />';
      }
    };
  };
  
  let parent = null;
  let document = null;
  
  let renderer = function(context) {
    
    let display = displayConfig(Object.assign({}, options, {
      warnDefaults: options.warn
    }))(context);

    return {
      initialize: function(_parent) {
        parent = _parent;
        document = parent.ownerDocument;
      },
      
      render: function(condition) {
        
        let svg = document.createElement("object");
        
        for (let key of options.dimensions) {
          condition[key] = display.dimensionToScreenPixels(condition[key], condition);
        }

        svg.width = condition.width;
        svg.height = condition.height;
        svg.data = resource.url(condition.svg);
        
        svg.addEventListener("load", e => {
          augmentSVG(svg.getSVGDocument(), condition);
        });
        
        parent.innerHTML = "";    
        parent.appendChild(svg);
      }
    }
  }
  
  return renderer;
  
}


let renderer = config => svgRenderer({
  dimensions: ["iconSize"]
});

let buttonRenderer = config => canvasRenderer(renderIcon, {
  dimensions: ["size"],
  // make sure to specify width and height of the canvas in pixels
  width: 100,
  height: 50,
  // each condition received can be adapted to the button by overriding some of its properties
  overrideCondition: config.buttonCondition || {
    size: "8mm"
  }
});

let buttons = config => htmlButtons({
  buttons: condition => condition.choices.map(
    choice => ({
      label: choice.label,
      response: choice.response || choice,
      subUI: buttonRenderer(config)
    })
  )
});


const task = simpleTask({
  defaults: DEFAULTS, 
  //staticOptions: ["augmentSVG"],
  // The interfaces the task provides.
  // These can be remapped by the user with the "<interfaceName>Interface" configuration properties.
  interfaces: {
    display: renderer,
    monitor: renderer,
    response: buttons,
  },
  // Resources to load
  resources: config => config.resources
});

task.renderer = renderer();

module.exports = task;
