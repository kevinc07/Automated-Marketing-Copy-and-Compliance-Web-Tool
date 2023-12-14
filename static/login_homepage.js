const loginPanel = document.querySelector('.login-panel');
const inputs = document.querySelectorAll('input');
const showRegister = document.getElementById('show-register');
const showLogin = document.getElementById('show-login');
const loginForm = document.querySelector('.login-form');
const registerForm = document.querySelector('.register-form');
const loginBtn = document.getElementById('login');
const register = document.getElementById('register');


//一開始先清除task
localStorage.removeItem('task');

//使用者手冊流程
if (loginPanel) {

    introJs().setOptions({
        steps: [
            {
                element: document.querySelector('[data-step="1"]'),
                intro: "請先登入/註冊!",
                position: 'right'
            }
        ],
        showBullets: false,  // 隱藏步驟指示器
        showProgress: false,  // 顯示進度條
        exitOnOverlayClick: false  // 禁止點擊覆蓋層退出導覽
    }).start();

    showRegister.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';

        showLogin.addEventListener('click', (e) => {
            e.preventDefault();
            registerForm.style.display = 'none';
            loginForm.style.display = 'block';
        });
    });


    let isFocused = false;
    let isMouseOverPanel = false;
    let timeout;
    
    // 是否點開Input功能
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            isFocused = true;
            loginPanel.style.transform = 'translateY(-50%) translateX(0)'
        });
        
        input.addEventListener('blur', () => {
            isFocused = false;
        });
    });

    // 滑鼠移動事件
    document.addEventListener('mousemove', (e) => {
        if (isFocused || isMouseOverPanel) return; // 如果鼠標在面板上或輸入框聚焦，則不做任何事情

        if (e.clientX <= 50) {
            clearTimeout(timeout); // 清除之前的延遲
            timeout = setTimeout(() => {
                loginPanel.style.transform = 'translateY(-50%) translateX(0)';
                loginPanel.classList.add('active');
            }, 200); // 200毫秒的延遲
        } else {
            clearTimeout(timeout); // 清除之前的延遲
            timeout = setTimeout(() => {
                loginPanel.style.transform = 'translateY(-50%) translateX(-90%)';
                loginPanel.classList.remove('active');
            }, 200); // 200毫秒的延遲
        }
    });
    // 檢查鼠標是否在面板上
    loginPanel.addEventListener('mouseenter', () => {
        isMouseOverPanel = true;
    });
    
    loginPanel.addEventListener('mouseleave', () => {
        isMouseOverPanel = false;
    });


    loginBtn.onclick = function(){
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
    
        fetch('/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert('您好，歡迎回來！');
                window.location.reload();
            }else {
                alert(data.message);
            }
        })
    }

    register.onclick = function() {
        if (!registerForm) {
            console.error("registerForm is not found!");
            return;
        }
    
        const usernameInput = document.getElementById('user-name');
        const passwordInput = document.getElementById('pass-word');
        const confirmPasswordInput = document.getElementById('confirm-password');
    
    
        if (!usernameInput || !passwordInput || !confirmPasswordInput) {
            console.error("One or more input fields are not found!");
            return;
        }
    
        const user_name = usernameInput.value.trim();
        const pass_word = passwordInput.value.trim();
        const confirm_Password = confirmPasswordInput.value.trim();
    
        // 檢查使用者名稱和密碼是否為空
        if (!user_name || !pass_word || !confirm_Password) {
            alert('使用者名稱和密碼不可為空！');
            return;
        }
    
        if (pass_word !== confirm_Password) {
            alert('密碼和確認密碼不匹配！');
            usernameInput.value = '';
            passwordInput.value = '';
            confirmPasswordInput.value = '';
            return;
        }
    
        fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: user_name,
                password: pass_word
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert('您好，歡迎加入！');
                window.location.href = "/";  // Redirect to login page
            }else {
                alert(data.message);
            }
        });
    }
}



