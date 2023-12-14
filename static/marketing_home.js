// 當頁面1加載時，自動調用此函數
window.onload = function() {
    var taskId = localStorage.getItem('task');
    loadPreviousData(taskId);
};


//🠗🠗🠗做開啟選單動畫🠗🠗🠗
$(document).ready(function () {
    //🠗🠗🠗以ul li包子選單🠗🠗🠗
    $(".cart>li>a").click(function (event) {
      event.preventDefault();
      $(this).toggleClass("active");
      $(this).siblings("ul").slideToggle(1500);
    });
});


//🠗🠗🠗將選取的下拉式選單選項以加入且不刪除的方式新增至producttypetext欄位🠗🠗🠗
//🠗🠗🠗產品類型🠗🠗🠗
var producttypetext = document.getElementById('producttypetext');
productType.addEventListener('change', function() {
    var selectedOptions = productType.selectedOptions;
    for (var i = 0; i < selectedOptions.length; i++) {
        var selectedLabel = selectedOptions[i].textContent;
        if (!producttypetext.value.includes(selectedLabel)) {
            producttypetext.value += selectedLabel + ';';
        }
    }
})

//做radiobtn選取處理
function setRadioButtonValue(name, value) {
    let radios = document.getElementsByName(name);
    for (let i = 0; i < radios.length; i++) {
        if (radios[i].value == value) {
            radios[i].checked = true;
            break;
        }
    }
}


//這邊是給從"產出畫面"重新導向回此頁做資料重新抓
function loadPreviousData(taskId) {
    fetch('/get_previous_data',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            taskId: taskId
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {

            var imtext = data.audience.otherFeature;
            console.log(data.audience.otherFeature);
            // 正则表达式，用来匹配每部分内容
            var featureRegex = /顯著特徵：(.*?)。主要支出項目或服務清單：/;
            var mainCheckRegex = /主要支出項目或服務清單：(.*?)。關鍵字：/;
            var keywordsRegex = /關鍵字：(.*)/;

            // 使用 match() 方法提取内容
            var featuresMatch = imtext.match(featureRegex);
            var mainCheckMatch = imtext.match(mainCheckRegex);
            var keywordsMatch = imtext.match(keywordsRegex);

            // 提取匹配的组（即括号中的内容）
            var features = featuresMatch ? featuresMatch[1] : '';
            var mainCheck = mainCheckMatch ? mainCheckMatch[1] : '';
            var keywords = keywordsMatch ? keywordsMatch[1] : '';

            // 填入 audience 資料
            document.getElementById('targetAudience').value = data.audience.targetAudience;
            document.getElementById('age1').value = data.audience.age1;
            document.getElementById('age2').value = data.audience.age2;
            document.getElementById('salary1').value = data.audience.salary1;
            document.getElementById('salary2').value = data.audience.salary2;
            setRadioButtonValue('gender', data.audience.gender);
            setRadioButtonValue('marriage', data.audience.marriage);
            setRadioButtonValue('childinchild', data.audience.child);
            //document.getElementById('gender').value = data.audience.gender;
            //document.getElementById('marriage').value = data.audience.marriage;
            //document.getElementById('childinchild').value = data.audience.child;
            document.getElementById('spaceTime').value = data.audience.spaceTime;
            document.getElementById('riskOverwhelming').value = data.audience.riskOverwhelming;
            document.getElementById('socialParticipant').value = data.audience.socialParticipate;
            //document.getElementById('otherFeature').value = data.audience.otherFeature;
            document.getElementById('otherFeature').value = features;
            document.getElementById('maincheck').value = mainCheck;
            document.getElementById('audiencekey').value = keywords;

            // 填入 product 資料
            document.getElementById('productName').value = data.product.productName;
            document.getElementById('producttypetext').value = data.product.productType;
            document.getElementById('productFeature').value = data.product.productFeature;
            document.getElementById('productImage').value = data.product.productImage;
            document.getElementById('productDiscount').value = data.product.discount;
            document.getElementById('activityMethod').value = data.product.activityMethod;
            document.getElementById('productAdvantage').value = data.product.advantage;
            document.getElementById('productDisadvantage').value = data.product.disadvantage;
            document.getElementById('productStory').value = data.product.productStory;
            document.getElementById('deadline').value = data.product.productDeadline;
            document.getElementById('afterservice').value = data.product.afterService;
            document.getElementById('productPurchase').value = data.product.howToPurchase;
            document.getElementById('purchaseRule').value = data.product.purchaseCondition;
            document.getElementById('numlimit').value = data.product.numLimit;
        }
    })
}


