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
const IpfsGateway = "https://purple-careful-ladybug-259.mypinata.cloud/ipfs/";

const animation = new LoadingAnimation("../images/loadingAnimation.json");
await animation.loadAnimation();

const urlParams = new URLSearchParams(window.location.search);
const contractAddress = urlParams.get("contractAddress"); // 'contractAddress' 파라미터의 값 가져오기
const JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIwNWM1ZmU2ZC02NTVlLTQ0MTMtYmZhZC04ZWIyMWI4ZjQ3ZjMiLCJlbWFpbCI6Im5heWoxMjIxQG5hdmVyLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiIxODU4NmM5NjRiNGEwYmU2MDAyMyIsInNjb3BlZEtleVNlY3JldCI6IjAyNTVhNDRkZGE5MTdkNTdjNTM5MWJjZGM3YWMxZGFlODJiNTA2YzZkN2FhN2JiYzQzN2I0OGQ4NjEwNjBlMTMiLCJleHAiOjE3NjAxMDA4NDJ9.njkh67Ym_8UHOApRvNVEH_FH96DsaJlxlDkkdfLJZvM";

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

    animation.endTask();
  } catch (error) {
    console.error("Error fetching contract details:", error);
    document.getElementById("fundraiserDetails").innerHTML =
      "<p>Error fetching fundraiser details.</p>";
    animation.endTask(); // 에러 발생 시에도 로딩 종료
  }

  let existingImages = []; // 기존에 업로드된 이미지를 저장하는 배열

  function getImageFiles(e) {
    const files = e.currentTarget.files;
    const imagePreview = document.querySelector(".imagePreview");

    // 새로 추가하려는 이미지의 개수가 기존 이미지와 합쳐서 5개를 넘는지 확인
    if (existingImages.length + [...files].length > 5) {
      alert("이미지는 최대 5개 까지 업로드가 가능합니다.");
      return;
    }

    // 파일 타입 검사 및 업로드
    [...files].forEach((file) => {
      if (!file.type.match("image/.*")) {
        alert("이미지 파일만 업로드가 가능합니다.");
        return;
      }

      if (existingImages.length < 5) {
        existingImages.push(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          const preview = createElement(e, file);
          imagePreview.appendChild(preview);
        };
        reader.readAsDataURL(file);
      }
    });

    // 등록된 이미지 개수 표시
    const imageCount = document.querySelector(".imageCount");
    imageCount.textContent = `${existingImages.length}/5`;
  }

  function createElement(e, file) {
    const li = document.createElement("li");
    li.classList.add("imagePreviewItem");

    const img = document.createElement("img");
    img.setAttribute("src", e.target.result);
    img.setAttribute("data-file", file.name);

    const closeButton = document.createElement("button");
    closeButton.classList.add("closeButton");
    closeButton.addEventListener("click", () => {
      li.remove();
      existingImages = existingImages.filter((f) => f.name !== file.name);
      const imageCount = document.querySelector(".imageCount");
      imageCount.textContent = `${existingImages.length}/5`;
    });

    li.appendChild(img);
    li.appendChild(closeButton);

    return li;
  }

  // 파일 선택 시 이미지 미리보기 생성
  document
    .querySelector(".usageImage")
    .addEventListener("change", getImageFiles);

  document
    .getElementById("registerUsage")
    .addEventListener("click", async function (event) {
      animation.startTask();
      event.preventDefault();

      const textarea = document.getElementById("usageDescription");
      const text = textarea.value;

      if (text.length <= 1000) {
        // 글자 수 검사 통과
      } else {
        alert("글자 수가 1000자를 초과할 수 없습니다.");
        return;
      }

      let files = [];
      const fileDescription = new File([text], "description.txt", {
        type: "text/plain",
      });
      files.push(fileDescription);

      const fileInput = document.querySelector(".usageImage");
      [...fileInput.files].forEach((file) => {
        files.push(file);
      });

      const fileRaisedAmount = new File([raisedAmount], "raisedAmount.txt", {
        type: "text/plain",
      });
      files.push(fileRaisedAmount);

      console.log(files);
      const IpfsHashes = [];

      try {
        const formData = new FormData();
        files.forEach((file) => {
          formData.append("file", file); // 각 파일을 FormData에 추가
        });

        const response = await fetch("/upload", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${JWT}`, // JWT 토큰을 헤더에 포함
          },
          body: formData, // FormData를 서버로 전송
        });

        const result = await response.json();
        result.forEach((data) => {
          IpfsHashes.push(data);
        });
        console.log(IpfsHashes);

        // interact w/ contract instance
        const IpfsContract = new ethers.Contract(
          usageRecordContract,
          IpfsContractABI,
          signer
        );
        const storeResponse = await storeData(
          IpfsContract,
          contractAddress,
          IpfsHashes
        );
        console.log("Data stored in IPFS contract:", storeResponse);

        // Deploy GiversToken
        // 토큰을 생성할 모금함 주소, 투표 기간(분)
        createGovernanceToken(contractAddress, 5);

        // const initialOwner = await signer.getAddress();
        // const giversTokenAddress = await deployGiversToken();
        // console.log("GiversToken deployed:", giversTokenAddress);

        // const governanceAddress = await deployGovernance(giversTokenAddress);
        // console.log("Governance deployed:", governanceAddress);

        // window.location.href =
        //   window.location.protocol +
        //   "//" +
        //   window.location.host +
        //   "/usageUploadedPost.html?contractAddress=" +
        //   contractAddress;
      } catch (error) {
        console.error("Error uploading file:", error);
        alert("Error uploading file");
      }

      animation.endTask();
    });
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
      fundraiserFactoryAddress
    );

    // 이미 사용 내역이 등록된 경우 등록 불가
    if (data.hashes.length > 1) {
      const registerUsageButton = document.getElementById("registerUsage");
      registerUsageButton.setAttribute("disabled", true);
      registerUsageButton.innerText = "이미 사용 내역이 등록된 모금함입니다.";
      registerUsageButton.style =
        "background: #e0e0e0; color: white; width: auto; padding: 0px 15px; text-align: center;";
    }
  } else {
    document.getElementById("fundraiserDetails").innerHTML =
      "<p>No contract address provided.</p>";
  }
})();
