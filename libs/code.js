var canvas, stage, exportRoot, anim_container, dom_overlay_container, fnStartAnimation;

var soundsArr;
var soundsArr2 = [];
var video, video_div;
var clickSd,
  intro,
  quizSd,
  rightFbSd,
  wrongFbSd,
  tryFbSd,
  popUpSd1;

//  timeCounter = 60,
var ansTrue = 4,
  countQuestion = 0,
  quizNum = 4,
  clickedAnswersIdsArr = [],
  currentAnswersIdsArr = [];

var numOfAns = 5,
  currentQ = 1,
  screenAnsFB = 1,
  correctAns = false;
var rightFB = false,
  tryFB = false,
  wrongFB = false,
  soundMuted = false;
var prevAns,
  numAns = 5;

var attempts = 1,
  maxAttempts = 3;

var counter = 0;

var overOut = [];
var retryV = false;
var l = console.log;

var isFirefox = typeof InstallTrigger !== "undefined";
/*========Start=======*/

var correctAnswersCountV = 0;

/*========End=======*/

function init() {
  canvas = document.getElementById("canvas");
  anim_container = document.getElementById("animation_container");
  dom_overlay_container = document.getElementById("dom_overlay_container");
  var comp = AdobeAn.getComposition("18ADE7C025CE594DBA1302B5432009E3");
  var lib = comp.getLibrary();
  var loader = new createjs.LoadQueue(false);
  loader.addEventListener("fileload", function (evt) {
    handleFileLoad(evt, comp);
  });
  loader.addEventListener("complete", function (evt) {
    handleComplete(evt, comp);
  });
  var lib = comp.getLibrary();
  loader.loadManifest(lib.properties.manifest);
}
function handleFileLoad(evt, comp) {
  var images = comp.getImages();
  if (evt && evt.item.type == "image") {
    images[evt.item.id] = evt.result;
  }
}
function handleComplete(evt, comp) {
  //This function is always called, irrespective of the content. You can use the variable "stage" after it is created in token create_stage.
  var lib = comp.getLibrary();
  var ss = comp.getSpriteSheet();
  var queue = evt.currentTarget;
  var ssMetadata = lib.ssMetadata;
  for (i = 0; i < ssMetadata.length; i++) {
    ss[ssMetadata[i].name] = new createjs.SpriteSheet({
      images: [queue.getResult(ssMetadata[i].name)],
      frames: ssMetadata[i].frames,
    });
  }
  exportRoot = new lib.Act();

  stage = new lib.Stage(canvas);
  //Registers the "tick" event listener.
  fnStartAnimation = function () {
    stage.addChild(exportRoot);
    stage.enableMouseOver(10);
    createjs.Touch.enable(stage);
    /* document.ontouchmove = function (e) {
            e.preventDefault();
        }*/
    stage.mouseMoveOutside = true;
    stage.update();
    createjs.Ticker.setFPS(lib.properties.fps);
    createjs.Ticker.addEventListener("tick", stage);
    prepareTheStage();
  };
  //Code to support hidpi screens and responsive scaling.
  function makeResponsive(isResp, respDim, isScale, scaleType) {
    var lastW,
      lastH,
      lastS = 1;
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    function resizeCanvas() {
      var w = lib.properties.width,
        h = lib.properties.height;
      var iw = window.innerWidth,
        ih = window.innerHeight;
      var pRatio = window.devicePixelRatio || 1,
        xRatio = iw / w,
        yRatio = ih / h,
        sRatio = 1;
      if (isResp) {
        if (
          (respDim == "width" && lastW == iw) ||
          (respDim == "height" && lastH == ih)
        ) {
          sRatio = lastS;
        } else if (!isScale) {
          if (iw < w || ih < h) sRatio = Math.min(xRatio, yRatio);
        } else if (scaleType == 1) {
          sRatio = Math.min(xRatio, yRatio);
        } else if (scaleType == 2) {
          sRatio = Math.max(xRatio, yRatio);
        }
      }
      canvas.width = w * pRatio * sRatio;
      canvas.height = h * pRatio * sRatio;
      canvas.style.width =
        dom_overlay_container.style.width =
        anim_container.style.width =
        w * sRatio + "px";
      canvas.style.height =
        anim_container.style.height =
        dom_overlay_container.style.height =
        h * sRatio + "px";
      stage.scaleX = pRatio * sRatio;
      stage.scaleY = pRatio * sRatio;
      lastW = iw;
      lastH = ih;
      lastS = sRatio;
      stage.tickOnUpdate = false;
      stage.update();
      stage.tickOnUpdate = true;
      canvas.style.display = "block";
      anim_container.style.display = "block";
    }
  }
  makeResponsive(true, "both", true, 1);
  AdobeAn.compositionLoaded(lib.properties.id);
  fnStartAnimation();
  exportRoot["playBtn"].cursor = "pointer";
  exportRoot["playBtn"].addEventListener("click", playFn);

  l("helloooo1");
}

