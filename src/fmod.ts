import bankUrl from "../assets/fmod/Master.bank?url";
import bankStringsUrl from "../assets/fmod/Master.strings.bank?url";

const FMOD: any = {};
FMOD["preRun"] = preInitialize;
FMOD["onRuntimeInitialized"] = main;
//FMOD['INITIAL_MEMORY'] = 64*1024*1024;

let initialized = false;

let bankData: null | any = null;
let bankStringData: null | any = null;

export async function initFmod() {
  if (initialized) return;
  initialized = true;

  bankData = new Uint8Array(await (await fetch(bankUrl)).arrayBuffer());
  bankStringData = new Uint8Array(await (await fetch(bankStringsUrl)).arrayBuffer());

  (window as any).FMODModule(FMOD);
}

let gSystem: any;
let gSystemCore: any;

const events: any = {};

let gAudioResumed = false;

function CHECK_RESULT(result: any) {
  if (result == FMOD.OK) return;
  const msg = "FMOD error: '" + FMOD.ErrorString(result) + "'";
  console.error(msg);
  throw msg;
}

function preInitialize() {}

function main() {
  try {
    const out: any = {};

    console.log("Initializing FMOD");

    CHECK_RESULT(FMOD.Studio_System_Create(out));
    gSystem = out.val;
    CHECK_RESULT(gSystem.getCoreSystem(out));
    gSystemCore = out.val;

    CHECK_RESULT(gSystemCore.setDSPBufferSize(2048, 2));

    CHECK_RESULT(gSystemCore.getDriverInfo(0, null, null, out, null, null));
    CHECK_RESULT(gSystemCore.setSoftwareFormat(out.val, FMOD.SPEAKERMODE_DEFAULT, 0));

    // 1024 virtual channels
    CHECK_RESULT(gSystem.initialize(1024, FMOD.STUDIO_INIT_NORMAL, FMOD.INIT_NORMAL | FMOD.LIVEUPDATE, null));

    const bank = loadBank(bankData);
    const stringBank = loadBank(bankStringData);

    CHECK_RESULT(bank.loadSampleData());
    CHECK_RESULT(stringBank.loadSampleData());

    //loadEvent("event:/meow");
    //loadEvent("event:/music");

    // Set up iOS/Chrome workaround. WebAudio is not allowed to start unless screen is touched or button is clicked.
    function resumeAudio() {
      if (!gAudioResumed) {
        console.log("Resetting audio driver based on user input.");

        CHECK_RESULT(gSystemCore.mixerSuspend());
        CHECK_RESULT(gSystemCore.mixerResume());

        gAudioResumed = true;
      }
    }

    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    if (iOS) {
      window.addEventListener("touchend", resumeAudio, false);
    } else {
      document.addEventListener("click", resumeAudio);
    }

    console.log("FMOD initialized!");
    return FMOD.OK;
  } catch (e) {
    console.error("ERROR INITIALIZING FMOD:", e);
    throw e;
  }
}

export function playEvent(soundId: string) {
  loadEvent(soundId);
  const descr = events[soundId];
  if (!descr) {
    console.log("Event not found!", soundId);
    console.log("Available events:", Object.keys(events));
    return;
  }

  const eventInstance: any = {};
  CHECK_RESULT(descr.val.createInstance(eventInstance));
  CHECK_RESULT(eventInstance.val.start());
  CHECK_RESULT(eventInstance.val.release());

  /* start bg music: CHECK_RESULT( eventInstance.val.start() );
   * stop bg music: CHECK_RESULT( eventInstance.val.stop(FMOD.STUDIO_STOP_IMMEDIATE) );
   */
}

function loadBank(data: any) {
  const bankInfo = new FMOD.STUDIO_BANK_INFO();
  bankInfo.userdata = data;
  const bankHandle: any = {};
  CHECK_RESULT(
    gSystem.loadBankMemory(data, data.length, FMOD.STUDIO_LOAD_MEMORY, FMOD.STUDIO_LOAD_BANK_NORMAL, bankHandle),
  );
  return bankHandle.val;
}

function loadEvent(ev: any) {
  if (!events[ev]) {
    const descr: any = {};
    CHECK_RESULT(gSystem.getEvent(ev, descr));
    // Start loading explosion sample data and keep it in memory
    CHECK_RESULT(descr.val.loadSampleData());
    events[ev] = descr;
  }
}

export function updateFmod() {
  if (!gSystemCore || !gSystem) return;
  const result = gSystem.update();
  CHECK_RESULT(result);
}
