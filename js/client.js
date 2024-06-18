// import { LoadingAnimation } from './LoadingAnimation.js';
// import { fundraiserFactoryAddress, fundraiserFactoryABI, fundraiserABI } from './contractConfig.js';


// function getCurrentDateTime() {
//     const now = new Date();

//     // 현재 시간을 `datetime-local` 포맷으로 변환 (ISO 포맷에서 분까지만 사용)
//     const dateTimeLocal = now.toISOString().slice(0, 16);

//     return dateTimeLocal;
// }

// async function fetchAllEventsFromContract(provider) {
//     try {
//         // Requesting Ethereum accounts and initializing provider
//         const signer = provider.getSigner();
//         console.log('Provider and signer initialized.');

//         const fundraiserFactory = new ethers.Contract(fundraiserFactoryAddress, fundraiserFactoryABI, signer);

//         const fromBlock = 0; // Starting block (e.g., 0)
//         const toBlock = 'latest'; // Last block
//         const events = await fundraiserFactory.queryFilter({}, fromBlock, toBlock);
        
//         const fundraiserAddresses = events.filter(event => event.event === "FundraiserCreated").map(event => event.args.fundraiserAddress);
//         return fundraiserAddresses;
//     } catch (error) {
//         console.error("Error fetching events:", error);
//         return []; // Return an empty array in case of an error
//     }
// }

// // 주소로 컨트랙트 정보 가져오기
// async function fetchAllFundraiserDetails(fundraiserAddresses, provider) {

//     const details = await Promise.all(fundraiserAddresses.map(async address => {
//         const contract = new ethers.Contract(address, fundraiserABI, provider);
//         const name = await contract.name();
//         const description = await contract.description();
//         const targetAmount = ethers.utils.formatEther(await contract.targetAmount());
//         const finishTime = new Date((await contract.finishTime()).toNumber() * 1000);
//         const finishTimeString = finishTime.toLocaleString();
//         const raisedAmount = ethers.utils.formatEther(await contract.raisedAmount());
//         const owner = await contract.owner();

//         return {
//             address,
//             name,
//             description,
//             targetAmount,
//             finishTime,
//             finishTimeString,
//             raisedAmount,
//             owner
//         };
//     }));

//     return details;
// }

// document.addEventListener('DOMContentLoaded', async function () {
//     const animation = new LoadingAnimation('../images/loadingAnimation.json');
//     await animation.loadAnimation();

//     const overlay = document.getElementById('loading-overlay');
//     overlay.style.display = 'flex'; // 오버레이 활성화

//     try {
//         await window.ethereum.request({ method: "eth_requestAccounts" });
//         const provider = new ethers.providers.Web3Provider(window.ethereum);

//         const fundraiserAddresses = await fetchAllEventsFromContract(provider);
//         const details = await fetchAllFundraiserDetails(fundraiserAddresses, provider);
//         console.log('Fundraiser Details:', details);
//         const container = document.querySelector('.fundraiserContainer');

//         // Set the radio button to 'fundraising' and render fundraisers
//         const fundraisingRadio = document.querySelector('input[name="fundraiserState"][value="fundraising"]');
//         fundraisingRadio.checked = true;
//         await renderFundraisers(details, container, 'fundraising');

//         document.querySelectorAll('input[name="fundraiserState"]').forEach(radio => {
//             radio.addEventListener('change', async function() {
//                 overlay.style.display = 'flex'; // 오버레이 활성화
//                 const selectedState = this.value;
//                 await renderFundraisers(details, container, selectedState);
//                 overlay.style.display = 'none'; // 오버레이 비활성화
//             });
//         });
//     } catch (error) {
//         console.error("Initialization error:", error);
//     } finally {
//         overlay.style.display = 'none'; // 오버레이 비활성화
//     }
// });

// async function renderFundraisers(details, container, state) {
//     container.innerHTML = ''; // Clear the container
//     const now = new Date();
//     let fundraisersFound = false;

//     details.forEach(detail => {
//         const isFundraising = detail.finishTime > now;

//         if ((state === 'fundraising' && isFundraising) || 
//             (state === 'finished' && !isFundraising) ||
//             (state === 'usageUploaded' && detail.status === 'usageUploaded')) {
//             fundraisersFound = true;

