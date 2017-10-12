const electron  = require('electron')
const parseXrandr = require('xrandr').default;
const child_process = require('child_process');
const pify = require('pify');
const exec = pify(child_process.exec);

const app = electron.app;

// Gets the screen information from xrandr and returns the first connected screen
async function getXrandrScreen(){
  const output = await exec('DISPLAY=:0.0 xrandr');
  const xScreens = parseXrandr(output);
  Object.keys(xScreens).forEach(o => { xScreens[o].output = o })
  const selectedScreen = Object.values(xScreens).find(d => d.connected && !!d.modes.length);
  if(!selectedScreen){
    throw new Error('No connected screens (according to xrandr)');
  }

  return selectedScreen;
}

// Gets the screen information from electron and returns the first screen
// Does not work with screens that have a scale factor <> 1
function getElectronScreen(){
  const screens = electron.screen.getAllDisplays();
  if(!screens.length){
    throw new Error('No connected screens (according to electron)');
  }

  const selectedScreen = screens[0];
  if(selectedScreen.scaleFactor !== 1){
    throw new Error('This test only works with screens that have scaleFactor = 1');
  }
  return selectedScreen;
}

// Compare the screen resolution received from xrandr with the one from electron
function compareXandE(xScreen, eScreen){
  const activeMode = xScreen.modes.find(m => m.current);
  if(!activeMode){
    throw new Error('Could not determine current active mode for xrandr output');
  }

  let result = `(${xScreen.output}) Xrandr mode: ${activeMode.width}x${activeMode.height}, Electron mode: ${eScreen.bounds.width}x${eScreen.bounds.height} => `
  if(activeMode.width === eScreen.bounds.width && activeMode.height === eScreen.bounds.height){
    result += 'OK'
  }else{
    result += 'NOT OK!'
  }
  console.log(result);
}

// Sets a new display mode (resolution)
async function pickNewMode(xScreen){
  const activeMode = xScreen.modes.find(m => m.current);
  const newMode = xScreen.modes.find(m => m.width !== activeMode.width || m.height !== activeMode.height);
  console.log(`Setting new mode on display (${xScreen.output}): ${newMode.width}x${newMode.height}`);
  await exec(`xrandr --output ${xScreen.output} --mode ${newMode.width}x${newMode.height}`)
  console.log(`Display mode changed`);
}

// Wait helper
function wait(ms){
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Run the actual program
app.on('ready', async () => {
  console.log("1. Getting and comparing screens from xrandr and electron");
  let xScreen = await getXrandrScreen();
  let eScreen = getElectronScreen();
  compareXandE(xScreen, eScreen);
  console.log('\n');
  await pickNewMode(xScreen);
  console.log('\n');
  console.log("2. Getting and comparing screens from xrandr and electron");
  xScreen = await getXrandrScreen();
  eScreen = getElectronScreen();
  compareXandE(xScreen, eScreen);
  console.log('\n');
  console.log("Waiting one second");
  console.log('\n');
  console.log("3. Getting and comparing screens from xrandr and electron");
  await wait(1000);
  xScreen = await getXrandrScreen();
  eScreen = getElectronScreen();
  compareXandE(xScreen, eScreen);

})
