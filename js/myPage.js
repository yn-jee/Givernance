import { LoadingAnimation } from "./LoadingAnimation.js";
import {
  fundraiserFactoryAddress,
  fundraiserFactoryABI,
  fundraiserABI,
} from "./contractConfig.js";
import {
  createGovernanceToken,
  getGovernanceToken,
  castVote,
  getVotingResults,
  isVotingDone,
} from "./governanceFunctions.js";
import {
  fundraiserInfoContract,
  usageRecordContract,
  IpfsContractABI,
  storeData,
  getData,
} from "./IPFSContractConfig.js";
import { ethers } from "https://unpkg.com/ethers@5.7.2/dist/ethers.esm.min.js";
const IpfsGateway = "https://purple-careful-ladybug-259.mypinata.cloud/ipfs/";
const animation = new LoadingAnimation("../images/loadingAnimation.json");

async function checkIfImage(url) {
  try {
    const response = await fetch(url, { method: "HEAD" }); // HEAD 요청으로 Content-Type만 확인
    const contentType = response.headers.get("Content-Type");

    if (contentType && contentType.startsWith("image/")) {
      console.log("This URL points to an image.");
    } else {
      console.log("This URL does not point to an image.");
    }
  } catch (error) {
    console.error("Error fetching the URL:", error);
  }
}

async function fetchAllEventsFromContract(provider) {
  try {
    const signer = provider.getSigner();
    console.log("Provider and signer initialized.");

    const fundraiserFactory = new ethers.Contract(
      fundraiserFactoryAddress,
      fundraiserFactoryABI,
      signer
    );

    const fromBlock = 0; // Starting block
    const toBlock = "latest"; // Last block
    const events = await fundraiserFactory.queryFilter({}, fromBlock, toBlock);

    const fundraiserAddresses = events
      .filter((event) => event.event === "FundraiserCreated")
      .map((event) => event.args.fundraiserAddress);
    console.log("모금함 주소들", fundraiserAddresses);
    return fundraiserAddresses;
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
}

async function fetchAllFundraiserDetails(fundraiserAddresses, provider) {
  const signer = provider.getSigner();
  const details = await Promise.all(
    fundraiserAddresses.map(async (address) => {
      const contract = new ethers.Contract(address, fundraiserABI, provider);
      const name = await contract.name();
      let targetAmountGwei = ethers.utils.formatUnits(
        await contract.targetAmount(),
        "gwei"
      );

      // 소수점을 제거하고 문자열을 숫자로 변환
      targetAmountGwei = Math.floor(parseFloat(targetAmountGwei));

      // 목표 금액이 1천만 Gwei 이상일 경우 ETH로 변환
      let targetAmount;
      if (targetAmountGwei >= 10000000) {
        targetAmount = `${ethers.utils.formatEther(
          ethers.utils.parseUnits(targetAmountGwei.toString(), "gwei")
        )} ETH`;
      } else {
        targetAmount = `${targetAmountGwei} GWEI`;
      }

      const finishTime = new Date(
        (await contract.finishTime()).toNumber() * 1000
      );
      const finishTimeString = finishTime.toLocaleString();
      const raisedAmount = ethers.utils.formatEther(
        await contract.raisedAmount()
      );

      const fundraiserIpfscontract = new ethers.Contract(
        fundraiserInfoContract,
        IpfsContractABI,
        signer
      );
      const fundraiserData = await getData(fundraiserIpfscontract, address);
      console.log(address, " , hash: ", fundraiserData.hashes);

      let fundraiserImage = "images/donationBox.png";
      try {
        const imageUrl = IpfsGateway + fundraiserData.hashes[1];
        console.log(imageUrl);
        if (checkIfImage(imageUrl)) {
          fundraiserImage = imageUrl;
        }
      } catch (error) {
        console.error("Error fetching text:", error);
      }

      const usageIpfscontract = new ethers.Contract(
        usageRecordContract,
        IpfsContractABI,
        signer
      );
      const usageData = await getData(usageIpfscontract, address);
      const isUsageUploaded = usageData.hashes.length > 0;

      const governanceTokenAddress = await getGovernanceToken(address);
      const zeroAddress = "0x0000000000000000000000000000000000000000";
      let isZeroAddress = true;
      let votingDone = true;
      if (governanceTokenAddress.toLowerCase() !== zeroAddress.toLowerCase()) {
        isZeroAddress = false;
        votingDone = await isVotingDone(address);
      }

      return {
        address,
        name,
        targetAmount,
        fundraiserImage,
        finishTime,
        finishTimeString,
        raisedAmount,
        isUsageUploaded,
        isZeroAddress,
        votingDone,
      };
    })
  );

  return details;
}

function getCurrentDateTime() {
  const now = new Date();
  const dateTimeLocal = now.toISOString().slice(0, 16);
  return dateTimeLocal;
}

async function getEvents(provider, fundraiserFactoryAddress) {
  const fundraiserFactory = new ethers.Contract(
    fundraiserFactoryAddress,
    fundraiserFactoryABI,
    provider
  );

  const fromBlock = 0;
  const toBlock = "latest";
  const events = await fundraiserFactory.queryFilter(
    fundraiserFactory.filters.FundraiserCreated(),
    fromBlock,
    toBlock
  );
  return events;
}

async function getTargetEvent(provider, events, _fundraiserAddress) {
  for (let event of events) {
    const txHash = event.transactionHash;
    const tx = await provider.getTransaction(txHash);
    if (_fundraiserAddress == event.args.fundraiserAddress) {
      return event;
    }
  }
}

async function getFundraiserCreatorAddresses(
  provider,
  event,
  _fundraiserAddress
) {
  const txHash = event.transactionHash;
  const tx = await provider.getTransaction(txHash);
  const creatorAddress = tx.from;
  if (_fundraiserAddress == event.args.fundraiserAddress) {
    return creatorAddress;
  }
}

async function getWithdrawEvents(contractAddress, provider) {
  const fundraiser = new ethers.Contract(
    contractAddress,
    fundraiserABI,
    provider
  );

  const fromBlock = 0;
  const toBlock = "latest";
  const events = await fundraiser.queryFilter(
    fundraiser.filters.Withdraw(),
    fromBlock,
    toBlock
  );
  return events;
}

async function fetchFundraiserDetails(
  provider,
  signer,
  connectedAddress,
  address,
  factoryAddress
) {
  try {
    // animation.startTask();

    // 컨트랙트 객체 생성
    const contract = new ethers.Contract(address, fundraiserABI, provider);
    // 모든 트랜잭션 가져오기
    const events = await getEvents(provider, factoryAddress);
    const targetEvent = await getTargetEvent(provider, events, address);

    const contractOwner = await getFundraiserCreatorAddresses(
      provider,
      targetEvent,
      address
    );
    console.log(contractOwner);

    var raisedAmountGwei;

    const withdrawEvents = await getWithdrawEvents(address, provider);
    console.log("기록들", withdrawEvents);
    withdrawEvents.forEach((event) => {
      console.log(`Creator: ${event.args.creator}`);
      console.log(
        `Amount Withdrawn: ${ethers.utils.formatEther(event.args.amount)} ETH`
      );
      console.log(`Block Number: ${event.blockNumber}`);
      console.log(`Transaction Hash: ${event.transactionHash}`);
      console.log("------------------------------------");
    });

    if (withdrawEvents.length > 0) {
      raisedAmountGwei = ethers.utils.formatUnits(
        withdrawEvents[0].args.amount,
        "gwei"
      );
    } else {
      raisedAmountGwei = ethers.utils.formatUnits(
        await contract.raisedAmount(),
        "gwei"
      );
    }

    let targetAmountGwei = ethers.utils.formatUnits(
      await contract.targetAmount(),
      "gwei"
    );

    return { raisedAmountGwei, targetAmountGwei };
  } catch (error) {
    console.error("Error fetching contract details:", error);
    // animation.endTask(); // 에러 발생 시에도 로딩 종료
  }
}

async function createFundraiserItem(
  detail,
  raisedAmountGwei,
  targetAmountGwei,
  postAddress,
  finishMessage
) {
  const item = document.createElement("div");
  item.id = "fundraiserBox";

  // 소수점 제거 및 Gwei -> ETH 변환
  raisedAmountGwei = Math.floor(parseFloat(raisedAmountGwei));
  targetAmountGwei = Math.floor(parseFloat(targetAmountGwei));

  const raisedAmount =
    raisedAmountGwei >= 10000000
      ? `${ethers.utils.formatEther(
          ethers.utils.parseUnits(raisedAmountGwei.toString(), "gwei")
        )} ETH`
      : `${raisedAmountGwei.toLocaleString()} GWEI`;

  const targetAmount =
    targetAmountGwei >= 10000000
      ? `${ethers.utils.formatEther(
          ethers.utils.parseUnits(targetAmountGwei.toString(), "gwei")
        )} ETH`
      : `${targetAmountGwei.toLocaleString()} GWEI`;

  if (detail.name.length >= 15) {
    item.classList.add("tightSpacing");
    console.log("Long title:", detail.name);
  }

  console.log("Raised:", raisedAmountGwei, "Target:", targetAmountGwei);

  item.innerHTML = `
      <img class="donationBox" src="${
        detail.fundraiserImage
      }" title="donationBox">
      <h2 class="fundraiser-title">${detail.name}</h2>
      <div class="progressContainer">
          <div class="fundraisingStatus">
              <div class="raisedAmount"><b>${raisedAmount}</b> 후원되었어요</div>
              <div class="progressPercentage">${(
                (raisedAmountGwei / targetAmountGwei) *
                100
              ).toFixed(1)}%</div>
          </div>
          <div class="progressBarContainer">
              <div class="progressBar" style="width: ${
                (raisedAmountGwei / targetAmountGwei) * 100
              }%;"></div>
          </div>
          <div class="supporterInfo">
              <span class="targetAmount"><b>${targetAmount}</b> 목표</span>
          </div>
      </div>
      <p class="finish-date">${finishMessage}</p>
    `;

  item.addEventListener("click", function () {
    window.location.href = postAddress;
  });

  return item;
}

async function renderFundraiserState(
  state,
  detail,
  provider,
  signer,
  selectedWallet,
  container,
  fundraiserFactoryAddress
) {
  const postAddressMapping = {
    fundraising: `post.html?contractAddress=${detail.address}`,
    finished: `post.html?contractAddress=${detail.address}`,
    usageUploaded: `usageUploadedPost.html?contractAddress=${detail.address}`,
    votingDone: `votingDonePost.html?contractAddress=${detail.address}`,
  };

  let { raisedAmountGwei, targetAmountGwei } = await fetchFundraiserDetails(
    provider,
    signer,
    selectedWallet,
    detail.address,
    fundraiserFactoryAddress
  );

  const postAddress = postAddressMapping[state];
  const finishMessage =
    detail.finishTime > new Date()
      ? `${detail.finishTimeString}에 마감돼요`
      : `${detail.finishTimeString}에 마감되었어요`;

  const item = await createFundraiserItem(
    detail,
    raisedAmountGwei,
    targetAmountGwei,
    postAddress,
    finishMessage
  );
  container.appendChild(item);
}

async function renderFundraisers(
  provider,
  details,
  container,
  state,
  selectedWallet
) {
  container.innerHTML = ""; // Clear the container
  container.style = null;
  container.classList.add("fundraiserContainer");

  container.style.display = "grid";
  container.style.gridTemplateColumns = "1fr";
  container.style.gap = "20px";
  container.style.margin = "0 auto";
  container.style.maxWidth = "960px";
  container.style.padding = "20px";

  const uniqueDetails = details.filter(
    (detail, index, self) =>
      index === self.findIndex((d) => d.address === detail.address)
  );

  console.log("Rendering fundraisers:", uniqueDetails.length);

  const signer = provider.getSigner();
  console.log("Provider and signer initialized.");

  const fundraiserFactory = new ethers.Contract(
    fundraiserFactoryAddress,
    fundraiserFactoryABI,
    signer
  );

  const now = new Date();
  let fundraisersFound = false;

  const events = await fundraiserFactory.queryFilter(
    fundraiserFactory.filters.FundraiserCreated(),
    0,
    "latest"
  );

  // const myFundraisers = [];
  // for (const event of events) {
  //   const fundraiserAddress = event.args.fundraiserAddress;

  //   // Check the creator of this fundraiser
  //   const transaction = await provider.getTransaction(event.transactionHash);
  //   const creatorAddress = transaction.from;

  //   if (creatorAddress.toLowerCase() === selectedWallet.toLowerCase()) {
  //     myFundraisers.push(fundraiserAddress);
  //   }
  // }

  for (const detail of details) {
    const isFundraising = detail.finishTime > now;
    // const isAddressInArray = myFundraisers.some(
    //   (address) => address.toLowerCase() === detail.address.toLowerCase()
    // );

    // if (isAddressInArray) {
    if (
      (state === "fundraising" && isFundraising) ||
      (state === "finished" && !isFundraising && !detail.isUsageUploaded)
    ) {
      fundraisersFound = true;
      await renderFundraiserState(
        "fundraising",
        detail,
        provider,
        signer,
        selectedWallet,
        container,
        fundraiserFactoryAddress
      );
    } else if (
      state === "usageUploaded" &&
      detail.isUsageUploaded &&
      (detail.isZeroAddress || (!detail.isZeroAddress && !detail.votingDone))
    ) {
      fundraisersFound = true;
      await renderFundraiserState(
        "usageUploaded",
        detail,
        provider,
        signer,
        selectedWallet,
        container,
        fundraiserFactoryAddress
      );
    } else if (
      state === "votingDone" &&
      !detail.isZeroAddress &&
      detail.votingDone
    ) {
      fundraisersFound = true;
      await renderFundraiserState(
        "votingDone",
        detail,
        provider,
        signer,
        selectedWallet,
        container,
        fundraiserFactoryAddress
      );
    }
    // }
  }

  if (!fundraisersFound) {
    const message = document.createElement("h3");
    message.style.color = "#888";
    message.style.gridColumn = "1 / -1"; // 메시지를 전체 열에 걸치게 함
    message.style.textAlign = "center"; // 텍스트를 중앙 정렬

    const messageMapping = {
      fundraising: "모금 중인 모금함이 없어요.",
      finished: "모금 완료된 모금함이 없어요.",
      usageUploaded: "증빙 완료된 모금함이 없어요.",
      votingDone: "투표 완료된 모금함이 없어요.",
    };

    message.textContent = messageMapping[state];
    container.appendChild(message);
  }
  container.style.display = "grid";
  container.style.gridTemplateColumns = "1fr";
  container.style.gap = "20px";
  container.style.margin = "0 auto";
  container.style.maxWidth = "960px";
  container.style.padding = "20px";
}

async function detectWallets(walletSelector) {
  let selectedWallet = null;

  if (window.ethereum) {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      walletSelector.innerHTML = ""; // Clear existing options
      accounts.forEach((account) => {
        const option = document.createElement("option");
        option.value = account;
        option.textContent = account;
        walletSelector.appendChild(option);
      });

      // 최초 지갑 설정
      if (accounts.length > 0) {
        selectedWallet = accounts[0]; // 첫 번째 지갑으로 초기화
      }

      // 지갑 선택 이벤트 핸들러 추가
      walletSelector.addEventListener("change", function () {
        selectedWallet = this.value;
        console.log("Wallet changed to:", selectedWallet);
      });
    } catch (error) {
      console.error("Error detecting wallets:", error);
    }
  } else {
    alert("Please install MetaMask to use this feature.");
  }

  return selectedWallet;
}