function playFn() {
  stopAllSounds();
  clickSd.play();
  exportRoot.play();
}

function playVideo() {
  exportRoot["startBtn"].removeEventListener("click", playVideo);
  anim_container.style.display = "none";
  video_div = document.getElementById("videoPlay").style.display = "block";

  video = document.getElementById('videoPlay').play();
  setTimeout(function () {
    exportRoot.gotoAndPlay("endVideo");
  }, 100);
  document.getElementById("videoPlay").onended = function () { videoEnd() };
}

function videoEnd() {
  exportRoot.play();
  document.getElementById("videoPlay").style.display = "none";
  anim_container.style.display = "block";
  document.getElementById("videoPlay").removeAttribute('src');
  document.getElementById("videoPlay").load();

  // intro.play();
  console.log("Play");
};

function prepareTheStage() {
  overOut = [
    exportRoot["showAnsBtn"],
    exportRoot["startBtn"],
  ];
  exportRoot["soundBtn"].cursor = "pointer";
  exportRoot["soundBtn"].addEventListener("click", sound);

  exportRoot["startBtn2"].cursor = "pointer";
  exportRoot["startBtn2"].on("mouseover", over2);
  exportRoot["startBtn2"].on("mouseout", out);

  exportRoot["tryFB"]["retryBtn"].cursor = "pointer"
  exportRoot["tryFB"]["retryBtn"].on("mouseover", over_pic);
  exportRoot["tryFB"]["retryBtn"].on("mouseout", out_pic);

  exportRoot["rightFB"]["nextBtn"].cursor = "pointer"
  exportRoot["rightFB"]["nextBtn"].on("mouseover", over_pic);
  exportRoot["rightFB"]["nextBtn"].on("mouseout", out_pic);

  exportRoot["wrongFB"]["wrongBtn"].cursor = "pointer"
  exportRoot["wrongFB"]["wrongBtn"].on("mouseover", over_pic);
  exportRoot["wrongFB"]["wrongBtn"].on("mouseout", out_pic);

  for (var i = 0; i < overOut.length; i++) {
    console.log(i);
    overOut[i].cursor = "pointer";
    overOut[i].on("mouseover", over);
    overOut[i].on("mouseout", out);
  }
  for (let s = 1; s <= ansTrue; s++) {
    for (let i = 1; i <= ansTrue; i++) {
      exportRoot["answers"]["s" + s + "_" + "p" + i].id = i;
      exportRoot["answers"]["s" + s + "_" + "p" + i].cursor = "pointer";
      exportRoot["answers"]["s" + s + "_" + "p" + i].gotoAndStop(0);
      exportRoot["answers"]["s" + s + "_" + "p" + i].on("click", nextAnswersScreen);
      exportRoot["answers"]["s" + s + "_" + "p" + i].on("mouseover", over);
      exportRoot["answers"]["s" + s + "_" + "p" + i].on("mouseout", out);
    }
  }




  clickSd = new Howl({
    src: ["sounds/click.mp3"],
  });
  rightFbSd = new Howl({
    src: ["sounds/rightFbSd.mp3"],
  });
  wrongFbSd = new Howl({
    src: ["sounds/wrongFbSd.mp3"],
  });
  tryFbSd = new Howl({
    src: ["sounds/tryFbSd.mp3"],
  });
  intro = new Howl({
    src: ["sounds/intro.mp3"],
  });
  quizSd = new Howl({
    src: ["sounds/quizSd.mp3"],
  });
  sound1 = new Howl({
    src: ["sounds/sound1.mp3"],
  });
  sound2 = new Howl({
    src: ["sounds/sound2.mp3"],
  });
  sound3 = new Howl({
    src: ["sounds/sound3.mp3"],
  });
  sound4 = new Howl({
    src: ["sounds/sound4.mp3"],
  });
  popUpSd1 = new Howl({
    src: ["sounds/popUpSd1.mp3"],
  });

  soundsArr = [
    clickSd,
    quizSd,
    sound1,
    sound2,
    sound3,
    sound4,
    rightFbSd,
    wrongFbSd,
    intro,
    tryFbSd,
    popUpSd1,
  ];
  soundsArr2 = [sound1, sound2, sound3, sound4];
  stopAllSounds();

  for (let i = 1; i <= numAns; i++) {
    exportRoot["a" + i].clicked = false;
    exportRoot["a" + i].id = i;
    exportRoot["a" + i].clickNum = null;
    console.log("i: " + i);
  }

  function nextAnswersScreen(e) {
    stopAllSounds();
    console.log("nextScreenFB" + e.currentTarget.id);
    screenAnsFB = e.currentTarget.id;
    exportRoot["answers"].gotoAndStop("q" + e.currentTarget.id);
    soundsArr2[screenAnsFB - 1].play();
    exportRoot["answers"]["s" + screenAnsFB].gotoAndStop(1);
    exportRoot["answers"]["v" + screenAnsFB].gotoAndStop(1);
    soundsArr2[screenAnsFB - 1].on("end", function () {
      exportRoot["answers"]["s" + screenAnsFB].gotoAndStop(0);
      exportRoot["answers"]["v" + screenAnsFB].gotoAndStop(0);
    });
  }

  function nextScreenFB() {
    if (screenAnsFB <= 3) {
      screenAnsFB++;
    }
    stopAllSounds();
    console.log("screenAnsFB: " + screenAnsFB);
    exportRoot["answers"].gotoAndStop("q" + screenAnsFB);
    soundsArr2[screenAnsFB - 1].play();
    exportRoot["answers"]["s" + screenAnsFB].gotoAndStop(1);
    exportRoot["answers"]["v" + screenAnsFB].gotoAndStop(1);
    soundsArr2[screenAnsFB - 1].on("end", function () {
      exportRoot["answers"]["s" + screenAnsFB].gotoAndStop(0);
      exportRoot["answers"]["v" + screenAnsFB].gotoAndStop(0);
    });
  }
  function prevScreenFB() {
    if (screenAnsFB > 1) {
      screenAnsFB--;
    }
    stopAllSounds();
    console.log("screenAnsFB: " + screenAnsFB);
    exportRoot["answers"].gotoAndStop("q" + screenAnsFB);
    soundsArr2[screenAnsFB - 1].play();
    exportRoot["answers"]["s" + screenAnsFB].gotoAndStop(1);
    exportRoot["answers"]["v" + screenAnsFB].gotoAndStop(1);
    soundsArr2[screenAnsFB - 1].on("end", function () {
      exportRoot["answers"]["s" + screenAnsFB].gotoAndStop(0);
      exportRoot["answers"]["v" + screenAnsFB].gotoAndStop(0);
    });
  }


  exportRoot["startBtn"].addEventListener("click", playVideo);
  exportRoot["startBtn2"].addEventListener("click", function () {
    stopAllSounds();
    clickSd.play();
    exportRoot.play();
  });

  exportRoot["rightFB"]["nextBtn"].addEventListener("click", function () {
    stopAllSounds();
    clickSd.play();
    hideFB();
    activateClick2();
    showBtns();
    rightFB = false;
    currentQ++;
  });

  exportRoot["answers"]["nextBtnAns"].cursor = "pointer";
  exportRoot["answers"]["nextBtnAns"].addEventListener("click", nextScreenFB);
  exportRoot["answers"]["prevBtnAns"].cursor = "pointer";
  exportRoot["answers"]["prevBtnAns"].addEventListener("click", prevScreenFB);
  exportRoot["tryFB"]["retryBtn"].addEventListener("click", function () {
    exportRoot["a" + prevAns].clickNum = null;
    stopAllSounds();
    clickSd.play();
    hideFB();
    attempts++;
    activateClick2();
    tryFB = false;
    console.log("retryBtn");
  });
  exportRoot["wrongFB"]["wrongBtn"].addEventListener("click", function () {
    stopAllSounds();
    clickSd.play();
    hideFB();
    exportRoot.gotoAndStop("intro");
    activateClick();
    wrongFB = false;
    attempts = 1;
    currentQ = 1;
    score = 0;
  });
  exportRoot["showAnsBtn"].addEventListener("click", function () {
    //hideFB();
    stopAllSounds();
    exportRoot["showAnsBtn"].alpha = 0;
    exportRoot["answers"].alpha = 1;
    exportRoot["answers"].gotoAndPlay(0);
    setTimeout(() => {
      exportRoot["answers"]["s1"].gotoAndStop(1);
      exportRoot["answers"]["v1"].gotoAndStop(1);
      sound1.play();
      sound1.on("end", function () {
        exportRoot["answers"]["s1"].gotoAndStop(0);
        exportRoot["answers"]["v1"].gotoAndStop(0);
      });
    }, 3000);
  });

  hideFB();
}

