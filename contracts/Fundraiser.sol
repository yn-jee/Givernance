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
    uint256 public finalRaisedAmount; 
    address[] public donors;
    bool public hasWithdrawn = false;
    mapping(address => uint256) public donations;

    event Withdraw(address indexed creator, uint256 amount);

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

    function donate(bool isCreator) external payable {
        require(block.timestamp < finishTime, "This fundraising is over");
        require(msg.value > 0, "Donation must be greater than 0");

        // isCreator가 false인 경우에만 donations 매핑에 추가
        if (!isCreator) {
            if (donations[msg.sender] == 0) {   
                donors.push(msg.sender);
            }
            donations[msg.sender] += msg.value;
        }
        
        raisedAmount += msg.value;
    }


    function withdraw() external {
        FundraiserFactory factory = FundraiserFactory(factoryAddress); // Factory 컨트랙트 호출
        address creator = factory.fundraiserToCreator(address(this)); // 모금함 생성자 주소 확인

        require(msg.sender == creator, "Only fundraiser creator can withdraw"); // 생성자만 인출 가능
        require(raisedAmount > 0, "No funds to withdraw");
        require(block.timestamp >= finishTime, "Cannot withdraw before finish time");
        require(!hasWithdrawn, "Funds have already been withdrawn"); // 이미 인출된 경우 실행 불가

        finalRaisedAmount = raisedAmount;
        uint256 amount = raisedAmount;
        raisedAmount = 0;
        hasWithdrawn = true; // 플래그 설정
        
        (bool success, ) = creator.call{value: amount}("");
        require(success, "Failed to send money");

        emit Withdraw(creator, amount);
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

    // 모든 기부자 주소를 반환하는 함수
    function getDonors() public view returns (address[] memory) {
        return donors;
    }

    // 출금 여부를 반환하는 함수
    function isWithdrawn() public view returns (bool) {
        return hasWithdrawn;
    }
}

