document.addEventListener("DOMContentLoaded", function () {
  const video = document.getElementById("video");
  const ws = new WebSocket("wss://givernance.org:8443/ws");

  let verificationInterval;
  function getQueryParam(param) {
    var url = window.location.href;
    var searchParams = new URLSearchParams(url.substring(url.indexOf("?")));
    return searchParams.get(param);
  }

  var dataValue;

  ws.onopen = function () {
    console.log("WebSocket connection established");
  };

  ws.onmessage = function (event) {
    console.log("Message from server:", event.data);
    const isMatch = JSON.parse(event.data);
  };

  window.onload = function () {
    const dataParam = getQueryParam("data");

    if (dataParam !== null) {
      dataValue = parseFloat(dataParam);
      console.log(`Data value from query param: ${dataValue}`);
    } else {
      console.error("No data parameter found in URL.");
    }
  };

  document
    .getElementById("startVerification")
    .addEventListener("click", function () {
      if (!verificationInterval) {
        verificationInterval = setInterval(
          verifyFaceAgainstStoredDescriptor,
          5000
        );
        console.log("Verification started.");
      }
    });

  document
    .getElementById("stopVerification")
    .addEventListener("click", function () {
      if (verificationInterval) {
        clearInterval(verificationInterval);
        verificationInterval = null;
        console.log("Verification stopped.");
      }
    });

  Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri("../models"),
    faceapi.nets.faceLandmark68Net.loadFromUri("../models"),
    faceapi.nets.faceRecognitionNet.loadFromUri("../models"),
  ]).then(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then((stream) => {
        video.srcObject = stream;
        video.onloadedmetadata = () => {
          video.play();
          video.style.transform = "scaleX(-1)";
        };
        video.onplay = initializeFaceDetection; // 비디오가 재생 준비가 되면 얼굴 감지 초기화
      })
      .catch((error) => console.error("Webcam access error:", error));
  });

  function initializeFaceDetection() {
    const canvas = faceapi.createCanvasFromMedia(video);
    document.body.append(canvas);
    canvas.style.transform = "scaleX(-1)";
    const displaySize = { width: video.width, height: video.height };
    faceapi.matchDimensions(canvas, displaySize);

    const FRAME_BUFFER_SIZE = 10; // 프레임 버퍼 크기 설정
    let frameBuffer = []; // 프레임 버퍼 초기화

    setInterval(async () => {
      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptors();

      const resizedDetections = faceapi.resizeResults(detections, {
        height: video.height,
        width: video.width,
      });
      canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

      faceapi.draw.drawDetections(canvas, resizedDetections);
      faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);

      if (detections.length > 0) {
        const faceDescriptor = detections[0].descriptor;
        frameBuffer.push(faceDescriptor);

        if (frameBuffer.length > FRAME_BUFFER_SIZE) {
          frameBuffer.shift();
        }

        const averagedDescriptor = averageDescriptors(frameBuffer);
        const averageValue =
          calculateAndStoreAverageAsString(averagedDescriptor);
        console.log("Average Value:", averageValue);

        window.saveddDescriptor = averageValue; // 전역 변수로 저장
      }
      if (saveddDescriptor) {
        verifyFaceAgainstStoredDescriptor();
      }
    }, 5000);
  }

  function averageDescriptors(descriptors) {
    const descriptorSize = descriptors[0].length;
    const averagedDescriptor = new Float32Array(descriptorSize).fill(0);
    descriptors.forEach((descriptor) => {
      for (let i = 0; i < descriptorSize; i++) {
        averagedDescriptor[i] += descriptor[i];
      }
    });
    for (let i = 0; i < descriptorSize; i++) {
      averagedDescriptor[i] /= descriptors.length;
    }
    return averagedDescriptor;
  }

  function calculateAndStoreAverageAsString(averagedDescriptor) {
    let sum = 0;
    const length = averagedDescriptor.length;
    averagedDescriptor.forEach((value) => {
      sum += value;
    });
    const average = sum / length;
    return Math.abs(average);
  }

  function verifyFaceAgainstStoredDescriptor() {
    const storedDescriptor = dataValue;
    const liveDescriptor = saveddDescriptor;
    if (liveDescriptor !== undefined) {
      const isMatch = compareDescriptors(storedDescriptor, liveDescriptor);
      console.log(`Comparison result: ${isMatch}`);
      sendMatchResult(isMatch);
      if (isMatch) {
        localStorage.setItem("loginStatus", "true");
        console.log("LoginStatus set to true in localStorage");
        window.location.href = "mobile.html";
      }
    } else {
      console.log("No live descriptor captured.");
    }
  }

  function compareDescriptors(storedDescriptor, liveDescriptor) {
    const distance = Math.abs(storedDescriptor - liveDescriptor);
    if (distance < 0.0015) return true;
    else return false;
  }

  function sendMatchResult(isMatch) {
    console.log("Sending match result to server:", isMatch);
    ws.send(JSON.stringify(isMatch));
  }
});
