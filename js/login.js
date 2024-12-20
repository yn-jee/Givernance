function setLocalData() {
  try {
    var stringData = document.getElementById("localDataInput").value;
    localStorage.setItem("stringData_", stringData);
  } catch (error) {
    console.error("Error setting data:", error);
  }
}

var getData = localStorage.getItem("stringData_");
var qrcodeText = "https://givernance.org:8443/loginMobile.html?data=" + getData; // 포트 번호 제거
new QRCode(document.getElementById("qrcodeImage"), {
  width: 200,
  height: 200,
  colorDark: "rgb(245,245,220)",
  colorLight: "rgb(85, 107, 47)",
  text: qrcodeText,
});

document.addEventListener("DOMContentLoaded", (event) => {
  const setLocalDataButton = document.getElementById("setLocalData");
  if (setLocalDataButton) {
    setLocalDataButton.addEventListener("click", setLocalData);
  }
});
document.addEventListener("DOMContentLoaded", function () {
  // WebSocket 연결
  const ws = new WebSocket("wss://givernance.org:8443/ws");

  ws.onopen = function () {
    console.log("WebSocket connection established");
    // 초기 로그인 상태를 false로 설정
    localStorage.setItem("loginStatus", "false");
  };

  ws.onmessage = function (event) {
    console.log("Message from server:", event.data);
    const data = JSON.parse(event.data);

    // localStorage에 loginStatus 업데이트
    localStorage.setItem("loginStatus", data);

    if (data) {
      console.log("Login successful!");

      window.location.href = "/index.html";
    } else {
      console.log("Login failed. Face does not match.");
    }
  };

  function updateLoginStatus(isMatch) {
    console.log("Updating login status:", isMatch);
    localStorage.setItem("loginStatus", JSON.stringify(isMatch));
    displayLoginStatus();
  }

  function displayLoginStatus() {
    const status = localStorage.getItem("loginStatus");
    console.log("Current login status:", status);
    // 필요하다면 로그인 상태를 표시하는 로직 추가
  }
});
