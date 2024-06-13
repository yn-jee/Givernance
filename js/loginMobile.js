function getQueryParam(param) {
    var url = window.location.href;
    var searchParams = new URLSearchParams(url.substring(url.indexOf('?')));
    return searchParams.get(param);
}

function codeEntered() {
    try {
        var stringData = document.getElementById("codeInput").value;
        if (stringData == dataValue) {
            document.getElementById('isCorrect').textContent = "Correct";
        }
        else {
            document.getElementById('isCorrect').textContent = "Wrong";
        }
    }
    catch (error) {
        console.error("Error entering data:", error);
    }
}

var dataValue;

window.onload = function() {
    dataValue = getQueryParam('data');
};

document.addEventListener('DOMContentLoaded', (event) => {
    const codeEnteredButton = document.getElementById("codeEntered");
    if (codeEnteredButton) {
        codeEnteredButton.addEventListener('click', codeEntered);
    }
});