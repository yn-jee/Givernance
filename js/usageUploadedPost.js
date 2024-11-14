import { LoadingAnimation } from "./LoadingAnimation.js";
import { ethers } from "https://unpkg.com/ethers@5.7.2/dist/ethers.esm.min.js";
import { minidenticonSvg } from "https://cdn.jsdelivr.net/npm/minidenticons@4.2.1/minidenticons.min.js";
import {
  fundraiserFactoryAddress,
  fundraiserFactoryABI,
  fundraiserABI,
} from "./contractConfig.js";
import {
  createGovernanceToken,
  castVote,
  getVotingResults,
} from "./governanceFunctions.js";
import {
  fundraiserInfoContract,
  usageRecordContract,
  IpfsContractABI,
  storeData,
  getData,
} from "./IPFSContractConfig.js";
import { initializeProvider } from "./initializeProvider.js";

const animation = new LoadingAnimation("../images/loadingAnimation.json");
await animation.loadAnimation();

const urlParams = new URLSearchParams(window.location.search);
const contractAddress = urlParams.get("contractAddress"); // 'contractAddress' 파라미터의 값 가져오기

const ipfsBaseUrl = "https://gateway.pinata.cloud/ipfs/";
const IpfsGateway = "https://purple-careful-ladybug-259.mypinata.cloud/ipfs/";

var textData;
const imageData = [];

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

async function getFundraiserCreatorAddresses(
  provider,
  events,
  _fundraiserAddress
) {
  for (let event of events) {
    const txHash = event.transactionHash;
    const tx = await provider.getTransaction(txHash);
    const creatorAddress = tx.from;
    if (_fundraiserAddress == event.args.fundraiserAddress) {
      return creatorAddress;
    }
  }
}

// 트랜잭션 해시를 이용하여 생성된 블록 번호를 가져오는 함수
async function getContractCreationBlock(provider, events, _fundraiserAddress) {
  for (let event of events) {
    const txHash = event.transactionHash;
    const tx = await provider.getTransaction(txHash);
    if (_fundraiserAddress === event.args.fundraiserAddress) {
      return tx.blockNumber;
    }
  }
  throw new Error("Fundraiser address not found in events");
}