async function fetchAllWallets(walletSelector) {
  let selectedWallets = []; // 선택된 지갑 리스트

  if (window.ethereum) {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts", // 모든 연결된 지갑 주소 가져오기
      });

      walletSelector.innerHTML = ""; // 기존 옵션 제거
      accounts.forEach((account) => {
        const option = document.createElement("option");
        option.value = account;
        option.textContent = account;
        walletSelector.appendChild(option);
      });

      // 모든 지갑 주소 배열에 추가
      selectedWallets = accounts;

      console.log("선택된 지갑 주소들:", selectedWallets);

      // 지갑 선택 이벤트 핸들러 추가 (선택된 주소 변경 시 출력)
      walletSelector.addEventListener("change", function () {
        console.log("Wallet changed to:", this.value);
      });
    } catch (error) {
      console.error("지갑 탐지 중 오류 발생:", error);
    }
  } else {
    alert("MetaMask 또는 기타 Ethereum 지갑을 설치해주세요.");
  }

  return selectedWallets; // 모든 지갑 주소를 배열로 반환
}

// 평판 점수와 투표 결과를 저장할 배열
let reputationScores = [];
let votingResultsData = [];
let reputationScoresRatio = [];
let votingResultsDataRatio = [];

async function calculateReputationScore(provider, connectedWallets) {
  try {
    const reputationScoresTemp = []; // 임시 평판 점수 저장
    const votingResultsTemp = []; // 임시 투표 결과 저장

    // 1. 내가 생성한 모금함 가져오기
    const fundraiserAddresses = await fetchAllEventsFromContract(provider); // 모든 모금함 가져오기

    const myFundraisers = []; // 내가 생성한 모금함 리스트
    const events = await getEvents(provider, fundraiserFactoryAddress);

    for (const address of fundraiserAddresses) {
      for (const wallet of connectedWallets) {
        const targetEvent = await getTargetEvent(provider, events, address);

        // 모든 트랜잭션 가져오기
        const creatorAddress = await getFundraiserCreatorAddresses(
          provider,
          targetEvent,
          address
        );

        if (
          creatorAddress &&
          creatorAddress.toLowerCase() === wallet.toLowerCase()
        ) {
          const governanceTokenAddress = await getGovernanceToken(address);

          // Governance Token Address가 0x000...000인지 확인
          if (
            governanceTokenAddress === ethers.constants.AddressZero ||
            !governanceTokenAddress
          ) {
            console.log(`모금함 ${address}의 Governance Token이 존재하지 않음`);
            continue;
          }

          const isDone = await isVotingDone(address); // 투표 완료 여부 확인
          console.log(`모금함 ${address}의 투표 완료 여부: ${isDone}`);

          if (isDone) {
            const blockNumber = targetEvent.blockNumber; // 이벤트의 블록 번호 가져오기
            myFundraisers.push({ address, blockNumber });
          }
        }
      }
    }

    // 2. 오래된 순으로 정렬
    myFundraisers.sort((a, b) => a.blockNumber - b.blockNumber);
    console.log("내가 생성한 모금함 리스트:", myFundraisers);

    // 3. 평판 점수 계산
    let reputationScore = 0; // 초기 평판 점수
    const alpha = 0.7; // 이전 점수 영향도

    for (const fundraiser of myFundraisers) {
      console.log(`현재 모금함 주소: ${fundraiser.address}`);

      const governanceTokenAddress = await getGovernanceToken(
        fundraiser.address
      );
      console.log(
        `모금함 ${fundraiser.address}의 Governance Token 주소: ${governanceTokenAddress}`
      );

      // Governance Token Address가 0x000...000인지 확인
      if (
        governanceTokenAddress === ethers.constants.AddressZero ||
        !governanceTokenAddress
      ) {
        console.log(
          `모금함 ${fundraiser.address}의 Governance Token이 존재하지 않음`
        );
        continue;
      }

      var { totalVotesFor, totalVotesAgainst } = await getVotingResults(
        fundraiser.address
      );
      totalVotesFor = Number(totalVotesFor);
      totalVotesAgainst = Number(totalVotesAgainst);

      const netVotes = totalVotesFor - totalVotesAgainst; // 순수 투표 차이
      const totalWeight = totalVotesFor + totalVotesAgainst; // 총 투표 수

      if (totalWeight === 0) {
        console.log(`모금함 ${fundraiser.address}의 투표가 없음`);
        continue;
      }

      // 정규화된 차이값 계산
      const scoreRatio = netVotes / totalWeight;
      console.log(`Score Ratio for ${fundraiser.address}: ${scoreRatio}`);

      // 데이터 저장
      votingResultsTemp.push({
        address: fundraiser.address,
        totalVotesFor: totalVotesFor,
        totalVotesAgainst: totalVotesAgainst,
        scoreRatio: scoreRatio.toFixed(2), // 소수점 2자리 저장
      });

      // Ratio 추가
      votingResultsDataRatio.push(scoreRatio); // 정규화된 값 추가

      // 평판 점수 계산
      const currentScore = (1 - alpha) * scoreRatio; // 이전 alpha 계수와 함께 사용
      reputationScore = alpha * reputationScore + currentScore;

      console.log(
        `모금함 ${
          fundraiser.address
        }의 점수 계산 완료. 현재 점수: ${reputationScore.toFixed(2)}`
      );

      // 평판 점수 저장
      reputationScoresTemp.push({
        address: fundraiser.address,
        score: reputationScore.toFixed(2),
      });

      // 평판 점수 비율 업데이트
      reputationScoresRatio.push(reputationScore);
    }

    // 배열에 결과 저장
    reputationScores = [...reputationScoresTemp];
    votingResultsData = [...votingResultsTemp];

    console.log("평판 점수 목록:", reputationScores);
    console.log("투표 결과 목록:", votingResultsData);

    console.log("평판 점수 비율 목록:", reputationScoresRatio);
    console.log("투표 결과 비율 목록:", votingResultsDataRatio);

    // 최근 5개의 데이터 추출
    const recentScores = reputationScoresRatio.slice(-5);
    const recentVotes = votingResultsDataRatio.slice(-5);

    // 그래프 생성
    updateGraph(recentVotes, recentScores);

    const reputationScoreElement = document.querySelector(".reputationScore");
    let latestReputationScore; // 현재 점수
    if (recentScores.length > 0) {
      latestReputationScore = recentScores[recentScores.length - 1]; // 최신 평판 점수 가져오기
      reputationScoreElement.textContent = `${latestReputationScore.toFixed(
        2
      )} points`;
    } else {
      reputationScoreElement.textContent = "0.00 points"; // 데이터가 없을 경우 기본값
    }

    var averageReputationScore; // 평균 점수
    let sum = 0;
    for (let i = 0; i < reputationScoresRatio.length; i++) {
      sum += reputationScoresRatio[i];
    }
    averageReputationScore = sum / reputationScoresRatio.length;

    let positiveCount = 0;
    let negativeCount = 0;
    for (let i = 0; i < votingResultsDataRatio.length; i++) {
      if (votingResultsDataRatio >= 0.5) positiveCount++;
      else negativeCount++;
    }

    const reputationDescription = document.querySelector(
      ".reputationDescription"
    );
    reputationDescription.innerHTML = `
      <p>현재 <b>${latestReputationScore.toFixed(2)}점</b>,<br>
      지금까지 평균 <b>${averageReputationScore.toFixed(2)}점</b>,<br>
      긍정적인 평가를 받은 횟수 <b>${positiveCount}회</b>,<br>
      부정적인 평가를 받은 횟수 <b>${negativeCount}회</b>입니다.</p>`;
  } catch (error) {
    console.error("평판 점수 계산 오류:", error);
  }
}

