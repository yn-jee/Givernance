import { LoadingAnimation } from './LoadingAnimation.js';
import {fundraiserFactoryAddress, fundraiserFactoryABI, fundraiserABI} from './contractConfig.js';

function getCurrentDateTime() {
    const now = new Date();

    // 현재 시간을 `datetime-local` 포맷으로 변환 (ISO 포맷에서 분까지만 사용)
    const dateTimeLocal = now.toISOString().slice(0, 16);

    return dateTimeLocal;
}


document.addEventListener('DOMContentLoaded', async function () {
    const animation = new LoadingAnimation('../images/loadingAnimation.json');
    await animation.loadAnimation();

    try {
        animation.startTask(); // 로딩 시작
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        console.log('Provider and signer initialized.');

        console.log(fundraiserFactoryAddress);

        const fundraiserFactory = new ethers.Contract(fundraiserFactoryAddress, fundraiserFactoryABI, signer);
        console.log('Contract initialized.');

        // FundraiserCreated 이벤트 리스너
        fundraiserFactory.on("FundraiserCreated", (fundraiserAddress) => {
            console.log(`New Fundraiser Created at: ${fundraiserAddress}`);
            alert(`New Fundraiser Created at: ${fundraiserAddress}`);
        });


        document.getElementById('registerFundraiser').addEventListener('click', async function() {
            animation.startTask(); // 로딩 시작
            const name = document.getElementById('fundraiserName').value;
            const targetAmountInput = document.getElementById('fundraiserTargetAmount').value;
            if (targetAmountInput) {
                const targetAmount = ethers.utils.parseUnits(targetAmountInput, 'gwei');
                console.log('Target Amount (Ether):', targetAmount);
            }
            const finishTimeElement = document.getElementById('fundraiserFinishTime');
            finishTimeElement.min = getCurrentDateTime();
            const finishTimeInput = finishTimeElement.value;

            const finishTimeUnix = Math.floor(new Date(finishTimeInput).getTime() / 1000);
            console.log('Finish Time (Unix):', finishTimeUnix);

            const description = document.getElementById('fundraiserDescription').value;

            const fundraiserType = document.querySelector('input[name="fundraiserType"]:checked').value;
            let items = [];
            
            if (fundraiserType === 'commodity') {
                document.querySelectorAll('.commodityTypeItemContainerTable tr').forEach(row => {
                    if (row.rowIndex !== 0) { // 첫 번째 행은 제외 (헤더)
                        const name = row.cells[1].innerText;
                        const quantity = parseInt(row.cells[2].innerText);
                        const price = parseInt(row.cells[3].innerText.replace(' gwei', ''));
                        items.push({ name, quantity, price });
                    }
                });
            }
            
            if (!name || !targetAmount || !finishTimeUnix || !description) {
                alert('모금함 이름, 목표 금액, 종료 시점, 상세 설명이 모두 입력되어야 합니다.');
                animation.endTask(); // 로딩 종료
                return;
            }
            if (targetAmountInput <= 0) {
                alert('목표 금액이 올바르지 않습니다.');
                animation.endTask(); // 로딩 종료
                return;
            }
            if (finishTimeInput < getCurrentDateTime()) {
                alert('종료 시점이 현재보다 이른 시점입니다.');
                animation.endTask(); // 로딩 종료
                return;
            }

            try {
                const transactionResponse = await fundraiserFactory.createFundraiser(
                    name, targetAmount, finishTimeUnix, description, items
                );
                await transactionResponse.wait();
                console.log('Fundraiser created:', transactionResponse);
                alert('Fundraiser has been registered successfully!');
            } catch (error) {
                console.error('Failed to register fundraiser:', error);
                alert('모금함이 생성되지 않았습니다.', error);
            } finally {
                animation.endTask(); // 로딩 종료
            }
        });
        

        var fundraiserTargetAmount = document.getElementById('fundraiserTargetAmount');
        fundraiserTargetAmount.classList.add('fundraiserTargetAmountPlaceholderPink');

        let sum = 0;
        document.querySelectorAll('input[name="fundraiserType"]').forEach(radio => {
            radio.addEventListener('change', function() {
                const descriptionText = document.getElementById('fundraiserDescriptionText');
                var commodityContainer = document.getElementsByClassName('commodityTypeItemContainer')[0];
                var commodityContainerTitle = document.getElementsByClassName('commodityTypeItemContainerTitle')[0];
                fundraiserTargetAmount = document.getElementById('fundraiserTargetAmount');
                switch (this.value) {
                    case 'commodity':
                        descriptionText.innerHTML = '<p>후원금으로 구매할 물품의 목록을 등록할 수 있는 일회성 모금함입니다.</p>';
                        commodityContainer.style.display = "flex";
                        commodityContainerTitle.style.display = "flex";
                        fundraiserTargetAmount.disabled = true;
                        if (sum) {
                            fundraiserTargetAmount.value = sum;
                        } else {
                            fundraiserTargetAmount.value = '';
                        }
                        fundraiserTargetAmount.placeholder = "물품형 후원은 총 목표 금액을 설정할 수 없습니다.";
                        fundraiserTargetAmount.classList.remove('fundraiserTargetAmountPlaceholderGrey');
                        fundraiserTargetAmount.classList.add('fundraiserTargetAmountPlaceholderPink');
                        break;
                    case 'monetary':
                        descriptionText.innerHTML = '<p>큰 규모의 모금에 적합한 일회성 모금함입니다.<br>추후 계획에 변경 사항이 생긴다면, 후원자의 투표에 따라 계획을 변경할 수 있습니다.</p>';
                        commodityContainer.style.display = "none";
                        commodityContainerTitle.style.display = "none";
                        fundraiserTargetAmount.disabled = false;
                        fundraiserTargetAmount.placeholder = "목표 금액을 입력하세요.";
                        fundraiserTargetAmount.classList.remove('fundraiserTargetAmountPlaceholderPink');
                        fundraiserTargetAmount.classList.add('fundraiserTargetAmountPlaceholderGrey');
                        break;
                    case 'regular':
                        descriptionText.innerHTML = '<p>정기적으로 후원을 받을 수 있는 상시 모금함입니다.</p>';
                        commodityContainer.style.display = "none";
                        commodityContainerTitle.style.display = "none";
                        fundraiserTargetAmount.disabled = false;
                        fundraiserTargetAmount.placeholder = "목표 금액을 입력하세요.";
                        fundraiserTargetAmount.classList.remove('fundraiserTargetAmountPlaceholderPink');
                        fundraiserTargetAmount.classList.add('fundraiserTargetAmountPlaceholderGrey');
                        break;
                }
            });
        });

        var modal = document.getElementsByClassName('addItemModal')[0];
        var targetAmount = document.getElementById('fundraiserTargetAmount');
        var addItemButton = document.getElementById('addItemButton');
        var closeButton = document.querySelector('.addItemModal .addItemModalClose');
        var addItemDone = document.querySelector('.addItemDone');
        var addItemModalHeader = document.getElementById('addItemModalHeader');
        var itemNameInput = document.getElementById('addItemName');
        var itemQuantityInput = document.getElementById('addItemContity');
        var itemPriceInput = document.getElementById('addItemPrice');
        var itemsContainer = document.querySelector('.commodityTypeItemContainerTable');
        var editingRow = null; // This will hold the reference to the row being edited

        // Function to open modal for new item
        addItemButton.addEventListener('click', function() {
            addItemModalHeader.innerText = "Add New Item";
            modal.style.display = "flex";
            modal.style.animation = "fadeIn 0.2s";
            editingRow = null; // Ensure we're in 'add new' mode
            itemNameInput.value = '';
            itemQuantityInput.value = '';
            itemPriceInput.value = '';
        });

        // Function to close modal
        function closeModal() {
            modal.style.animation = "fadeOut 0.2s";
        }

        modal.addEventListener('animationend', (event) => {
            if (event.animationName === 'fadeOut') {
                modal.style.display = "none";
            }
        });

        closeButton.addEventListener('click', closeModal);

        // Event listener for adding/updating an item
        addItemDone.addEventListener('click', function () {
            const name = itemNameInput.value;
            const quantity = itemQuantityInput.value;
            const price = itemPriceInput.value;
            const totalPrice = parseInt(quantity) * parseInt(price);

            if (editingRow) {
                // Update existing row
                editingRow.cells[1].innerText = name;
                editingRow.cells[2].innerText = quantity;
                editingRow.cells[3].innerText = `${price} gwei`;               
                editingRow.cells[4].innerText = `${totalPrice} gwei`;
            } else {
                // Create new item and append it to the table
                const row = itemsContainer.insertRow();
                
                row.insertCell(0).innerText = itemsContainer.rows.length - 1; // Simple row count
                row.insertCell(1).innerText = name;
                row.insertCell(2).innerText = quantity;
                row.insertCell(3).innerText = `${price} gwei`;               
                row.insertCell(4).innerText = `${totalPrice} gwei`;
                row.insertCell(5).innerHTML = `<span class="deleteItem" onclick="deleteRow(this)">&times;</span>`;
            }

            const rows = itemsContainer.getElementsByTagName('tr');
            sum = 0;
            for (let i = 1; i < rows.length; i++) {
                let totalPriceValue = rows[i].cells[4] ? parseInt(rows[i].cells[4].innerText.replace(' gwei', '')) : 0;
                sum += Number(totalPriceValue);
            }

            // 합계를 targetAmount에 업데이트
            if (rows.length > 1) {  // 첫 번째 행은 헤더
                targetAmount.value = sum;
            }


            closeModal();
        });
    
        document.querySelector('.commodityTypeItemContainerTable').addEventListener('click', function(event) {
            // 클릭된 요소가 'deleteItem' 클래스를 가지고 있는지 확인
            if (event.target.classList.contains('deleteItem')) {
                deleteRow(event.target);
            }
        });
        
        // 삭제 아이콘을 클릭한 요소를 받아 그 요소의 부모 행을 찾아서 삭제
        function deleteRow(element) {
            var row = element.closest('tr'); // 클릭한 요소에서 가장 가까운 'tr' 요소를 찾아서
            var name = row.cells[1].innerText;
            if (confirm(name + ' 항목을 삭제하시겠습니까?')) {  // 사용자에게 삭제 확인을 요청
                var targetAmountInput = document.getElementById('fundraiserTargetAmount').value;
                targetAmountInput -= row.totalPrice;
                row.parentNode.removeChild(row); // 그 행을 삭제


                // 인덱스 값 수정하기, 총 목표 금액 수정하기
                const rows = itemsContainer.getElementsByTagName('tr');
                sum = 0;
                for (let i = 1; i < rows.length; i++) {
                    let totalPriceValue = rows[i].cells[4] ? parseInt(rows[i].cells[4].innerText.replace(' gwei', '')) : 0;
                    sum += Number(totalPriceValue);

                    rows[i].cells[0].innerText = i;
                }

                // 합계를 targetAmount에 업데이트
                if (rows.length > 1) {  // 첫 번째 행은 헤더
                    targetAmount.value = sum;
                }
                else {
                    fundraiserTargetAmount.value = '';
                }
            }
        }

        // Adding click listeners to all existing and future rows
        itemsContainer.addEventListener('click', function(e) {
            if (e.target.parentNode.tagName === 'TR') {
                addItemModalHeader.innerText = "Edit Item";
                editingRow = e.target.parentNode;
                itemNameInput.value = editingRow.cells[1].innerText;
                itemQuantityInput.value = editingRow.cells[2].innerText;
                itemPriceInput.value = editingRow.cells[3].innerText.replace(' gwei', '');
                modal.style.display = "flex";
                modal.style.animation = "fadeIn 0.2s";
            }
        });

    } catch (error) {
        console.error("Error initializing application:", error);
    } finally {
        animation.endTask(); // 로딩 종료
    }
});