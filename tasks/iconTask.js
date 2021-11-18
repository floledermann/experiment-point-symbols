
const simpleTask = require("stimsrv/task/simpleTask");
const htmlButtons = require("stimsrv/ui/htmlButtons");
const canvasRenderer = require("stimsrv/stimulus/canvas/canvasRenderer");

const DEFAULTS = {
  name: "icon",
  description: "A simple Task to display an icon and present buttons for feedback",
  size: "5mm",
  backgroundIntensity: 1.0,
  foregroundIntensity: 0.0
};


function renderIcon(ctx, condition) {
  
  condition = Object.assign({
    size: 10,
  }, condition);
  
  ctx.beginPath();
  ctx.moveTo(-size,-size);
  ctx.lineTo(size,-size);
  ctx.lineTo(size,size);
  ctx.lineTo(-size,size);
  ctx.closePath();
  ctx.fill();
 
}

let renderer = config => canvasRenderer(renderIcon, {
  dimensions: ["size"]
});

let buttons = config => htmlButtons({
  buttons: condition => condition.choices.map(
    choice => ({
      label: choice,
      response: {text: choice} 
    })
  ),
  // CSS can be passed to the buttons with the "css" property upon task initialization
  // TODO: "css" should be a first-level member of the task frontend object, not added to individual UIs like now.
  css: config.css
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
