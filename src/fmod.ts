import bankUrl from "../assets/fmod/Master.bank?url";
import bankStringsUrl from "../assets/fmod/Master.strings.bank?url";

var FMOD = {};
FMOD["preRun"] = prerun;
FMOD["onRuntimeInitialized"] = main;
//FMOD['INITIAL_MEMORY'] = 64*1024*1024;

let initted = false;

var bankData = null;
var bankStringData = null;

export async function initFmod() {
  if (initted) return;
  initted = true;

  bankData = new Uint8Array(await (await fetch(bankUrl)).arrayBuffer());
  bankStringData = new Uint8Array(
    await (await fetch(bankStringsUrl)).arrayBuffer(),
  );

  FMODModule(FMOD);
}

let gSystem;
let gSystemCore;

var events = {};

// Boolean to avoid resetting FMOD on IOS/Chrome every time screen is touched.
let gAudioResumed = false;

// Simple error checking function for all FMOD return values.
function CHECK_RESULT(result) {
  if (result == FMOD.OK) return;
  var msg = "FMOD error: '" + FMOD.ErrorString(result) + "'";
  console.error(msg);
  throw msg;
}

function prerun() {}

function main() {
  var outval = {};

  console.log("Initializing FMOD");

  CHECK_RESULT(FMOD.Studio_System_Create(outval));
  gSystem = outval.val;
  CHECK_RESULT(gSystem.getCoreSystem(outval));
  gSystemCore = outval.val;

  CHECK_RESULT(gSystemCore.setDSPBufferSize(2048, 2));

  CHECK_RESULT(gSystemCore.getDriverInfo(0, null, null, outval, null, null));
  CHECK_RESULT(
    gSystemCore.setSoftwareFormat(outval.val, FMOD.SPEAKERMODE_DEFAULT, 0),
  );

  // 1024 virtual channels
  CHECK_RESULT(
    gSystem.initialize(1024, FMOD.STUDIO_INIT_NORMAL, FMOD.INIT_NORMAL, null),
  );

  loadBank(bankData);
  loadBank(bankStringData);

  loadEvent("event:/meow");

  // Set up iOS/Chrome workaround.  Webaudio is not allowed to start unless screen is touched or button is clicked.
  function resumeAudio() {
    if (!gAudioResumed) {
      console.log("Resetting audio driver based on user input.");

      CHECK_RESULT(gSystemCore.mixerSuspend());
      CHECK_RESULT(gSystemCore.mixerResume());

      gAudioResumed = true;
    }
  }

  var iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  if (iOS) {
    window.addEventListener("touchend", resumeAudio, false);
  } else {
    document.addEventListener("click", resumeAudio);
  }

  console.log("FMOD initialized!");
  return FMOD.OK;
}

// Function called when user presses HTML Play Sound button, with parameter 0, 1 or 2.
export function playEvent(soundid, ambient) {
  const descr = events[soundid];
  if (!descr) return;

  // One-shot event
  var eventInstance = {};
  CHECK_RESULT(descr.val.createInstance(eventInstance));
  CHECK_RESULT(eventInstance.val.start());

  // Release will clean up the instance when it completes
  CHECK_RESULT(eventInstance.val.release());

  /* start bg music: CHECK_RESULT( eventInstance.val.start() );
   * stop bg music: CHECK_RESULT( eventInstance.val.stop(FMOD.STUDIO_STOP_IMMEDIATE) );
   */
}
window.playEvent = playEvent;

// Helper function to load a bank by name.
function loadBank(data) {
  var bankInfo = new FMOD.STUDIO_BANK_INFO();
  bankInfo.userdata = data;
  var bankhandle = {};
  CHECK_RESULT(
    gSystem.loadBankMemory(
      data,
      data.length,
      FMOD.STUDIO_LOAD_MEMORY,
      FMOD.STUDIO_LOAD_BANK_NORMAL,
      bankhandle,
    ),
  );
}

function loadEvent(ev) {
  if (!events[ev]) {
    const descr = {};
    CHECK_RESULT(gSystem.getEvent(ev, descr));
    // Start loading explosion sample data and keep it in memory
    CHECK_RESULT(descr.val.loadSampleData());
    events[ev] = descr;
  }
}

// Called from main, on an interval that updates at a regular rate (like in a game loop).
// Prints out information, about the system, and importantly calles System::udpate().
export function updateFmod() {
  if (!gSystemCore || !gSystem) return;
  const result = gSystem.update();
  CHECK_RESULT(result);
}