//任務可以隨意托拽
function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {
    ev.preventDefault();

    // 獲取拖放目標
    let target = ev.target;

    // 檢查目標是否是 taskcard
    while (!target.classList.contains('pane')) {
        target = target.parentElement;
        if (!target) return;  // 防止無窮迴圈
    }

    var data = ev.dataTransfer.getData("text");
    target.appendChild(document.getElementById(data));

    var newStatus;
    switch (target.id) {
        case 'edit':
            newStatus = 'Edit';
            break;
        case 'vetting':
            newStatus = 'Vetting';
            break;
        case 'checklist':
            newStatus = 'Checklist';
            break;
        case 'posting':
            newStatus = 'Posting';
            break;
    }

    fetch('/update-status', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            task_id: data.replace("task", ""),  // Extracting the task id
            status: newStatus
        })
    })
}


//新增專案
addProject = document.getElementById('addProject');
addProject.onclick = function(){
    localStorage.removeItem('task');
    window.location.href = "/marketing_home.html";
}



//編輯下拉式選單
const moreOptions = document.querySelectorAll('.clickoptions');
moreOptions.forEach(option => {
    option.addEventListener('click', function(event) {
        event.stopPropagation();

        console.log("More options clicked!");

        // 首先，關閉所有下拉選單
        const dropdowns = document.querySelectorAll('.dropdown-menu');
        dropdowns.forEach(dropdown => {
            dropdown.style.display = 'none';
        });

        // 然後打開當前的下拉選單
        const menu = this.nextElementSibling;
        menu.style.display = 'block';

        event.stopPropagation();  // 阻止事件冒泡
    });
});


// 點擊其他地方時隱藏下拉選單
document.addEventListener('click', function(event) {
    const dropdowns = document.querySelectorAll('.dropdown-menu');
    dropdowns.forEach(dropdown => {
        dropdown.style.display = 'none';
    });
});

//追蹤下拉式選單的選擇
const dropdownItems = document.querySelectorAll('.dropdown-item');
dropdownItems.forEach(item => {
    item.addEventListener('click', function(event) {
        event.preventDefault(); // 防止鏈接的默認行為

        if (this.textContent.trim() === '編輯') {
            console.log('編輯被點選');
            // 在此處添加編輯的功能
        } else if (this.textContent.trim() === '刪除') {
            console.log('刪除被點選');
            // 在此處添加刪除的功能
        }
    });
});

//刪除專案(下拉選單)
function deleteTask(element, event) {
    event.stopPropagation();
    if(confirm('你確定要刪除此專案？')) {  // 使用 confirm 函數
        const taskId = element.getAttribute('data-task-id');

        fetch('/delete_task', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                taskId: taskId
            })
        })
        .then(response => response.json()).then(data => {
            if (data.status === 'success') {
                // 刪除該任務的HTML元素或重新加載頁面
                element.closest('.task-card').remove();
            } else {
                alert('Error deleting task');
            }
        });
    }
}

let currentTaskId;  //定義在外部，以便在兩個函數中都可以訪問

//編輯任務(下拉選單)
function editTask(element, event) {
    event.stopPropagation();

    currentTaskId = element.getAttribute('data-task-id');  // 獲取taskId

    // 獲取當前的任務名稱
    const taskCard = element.closest('.task-card');
    const taskContent = element.closest('.task-card').querySelector('.task-content');
    const currentTaskName = taskContent.textContent;

    // 創建一個新的<input>元素
    const inputElement = document.createElement('input');
    inputElement.value = currentTaskName;
    inputElement.addEventListener('blur', saveTaskName);
    inputElement.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            saveTaskName.call(this, event);
        }
    });

    // 設置<input>元素的背景色為任務卡的背景色
    const taskCardColor = window.getComputedStyle(taskCard).color;
    inputElement.style.color = taskCardColor;



    // 用<input>元素替換當前的任務名稱
    taskContent.replaceWith(inputElement);
    inputElement.focus();
}

