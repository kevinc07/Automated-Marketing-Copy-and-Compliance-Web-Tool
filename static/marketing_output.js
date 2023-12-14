//宣告整體風格，關鍵字，文案風格，行銷框架，呈現方式
let params = new URLSearchParams(window.location.search);
let showoutputValue = params.get('showOutput');
var styleValue, keywordValue, contentstyleValue, proposolValue;


var Investment = localStorage.getItem('uploadedFileContent'); //投資警語
const task_id = localStorage.getItem('task'); //任務id
var cachedData = null; // 用於緩存從伺服器取得的資料

let user_id;
let selectedVersion;
let buttons = [];
const versionShowoutputMap = {};


async function mainFunction() {
    await fetchCustomValueData(user_id, task_id); //抓客製化風格的資訊

    
    // 先執行get_versions，抓版本用於"版本查看"
    const response = await fetch('/get_versions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            user_id: user_id,
            task_id: task_id,
            showoutput: showoutputValue
        })
    })
    const data = await response.json();
    const versions = data.versions;
    const latestVersion = data.latest_version;

    // 清空<select>元素
    const selectElement = document.getElementById('version');
    selectElement.innerHTML = '';

    if (versions && versions.length > 0) {
        // 將這些版本添加到<select>元素中
        versions.forEach(versionObj => {
            const optionElement = document.createElement('option');
            optionElement.value = versionObj.version;
            optionElement.textContent = "版本 " + versionObj.version;
            selectElement.appendChild(optionElement);
        
            versionShowoutputMap[versionObj.version] = versionObj.showoutput;
        });
    }else {
        console.warn('No versions available.');
    }
    
    // 設定<select>的值為最新版本
    selectElement.value = latestVersion;
    
    selectElement.removeEventListener('change', handleChange);
    selectElement.addEventListener('change', handleChange);
    function handleChange() {
        selectedVersion = this.value;
        showoutputValue = versionShowoutputMap[selectedVersion];

        
        fetchOutputData(selectedVersion); //針對選取的版本，獲得output的結果
    };
    
    fetchOutputData(latestVersion);
}

//先獲取使用者id，執行主程式：mainFunction()
fetch('/get-user-id')
.then(response => response.json())
.then(data => {
    user_id = data.user_id;

    mainFunction();
})

function updateURLWithShowoutputValue(showoutput) {
    const currentURL = new URL(window.location.href);
    currentURL.searchParams.set('showOutput', showoutput);
    window.history.pushState({}, '', currentURL.toString());
}


function fetchOutputData(version) {
    steps_Container.innerHTML = '';
    buttons = [];

    fetch('/get_output', {
        method: 'POST',
        headers: {
            'Content-Type':'application/json'
        },
        body: JSON.stringify({
            user_id: user_id,
            task_id: task_id,
            showoutput: showoutputValue,
            version: version
        })
    })
    .then(response => response.json())
    .then(data => {
        cachedData = data.data;

        // 確保data物件中有data屬性
        if (!data.data || !Array.isArray(data.data)) {
            console.error('Expected data.data to be an array.');
            return;
        }


        // 從第一個子陣列中取得showOutput值並更新showoutputValue
        if (Array.isArray(data.data[0]) && data.data[0].length > 20) {
            showoutputValue = data.data[0][20];
        } else {
            console.error('Unable to find "showOutput" in the data.');
            return;
        }

        const productObj = data.data;
        productObj.forEach(stepArray => {
            const step = stepArray[1]; // 從陣列中提取步驟名稱

            const stepData = {
                'Main_slogan': stepArray[4],
                'Main_list': stepArray[3],
                'Point1': stepArray[5],
                'Point_desc1': stepArray[8],
                'Point2': stepArray[6],
                'Point_desc2': stepArray[9],
                'Point3': stepArray[7],
                'Point_desc3': stepArray[10],
                'Product': stepArray[11],
                'Preferential': stepArray[12],
                'Content': stepArray[13],
                'Extra information': stepArray[14],
                'Content_1': stepArray[15],
                'Content_2': stepArray[16]
            };

            createStepButton(step, showoutputValue, stepData);
        });
        document.getElementById('GENERAL_EDM').style.display = 'none';
        document.getElementById('GENERAL_LINE').style.display = 'none';
        document.getElementById('GENERAL_MBN').style.display = 'none';

        switch (showoutputValue) {
            case 'EDM':
                document.getElementById(`GENERAL_EDM`).style.display = 'block';
                break;
            case 'LINE':
                document.getElementById(`GENERAL_LINE`).style.display = 'block';
                break;
            case 'MBN':
                document.getElementById(`GENERAL_MBN`).style.display = 'block';
                break;
        }
        if (buttons.length > 0) {
            buttons[0].click();
        }  
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });
}


async function fetchCustomValueData(user_id, task_id) {
    //先拿使用者id和任務id抓主軸/ 關鍵字/ 文案風格/ 框架

    try {
        const response = await fetch('/get_custom_value', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_id: user_id,
                task_id: task_id
            })
        })

        const data = await response.json();

        if (data && data.status === 'success' && data.data) {
            styleValue = data.data.style || "";
            keywordValue = data.data.keyword || "";
            contentstyleValue = data.data.contentStyle;
            proposolValue = data.data.proposol;
            //showOutput = data.data.showoutput;

            initProposol(proposolValue, showoutputValue);
            getContentValue();
        }else {
            console.error('Failed to get custom values:', data.message);
        }

    }catch (error) {
        console.error('Error fetching custom values:', error);
    }
}

