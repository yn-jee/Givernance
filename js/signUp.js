var getData = localStorage.getItem("receivedMessages");
document.addEventListener('DOMContentLoaded', function () {
    const ws = new WebSocket('wss://givernance.org:8443/ws');
    const receivedMessagesDiv = document.getElementById('receivedMessages');

    ws.onopen = function () {
        console.log('WebSocket connection established');
        console.log('WebSocket 상태:', ws.readyState); // 상태 출력
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

    function updateReceivedMessages() {
        const receivedMessagesDiv = document.getElementById('receivedMessages');
        if (receivedMessagesDiv) {
            receivedMessagesDiv.innerHTML = ''; // 기존 내용을 초기화
            // 로컬 스토리지에서 마지막 메시지를 가져와서 화면에 표시
        let message = JSON.parse(localStorage.getItem('receivedMessage'));
        receivedMessagesDiv.innerHTML = JSON.stringify(message); // 객체를 문자열로 변환하여 표시
        } else {
        console.error('The element with ID "receivedMessages" does not exist in the HTML document.');
        }
    }
        
    
    var qrcodeText = "https://givernance.org:8443/signUpMobile.html";
    new QRCode(document.getElementById("qrcodeImage"), {
        width: 200,
        height: 200,
        colorDark : "rgb(245,245,220)",
        colorLight : "rgb(85, 107, 47)",
        text: qrcodeText
    });
    document.getElementById('copyButton').addEventListener('click', function() {
        const text = document.getElementById('receivedMessages').textContent;
      
        navigator.clipboard.writeText(text)
            .then(() => alert('Message copied to clipboard!'))
            .catch(err => console.error('Failed to copy text: ', err));
    });


});