function updateGraph(positiveVoteRatios, reputationScores) {
  const positivePolyline = document.getElementById("positive-points");
  const reputationPolyline = document.getElementById("reputation-points");
  const positiveTooltips = document.getElementById("positive-tooltips");
  const reputationTooltips = document.getElementById("reputation-tooltips");
  const xAxisLabels = document.getElementById("x-axis-labels");

  const statisticElement = document.querySelector(".card .statistic");
  const svgWidth = 400; // 그래프 너비
  const svgHeight = 260; // 그래프 높이
  const maxPoints = 5; // 최대 점의 수
  const xStep = svgWidth / (maxPoints - 1); // X축 간격 계산

  const normalizeY = (value) => svgHeight / 2 - value * (svgHeight / 2);

  let positivePoints = "";
  let reputationPoints = "";
  let positiveTooltipContent = "";
  let reputationTooltipContent = "";
  let xLabelsContent = "";

  for (let i = 0; i < positiveVoteRatios.length; i++) {
    const x = i * xStep; // X좌표 계산
    const yPositive = normalizeY(positiveVoteRatios[i]);
    const yReputation = normalizeY(reputationScores[i]);

    positivePoints += `${x},${yPositive} `;
    reputationPoints += `${x},${yReputation} `;

    positiveTooltipContent += `
      <div class="point-${i + 1}" style="left: ${x}px; top: ${
      yPositive - 10
    }px;">
        <div class="tooltip">${(positiveVoteRatios[i] * 100).toFixed(1)}%</div>
      </div>`;
    reputationTooltipContent += `
      <div class="point-${i + 1}" style="left: ${x}px; top: ${
      yReputation - 10
    }px;">
        <div class="tooltip">${reputationScores[i].toFixed(2)}</div>
      </div>`;

    xLabelsContent += `<span class="day" style="left: ${x}px;">#${
      i + 1
    }</span>`;
  }

  positivePolyline.setAttribute("points", positivePoints.trim());
  reputationPolyline.setAttribute("points", reputationPoints.trim());
  positiveTooltips.innerHTML = positiveTooltipContent;
  reputationTooltips.innerHTML = reputationTooltipContent;

  // updateGraphLines(); // 세 줄의 위치 동적 계산
}

// 후원 내역
async function fetchFundraisersSupportedByUser(walletAddress, provider) {
  try {
    // Step 1: 모든 모금함 주소 가져오기
    const fundraiserAddresses = await fetchAllEventsFromContract(provider);

    const signer = provider.getSigner();

    // Step 2: 해당 주소가 후원한 적 있는지 확인
    const supportedFundraisers = [];
    for (const address of fundraiserAddresses) {
      const contract = new ethers.Contract(address, fundraiserABI, signer);

      // donations 매핑에서 walletAddress의 기부 금액 확인
      const donationAmount = await contract.donations(walletAddress);
      if (donationAmount.gt(0)) {
        // 기부한 적이 있는 모금함을 배열에 추가
        supportedFundraisers.push(address);
      }
    }
    return supportedFundraisers;
  } catch (error) {
    console.error("Error fetching supported fundraisers:", error);
    return [];
  }
}

async function fetchAllSupportedFundraisers(connectedWallets, provider) {
  try {
    const allSupportedFundraisers = new Set(); // 중복 제거를 위한 Set 사용

    for (const walletAddress of connectedWallets) {
      const supportedFundraisers = await fetchFundraisersSupportedByUser(
        walletAddress,
        provider
      );

      // Step 3: 결과 통합
      supportedFundraisers.forEach((address) =>
        allSupportedFundraisers.add(address)
      );
    }
    const result = Array.from(allSupportedFundraisers);

    console.log("후원한 모금함 주소들", result);
    return result;
  } catch (error) {
    console.error("Error fetching all supported fundraisers:", error);
    return [];
  }
}

