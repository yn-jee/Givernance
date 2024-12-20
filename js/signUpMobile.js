document.addEventListener("DOMContentLoaded", function () {
  const video = document.getElementById("video");
  const signupButton = document.getElementById("signup");
  const ws = new WebSocket("wss://givernance.org:8443/ws");

  ws.onopen = function () {
    console.log("WebSocket connection established");
    ws.send("Hello from Client!"); // 서버로 메시지 전송
  };
  ws.onmessage = function (event) {
    console.log("Message from server: " + event.data);
    let receivedMessages =
      JSON.parse(localStorage.getItem("receivedMessages")) || [];
    receivedMessages.push(event.data);
    localStorage.setItem("receivedMessages", JSON.stringify(receivedMessages));
  };

  signupButton.addEventListener("click", function () {
    captureAndSend();
  });

  Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
    faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
    faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
  ]).then(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then((stream) => {
        video.style.transform = "scaleX(-1)";
        video.srcObject = stream;
        video.onloadedmetadata = () => {
          video.play();
        };
        video.onplay = initializeFaceDetection;
      })
      .catch((error) => console.error("Webcam access error:", error));
  });

  function initializeFaceDetection() {
    const canvas = faceapi.createCanvasFromMedia(video);
    document.body.append(canvas);
    canvas.style.position = "absolute";
    canvas.style.top = video.offsetTop + "px";
    canvas.style.left = video.offsetLeft + "px";
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
        // 얼굴이 감지된 경우
        const faceDescriptor = detections[0].descriptor; // 첫 번째 얼굴의 디스크립터 가져오기
        frameBuffer.push(faceDescriptor); // 프레임 버퍼에 디스크립터 추가

        if (frameBuffer.length > FRAME_BUFFER_SIZE) {
          // 프레임 버퍼 크기 제한
          frameBuffer.shift();
        }

        const averagedDescriptor = averageDescriptors(frameBuffer);
        const stringForQR =
          calculateAndStoreAverageAsString(averagedDescriptor);
        console.log("String for QR:", stringForQR); // 콘솔에 결과 출력

        const savedDescriptor = averagedDescriptor;
        // 저장된 디스크립터를 로컬 저장소에 저장
        localStorage.setItem(
          "savedDescriptor",
          JSON.stringify(savedDescriptor)
        );
        window.saveddDescriptor = stringForQR; // 전역 변수로 저장
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

  function captureAndSend() {
    if (window.saveddDescriptor) {
      console.log("Sending averaged descriptor");
      ws.send(JSON.stringify(window.saveddDescriptor));
      updateReceivedMessages();
    } else {
      console.log("No descriptor to send");
    }
  }
  function updateReceivedMessages() {
    const receivedMessages =
      JSON.parse(localStorage.getItem("receivedMessages")) || [];
    const receivedMessagesDiv = document.getElementById("receivedMessages");
    receivedMessagesDiv.innerHTML = "";
    receivedMessages.forEach((msg, index) => {
      const messageElement = document.createElement("div");
      messageElement.textContent = `${index + 1}: ${msg}`;
      receivedMessagesDiv.appendChild(messageElement);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    updateReceivedMessages();
  });
});

function calculateAndStoreAverageAsString(averagedDescriptor) {
  let sum = 0;
  const length = averagedDescriptor.length;
  averagedDescriptor.forEach((value) => {
    sum += value;
  });
  const average = sum / length;
  return Math.abs(average);
}
