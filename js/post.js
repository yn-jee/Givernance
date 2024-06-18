import { LoadingAnimation } from './LoadingAnimation.js';
import { minidenticonSvg } from 'https://cdn.jsdelivr.net/npm/minidenticons@4.2.1/minidenticons.min.js';
import { fundraiserFactoryAddress, fundraiserFactoryABI, fundraiserABI } from './contractConfig.js';
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

// 컨트랙트 정보를 가져와 페이지에 표시하는 함수
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

        document.querySelector('.contractOwner').addEventListener('click', () => {
            copyToClipboard(contractOwner);
        });

        var modal = document.getElementsByClassName('donateModal')[0];
        var donateModalOpenButton = document.getElementById('donateModalOpenButton');
        var closeButton = document.querySelector('.donateModal .donateModalClose');
        var donateAmountInput = document.getElementById('donateAmount');
        var donateButton = document.querySelector('.donateButton');


        
        // 현재 시각과 마감 시각 비교
        if (new Date().getTime() > new Date((await contract.finishTime()).toNumber() * 1000).getTime()) {
            // 마감되었고, 연결된 주소와 컨트랙트 생성자 주소가 같을 경우 usage 등록 버튼 생성
            if (connectedAddress == contractOwner.toLowerCase()) {
                // 사용 내역이 등록되었는지 확인
                const contract = new ethers.Contract(IpfsContractAddress, IpfsContractABI, signer);
                const data = await getData(contract, contractAddress);
                if (data.hashes.length > 0) {
                    document.querySelector('#donateModalOpenButton').disabled = true;
                    document.querySelector('#donateModalOpenButton').textContent = "이미 사용 내역이 등록된 모금함입니다.";
                    document.querySelector('#donateModalOpenButton').style = 'background: #e0e0e0; color: white; width: auto; padding: 0px 15px; text-align: center;';
                }
                
                else {
                    // 후원 버튼 숨기기
                    document.querySelector('#donateModalOpenButton').style = 'display: none;';
                    // 사용 내역 등록 버튼 보이기
                    document.querySelector('#uploadUsageButton').style = 'display: block;';
    
                    const uploadUsageAddress = "usagePost.html?contractAddress=" + contractAddress;
                    document.querySelector('#uploadUsageButton').addEventListener('click', function() {
                        window.location.href = uploadUsageAddress;
                    });
                }
            }
            else {
                document.querySelector('#donateModalOpenButton').disabled = true;
                document.querySelector('#donateModalOpenButton').textContent = "마감되었어요";
                document.querySelector('#donateModalOpenButton').style = 'background: #e0e0e0; color: white;';
            }
        }

        donateModalOpenButton.addEventListener('click', function() {
            modal.style.display = "flex";
            modal.style.animation = "fadeIn 0.2s";
            donateAmountInput.value = '';
        });
        
        // Function to close modal
        function closeModal() {
            modal.style.animation = "fadeOut 0.2s";
        }

        modal.addEventListener('animationend', (event) => {
            if (event.animationName === 'fadeOut') {
                modal.style.display = "none";
            }
        });

        closeButton.addEventListener('click', closeModal);

        donateButton.addEventListener('click', async function() {
            try {
                if (!donateAmountInput.value || donateAmountInput.value <= 0) {
                    alert('후원 금액이 올바르지 않습니다.');
                    return;
                }
                const signer = provider.getSigner(); // 서명자 가져오기
                const signedContract = contract.connect(signer); // 서명자로 계약 연결
        
                const donateAmountGwei = donateAmountInput.value; // Input 값 가져오기
                // Gwei를 Ether로 변환
                const donateAmountEther = ethers.utils.formatUnits(donateAmountGwei, 'gwei');

                const tx = await signedContract.donate({
                    value: ethers.utils.parseEther(donateAmountEther), // 기부 금액 (Ether)
                    gasLimit: 300000
                });
        
                await tx.wait();
                alert('Donation successful!');
            } catch (error) {
                console.error('Donation failed:', error);
        
                // 상세한 오류 메시지를 위해 추가
                if (error.code === 'CALL_EXCEPTION') {
                    alert('Smart contract call exception. Please check the contract conditions.');
                } else if (error.code === 'INSUFFICIENT_FUNDS') {
                    alert('Insufficient funds in your account.');
                } else if (error.code === 'NETWORK_ERROR') {
                    alert('Network error. Please try again later.');
                } else if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
                    alert('Cannot estimate gas; transaction may fail or may require manual gas limit.');
                } else {
                    alert(`Donation failed: ${error.message}`);
                }
            }
        });

        animation.endTask();
    } catch (error) {
        console.error('Error fetching contract details:', error);
        document.getElementById('fundraiserDetails').innerHTML = '<p>Error fetching fundraiser details.</p>';
        animation.endTask(); // 에러 발생 시에도 로딩 종료
    }
}



// 메인 실행
(async function() {
    if (contractAddress) {
        const { provider, signer, connectedAddress } = await initializeProvider();
        await fetchAndDisplayFundraiserDetails(provider, signer, connectedAddress, contractAddress, fundraiserFactoryAddress);
    } else {
        document.getElementById('fundraiserDetails').innerHTML = '<p>No contract address provided.</p>';
    }
})();
