const IpfsContractAddress = "0x53E87482c5e7E479868D6BA636f2D1E36b994499";
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
        const [storedTargetContractAddress, hashes] = await contract.getData(targetContractAddress);
        console.log('Target contract address:', storedTargetContractAddress);
        console.log('IPFS hashes:', hashes);
        return { storedTargetContractAddress, hashes };
    } catch (error) {
        console.error('Error getting data:', error);
    }
}

export { IpfsContractAddress, IpfsContractABI, storeData, getData };