document.addEventListener("DOMContentLoaded", async function () {
  await animation.loadAnimation();
  const createFundraiserButton = document.getElementById(
    "createFundraiserButton"
  );
  createFundraiserButton.addEventListener("click", function () {
    window.location.href =
      window.location.protocol +
      "//" +
      window.location.host +
      "/createFundraiser.html";
  });

  const menuItems = document.querySelectorAll(".sidebar a");
  const sections = document.querySelectorAll(".mainContent section");
  const walletSelector = document.getElementById("walletSelector");
  const overlay = document.getElementById("loading-overlay");
  let currentRadioSelection = {}; // 섹션별 라디오 버튼 상태 저장
  let selectedWallet;
  let connectedWallets = [];
  let fundraiserData = {
    created: {}, // 지갑별로 생성한 모금함
    supported: {
      fundraising: [],
      finished: [],
      usageUploaded: [],
      votingDone: [],
    },
  };

  overlay.style.display = "flex";

  try {
    await window.ethereum.request({ method: "eth_requestAccounts" });
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    selectedWallet = await detectWallets(walletSelector);
    connectedWallets = await fetchAllWallets(walletSelector);

    await calculateReputationScore(provider, connectedWallets);

    // 모금함 초기 로드
    const fundraiserAddresses = await fetchAllEventsFromContract(provider);
    const details = await fetchAllFundraiserDetails(
      fundraiserAddresses,
      provider
    );

    const supportedFundraiserAddresses = await fetchAllSupportedFundraisers(
      connectedWallets,
      provider
    );
    const supportedDetails = details.filter((detail) =>
      supportedFundraiserAddresses.includes(detail.address)
    );
    console.log(supportedDetails);

    // 생성한 모금함을 지갑별로 분류
    connectedWallets.forEach((wallet) => {
      fundraiserData.created[wallet] = {
        fundraising: [],
        finished: [],
        usageUploaded: [],
        votingDone: [],
      };
    });

    for (const detail of details) {
      const isFundraising = detail.finishTime > new Date();

      const creatorAddress = await getFundraiserCreatorAddresses(
        provider,
        await getTargetEvent(
          provider,
          await getEvents(provider, fundraiserFactoryAddress),
          detail.address
        ),
        detail.address
      );

      if (connectedWallets.includes(creatorAddress.toLowerCase())) {
        const category = fundraiserData.created[creatorAddress.toLowerCase()];
        if (isFundraising) {
          category.fundraising.push(detail);
        } else if (!detail.isUsageUploaded) {
          category.finished.push(detail);
        } else if (
          detail.isUsageUploaded &&
          (detail.isZeroAddress || !detail.votingDone)
        ) {
          category.usageUploaded.push(detail);
        } else if (!detail.isZeroAddress && detail.votingDone) {
          category.votingDone.push(detail);
        }
      }
    }

    // 후원한 모금함 분류 (모든 지갑 합산)
    for (const detail of supportedDetails) {
      const isFundraising = detail.finishTime > new Date();
      if (isFundraising) {
        fundraiserData.supported.fundraising.push(detail);
      } else if (!detail.isUsageUploaded) {
        fundraiserData.supported.finished.push(detail);
      } else if (
        detail.isUsageUploaded &&
        (detail.isZeroAddress || !detail.votingDone)
      ) {
        fundraiserData.supported.usageUploaded.push(detail);
      } else if (!detail.isZeroAddress && detail.votingDone) {
        fundraiserData.supported.votingDone.push(detail);
      }
    }

    console.log("Fundraiser Data Loaded:", fundraiserData);

    // 섹션 및 라디오 버튼 처리
    menuItems.forEach((item) => {
      item.addEventListener("click", async function (event) {
        event.preventDefault();
        const sectionId = item.id.replace("Menu", "Section");

        // 모든 섹션 숨기기
        sections.forEach((section) => (section.style.display = "none"));
        const activeSection = document.getElementById(sectionId);
        activeSection.style.display = "flex";

        // 모든 라디오 버튼 초기화
        document
          .querySelectorAll('input[name="fundraiserState"]')
          .forEach((radio) => {
            radio.checked = false;
          });

        // 마지막 선택된 라디오 버튼 복원
        const lastSelection = currentRadioSelection[sectionId] || "fundraising";
        const radioButton = document.querySelector(
          `#${sectionId} input[name="fundraiserState"][value="${lastSelection}"]`
        );

        const container = document.querySelector(
          `.${sectionId.replace("Section", "Container")}`
        );

        if (radioButton) {
          radioButton.checked = true;
          animation.startTask();
          // 후원한 모금함 섹션 처리
          // 후원한 모금함 섹션 처리
          if (sectionId === "donationHistorySection") {
            container.innerHTML = ""; // 컨테이너 초기화
            console.log(
              `Rendering supported fundraisers for ${lastSelection} in ${sectionId}`
            );

            // 모든 지갑에 대해 비동기 작업 수행
            const renderPromises = renderFundraisersByState(
              provider,
              sectionId,
              lastSelection,
              wallet
            );

            // 모든 렌더링 작업 완료 후 fundraiserBox 확인
            await Promise.all(renderPromises);

            const fundraiserBoxes =
              container.querySelectorAll("#fundraiserBox");

            if (fundraiserBoxes.length === 0) {
              // fundraiserBox가 없으면 메시지 출력
              container.innerHTML = "";
              const message = document.createElement("h3");
              message.style.color = "#888";
              message.style.gridColumn = "1 / -1";
              message.style.textAlign = "center";

              const messageMapping = {
                fundraising: "모금 중인 모금함이 없어요.",
                finished: "모금 완료된 모금함이 없어요.",
                usageUploaded: "증빙 완료된 모금함이 없어요.",
                votingDone: "투표 완료된 모금함이 없어요.",
              };

              message.textContent = messageMapping[lastSelection];
              container.appendChild(message);
            } else {
              // h3 요소 제거
              const h3Elements = container.querySelectorAll("h3");
              h3Elements.forEach((h3) => {
                h3.remove();
              });
            }
          } else {
            // 생성한 모금함 섹션 처리
            await renderFundraisersByState(
              provider,
              sectionId,
              lastSelection,
              selectedWallet
            );
          }
          animation.endTask();
        }
      });
    });

    // 라디오 버튼 변경 시 처리
    // 라디오 버튼 변경 시 처리
    document
      .querySelectorAll('input[name="fundraiserState"]')
      .forEach((radio) => {
        radio.addEventListener("change", async function () {
          const activeSection = document.querySelector(
            ".mainContent section:not([style*='display: none'])"
          );
          if (activeSection) {
            animation.startTask();
            const sectionId = activeSection.id;
            currentRadioSelection[sectionId] = this.value;
            const container = document.querySelector(
              `.${sectionId.replace("Section", "Container")}`
            );

            if (sectionId === "donationHistorySection") {
              // 후원한 모금함 섹션인 경우 모든 지갑의 데이터를 합산하여 가져옴
              container.innerHTML = ""; // 컨테이너 초기화
              console.log(
                `Rendering supported fundraisers for ${this.value} in ${sectionId}`
              );

              // 한 개의 지갑에 대해 비동기 작업 수행(지갑을 구분하지 않음)
              const renderPromises = renderFundraisersByState(
                provider,
                sectionId,
                this.value,
                connectedWallets[0]
              );
              // const renderPromises = connectedWallets.map(async (wallet) =>
              //   renderFundraisersByState(
              //     provider,
              //     sectionId,
              //     this.value,
              //     wallet
              //   )
              // );

              // 모든 렌더링 작업이 끝난 후 fundraiserBox를 확인
              await Promise.all(renderPromises);

              const fundraiserBoxes =
                container.querySelectorAll("#fundraiserBox");

              if (fundraiserBoxes.length === 0) {
                // fundraiserBox가 없으면 메시지 출력
                container.innerHTML = "";
                const message = document.createElement("h3");
                message.style.color = "#888";
                message.style.gridColumn = "1 / -1";
                message.style.textAlign = "center";

                const messageMapping = {
                  fundraising: "모금 중인 모금함이 없어요.",
                  finished: "모금 완료된 모금함이 없어요.",
                  usageUploaded: "증빙 완료된 모금함이 없어요.",
                  votingDone: "투표 완료된 모금함이 없어요.",
                };

                message.textContent = messageMapping[this.value];
                container.appendChild(message);
              } else {
                // h3 요소 제거
                const h3Elements = container.querySelectorAll("h3");
                h3Elements.forEach((h3) => {
                  h3.remove();
                });
              }
            } else {
              // 생성한 모금함 섹션 처리
              await renderFundraisersByState(
                provider,
                sectionId,
                this.value,
                selectedWallet
              );
            }
            animation.endTask();
          }
        });
      });

    // 지갑 선택 변경 시 처리
    walletSelector.addEventListener("change", async function () {
      selectedWallet = this.value;
      const activeSection = document.querySelector(
        ".mainContent section:not([style*='display: none'])"
      );
      if (activeSection) {
        const sectionId = activeSection.id;
        const currentState = currentRadioSelection[sectionId] || "fundraising";
        await renderFundraisersByState(
          provider,
          sectionId,
          currentState,
          selectedWallet
        );
      }
    });

    // 기본 섹션 및 라디오 버튼 초기화
    const defaultSection = "fundraiserSection";
    const defaultRadio = "fundraising";
    document.getElementById(defaultSection).style.display = "flex";
    document.querySelector(
      `#${defaultSection} input[name="fundraiserState"][value="${defaultRadio}"]`
    ).checked = true;
    currentRadioSelection[defaultSection] = defaultRadio;
    await renderFundraisersByState(
      provider,
      defaultSection,
      defaultRadio,
      selectedWallet
    );
  } catch (error) {
    console.error("Error initializing:", error);
  } finally {
    overlay.style.display = "none";
  }

  async function renderFundraisersByState(
    provider,
    sectionId,
    state,
    selectedWallet
  ) {
    const container = document.querySelector(
      `.${sectionId.replace("Section", "Container")}`
    );
    const category =
      sectionId === "fundraiserSection" ? "created" : "supported";

    const fundraisers =
      category === "created"
        ? fundraiserData[category][selectedWallet]?.[state] || []
        : fundraiserData[category][state]; // 후원한 모금함은 모든 지갑 합산

    console.log(
      `Rendering ${state} fundraisers for ${category} in section ${sectionId}`
    );
    container.innerHTML = ""; // 컨테이너 초기화
    await renderFundraisers(
      provider,
      fundraisers,
      container,
      state,
      selectedWallet
    );
  }
});

