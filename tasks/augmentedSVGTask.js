
const simpleTask = require("stimsrv/task/simpleTask");
const htmlButtons = require("stimsrv/ui/htmlButtons");

const DEFAULTS = {
  name: "SVG",
  description: "Display a SVG-based stimulus",
  choices: [{label: "Continue"}]
};

function svgRenderer(options) {

  options = Object.assign({
  }, options);
  
  let parent = null;
  let document = null;
  
  return {
    initialize: function(_parent) {
      parent = _parent;
      document = parent.ownerDocument;
    },
    
    render: function(condition) {
      
      let svg = document.createElement("object");
      
      svg.width = condition.width;
      svg.height = condition.height;
      svg.data = condition.svg;
      
      svg.addEventListener("load", e => {
        options.augmentSVG(svg.getSVGDocument(), condition);
      });
      
      parent.innerHTML = "";    
      parent.appendChild(svg);
    }
  }
  
}


let renderer = config => svgRenderer({
  dimensions: ["size"]
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
