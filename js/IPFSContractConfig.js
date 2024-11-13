const fundraiserInfoContract = "0xb61294c5d8cd01a62c0bf17e87c38a0ead6ad5eb";
const usageRecordContract = "0xfb304d7a025683f30df0ccb96d7e61b4e64400fb";
const IpfsContractABI = [
  {
    inputs: [
      {
        internalType: "string",
        name: "targetContractAddress",
        type: "string",
      },
      {
        internalType: "string[]",
        name: "hashes",
        type: "string[]",
      },
    ],
    name: "storeData",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "targetContractAddress",
        type: "string",
      },
    ],
    name: "getData",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
      {
        internalType: "string[]",
        name: "",
        type: "string[]",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

// IPFS 데이터 저장 함수
async function storeData(contract, targetContractAddress, ipfsHashes) {
  try {
    console.log(ipfsHashes);
    const tx = await contract.storeData(targetContractAddress, ipfsHashes);
    await tx.wait();
    console.log("IPFS data stored");
  } catch (error) {
    console.error("Error storing data:", error);
  }
}

async function getData(contract, targetContractAddress) {
  try {
    console.log("Target contract address input:", targetContractAddress);
    const data = await contract.getData(targetContractAddress);
    const [storedTargetContractAddress, hashes, timestamp, blockNumber] = data;
    return { storedTargetContractAddress, hashes, timestamp, blockNumber };
  } catch (error) {
    console.error("Error getting data:", error);
  }
}

export {
  fundraiserInfoContract,
  usageRecordContract,
  IpfsContractABI,
  storeData,
  getData,
};