// import { LoadingAnimation } from "./LoadingAnimation.js";
// import {
//   fundraiserFactoryAddress,
//   fundraiserFactoryABI,
//   fundraiserABI,
// } from "./contractConfig.js";
// import {
//   createGovernanceToken,
//   getGovernanceToken,
//   castVote,
//   getVotingResults,
//   isVotingDone,
// } from "./governanceFunctions.js";
// import {
//   fundraiserInfoContract,
//   usageRecordContract,
//   IpfsContractABI,
//   storeData,
//   getData,
// } from "./IPFSContractConfig.js";
// import { ethers } from "https://unpkg.com/ethers@5.7.2/dist/ethers.esm.min.js";
// const IpfsGateway = "https://purple-careful-ladybug-259.mypinata.cloud/ipfs/";

// async function checkIfImage(url) {
//   try {
//     const response = await fetch(url, { method: "HEAD" }); // HEAD 요청으로 Content-Type만 확인
//     const contentType = response.headers.get("Content-Type");

//     if (contentType && contentType.startsWith("image/")) {
//       console.log("This URL points to an image.");
//     } else {
//       console.log("This URL does not point to an image.");
//     }
//   } catch (error) {
//     console.error("Error fetching the URL:", error);
//   }
// }

// async function fetchAllEventsFromContract(provider) {
//   try {
//     const signer = provider.getSigner();
//     console.log("Provider and signer initialized.");

//     const fundraiserFactory = new ethers.Contract(
//       fundraiserFactoryAddress,
//       fundraiserFactoryABI,
//       signer
//     );

//     const fromBlock = 0; // Starting block
//     const toBlock = "latest"; // Last block
//     const events = await fundraiserFactory.queryFilter({}, fromBlock, toBlock);

//     const fundraiserAddresses = events
//       .filter((event) => event.event === "FundraiserCreated")
//       .map((event) => event.args.fundraiserAddress);
//     return fundraiserAddresses;
//   } catch (error) {
//     console.error("Error fetching events:", error);
//     return [];
//   }
// }

// async function fetchAllFundraiserDetails(fundraiserAddresses, provider) {
//   const signer = provider.getSigner();
//   const details = await Promise.all(
//     fundraiserAddresses.map(async (address) => {
//       const contract = new ethers.Contract(address, fundraiserABI, provider);
//       const name = await contract.name();
//       let targetAmountGwei = ethers.utils.formatUnits(
//         await contract.targetAmount(),
//         "gwei"
//       );

//       // 소수점을 제거하고 문자열을 숫자로 변환
//       targetAmountGwei = Math.floor(parseFloat(targetAmountGwei));

//       // 목표 금액이 1천만 Gwei 이상일 경우 ETH로 변환
//       let targetAmount;
//       if (targetAmountGwei >= 10000000) {
//         targetAmount = `${ethers.utils.formatEther(
//           ethers.utils.parseUnits(targetAmountGwei.toString(), "gwei")
//         )} ETH`;
//       } else {
//         targetAmount = `${targetAmountGwei} GWEI`;
//       }

//       const finishTime = new Date(
//         (await contract.finishTime()).toNumber() * 1000
//       );
//       const finishTimeString = finishTime.toLocaleString();
//       const raisedAmount = ethers.utils.formatEther(
//         await contract.raisedAmount()
//       );

//       const fundraiserIpfscontract = new ethers.Contract(
//         fundraiserInfoContract,
//         IpfsContractABI,
//         signer
//       );
//       const fundraiserData = await getData(fundraiserIpfscontract, address);
//       console.log(address, " , hash: ", fundraiserData.hashes);

//       let fundraiserImage = "images/donationBox.png";
//       try {
//         const imageUrl = IpfsGateway + fundraiserData.hashes[1];
//         console.log(imageUrl);
//         if (checkIfImage(imageUrl)) {
//           fundraiserImage = imageUrl;
//         }
//       } catch (error) {
//         console.error("Error fetching text:", error);
//       }

//       const usageIpfscontract = new ethers.Contract(
//         usageRecordContract,
//         IpfsContractABI,
//         signer
//       );
//       const usageData = await getData(usageIpfscontract, address);
//       const isUsageUploaded = usageData.hashes.length > 0;

//       const governanceTokenAddress = await getGovernanceToken(address);
//       const zeroAddress = "0x0000000000000000000000000000000000000000";
//       let isZeroAddress = true;
//       let votingDone = true;
//       if (governanceTokenAddress.toLowerCase() !== zeroAddress.toLowerCase()) {
//         isZeroAddress = false;
//         votingDone = await isVotingDone(address);
//       }

//       return {
//         address,
//         name,
//         targetAmount,
//         fundraiserImage,
//         finishTime,
//         finishTimeString,
//         raisedAmount,
//         isUsageUploaded,
//         isZeroAddress,
//         votingDone,
//       };
//     })
//   );

//   return details;
// }

// function getCurrentDateTime() {
//   const now = new Date();
//   const dateTimeLocal = now.toISOString().slice(0, 16);
//   return dateTimeLocal;
// }

// async function getEvents(provider, fundraiserFactoryAddress) {
//   const fundraiserFactory = new ethers.Contract(
//     fundraiserFactoryAddress,
//     fundraiserFactoryABI,
//     provider
//   );

//   const fromBlock = 0;
//   const toBlock = "latest";
//   const events = await fundraiserFactory.queryFilter(
//     fundraiserFactory.filters.FundraiserCreated(),
//     fromBlock,
//     toBlock
//   );
//   return events;
// }

// async function getTargetEvent(provider, events, _fundraiserAddress) {
//   for (let event of events) {
//     const txHash = event.transactionHash;
//     const tx = await provider.getTransaction(txHash);
//     if (_fundraiserAddress == event.args.fundraiserAddress) {
//       return event;
//     }
//   }
// }

// async function getFundraiserCreatorAddresses(
//   provider,
//   event,
//   _fundraiserAddress
// ) {
//   const txHash = event.transactionHash;
//   const tx = await provider.getTransaction(txHash);
//   const creatorAddress = tx.from;
//   if (_fundraiserAddress == event.args.fundraiserAddress) {
//     return creatorAddress;
//   }
// }

// async function getWithdrawEvents(contractAddress, provider) {
//   const fundraiser = new ethers.Contract(
//     contractAddress,
//     fundraiserABI,
//     provider
//   );

//   const fromBlock = 0;
//   const toBlock = "latest";
//   const events = await fundraiser.queryFilter(
//     fundraiser.filters.Withdraw(),
//     fromBlock,
//     toBlock
//   );
//   return events;
// }

// async function fetchFundraiserDetails(
//   provider,
//   signer,
//   connectedAddress,
//   address,
//   factoryAddress
// ) {
//   try {
//     // animation.startTask();

//     // 컨트랙트 객체 생성
//     const contract = new ethers.Contract(address, fundraiserABI, provider);
//     // 모든 트랜잭션 가져오기
//     const events = await getEvents(provider, factoryAddress);
//     const targetEvent = await getTargetEvent(provider, events, address);

//     const contractOwner = await getFundraiserCreatorAddresses(
//       provider,
//       targetEvent,
//       address
//     );
//     console.log(contractOwner);

//     var raisedAmountGwei;

//     const withdrawEvents = await getWithdrawEvents(address, provider);
//     console.log("기록들", withdrawEvents);
//     withdrawEvents.forEach((event) => {
//       console.log(`Creator: ${event.args.creator}`);
//       console.log(
//         `Amount Withdrawn: ${ethers.utils.formatEther(event.args.amount)} ETH`
//       );
//       console.log(`Block Number: ${event.blockNumber}`);
//       console.log(`Transaction Hash: ${event.transactionHash}`);
//       console.log("------------------------------------");
//     });

//     if (withdrawEvents.length > 0) {
//       raisedAmountGwei = ethers.utils.formatUnits(
//         withdrawEvents[0].args.amount,
//         "gwei"
//       );
//     } else {
//       raisedAmountGwei = ethers.utils.formatUnits(
//         await contract.raisedAmount(),
//         "gwei"
//       );
//     }

//     let targetAmountGwei = ethers.utils.formatUnits(
//       await contract.targetAmount(),
//       "gwei"
//     );

//     return { raisedAmountGwei, targetAmountGwei };
//   } catch (error) {
//     console.error("Error fetching contract details:", error);
//     // animation.endTask(); // 에러 발생 시에도 로딩 종료
//   }
// }

// async function createFundraiserItem(
//   detail,
//   raisedAmountGwei,
//   targetAmountGwei,
//   postAddress,
//   finishMessage
// ) {
//   const item = document.createElement("div");
//   item.id = "fundraiserBox";

//   // 소수점 제거 및 Gwei -> ETH 변환
//   raisedAmountGwei = Math.floor(parseFloat(raisedAmountGwei));
//   targetAmountGwei = Math.floor(parseFloat(targetAmountGwei));