//儲存客群temp
document.getElementById('btnSaveAudience').addEventListener('click', function() {
    
    let data = extractAudienceData(); // 提取客群數據
    saveDataToServer('/path/to/save/audience', data); // 使用fetch API保存客群數據
})

//儲存產品temp
document.getElementById('btnSaveProducts').addEventListener('click', function() {
    
    let data = extractProductData();// 提取產品數據
    saveDataToServer('/path/to/save/product', data);// 使用fetch API保存產品數據
})


//抓客群資料
function extractAudienceData() {
    //🠗🠗🠗客群🠗🠗🠗
    var targetAudience = document.getElementById('targetAudience').value; //目標客群
    var age1 = document.getElementById('age1').value; //年齡1
    var age2 = document.getElementById('age2').value; //年齡2
    var salary1 = document.getElementById('salary1').value; //薪水1
    var salary2 = document.getElementById('salary2').value; //薪水2
    var selectedGender = document.querySelector('input[name="gender"]:checked'); //性別
    var gender = selectedGender ? selectedGender.nextElementSibling.textContent : '';
    var selectedMarriage = document.querySelector('input[name="marriage"]:checked'); //婚姻
    var marriage = selectedMarriage ? selectedMarriage.nextElementSibling.textContent : '';
    var selectedChild = document.querySelector('input[name="child"]:checked'); //小孩
    var childinchild = selectedChild ? selectedChild.nextElementSibling.textContent : '';
    var spaceTime = document.getElementById('spaceTime').value; //空間時間運用
    var riskOverwhelming = document.getElementById("riskOverwhelming").value; //理財風險承受度
    var socialParticipant = document.getElementById("socialParticipant").value; //社交媒體參與度
    var otherFeature = document.getElementById('otherFeature').value;//其他客群描述
    var maincheck = document.getElementById('maincheck').value;//主要支出項目清單或服務項目
    var audiencekey = document.getElementById('audiencekey').value;//客群關鍵字

    return {
        targetAudience: targetAudience,
        age1:age1,
        age2:age2,
        salary1:salary1,
        salary2:salary2,
        gender: gender,
        marriage: marriage,
        child: childinchild,
        spaceTime: spaceTime,
        riskOverwhelming: riskOverwhelming,
        socialParticipate: socialParticipant,
        otherFeature: '顯著特徵：' + otherFeature + '。主要支出項目或服務清單：'+ maincheck + '。關鍵字：'+ audiencekey
    };
}


//抓產品資料
function extractProductData() {
    //🠗🠗🠗產品🠗🠗🠗
    var productName = document.getElementById('productName').value; //產品名稱
    var producttypetext = document.getElementById('producttypetext').value; //產品類型
    var productFeature = document.getElementById('productFeature').value; //產品特性
    var productImage = document.getElementById('productImage').value; //產品形象
    var productDiscount = document.getElementById('productDiscount').value; //優惠方案
    var activityMethod = document.getElementById('activityMethod').value; //活動辦法
    var productAdvantage = document.getElementById('productAdvantage').value; //優勢
    var productDisadvantage = document.getElementById('productDisadvantage').value; //劣勢
    var productStory = document.getElementById('productStory').value; //產品故事
    var deadline = document.getElementById('deadline').value; //活動截止
    var afterservice = document.getElementById('afterservice').value; //售後服務
    var productPurchase = document.getElementById('productPurchase').value; //購買方式
    var purchaseRule = document.getElementById('purchaseRule').value; //購買條件
    var numlimit = document.getElementById('numlimit').value; //數量限制

    return {
        productName: productName,
        productType: producttypetext,
        productFeature: productFeature,
        productImage: productImage,
        productDiscount: productDiscount,
        activityMethod: activityMethod,
        productAdvantage: productAdvantage,
        productDisadvantage: productDisadvantage,
        productStory: productStory,
        deadline: deadline,
        afterservice: afterservice,
        productPurchase: productPurchase,
        purchaseRule: purchaseRule,
        numlimit: numlimit
    };
}


