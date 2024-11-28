// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.8.0/contracts/token/ERC721/ERC721.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.8.0/contracts/access/Ownable.sol";

contract GovernanceToken is ERC721, Ownable {
    uint256 public tokenCounter;
    uint256 public totalVotesFor;
    uint256 public totalVotesAgainst;
    uint256 public votingDeadline;

    mapping(address => uint256) public originalRecipient; // 수령인 주소별 토큰 수령 기록
    mapping(uint256 => uint256) public votingPower;
    mapping(address => bool) public hasVoted; // 각 수령인의 투표 여부 기록

    constructor(
        uint256 _votingDeadline,
        address[] memory recipients,
        uint256[] memory powers
    ) ERC721("GovernanceVotingToken", "GVT") {
        require(recipients.length == powers.length, "Recipients and powers must have the same length");
        
        tokenCounter = 1; // 1번부터 토큰 발행 시작
        votingDeadline = _votingDeadline; // 투표 마감시간 설정

        // 각 수령인에게 투표 영향력이 있는 NFT 발행
        for (uint256 i = 0; i < recipients.length; i++) {
            require(originalRecipient[recipients[i]] == 0, "Recipient has already received a token.");

            _safeMint(recipients[i], tokenCounter); // 각 수신자에게 NFT 발행
            votingPower[tokenCounter] = powers[i];   // 각 NFT에 투표 영향력 부여
            originalRecipient[recipients[i]] = tokenCounter; // 수령인을 기록
            tokenCounter++;
        }
    }

    function getVotingPower(uint256 tokenId) public view returns (uint256) {
        return votingPower[tokenId];
    }

    // 거버넌스 투표 함수 (마감시간 전까지만 투표 가능)
    function vote(bool voteFor) public {
        require(block.timestamp < votingDeadline, "Voting period has ended."); // 투표 마감시간 체크
        uint256 tokenId = originalRecipient[msg.sender];
        require(tokenId != 0, "You are not an original recipient of a token.");
        require(!hasVoted[msg.sender], "You have already voted.");

        uint256 power = votingPower[tokenId];

        if (voteFor) {
            totalVotesFor += power;
        } else {
            totalVotesAgainst += power;
        }

        hasVoted[msg.sender] = true; // 투표 완료 기록
    }

    // 투표 결과 조회 함수 (마감시간 이후에만 조회 가능)
    function getVotingResult() public view returns (uint256, uint256) {
        require(block.timestamp >= votingDeadline, "Voting is still ongoing, results are not available."); // 마감시간 체크
        return (totalVotesFor, totalVotesAgainst);
    }

    function isDone() public view returns (bool) {
        return block.timestamp >= votingDeadline;
    }
}
