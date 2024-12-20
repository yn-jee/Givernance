var getData = localStorage.getItem("receivedMessages");
document.addEventListener("DOMContentLoaded", function () {
  const ws = new WebSocket("wss://givernance.org:8443/ws");
  const receivedMessagesDiv = document.getElementById("receivedMessages");

  ws.onopen = function () {
    console.log("WebSocket connection established");
    console.log("WebSocket 상태:", ws.readyState); // 상태 출력
  };

  ws.onmessage = function (event) {
    console.log("Message from server:", event.data);

    let messageObject = JSON.parse(event.data);
    // 로컬 스토리지에 마지막 메시지를 저장
    localStorage.setItem("receivedMessage", JSON.stringify(messageObject));
    // 화면 업데이트
    updateReceivedMessages();
  };

  function updateReceivedMessages() {
    const receivedMessagesDiv = document.getElementById("receivedMessages");
    if (receivedMessagesDiv) {
      receivedMessagesDiv.innerHTML = ""; // 기존 내용을 초기화
      // 로컬 스토리지에서 마지막 메시지를 가져와서 화면에 표시
      let message = JSON.parse(localStorage.getItem("receivedMessage"));
      receivedMessagesDiv.innerHTML = JSON.stringify(message); // 객체를 문자열로 변환하여 표시
    } else {
      console.error(
        'The element with ID "receivedMessages" does not exist in the HTML document.'
      );
    }
  }

  var qrcodeText = "https://givernance.org:8443/signUpMobile.html";
  new QRCode(document.getElementById("qrcodeImage"), {
    width: 200,
    height: 200,
    colorDark: "rgb(245,245,220)",
    colorLight: "rgb(85, 107, 47)",
    text: qrcodeText,
  });
  document.getElementById("copyButton").addEventListener("click", function () {
    const text = document.getElementById("receivedMessages").textContent;

    navigator.clipboard
      .writeText(text)
      .then(() => alert("Message copied to clipboard!"))
      .catch((err) => console.error("Failed to copy text: ", err));
  });
});