//儲存Temp的呼叫路由
function saveDataToServer(url, data) {
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        alert('您已保存資料!');
        console.log(data);
    })
    .catch(error => {
        alert('保存失敗!')
        console.error('Error:', error);
    })
}


//🠗🠗🠗上傳投資警語及讀檔🠗🠗🠗
function onLoadFile() {
    var getfile = document.getElementById('fileUpload');

        //🠗🠗🠗利用檔案陣列長度與檔案類型，來判斷是否有上傳檔案且類型為文字檔🠗🠗🠗
    if(getfile.files.length != 0 && getfile.files[0].type.match(/text.*/)) {
        var reader = new FileReader();
        reader.onload = function(e) {
            localStorage.setItem('uploadedFileContent', e.target.result);
        };
        reader.onerror = function(e) {
            console.log("無法讀取文字檔!");
        }
        //🠗🠗🠗讀取文字檔案，第二個參數預設是UTF-8🠗🠗🠗
        reader.readAsText(getfile.files[0], "UTF-8");
    }else {
        console.log("上傳的檔案非文字檔!");
    }
}


//🠗🠗🠗抓資料至下一頁🠗🠗🠗
btnSubmitAll.onclick = async function() {
    const audienceData = extractAudienceData();
    const productData = extractProductData();
    let existingTaskId = localStorage.getItem('task');

    const currentDate = new Date();
    // 考慮台灣的時區 (UTC+8)
    const taiwanDate = new Date(currentDate.getTime() + 8 * 60 * 60 * 1000);
    const formattedDate = taiwanDate.toISOString().split('.')[0].replace('T', ' ').slice(0, -3);

    const { 
        targetAudience, 
        age1, 
        age2, 
        salary1, 
        salary2, 
        gender, 
        marriage, 
        childinchild, 
        spaceTime, 
        riskOverwhelming, 
        socialParticipant,
        otherFeature } = audienceData;
    const child = childinchild === "是" ? "有小孩" : "沒有小孩";


    const { 
        productType, 
        productName, 
        productFeature, 
        productImage, 
        activityMethod, 
        productDiscount, 
        productAdvantage, 
        productDisadvantage, 
        productStory, 
        deadline, 
        afterservice, 
        productPurchase, 
        purchaseRule, 
        numlimit } = productData;

   

    if (!targetAudience || !productType || !productName || !productFeature || !productImage || !productDiscount || !activityMethod) {
      
        alert('請確實填寫欄位！');
        return;
    } else {
        var productInformationStr = 
        `
        客群資訊如下：
        目標客群：${targetAudience}
        年齡：${age1}歲至${age2}歲
        年收區間：${salary1}萬至${salary2}萬
        性別：${gender}
        婚姻狀態：${marriage}
        小孩：${child}
        空間時間運用：${spaceTime}
        理財風險承受度：${riskOverwhelming}
        社交媒體參與度：${socialParticipant}
        特徵描述：${otherFeature}

        產品資訊如下：
        產品類型：${productType}
        產品名稱：${productName}
        產品特性：${productFeature}
        產品形象：
        活動辦法(理念)：${activityMethod}
        優惠方案：${productDiscount}
        產品異於同質性優勢：${productAdvantage}
        產品異於同質性劣勢：${productDisadvantage}
        產品故事性：${productStory}
        活動截止日：${deadline}
        售後服務內容：${afterservice}
        如何購買：${productPurchase}
        購買條件：${purchaseRule}
        數量限制：${numlimit}`;

        localStorage.setItem('productInformation', productInformationStr);

        //儲存產品客群資料呼叫路由
        try {
            let response = await fetch('/storeData', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    audienceData: audienceData,
                    productData: productData,
                    task_id: existingTaskId,
                    date: formattedDate
                })
            });

            let data = await response.json();

            if(data.status === 'success') {
                if (confirm('確定填寫完畢？')) {
                    localStorage.setItem('task', data.task_id);
                    window.location.assign(`./marketing_style.html?task_id=${data.task_id}`);
                }else {
                    alert('您已取消操作。');
                }
            }else {
                toastr.error(data.message);
            }
        }catch (error) {
            console.error('Error storing data:', error);
        }
    }
}