//儲存編輯
function saveTaskName(event) {
    const inputElement = event.target;
    const newTaskName = inputElement.value;

    // 創建一個新的<span>元素
    const spanElement = document.createElement('span');
    spanElement.className = 'task-content';
    spanElement.textContent = newTaskName;

    // 用<span>元素替換<input>元素
    inputElement.replaceWith(spanElement);

    // 使用AJAX將新的任務名稱發送到後端
    // ...（這部分的代碼與你之前的submitEdit函數相似）

    // Use AJAX to send the new taskname to the backend
    fetch('/edit-task', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            taskId: currentTaskId,
            newTaskName: newTaskName
        })
    }).then(response => response.json()).then(data => {
        if (data.status === 'success') {
            location.reload();  // Reload the page to see the updated taskname
        } else {
            alert('Error updating task');
        }
    });
}


//點擊任務卡時的導向
function handleTaskClick(element) {
    var taskId = element.getAttribute('data-task-id');

    localStorage.setItem('task', taskId);

    // 重定向到editable.html
    window.location.href = 'editable.html';
}


// 為跳頁的圖片添加點擊事件
document.getElementById('jump-page').addEventListener('click', function() {
    window.location.href = 'checklist_index.html';  // 請替換成您想要跳轉的頁面URL
});


//顯示任務狀態表格
let isTableShown = false;
document.getElementById('show-table').addEventListener('click', function() {
    isTableShown = !isTableShown;
    if (isTableShown) {
        // 如果 isTableShown 為 true，顯示表格
        document.querySelector('.panes-center').style.display = 'none';
        document.querySelector('.tasks-table').style.display = 'block';
        fetchTasksAndPopulateTable();
    } else{
        // 如果 isTableShown 為 false，隱藏表格
        document.querySelector('.panes-center').style.display = 'block';
        document.querySelector('.tasks-table').style.display = 'none';
    }

    // （可選）保存狀態到 localStorage，以便在頁面刷新時保持狀態
    localStorage.setItem('showTable', isTableShown ? 'true' : 'false');
    // 當頁面加載
    if (localStorage.getItem('showTable') === 'true') {

        document.querySelector('.panes-center').style.display = 'none';
        document.querySelector('.tasks-table').style.display = 'block';
        fetchTasksAndPopulateTable();

    }
});

//抓取所有任務狀態
function fetchTasksAndPopulateTable() {
    fetch('/get_all_tasks')  
    .then(response => response.json())
    .then(data => {
        const tbody = document.getElementById('tasks-tbody');
        tbody.innerHTML = '';  // Clear any existing rows

        data.tasks.forEach(task => {
            const row = document.createElement('tr');

            let statusColorClass = '';
            switch(task.status) {
                case '待編輯':
                    statusColorClass = 'edit';
                    break;
                case '主管審核中':
                    statusColorClass = 'vetting';
                    break;
                case '法尊審核中':
                    statusColorClass = 'checklist';
                    break;
                case '已公告':
                    statusColorClass = 'posting';
                    break;
            }
            row.innerHTML = `
                <td>${task.name}</td>
                <td><span class="status-circle ${statusColorClass}"></span>${task.status}</td>
                <td>${task.editdate || ""}</td>
                <td>${task.deadline || ""}</td>
                <td>${task.executor}</td>
            `;


            // 為每一行添加點擊事件
            row.addEventListener('click', function() {
                localStorage.setItem('task', task.id);
                window.location.href = 'editable.html';
            })
            tbody.appendChild(row);
        });
    });
}


//登出
var logoutButton = document.getElementById('logoutButton');
// 添加單擊事件處理程序
logoutButton.addEventListener('click', function() {
    // 向/logout路由發送GET請求來執行登出操作
    fetch('/logout', {
        method: 'GET'
    })
    .then(function(response) {
        if (response.ok) {
            // 登出成功，可以根據需要執行其他操作，例如重定向到登陸頁面
            window.location.href = '/'; // 重定向到登陸頁面
        }else {
             // 登出失敗，可以處理錯誤情况
             console.error('登出失敗');
        }
    })
    .catch(function(error) {
        console.error('發生錯誤:', error);
    });
})
