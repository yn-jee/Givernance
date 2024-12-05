import { LoadingAnimation } from "./LoadingAnimation.js";
import { ethers } from "https://unpkg.com/ethers@5.7.2/dist/ethers.esm.min.js";
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

const JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIwNWM1ZmU2ZC02NTVlLTQ0MTMtYmZhZC04ZWIyMWI4ZjQ3ZjMiLCJlbWFpbCI6Im5heWoxMjIxQG5hdmVyLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiIxODU4NmM5NjRiNGEwYmU2MDAyMyIsInNjb3BlZEtleVNlY3JldCI6IjAyNTVhNDRkZGE5MTdkNTdjNTM5MWJjZGM3YWMxZGFlODJiNTA2YzZkN2FhN2JiYzQzN2I0OGQ4NjEwNjBlMTMiLCJleHAiOjE3NjAxMDA4NDJ9.njkh67Ym_8UHOApRvNVEH_FH96DsaJlxlDkkdfLJZvM";

function getCurrentDateTime() {
  const now = new Date();

  // 현재 시간을 `datetime-local` 포맷으로 변환 (ISO 포맷에서 분까지만 사용)
  const dateTimeLocal = now.toISOString().slice(0, 16);

  return dateTimeLocal;
}

// async function loadEthers() {
//   return new Promise((resolve, reject) => {
//     const script = document.createElement("script");
//     script.src =
//       "https://cdnjs.cloudflare.com/ajax/libs/ethers/6.7.0/ethers.min.js";
//     script.onload = () => resolve();
//     script.onerror = () => reject(new Error("Failed to load Ethers.js"));
//     document.head.appendChild(script);
//   });
// }

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
  .querySelector(".fundraiserImage")
  .addEventListener("change", getImageFiles);

