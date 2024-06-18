import { LoadingAnimation } from './LoadingAnimation.js';
import { minidenticonSvg } from 'https://cdn.jsdelivr.net/npm/minidenticons@4.2.1/minidenticons.min.js';
import { fundraiserFactoryAddress, fundraiserFactoryABI, fundraiserABI } from './contractConfig.js';
import { deployGiversToken, deployGiver, GiversTokenABI, GiversTokenBytecode, GiverABI, GiverBytecode } from "./tokenDeploy.js";
import { IpfsContractAddress, IpfsContractABI, storeData, getData } from './IPFSContractConfig.js';
import { initializeProvider } from './initializeProvider.js';

const animation = new LoadingAnimation('../images/loadingAnimation.json');
await animation.loadAnimation();

const urlParams = new URLSearchParams(window.location.search);
const contractAddress = urlParams.get('contractAddress'); // 'contractAddress' 파라미터의 값 가져오기



async function getEvents(provider, fundraiserFactoryAddress) {
    const fundraiserFactory = new ethers.Contract(fundraiserFactoryAddress, fundraiserFactoryABI, provider);

    const fromBlock = 0;
    const toBlock = 'latest';
    const events = await fundraiserFactory.queryFilter(fundraiserFactory.filters.FundraiserCreated(), fromBlock, toBlock);
    return events;
}