//做checkbtn點選處理，只能擇一(好像沒有用到(?))
function bindCheckboxListeners(checkboxClass) {
    let checkboxes = document.querySelectorAll(checkboxClass);
    checkboxes.forEach(function(checkbox) {
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                checkboxes.forEach(function(innerCheckbox) {
                    if (innerCheckbox !== checkbox) {
                        innerCheckbox.checked = false;
                    }
                })
            }
        })
    });
}


//🠗🠗🠗存or匯入TEMP🠗🠗🠗
var btninputAudience = document.getElementById('btninputAudience');
var btninputProducts = document.getElementById('btninputProducts');
//🠗🠗🠗Get the modal🠗🠗🠗
var AudienceForm = document.getElementById('AudienceForm');
var ProductsForm = document.getElementById('ProductsForm');
//🠗🠗🠗Get the <span> element that closes the modal🠗🠗🠗
var span = document.getElementsByClassName("close");

//🠗🠗🠗匯入客群🠗🠗🠗
// 按下按鈕時，顯示模態視窗並更新表格
btninputAudience.onclick = function(){
    AudienceForm.style.display = "block";
    updateAudienceTable(); // 更新表格
};

// 用於從後端獲取客群資料並更新表格的函數
function updateAudienceTable() {
    let audienceType = document.getElementById("audienceTypeSelect").value;
    let url = audienceType === 'sample' ? '/showAudiences?showSample=true' : '/showAudiences';

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(response => response.json())
    .then(data => {
        var audienceTable = document.getElementById("audienceTable");
        
        // 清空表格現有內容
        while(audienceTable.rows.length > 1) {
            audienceTable.deleteRow(1);
        }

        // 遍歷每個子陣列
        data.data.forEach(subArray => {
            let newRow = audienceTable.insertRow();
            newRow.style.backgroundColor = 'white';
            newRow.style.color = '#323F6B';

            let cell1 = newRow.insertCell();
            let cell2 = newRow.insertCell();
            let cell3 = newRow.insertCell();
            let cell4 = newRow.insertCell();
            let cell5 = newRow.insertCell();
            
            cell1.innerHTML = '<input type="checkbox" name="checkaudience" class="audience-checkbox-class">';
            cell2.innerHTML = subArray[0];  // targetAudience
            cell3.innerHTML = subArray[1];  // otherDiscription
            cell4.innerHTML = subArray[2];  // spaceTime

            // 根據選擇的客群類型添加或移除刪除按鈕
            if (audienceType === 'user') {
                cell5.innerHTML = '<span class="click" onclick="deleteAudienceRow(this)">刪除</span>';
            } else {
                cell5.innerHTML = '';
            }

            bindCheckboxListeners('.audience-checkbox-class');
        });
    })
    .catch(error => {
        console.error('Error fetching audience data:', error);
    });
}

// 當下拉選單的值變化時，更新表格
document.getElementById("audienceTypeSelect").addEventListener('change', updateAudienceTable);