function hideFB() {
  exportRoot["wrongFB"].alpha = 0;
  exportRoot["wrongFB"].playV = false;
  exportRoot["rightFB"].alpha = 0;
  exportRoot["rightFB"].playV = false;
  exportRoot["rightFB"].gotoAndStop(0);
  exportRoot["tryFB"].alpha = 0;
  exportRoot["tryFB"].playV = false;

  exportRoot["answers"].alpha = 0;
  exportRoot["showAnsBtn"].alpha = 0;
  exportRoot["showAnsBtn"].gotoAndStop(0);
}

function stopAllSounds() {
  for (var s = 0; s < soundsArr.length; s++) {
    soundsArr[s].stop();
  }
}

function activateClick() {
  for (var i = 1; i <= numAns; i++) {
    exportRoot["a" + i].gotoAndStop(0);
    exportRoot["a" + i].clicked = true;
    exportRoot["a" + i].clickNum = null;
    exportRoot["a" + i].cursor = "pointer";
    exportRoot["a" + i].addEventListener("click", chooseAnsFn);
    exportRoot["a" + i].addEventListener("mouseover", over2);
    exportRoot["a" + i].addEventListener("mouseout", out);
  }
}
function activateClick2() {
  for (var i = 1; i <= numAns; i++) {
    if (exportRoot["a" + i].clickNum == null) {
      exportRoot["a" + i].gotoAndStop(0);
      exportRoot["a" + i].clicked = true;
      exportRoot["a" + i].cursor = "pointer";
      exportRoot["a" + i].addEventListener("click", chooseAnsFn);
      exportRoot["a" + i].addEventListener("mouseover", over2);
      exportRoot["a" + i].addEventListener("mouseout", out);
    }
  }
  exportRoot["soundBtn"].addEventListener("click", sound);
}