function getContentValue() {
    //定義造句模板
    if(contentstyleValue){
        var options = getOptionsBasedOnSelection(contentstyleValue);
        options.forEach(function(option){
            var optionElement1 = document.createElement('option');
            var sentences = document.getElementById('sentences');
            optionElement1.value = option.value;
            optionElement1.textContent = option.label;
            sentences.appendChild(optionElement1);
        })
    }
    let ai6103vm03yk6 = document.getElementById('ai6103vm03yk6');
    // 確認元素存在並可以被選擇
    if(ai6103vm03yk6) {
        ai6103vm03yk6.value = showoutputValue;
    } else {
        console.log("無法找到元素 ai6103vm03yk6");
    }
    console.log("After checking contentstyleValue");

    //抓取風格，關鍵字，造句模板元素
    var style = document.getElementById('style');
    style.value = styleValue;
    var keyword = document.getElementById('keyword');
    keyword.value = keywordValue;
}


var edm_mainview = document.getElementById("edm_mainview");
var edm_mainlist = document.getElementById("edm_mainlist");
var edm_point1 = document.getElementById("edm_point1");
var edm_disc1 = document.getElementById("edm_disc1");
var edm_point2 = document.getElementById("edm_point2");
var edm_disc2 = document.getElementById("edm_disc2");
var edm_point3 = document.getElementById("edm_point3");
var edm_disc3 = document.getElementById("edm_disc3");
var edm_production = document.getElementById("edm_production");
var edm_preferential = document.getElementById("edm_discount");
var edm_show = document.getElementById("edm_show");

var line_mainview = document.getElementById("line_mainview");
var line_content1 = document.getElementById("line_content1");
var line_content2 = document.getElementById("line_content2");
var line_mainpoint = document.getElementById("line_mainpoint");
var line_extra = document.getElementById("line_extra");

var mbn_mainview = document.getElementById("mbn_mainview");
var mbn_content = document.getElementById("mbn_content");
var mbn_mainlist = document.getElementById("mbn_mainlist");
var mbn_extra = document.getElementById("mbn_extra");


let steps_Container = document.getElementById('steps_Container');
document.getElementById('GENERAL_EDM').style.display = 'none';
document.getElementById('GENERAL_LINE').style.display = 'none';
document.getElementById('GENERAL_MBN').style.display = 'none';




// 先前定義的框架
const predefinedFrameworks = {
    pas: [
        `Problem or pain-問題`,
        `Agitate-激勵`,
        `Solution-解決方案`
    ],
    aida: [
        `Awareness & Interest吸引注意`,
        `Consideration & Intent引起興趣`,
        `Evaluation & Purchase 考慮`,
        `Loyalty & Advocacy開始行動`
    ]
};


//處理行銷框架
const otherFrameworkName = localStorage.getItem('otherFrameworkName');
//const otherFrameworkContent = localStorage.getItem('otherFrameworkContent');
const otherFrameworkContent = JSON.parse(localStorage.getItem('otherFrameworkContent'));


if (otherFrameworkContent && Array.isArray(otherFrameworkContent)) {
    if (predefinedFrameworks.hasOwnProperty(otherFrameworkName)) {
        console.warn(`${otherFrameworkName} already exists in predefinedFrameworks. Skipping...`);
    } else {
        predefinedFrameworks[otherFrameworkName] = otherFrameworkContent;
    }
}


function initProposol(proposolValue, showOutput){
    //抓取行銷框架資訊
    // Main logic
    const retrievedSteps  = predefinedFrameworks[proposolValue];
    const steps = (typeof retrievedSteps === 'string') ? [retrievedSteps] : retrievedSteps;
    if (steps) {
        for (let i = 0; i < steps.length; i++) {
            console.log(steps[i]); 
            console.log(i);
        }
    }else {
        console.error(`No framework found for ${proposolValue}`);
    }
}

// 定義一個物件來儲存不同的更新策略
const updateStrategies = {
    'EDM': updateEDMContent,
    'LINE': updateLINEContent,
    'MBN': updateMBNContent
};

let currentStep = null; // 當前步驟
//stepIndex：步驟的序號;
//actionType： "EDM"、"LINE" 或 "MBN";
//showOutput："aida" 或 "pas"
function createStepButton(step, actionType, stepData) { 

    if (typeof step !== 'string') {
        console.error('The step parameter is not a string.');
        return;
    }
    let originalColor = "#FFFFFF";
    let color = "#323F6B";
    let stepBtn = document.createElement('button');
    stepBtn.textContent = step;
    // 從 step 中提取出索引
    const stepIndex = step.replace('Step ', '');
    stepBtn.value = stepIndex; // 按鈕儲存的值

    stepBtn.classList.add('stepsBtn'); // 添加預定義的 CSS class
    // 使用stepIndex動態設定按鈕的ID
    stepBtn.id = `step${stepIndex}ButtonId`;
    
    steps_Container.appendChild(stepBtn);
    buttons.push(stepBtn); // 把新創建的按鈕添加到按鈕列表中
    
    stepBtn.addEventListener('click', function () {
        
        resetButtonStyles(buttons, originalColor, color); // Reset the background color for all buttons
        this.style.backgroundColor = "#6a99f7";
        this.style.color = "#FFFFFF";
        
        const currentStepData = cachedData.find(item => item[1] === step);
        if (!currentStepData) {
            console.error('Data for the current step not found.');
            return;
        }

        const updatedStepData = {
            'Main_list': currentStepData[3],
            'Main_slogan': currentStepData[4],
            'Point1': currentStepData[5],
            'Point2': currentStepData[6],
            'Point3': currentStepData[7],
            'Point_desc1': currentStepData[8],
            'Point_desc2': currentStepData[9],
            'Point_desc3': currentStepData[10],
            'Preferential': currentStepData[11],
            'Product': currentStepData[12],
            'Extra_information': currentStepData[13],
            'Content_1': currentStepData[14],
            'Content_2': currentStepData[15],
            'Content': currentStepData[16]
        };

        currentStep = stepIndex; // 紀錄當前步驟(用在編輯)

        updateStepContent(stepIndex, proposolValue); // 更新步驟內容

        const updateFunction = updateStrategies[actionType];
        if (updateFunction) {
            updateFunction(stepIndex, proposolValue, updatedStepData);
        }else{
            console.log('Unknown action type');
        }
    });
}

