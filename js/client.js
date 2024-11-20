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

async function initializeProvider() {
  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });
  // 연결된 메타마스크 주소
  const connectedAddress = accounts[0];
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();

  return { provider, signer, connectedAddress };
}

function getCurrentDateTime() {
  const now = new Date();
  const dateTimeLocal = now.toISOString().slice(0, 16);
  return dateTimeLocal;
}

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
// 이미지 데이터 표시하기
async function displayImageData(image) {
  const fundraiserImagesContainer = document.querySelector(".fundraiserImage");

  if (fundraiserImagesContainer) {
    try {
      const img = document.createElement("img");
      img.src = image; // 이미지 소스 (Blob URL)
      img.alt = "IPFS image";
      img.classList.add("fundraiserImage");
      img.style.width = "300px"; // 필요에 따라 크기 조절

      // 이미지가 성공적으로 로드되었는지 확인
      img.onload = () => {
        console.log("이미지 로드 성공:", img.src);
      };

      // 이미지 로드 중 에러 확인
      img.onerror = (e) => {
        console.error("이미지 로드 실패:", img.src, e);
      };

      fundraiserImagesContainer.appendChild(img);
    } catch (error) {
      console.error("Error displaying image:", error);
    }
  } else {
    console.error("Error: .fundraiserImage element not found");
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
      let isVotingDone = false;
      if (governanceTokenAddress.toLowerCase() !== zeroAddress.toLowerCase()) {
        isVotingDone = await isVotingDone(address);
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
        isVotingDone,
      };
    })
  );

  return details;
}

document.addEventListener("DOMContentLoaded", async function () {
  const animation = new LoadingAnimation("../images/loadingAnimation.json");
  await animation.loadAnimation();

  const overlay = document.getElementById("loading-overlay");
  overlay.style.display = "flex"; // 오버레이 활성화

  try {
    await window.ethereum.request({ method: "eth_requestAccounts" });
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    const fundraiserAddresses = await fetchAllEventsFromContract(provider);
    const details = await fetchAllFundraiserDetails(
      fundraiserAddresses,
      provider
    );
    console.log("Fundraiser Details:", details);
    const container = document.querySelector(".fundraiserContainer");

    // Set the radio button to 'fundraising' and render fundraisers
    const fundraisingRadio = document.querySelector(
      'input[name="fundraiserState"][value="fundraising"]'
    );
    fundraisingRadio.checked = true;
    await renderFundraisers(details, container, "fundraising");

    document
      .querySelectorAll('input[name="fundraiserState"]')
      .forEach((radio) => {
        radio.addEventListener("change", async function () {
          overlay.style.display = "flex"; // 오버레이 활성화
          const selectedState = this.value;
          await renderFundraisers(details, container, selectedState);
          overlay.style.display = "none"; // 오버레이 비활성화
        });
      });
  } catch (error) {
    console.error("Initialization error:", error);
  } finally {
    overlay.style.display = "none"; // 오버레이 비활성화
  }
});

async function renderFundraisers(details, container, state) {
  container.innerHTML = ""; // Clear the container
  const now = new Date();
  let fundraisersFound = false;

  details.forEach((detail) => {
    const isFundraising = detail.finishTime > now;

    if (
      (state === "fundraising" && isFundraising) ||
      (state === "finished" && !isFundraising && !detail.isUsageUploaded)
    ) {
      fundraisersFound = true;

      const item = document.createElement("div");
      const postAddress = "post.html?contractAddress=" + detail.address;
      item.id = "fundraiserBox";

      if (detail.name.length >= 15) {
        item.classList.add("tightSpacing");
        console.log("long title", detail.name);
      }

      item.innerHTML = `
            <img class="donationBox" src="${detail.fundraiserImage}" title="donationBox">
            <h2 class="fundraiser-title">${detail.name}</h2>
            <p class="target-amount">Target Amount is <b>${detail.targetAmount}</b></p>
            <p class="finish-date">Open until <b>${detail.finishTimeString}</b></p>
            `;
      item.addEventListener("click", function () {
        window.location.href = postAddress;
      });
      container.appendChild(item);
    } else if (
      state === "usageUploaded" &&
      detail.isUsageUploaded &&
      !detail.isVotingDone
    ) {
      fundraisersFound = true;

      if (detail.name.length >= 15) {
        item.classList.add("tightSpacing");
        console.log("long title", detail.name);
      }

      const item = document.createElement("div");
      const postAddress =
        "usageUploadedPost.html?contractAddress=" + detail.address;
      item.id = "fundraiserBox";
      item.innerHTML = `
            <img class="donationBox" src="${detail.fundraiserImage}" title="donationBox">
            <h2 class="fundraiser-title">${detail.name}</h2>
            <p class="target-amount">Target Amount is <b>${detail.targetAmount}</b></p>
            <p class="finish-date">Open until <b>${detail.finishTimeString}</b></p>
            `;
      item.addEventListener("click", function () {
        window.location.href = postAddress;
      });
      container.appendChild(item);
    } else if (state === "usageUploaded" && detail.isVotingDone) {
      fundraisersFound = true;

      if (detail.name.length >= 15) {
        item.classList.add("tightSpacing");
        console.log("long title", detail.name);
      }

      const item = document.createElement("div");
      const postAddress =
        "votingDonePost.html?contractAddress=" + detail.address;
      item.id = "fundraiserBox";
      item.innerHTML = `
            <img class="donationBox" src="${detail.fundraiserImage}" title="donationBox">
            <h2 class="fundraiser-title">${detail.name}</h2>
            <p class="target-amount">Target Amount is <b>${detail.targetAmount}</b></p>
            <p class="finish-date">Open until <b>${detail.finishTimeString}</b></p>
            `;
      item.addEventListener("click", function () {
        window.location.href = postAddress;
      });
      container.appendChild(item);
    }
  });

  if (!fundraisersFound && state === "fundraising") {
    const message = document.createElement("h3");
    message.style.color = "#888";
    message.style.gridColumn = "1 / -1"; // 메시지를 전체 열에 걸치게 함
    message.style.textAlign = "center"; // 텍스트를 중앙 정렬
    message.textContent = "모금 중인 모금함이 없어요.";

    container.appendChild(message);
  } else if (!fundraisersFound && state === "finished") {
    const message = document.createElement("h3");
    message.style.color = "#888";
    message.style.gridColumn = "1 / -1"; // 메시지를 전체 열에 걸치게 함
    message.style.textAlign = "center"; // 텍스트를 중앙 정렬
    message.textContent = "모금 완료된 모금함이 없어요.";

    container.appendChild(message);
  } else if (!fundraisersFound && state === "usageUploaded") {
    const message = document.createElement("h3");
    message.style.color = "#888";
    message.style.gridColumn = "1 / -1"; // 메시지를 전체 열에 걸치게 함
    message.style.textAlign = "center"; // 텍스트를 중앙 정렬
    message.textContent = "증빙 완료된 모금함이 없어요.";

    container.appendChild(message);
  } else if (!fundraisersFound && state === "votingDone") {
    const message = document.createElement("h3");
    message.style.color = "#888";
    message.style.gridColumn = "1 / -1"; // 메시지를 전체 열에 걸치게 함
    message.style.textAlign = "center"; // 텍스트를 중앙 정렬
    message.textContent = "투표 완료된 모금함이 없어요.";

    container.appendChild(message);
  }
  // Add back the grid display style to the container
  container.style.display = "grid";
  container.style.gridTemplateColumns = "1fr 1fr 1fr";
  container.style.gap = "20px";
  container.style.margin = "0 auto";
  container.style.maxWidth = "1200px";
  container.style.padding = "20px";
}
