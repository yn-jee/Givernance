import {
  governanceManagerAddress,
  governanceManagerABI,
  governanceABI,
} from "./governanceConfig.js";

import { ethers } from "https://unpkg.com/ethers@5.7.2/dist/ethers.esm.min.js";

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
    console.log("마감: ", votingDeadline);

    // createGovernanceToken 함수 호출
    const tx = await governanceManagerContract.createGovernanceToken(
      fundraiserAddress,
      votingDeadline
    );

    // 트랜잭션 대기
    const receipt = await tx.wait();

    console.log("Governance Token Created:", receipt);
    const governanceTokenAddress =
      await governanceManagerContract.getGovernanceToken(fundraiserAddress);
    console.log("Governance Token Address:", governanceTokenAddress);
    alert("Governance Token created successfully!");
  } catch (error) {
    console.error("Failed to create Governance Token:", error);
    alert(
      "Failed to create Governance Token. Please check the console for details."
    );
  }
}
export async function getGovernanceToken(fundraiserAddress) {
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum); // 메타마스크 같은 지갑에서 제공하는 프로바이더 설정
    const signer = provider.getSigner(); // 트랜잭션 서명자를 지갑에서 가져옴

    // GovernanceManager 컨트랙트 연결
    const governanceManagerContract = new ethers.Contract(
      governanceManagerAddress,
      governanceManagerABI,
      signer
    );

    // getGovernanceToken 함수 호출
    const governanceTokenAddress =
      await governanceManagerContract.getGovernanceToken(fundraiserAddress);

    console.log("Governance Token Address:", governanceTokenAddress);
    return governanceTokenAddress; // 필요 시 반환
  } catch (error) {
    console.error("Failed to get Governance Token address:", error);
    alert(
      "Failed to get Governance Token address. Please check the console for details."
    );
  }
}

export async function castVote(contractAddress, voteFor) {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();

  try {
    // GovernanceManager 컨트랙트 주소가 유효한지 확인
    if (!ethers.utils.isAddress(governanceManagerAddress)) {
      console.error(
        "Invalid Governance Manager Address:",
        governanceManagerAddress
      );
      alert("Invalid Governance Manager Address.");
      return;
    }

    // GovernanceManager 컨트랙트 연결
    const governanceManagerContract = new ethers.Contract(
      governanceManagerAddress,
      governanceManagerABI,
      signer
    );

    console.log(contractAddress);
    // getGovernanceToken 호출
    const governanceTokenAddress =
      await governanceManagerContract.getGovernanceToken(contractAddress);
    console.log("Governance Token Address:", governanceTokenAddress);

    // GovernanceToken 주소가 유효한지 확인
    if (
      !ethers.utils.isAddress(governanceTokenAddress) ||
      governanceTokenAddress === ethers.constants.AddressZero
    ) {
      console.error(
        "Invalid Governance Token Address:",
        governanceTokenAddress
      );
      alert(
        "Invalid Governance Token Address. Please check the contract mapping."
      );
      return;
    }

    // GovernanceToken 컨트랙트 연결
    const governanceTokenContract = new ethers.Contract(
      governanceTokenAddress,
      governanceABI,
      signer
    );

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

export async function getVotingResults(contractAddress) {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  try {
    // GovernanceManager 컨트랙트 연결
    const governanceManagerContract = new ethers.Contract(
      governanceManagerAddress,
      governanceManagerABI,
      signer
    );

    // getGovernanceToken 호출
    const governanceTokenAddress =
      await governanceManagerContract.getGovernanceToken(contractAddress);
    console.log("Governance Token Address:", governanceTokenAddress);

    // GovernanceToken 컨트랙트 연결
    const governanceTokenContract = new ethers.Contract(
      governanceTokenAddress,
      governanceABI,
      signer
    );

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

export async function isVotingDone(contractAddress) {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  try {
    // GovernanceManager 컨트랙트 연결
    const governanceManagerContract = new ethers.Contract(
      governanceManagerAddress,
      governanceManagerABI,
      signer
    );

    // getGovernanceToken 호출
    const governanceTokenAddress =
      await governanceManagerContract.getGovernanceToken(contractAddress);
    console.log("Governance Token Address:", governanceTokenAddress);

    // GovernanceToken 컨트랙트 연결
    const governanceTokenContract = new ethers.Contract(
      governanceTokenAddress,
      governanceABI,
      signer
    );

    const isVotingDone = await governanceTokenContract.isDone();
    return isVotingDone;
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