document.addEventListener("DOMContentLoaded", async function () {
  const animation = new LoadingAnimation("../images/loadingAnimation.json");
  await animation.loadAnimation();

  try {
    animation.startTask(); // 로딩 시작
    // await loadEthers();
    await window.ethereum.request({ method: "eth_requestAccounts" });
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    console.log("Provider and signer initialized.");

    console.log(fundraiserFactoryAddress);

    const fundraiserFactory = new ethers.Contract(
      fundraiserFactoryAddress,
      fundraiserFactoryABI,
      signer
    );
    console.log("Contract initialized.");

    setupRadioButtons();

    // FundraiserCreated 이벤트 리스너
    fundraiserFactory.on("FundraiserCreated", (fundraiserAddress) => {
      console.log(`New Fundraiser Created at: ${fundraiserAddress}`);
      alert(`New Fundraiser Created at: ${fundraiserAddress}`);
    });

    document
      .getElementById("registerFundraiser")
      .addEventListener("click", async function () {
        animation.startTask(); // 로딩 시작
        const name = document.getElementById("fundraiserName").value;
        const targetAmountInput = document.getElementById(
          "fundraiserTargetAmount"
        ).value;
        let targetAmount; // 변수를 블록 밖으로 이동

        if (targetAmountInput) {
          targetAmount = ethers.utils.parseUnits(targetAmountInput, "gwei");
          console.log("Target Amount (wei):", targetAmount.toString());
        }
        const finishTimeElement = document.getElementById(
          "fundraiserFinishTime"
        );
        finishTimeElement.min = getCurrentDateTime();
        const finishTimeInput = finishTimeElement.value;

        const finishTimeUnix = Math.floor(
          new Date(finishTimeInput).getTime() / 1000
        );
        console.log("Finish Time (Unix):", finishTimeUnix);

        const description = document.getElementById(
          "fundraiserDescription"
        ).value;
        if (description.length <= 1000) {
          // 글자 수 검사 통과
        } else {
          alert("글자 수가 1000자를 초과할 수 없습니다.");
          return;
        }

        // const fileInput = document.querySelector(".fundraiserImage");
        // const formData = new FormData();
        // const textBlob = new Blob([description], { type: "text/plain" });
        // console.log(textBlob);
        // formData.append("file", textBlob, "fundraiserDescription.txt");
        // console.log(formData);

        // [...fileInput.files].forEach((file) => {
        //   formData.append("file", file);
        // });

        // const fundraiserType = document.querySelector(
        //   'input[name="fundraiserType"]:checked'
        // ).value;

        // let items = [];

        // if (fundraiserType === "commodity") {
        //   document
        //     .querySelectorAll(".commodityTypeItemContainerTable tr")
        //     .forEach((row) => {
        //       if (row.rowIndex !== 0) {
        //         // 첫 번째 행은 제외 (헤더)
        //         const itemName = row.cells[1].innerText;
        //         const quantity = parseInt(row.cells[2].innerText);
        //         const unitPrice = parseInt(
        //           row.cells[3].innerText.replace(" gwei", "")
        //         );
        //         const totalPrice = parseInt(
        //           row.cells[4].innerText.replace(" gwei", "")
        //         );
        //         const currency = "gwei"; // currency 필드 추가

        //         // JSON 형식에 필드 이름 포함
        //         items.push({
        //           itemName: itemName,
        //           quantity: quantity,
        //           unitPrice: unitPrice,
        //           totalPrice: totalPrice,
        //           currency: currency,
        //         });
        //       }
        //     });
        // }

        // const itemsJsonString = JSON.stringify(items, null, 2); // 들여쓰기 적용
        // console.log("Items: ", itemsJsonString);

        // const itemsJsonBlob = new Blob([itemsJsonString], {
        //   type: "application/json",
        // });
        // formData.append("file", itemsJsonBlob, "items.json");

        // // formData 확인
        // for (let pair of formData.entries()) {
        //   console.log(pair[0] + ": " + pair[1]);
        // }

        let files = [];

        if (description.length > 0) {
          const fileDescription = new File([description], "description.txt", {
            type: "text/plain",
          });
          files.push(fileDescription);
        }

        const fileInput = document.querySelector(".fundraiserImage");

        // 파일 입력에 이미지가 없는 경우 기본 이미지를 추가
        if (fileInput.files.length === 0) {
          // 기본 이미지 경로에서 Blob 가져오기
          const response = await fetch("../images/donationBox.png");
          const blob = await response.blob();

          // Blob을 사용하여 File 객체 생성
          const defaultImageFile = new File([blob], "donationBox.png", {
            type: blob.type,
          });

          // files 배열에 기본 이미지 추가
          files.push(defaultImageFile);
        } else {
          [...fileInput.files].forEach((file) => {
            files.push(file);
          });
        }

        // [...fileInput.files].forEach((file) => {
        //   files.push(file);
        // });

        const fundraiserType = document.querySelector(
          'input[name="fundraiserType"]:checked'
        ).value;

        let items = [];

        if (fundraiserType === "commodity") {
          document
            .querySelectorAll(".commodityTypeItemContainerTable tr")
            .forEach((row) => {
              if (row.rowIndex !== 0) {
                // 첫 번째 행은 제외 (헤더)
                const itemName = row.cells[1].innerText;
                const quantity = parseInt(row.cells[2].innerText);
                const unitPrice = parseInt(
                  row.cells[3].innerText.replace(" gwei", "")
                );
                const totalPrice = parseInt(
                  row.cells[4].innerText.replace(" gwei", "")
                );
                const currency = "gwei"; // currency 필드 추가

                // JSON 형식에 필드 이름 포함
                items.push({
                  itemName: itemName,
                  quantity: quantity,
                  unitPrice: unitPrice,
                  totalPrice: totalPrice,
                  currency: currency,
                });
              }
            });

          const itemsJsonString = JSON.stringify(items, null, 2); // 들여쓰기 적용
          console.log("Items: ", itemsJsonString);

          const fileItems = new File([itemsJsonString], "items.json", {
            type: "application/json",
          });
          files.push(fileItems);

          console.log(files);
        }

        // const formData = new FormData();
        // files.forEach((file) => {
        //   formData.append("file", file);
        // });

        if (!name || !targetAmount || !finishTimeUnix || !description) {
          alert(
            "모금함 이름, 목표 금액, 종료 시점, 상세 설명이 모두 입력되어야 합니다."
          );
          animation.endTask(); // 로딩 종료
          return;
        }
        if (targetAmountInput <= 0) {
          alert("목표 금액이 올바르지 않습니다.");
          animation.endTask(); // 로딩 종료
          return;
        }
        if (finishTimeInput < getCurrentDateTime()) {
          alert("종료 시점이 현재보다 이른 시점입니다.");
          animation.endTask(); // 로딩 종료
          return;
        }

        try {
          /*const transactionResponse = await fundraiserFactory.createFundraiser(
            name,
            targetAmount,
            finishTimeUnix,
            fundraiserType
          );

          const receipt = await transactionResponse.wait();
          const contractAddress = receipt.contractAddress;
          console.log("Fundraiser created:", transactionResponse);
          console.log("receipt:", receipt);
          console.log("contractAddress:", contractAddress);
          const createdFundraiserAddress =
            receipt.events[0].args.fundraiserAddress;
          console.log("Fundraiser Address:", createdFundraiserAddress);*/

          // const response = await fetch("/upload", {
          //   method: "POST",
          //   body: formData,
          // });

          // if (!response.ok) {
          //   throw new Error("파일 업로드에 실패했습니다.");
          // }

          // const IpfsHashes = [];
          // const IpfsIDs = [];

          // await Promise.all(
          //   files.map(async (file) => {
          //     try {
          //       const formData = new FormData();
          //       formData.append("file", file);

          //       const request = await fetch(
          //         "https://uploads.pinata.cloud/v3/files",
          //         {
          //           method: "POST",
          //           headers: {
          //             Authorization: `Bearer ${JWT}`,
          //           },
          //           body: formData,
          //         }
          //       );

          //       const response = await request.json();
          //       console.log("uploaded: ", response);
          //       console.log("data.cid:", response.data.cid);
          //       console.log("data.id:", response.data.id);
          //       IpfsHashes.push(response.data.cid);
          //       IpfsIDs.push(response.data.id);
          //     } catch (error) {
          //       console.log(error);
          //     }
          //   })
          // );
          // console.log(IpfsHashes);

          // result.forEach((data) => {
          //   if (data.IpfsHash) {
          //     console.log("Uploaded to IPFS:", data.IpfsHash);
          //     IpfsHashes.push(data.IpfsHash);
          //   } else {
          //     console.error("IPFS 해시가 없습니다:", data);
          //   }
          // });

          // if (IpfsHashes.length === 0) {
          //   throw new Error(
          //     "파일 업로드에 실패했습니다. IPFS 해시를 가져올 수 없습니다."
          //   );
          // }

          // interact w/ contract instance

          console.log(files);
          const IpfsHashes = [];

          try {
            const formData = new FormData();
            files.forEach((file) => {
              formData.append("file", file); // FormData에 파일 추가
            });

            const response = await fetch(
              "https://purple-careful-ladybug-259.mypinata.cloud/pinning/pinFileToIPFS",
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${PINATA_API_KEY}:${PINATA_SECRET_API_KEY}`, // Pinata API 인증
                },
                body: formData,
              }
            );

            if (!response.ok) {
              throw new Error(
                "Failed to upload to Pinata: " + response.statusText
              );
            }

            const result = await response.json(); // Pinata의 응답 처리
            if (Array.isArray(result)) {
              result.forEach((data) => {
                if (data.IpfsHash) {
                  IpfsHashes.push(data.IpfsHash);
                }
              });
            } else {
              console.error("Unexpected response format from Pinata:", result);
            }

            console.log(IpfsHashes);

            //             엔드포인트 쓰는 기존 코드
            // try {
            //   const formData = new FormData(); // FormData 객체 생성
            //   files.forEach((file) => {
            //     formData.append("file", file); // 각 파일을 FormData에 추가
            //   });

            //   const response = await fetch("/upload", {
            //     method: "POST",
            //     headers: {
            //       Authorization: `Bearer ${JWT}`, // JWT 토큰을 헤더에 포함
            //     },
            //     body: formData, // FormData를 서버로 전송
            //   });

            //   const result = await response.json(); // 서버에서 JSON 형식으로 응답을 받음
            //   result.forEach((data) => {
            //     IpfsHashes.push(data);
            //   });
            //   console.log(IpfsHashes);

            // if (Array.isArray(result)) {
            //   result.forEach((data) => {
            //     if (data.IpfsHash) {
            //       IpfsHashes.push(data.IpfsHash);
            //     }
            //   });
            // } else {
            //   console.error("Expected array but got:", result);
            // }

            // fundraiserInfoContract를 통한 데이터 저장 작업
            /*const contract = new ethers.Contract(
              fundraiserInfoContract,
              IpfsContractABI,
              signer
            );
            console.log(await storeData(contract, contractAddress, IpfsHashes));*/

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

          // const IpfsContract = new ethers.Contract(
          //   fundraiserInfoContract,
          //   IpfsContractABI,
          //   signer
          // );

          // const storeResponse = await storeData(
          //   IpfsContract,
          //   createdFundraiserAddress,
          //   IpfsHashes
          // );

          // console.log("Data stored in IPFS contract:", storeResponse);

          // alert("Fundraiser has been registered successfully!");

          // window.location.href =
          //   window.location.protocol +
          //   "//" +
          //   window.location.host +
          //   "/post.html?contractAddress=" +
          //   createdFundraiserAddress;
        } catch (error) {
          console.error("Failed to register fundraiser:", error);
          alert("모금함이 생성되지 않았습니다.", error);
        } finally {
          animation.endTask(); // 로딩 종료
        }
      });

    var fundraiserTargetAmount = document.getElementById(
      "fundraiserTargetAmount"
    );
    fundraiserTargetAmount.classList.add(
      "fundraiserTargetAmountPlaceholderPink"
    );

    let sum = 0;

    var modal = document.getElementsByClassName("addItemModal")[0];
    var targetAmount = document.getElementById("fundraiserTargetAmount");
    var addItemButton = document.getElementById("addItemButton");
    var closeButton = document.querySelector(
      ".addItemModal .addItemModalClose"
    );
    var addItemDone = document.querySelector(".addItemDone");
    var addItemModalHeader = document.getElementById("addItemModalHeader");
    var itemNameInput = document.getElementById("addItemName");
    var itemQuantityInput = document.getElementById("addItemContity");
    var itemPriceInput = document.getElementById("addItemPrice");
    var itemsContainer = document.querySelector(
      ".commodityTypeItemContainerTable"
    );
    var editingRow = null; // This will hold the reference to the row being edited

    // Function to open modal for new item
    addItemButton.addEventListener("click", function () {
      addItemModalHeader.innerText = "Add New Item";
      modal.style.display = "flex";
      modal.style.animation = "fadeIn 0.2s";
      editingRow = null; // Ensure we're in 'add new' mode
      itemNameInput.value = "";
      itemQuantityInput.value = "";
      itemPriceInput.value = "";
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

    // Event listener for adding/updating an item
    addItemDone.addEventListener("click", function () {
      const name = itemNameInput.value;
      const quantity = itemQuantityInput.value;
      const price = itemPriceInput.value;
      const totalPrice = parseInt(quantity) * parseInt(price);

      if (editingRow) {
        // Update existing row
        editingRow.cells[1].innerText = name;
        editingRow.cells[2].innerText = quantity;
        editingRow.cells[3].innerText = `${price} gwei`;
        editingRow.cells[4].innerText = `${totalPrice} gwei`;
      } else {
        // Create new item and append it to the table
        const row = itemsContainer.insertRow();

        row.insertCell(0).innerText = itemsContainer.rows.length - 1; // Simple row count
        row.insertCell(1).innerText = name;
        row.insertCell(2).innerText = quantity;
        row.insertCell(3).innerText = `${price} gwei`;
        row.insertCell(4).innerText = `${totalPrice} gwei`;
        row.insertCell(
          5
        ).innerHTML = `<span class="deleteItem" onclick="deleteRow(this)">&times;</span>`;
      }

      const rows = itemsContainer.getElementsByTagName("tr");
      sum = 0;
      for (let i = 1; i < rows.length; i++) {
        let totalPriceValue = rows[i].cells[4]
          ? parseInt(rows[i].cells[4].innerText.replace(" gwei", ""))
          : 0;
        sum += Number(totalPriceValue);
      }

      // 합계를 targetAmount에 업데이트
      if (rows.length > 1) {
        // 첫 번째 행은 헤더
        targetAmount.value = sum;
      }

      closeModal();
    });

    document
      .querySelector(".commodityTypeItemContainerTable")
      .addEventListener("click", function (event) {
        // 클릭된 요소가 'deleteItem' 클래스를 가지고 있는지 확인
        if (event.target.classList.contains("deleteItem")) {
          deleteRow(event.target);
        }
      });

    // 삭제 아이콘을 클릭한 요소를 받아 그 요소의 부모 행을 찾아서 삭제
    function deleteRow(element) {
      var row = element.closest("tr"); // 클릭한 요소에서 가장 가까운 'tr' 요소를 찾아서
      var name = row.cells[1].innerText;
      if (confirm(name + " 항목을 삭제하시겠습니까?")) {
        // 사용자에게 삭제 확인을 요청
        var targetAmountInput = document.getElementById(
          "fundraiserTargetAmount"
        ).value;
        targetAmountInput -= row.totalPrice;
        row.parentNode.removeChild(row); // 그 행을 삭제

        // 인덱스 값 수정하기, 총 목표 금액 수정하기
        const rows = itemsContainer.getElementsByTagName("tr");
        sum = 0;
        for (let i = 1; i < rows.length; i++) {
          let totalPriceValue = rows[i].cells[4]
            ? parseInt(rows[i].cells[4].innerText.replace(" gwei", ""))
            : 0;
          sum += Number(totalPriceValue);

          rows[i].cells[0].innerText = i;
        }

        // 합계를 targetAmount에 업데이트
        if (rows.length > 1) {
          // 첫 번째 행은 헤더
          targetAmount.value = sum;
        } else {
          fundraiserTargetAmount.value = "";
        }
      }
    }

    // Adding click listeners to all existing and future rows
    itemsContainer.addEventListener("click", function (e) {
      if (e.target.parentNode.tagName === "TR") {
        addItemModalHeader.innerText = "Edit Item";
        editingRow = e.target.parentNode;
        itemNameInput.value = editingRow.cells[1].innerText;
        itemQuantityInput.value = editingRow.cells[2].innerText;
        itemPriceInput.value = editingRow.cells[3].innerText.replace(
          " gwei",
          ""
        );
        modal.style.display = "flex";
        modal.style.animation = "fadeIn 0.2s";
      }
    });
  } catch (error) {
    console.error("Error initializing application:", error);
  } finally {
    animation.endTask(); // 로딩 종료
  }
});

function setupRadioButtons() {
  const radioButtons = document.querySelectorAll(
    'input[name="fundraiserType"]'
  );
  const descriptionText = document.getElementById("fundraiserDescriptionText");
  const commodityContainer = document.querySelector(
    ".commodityTypeItemContainer"
  );
  const commodityContainerTitle = document.querySelector(
    ".commodityTypeItemContainerTitle"
  );
  const fundraiserTargetAmount = document.getElementById(
    "fundraiserTargetAmount"
  );
  const itemsContainer = document.querySelector(
    ".commodityTypeItemContainerTable"
  );

  // 공통 스타일 변경 함수
  function setTargetAmountStyles(disabled, placeholder, removeClass, addClass) {
    fundraiserTargetAmount.disabled = disabled;
    fundraiserTargetAmount.placeholder = placeholder;
    fundraiserTargetAmount.classList.remove(removeClass);
    fundraiserTargetAmount.classList.add(addClass);
  }

  // 아이템 합계를 계산하는 함수
  function calculateSum() {
    let sum = 0;
    const rows = itemsContainer.getElementsByTagName("tr");
    for (let i = 1; i < rows.length; i++) {
      const totalPriceValue = rows[i].cells[4]
        ? parseInt(rows[i].cells[4].innerText.replace(" gwei", ""))
        : 0;
      sum += totalPriceValue;
    }
    return sum;
  }

  // 라디오 버튼 변경 이벤트 핸들러
  function handleRadioButtonChange(event) {
    const selectedValue = event.target.value;
    console.log("Selected value:", selectedValue);

    switch (selectedValue) {
      case "commodity":
        descriptionText.innerHTML =
          "후원금으로 구매할 물품의 목록을 등록할 수 있는 일회성 모금함입니다.";
        commodityContainer.style.display = "flex";
        commodityContainerTitle.style.display = "flex";
        const newSum = calculateSum(); // 물품형으로 전환 시 아이템 합계를 다시 계산
        fundraiserTargetAmount.value = newSum || "";
        setTargetAmountStyles(
          true,
          "물품형 후원은 총 목표 금액을 설정할 수 없습니다.",
          "fundraiserTargetAmountPlaceholderGrey",
          "fundraiserTargetAmountPlaceholderPink"
        );
        break;
      case "monetary":
        descriptionText.innerHTML =
          "큰 규모의 모금에 적합한 일회성 모금함입니다.";
        commodityContainer.style.display = "none";
        commodityContainerTitle.style.display = "none";
        fundraiserTargetAmount.value = "";
        setTargetAmountStyles(
          false,
          "목표 금액을 입력하세요.",
          "fundraiserTargetAmountPlaceholderPink",
          "fundraiserTargetAmountPlaceholderGrey"
        );
        break;
      case "regular":
        descriptionText.innerHTML =
          "정기적으로 후원을 받을 수 있는 상시 모금함입니다.";
        commodityContainer.style.display = "none";
        commodityContainerTitle.style.display = "none";
        fundraiserTargetAmount.value = "";
        setTargetAmountStyles(
          false,
          "목표 금액을 입력하세요.",
          "fundraiserTargetAmountPlaceholderPink",
          "fundraiserTargetAmountPlaceholderGrey"
        );
        break;
      default:
        console.log("알 수 없는 후원 유형");
    }
  }

  // 라디오 버튼의 변경 이벤트 리스너 등록
  radioButtons.forEach((radio) => {
    radio.addEventListener("change", handleRadioButtonChange);
  });

  // 페이지가 로드될 때 기본 설정을 적용
  const checkedRadio = document.querySelector(
    'input[name="fundraiserType"]:checked'
  );
  if (checkedRadio) {
    handleRadioButtonChange({ target: checkedRadio });
  }
}