function updateStepContent(stepIndex, proposolValue) {
    const stepContent = predefinedFrameworks[proposolValue][stepIndex - 1];
    if (stepContent) {
        let showStep = document.getElementById('showStep');
        showStep.textContent = stepContent;
    } else {
        console.warn(`No content found for ${proposolValue}_step${stepIndex}`);
    }
}

function resetButtonStyles(buttons, bgColor, textColor) {
    for (let btn of buttons) {
        btn.style.backgroundColor = bgColor;
        btn.style.color = textColor;
    }
}


function updateEDMContent(actionType, proposolValue, stepData) {
    
    // 更新DOM元素
    edm_mainview.textContent = stepData['Main_slogan'];
    var parts = stepData['Main_list'].split(/(\d+\.)/);
    edm_mainlist.textContent = '';
    for(let i=0; i<parts.length; i++){
        if (parts[i].match(/\d+\./)) {
            edm_mainlist.innerHTML += '<br>' + parts[i];
        } else {
            edm_mainlist.innerHTML += parts[i];
        }
    }
    edm_point1.textContent = stepData['Point1'];
    edm_disc1.textContent = stepData['Point_desc1'];
    edm_point2.textContent = stepData['Point2'];
    edm_disc2.textContent = stepData['Point_desc2'];
    edm_point3.textContent = stepData['Point3'];
    edm_disc3.textContent = stepData['Point_desc3'];
    edm_production.textContent = stepData['Product'];
    edm_preferential.textContent = stepData['Preferential'];
    edm_show.textContent = Investment; 
}

function updateLINEContent(actionType, proposolValue, stepData) {
    line_mainview.textContent = stepData['Main_slogan'];
    line_content1.textContent = stepData['Content_1'];
    line_content2.textContent = stepData['Content_2'];
    line_mainpoint.textContent = stepData['Main_list'];
    line_extra.textContent = stepData['Extra_information'];
}


function updateMBNContent(actionType, proposolValue, stepData) {
    mbn_mainview.textContent = stepData['Main_slogan'];
    mbn_content.textContent = stepData['Content'];
    mbn_mainlist.textContent = stepData['Main_list'];
    mbn_extra.textContent = stepData['Extra_information'];
}

function getCurrentSection() {
    let sections = ['GENERAL_EDM', 'GENERAL_LINE', 'GENERAL_MBN'];
    for (let section of sections) {
        let element = document.getElementById(section);
        if (element.style.display !== 'none') {
            return element.getAttribute('data-section');
        }
    }
    return null;
}

// 所有你希望能被編輯的元素，這邊假設它們都有class "editable"
const editableElements = document.querySelectorAll('.editable');

document.getElementById('editModeBtn').addEventListener('click', function() {
    
    // 啟動編輯模式
    editableElements.forEach(el => {
        el.setAttribute('contenteditable', 'true');
    });
    
    this.style.display = 'none';  // 隱藏編輯按鈕
    document.getElementById('saveChangesBtn').style.display = 'inline-block';  // 顯示儲存按鈕
});

document.getElementById('saveChangesBtn').addEventListener('click', function() {



    let currentSection = getCurrentSection();
    if (!currentSection) {
        console.error("Couldn't determine the current section.");
        return;
    }

    const selectElement = document.getElementById('version');
    selectedVersion = selectElement.value;  // 這裡獲取所選版本

    let updatedData = {
        section: currentSection,
        step: currentStep,
        task_id: task_id,
        timess: selectedVersion, 
        data: {}
    };

    // 儲存編輯後的資訊
    editableElements.forEach(el => {
        updatedData.data[el.id] = el.textContent;
    });
    
    // 關閉編輯模式
    editableElements.forEach(el => {
        el.removeAttribute('contenteditable');
    });
    
    this.style.display = 'none';  // 隱藏儲存按鈕
    document.getElementById('editModeBtn').style.display = 'inline-block';  // 顯示編輯按鈕

    saveEditDatabase(updatedData);
});

