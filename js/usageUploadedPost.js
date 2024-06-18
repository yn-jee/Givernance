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

const ipfsBaseUrl = "https://ipfs.io/ipfs/";

var textData;
const imageData = [];

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

function displayTextData() {
    const usageTextContainer = document.querySelector('.fundraiserDescription');
    if (usageTextContainer) {
        usageTextContainer.textContent = textData;
    } else {
        console.error('Error: .fundraiserDescription element not found');
    }
}

function displayImageData() {
    const usageImagesContainer = document.querySelector('.usageImages');
    if (usageImagesContainer) {
        imageData.forEach(image => {
            const img = document.createElement('img');
            img.src = image;
            img.alt = 'IPFS image';
            img.classList.add('usageImage'); // 스타일링을 위해 클래스 추가
            usageImagesContainer.appendChild(img);
        });
    } else {
        console.error('Error: .usageImages element not found');
    }
}

async function fetchAndDisplayFundraiserDetails(provider, signer, connectedAddress, address, factoryAddress, data) {
    try {
        animation.startTask();

        // 컨트랙트 객체 생성
        const contract = new ethers.Contract(address, fundraiserABI, provider);
        // 모든 트랜잭션 가져오기
        const events = await getEvents(provider, factoryAddress);

        // 컨트랙트 데이터 가져오기
        const name = await contract.name();
        const contractOwner = await getFundraiserCreatorAddresses(provider, events, address);

        // 후원금 사용 내역이 게시된 시간 가져오기
        const timestamp = data.timestamp;

        const creationDate = new Date(timestamp * 1000).toLocaleString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        });

        const targetAmount = ethers.utils.formatUnits(await contract.targetAmount(), 'gwei');
        const raisedAmount = ethers.utils.formatUnits(await contract.raisedAmount(), 'gwei');

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

        const usageDetailsDiv = document.getElementById('usageDetails');
        usageDetailsDiv.innerHTML = `
            <h1 class="fundraiserTitle">${name}</h1>
            <div class="contractMetaData">
                <div class="profile">
                    <minidenticon-svg class="profileImage" username="${contractOwner}"></minidenticon-svg>
                    <p class="contractOwner" fullAddress="${contractOwner}">${trimAddress(contractOwner)}</p>
                </div>
                <p class="creationTime">${creationDate}</p>
            </div>

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
            <p class="fundraiserDescription"></p>
            <div class="usageImages"></div>
        `;

        // 게시된 데이터 가져오기
        // 첫 번째 데이터는 text
        for (let i = 0; i < data.hashes.length; i++) {
            await fetchIpfsData(data.hashes[i], i === 0);
        }

        // Once all data is fetched, display it
        displayTextData();
        displayImageData();

        animation.endTask();
    } catch (error) {
        console.error('Error fetching contract details:', error);
        document.getElementById('usageDetails').innerHTML = '<p>Error fetching fundraiser details.</p>';
        animation.endTask(); // 에러 발생 시에도 로딩 종료
    }
}

// 메인 실행
(async function() {
    if (contractAddress) {
        const { provider, signer, connectedAddress } = await initializeProvider();
        const contract = new ethers.Contract(IpfsContractAddress, IpfsContractABI, signer);
        const data = await getData(contract, contractAddress);
        await fetchAndDisplayFundraiserDetails(provider, signer, connectedAddress, contractAddress, fundraiserFactoryAddress, data);
        console.log(data);
        if (data.hashes.length == 0) {
            const usageDetailsDiv = document.getElementById('usageDetails');
            usageDetailsDiv.innerHTML = `
                <p class="itemName">Nothing </p>
            `;
        }
    } else {
        document.getElementById('fundraiserDetails').innerHTML = '<p>No contract address provided.</p>';
    }
})();