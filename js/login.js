function setLocalData() {
    try {
        var stringData = document.getElementById("localDataInput").value;
        localStorage.setItem("stringData_", stringData);
    } catch (error) {
        console.error("Error setting data:", error);
    }
}

var getData = localStorage.getItem("stringData_");
var qrcodeText = "https://givernance.org:8443/loginMobile.html?data="+getData; // 포트 번호 제거
new QRCode(document.getElementById("qrcodeImage"), {
    width: 200,
    height: 200,
    colorDark: "rgb(245,245,220)",
    colorLight: "rgb(85, 107, 47)",
    text: qrcodeText
});

document.addEventListener('DOMContentLoaded', (event) => {
    const setLocalDataButton = document.getElementById("setLocalData");
    if (setLocalDataButton) {
        setLocalDataButton.addEventListener('click', setLocalData);
    }
});
document.addEventListener('DOMContentLoaded', function() {

    // WebSocket 연결
    const ws = new WebSocket('wss://givernance.org:8443/ws');

    ws.onopen = function() {
        console.log('WebSocket connection established');
        // 초기 로그인 상태를 false로 설정
        localStorage.setItem('loginStatus', 'false');
    };

    ws.onmessage = function (event) {
    console.log('서버로부터의 메시지:', event.data);

    // 수신한 데이터가 Blob인지 확인
    if (event.data instanceof Blob) {
        // FileReader를 사용하여 Blob을 텍스트로 변환
        const reader = new FileReader();
        reader.onload = function() {
            try {
                const messageObject = JSON.parse(reader.result); // JSON 파싱

                // 로컬 스토리지에 메시지 저장
                localStorage.setItem('receivedMessage', JSON.stringify(messageObject));

                // 화면 업데이트
                updateReceivedMessages();
            } catch (error) {
                console.error('JSON 파싱 오류:', error);
            }
        };
        reader.readAsText(event.data); // Blob을 텍스트로 읽기
    } else {
        console.error('수신한 데이터가 Blob이 아닙니다:', event.data);
    }
};
    function updateLoginStatus(isMatch) {
        console.log('Updating login status:', isMatch);
        localStorage.setItem('loginStatus', JSON.stringify(isMatch));
        displayLoginStatus();
    }

    function displayLoginStatus() {
        const status = localStorage.getItem('loginStatus');
        console.log('Current login status:', status);
        // 필요하다면 로그인 상태를 표시하는 로직 추가
    }
});