//             const item = document.createElement('div');
//             const postAddress = "post.html?contractAddress=" + detail.address;
//             item.id = 'fundraiserBox';
//             item.innerHTML = `
//             <img class="donationBox" src="images/donationBox.png" title="donationBox">
//             <h2 class="fundraiser-title">${detail.name}</h2>
//             <p class="target-amount">Target Amount is <b>${detail.targetAmount} ETH</b></p>
//             <p class="finish-date">Open until <b>${detail.finishTimeString}</b></p>
//             `;
//             item.addEventListener('click', function() {
//                 window.location.href = postAddress;
//             });
//             container.appendChild(item);
//         }
//     });

//     if (!fundraisersFound && state === 'usageUploaded') {
//         const message = document.createElement('h3');
//         message.style.color = '#888';
//         message.style.gridColumn = '1 / -1'; // 메시지를 전체 열에 걸치게 함
//         message.style.textAlign = 'center'; // 텍스트를 중앙 정렬
//         message.textContent = '증빙 완료된 모금함이 없어요.';
        
//         container.appendChild(message);
//     }

//     else if (!fundraisersFound && state === 'votingDone') {
//         const message = document.createElement('h3');
//         message.style.color = '#888';
//         message.style.gridColumn = '1 / -1'; // 메시지를 전체 열에 걸치게 함
//         message.style.textAlign = 'center'; // 텍스트를 중앙 정렬
//         message.textContent = '투표 완료된 모금함이 없어요.';
        
//         container.appendChild(message);
//     }
//     // Add back the grid display style to the container
//     container.style.display = 'grid';
//     container.style.gridTemplateColumns = '1fr 1fr 1fr'; 
//     container.style.gap = '20px'; 
//     container.style.margin = '0 auto'; 
//     container.style.maxWidth = '1200px'; 
//     container.style.padding = '20px'; 
    
// }

import { LoadingAnimation } from './LoadingAnimation.js';
import { fundraiserFactoryAddress, fundraiserFactoryABI, fundraiserABI } from './contractConfig.js';
import { IpfsContractAddress, IpfsContractABI, storeData, getData } from './IPFSContractConfig.js';

async function initializeProvider() {
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
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

async function fetchAllEventsFromContract(provider) {
    try {
        const signer = provider.getSigner();
        console.log('Provider and signer initialized.');

        const fundraiserFactory = new ethers.Contract(fundraiserFactoryAddress, fundraiserFactoryABI, signer);

        const fromBlock = 0; // Starting block
        const toBlock = 'latest'; // Last block
        const events = await fundraiserFactory.queryFilter({}, fromBlock, toBlock);
        
        const fundraiserAddresses = events.filter(event => event.event === "FundraiserCreated").map(event => event.args.fundraiserAddress);
        return fundraiserAddresses;
    } catch (error) {
        console.error("Error fetching events:", error);
        return [];
    }
}

// async function checkTargetContractData(targetContractAddress, signer) {
//     try {
//         const data = await getData(signer, targetContractAddress);
//         return data.hashes.length > 0;
//     } catch (error) {
//         console.error('Error retrieving data:', error);
//         return false;
//     }
// }

async function fetchAllFundraiserDetails(fundraiserAddresses, provider) {
    const signer = provider.getSigner();
    const details = await Promise.all(fundraiserAddresses.map(async address => {
        const contract = new ethers.Contract(address, fundraiserABI, provider);
        const name = await contract.name();
        const description = await contract.description();
        const targetAmount = ethers.utils.formatEther(await contract.targetAmount());
        const finishTime = new Date((await contract.finishTime()).toNumber() * 1000);
        const finishTimeString = finishTime.toLocaleString();
        const raisedAmount = ethers.utils.formatEther(await contract.raisedAmount());
        const owner = await contract.owner();


        const Ipfscontract = new ethers.Contract(IpfsContractAddress, IpfsContractABI, signer);
        const data = await getData(Ipfscontract, address);

        const isUsageUploaded = (data.hashes.length > 0);

        return {
            address,
            name,
            description,
            targetAmount,
            finishTime,
            finishTimeString,
            raisedAmount,
            owner,
            isUsageUploaded
        };
    }));

    return details;
}

document.addEventListener('DOMContentLoaded', async function () {
    const animation = new LoadingAnimation('../images/loadingAnimation.json');
    await animation.loadAnimation();

    const overlay = document.getElementById('loading-overlay');
    overlay.style.display = 'flex'; // 오버레이 활성화

    try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const provider = new ethers.providers.Web3Provider(window.ethereum);

        const fundraiserAddresses = await fetchAllEventsFromContract(provider);
        const details = await fetchAllFundraiserDetails(fundraiserAddresses, provider);
        console.log('Fundraiser Details:', details);
        const container = document.querySelector('.fundraiserContainer');

        // Set the radio button to 'fundraising' and render fundraisers
        const fundraisingRadio = document.querySelector('input[name="fundraiserState"][value="fundraising"]');
        fundraisingRadio.checked = true;
        await renderFundraisers(details, container, 'fundraising');

        document.querySelectorAll('input[name="fundraiserState"]').forEach(radio => {
            radio.addEventListener('change', async function() {
                overlay.style.display = 'flex'; // 오버레이 활성화
                const selectedState = this.value;
                await renderFundraisers(details, container, selectedState);
                overlay.style.display = 'none'; // 오버레이 비활성화
            });
        });
    } catch (error) {
        console.error("Initialization error:", error);
    } finally {
        overlay.style.display = 'none'; // 오버레이 비활성화
    }
});

