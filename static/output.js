const Investment = localStorage.getItem('uploadedFileContent');
const task_id = localStorage.getItem('task');
let cachedData = null; 
let user_id;
let selectedVersion;
let buttons = [];


// DOM Elements
const elements = {
    edm: {
        mainview: document.getElementById("edm_mainview"),
        mainlist: document.getElementById("edm_mainlist"),
        point1: document.getElementById("edm_point1"),
        disc1: document.getElementById("edm_disc1"),
        point2: document.getElementById("edm_point2"),
        disc2: document.getElementById("edm_disc2"),
        point3: document.getElementById("edm_point3"),
        disc3: document.getElementById("edm_disc3"),
        production: document.getElementById("edm_production"),
        preferential: document.getElementById("edm_discount"),
        show: document.getElementById("edm_show")
    },
    line: {
        mainview: document.getElementById("line_mainview"),
        content1: document.getElementById("line_content1"),
        content2: document.getElementById("line_content2"),
        mainpoint: document.getElementById("line_mainpoint"),
        extra: document.getElementById("line_extra")
    },
    mbn: {
        mainview: document.getElementById("mbn_mainview"),
        content: document.getElementById("mbn_content"),
        mainlist: document.getElementById("mbn_mainlist"),
        extra: document.getElementById("mbn_extra")
    }
};

// Initialize display
["GENERAL_EDM", "GENERAL_LINE", "GENERAL_MBN"].forEach(id => {
    document.getElementById(id).style.display = 'none';
});


//獲取userID
async function fetchUserId() {
    const response = await fetch('/get-user-id');
    const data = await response.json();
    return data.user_id;
}


//獲取版本
async function fetchVersions() {
    const response = await fetch('/get_versions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            user_id,
            task_id
        })
    });
    return await response.json();
}


//版本下拉選單
function populateVersionDropdown(versions, latestVersion) {
    const selectElement = document.getElementById('version');
    selectElement.innerHTML = '';

    if (versions && versions.length > 0) {
        versions.forEach(version => {
            const optionElement = document.createElement('option');
            optionElement.value = version;
            optionElement.textContent = "版本 " + version;
            selectElement.appendChild(optionElement);
        })
    }else {
        console.warn('No versions available.');
    }

    selectElement.value = latestVersion;
    selectElement.addEventListener('change', function() {
        selectedVersion = this.value;
        fetchOutputData(selectedVersion);
    })
}


//獲取輸出資訊
async function fetchOutputData(version) {
    const response = await fetch('/get_output', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            user_id,
            task_id,
            showoutput: showoutputValue, //還不確定要不要
            version
        })
    })
    const data = await response.json();
    processOutputData(data);
}


function processOutputData(data) {
    cachedData = data.data;
    console.log(data);

    if (!data.data || !Array.isArray(data.data)) {
        console.error('Expected data.data to be an array.');
        return;
    }

    data.data.forEach(stepArray => {
        const step = stepArray[1];
        const stepData = extractStepData(stepArray);
        createStepButton(step, showoutputValue, stepData);
    });
    displayOutputType(showoutputValue);
}

function extractStepData(stepArray) {
    return {
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
}


function displayOutputType(outputType) {
    const outputMapping = {
        'EDM': 'GENERAL_EDM',
        'LINE': 'GENERAL_LINE',
        'MBN': 'GENERAL_MBN'
    };

    if (outputMapping[outputType]) {
        document.getElementById(outputMapping[outputType]).style.display = 'block';
    }
    if (buttons.length > 0) {
        buttons[0].click();
    }
}


async function mainFunction() {
    await fetchCustomValueData(user_id);
    const { versions, latest_version } = await fetchVersions();
    populateVersionDropdown(versions, latest_version);
    fetchOutputData(latest_version);
}


fetchUserId().then(id => {
    user_id = id;
    mainFunction();
}).catch(error => {
    console.error('Error fetching user ID:', error);
});


async function fetchCustomValueData(userId) {
    console.log("Function fetchCustomValueData called!");

    try {
        const response = await fetch('/get_custom_value', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_id: userId,
                task_id: task_id
            })
        })
        const data = await response.json();

        if (data && data.status === 'success' && data.data) {
            const { style, keyword, contentStyle, proposol } = data.data;
            initProposol(proposol, showoutputValue);
            getContentValue(style, keyword, contentStyle);
        }else {
            console.error('Failed to get custom values:', data.message);
        }
    }catch (error) {
        console.error('Error fetching custom values:', error);
    }
}


function getContentValue(styleValue, keywordValue, contentstyleValue) {
    console.log("Before checking contentstyleValue");

    if (contentstyleValue) {
        const options = getOptionsBasedOnSelection(contentstyleValue);
        const sentences = document.getElementById('sentences');
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.textContent = option.label;
            sentences.appendChild(optionElement);
        });
    }
    const ai6103vm03yk6 = document.getElementById('ai6103vm03yk6');
    if (ai6103vm03yk6) {
        ai6103vm03yk6.value = showoutputValue;
    }else {
        console.log("無法找到元素 ai6103vm03yk6");
    }

    document.getElementById('style').value = styleValue;
    document.getElementById('keyword').value = keywordValue;

    console.log("After checking contentstyleValue");
}



// Predefined frameworks
const predefinedFrameworks = {
    pas: ['Problem or pain-問題', 'Agitate-激勵', 'Solution-解決方案'],
    aida: ['Awareness & Interest吸引注意', 'Consideration & Intent引起興趣', 'Evaluation & Purchase 考慮', 'Loyalty & Advocacy開始行動']
};


// Handle marketing framework
const otherFrameworkName = localStorage.getItem('otherFrameworkName');
const otherFrameworkContent = JSON.parse(localStorage.getItem('otherFrameworkContent'));


if (otherFrameworkContent && Array.isArray(otherFrameworkContent)) {
    if (predefinedFrameworks.hasOwnProperty(otherFrameworkName)) {
        console.warn(`${otherFrameworkName} already exists in predefinedFrameworks. Skipping...`);
    } else {
        predefinedFrameworks[otherFrameworkName] = otherFrameworkContent;
    }
}


function initProposol(proposolValue) {
    const steps = predefinedFrameworks[proposolValue] || [];
    steps.forEach((step, index) => {
        console.log(step, steps.length, index);
    });
}