function saveEditDatabase(data) {
    fetch('/update_outputdata', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(response => {
        console.log(response)
        if (response.status === "success") {
            if (response.data && response.data.step) {
                ooutput = showoutputValue.toLowerCase();
                const prefix = ooutput + "_";
                const stepToUpdate = cachedData.find(item => item[1] === "Step " + data.step);
                if (stepToUpdate) {
                    // 更新子陣列的值
                    stepToUpdate[3] = data.data[prefix + "mainlist"];
                    stepToUpdate[4] = data.data[prefix + "mainview"];
                    stepToUpdate[5] = data.data[prefix + "point1"];
                    stepToUpdate[6] = data.data[prefix + "point2"];
                    stepToUpdate[7] = data.data[prefix + "point3"];
                    stepToUpdate[8] = data.data[prefix + "disc1"];
                    stepToUpdate[9] = data.data[prefix + "disc2"];
                    stepToUpdate[10] = data.data[prefix + "disc3"];
                    stepToUpdate[11] = data.data[prefix + "discount"];
                    stepToUpdate[12] = data.data[prefix + "production"];
                    stepToUpdate[13] = data.data[prefix + "extra"];
                    stepToUpdate[14] = data.data[prefix + "content1"];
                    stepToUpdate[15] = data.data[prefix + "content2"];
                    stepToUpdate[16] = data.data[prefix + "content"];
                }
            

                // Check if the step was found
                if (stepToUpdate) {
                    const updatedDataIndex = cachedData.indexOf(stepToUpdate);
                    cachedData[updatedDataIndex] = { ...stepToUpdate, ...response.data.data };

                    // 從cachedData中取得當前步驟的資料
                    const currentStepData = cachedData.find(item => item[1] === String(response.data.step));
                    if (!currentStepData) {
                        console.error('Data for the current step not found.');
                        return;
                    }

                    // 定義updatedStepData
                    const updatedStepData = {
                        'Main_list': currentStepData[3],
                        'Main_slogan': currentStepData[4],
                        'Point1': currentStepData[5],
                        'Point2': currentStepData[6],
                        'Point3': currentStepData[7],
                        'Point_desc1': currentStepData[8],
                        'Point_desc2': currentStepData[9],
                        'Point_desc3': currentStepData[10],
                        'Preferential': currentStepData[11],
                        'Product': currentStepData[12],
                        'Extra_information': currentStepData[13],
                        'Content_1': currentStepData[14],
                        'Content_2': currentStepData[15],
                        'Content': currentStepData[16]
                    };


                    // 重新渲染前端元件
                    updateStepContent(currentStep, proposolValue, updatedStepData);
                    const updateFunction = updateStrategies[showoutputValue];
                    if (updateFunction) {
                        updateFunction(currentStep, proposolValue, updatedStepData);
                    }

                }else {
                    console.error("Step not found in cached data.");
                }
            }else {
                console.error("Invalid data structure in response.");
            }
        }else{
            console.error("Error saving to database:", response.message);
        }
    })
    .catch(error => {
        console.error("Error:", error);
    })
}



function generateRequestBody(text) {
    return {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 'inputtext': text })
    };
}
  

function sendRequest(requestBody) {
    return fetch('/get_answer', requestBody)
        .then(response => response.json())
        .catch(error => console.error('Error during response processing:', error))
        .catch(error => console.error('Error during fetch:', error));
}


var loading = false;

function setLoading(value) {
    loading = value;
    var loadingContainer = document.getElementById('loadingContainer');
    if (loading) {
        loadingContainer.classList.remove('hidden');
    } else {
        loadingContainer.classList.add('hidden');
    }
}


