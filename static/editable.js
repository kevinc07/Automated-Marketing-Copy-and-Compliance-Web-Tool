// 從localStorage取得task_id
var taskId = localStorage.getItem('task');


// 如果task_id存在，則向後端發送請求
if (taskId) {
    fetch('/get_task_data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ task_id: taskId })
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('fileName').value = data.task.taskname;
        document.getElementById('imdate').value = data.task.tasksdetetime;
        document.getElementById('imaudience').value = data.audience.targetAudience;
        // 組合詳細資訊
        let audienceDetails = `年齡範圍: ${data.audience.age1 || ""}歲 - ${data.audience.age2 || ""}歲
        薪資範圍: ${data.audience.salary1 || ""}萬 - ${data.audience.salary2 || ""}萬
        性別: ${data.audience.gender || ""}
        婚姻: ${data.audience.marriage || ""}
        孩子: ${data.audience.child || ""}
        空閒時間運用: ${data.audience.spaceTime || ""}
        風險承受度: ${data.audience.riskOverwhelming || ""}
        社交參與度: ${data.audience.socialParticipate || ""}
        其他特徵: ${data.audience.otherFeature || ""}
        `;
        // 設置工具提示內容
        // 設置客群工具提示內容
        document.getElementById('imaudience').nextElementSibling.querySelector('.tooltip').textContent = audienceDetails;
        document.getElementById('improduct').value = data.product.productName;
        // 組合詳細資訊
        let productDetails = `產品類型: ${data.product.productType || ""}
        產品特色: ${data.product.productFeature || ""}
        產品形象: ${data.product.productImage || ""}
        優惠方案: 
        ${data.product.discount || ""}
        活動辦法: ${data.product.activityMethod || ""}
        產品優勢: ${data.product.advantage || ""}
        產品劣勢: ${data.product.disadvantage || ""}
        產品故事性: ${data.product.productStory || ""}
        截止日: ${data.product.productDeadline || ""}
        售後服務: ${data.product.afterService || ""}
        如何購買: ${data.product.howToPurchase || ""}
        購買條件: ${data.product.purchaseCondition || ""}
        數量限制: ${data.product.numLimit}
        `;
        document.getElementById('improduct').nextElementSibling.querySelector('.tooltip').textContent = productDetails;
        document.getElementById('imcustomvalue').value = data.customvalue.style;
        let customvalueDetails = `關鍵字: ${data.customvalue.keyword || ""}
        文案風格: ${data.customvalue.contentStyle || ""}
        提案框架: ${data.customvalue.proposol || ""}
        廣告方式: ${data.customvalue.showOutput || ""}
        `;
        document.getElementById('imcustomvalue').nextElementSibling.querySelector('.tooltip').textContent = customvalueDetails;
        document.getElementById('imdeadline').value = data.task.deadline;
        // 在select元素中顯示版本
        let select = document.getElementById('imtimess');
        data.versions.forEach(version => {
            let option = document.createElement('option');
            option.value = version;
            option.textContent = "版本 " + version;
            select.appendChild(option);
        })

        // 如果有版本，立即獲取第一個版本的內容
        if (data.versions.length > 0) {
            fetchVersionData(taskId, data.versions[0]);
        }

        // 添加事件監聽器
        select.addEventListener('change', function() {
            fetchVersionData(taskId, this.value);
        });
    })
    .catch(error => {
        console.error('Error fetching task data:', error);
    })
}



function fetchVersionData(taskId, version) {
    fetch('/get_version_data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ task_id: taskId, version: version })
    })
    .then(response => response.json())
    .then(data => {
        generateStepTextareas(data.steps, data.customvalue_data);
    })
    .catch(error => {
        console.error('Error fetching version data:', error);
    });
}


function generateStepTextareas(steps, customvalue_data) {
    const container = document.getElementById('stepsContainer');

    // 清空容器中的现有内容
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    steps.forEach((stepContent, index) => {
        const stepDiv = document.createElement('div');
        stepDiv.className = 'step-div';

        const stepLabel = document.createElement('label');
        stepLabel.innerHTML = getStepDescription(index + 1, customvalue_data.proposol, customvalue_data.proposolcontent); // 傳遞proposolcontent給函數
        stepLabel.style.color = '#007EA6';
        stepLabel.style.width = '800px';
        stepLabel.style.fontSize = '14px';
        stepDiv.appendChild(stepLabel);

        const textarea = document.createElement('textarea');
        textarea.className = 'custom-textarea';
        textarea.disabled = true;
        textarea.value = stepContent;
        textarea.id = `imstep${index + 1}Editable`;
        stepDiv.appendChild(textarea);

        container.appendChild(stepDiv);
    });
}

