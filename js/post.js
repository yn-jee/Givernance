import { LoadingAnimation } from "./LoadingAnimation.js";
import { ethers } from "https://unpkg.com/ethers@5.7.2/dist/ethers.esm.min.js";
import { minidenticonSvg } from "https://cdn.jsdelivr.net/npm/minidenticons@4.2.1/minidenticons.min.js";
import {
  fundraiserFactoryAddress,
  fundraiserFactoryABI,
  fundraiserABI,
} from "./contractConfig.js";
import {
  fundraiserInfoContract,
  usageRecordContract,
  IpfsContractABI,
  storeData,
  getData,
} from "./IPFSContractConfig.js";
import { initializeProvider } from "./initializeProvider.js";

import fs from "fs";
import { uploadFiles } from "./upload.js";
import { fetchData } from "./fetch.js";

const animation = new LoadingAnimation("../images/loadingAnimation.json");
await animation.loadAnimation();

const urlParams = new URLSearchParams(window.location.search);
const contractAddress = urlParams.get("contractAddress"); // 'contractAddress' 파라미터의 값 가져오기
const IpfsGateway = "https://purple-careful-ladybug-259.mypinata.cloud/ipfs/";

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

async function getFundraiserLastEvent(provider, event, address, contractOwner) {
  const txHash = event.transactionHash;
  const tx = await provider.getTransaction(txHash);
  const creatorAddress = tx.from;
  if (_fundraiserAddress == event.args.fundraiserAddress) {
    return creatorAddress;
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

function trimAddress(address) {
  return `${address.slice(0, 7)}...${address.slice(-5)}`;
}

function copyToClipboard(text) {
  // navigator.clipboard 지원 여부 확인
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        alert("Address copied to clipboard!");
      })
      .catch((err) => {
        console.error("Error copying text to clipboard: ", err);
      });
  } else {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    // 화면 밖으로
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand("copy");
      alert("Address copied to clipboard!");
    } catch (err) {
      console.error("Error copying text to clipboard: ", err);
    } finally {
      document.body.removeChild(textArea);
    }
  }
}

// 트랜잭션 해시를 이용하여 생성된 블록 번호를 가져오는 함수
async function getContractCreationBlock(provider, event, _fundraiserAddress) {
  const txHash = event.transactionHash;
  const tx = await provider.getTransaction(txHash);
  if (_fundraiserAddress === event.args.fundraiserAddress) {
    return tx.blockNumber;
  }
}

// 타임스탬프 가져오기
async function getBlockTimestamp(provider, blockNumber) {
  const block = await provider.getBlock(blockNumber);
  return block.timestamp;
}

