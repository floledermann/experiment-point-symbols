const puppeteerClient = require("stimsrv-client-puppeteer");

module.exports = {
  clients: {
    
    // in a real-world scenario you would use *one* of the two options below
    
    // stimsrv-client-puppeteer is the recommended client for old & simple browsers
    
    "browser-simple": puppeteerClient({
      // By default, puppeteer will open a browser window on the stimsrv server,
      // to ensure pixel-perfect rendering of the output.
      // If you want to suppress the puppeteer window and accept less accurate rendering, uncomment the next line.
      //headless: true,
    }),
        
  }
}
  
