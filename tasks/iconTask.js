
const simpleTask = require("stimsrv/task/simpleTask");
const htmlButtons = require("stimsrv/ui/htmlButtons");
const canvasRenderer = require("stimsrv/stimulus/canvas/canvasRenderer");

const DEFAULTS = {
  name: "icon",
  description: "A simple Task to display an icon and present buttons for feedback",
  size: "5mm",
  backgroundIntensity: 1.0,
  foregroundIntensity: 0.0,
  pixelAlign: false,
  choices: [{label: "Continue"}]
};


function renderIcon(ctx, condition) {
  
  condition = Object.assign({
    size: 10,
  }, condition);
  
  let canvas2 = null, ctx2 = null;
  if (condition.threshold) {
    canvas2 = new OffscreenCanvas(ctx.canvas.width, ctx.canvas.height);
    ctx2 = canvas2.getContext("2d");
    ctx2.setTransform(ctx.getTransform());
  }
  
  let img = new Image();
  img.src = condition.baseURL + condition.icon;
  
  img.onload = () => {
    
    let scaleFactor = condition.scaleFactor || (1 / Math.max(img.width, img.height));
    let scale = (condition.size * scaleFactor) || 1;
    
    let w = img.width * scale,
        h = img.height * scale;
    
    console.log("size", condition.size);
    console.log("scaleFactor", scaleFactor);
    console.log("height", img.height);
    console.log("scale", scale);
    console.log("pixel height", img.height * scale);
    
    if (condition.offset) {
      ctx.translate(condition.offset[0], condition.offset[1]);
    }

    if (condition.pixelAlign) {
      ctx.drawImage(img, Math.round(-w/2), Math.round(-h/2), w, h);
    }
    else {
      ctx.drawImage(img, -w/2, -h/2, w, h);
    }
  
    if (condition.threshold) {
      let idata = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
      let data = idata.data;
      for (let i=0; i<data.length; i+=4) {
        let val = data[i] + data[i+1] + data[i+2];
        if (val > 3 * condition.threshold) {
          data[i] = 255;
          data[i+1] = 255;
          data[i+2] = 255;
        }
        else {
          data[i] = 0;
          data[i+1] = 0;
          data[i+2] = 0;
        }
        if (data[i+3] > condition.threshold) {
          //console.log(data[i+3]);
          data[i+3] = 255;
        }
        else {
          data[i+3] = 0;
        }
      }
      ctx.putImageData(idata, 0, 0);
      //ctx.drawImage(img, -w/2, -h/2, w, h);
    }
  };
  
 
}

let renderer = config => canvasRenderer(renderIcon, {
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
