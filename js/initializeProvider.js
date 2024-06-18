// 이더리움 프로바이더 초기화
async function initializeProvider() {
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    // 연결된 메타마스크 주소
    const connectedAddress = accounts[0]; 
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    
    return { provider, signer, connectedAddress };
}

export { initializeProvider };