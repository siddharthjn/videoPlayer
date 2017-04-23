// navigator.mediaDevices.getUserMedia -> to get the video & audio stream from user
// MediaRecorder (constructor) -> create MediaRecorder instance for a stream
// MediaRecorder.ondataavailable -> event to listen to when the recording is ready
// MediaRecorder.start -> start recording
// MediaRecorder.stop -> stop recording (this will generate a blob of data)
// URL.createObjectURL -> to create a URL from a blob, which we use as video src

class videoRecorder{
  startRecording() {
    pauseButton.disabled = false;
    if(streamingOn == 0){
      videoRecorder.recordAgain();
      document.getElementById('recordingSec').style.display ="none";
    }
    recorder = new MediaRecorder(stream);
    recorder.addEventListener('dataavailable', videoRecorder.onRecordingReady);
    recordButton.disabled = true;
    stopButton.disabled = false;
    recorder.start();
  }

  stopRecording() {
    recordButton.disabled = false;
    stopButton.disabled = true;
    // Stopping the recorder will eventually trigger the 'dataavailable' event and we can complete the recording process
    recorder.stop();
    /*stop audio and video streaming*/
    stream.getTracks()[0].stop();
    stream.getTracks()[1].stop();
    streamingOn = 0;
    document.getElementById("live").style.display ="none";
    recordButton.innerHTML ="record again";

  }

  static recordAgain(){
    AdapterJS.webRTCReady(function(isUsingPlugin) {
      if (typeof Promise === 'undefined') {
        navigator.getUserMedia(constraints, onSuccess, onFailure);
      } else {
        navigator.mediaDevices.getUserMedia(constraints)
          .then(onSuccess).catch(onFailure);
      }
    });

    /*delaying execution by a second so that we get stream first */
    setTimeout(function(){
    recordButton.innerHTML = "recording";
    document.getElementById("live").style.display ="block";
    recorder = new MediaRecorder(stream);
    recorder.addEventListener('dataavailable', videoRecorder.onRecordingReady);
    recordButton.disabled = true;
    stopButton.disabled = false;
    recorder.start();}, 1000);
  }

  static onRecordingReady(e) {
    document.getElementById('recordingSec').style.display = "block";
    var videoRec = document.getElementById('recordingSec');
    // e.data contains a blob representing the recording
    videoRec.src = URL.createObjectURL(e.data);
    //videoRec.play();
  }

  pauseRecording(){
    if(recorder.state === "recording") {
        recorder.pause();
        pauseButton.innerHTML = "Resume";
        // recording paused
      } else if(recorder.state === "paused") {
        recorder.resume();
        pauseButton.innerHTML = "Pause"
        // resume recording
      }
  }

  localFileVideoPlayer() {
    var URL = window.URL || window.webkitURL
    var displayMessage = function (message, isError) {
      var element = document.querySelector('#message')
      element.innerHTML = message
      element.className = isError ? 'error' : 'info'
    }
    var playSelectedFile = function (event) {
      var file = this.files[0]
      var type = file.type
      var videoNode = document.getElementById('uploadedVid')
      var canPlay = videoNode.canPlayType(type)
      if (canPlay === '') canPlay = 'no'
      var message = 'Can play type "' + type + '": ' + canPlay
      var isError = canPlay === 'no'
      displayMessage(message, isError)

      if (isError) {
        return
      }

      var fileURL = URL.createObjectURL(file)
      videoNode.src = fileURL
      document.getElementById('live').style.display ="none";
      document.getElementById('recordingSec').style.display ="none";
      document.getElementById('uploadedVid').style.display ="block";
    }

    var inputNode = document.querySelector('input')
    inputNode.addEventListener('change', playSelectedFile, false)
  }
}


var vr = new videoRecorder();

/**Buttons are only for testing purpose */
var recordButton, stopButton, recorder, liveStream;
var liveVideo = document.getElementById('live');
var recordButton = document.getElementById('record');
var stopButton = document.getElementById('stop');
pauseButton = document.getElementById('pause');
pauseButton.disabled = true;
recordButton.disabled = false;
stopButton.disabled = false;
/*Hiding recorded and uploaded video sction for now */
document.getElementById('recordingSec').style.display ="none";
document.getElementById('uploadedVid').style.display ="none";
//counter to keep track if streaming has begun
var streamingOn = 0;
//button event listeners
recordButton.addEventListener('click', vr.startRecording);
stopButton.addEventListener('click', vr.stopRecording);
pauseButton.addEventListener('click', vr.pauseRecording);

var constraints = window.constraints = {
  audio: true,
  video: true
};
var errorElement = document.querySelector('#errorMsg');

var onSuccess = function(stream) {
  var videoTracks = stream.getVideoTracks();
  console.log('Got stream with constraints:', constraints);
  console.log('Using video device: ' + videoTracks[0].label);
  stream.onended = function() {
    console.log('Stream ended');
  };
  window.stream = stream; // make variable available to browser console
  video = attachMediaStream(liveVideo, stream);
  streamingOn =1;
};

var onFailure = function(error) {
  if (error.name === 'ConstraintNotSatisfiedError') {
    errorMsg('The resolution ' + constraints.video.width.exact + 'x' +
        constraints.video.width.exact + ' px is not supported by your device.');
  } else if (error.name === 'PermissionDeniedError') {
    errorMsg('Permissions have not been granted to use your camera and ' +
      'microphone, you need to allow the page access to your devices in ' +
      'order for the demo to work.');
  }
  errorMsg('getUserMedia error: ' + error.name, error);
};

function errorMsg(msg, error) {
  errorElement.innerHTML += '<p>' + msg + '</p>';
  if (typeof error !== 'undefined') {
    console.error(error);
  }
}

AdapterJS.webRTCReady(function(isUsingPlugin) {
  if (typeof Promise === 'undefined') {
    navigator.getUserMedia(constraints, onSuccess, onFailure);
  } else {
    navigator.mediaDevices.getUserMedia(constraints)
      .then(onSuccess).catch(onFailure);

  }
});