async function getFundraiserCreatorAddresses(provider, events, _fundraiserAddress) {
    for (let event of events) {
        const txHash = event.transactionHash;
        const tx = await provider.getTransaction(txHash);
        const creatorAddress = tx.from;
        if (_fundraiserAddress == event.args.fundraiserAddress){
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
        navigator.clipboard.writeText(text).then(() => {
            alert('Address copied to clipboard!');
        }).catch(err => {
            console.error('Error copying text to clipboard: ', err);
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
            document.execCommand('copy');
            alert('Address copied to clipboard!');
        } catch (err) {
            console.error('Error copying text to clipboard: ', err);
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
    throw new Error('Fundraiser address not found in events');
}

// 타임스탬프 가져오기
async function getBlockTimestamp(provider, blockNumber) {
    const block = await provider.getBlock(blockNumber);
    return block.timestamp;
}

async function fetchAndDisplayFundraiserDetails(provider, signer, connectedAddress, address, factoryAddress) {
    try {
        animation.startTask();

        // 컨트랙트 객체 생성
        const contract = new ethers.Contract(address, fundraiserABI, provider);
        // 모든 트랜잭션 가져오기
        const events = await getEvents(provider, factoryAddress);

        // 컨트랙트 데이터 가져오기
        const name = await contract.name();
        const contractOwner = await getFundraiserCreatorAddresses(provider, events, address);
        
        // 생성된 시간 가져오기
        const blockNumber = await getContractCreationBlock(provider, events, address);
        const timestamp = await getBlockTimestamp(provider, blockNumber);
        const creationDate = new Date(timestamp * 1000).toLocaleString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        });

        const description = await contract.description();
        const targetAmount = ethers.utils.formatUnits(await contract.targetAmount(), 'gwei');
        const finishTime = new Date((await contract.finishTime()).toNumber() * 1000).toLocaleString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        });
        const raisedAmount = ethers.utils.formatUnits(await contract.raisedAmount(), 'gwei');
        const image = contract.image || "images/donationBox.png";

        // _items 데이터 가져오기
        let items = [];
        let index = 0;
        while (true) {
            try {
                const item = await contract.items(index);
                items.push(item);
                index++;
            } catch (error) {
                break; // 더 이상 항목이 없으면 루프 종료
            }
        }

        // 페이지에 표시할 내용 생성
        const detailsDiv = document.getElementById('fundraiserDetails');
        detailsDiv.innerHTML = `
            <h1 class="fundraiserTitle">${name}</h1>
            <div class="contractMetaData">
                <div class="profile">
                    <minidenticon-svg class="profileImage" username="${contractOwner}"></minidenticon-svg>
                    <p class="contractOwner" fullAddress="${contractOwner}">${trimAddress(contractOwner)}</p>
                </div>
                <p class="creationTime">${creationDate}</p>
            </div>
            <img class="fundraiserImage" src="${image}" title="fundraiserImage">
            <p class="fundraiserDescription">${description}</p>
            <p class="fundraiserFinishTime">${finishTime} 마감</p>

            <div class="fundraisingStatus">
            <div class="raisedAmount"><b>${parseInt(raisedAmount).toLocaleString()} GWEI</b> 후원되었어요</div>
            <div class="progressPercentage">${(raisedAmount / targetAmount * 100).toFixed(1)}%</div>
            </div>
            <div class="progressBarContainer">
                <div class="progressBar" style="width: ${(raisedAmount / targetAmount * 100)}%;"></div>
            </div>
            <div class="supporterInfo">
                <span class="targetAmount">${parseInt(targetAmount).toLocaleString()} GWEI 목표</span>
            </div>

            <div class="items">
                <h3 style="text-align: left;">Items</h3>
                <ul>
                    ${items.map(item => `
                        <div class="itemInfo">
                            <div class="itemNamePrice">
                                <p class="itemName">${item.name}</p>
                                <p class="itemPrice">개당 ${parseInt(ethers.utils.formatUnits(item.price.mul(ethers.BigNumber.from('1000000000')), 'gwei')).toLocaleString()} GWEI</p>
                            </div>
                            <div class="itemDetails">
                                <p class="itemQuantity">${item.quantity}개</p>
                                <p class="totalPrice">총 ${parseInt(ethers.utils.formatUnits(item.price.mul(item.quantity).mul(ethers.BigNumber.from('1000000000')), 'gwei')).toLocaleString()} GWEI</p>
                            </div>
                        </div>
                    `).join('')}
                </ul>
            </div>
        `;

        animation.endTask();
    } catch (error) {
        console.error('Error fetching contract details:', error);
        document.getElementById('fundraiserDetails').innerHTML = '<p>Error fetching fundraiser details.</p>';
        animation.endTask(); // 에러 발생 시에도 로딩 종료
    }
    
    let existingImages = []; // 기존에 업로드된 이미지를 저장하는 배열

    function getImageFiles(e) {
        const files = e.currentTarget.files;
        const imagePreview = document.querySelector('.imagePreview');
        
        // 새로 추가하려는 이미지의 개수가 기존 이미지와 합쳐서 5개를 넘는지 확인
        if (existingImages.length + [...files].length > 5) {
            alert('이미지는 최대 5개 까지 업로드가 가능합니다.');
            return;
        }

        // 파일 타입 검사 및 업로드
        [...files].forEach(file => {
            if (!file.type.match("image/.*")) {
                alert('이미지 파일만 업로드가 가능합니다.');
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
        const imageCount = document.querySelector('.imageCount');
        imageCount.textContent = `${existingImages.length}/5`;
    }

    function createElement(e, file) {
        const li = document.createElement('li');
        li.classList.add('imagePreviewItem');

        const img = document.createElement('img');
        img.setAttribute('src', e.target.result);
        img.setAttribute('data-file', file.name);

        const closeButton = document.createElement('button');
        closeButton.classList.add('closeButton');
        closeButton.addEventListener('click', () => {
            li.remove();
            existingImages = existingImages.filter(f => f.name !== file.name);
            const imageCount = document.querySelector('.imageCount');
            imageCount.textContent = `${existingImages.length}/5`;
        });

        li.appendChild(img);
        li.appendChild(closeButton);

        return li;
    }

    // 파일 선택 시 이미지 미리보기 생성
    document.querySelector('.usageImage').addEventListener('change', getImageFiles);

    document.getElementById('registerUsage').addEventListener('click', async function(event) {
        animation.startTask();
        event.preventDefault();

        const textarea = document.getElementById('usageDescription');
        const text = textarea.value;

        if (text.length <= 1000) {
            // 글자 수 검사 통과
        } else {
            alert('글자 수가 1000자를 초과할 수 없습니다.');
            return;
        }

        const fileInput = document.querySelector('.usageImage');

        const formData = new FormData();
        const textBlob = new Blob([text], { type: 'text/plain' });
        formData.append('file', textBlob, 'usageDescription.txt');

        [...fileInput.files].forEach(file => {
            formData.append(`file`, file);
        });

        // FormData의 모든 항목을 출력하여 확인
        console.log(formData);

        try {
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });

            const IpfsHashes = [];
            const result = await response.json();
            result.forEach(data => {
                console.log(data.IpfsHash);
                IpfsHashes.push(data.IpfsHash);
            });

            // interact w/ contract instance
            const contract = new ethers.Contract(IpfsContractAddress, IpfsContractABI, signer);

            console.log(await storeData(contract, contractAddress, IpfsHashes));
        } catch (error) {
            console.error('Error uploading file:', error);
            alert("Error uploading file");
        }

        animation.endTask();
    });
}


// 메인 실행
(async function() {
    if (contractAddress) {
        const { provider, signer, connectedAddress } = await initializeProvider();
        const contract = new ethers.Contract(IpfsContractAddress, IpfsContractABI, signer);
        const data = await getData(contract, contractAddress);
        await fetchAndDisplayFundraiserDetails(provider, signer, connectedAddress, contractAddress, fundraiserFactoryAddress);

        // 이미 사용 내역이 등록된 경우 등록 불가
        if (data.hashes.length > 0) {
            const registerUsageButton = document.getElementById('registerUsage');
            registerUsageButton.setAttribute('disabled',true);
            registerUsageButton.innerText = "이미 사용 내역이 등록된 모금함입니다.";
            registerUsageButton.style = 'background: #e0e0e0; color: white; width: auto; padding: 0px 15px; text-align: center;';
        }
    } else {
        document.getElementById('fundraiserDetails').innerHTML = '<p>No contract address provided.</p>';
    }
})();