// 타임스탬프 가져오기
async function getBlockTimestamp(provider, blockNumber) {
  const block = await provider.getBlock(blockNumber);
  return block.timestamp;
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

async function fetchIpfsData(ipfsHash, isText) {
  const response = await fetch(`${ipfsBaseUrl}${ipfsHash}`);
  const contentType = response.headers.get("content-type");

  if (isText) {
    if (contentType && contentType.includes("application/json")) {
      textData = await response.json();
    } else {
      textData = await response.text();
    }
  } else {
    const blob = await response.blob();
    const imageUrl = URL.createObjectURL(blob);
    imageData.push(imageUrl);
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

function displayTextData() {
  const usageTextContainer = document.querySelector(".usageDescription");
  if (usageTextContainer) {
    usageTextContainer.textContent = textData;
  } else {
    console.error("Error: .usageDescription element not found");
  }
}

// 모금함 이미지 데이터 표시하기
async function displayFundraiserImageData(images) {
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

function displayImageData() {
  const usageImagesContainer = document.querySelector(".usageImages");
  if (usageImagesContainer) {
    imageData.forEach((image) => {
      const img = document.createElement("img");
      img.src = image;
      img.alt = "IPFS image";
      img.classList.add("usageImage"); // 스타일링을 위해 클래스 추가
      usageImagesContainer.appendChild(img);
    });
  } else {
    console.error("Error: .usageImages element not found");
  }
}

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

    // 컨트랙트 데이터 가져오기
    const name = await contract.name();
    const type = await contract.fundraiserType();
    console.log(type);
    const contractOwner = await getFundraiserCreatorAddresses(
      provider,
      events,
      address
    );

    // 생성된 시간 가져오기
    const blockNumber = await getContractCreationBlock(
      provider,
      events,
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
    // const raisedAmount = ethers.utils.formatUnits(
    //   await contract.raisedAmount(),
    //   "gwei"
    // );

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
      const response = await fetch(`/fetch/${infoData.hashes[0]}`, {
        method: "GET", // GET 요청 사용
      });

      if (!response.ok) {
        throw new Error("파일을 불러오는 데 실패했습니다.");
      }

      const fundraiserTextData = await response.json();
      description = fundraiserTextData.data;
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

    displayFundraiserImageData(image);
    document.querySelector(".contractOwner").addEventListener("click", () => {
      copyToClipboard(contractOwner);
    });

    animation.endTask();
  } catch (error) {
    console.error("Error fetching contract details:", error);
    document.getElementById("fundraiserDetails").innerHTML =
      "<p>Error fetching fundraiser details.</p>";
    animation.endTask(); // 에러 발생 시에도 로딩 종료
  }
}

async function fetchAndDisplayUsageDetails(
  provider,
  signer,
  connectedAddress,
  address,
  factoryAddress,
  data
) {
  try {
    animation.startTask();

    // 컨트랙트 객체 생성
    const contract = new ethers.Contract(address, fundraiserABI, provider);
    // 모든 트랜잭션 가져오기
    const events = await getEvents(provider, factoryAddress);

    // 컨트랙트 데이터 가져오기
    const name = await contract.name();
    const contractOwner = await getFundraiserCreatorAddresses(
      provider,
      events,
      address
    );

    // 후원금 사용 내역이 게시된 시간 가져오기
    const timestamp = data.timestamp;

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
    // const raisedAmount = ethers.utils.formatUnits(
    //   await contract.raisedAmount(),
    //   "gwei"
    // );
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

    for (let i = 0; i < data.hashes.length - 1; i++) {
      await fetchIpfsData(data.hashes[i], i === 0);
    }

    const usageDetailsDiv = document.getElementById("usageDetails");
    usageDetailsDiv.innerHTML = `
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
            <div class="usageImages"></div>
            <p class="usageDescription"></p>
        `;

    // Once all data is fetched, display it
    displayTextData();
    displayImageData();

    document
      .getElementById("voteForButton")
      .addEventListener("click", async function () {
        // 투표하기
        // 찬성
        console.log(contractAddress);
        castVote(contractAddress, true);
      });
    document
      .getElementById("voteAgainstButton")
      .addEventListener("click", async function () {
        // 반대
        castVote(contractAddress, false);
      });
    document
      .getElementById("getVotingResultsButton")
      .addEventListener("click", async function () {
        getVotingResults(contractAddress);
      });
    // document // 여기서부터. 주소 기록이 받아와지는지 확인하기... 토큰컨트랙트 자체가
    //   .getElementById("getGovernanceAddressButton")
    //   .addEventListener("click", async function () {
    //     getVotingResults(contractAddress);
    //   });
    animation.endTask();
  } catch (error) {
    console.error("Error fetching contract details:", error);
    document.getElementById("usageDetails").innerHTML =
      "<p>Error fetching fundraiser details.</p>";
    animation.endTask(); // 에러 발생 시에도 로딩 종료
  }
}

// 메인 실행
(async function () {
  if (contractAddress) {
    const { provider, signer, connectedAddress } = await initializeProvider();
    const contract = new ethers.Contract(
      usageRecordContract,
      IpfsContractABI,
      signer
    );
    const data = await getData(contract, contractAddress);
    await fetchAndDisplayFundraiserDetails(
      provider,
      signer,
      connectedAddress,
      contractAddress,
      fundraiserFactoryAddress,
      data
    );
    await fetchAndDisplayUsageDetails(
      provider,
      signer,
      connectedAddress,
      contractAddress,
      fundraiserFactoryAddress,
      data
    );
    console.log(data);
    if (data.hashes.length == 0) {
      const usageDetailsDiv = document.getElementById("usageDetails");
      usageDetailsDiv.innerHTML = `
                <p class="itemName">Nothing </p>
            `;
    }
  } else {
    document.getElementById("fundraiserDetails").innerHTML =
      "<p>No contract address provided.</p>";
  }
})();
