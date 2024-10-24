
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./FundraiserFactory.sol";

contract Fundraiser {
    address public factoryAddress;
    string public name;
    uint256 public targetAmount;  
    uint256 public finishTime;    
    string public fundraiserType;
    uint256 public raisedAmount = 0;
    mapping(address => uint256) public donations;

    constructor(
        string memory _name,
        uint256 _targetAmount,
        uint256 _finishTime,
        string memory _fundraiserType 
    ) {
        factoryAddress = msg.sender; // FundraiserFactory의 주소를 저장
        name = _name;
        targetAmount = _targetAmount;
        finishTime = _finishTime;
        fundraiserType = _fundraiserType;  // 모금함 타입 저장
    }

    function donate() external payable {
        require(block.timestamp < finishTime, "This fundraising is over");
        require(msg.value > 0, "Donation must be greater than 0");
        
        donations[msg.sender] += msg.value;
        raisedAmount += msg.value;
    }

    function withdraw() external {
        FundraiserFactory factory = FundraiserFactory(factoryAddress); // Factory 컨트랙트 호출
        address creator = factory.fundraiserToCreator(address(this)); // 모금함 생성자 주소 확인

        require(msg.sender == creator, "Only fundraiser creator can withdraw"); // 생성자만 인출 가능
        require(raisedAmount > 0, "No funds to withdraw");
        require(block.timestamp >= finishTime, "Cannot withdraw before finish time");
        
        uint256 amount = raisedAmount;
        raisedAmount = 0;
        
        (bool success, ) = creator.call{value: amount}("");
        require(success, "Failed to send money");
    }

    function getInfo(address _address) public view returns (uint256) {
        require(donations[_address] > 0, "No Data"); 
        return donations[_address];
    }

    function getFundraiserDetails() public view returns (
        uint256, 
        uint256, 
        string memory, 
        uint256, 
        address  // 모금함 생성자의 주소 반환
    ) {
        FundraiserFactory factory = FundraiserFactory(factoryAddress); // Factory 컨트랙트 호출
        address creator = factory.fundraiserToCreator(address(this)); // 모금함 생성자 주소 확인

        return (
            targetAmount, 
            finishTime, 
            fundraiserType, 
            raisedAmount, 
            creator // 모금함 생성자 주소 반환
        );
    }
}