$(document).ready(function() {
    $('#features').select2();

    //編輯鈕
    var edit = document.getElementById('edit');
    edit.onclick = function(){
        function settonone(){
            console.log(proposolValue, contentstyleValue);
            document.getElementById('GENERAL_EDM').style.display = 'none';
            document.getElementById('GENERAL_LINE').style.display = 'none';
            document.getElementById('GENERAL_MBN').style.display = 'none';

            steps_Container.innerHTML = '';
        }

        var urlParams = new URLSearchParams(window.location.search);
        var proposolValue = urlParams.get('proposol'); //框架
        var contentstyleValue = urlParams.get('contentstyle');//前頁圈選風格

        //重新創作抓值
        var ai6103vm03yk6 = document.getElementById('ai6103vm03yk6');
        var selectedai6103vm03yk6Temp3 = ai6103vm03yk6.options[ai6103vm03yk6.selectedIndex].value; //模板
        var style = document.getElementById('style').value;
        var keyword = document.getElementById('keyword').value;
        var features = $('#features').val();
        var features_txt = "";  // 初始化一個空字串來存放所有選中的描述
        for (var i = 0; i < features.length; i++) {
            var myfeature = features[i];

            switch (myfeature) {
                case '1':
                    features_txt += `points內其中一個要含數字呈現(例:幾%/幾成)，含使用者體驗感想\n`;
                    break;
                case '2':
                    features_txt += `Main_slogan內要依Main_list內容，含數字呈現(例:幾要點/原則/步驟/個/大/方法)\n`;
                    break;
                case '3':
                    features_txt += `Main_list加入產品優勢\n`;
                    break;
                case '4':
                    features_txt += `Preferential加入「媒體參與度」特徵\n`;
                    break;
                case '5':
                    features_txt += `文案內容不能用"穩/最等"最高級用詞,且不能含有「正報酬/安心/無風險」類似意思保證的用詞\n`;
                    break;
                case '6':
                    features_txt += `內容提到有定期報酬也要提到會有投資風險\n`;
                    break;
                case '7':
                    features_txt += `Main_list內其中一個要含數字呈現(例:幾%/幾成)\n`;
                    break;
            }
        }


        var sentences = document.getElementById('sentences');
        if (sentences && sentences.options.length > 0){
            var mysentences = sentences.options[sentences.selectedIndex].text;
        }else{
            var mysentences = '';
        }

        var maintitlenum = document.getElementById('maintitlenum').value;
        var maintitledescnum = document.getElementById('maintitledescnum').value;
        var smalltitlecnum = document.getElementById('smalltitlecnum').value;
        var smalltitledescnum = document.getElementById('smalltitledescnum').value;
        var productInformation = localStorage.getItem('productInformation');

        if (proposolValue && selectedai6103vm03yk6Temp3) {
            if (proposolValue == "pas"){
                var step1text=`Problem or pain-問題 ：根據商品特徵去設想目標客群可能會遇到的痛點，以及這些問題會造成的痛苦，營造感同身受的氛圍。強調問題的急迫性以及重要性，盡量使顧客產生好奇心及疑問。`;
                var step2text=`Agitate-激勵：透過描述問題的影響、加劇問題帶來的困擾和負面後果，加強顧客對於問題帶來的情感反應。讓顧客意識到問題的嚴重性並感受到對於我們的商品迫切的需求，加劇疑問的敘述使顧客繼續產生好奇心及疑問。`;
                var step3text=`Solution-解決方案：呈現以我們提供產品或服務作為解決問題的方案。強調該解方如何有效地解決觀眾面臨的問題。提供方法的好處與價值。`;
            }else if (proposolValue == "aida") {
                var step1text = `Awareness & Interest：目的為盡可能觸及更多潛在消費者，以「廣」為目標，顧客與品牌初次見面並留下不錯的印象，透過各種行銷手法繼續推播資訊，像是社群行銷等，並找到顧客的痛點與利益因素，讓顧客對商品或服務感興趣。`;
                var step2text= `Consideration & Intent：行銷目的轉為去思考該如何讓消費者願意購買？如何提升購買意願？`;
                var step3text = `Evaluation & Purchase 考慮：目的就是盡快促使消費者執行購買的動作，此時消費者通常心中會有「要買哪家？」的疑問，因此在這一層告訴顧客自己的優勢就非常重要`;
                var step4text = `Loyalty & Advocacy：長期經營品牌至關重要的一步，在消費者購買完商品之後，如果可以建立會員制度，或是透過顧客關係管理（CRM)做到自動化和個人化行銷，並致力於提升商品與服務體驗，就可以大大提升將初次消費者變成忠誠顧客的機會`;
            }else{
                var step1text = `${otherFrameworkContent}`;
            }

            if (selectedai6103vm03yk6Temp3 == "EDM"){
                var opening_text =`step_:
                Main_list：依主要述求、關鍵字、造句模版，提供2~4個生活化的條列描述(不可敘述優惠方案及產品資訊)，each step內容皆不重覆且差異大，[請務必以條列式1./2./3./4.呈現]。
                Main_slogan：依Main_list生成吸引人標題
                Point1/2/3：根據Main_slogan敘述加上理財風險承受度或社交媒體參與度，及配合step文案方向且含引起話題或產品故事，產生三個客群認可的生活化議題如提供step1，只需產生step1，如提供的參數資訊有到step5就依序 產出五個step，每個step皆須提供三個point，each step內容皆不重覆（e.g., Point1/2/3：
                Point_desc1/2/3: 大約${smalltitledescnum}個字
                Product：依客群特徵重新描述"產品資訊"具說服力的產品優勢、需一個小標題 
                Preferential：依客群對產品知識認知，重新改寫吸引人的優惠方案`;
            }else if (selectedai6103vm03yk6Temp3 == "LINE"){
                var opening_text =`
                step_:  
                Main_slogan：依主要述求關鍵字生成，3個獲利的投資原則
                Main_list：明確敘去目標客群目標夢想 
                Content_1（每個step的產出的3項需不同）：根據文案重點提出的引言明確列出將提供與產品資訊相關的3項e.g., 1. 2. 3. …來實現想或目標，每個step的產出的3項需不同。
                Content_2：產品資訊的優勢 
                Extra information：一句話說服客戶前往網址了結更詳細的資訊--> [網址] `;
            }else if (selectedai6103vm03yk6Temp3 == "MBN"){
                var opening_text =`
                step_: 
                Main_slogan：3點吸引投資人的論點
                Main_list：根據主標題敘述及配合step1文案方向產生三個對目標客群有利的投資策略或疑問句，如提供step1，只需產生step1，如提供的參數資訊有到step5就依序產出五個step（e.g., 1/2/3)
                Content：以產品資訊的優勢來回覆Main_list上的疑問
                Extra information：一句話說服客戶前往網址了結更詳細的資訊--> [網址]
                總共最多70字，絕對不可以超過`;
            }

            var step1_total =   
            `
            Step 1：
            整體風格：${style}
            主要述求：依其他特徵內支出清單
            其他特性：依其他特徵內群組特徵清單
            關鍵字：${keyword}及依關鍵字清單
            Main_slogan造句模板：${mysentences}
            Main_slogan字數：${maintitlenum}字以內
            Main_list字數：${maintitledescnum}字以內
            Point字數：${smalltitlecnum}字以內
            Point_desc字數：${smalltitledescnum}字以內
            Tone: 直接的，文案方向：${step1text}
            Temperature: 0.8
            `;

            var step2_total =   
            `
            Step 2：
            整體風格：${style}
            主要述求：依其他特徵內支出清單
            其他特性：依其他特徵內群組特徵清單
            關鍵字：${keyword}及依關鍵字清單
            Main_slogan造句模板：${mysentences}
            Main_slogan字數：${maintitlenum}字以內
            Main_list字數：${maintitledescnum}字以內
            Point字數：${smalltitlecnum}字以內
            Point_desc字數：${smalltitledescnum}字以內
            Tone: 直接的，文案方向：${step2text}
            Temperature: 0.8

            `;  

            var step3_total = 
            `
            Step 3：
            整體風格：${style}
            主要述求：依其他特徵內支出清單
            其他特性：依其他特徵內群組特徵清單
            關鍵字：${keyword}及依關鍵字清單
            Main_slogan造句模板：${mysentences}
            Main_slogan字數：${maintitlenum}字以內
            Main_list字數：${maintitledescnum}字以內
            Point字數：${smalltitlecnum}字以內
            Point_desc字數：${smalltitledescnum}字以內
            Tone: 直接的，文案方向：${step3text}
            Temperature: 0.8
            `  

            var step4_total =
            `
            Step 4：
            整體風格：${style}
            主要述求：依其他特徵內支出清單
            其他特性：依其他特徵內群組特徵清單
            關鍵字：${keyword}
            Main_slogan造句模板：${mysentences}
            Main_slogan字數：${maintitlenum}字以內
            Main_list字數：${maintitledescnum}字以內
            Point字數：${smalltitlecnum}字以內
            Point_desc字數：${smalltitledescnum}字以內
            Tone: 直接的，文案方向：${step4text}
            Temperature: 0.8
            `;


            var proposol = proposolValue;
            var showmeOutput = selectedai6103vm03yk6Temp3;

            if (showmeOutput == "EDM" || showmeOutput == "LINE" || showmeOutput == "MBN") {
                setLoading(true);

                if (proposol == "aida") {
                    const text = generateTextForRequest(`${step1_total}\n---\n${step2_total}`, opening_text, productInformation, features_txt);
                    const text1 = generateTextForRequest(`${step3_total}\n---\n${step4_total}`, opening_text, productInformation, features_txt);
                    
                    console.log(text);
                    console.log(text1);
                    
                    Promise.all([
                        sendRequest(generateRequestBody(text)),
                        sendRequest(generateRequestBody(text1))
                    ])
                    .then(results => {
                        changePage(showmeOutput, proposolValue, contentstyleValue, style, keyword);
        
                        const combinedData = {
                            step1_2: results[0]['response'],
                            step3_4: results[1]['response']
                        };
        
                        // 存儲到 localStorage
                        localStorage.setItem('combinedData', JSON.stringify(combinedData));
        
                        saveToDatabase(combinedData, proposol);
                    })
                    .catch(error => {
                        console.error("Error:", error);
                    })
                    .finally(() => {
                        setLoading(false);  // 結束加載
                    })
                }else if (proposol == "pas") {
                    const text = generateTextForRequest(`${step1_total}\n---\n${step2_total}\n---\n${step3_total}`, opening_text, productInformation, features_txt);
                    console.log(text);
                    handleGenerateRequest(text, proposol);
                }else {
                    const text = generateTextForRequest(`${step1_total}`, opening_text, productInformation, features_txt);
                    console.log(text);
                    handleGenerateRequest(text, proposol);
                }
            }else {
                alert('請選擇提案框架和呈現方式！');
            }
        }
        //內嵌式function

        function generateTextForRequest(stepsInfo, opening_text, productInformation, features_txt) {
            return `根據我提供的產品資訊和參數資訊生成一個理財行銷文案， 字數以精簡為主，每個step需有連貫性並且以以下格式輸出： 
            —————- 
            ${opening_text}
            —————- 
            ${productInformation}
            —————- 
            參數資訊： 
            ${stepsInfo}
            —————- 
            ${opening_text}
            —————- 
            請一定要依照我的格式回答，中間不要以任何形式的橫槓間隔，只以換行鍵來區隔就好。多用產品資訊關鍵字
            ${features_txt}`;
        }

        function handleGenerateRequest(text, proposol) {
            localStorage.setItem('ji3g4text',text);
            sendRequest(generateRequestBody(text))
                .then(result => {
                    saveToDatabase(result['response'], proposol);
                    localStorage.setItem('result', JSON.stringify(result['response']));
                    settonone();
                    console.log(result);
                    console.log(showmeOutput, proposolValue, contentstyleValue, style, keyword);
                    changePage(showmeOutput, proposolValue, contentstyleValue, style, keyword);
                })
                .catch(error => {
                    console.error("Error:", error);
                })
                .finally(() => {
                    setLoading(false);
                });
          }


          function saveToDatabase(data, proposol) {
            console.log(data)
            let taskId = localStorage.getItem('task');
            data.taskId = taskId;
            data.showOutput = showmeOutput;

            let apiUrl;  // 決定要使用哪個API路由
            
            if (proposol === "aida") {
                apiUrl = '/save_output_aida';
            } else {
                apiUrl = '/save_output';
            }
        
            fetch(apiUrl, {
                method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
            }).then(response => response.json())
            .then(data => {
                console.log("Data saved to database:", data);
            }).catch(error => {
                 console.error("Error saving to database:", error);
            })
        }

        function changePage(showmeOutput) {
            console.log(showmeOutput)
            if (confirm('確定填寫完畢？')) {
                let currentURL = window.location.href.split('?')[0];  // 取得基本URL，不帶任何參數
                window.location.href = 
                `${currentURL}?showOutput=${showmeOutput}`;
            }else {
              alert('您已取消操作。');
            }
        }
    }
});