function deactivateClick() {
  for (let i = 1; i <= numAns; i++) {
    // exportRoot["a" + i].gotoAndStop(0);
    exportRoot["a" + i].clicked = false;
    exportRoot["a" + i].cursor = "auto";
    exportRoot["a" + i].removeEventListener("click", chooseAnsFn);
    exportRoot["a" + i].removeEventListener("mouseover", over2);
    exportRoot["a" + i].removeEventListener("mouseout", out);
  }
}

function chooseAnsFn(e3) {
  stopAllSounds();
  clickSd.play();

  e3.currentTarget.gotoAndStop(2); // Active Button click After Select
  e3.currentTarget.cursor = "auto"; // Active Button Cursor Default After Select
  e3.currentTarget.removeEventListener("mouseover", over2); // Remove Mouse Event Over After Select
  e3.currentTarget.removeEventListener("mouseout", out); // Remove Mouse Event Out After Select
  e3.currentTarget.removeEventListener("click", chooseAnsFn); // Remove Mouse Event Click After Select
  e3.currentTarget.clickNum = e3.currentTarget.id; // Remove Mouse Event Click After Select
  prevAns = e3.currentTarget.id; // Remove Mouse Event Click After Select
  confirmFN();
}


function confirmFN() {
  soundMuted = false;
  stopAllSounds();
  clickSd.play();
  hideFB();
  exportRoot["soundBtn"].cursor = "auto";
  exportRoot["soundBtn"].removeEventListener("click", sound);
  exportRoot["quz" + currentQ].gotoAndStop(0);
  exportRoot["soundBtn"].gotoAndStop(0);
  deactivateClick();
  if (currentQ == exportRoot["a" + currentQ].clickNum) {
    exportRoot["rightFB"].playV = true;
    exportRoot["rightFB"].alpha = 1;
    exportRoot["rightFB"].gotoAndPlay(0);
  } else if (attempts !== maxAttempts) {
    exportRoot["tryFB"].playV = true;
    exportRoot["tryFB"].alpha = 1;
    exportRoot["tryFB"].gotoAndPlay(0);
  } else {
    exportRoot["wrongFB"].playV = true;
    exportRoot["wrongFB"].alpha = 1;
    exportRoot["wrongFB"].gotoAndPlay(0);
  }
}
function starFB() {
  for (var i = 1; i <= currentQ; i++) {
    exportRoot["rightFB"]["star" + i].gotoAndStop(2);
    console.log("starFB" + i);
  }
}

