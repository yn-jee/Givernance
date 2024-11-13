import {
  governanceManagerAddress,
  governanceManagerABI,
  governanceABI,
} from "./governanceConfig.js";

export async function createGovernanceToken(
  fundraiserAddress,
  minutesUntilDeadline
) {
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum); // 메타마스크 같은 지갑에서 제공하는 프로바이더 설정
    const signer = provider.getSigner(); // 트랜잭션 서명자를 지갑에서 가져옴

    // GovernanceManager 컨트랙트 연결
    const governanceManagerContract = new ethers.Contract(
      governanceManagerAddress,
      governanceManagerABI,
      signer
    );

    // 현재 시간 + 지정된 분까지의 시간을 초 단위로 변환하여 votingDeadline 설정
    const currentTime = Math.floor(Date.now() / 1000); // 현재 시간 (초 단위)
    const votingDeadline = currentTime + minutesUntilDeadline * 60; // 분을 초로 변환하여 더함

    // createGovernanceToken 함수 호출
    const tx = await governanceManagerContract.createGovernanceToken(
      fundraiserAddress,
      votingDeadline
    );

    // 트랜잭션 대기
    const receipt = await tx.wait();

    console.log("Governance Token Created:", receipt);
    alert("Governance Token created successfully!");
  } catch (error) {
    console.error("Failed to create Governance Token:", error);
    alert(
      "Failed to create Governance Token. Please check the console for details."
    );
  }
}

export async function castVote(voteFor) {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();

  // GovernanceToken 컨트랙트 연결
  const governanceTokenContract = new ethers.Contract(
    governanceTokenAddress,
    governanceTokenABI,
    signer
  );
  try {
    // `voteFor`는 true (찬성) 또는 false (반대)
    const tx = await governanceTokenContract.vote(voteFor);

    // 트랜잭션 완료 대기
    await tx.wait();
    alert("Vote cast successfully!");
  } catch (error) {
    console.error("Voting failed:", error);

    // 오류 처리
    if (error.code === "CALL_EXCEPTION") {
      alert(
        "Smart contract call exception. Please check the contract conditions."
      );
    } else if (error.code === "INSUFFICIENT_FUNDS") {
      alert("Insufficient funds in your account.");
    } else if (error.code === "NETWORK_ERROR") {
      alert("Network error. Please try again later.");
    } else if (error.code === "UNPREDICTABLE_GAS_LIMIT") {
      alert(
        "Cannot estimate gas; transaction may fail or may require manual gas limit."
      );
    } else {
      alert(`Voting failed: ${error.message}`);
    }
  }
}

export async function getVotingResults() {
  try {
    const [totalVotesFor, totalVotesAgainst] =
      await governanceTokenContract.getVotingResult();

    // 투표 결과 출력
    alert(
      `Total Votes For: ${totalVotesFor.toString()}, Total Votes Against: ${totalVotesAgainst.toString()}`
    );
  } catch (error) {
    console.error("Failed to retrieve voting results:", error);
    alert(
      "Failed to retrieve voting results. Please check the console for details."
    );
  }
}
// export async function deployGiversToken() {
//   try {
//     const provider = new ethers.providers.Web3Provider(window.ethereum); // 메타마스크 같은 지갑에서 제공하는 프로바이더 설정
//     const signer = provider.getSigner(); // 트랜잭션 서명자를 지갑에서 가져옴

//     // GiversToken 배포 (인자 없이 배포)
//     const GiversTokenFactory = new ethers.ContractFactory(
//       GiversTokenABI,
//       GiversTokenBytecode,
//       signer
//     );
//     const giversToken = await GiversTokenFactory.deploy();
//     await giversToken.deployed(); // 배포 완료 대기

//     console.log("GiversToken이 배포된 주소:", giversToken.address);
//     return giversToken.address; // 배포된 GiversToken의 주소 반환
//   } catch (error) {
//     console.error("GiversToken 배포 중 오류:", error);
//     throw error;
//   }
// }

// // Governance 계약을 배포하는 함수
// export async function deployGovernance(giversTokenAddress) {
//   try {
//     const provider = new ethers.providers.Web3Provider(window.ethereum); // 메타마스크 같은 지갑에서 제공하는 프로바이더 설정
//     const signer = provider.getSigner(); // 트랜잭션 서명자를 지갑에서 가져옴

//     // Governance 계약 배포, GiversToken 주소와 연동
//     const GovernanceFactory = new ethers.ContractFactory(
//       GovernanceABI,
//       GovernanceBytecode,
//       signer
//     );
//     const governance = await GovernanceFactory.deploy(giversTokenAddress); // GiversToken과 연동된 Governance 계약 배포
//     await governance.deployed(); // 배포 완료 대기

//     console.log("Governance 계약이 배포된 주소:", governance.address);
//     return governance.address; // 배포된 Governance 계약의 주소 반환
//   } catch (error) {
//     console.error("Governance 계약 배포 중 오류:", error);
//     throw error;
//   }
// }
