let resultData = JSON.parse(localStorage.getItem('result123'));
let dic_Obj = resultData.retrieve_dic;

fetch('/counting_questions',{
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({data: dic_Obj})  // 将数据转换为JSON字符串
})
.then(response => {
    if (!response.ok) {
        return Promise.reject('Failed to fetch');  // 處理非 2xx 狀態碼
    }
    return response.json();  // 確保你檢查了回應
})
.then(data => {
    window.location.href = window.location.href;  // 重新加载页面
}) 
.catch(error => console.error('Error:', error));



/*
window.onload = function() {
    // 从localStorage中获取数据
    let resultData = JSON.parse(localStorage.getItem('result123'));
    let dic_Obj = resultData.retrieve_dic;
    console.log(dic_Obj);

    // 获取HTML表格元素
    let table = document.querySelector('.question-table');

    // 获取表格的第一行，以便我们可以在正确的位置插入新行
    let firstRow = table.rows[0];

    // 遍历每个类别并更新未符合和不适用的列
    for (let category in resultData) {
        // 创建一个新的表格行
        let tr = document.createElement('tr');

        // 第一列：类别名称
        let td1 = document.createElement('td');
        td1.textContent = category;
        tr.appendChild(td1);

        // 第二列：未符合的数量
        let td2 = document.createElement('td');
        td2.textContent = resultData[category]['否'];
        tr.appendChild(td2);

        // 第三列：不适用的数量
        let td3 = document.createElement('td');
        td3.textContent = resultData[category]['不適用'];
        tr.appendChild(td3);

        // 将新的表格行插入表格的第一行之后
        firstRow.parentNode.insertBefore(tr, firstRow.nextSibling);
    }
};

// 从localStorage中获取和解析数据


// 获取类别数组
//var categories = Object.keys(retrieveDic);

// 遍历所有类别并更新表格值
//for (var i = 0; i < categories.length; i++) {
//    var category = categories[i];
//    var notMet = retrieveDic[category]['否'] || 0;  // 如果值不存在，则默认为0
//    var notApplicable = retrieveDic[category]['不适用'] || 0;  // 如果值不存在，则默认为0

//    console.log('Category: ', category);
//    console.log('Not Met: ', notMet);
//    console.log('Not Applicable: ', notApplicable);
    
    // 更新表格的值
    // 假设表格行的索引与类别的索引相匹配
    //var table = document.querySelector('.question-table');
//    document.getElementById('wrong' + category).innerText = notMet;
//    document.getElementById('nofit' + category).innerText = notApplicable;

//}



/*
var result_text = localStorage.getItem('result123');
console.log(result_text)

var dic_Obj = JSON.parse(result_text);
console.log(dic_Obj)

//取出該類別 "否" & "不適用" 的數量
var dic1 = dic_Obj.retrieve_dic["一、消費法規之遵循"]
var dic2 = dic_Obj.retrieve_dic["二、行銷廣告"]
var dic3 = dic_Obj.retrieve_dic["六、法令覆核"]
var dic7 = dic_Obj.retrieve_dic["七、信託業務行銷廣告"]

var W1 = document.getElementById("wrong1");
var W2 = document.getElementById("wrong2");
var W3 = document.getElementById("wrong3");
var W4 = document.getElementById("wrong4");

W1.innerHTML = dic1["否"];
W2.innerHTML = dic2["否"];
W3.innerHTML = dic3["否"];
W4.innerHTML = dic7["否"];

var N1 = document.getElementById("nofit1");
var N2 = document.getElementById("nofit2");
var N3 = document.getElementById("nofit3");
var N4 = document.getElementById("nofit4");

N1.innerHTML = dic1["不適用"];
N2.innerHTML = dic2["不適用"];
N3.innerHTML = dic3["不適用"];
N4.innerHTML = dic7["不適用"];



var change_btn = document.getElementById('change_btn');
var detail_btn = document.getElementById('detail_btn');


/*
change_btn.onclick = function(){
    // 你可以在這裡插入你想要執行的換頁邏輯，例如跳轉到另一個URL：
    if (confirm("確定要換頁嗎?")){
        window.location.href = "table.html?";
    }else {
         alert("您已取消操作");
    }
}
*/
detail_btn.onclick = function(){
    // 你可以在這裡插入你想要執行的換頁邏輯，例如跳轉到另一個URL：
    if (confirm("確定要換頁嗎?")){
        window.location.href = "checklist_detail.html";
        console.error();
    }else {
         alert("您已取消操作");
         return;
    }
}