var backto = document.getElementById('backto');
backto.onclick = function(){
    // 在換頁之前進行一些驗證
    if (confirm('確定離開此頁嗎？')) {
        window.location.assign ('marketing_home.html?') ;
         }else {
      alert('您已取消操作。');
    }
}

document.getElementById('ai6103vm03yk6').addEventListener('change', function() {
    let selectValue = this.value;
    if (selectValue === 'LINE' || selectValue === 'MBN') {
        document.getElementById('smalltitlecnum').disabled = true;
        document.getElementById('smalltitledescnum').disabled = true;
    } else {
        document.getElementById('smalltitlecnum').disabled = false;
        document.getElementById('smalltitledescnum').disabled = false;
    }
});
//造句模板
function getOptionsBasedOnSelection(selection) {
    // 根據選項值返回符合條件的下拉式選單選項
    // 這裡可以根據不同的選項值返回不同的選項
    // 返回的選項應該是一個包含 value 和 label 屬性的物件陣列
    // 例如：
    if (selection === '嘿！看這裡！') {
        return [
          { value: 'option1', label: '沒有…只有…'},
          { value: 'option2', label: '沒有…只是…'},
          { value: 'option3', label: '沒有…就…'},
          { value: 'option4', label: '沒有…就沒有…'},
          { value: 'option5', label: '不是…是…'},
          { value: 'option6', label: '是…不是…'},
          { value: 'option7', label: '雖…但/卻/可'},
          { value: 'option8', label: '為了…你…'},
          { value: 'option9', label: '只…卻/但…'},
          { value: 'option10', label: '還是…好'},
          { value: 'option11', label: '不一定…也可以…'},
          { value: 'option12', label: '哪有…'},
          { value: 'option13', label: '如果若…就/那麼…'},
          { value: 'option14', label: '也能/也可以…'},
          { value: 'option15', label: '尤其…'},
          { value: 'option16', label: '有點(兒)…'},
          { value: 'option17', label: '只有…'},
          { value: 'option18', label: '至少…'},
          { value: 'option19', label: '第一次…'},
          { value: 'option20', label: '或許…'},
          { value: 'option21', label: '人人都…'},
          { value: 'option22', label: '任何人…'},
          { value: 'option23', label: '男人…女人…'},
          { value: 'option24', label: '男人…'},
          { value: 'option25', label: '女人…'},
          { value: 'option26', label: '女人…男人…'},
          { value: 'option27', label: '偏見…'},
          { value: 'option28', label: '是一種…'},
          { value: 'option29', label: '為什麼…'},
          { value: 'option30', label: '無限/無盡/皆有可能…'},
          { value: 'option31', label: '不凡/非凡/不平凡…'},
          { value: 'option32', label: '上天…'},
          { value: 'option33', label: '…歲' },
          { value: 'option34', label: '最大的…'},
          { value: 'option35', label: '十年…'},
          { value: 'option36', label: '3分鐘…'},
          { value: 'option37', label: '5分鐘…'}
        ];
      } else if (selection === '全世界我最強') {
        return [
          { value: 'option38', label: '比…更…'},
          { value: 'option39', label: '不…才…'},
          { value: 'option40', label: '不…只…'},
          { value: 'option41', label: '對…來說…'},
          { value: 'option42', label: '為…而…'},
          { value: 'option44', label: '非…'},
          { value: 'option44', label: '從不…'},
          { value: 'option45', label: '沒有…'},
          { value: 'option46', label: '不配得上…'},
          { value: 'option47', label: '配不上…'},
          { value: 'option48', label: '（以)人為…'},
          { value: 'option49', label: '沒人/沒有人…'},
          { value: 'option50', label: '少數人…'},
          { value: 'option51', label: '（世界上有）兩種／兩樣…'},
          { value: 'option52', label: '世界…我…'},
          { value: 'option53', label: '（這個)時代…'},
          { value: 'option54', label: '…的世界'},
          { value: 'option55', label: '世界再大／路再長…'},
          { value: 'option56', label: '超能（力)…'},
          { value: 'option57', label: '是最好的／最好的是…'},
          { value: 'option58', label: '所有／凡／但凡／多少／任何…都…'},
          { value: 'option59', label: '（人生）天生…'},
          { value: 'option60', label: '英雄…'},
          { value: 'option61', label: '與眾不同／不同尋常…'},
          { value: 'option62', label: '唯一／唯有／不可取代…'},
          { value: 'option63', label: '選擇…'},
          { value: 'option64', label: '一切…'},
          { value: 'option65', label: '真正的…'},
          { value: 'option66', label: '最好的…'}
        ];
    } else if (selection === '聽我的準沒錯！') {
        return [
          { value: 'option67', label: '要…先…'},
          { value: 'option68', label: '只有／捨去…才能／方…'},
          { value: 'option69', label: '重要的是…不是…'},
          { value: 'option70', label: '與其…不如…'},
          { value: 'option71', label: '既然…就…'},
          { value: 'option72', label: '把／將…'},
          { value: 'option73', label: '別／不要／戒…'},
          { value: 'option74', label: '絕／絕非／永平／絕不／永遠不…'},
          { value: 'option75', label: '讓…'},
          { value: 'option76', label: '用…'},
          { value: 'option77', label: '相信…'},
          { value: 'option78', label: '（不）要／應／該／應該／適合…'},
          { value: 'option79', label: '就／就要…'},
          { value: 'option80', label: '要麼／或者…'},
          { value: 'option81', label: '值得…'},
          { value: 'option82', label: '決定了／取決於…'},
          { value: 'option83', label: '試試／看看／數數／考慮…'},
          { value: 'option84', label: '除了…'},
          { value: 'option85', label: '發現…'},
          { value: 'option86', label: '改變…'},
          { value: 'option87', label: '改變世界…'},
          { value: 'option88', label: '你…世界…'},
          { value: 'option89', label: '就得／需要…'},
          { value: 'option90', label: '你更／比／超乎…'},
          { value: 'option91', label: '做自己…'},
          { value: 'option92', label: '永／永遠…'}
        ];
    } else if (selection === '我懂你在想什麼') {
        return [
          { value: 'option93', label: '所謂…就是／都是／不是…'},
          { value: 'option94', label: '不管／不論／無論…'},
          { value: 'option95', label: '不再／再也不…'},
          { value: 'option96', label: '愈來愈…'},
          { value: 'option97', label: '不必…'},
          { value: 'option98', label: '從來…'},
          { value: 'option99', label: '就算／即使／縱使…也…'},
          { value: 'option100', label: '才（是／能)…'},
          { value: 'option101', label: '各／各自…'},
          { value: 'option102', label: '別人…（我／自己）…'},
          { value: 'option103', label: '只怕／最怕／不怕…'},
          { value: 'option104', label: '終究／最終／總會…'},
          { value: 'option105', label: '原來／本來…'},
          { value: 'option106', label: '那些…'},
          { value: 'option107', label: '難忘／忘不了／忘不掉…'},
          { value: 'option108', label: '陪你…'},
          { value: 'option109', label: '成長…'},
          { value: 'option110', label: '每天／每一天…'},
          { value: 'option111', label: '青春…'},
          { value: 'option112', label: '大人…'},
          { value: 'option113', label: '…的孩子'},
          { value: 'option114', label: '…的人'},
          { value: 'option115', label: '…的味道'},
          { value: 'option116', label: '…的意義'},
          { value: 'option117', label: '小孩…大人／成年人…'},
          { value: 'option118', label: '小時候…長大／現在…'},
          { value: 'option119', label: '想…'},
          { value: 'option120', label: '故鄉…'},
          { value: 'option121', label: '自由…'},
          { value: 'option122', label: '自己…'},
          { value: 'option123', label: '自有／自在／自己會…'}
        ];
    } else if (selection === '真心話大聲說！') {
        return [
            { value: 'option124', label: '讓…成為／變成／變得／改變…'},
            { value: 'option125', label: '不是所有的…都…'},
            { value: 'option126', label: '不讓／不能讓…'},
            { value: 'option127', label: '並不…'},
            { value: 'option128', label: '不得不…'},
            { value: 'option129', label: '過／好過／勝過…'},
            { value: 'option130', label: '總會／終將過去…'},
            { value: 'option131', label: '就像…'},
            { value: 'option132', label: '其實／事實上…'},
            { value: 'option133', label: '是為了／不是為了…'},
            { value: 'option134', label: '說不清／誰知道…'},
            { value: 'option135', label: '往往…'},
            { value: 'option136', label: '幸虧／幸好／多虧／慶幸…'},
            { value: 'option137', label: '獻給／留給…'},
            { value: 'option138', label: '愛…'},
            { value: 'option139', label: '所有人…我…'},
            { value: 'option140', label: '你…你…'},
            { value: 'option141', label: '喜歡你…'},
            { value: 'option142', label: '夢／夢想…'},
            { value: 'option143', label: '理想…現實…'},
            { value: 'option144', label: '記得／希望…'},
            { value: 'option145', label: '一生／一輩子…'},
            { value: 'option146', label: '有時候…'},
            { value: 'option147', label: '再來／再一次／下次／再出發…'},
            { value: 'option148', label: '總是…'},
            { value: 'option149', label: '總有…'},
            { value: 'option150', label: '每個人…'},
            { value: 'option151', label: '回家…'},
            { value: 'option152', label: '旅行…'},
            { value: 'option153', label: '故事…'}
        ];
    } else if (selection === '這也太洗腦了') {
        return [
            { value: 'option154', label: '因為…所以…'},
            { value: 'option155', label: '之所以…是因為…'},
            { value: 'option156', label: '愈…愈…'},
            { value: 'option157', label: '愈…愈會…'},
            { value: 'option158', label: '再…也…'},
            { value: 'option159', label: '只要…就能…'},
            { value: 'option160', label: '最…是…／是最…'},
            { value: 'option161', label: '有…（也／還／更／才)有…'},
            { value: 'option162', label: '有…就有…'},
            { value: 'option163', label: '現在…未來…'},
            { value: 'option164', label: '未來…現在'},
            { value: 'option165', label: '從前／以前／那時／曾／古…今／如今／現在…'},
            { value: 'option166', label: '當／在…時'},
            { value: 'option167', label: '今天…明天…'},
            { value: 'option168', label: '每…都…'},
            { value: 'option169', label: '如此／多麼／那麼…竟然／居都／都…'},
            { value: 'option170', label: '什麼樣的…什麼樣的…'},
            { value: 'option171', label: '是…是…'},
            { value: 'option172', label: '你…我…我…你…'},
            { value: 'option173', label: 'xx你／我xx'},
            { value: 'option174', label: 'xx就是xx'},
            { value: 'option175', label: 'xx，才xx'},
            { value: 'option176', label: 'xx，非xx'},
            { value: 'option177', label: 'xx…xx…'},
            { value: 'option178', label: 'xx…, …xx (回環)'},
            { value: 'option179', label: '（提問句）'},
            { value: 'option180', label: '（反問句）'},
            { value: 'option181', label: '（語義雙關)'}
        ];
      } else {
        return [];
    }
}


//送進廣宣
var checkList = document.getElementById('checkList');
checkList.onclick = function(){
    if (confirm('確定要換頁嗎？')) {
        window.location.href = 'editable.html'
    }else{
        alert('您已取消操作！')
        return;
    }
    /*let text = "";
    const selectElement = document.getElementById('version');
    selectedVersion = selectElement.value;  // 這裡獲取所選版本

    const data = {
        user_id: user_id,
        task_id: task_id,
        timess: selectedVersion,
        showoutput: showoutputValue
    }

    // 發送請求到後台
    fetch('/get_data_to_nextpage', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.text())
    .then(text => {
        localStorage.setItem('editText', text);
        if (confirm('確定要換頁嗎？')) {
            window.location.href = 'editable.html'
        }else{
            alert('您已取消操作！')
            return;
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
    */
}