//   const raisedAmount =
//     raisedAmountGwei >= 10000000
//       ? `${ethers.utils.formatEther(
//           ethers.utils.parseUnits(raisedAmountGwei.toString(), "gwei")
//         )} ETH`
//       : `${raisedAmountGwei.toLocaleString()} GWEI`;

//   const targetAmount =
//     targetAmountGwei >= 10000000
//       ? `${ethers.utils.formatEther(
//           ethers.utils.parseUnits(targetAmountGwei.toString(), "gwei")
//         )} ETH`
//       : `${targetAmountGwei.toLocaleString()} GWEI`;

//   if (detail.name.length >= 15) {
//     item.classList.add("tightSpacing");
//     console.log("Long title:", detail.name);
//   }

//   console.log("Raised:", raisedAmountGwei, "Target:", targetAmountGwei);

//   item.innerHTML = `
//       <img class="donationBox" src="${
//         detail.fundraiserImage
//       }" title="donationBox">
//       <h2 class="fundraiser-title">${detail.name}</h2>
//       <div class="progressContainer">
//           <div class="fundraisingStatus">
//               <div class="raisedAmount"><b>${raisedAmount}</b> 후원되었어요</div>
//               <div class="progressPercentage">${(
//                 (raisedAmountGwei / targetAmountGwei) *
//                 100
//               ).toFixed(1)}%</div>
//           </div>
//           <div class="progressBarContainer">
//               <div class="progressBar" style="width: ${
//                 (raisedAmountGwei / targetAmountGwei) * 100
//               }%;"></div>
//           </div>
//           <div class="supporterInfo">
//               <span class="targetAmount"><b>${targetAmount}</b> 목표</span>
//           </div>
//       </div>
//       <p class="finish-date">${finishMessage}</p>
//     `;

//   item.addEventListener("click", function () {
//     window.location.href = postAddress;
//   });

//   return item;
// }

// async function renderFundraiserState(
//   state,
//   detail,
//   provider,
//   signer,
//   selectedWallet,
//   container,
//   fundraiserFactoryAddress
// ) {
//   const postAddressMapping = {
//     fundraising: `post.html?contractAddress=${detail.address}`,
//     finished: `post.html?contractAddress=${detail.address}`,
//     usageUploaded: `usageUploadedPost.html?contractAddress=${detail.address}`,
//     votingDone: `votingDonePost.html?contractAddress=${detail.address}`,
//   };

//   let { raisedAmountGwei, targetAmountGwei } = await fetchFundraiserDetails(
//     provider,
//     signer,
//     selectedWallet,
//     detail.address,
//     fundraiserFactoryAddress
//   );

//   const postAddress = postAddressMapping[state];
//   const finishMessage =
//     detail.finishTime > new Date()
//       ? `${detail.finishTimeString}에 마감돼요`
//       : `${detail.finishTimeString}에 마감되었어요`;

//   const item = await createFundraiserItem(
//     detail,
//     raisedAmountGwei,
//     targetAmountGwei,
//     postAddress,
//     finishMessage
//   );
//   container.appendChild(item);
// }

// async function renderFundraisers(
//   provider,
//   details,
//   container,
//   state,
//   selectedWallet
// ) {
//   container.innerHTML = ""; // Clear the container
//   container.style = null;
//   container.classList.add("fundraiserContainer");

//   container.style.display = "grid";
//   container.style.gridTemplateColumns = "1fr";
//   container.style.gap = "20px";
//   container.style.margin = "0 auto";
//   container.style.maxWidth = "960px";
//   container.style.padding = "20px";

//   const signer = provider.getSigner();
//   console.log("Provider and signer initialized.");

//   const fundraiserFactory = new ethers.Contract(
//     fundraiserFactoryAddress,
//     fundraiserFactoryABI,
//     signer
//   );

//   const now = new Date();
//   let fundraisersFound = false;

//   const events = await fundraiserFactory.queryFilter(
//     fundraiserFactory.filters.FundraiserCreated(),
//     0,
//     "latest"
//   );

//   const myFundraisers = [];
//   for (const event of events) {
//     const fundraiserAddress = event.args.fundraiserAddress;

//     // Check the creator of this fundraiser
//     const transaction = await provider.getTransaction(event.transactionHash);
//     const creatorAddress = transaction.from;

//     if (creatorAddress.toLowerCase() === selectedWallet.toLowerCase()) {
//       myFundraisers.push(fundraiserAddress);
//     }
//   }

//   for (const detail of details) {
//     const isFundraising = detail.finishTime > now;
//     const isAddressInArray = myFundraisers.some(
//       (address) => address.toLowerCase() === detail.address.toLowerCase()
//     );

//     if (isAddressInArray) {
//       if (
//         (state === "fundraising" && isFundraising) ||
//         (state === "finished" && !isFundraising && !detail.isUsageUploaded)
//       ) {
//         fundraisersFound = true;
//         await renderFundraiserState(
//           "fundraising",
//           detail,
//           provider,
//           signer,
//           selectedWallet,
//           container,
//           fundraiserFactoryAddress
//         );
//       } else if (
//         state === "usageUploaded" &&
//         detail.isUsageUploaded &&
//         (detail.isZeroAddress || (!detail.isZeroAddress && !detail.votingDone))
//       ) {
//         fundraisersFound = true;
//         await renderFundraiserState(
//           "usageUploaded",
//           detail,
//           provider,
//           signer,
//           selectedWallet,
//           container,
//           fundraiserFactoryAddress
//         );
//       } else if (
//         state === "votingDone" &&
//         !detail.isZeroAddress &&
//         detail.votingDone
//       ) {
//         fundraisersFound = true;
//         await renderFundraiserState(
//           "votingDone",
//           detail,
//           provider,
//           signer,
//           selectedWallet,
//           container,
//           fundraiserFactoryAddress
//         );
//       }
//     }
//   }

//   if (!fundraisersFound) {
//     const message = document.createElement("h3");
//     message.style.color = "#888";
//     message.style.gridColumn = "1 / -1"; // 메시지를 전체 열에 걸치게 함
//     message.style.textAlign = "center"; // 텍스트를 중앙 정렬

//     const messageMapping = {
//       fundraising: "모금 중인 모금함이 없어요.",
//       finished: "모금 완료된 모금함이 없어요.",
//       usageUploaded: "증빙 완료된 모금함이 없어요.",
//       votingDone: "투표 완료된 모금함이 없어요.",
//     };

//     message.textContent = messageMapping[state];
//     container.appendChild(message);
//   }
//   container.style.display = "grid";
//   container.style.gridTemplateColumns = "1fr";
//   container.style.gap = "20px";
//   container.style.margin = "0 auto";
//   container.style.maxWidth = "960px";
//   container.style.padding = "20px";
// }

// async function detectWallets(walletSelector) {
//   let selectedWallet = null;

//   if (window.ethereum) {
//     try {
//       const provider = new ethers.providers.Web3Provider(window.ethereum);
//       const accounts = await window.ethereum.request({
//         method: "eth_requestAccounts",
//       });

//       walletSelector.innerHTML = ""; // Clear existing options
//       accounts.forEach((account) => {
//         const option = document.createElement("option");
//         option.value = account;
//         option.textContent = account;
//         walletSelector.appendChild(option);
//       });

//       // 최초 지갑 설정
//       if (accounts.length > 0) {
//         selectedWallet = accounts[0]; // 첫 번째 지갑으로 초기화
//       }

//       // 지갑 선택 이벤트 핸들러 추가
//       walletSelector.addEventListener("change", function () {
//         selectedWallet = this.value;
//         console.log("Wallet changed to:", selectedWallet);
//       });
//     } catch (error) {
//       console.error("Error detecting wallets:", error);
//     }
//   } else {
//     alert("Please install MetaMask to use this feature.");
//   }

//   return selectedWallet;
// }

// async function fetchAllWallets(walletSelector) {
//   let selectedWallets = []; // 선택된 지갑 리스트

//   if (window.ethereum) {
//     try {
//       const provider = new ethers.providers.Web3Provider(window.ethereum);
//       const accounts = await window.ethereum.request({
//         method: "eth_requestAccounts", // 모든 연결된 지갑 주소 가져오기
//       });

//       walletSelector.innerHTML = ""; // 기존 옵션 제거
//       accounts.forEach((account) => {
//         const option = document.createElement("option");
//         option.value = account;
//         option.textContent = account;
//         walletSelector.appendChild(option);
//       });

//       // 모든 지갑 주소 배열에 추가
//       selectedWallets = accounts;

//       console.log("선택된 지갑 주소들:", selectedWallets);

//       // 지갑 선택 이벤트 핸들러 추가 (선택된 주소 변경 시 출력)
//       walletSelector.addEventListener("change", function () {
//         console.log("Wallet changed to:", this.value);
//       });
//     } catch (error) {
//       console.error("지갑 탐지 중 오류 발생:", error);
//     }
//   } else {
//     alert("MetaMask 또는 기타 Ethereum 지갑을 설치해주세요.");
//   }

//   return selectedWallets; // 모든 지갑 주소를 배열로 반환
// }

// // 후원 내역
// async function fetchFundraisersSupportedByUser(walletAddress, provider) {
//   try {
//     // Step 1: 모든 모금함 주소 가져오기
//     const fundraiserAddresses = await fetchAllEventsFromContract(provider);

