{
  var POINTS = 9; // the number of wave points
  var LINE_WIDTH = 10; // wave's line width
  var FOCUS_RADIUS; // diameter of our breathing focus circle
  var FOCUS_LINE;
  var FOCUS_LEFT;
  var FOCUS_DIAM;
  var TWO_PI = Math.PI * 2; // used for circular arc

  var theCanvas = document.getElementById("canvasOne");
  var theTitle = document.getElementById("title");
  var theControls = document.getElementById("controls");
  var theParams = document.getElementById("params");

  var inhaleSecs = (theParams.inhale.value = 6);
  var holdinSecs = (theParams.hold.value = 0);
  var exhaleSecs = (theParams.exhale.value = 6);
  var holdoutSecs = (theParams.pause.value = 0);
  var waveSecs;
  var waveMsecs;
  var pixelsPerMsec;
  var hMin; // upper wave height
  var hMax; // lower wave height

  if (!theCanvas || !theCanvas.getContext) {
    alert("No Canvas Support!");
  }
  var c = theCanvas.getContext("2d"); // canvas context

  var phaseStart = Date.now(); // get our starting time
  var h; // canvas height (global)
  var w; // canvas width (global)
  var middle; // canvas middle width
  var x = new Array(POINTS); // array of horizontal positions
  var y = new Array(POINTS); // array of vertical positions

  setWaveParams();
  currentInterval = setInterval("showCurrentWave()", 1000 / 30); // 30 FPS
  //	showCurrentWave();
}

function setWaveParams() {
  w = theCanvas.width =
    window.innerWidth ||
    document.documentElement.clientWidth ||
    document.body.clientWidth;
  h =
    window.innerHeight ||
    document.documentElement.clientHeight ||
    document.body.clientHeight;
  middle = w / 2; // canvas half-width

  FOCUS_RADIUS = 40; // set the diameter of our breathing focus circle
  FOCUS_LINE = 10; // set the diameter of our
  FOCUS_LEFT = middle - FOCUS_RADIUS - FOCUS_LINE / 2;
  FOCUS_DIAM = FOCUS_RADIUS * 2 + FOCUS_LINE;

  // size and position the various page items...

  theCanvas.height = Math.round(h / 2 + FOCUS_DIAM * 2);
  canvasTop = Math.round(h / 4 - FOCUS_DIAM);
  canvasBottom = canvasTop + theCanvas.height;
  theCanvas.style.top = canvasTop + "px";
  theTitle.style.top = canvasTop / 2 - 30 + "px";
  theControls.style.top = canvasBottom - FOCUS_RADIUS + 1 + "px";

  hMin = FOCUS_RADIUS + FOCUS_LINE; // Math.round(0.25 * h);			// upper wave height
  hMax = (FOCUS_RADIUS + FOCUS_LINE) * 2 + h / 2; // lower wave height

  inhaleSecs = parseInt(theParams.inhale.value);
  holdinSecs = parseInt(theParams.hold.value);
  exhaleSecs = parseInt(theParams.exhale.value);
  holdoutSecs = parseInt(theParams.pause.value);

  waveSecs = inhaleSecs + exhaleSecs + holdinSecs + holdoutSecs; // total seconds for the wave
  waveMsecs = waveSecs * 1000; // total milliseconds for the wave
  pixelsPerMsec = w / waveMsecs; // time to pixels conversion factor

  var inhaleHorz = Math.round((inhaleSecs / waveSecs) * w);
  var holdinHorz = Math.round((holdinSecs / waveSecs) * w);
  var exhaleHorz = Math.round((exhaleSecs / waveSecs) * w);
  var holdoutHorz = Math.round((holdoutSecs / waveSecs) * w);

  x[0] = 0;
  x[1] = x[0] + inhaleHorz;
  x[2] = x[1] + holdinHorz;
  x[3] = x[2] + exhaleHorz;
  x[4] = x[3] + holdoutHorz;
  x[5] = x[4] + inhaleHorz;
  x[6] = x[5] + holdinHorz;
  x[7] = x[6] + exhaleHorz;
  x[8] = x[7] + holdoutHorz;

  y[0] = y[3] = y[4] = y[7] = y[8] = hMax;
  y[1] = y[2] = y[5] = y[6] = hMin;
}

function showCurrentWave() {
  if (
    inhaleSecs != theParams.inhale.value ||
    holdinSecs != theParams.hold.value ||
    exhaleSecs != theParams.exhale.value ||
    holdoutSecs != theParams.pause.value
  )
    setWaveParams();

  c.fillStyle = "white";
  c.fillRect(0, hMin - LINE_WIDTH / 2, w, hMax - hMin + LINE_WIDTH); // remove any previous wave
  c.fillRect(
    FOCUS_LEFT,
    hMin - FOCUS_RADIUS - FOCUS_LINE / 2,
    FOCUS_DIAM,
    FOCUS_DIAM
  ); // remove the previous focus circle
  c.fillRect(
    FOCUS_LEFT,
    hMax - FOCUS_RADIUS - FOCUS_LINE / 2,
    FOCUS_DIAM,
    FOCUS_DIAM
  ); // remove the previous focus circle

  var phaseShift = Date.now() - phaseStart; // get our time shift
  if (phaseShift >= waveMsecs) {
    // have we wrapped out of our wave period?
    phaseStart += waveMsecs; // yes, so bump our reference up by the wave's period
    phaseShift -= waveMsecs; // and drop our shift back into range
  }
  var pixelShift = Math.round(pixelsPerMsec * phaseShift);

  c.strokeStyle = "#321EC2";
  c.lineWidth = LINE_WIDTH;
  c.lineJoin = "round";
  c.beginPath();
  c.moveTo((leftX = x[0] - pixelShift), y[0]);

  for (var j = 1; j < POINTS; j++) {
    c.lineTo((rightX = x[j] - pixelShift), y[j]);
    if (leftX <= middle && rightX >= middle)
      focus =
        ((y[j] - y[j - 1]) * (middle - leftX)) / (rightX - leftX) + y[j - 1];
    leftX = rightX;
  }
  c.stroke();

  c.beginPath();
  c.arc(middle, focus, FOCUS_RADIUS, 0, TWO_PI, false);
  c.fillStyle = "#AA3939";
  c.fill();
  c.lineWidth = FOCUS_LINE;
  c.strokeStyle = "#AA3939";
  c.stroke();
}
