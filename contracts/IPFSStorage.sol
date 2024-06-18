// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract IPFSStorage {
    struct IPFSData {
        string targetContractAddress;
        string[] hashes;
    }

    mapping(string => IPFSData) private ipfsData;

    // IPFS 데이터 저장 함수
    function storeData(string memory targetContractAddress, string[] memory hashes) public {
        IPFSData storage data = ipfsData[targetContractAddress];
        data.targetContractAddress = targetContractAddress;
        for (uint i = 0; i < hashes.length; i++) {
            data.hashes.push(hashes[i]);
        }
    }

    // IPFS 데이터 조회 함수
    function getData(string memory targetContractAddress) public view returns (string memory, string[] memory) {
        IPFSData storage data = ipfsData[targetContractAddress];
        return (data.targetContractAddress, data.hashes);
    }
}