//     const signer = provider.getSigner();

//     // Step 2: 해당 주소가 후원한 적 있는지 확인
//     const supportedFundraisers = [];
//     for (const address of fundraiserAddresses) {
//       const contract = new ethers.Contract(address, fundraiserABI, signer);

//       // donations 매핑에서 walletAddress의 기부 금액 확인
//       const donationAmount = await contract.donations(walletAddress);
//       if (donationAmount.gt(0)) {
//         // 기부한 적이 있는 모금함을 배열에 추가
//         const name = await contract.name();
//         supportedFundraisers.push({
//           address,
//           name,
//           donationAmount: ethers.utils.formatEther(donationAmount),
//         });
//       }
//     }

//     return supportedFundraisers;
//   } catch (error) {
//     console.error("Error fetching supported fundraisers:", error);
//     return [];
//   }
// }

// async function fetchAllSupportedFundraisers(walletSelector, provider) {
//   try {
//     // Step 1: 모든 연결된 지갑 가져오기
//     const connectedWallets = await fetchAllWallets(walletSelector);
//     console.log("Wallet list:", connectedWallets);

//     const allSupportedFundraisers = [];

//     // Step 2: 각 지갑의 후원 기록 확인
//     for (const walletAddress of connectedWallets) {
//       const supportedFundraisers = await fetchFundraisersSupportedByUser(
//         walletAddress,
//         provider
//       );

//       // Step 3: 결과 통합
//       supportedFundraisers.forEach((fundraiser) => {
//         // 중복된 모금함을 허용하지 않으려면 필터링 추가
//         if (
//           !allSupportedFundraisers.some(
//             (item) => item.address === fundraiser.address
//           )
//         ) {
//           allSupportedFundraisers.push({
//             ...fundraiser,
//             supportedBy: walletAddress, // 지갑 주소 추가
//           });
//         }
//       });
//     }

//     return allSupportedFundraisers;
//   } catch (error) {
//     console.error("Error fetching all supported fundraisers:", error);
//     return [];
//   }
// }

// // 평판 점수와 투표 결과를 저장할 배열
// let reputationScores = [];
// let votingResultsData = [];
// let reputationScoresRatio = [];
// let votingResultsDataRatio = [];

// async function calculateReputationScore(provider, connectedWallets) {
//   try {
//     const reputationScoresTemp = []; // 임시 평판 점수 저장
//     const votingResultsTemp = []; // 임시 투표 결과 저장

//     // 1. 내가 생성한 모금함 가져오기
//     const fundraiserAddresses = await fetchAllEventsFromContract(provider); // 모든 모금함 가져오기

//     const myFundraisers = []; // 내가 생성한 모금함 리스트
//     const events = await getEvents(provider, fundraiserFactoryAddress);

//     for (const address of fundraiserAddresses) {
//       for (const wallet of connectedWallets) {
//         const targetEvent = await getTargetEvent(provider, events, address);

//         // 모든 트랜잭션 가져오기
//         const creatorAddress = await getFundraiserCreatorAddresses(
//           provider,
//           targetEvent,
//           address
//         );

//         if (
//           creatorAddress &&
//           creatorAddress.toLowerCase() === wallet.toLowerCase()
//         ) {
//           const governanceTokenAddress = await getGovernanceToken(address);

//           // Governance Token Address가 0x000...000인지 확인
//           if (
//             governanceTokenAddress === ethers.constants.AddressZero ||
//             !governanceTokenAddress
//           ) {
//             console.log(`모금함 ${address}의 Governance Token이 존재하지 않음`);
//             continue;
//           }

//           const isDone = await isVotingDone(address); // 투표 완료 여부 확인
//           console.log(`모금함 ${address}의 투표 완료 여부: ${isDone}`);

//           if (isDone) {
//             const blockNumber = targetEvent.blockNumber; // 이벤트의 블록 번호 가져오기
//             myFundraisers.push({ address, blockNumber });
//           }
//         }
//       }
//     }

//     // 2. 오래된 순으로 정렬
//     myFundraisers.sort((a, b) => a.blockNumber - b.blockNumber);
//     console.log("내가 생성한 모금함 리스트:", myFundraisers);

//     // 3. 평판 점수 계산
//     let reputationScore = 0; // 초기 평판 점수
//     const alpha = 0.7; // 이전 점수 영향도

//     for (const fundraiser of myFundraisers) {
//       console.log(`현재 모금함 주소: ${fundraiser.address}`);

//       const governanceTokenAddress = await getGovernanceToken(
//         fundraiser.address
//       );
//       console.log(
//         `모금함 ${fundraiser.address}의 Governance Token 주소: ${governanceTokenAddress}`
//       );

//       // Governance Token Address가 0x000...000인지 확인
//       if (
//         governanceTokenAddress === ethers.constants.AddressZero ||
//         !governanceTokenAddress
//       ) {
//         console.log(
//           `모금함 ${fundraiser.address}의 Governance Token이 존재하지 않음`
//         );
//         continue;
//       }

//       var { totalVotesFor, totalVotesAgainst } = await getVotingResults(
//         fundraiser.address
//       );
//       totalVotesFor = Number(totalVotesFor);
//       totalVotesAgainst = Number(totalVotesAgainst);

//       const netVotes = totalVotesFor - totalVotesAgainst; // 순수 투표 차이
//       const totalWeight = totalVotesFor + totalVotesAgainst; // 총 투표 수

//       if (totalWeight === 0) {
//         console.log(`모금함 ${fundraiser.address}의 투표가 없음`);
//         continue;
//       }

//       // 정규화된 차이값 계산
//       const scoreRatio = netVotes / totalWeight;
//       console.log(`Score Ratio for ${fundraiser.address}: ${scoreRatio}`);

//       // 데이터 저장
//       votingResultsTemp.push({
//         address: fundraiser.address,
//         totalVotesFor: totalVotesFor,
//         totalVotesAgainst: totalVotesAgainst,
//         scoreRatio: scoreRatio.toFixed(2), // 소수점 2자리 저장
//       });

//       // Ratio 추가
//       votingResultsDataRatio.push(scoreRatio); // 정규화된 값 추가

//       // 평판 점수 계산
//       const currentScore = (1 - alpha) * scoreRatio; // 이전 alpha 계수와 함께 사용
//       reputationScore = alpha * reputationScore + currentScore;

//       console.log(
//         `모금함 ${
//           fundraiser.address
//         }의 점수 계산 완료. 현재 점수: ${reputationScore.toFixed(2)}`
//       );

//       // 평판 점수 저장
//       reputationScoresTemp.push({
//         address: fundraiser.address,
//         score: reputationScore.toFixed(2),
//       });

//       // 평판 점수 비율 업데이트
//       reputationScoresRatio.push(reputationScore);
//     }

//     // 배열에 결과 저장
//     reputationScores = [...reputationScoresTemp];
//     votingResultsData = [...votingResultsTemp];

//     console.log("평판 점수 목록:", reputationScores);
//     console.log("투표 결과 목록:", votingResultsData);

//     console.log("평판 점수 비율 목록:", reputationScoresRatio);
//     console.log("투표 결과 비율 목록:", votingResultsDataRatio);

//     // 최근 5개의 데이터 추출
//     const recentScores = reputationScoresRatio.slice(-5);
//     const recentVotes = votingResultsDataRatio.slice(-5);

//     // 그래프 생성
//     updateGraph(recentVotes, recentScores);

//     const reputationScoreElement = document.querySelector(".reputationScore");
//     let latestReputationScore; // 현재 점수
//     if (recentScores.length > 0) {
//       latestReputationScore = recentScores[recentScores.length - 1]; // 최신 평판 점수 가져오기
//       reputationScoreElement.textContent = `${latestReputationScore.toFixed(
//         2
//       )} points`;
//     } else {
//       reputationScoreElement.textContent = "0.00 points"; // 데이터가 없을 경우 기본값
//     }

//     var averageReputationScore; // 평균 점수
//     let sum = 0;
//     for (let i = 0; i < reputationScoresRatio.length; i++) {
//       sum += reputationScoresRatio[i];
//     }
//     averageReputationScore = sum / reputationScoresRatio.length;

//     let positiveCount = 0;
//     let negativeCount = 0;
//     for (let i = 0; i < votingResultsDataRatio.length; i++) {
//       if (votingResultsDataRatio >= 0) positiveCount++;
//       else negativeCount++;
//     }

//     const reputationDescription = document.querySelector(
//       ".reputationDescription"
//     );
//     reputationDescription.innerHTML = `
//       <p>현재 <b>${latestReputationScore.toFixed(2)}점</b>,<br>
//       지금까지 평균 <b>${averageReputationScore.toFixed(2)}점</b>,<br>
//       긍정적인 평가를 받은 횟수 <b>${positiveCount}회</b>,<br>
//       부정적인 평가를 받은 횟수 <b>${negativeCount}회</b>입니다.</p>`;
//   } catch (error) {
//     console.error("평판 점수 계산 오류:", error);
//   }
// }

// function updateGraph(positiveVoteRatios, reputationScores) {
//   const positivePolyline = document.getElementById("positive-points");
//   const reputationPolyline = document.getElementById("reputation-points");
//   const positiveTooltips = document.getElementById("positive-tooltips");
//   const reputationTooltips = document.getElementById("reputation-tooltips");
//   const xAxisLabels = document.getElementById("x-axis-labels");