// 출금하기
async function withdrawFunds(contractAddress, factoryAddress, contractOwner) {
  try {
    animation.startTask();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner(); // 서명자를 가져옴 (함수를 호출하는 계정)

    // Fundraiser 컨트랙트 인스턴스 생성
    const fundraiserContract = new ethers.Contract(
      contractAddress,
      fundraiserABI,
      signer
    );

    // 현재 로그인한 계정 주소와 컨트랙트 소유자 주소 확인
    const currentAddress = await signer.getAddress();
    console.log("호출자:", currentAddress);

    const events = await getEvents(provider, factoryAddress);
    console.log(events[0]);

    console.log("생성자:", contractOwner);

    if (currentAddress.toLowerCase() !== contractOwner.toLowerCase()) {
      throw new Error("Only the contract owner can withdraw funds.");
    }

    // withdraw 함수 호출
    const tx = await fundraiserContract.withdraw();
    console.log("Withdraw transaction sent:", tx);

    // 트랜잭션이 완료될 때까지 기다림
    const receipt = await tx.wait();
    console.log("Withdraw transaction mined:", receipt);
    animation.endTask();
    location.reload();
  } catch (error) {
    console.error("Withdraw function failed:", error);
    alert(error.message); // 에러 메시지를 사용자에게 표시
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

// 이미지 데이터 표시하기
async function displayImageData(images) {
  const fundraiserImagesContainer = document.querySelector(
    ".fundraiserImageContainer"
  );

  if (fundraiserImagesContainer) {
    for (const image of images) {
      try {
        const img = document.createElement("img");
        img.src = image; // 이미지 소스 (Blob URL)
        img.alt = "IPFS image";
        img.classList.add("fundraiserImage");

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
    }
  } else {
    console.error("Error: .fundraiserImage element not found");
  }
}

// 컨트랙트 정보를 가져와 페이지에 표시하는 함수
async function fetchAndDisplayFundraiserDetails(
  provider,
  signer,
  connectedAddress,
  address,
  factoryAddress
) {
  try {
    animation.startTask();

    // 컨트랙트 객체 생성
    const contract = new ethers.Contract(address, fundraiserABI, provider);
    // 모든 트랜잭션 가져오기
    const events = await getEvents(provider, factoryAddress);
    const targetEvent = await getTargetEvent(provider, events, address);

    // 컨트랙트 데이터 가져오기
    const name = await contract.name();
    const type = await contract.fundraiserType();
    console.log(type);

    const contractOwner = await getFundraiserCreatorAddresses(
      provider,
      targetEvent,
      address
    );
    console.log(contractOwner);

    var raisedAmount;

    const withdrawEvents = await getWithdrawEvents(contractAddress, provider);
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
      raisedAmount = ethers.utils.formatUnits(
        withdrawEvents[0].args.amount,
        "gwei"
      );
    } else {
      raisedAmount = ethers.utils.formatUnits(
        await contract.raisedAmount(),
        "gwei"
      );
    }

    // 생성된 시간 가져오기
    const blockNumber = await getContractCreationBlock(
      provider,
      targetEvent,
      address
    );

    const timestamp = await getBlockTimestamp(provider, blockNumber);
    const creationDate = new Date(timestamp * 1000).toLocaleString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });

    const targetAmount = ethers.utils.formatUnits(
      await contract.targetAmount(),
      "gwei"
    );
    const finishTime = new Date(
      (await contract.finishTime()).toNumber() * 1000
    ).toLocaleString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });

    // const options = {
    //   method: "GET",
    //   headers: {
    //     Authorization:
    //       "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIwNWM1ZmU2ZC02NTVlLTQ0MTMtYmZhZC04ZWIyMWI4ZjQ3ZjMiLCJlbWFpbCI6Im5heWoxMjIxQG5hdmVyLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiIxODU4NmM5NjRiNGEwYmU2MDAyMyIsInNjb3BlZEtleVNlY3JldCI6IjAyNTVhNDRkZGE5MTdkNTdjNTM5MWJjZGM3YWMxZGFlODJiNTA2YzZkN2FhN2JiYzQzN2I0OGQ4NjEwNjBlMTMiLCJleHAiOjE3NjAxMDA4NDJ9.njkh67Ym_8UHOApRvNVEH_FH96DsaJlxlDkkdfLJZvM",
    //   },
    // };

    // fetch(
    //   "https://api.pinata.cloud/v3/files/01929e60-b906-763b-b04e-a10d51029039?pinataGatewayToken=k1pU-qaPbJ3NIOyUH22ZwYpWXGKk47BaoWU8kl1j3r1Nmc51-U3Odw14JtMvV4TB",
    //   options
    // )
    //   .then((response) => response.json())
    //   .then((response) => console.log(response))
    //   .catch((err) => console.error(err));

    const form = new FormData();

    // ipfs에 저장된 정보 가져오기
    const infoContract = new ethers.Contract(
      fundraiserInfoContract,
      IpfsContractABI,
      signer
    );
    const infoData = await getData(infoContract, contractAddress);
    console.log(infoData);

    const hashesLength = infoData.hashes.length;

    var description;
    const images = [];
    const items = [];

    console.log(infoData.hashes[0]);
    try {
      // const response = await fetch(`/fetch/${infoData.hashes[0]}`, {
      //   method: "GET", // GET 요청 사용
      // });

      // if (!response.ok) {
      //   throw new Error("파일을 불러오는 데 실패했습니다.");
      // }

      const response = await fetchData(infoData.hashes[0]);

      const textData = await response.json();
      description = textData.data;
      console.log("모금함 설명:", description);

      // document.getElementById("textContainer").innerText = description; // 텍스트 데이터를 HTML 요소에 출력
    } catch (error) {
      console.error("Error fetching text:", error);
      alert("텍스트 데이터를 불러오는 중 오류가 발생했습니다.");
    }

    if (type == "commodity") {
      for (let i = 1; i < hashesLength - 1; i++) {
        console.log(infoData.hashes[i]);

        try {
          const imageUrl = IpfsGateway + infoData.hashes[i];
          images.push(imageUrl);
        } catch (error) {
          console.error("Error fetching image:", error);
          alert("이미지 데이터를 불러오는 중 오류가 발생했습니다.");
        }
      }
      console.log(images);

      // _items 데이터 가져오기
      console.log(infoData.hashes[hashesLength - 1]);

      try {
        const response = await fetch(
          `/fetch/${infoData.hashes[hashesLength - 1]}`,
          {
            method: "GET", // GET 요청 사용
          }
        );

        if (!response.ok) {
          throw new Error("파일을 불러오는 데 실패했습니다.");
        }

        const itemData = await response.json();

        itemData.data.forEach((item) => {
          items.push({
            currency: item.currency,
            itemName: item.itemName,
            quantity: item.quantity,
            totalPrice: item.totalPrice,
            unitPrice: item.unitPrice,
          });
        });
      } catch (error) {
        console.error("Error fetching items:", error);
        alert("물품 데이터를 불러오는 중 오류가 발생했습니다.");
      }
    } else {
      for (let i = 1; i < hashesLength; i++) {
        console.log(infoData.hashes[i]);

        try {
          const imageUrl = IpfsGateway + infoData.hashes[i];
          images.push(imageUrl);
        } catch (error) {
          console.error("Error fetching image:", error);
          alert("이미지 데이터를 불러오는 중 오류가 발생했습니다.");
        }
      }
      console.log(images);
    }

    const image = images || "images/donationBox.png";

    // 페이지에 표시할 내용 생성
    const detailsDiv = document.getElementById("fundraiserDetails");
    detailsDiv.innerHTML = `
            <h1 class="fundraiserTitle">${name}</h1>
            <div class="contractMetaData">
                <div class="profile">
                    <minidenticon-svg class="profileImage" username="${contractOwner}"></minidenticon-svg>
                    <p class="contractOwner" fullAddress="${contractOwner}">${trimAddress(
      contractOwner
    )}</p>
                </div>
                <p class="creationTime">${creationDate}</p>
            </div>
            <div class="fundraiserImageContainer"></div>
            <p class="fundraiserDescription">${description}</p>
            <p class="fundraiserFinishTime">${finishTime} 마감</p>

            <div class="fundraisingStatus">
            <div class="raisedAmount"><b>${parseInt(
              raisedAmount
            ).toLocaleString()} GWEI</b> 후원되었어요</div>
            <div class="progressPercentage">${(
              (raisedAmount / targetAmount) *
              100
            ).toFixed(1)}%</div>
            </div>
            <div class="progressBarContainer">
                <div class="progressBar" style="width: ${
                  (raisedAmount / targetAmount) * 100
                }%;"></div>
            </div>
            <div class="supporterInfo">
                <span class="targetAmount">${parseInt(
                  targetAmount
                ).toLocaleString()} GWEI 목표</span>
            </div>

            <div class="items">
                <h3 style="text-align: left;">Items</h3>
                <ul>
                    ${items
                      .map(
                        (item) => `
                        <div class="itemInfo">
                            <div class="itemNamePrice">
                                <p class="itemName">${item.itemName}</p>
                                <p class="itemPrice">개당 ${item.unitPrice} GWEI</p>
                            </div>
                            <div class="itemDetails">
                                <p class="itemQuantity">${item.quantity}개</p>
                                <p class="totalPrice">총 ${item.totalPrice} GWEI</p>
                            </div>
                        </div>
                    `
                      )
                      .join("")}
                </ul>
            </div>
        `;

    displayImageData(image);
    document.querySelector(".contractOwner").addEventListener("click", () => {
      copyToClipboard(contractOwner);
    });

    var modal = document.getElementsByClassName("donateModal")[0];
    var donateModalOpenButton = document.getElementById(
      "donateModalOpenButton"
    );
    var closeButton = document.querySelector(".donateModal .donateModalClose");
    var donateAmountInput = document.getElementById("donateAmount");
    var donateButton = document.querySelector(".donateButton");

    if (type != "commodity") {
      const itemsContainer = document.querySelector(".items");
      itemsContainer.style.display = "none";
    }
    // 현재 시각과 마감 시각 비교
    if (
      new Date().getTime() >
      new Date((await contract.finishTime()).toNumber() * 1000).getTime()
    ) {
      // 마감되었고, 연결된 주소와 컨트랙트 생성자 주소가 같을 경우 usage 등록 버튼 생성
      if (connectedAddress == contractOwner.toLowerCase()) {
        // 사용 내역이 등록되었는지 확인
        const usageContract = new ethers.Contract(
          usageRecordContract,
          IpfsContractABI,
          signer
        );
        const usageData = await getData(usageContract, contractAddress);

        // console.log("연결된:", connectedAddress);
        // console.log("생성자:", contractOwner.toLowerCase());

        // if (connectedAddress != contractOwner.toLowerCase()) {
        //   withdrawButton.disabled = true;
        //   withdrawButton.textContent = "모금함 생성 계정만 출금 가능합니다.";
        //   withdrawButton.style =
        //     "background: #e0e0e0; color: white; width: auto; padding: 0px 15px; text-align: center;";
        // } else {
        //   withdrawButton.addEventListener("click", async function () {
        //     await withdrawFunds(contractAddress, factoryAddress);
        //   });
        // }

        if (withdrawEvents.length == 0) {
          const withdrawButton = document.getElementById("withdrawButton");
          withdrawButton.style.display = "block";

          withdrawButton.addEventListener("click", async function () {
            await withdrawFunds(contractAddress, factoryAddress, contractOwner);
          });
          document.querySelector("#uploadUsageButton").style = "display: none;";
          document.querySelector("#uploadUsageButton").disabled = true;
          document.querySelector("#donateModalOpenButton").disabled = true;
          document.querySelector("#donateModalOpenButton").style =
            "display: none;";
        } else {
          if (usageData.hashes.length > 0) {
            document.getElementById("withdrawButton").display = "none";
            document.getElementById("withdrawButton").disabled = true;
            document.querySelector("#donateModalOpenButton").disabled = true;
            document.querySelector("#donateModalOpenButton").textContent =
              "이미 사용 내역이 등록된 모금함입니다.";
            document.querySelector("#donateModalOpenButton").style =
              "background: #e0e0e0; color: white; width: auto; padding: 0px 15px; text-align: center;";
          } else {
            // 후원 버튼 숨기기
            document.querySelector("#donateModalOpenButton").style =
              "display: none;";
            // 사용 내역 등록 버튼 보이기
            document.querySelector("#uploadUsageButton").style =
              "display: block;";

            const uploadUsageAddress =
              "usagePost.html?contractAddress=" + contractAddress;
            document
              .querySelector("#uploadUsageButton")
              .addEventListener("click", function () {
                window.location.href = uploadUsageAddress;
              });
          }
        }
      } else {
        document.querySelector("#donateModalOpenButton").disabled = true;
        document.querySelector("#donateModalOpenButton").textContent =
          "마감되었어요";
        document.querySelector("#donateModalOpenButton").style =
          "background: #e0e0e0; color: white;";
      }
    }

    donateModalOpenButton.addEventListener("click", function () {
      modal.style.display = "flex";
      modal.style.animation = "fadeIn 0.2s";
      donateAmountInput.value = "";
    });

    // Function to close modal
    function closeModal() {
      modal.style.animation = "fadeOut 0.2s";
    }

    modal.addEventListener("animationend", (event) => {
      if (event.animationName === "fadeOut") {
        modal.style.display = "none";
      }
    });

    closeButton.addEventListener("click", closeModal);

    donateButton.addEventListener("click", async function () {
      try {
        animation.startTask();

        if (!donateAmountInput.value || donateAmountInput.value <= 0) {
          alert("후원 금액이 올바르지 않습니다.");
          return;
        }
        const signer = provider.getSigner(); // 서명자 가져오기
        const signedContract = contract.connect(signer); // 서명자로 계약 연결

        const donateAmountGwei = donateAmountInput.value; // Input 값 가져오기
        // Gwei를 Ether로 변환
        const donateAmountEther = ethers.utils.formatUnits(
          donateAmountGwei,
          "gwei"
        );

        // false: 모금함 생성자가 아님.
        // true: 모금함 생성자임.
        // 후원하려는 계정에 연결된 지갑 중, 생성자의 지갑이 있다면 true를 전달
        const tx = await signedContract.donate(false, {
          value: ethers.utils.parseEther(donateAmountEther), // 기부 금액 (Ether)
          gasLimit: 300000,
        });

        await tx.wait();
        animation.endTask();
        alert("Donation successful!");
        location.reload(true);
      } catch (error) {
        console.error("Donation failed:", error);

        // 상세한 오류 메시지를 위해 추가
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
          alert(`Donation failed: ${error.message}`);
        }
      }
    });

    animation.endTask();
  } catch (error) {
    console.error("Error fetching contract details:", error);
    document.getElementById("fundraiserDetails").innerHTML =
      "<p>Error fetching fundraiser details.</p>";
    animation.endTask(); // 에러 발생 시에도 로딩 종료
  }
}

// 메인 실행
(async function () {
  if (contractAddress) {
    const { provider, signer, connectedAddress } = await initializeProvider();
    await fetchAndDisplayFundraiserDetails(
      provider,
      signer,
      connectedAddress,
      contractAddress,
      fundraiserFactoryAddress
    );
  } else {
    document.getElementById("fundraiserDetails").innerHTML =
      "<p>No contract address provided.</p>";
  }
})();
