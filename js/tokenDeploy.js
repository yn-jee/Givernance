import {
  GiversTokenABI,
  GiversTokenBytecode,
  GovernanceABI,
  GovernanceBytecode,
} from "./tokenConfig.js";

// GiversToken을 배포하는 함수
// GiversToken을 배포하는 함수
export async function deployGiversToken() {
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum); // 메타마스크 같은 지갑에서 제공하는 프로바이더 설정
    const signer = provider.getSigner(); // 트랜잭션 서명자를 지갑에서 가져옴

    // GiversToken 배포 (인자 없이 배포)
    const GiversTokenFactory = new ethers.ContractFactory(
      GiversTokenABI,
      GiversTokenBytecode,
      signer
    );
    const giversToken = await GiversTokenFactory.deploy();
    await giversToken.deployed(); // 배포 완료 대기

    console.log("GiversToken이 배포된 주소:", giversToken.address);
    return giversToken.address; // 배포된 GiversToken의 주소 반환
  } catch (error) {
    console.error("GiversToken 배포 중 오류:", error);
    throw error;
  }
}

// Governance 계약을 배포하는 함수
export async function deployGovernance(giversTokenAddress) {
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum); // 메타마스크 같은 지갑에서 제공하는 프로바이더 설정
    const signer = provider.getSigner(); // 트랜잭션 서명자를 지갑에서 가져옴

    // Governance 계약 배포, GiversToken 주소와 연동
    const GovernanceFactory = new ethers.ContractFactory(
      GovernanceABI,
      GovernanceBytecode,
      signer
    );
    const governance = await GovernanceFactory.deploy(giversTokenAddress); // GiversToken과 연동된 Governance 계약 배포
    await governance.deployed(); // 배포 완료 대기

    console.log("Governance 계약이 배포된 주소:", governance.address);
    return governance.address; // 배포된 Governance 계약의 주소 반환
  } catch (error) {
    console.error("Governance 계약 배포 중 오류:", error);
    throw error;
  }
}