//選擇"匯入temp"開啟modal
btninputProducts.onclick = function(){
    ProductsForm.style.display = "block";

    // 當開啟 modal 時，從後端獲取客群資料
    fetch('/showProducts', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(response => response.json())
    .then(data => {
         //🠗🠗🠗獲取表格🠗🠗🠗
         var productsTable = document.getElementById("productsTable");

         // 首先清空表格的現有內容，略過標頭
        while(productsTable.rows.length > 1) {
            productsTable.deleteRow(1);
        }

        // 遍歷每個子陣列
        data.data.forEach(subArray => {
            let newRow = productsTable.insertRow();
            newRow.style.backgroundColor = 'white';
            newRow.style.color = '#323F6B';

            let cell1 = newRow.insertCell();
            let cell2 = newRow.insertCell();
            let cell3 = newRow.insertCell();
            let cell4 = newRow.insertCell();
            let cell5 = newRow.insertCell();

            cell1.innerHTML = '<input type="checkbox" name="checkproduct" class="product-checkbox-class">';
            cell2.innerHTML = subArray[0];  // productName
            cell3.innerHTML = subArray[1];  // producttypetext
            cell4.innerHTML = subArray[2];  // productImage
            cell5.innerHTML = '<span class="click" onclick="deleteProductRow(this)">刪除</span>';

            bindCheckboxListeners('.product-checkbox-class');
        });
    })
    .catch(error => {
        console.error('Error fetching audience data:', error);
    });
}




//🠗🠗🠗When the user clicks on <span> (x), close the modal🠗🠗🠗
for (let i = 0; i < span.length; i++) {
    span[i].onclick = function() {
      AudienceForm.style.display = "none";
      ProductsForm.style.display = "none";
    }
}

//選擇要匯入的temp
var inputAudience = document.getElementById('inputAudience');
inputAudience.onclick = function(){
    let selectedCheckbox = document.querySelector('input[name="checkaudience"]:checked');
    if (selectedCheckbox) {
        let row = selectedCheckbox.parentElement.parentElement;
        let audienceData = {
            targetAudience: row.cells[1].innerText,
            otherFeature: row.cells[2].innerText,
            spaceTime: row.cells[3].innerText
        }
        fetchFullAudienceData(audienceData);
    }
}

//將所有選重的客群資訊貼至欄位
function fetchFullAudienceData(data) {
    fetch('/getFullAudienceRecord', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)

    })
    .then(response => response.json())
    .then(data => {
        console.log(data);  // 加入這行
        if (data.status === "success") {
            let record = data.data;
            console.log(record)

            //做特徵正則處理
            var imtext = record[12];

            // 正则表达式，用来匹配每部分内容
            var featureRegex = /顯著特徵：(.*?)。主要支出項目或服務清單：/;
            var mainCheckRegex = /主要支出項目或服務清單：(.*?)。關鍵字：/;
            var keywordsRegex = /關鍵字：(.*)/;

            // 使用 match() 方法提取内容
            var featuresMatch = imtext.match(featureRegex);
            var mainCheckMatch = imtext.match(mainCheckRegex);
            var keywordsMatch = imtext.match(keywordsRegex);

            // 提取匹配的组（即括号中的内容）
            var features = featuresMatch ? featuresMatch[1] : '';
            var mainCheck = mainCheckMatch ? mainCheckMatch[1] : '';
            var keywords = keywordsMatch ? keywordsMatch[1] : '';
            
            // 將返回的完整記錄填充到對應的input欄位中
            document.getElementById('targetAudience').value = record[1];
            document.getElementById('age1').value = record[2];
            document.getElementById('age2').value = record[3];
            document.getElementById('salary1').value = record[4];
            document.getElementById('salary2').value = record[5];
            document.getElementById('spaceTime').value = record[9];
            document.getElementById('riskOverwhelming').value = record[10];
            document.getElementById('socialParticipant').value = record[11];
            document.getElementById('otherFeature').value = features;
            document.getElementById('maincheck').value = mainCheck;
            document.getElementById('audiencekey').value = keywords;
            let genderEls = {
                '不限': document.getElementById('whateverForGender'),
                '男生': document.getElementById('male'),
                '女生': document.getElementById('female')
            };
            let merriageEls = {
                '不限': document.getElementById('whateverForMarriage'),
                '已婚': document.getElementById('married'),
                '未婚': document.getElementById('single')
            };
            let childEls = {
                '不限': document.getElementById('whateverForChild'),
                '是': document.getElementById('yesForChild'),
                '否': document.getElementById('noForChild')
            };
            genderEls[record[6]].checked = true;
            merriageEls[record[7]].checked = true;
            childEls[record[8]].checked = true;

            // 關閉模態視窗
            var modal = document.getElementById('AudienceForm');
            modal.style.display = 'none';
        }
    })
    .catch(error => {
        console.error('Error fetching full audience record:', error);
    });
}