function over(e) {
  e.currentTarget.gotoAndStop(1);
}
function over2(e) {
  e.currentTarget.gotoAndStop(2);
}

function over_pic() {
  if (rightFB) {
    exportRoot["rightFB"]["nextBtn_pic"].gotoAndStop(2);
  } else if (tryFB) {
    exportRoot["tryFB"]["retryBtn_pic"].gotoAndStop(2);
  } else if (wrongFB) {
    exportRoot["wrongFB"]["wrongBtn_pic"].gotoAndStop(2);
  }
}

function out_pic() {
  if (rightFB) {
    exportRoot["rightFB"]["nextBtn_pic"].gotoAndStop(0);
  } else if (tryFB) {
    exportRoot["tryFB"]["retryBtn_pic"].gotoAndStop(0);
  } else if (wrongFB) {
    exportRoot["wrongFB"]["wrongBtn_pic"].gotoAndStop(0);
  }
}

function out(e) {
  e.currentTarget.gotoAndStop(0);
}
function sound() {
  if (!soundMuted) {
    exportRoot["soundBtn"].gotoAndStop(2);
    exportRoot["quz" + currentQ].gotoAndStop(1)
    soundMuted = true;
    soundsArr2[currentQ - 1].play();
    soundsArr2[currentQ - 1].on('end', function () {
      exportRoot["soundBtn"].gotoAndStop(0);
    });
  } else {
    stopAllSounds();
    soundMuted = false;
    exportRoot["quz" + currentQ].gotoAndStop(0);
    exportRoot["soundBtn"].gotoAndStop(0);
    console.log("soundBtn: false");
  }
}

function showBtns() {
  stopAllSounds();
  if (currentQ == ansTrue) {
    exportRoot["showAnsBtn"].alpha = 1;
    exportRoot["soundBtn"].cursor = "auto";
    exportRoot["soundBtn"].removeEventListener("click", sound);
    deactivateClick();
  } else {
    exportRoot.play();
  }
}

/*========Start=======*/

function sendMessageToParent(message) {
  window.parent.postMessage(message, "*");
}

function startTimeFn() {
  sendMessageToParent({
    action: "start",
    data: {
      startDateTime: new Date().toISOString(),
    },
  });
}

function finalSendMessageFn() {
  sendMessageToParent({
    action: "end",
    data: {
      endDateTime: new Date().toISOString(),
      retryTimes: attempts + correctAnswersCountV,
      wrongAnswersCount: attempts,
      correctAnswersCount: correctAnswersCountV,
    },
  });
}

/*========End=======*/
