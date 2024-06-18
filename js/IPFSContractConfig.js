const IpfsContractAddress = "0xf100864db627a2be977e9ce3199236da2e4ec3d4";
const IpfsContractABI = [
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "targetContractAddress",
				"type": "string"
			},
			{
				"internalType": "string[]",
				"name": "hashes",
				"type": "string[]"
			}
		],
		"name": "storeData",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "targetContractAddress",
				"type": "string"
			}
		],
		"name": "getData",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			},
			{
				"internalType": "string[]",
				"name": "",
				"type": "string[]"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

// IPFS 데이터 저장 함수
async function storeData(contract, targetContractAddress, ipfsHashes) {
    try {
        const tx = await contract.storeData(targetContractAddress, ipfsHashes);
        await tx.wait();
        console.log('IPFS data stored');
    } catch (error) {
        console.error('Error storing data:', error);
    }
}

async function getData(contract, targetContractAddress) {
    try {
        console.log('Target contract address input:', targetContractAddress); 
        const data = await contract.getData(targetContractAddress);
        const [storedTargetContractAddress, hashes, timestamp, blockNumber] = data;
        return { storedTargetContractAddress, hashes, timestamp, blockNumber };
    } catch (error) {
        console.error('Error getting data:', error);
    }
}


export { IpfsContractAddress, IpfsContractABI, storeData, getData };