async function renderFundraisers(details, container, state) {
    container.innerHTML = ''; // Clear the container
    const now = new Date();
    let fundraisersFound = false;

    details.forEach(detail => {
        const isFundraising = detail.finishTime > now;

        if ((state === 'fundraising' && isFundraising) || 
            (state === 'finished' && !isFundraising && !detail.isUsageUploaded)) {
            fundraisersFound = true;

            const item = document.createElement('div');
            const postAddress = "post.html?contractAddress=" + detail.address;
            item.id = 'fundraiserBox';
            item.innerHTML = `
            <img class="donationBox" src="images/donationBox.png" title="donationBox">
            <h2 class="fundraiser-title">${detail.name}</h2>
            <p class="target-amount">Target Amount is <b>${detail.targetAmount} ETH</b></p>
            <p class="finish-date">Open until <b>${detail.finishTimeString}</b></p>
            `;
            item.addEventListener('click', function() {
                window.location.href = postAddress;
            });
            container.appendChild(item);
        }
        else if (state === 'usageUploaded' && detail.isUsageUploaded) {
            fundraisersFound = true;

            const item = document.createElement('div');
            const postAddress = "usageUploadedPost.html?contractAddress=" + detail.address;
            item.id = 'fundraiserBox';
            item.innerHTML = `
            <img class="donationBox" src="images/donationBox.png" title="donationBox">
            <h2 class="fundraiser-title">${detail.name}</h2>
            <p class="target-amount">Target Amount is <b>${detail.targetAmount} ETH</b></p>
            <p class="finish-date">Open until <b>${detail.finishTimeString}</b></p>
            `;
            item.addEventListener('click', function() {
                window.location.href = postAddress;
            });
            container.appendChild(item);
        }
    });

    if (!fundraisersFound && state === 'fundraising') {
        const message = document.createElement('h3');
        message.style.color = '#888';
        message.style.gridColumn = '1 / -1'; // 메시지를 전체 열에 걸치게 함
        message.style.textAlign = 'center'; // 텍스트를 중앙 정렬
        message.textContent = '모금 중인 모금함이 없어요.';
        
        container.appendChild(message);
    }

    else if (!fundraisersFound && state === 'finished') {
        const message = document.createElement('h3');
        message.style.color = '#888';
        message.style.gridColumn = '1 / -1'; // 메시지를 전체 열에 걸치게 함
        message.style.textAlign = 'center'; // 텍스트를 중앙 정렬
        message.textContent = '모금 완료된 모금함이 없어요.';
        
        container.appendChild(message);
    }

    else if (!fundraisersFound && state === 'usageUploaded') {
        const message = document.createElement('h3');
        message.style.color = '#888';
        message.style.gridColumn = '1 / -1'; // 메시지를 전체 열에 걸치게 함
        message.style.textAlign = 'center'; // 텍스트를 중앙 정렬
        message.textContent = '증빙 완료된 모금함이 없어요.';
        
        container.appendChild(message);
    }

    else if (!fundraisersFound && state === 'votingDone') {
        const message = document.createElement('h3');
        message.style.color = '#888';
        message.style.gridColumn = '1 / -1'; // 메시지를 전체 열에 걸치게 함
        message.style.textAlign = 'center'; // 텍스트를 중앙 정렬
        message.textContent = '투표 완료된 모금함이 없어요.';
        
        container.appendChild(message);
    }
    // Add back the grid display style to the container
    container.style.display = 'grid';
    container.style.gridTemplateColumns = '1fr 1fr 1fr'; 
    container.style.gap = '20px'; 
    container.style.margin = '0 auto'; 
    container.style.maxWidth = '1200px'; 
    container.style.padding = '20px'; 
    
}
