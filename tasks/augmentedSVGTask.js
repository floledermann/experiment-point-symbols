
const simpleTask = require("stimsrv/task/simpleTask");
const htmlButtons = require("stimsrv/ui/htmlButtons");
const resource = require("stimsrv/util/resource");
const displayConfig = require("stimsrv/stimulus/displayConfig");
const random = require("stimsrv/controller/random");

const DEFAULTS = {
  name: "SVG",
  description: "Display a SVG-based stimulus",
  choices: [{label: "Continue"}],
  iconScaleFactor: 1,
  baseMap: true
};

function svgRenderer(options) {

  options = Object.assign({
    dimensions: [],
    defaultDimensions: ["width", "height"],
  }, options);

  options.dimensions = options.dimensions.concat(options.defaultDimensions);
  
  function augmentSVG(svg, condition, context) {
     
    if (!condition.baseMap) {
      svg.rootElement.style.backgroundColor = "#ffffff";
      let layers = svg.querySelectorAll('svg > g');
      console.log(layers.length);
      for (let l of layers) {
        if (l.getAttribute("id") != "map: multipoint_rural") l.parentElement.removeChild(l);
      }
    }

    // TODO: figure out scale factor automatically
    // but manual override may be necessary, in case icon anchor is inside
    // a transformation (e.g. from QGIS)
    
    //let unitsPerPixel = svg.rootElement.viewBox.baseVal.width / condition.width;
    
    let locations = svg.querySelectorAll(condition.locationSelector);
    
    let icon = condition.iconData;
    let u = condition.iconBaseURL;
    let iconURLs = [u+icon.svg].concat(icon.similars.map(i => u+i.svg));
    
    for (let i=0; i<locations.length; i++) {
      
      // clear contents
      locations[i].innerHTML = '';
      
      let scaleFactor = condition.iconSize * condition.iconScaleFactor / condition.width;
      let offset = condition.iconOffset || 0;
      
      if (!Array.isArray(offset)) offset = [offset,offset];

      if (i < condition.indices.length) {
        locations[i].innerHTML = '<image href="' + iconURLs[condition.indices[i]] + '" width="' + icon.baseSize + '" height="' + icon.baseSize + '" transform="scale(' + scaleFactor + ')" x="' + (offset[0]) + '" y="' + offset[1] + '" />';
      }
    };
  };
  
  let parent = null;
  let document = null;
  let dppx = 1;
  
  let renderer = function(context) {
    
    let display = displayConfig(Object.assign({}, options, {
      warnDefaults: options.warn
    }))(context);

    return {
      initialize: function(_parent) {
        parent = _parent;
        document = parent.ownerDocument;
        dppx = document.defaultView.devicePixelRatio || 1; 
      },
      
      render: function(condition) {
        
        let svg = document.createElement("object");
        svg.style.visibility = "hidden";
        
        let header = document.createElement("header");
        header.innerHTML = 'Count: <img src="' + (condition.iconBaseURL + condition.iconData.svg) + 
                           '" style="width: 1.2em; height: 1.2em;"> ' + 
                           (condition.iconData.plural || (condition.iconData.label + "s"));
        header.style.fontSize = (display.dimensionToScreenPixels("4mm") / dppx) + "px";
        parent.style.backgroundColor = "rgb(90%,90%,90%)";
        header.style.color = "#000000";
        header.style.marginBottom = (display.dimensionToScreenPixels("1mm") / dppx) + "px";
        //header.style.position = "absolute";
        
        
        for (let key of options.dimensions) {
          console.log("Dimension: ", key, condition[key]);
          condition[key] = display.dimensionToScreenPixels(condition[key], condition);
        }

        svg.width = condition.width / dppx;
        svg.height = condition.height / dppx;
        svg.data = resource.url(condition.svg);
        
        svg.addEventListener("load", e => {
          augmentSVG(svg.getSVGDocument(), condition);
          svg.style.visibility = "visible";
        });
        
        parent.innerHTML = "";  
        parent.appendChild(header);        
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
  buttons: condition => ([0,1,2,3,4,5,6,7,8,9,10,11,12].map(
    num => ({
      label: num,
      response: { count: num }
    })
  )),
  header: condition => condition.iconData.title
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