//   const statisticElement = document.querySelector(".card .statistic");
//   const svgWidth = 400; // 그래프 너비
//   const svgHeight = 260; // 그래프 높이
//   const maxPoints = 5; // 최대 점의 수
//   const xStep = svgWidth / (maxPoints - 1); // X축 간격 계산

//   const normalizeY = (value) => svgHeight / 2 - value * (svgHeight / 2);

//   let positivePoints = "";
//   let reputationPoints = "";
//   let positiveTooltipContent = "";
//   let reputationTooltipContent = "";
//   let xLabelsContent = "";

//   for (let i = 0; i < positiveVoteRatios.length; i++) {
//     const x = i * xStep; // X좌표 계산
//     const yPositive = normalizeY(positiveVoteRatios[i]);
//     const yReputation = normalizeY(reputationScores[i]);

//     positivePoints += `${x},${yPositive} `;
//     reputationPoints += `${x},${yReputation} `;

//     positiveTooltipContent += `
//       <div class="point-${i + 1}" style="left: ${x}px; top: ${
//       yPositive - 10
//     }px;">
//         <div class="tooltip">${(positiveVoteRatios[i] * 100).toFixed(1)}%</div>
//       </div>`;
//     reputationTooltipContent += `
//       <div class="point-${i + 1}" style="left: ${x}px; top: ${
//       yReputation - 10
//     }px;">
//         <div class="tooltip">${reputationScores[i].toFixed(2)}</div>
//       </div>`;

//     xLabelsContent += `<span class="day" style="left: ${x}px;">#${
//       i + 1
//     }</span>`;
//   }

//   positivePolyline.setAttribute("points", positivePoints.trim());
//   reputationPolyline.setAttribute("points", reputationPoints.trim());
//   positiveTooltips.innerHTML = positiveTooltipContent;
//   reputationTooltips.innerHTML = reputationTooltipContent;

//   // updateGraphLines(); // 세 줄의 위치 동적 계산
// }

// document.addEventListener("DOMContentLoaded", async function () {
//   var createFundraiserButton = document.getElementById(
//     "createFundraiserButton"
//   );
//   createFundraiserButton.addEventListener("click", function () {
//     window.location.href =
//       window.location.protocol +
//       "//" +
//       window.location.host +
//       "/createFundraiser.html";
//   });

//   const menuItems = document.querySelectorAll(".sidebar a");
//   const sections = document.querySelectorAll(".mainContent section");
//   const walletSelector = document.getElementById("walletSelector");
//   const fundraisersList = document.getElementById("myFundraisersList");
//   const selectedWallets = await detectWallets(walletSelector);
//   let selectedWallet;

//   selectedWallet = await detectWallets(walletSelector);
//   console.log("Selected wallet after detection:", selectedWallet);

//   const connectedWallets = await fetchAllWallets(walletSelector);
//   console.log("Wallet list:", connectedWallets);

//   const fundraiserSection = document.getElementById("fundraiserSection");
//   fundraiserSection.style.display = "flex";

//   menuItems.forEach((item) => {
//     item.addEventListener("click", async function (event) {
//       event.preventDefault();
//       sections.forEach((section) => (section.style.display = "none"));
//       const activeSection = document.getElementById(
//         item.id.replace("Menu", "Section")
//       );
//       if (activeSection) {
//         if (activeSection.id === "mainPageLink") {
//           window.location.href =
//             window.location.protocol +
//             "//" +
//             window.location.host +
//             "/index.html";
//         } else if (activeSection.id === "fundraiserMenu") {
//           await loadFundraisersForCurrentState(); // 페이지 다시 로딩
//         }
//         console.log(activeSection);
//         activeSection.style.display = "flex";
//       }
//     });
//   });

//   const animation = new LoadingAnimation("../images/loadingAnimation.json");
//   await animation.loadAnimation();

//   const overlay = document.getElementById("loading-overlay");
//   overlay.style.display = "flex"; // 오버레이 활성화

//   let currentState = "fundraising"; // 기본 state 설정

//   try {
//     await window.ethereum.request({ method: "eth_requestAccounts" });
//     const provider = new ethers.providers.Web3Provider(window.ethereum);

//     async function loadFundraisersForCurrentState(
//       state,
//       container,
//       isDonationHistory = false
//     ) {
//       try {
//         console.log(
//           `현재 state: ${state}, isDonationHistory: ${isDonationHistory}`
//         );

//         // 후원 내역인지, 내 모금함인지에 따라 다른 데이터를 가져옴
//         let fundraisers;
//         if (isDonationHistory) {
//           const supportedFundraisers = await fetchAllSupportedFundraisers(
//             walletSelector,
//             provider
//           );
//           console.log("후원 내역:", supportedFundraisers);
//           // 데이터 필터링 (후원 내역에는 state가 없을 가능성 고려)
//           fundraisers = supportedFundraisers.filter((fundraiser) => {
//             if (state === "fundraising") {
//               return new Date() < new Date(fundraiser.finishTime);
//             } else if (state === "finished") {
//               return new Date() > new Date(fundraiser.finishTime);
//             } else {
//               return true; // 모든 상태 반환
//             }
//           });
//         } else {
//           const fundraiserAddresses = await fetchAllEventsFromContract(
//             provider
//           );
//           const details = await fetchAllFundraiserDetails(
//             fundraiserAddresses,
//             provider
//           );
//           console.log("내 모금함:", details);

//           // 데이터 필터링 (state 필드 존재 여부 확인)
//           fundraisers = details.filter((fundraiser) => {
//             if (state === "fundraising") {
//               return new Date() < new Date(fundraiser.finishTime);
//             } else if (state === "finished") {
//               return (
//                 new Date() > new Date(fundraiser.finishTime) &&
//                 !fundraiser.isUsageUploaded
//               );
//             } else if (state === "usageUploaded") {
//               return (
//                 fundraiser.isUsageUploaded &&
//                 (!fundraiser.isZeroAddress || !fundraiser.votingDone)
//               );
//             } else if (state === "votingDone") {
//               return !fundraiser.isZeroAddress && fundraiser.votingDone;
//             }
//             return false; // 기본적으로 false 반환
//           });
//         }

//         console.log(`필터링된 데이터 (state: ${state}):`, fundraisers);

//         // 컨테이너 초기화
//         container.innerHTML = "";

//         if (fundraisers.length === 0) {
//           // 데이터가 없을 경우 메시지 표시
//           const message = document.createElement("h3");
//           message.style.color = "#888";
//           message.style.gridColumn = "1 / -1"; // 메시지를 전체 열에 걸치게 함
//           message.style.textAlign = "center"; // 텍스트 중앙 정렬

//           const messageMapping = {
//             fundraising: "모금 중인 모금함이 없어요.",
//             finished: "모금 완료된 모금함이 없어요.",
//             usageUploaded: "증빙 완료된 모금함이 없어요.",
//             votingDone: "투표 완료된 모금함이 없어요.",
//           };

//           message.textContent = messageMapping[state];
//           container.appendChild(message);
//         } else {
//           // 데이터 렌더링
//           await renderFundraisers(
//             provider,
//             fundraisers,
//             container,
//             state,
//             selectedWallet
//           );
//         }
//       } catch (error) {
//         console.error("loadFundraisersForCurrentState 오류:", error);
//         container.innerHTML = `<p>데이터를 불러오는 중 오류가 발생했습니다.</p>`;
//       }
//     }

//     // 초기 상태에 맞는 모금함 로드
//     await loadFundraisersForCurrentState(
//       "fundraising",
//       document.querySelector(".fundraiserContainer")
//     );

//     // 라디오 버튼 이벤트 리스너
//     document
//       .querySelectorAll('input[name="fundraiserState"]')
//       .forEach((radio) => {
//         radio.addEventListener("change", async function () {
//           const currentSection = document.querySelector(
//             ".mainContent section:not([style*='display: none'])"
//           );
//           const state = this.value;
//           const container = currentSection.querySelector(
//             ".fundraiserContainer"
//           );

//           console.log(
//             `현재 활성화된 섹션: ${currentSection.id}, state: ${state}`
//           );

//           if (currentSection.id === "fundraiserSection") {
//             await loadFundraisersForCurrentState(state, container, false);
//           } else if (currentSection.id === "donationHistorySection") {
//             await loadFundraisersForCurrentState(state, container, true);
//           }
//         });
//       });

//     // 평판 점수 계산
//     await calculateReputationScore(provider, connectedWallets);

//     await fetchAllSupportedFundraisers(walletSelector, provider).then(
//       (result) => {
//         console.log("All Supported Fundraisers:", result);
//       }
//     );

//     // 지갑 변경 이벤트 처리
//     walletSelector.addEventListener("change", async function () {
//       overlay.style.display = "flex"; // 오버레이 활성화
//       selectedWallet = this.value; // 새로 선택한 지갑 설정
//       console.log("Wallet changed to:", selectedWallet);
//       await loadFundraisersForCurrentState(); // 현재 state를 기준으로 페이지 다시 로딩
//       overlay.style.display = "none"; // 오버레이 비활성화
//     });
//   } catch (error) {
//     console.error("Initialization error:", error);
//   } finally {
//     overlay.style.display = "none"; // 오버레이 비활성화
//   }
// });
