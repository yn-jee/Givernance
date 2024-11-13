// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./GovernanceToken.sol";
import "./Fundraiser.sol"; 

contract GovernanceManager {
    // 매핑: Fundraiser 컨트랙트 주소 => GovernanceToken 컨트랙트 주소
    mapping(address => address) public fundraiserToGovernance;

    // 새로운 거버넌스 컨트랙트를 생성하는 함수
    function createGovernanceToken(address fundraiserAddress, uint256 votingDeadline) public returns (address) {
        // fundraiser 컨트랙트에 이미 거버넌스 컨트랙트가 있는지 확인
        require(fundraiserToGovernance[fundraiserAddress] == address(0), "Governance contract already exists for this fundraiser.");

        // Fundraiser 컨트랙트 인스턴스를 생성
        Fundraiser fundraiser = Fundraiser(fundraiserAddress);
        require(fundraiser.isWithdrawn(), "Fundraiser must be withdrawn before creating governance token."); 

        // Fundraiser의 기부자 목록과 기부 금액을 기반으로 수령인과 투표 영향력 배열 생성
        address[] memory recipients = fundraiser.getDonors(); 
        uint256[] memory powers = new uint256[](recipients.length);

        for (uint256 i = 0; i < recipients.length; i++) {
            // 각 기부자의 기부 금액에 따른 투표 영향력 설정
            powers[i] = fundraiser.donations(recipients[i]); 
        }

        // 새로운 GovernanceToken 생성 및 매핑
        GovernanceToken newGovernanceToken = new GovernanceToken(votingDeadline, recipients, powers);
        fundraiserToGovernance[fundraiserAddress] = address(newGovernanceToken);

        // 생성된 거버넌스 컨트랙트 주소 반환
        return address(newGovernanceToken);
    }

    // 특정 fundraiser의 거버넌스 컨트랙트 주소 조회 함수
    function getGovernanceToken(address fundraiserAddress) public view returns (address) {
        return fundraiserToGovernance[fundraiserAddress];
    }
}