function getStepDescription(stepNumber, descriptionType, proposolcontent) {
    let descriptions = {
        pas: {
            1: "STEP1：Problem or pain-問題-根據商品特徵去設想目標客群可能會遇到的痛點，以及這些問題會造成的痛苦，營造感同身受的氛圍。強調問題的急迫性以及重要性，盡量使顧客產生好奇心及疑問。",
            2: "STEP2：Agitate-激勵-透過描述問題的影響、加劇問題帶來的困擾和負面後果，加強顧客對於問題帶來的情感反應。讓顧客意識到問題的嚴重性並感受到對於我們的商品迫切的需求，加劇疑問的敘述使顧客繼續產生好奇心及疑問。",
            3: "STEP3：Solution-解決方案-呈現以我們提供產品或服務作為解決問題的方案。強調該解方如何有效地解決觀眾面臨的問題。提供方法的好處與價值。"
        },
        aida: {
            1: "STEP1：Awareness & Interest-目的為盡可能觸及更多潛在消費者，以「廣」為目標，顧客與品牌初次見面並留下不錯的印象，透過各種行銷手法繼續推播資訊，像是社群行銷等，並找到顧客的痛點與利益因素，讓顧客對商品或服務感興趣。",
            2: "STEP2：Consideration & Intent-行銷目的轉為去思考該如何讓消費者願意購買？如何提升購買意願？",
            3: "STEP3：Evaluation & Purchase 考慮-目的就是盡快促使消費者執行購買的動作，此時消費者通常心中會有「要買哪家？」的疑問，因此在這一層告訴顧客自己的優勢就非常重要",
            4: "STEP4：Loyalty & Advocacy-長期經營品牌至關重要的一步，在消費者購買完商品之後，如果可以建立會員制度，或是透過顧客關係管理（CRM)做到自動化和個人化行銷，並致力於提升商品與服務體驗，就可以大大提升將初次消費者變成忠誠顧客的機會"
        }
    };

    if (descriptions[descriptionType]) {
        return descriptions[descriptionType][stepNumber] || `STEP${stepNumber}`;
    } else {
        return proposolcontent || `STEP${stepNumber}`;
    }
}



var imstepEditable = document.getElementById('imstepEditable');

// 如果localStorage有保存的內容，則恢復
//if (localStorage.getItem('editText')) {
///    imstepEditable.value = localStorage.getItem('editText');
//}

// 當imstepEditable內容有變化時，保存到localStorage
//imstepEditable.addEventListener('input', function() {
//    localStorage.setItem('editText', imstepEditable.value);
//});


save = document.getElementById('save');
save.onclick = function(){
    var fileName = document.getElementById('fileName').value;
    var imdeadline = document.getElementById('imdeadline').value;

    if (!confirm("Are you sure you want to save?")){
        alert("Canceled!");
    }else{
        fetch('/saving_editable', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                task_id: taskId,
                fileName: fileName,
                imdeadline: imdeadline
             })
        })
        .then(response => response.json())
        .then(data => {
            if(data.status === "success") {
                alert("Data saved successfully!");
                window.location.href = "/";  // Redirect to the login_homepage
            } else {
                alert("Error saving data: " + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert("An error occurred while saving data.");
        })
    }
}




var goOnNextPage = document.getElementById('goOnNextPage');
goOnNextPage.onclick = function(){
    if (confirm('此頁編輯完成後，將送進法遵Paralegal，確定編輯完成嗎？')) {

        var stepValues = []; // 存储每个步骤的值的数组

        // 循环遍历每个步骤的textarea
        for (var i = 1; i <= 4; i++) { // 假设有4个步骤
            var textareaId = `imstep${i}Editable`;
            var textarea = document.getElementById(textareaId);
            if (textarea) {
                var stepValue = textarea.value;
                stepValues.push(stepValue);
            }
        }

        // 现在stepValues数组包含了每个步骤的值
        var fileName = document.getElementById("fileName").value || "output";

        localStorage.setItem('tempFileName', fileName + ".txt");
        localStorage.setItem('tempFileContent', stepValues.join('\n\n'));

        var blob = new Blob([stepValues.join('\n\n')], { type: "text/plain;charset=utf-8" });

        //var text = document.getElementById("imstepEditable").value;
        //var fileName = document.getElementById("fileName").value || "output"; // 如果用戶未輸入檔名，則預設為'output'
        

        // Store the file content and name in localStorage
        //localStorage.setItem('tempFileName', fileName + ".txt");
        //localStorage.setItem('tempFileContent', text);

        
        //var blob = new Blob([text], { type: "text/plain;charset=utf-8" });
        var a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = fileName + ".txt"; // 添加.txt副檔名
        a.click();
        window.location.href = 'checklist_index.html'
    }
}

var product_edit = document.getElementById('product_edit');
product_edit.onclick = function(){
    window.location.assign ('marketing_home.html?') ;
}


