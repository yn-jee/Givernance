// SPDX-License-Identifier: GPL-3.0
//  practicing  ...

pragma solidity >=0.7.0 <0.9.0;

/*  컨트랙트는 마치 클래스와 같다   */
contract Fundraising {
    /*  state 변수들    */
    uint256 public targetAmount;
    address public owner;

    /*  dictionary 같이 매핑하기. 보낸사람 주소 - 금액.
        key : value 쌍으로. */
    mapping(address => uint256) public donations;

    /*  모금액을 0으로 초기화해놓기 */
    uint256 public raisedAmount = 0;

    /*  종료 시간을 이 블록이 생성된 시점으로부터 2주 뒤까지.
        block: 이 컨트랙트(: 기부 캠페인)가 배포되는 그 블록. EVM에 의해 정의되는 객체임
        global 객체임.  */
    uint256 public finishTime = block.timestamp + 2 weeks;


    /*  이 컨트랙트(기부 캠페인)의 생성자. (클래스의 생성자와 같은 역할)
        _targetAmount라는 uint256 인자를 전달받으며 생성됨  */
    constructor(uint256 _targetAmount) {
        /*  전달받은 인자를 state 변수 targetAmount에 저장  */
        targetAmount = _targetAmount;

        /*  msg.sender는 이 컨트랙트를 작성하는 행위자의 주소.
            state 변수 owner에 그 주소를 저장   */
        owner = msg.sender;
    }


    /*  기부자에게 돈 받는 함수
        external: 이 컨트랙트의 외부에서만 호출할 수 있는 함수라는 뜻
        payable: 이 함수는 돈을 받을 수 있다는 뜻   */
    receive() external payable {
        /*  캠페인이 끝났는지를 확인하는 단계가 필요함. 이때 쓰는 것이 require 함수
            require 함수: 조건이 참인지 거짓인지 판단하는 함수. 
                조건문이 거짓이라면 오류 메세지를 띄우면서 코드 실행을 중지함.
                require(만족해야 하는 조건, 만족 못 할 시 띄울 오류 메세지);
            ** 여기서 쓰는 block.timestamp는 위에서 쓴 것과 다름!!!
            ** 외부에서 receive 함수를 호출할 때 생성되는 트랜잭션이 담긴 블록의 날짜   */
        require(block.timestamp < finishTime, "This campaign is over");

        /*  기부자와 기부 금액을 매핑하기
            이때 msg.sender는 이 함수 호출자. 위의 것과 다름
            msg.value는 전송하는 금액   */
        donations[msg.sender] += msg.value;

        /*  기부 금액을 raisedAmount라는 모금액 변수에다가 추가 */
        raisedAmount += msg.value;
    }


    /*  컨트랙트(기부 캠페인) 생성자가 돈을 뺄 때 쓰는 함수 */
    function withdrawDonations() external {
        /*  이 함수 호출자가 컨트랙트(기부 캠페인) 생성자와 동일한지 확인하기.
            동일하지 않다면 오류 메세지와 함께 실행 중지    */
        require(msg.sender == owner, "Funds will only be released to the owner");

        /*  모금액이 목표 금액보다 적을 경우 출금 불가, 실행 중지   */
        require(raisedAmount >= targetAmount, "The project did not reach the goal");

        /*  이 돈 빼는 함수가 포함된 블록 시각이 캠페인 마감 시각보다 이를 경우 실행 중지   */
        require(block.timestamp > finishTime, "The campaign is not over yet");

        /*  위 모든 조건을 만족했다면(출금자가 기부 캠페인 생성자이고, 모금액이 목표 금액을 넘어섰고, 
            돈 빼려는 시점이 캠페인 마감 시각 이후일 경우)
            기부 캠페인 생성자 주소에다가 모금액 전부를 송금, 이때 payable 함수를 호출함    */
        payable(owner).transfer(raisedAmount);
    }


    /*  기부자에게 환불하는 함수    */
    function refund() external {
        /*  세 가지 조건을 확인하기
            1. 이 함수가 포함된 블록 시각이 캠페인 마감 시점 이후이고
            2. 모금액이 목표 금액보다 적고
            3. 이 함수를 호출하는 사람(msg.sender)이 캠페인에 모금을 했을 경우(기부자 명단에 있을 경우) */
        require(block.timestamp > finishTime, "The campaign is not over yet");
        require(raisedAmount < targetAmount, "The camaign has reached the goal");
        require(donations[msg.sender] > 0, "You did not donate to this campaign");

        /*  기부자에게 모금액을 환불해 줌   */
        uint256 toRefund = donations[msg.sender];
        donations[msg.sender] = 0;
        payable(msg.sender).transfer(toRefund); 
    }
}