//刪除客群
function deleteAudienceRow(clickedSpan) {
    let row = clickedSpan.parentElement.parentElement;
    let audienceData = {
        targetAudience: row.cells[1].innerText,
        otherFeature: row.cells[2].innerText,
        spaceTime: row.cells[3].innerText
    } 
    
    if (confirm("確定要刪除這筆資料嗎？")) {
        fetch('/deleteAudience', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(audienceData)
        })
        .then(response => response.json())
        .then(data => {
            if(data.status === 'success') {
                row.remove();
            } else {
                alert('刪除失敗！');
            }
        })
        .catch(error => {
            console.error('Error deleting product:', error);
        });
    }
}

//選擇要匯入的temp
var inputProducts  = document.getElementById('inputProducts');
inputProducts.onclick = function(){
    let selectedCheckbox = document.querySelector('input[name="checkproduct"]:checked');
    if (selectedCheckbox) {
        let row = selectedCheckbox.parentElement.parentElement;
        let productData = {
            productName: row.cells[1].innerText,
            productType: row.cells[2].innerText,
            productImage: row.cells[3].innerText
        }
        fetchFullProductData(productData);
    }
}

//將所有選重的產品資訊貼至欄位
function fetchFullProductData(data){
    fetch('/getFullProductRecord', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data1 => {
        console.log(data1);  // 加入這行
        if (data1.status === "success") {
            let record = data1.productdata;
            console.log(record)

            // 將返回的完整記錄填充到對應的input欄位中
            document.getElementById('productName').value = record[1];
            document.getElementById('producttypetext').value = record[2];
            document.getElementById('productFeature').value = record[3];
            document.getElementById('productImage').value = record[4];
            document.getElementById('productDiscount').value = record[5];
            document.getElementById('activityMethod').value = record[6];
            document.getElementById('productAdvantage').value = record[7];
            document.getElementById('productDisadvantage').value = record[8];
            document.getElementById('productStory').value = record[9];
            document.getElementById('deadline').value = record[10];
            document.getElementById('afterservice').value = record[11];
            document.getElementById('productPurchase').value = record[12];
            document.getElementById('purchaseRule').value = record[13];
            document.getElementById('numlimit').value = record[14] || '';

            // 關閉模態視窗
            var modal = document.getElementById('ProductsForm');
            modal.style.display = 'none';
        }
    })
    .catch(error => {
        console.error('Error fetching full product record:', error);
    });
}

//刪除產品
function deleteProductRow(clickedSpan) {
    let row = clickedSpan.parentElement.parentElement;
    let productData = {
        productName: row.cells[1].innerText,
        productType: row.cells[2].innerText,
        productImage: row.cells[3].innerText
    }

    if (confirm("確定要刪除這筆資料嗎？")) {
        fetch('/deleteProduct', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(productData)
        })
        .then(response => response.json())
        .then(data => {
            if(data.status === 'success') {
                row.remove();
            } else {
                alert('刪除失敗！');
            }
        })
        .catch(error => {
            console.error('Error deleting product:', error);
        });
    }
}
