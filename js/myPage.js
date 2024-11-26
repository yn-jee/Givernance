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

  const myFundraisers = [];
  for (const event of events) {
    const fundraiserAddress = event.args.fundraiserAddress;

    // Check the creator of this fundraiser
    const transaction = await provider.getTransaction(event.transactionHash);
    const creatorAddress = transaction.from;

    if (creatorAddress.toLowerCase() === selectedWallet.toLowerCase()) {
      myFundraisers.push(fundraiserAddress);
    }
  }

  for (const detail of details) {
    const isFundraising = detail.finishTime > now;
    const isAddressInArray = myFundraisers.some(
      (address) => address.toLowerCase() === detail.address.toLowerCase()
    );

    if (isAddressInArray) {
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
    }
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

document.addEventListener("DOMContentLoaded", async function () {
  var createFundraiserButton = document.getElementById(
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
  const fundraisersList = document.getElementById("myFundraisersList");
  let selectedWallet;

  selectedWallet = await detectWallets(walletSelector);
  console.log("Selected wallet after detection:", selectedWallet);

  const fundraiserSection = document.getElementById("profileSection");
  fundraiserSection.style.display = "flex";

  menuItems.forEach((item) => {
    item.addEventListener("click", function (event) {
      event.preventDefault();
      sections.forEach((section) => (section.style.display = "none"));
      const activeSection = document.getElementById(
        item.id.replace("Menu", "Section")
      );
      if (activeSection) {
        if (activeSection.id === "mainPageLink") {
          window.location.href =
            window.location.protocol +
            "//" +
            window.location.host +
            "/index.html";
        }
        console.log(activeSection);
        activeSection.style.display = "flex";
      }
    });
  });

  const animation = new LoadingAnimation("../images/loadingAnimation.json");
  await animation.loadAnimation();

  const overlay = document.getElementById("loading-overlay");
  overlay.style.display = "flex"; // 오버레이 활성화

  let currentState = "fundraising"; // 기본 state 설정

  try {
    await window.ethereum.request({ method: "eth_requestAccounts" });
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    async function loadFundraisersForCurrentState() {
      const fundraiserAddresses = await fetchAllEventsFromContract(provider);
      const details = await fetchAllFundraiserDetails(
        fundraiserAddresses,
        provider
      );

      console.log("Fundraiser Details:", details);
      const container = document.querySelector(".fundraiserContainer");

      await renderFundraisers(
        provider,
        details,
        container,
        currentState,
        selectedWallet
      );
    }

    // 페이지 초기 로드 시 데이터를 불러옴
    await loadFundraisersForCurrentState();

    // 라디오 버튼 변경 이벤트 처리
    document
      .querySelectorAll('input[name="fundraiserState"]')
      .forEach((radio) => {
        radio.addEventListener("change", async function () {
          overlay.style.display = "flex"; // 오버레이 활성화
          currentState = this.value; // 현재 state 업데이트
          await loadFundraisersForCurrentState(); // 페이지 다시 로딩
          overlay.style.display = "none"; // 오버레이 비활성화
        });
      });

    // 지갑 변경 이벤트 처리
    walletSelector.addEventListener("change", async function () {
      overlay.style.display = "flex"; // 오버레이 활성화
      selectedWallet = this.value; // 새로 선택한 지갑 설정
      console.log("Wallet changed to:", selectedWallet);
      await loadFundraisersForCurrentState(); // 현재 state를 기준으로 페이지 다시 로딩
      overlay.style.display = "none"; // 오버레이 비활성화
    });
  } catch (error) {
    console.error("Initialization error:", error);
  } finally {
    overlay.style.display = "none"; // 오버레이 비활성화
  }
});
