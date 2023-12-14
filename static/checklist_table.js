var result_text = localStorage.getItem('imdic_p4_data');
var text_Obj = JSON.parse(result_text);

// 获取所有的题目行
var rows = document.querySelectorAll('tr');

// 遍历所有题目行
rows.forEach(function(row) {
    if (row.cells.length < 2) {
        // 如果行中不足两个单元格，跳过此行
        return;
    }

    // 获取该行的第一个单元格的内容
    var questionContent = row.cells[0].textContent.trim();

    // 查找该题目是否在本地存储的数据中
    var found = text_Obj.find(function(item) {
        // 使用 includes() 方法进行部分匹配
        return item[0].includes(questionContent) || questionContent.includes(item[0]);
    });

    // 获取第二个单元格
    var targetCell = row.cells[1];

    if (found) {
        // 如果题目在本地存储的数据中
        targetCell.classList.add('target-column');
        targetCell.classList.remove('center_box');
        var htmlText = found[1].replace(/\n/g, "<br>字詞: ").replace(/\n/g, "<br>原因: ");
        targetCell.innerHTML = "<span class='filled-checkbox'></span>" + htmlText;
    } else {
        // 如果题目不在本地存储的数据中
        targetCell.classList.add('center_box');
        targetCell.classList.remove('target-column');
    }
});