# -*- coding: utf-8 -*-
import pymysql
from werkzeug.security import check_password_hash, generate_password_hash
from flask import Flask, render_template, request, jsonify, session, redirect, url_for, Blueprint
from datetime import timedelta
import secrets
from app import app
from app import app_bp


secret_key = secrets.token_hex(16)
app = Flask(__name__)
app.config['SECRET_KEY'] = secret_key  # 設定密鑰，用於 session
app.permanent_session_lifetime = timedelta(days=1)  # example: 1 day
app.register_blueprint(app_bp)
#app_bp = Blueprint('app_bp', __name__)



# 資料庫連接設定
db_settings1 = {
    "host": "host",  # 或其他主機名稱/IP地址
    "port": "port",  # MySQL默認端口
    "user": "user",
    "password": "password",
    "db": "db"
}
#Fubonadmin123

# 資料庫連接設定
db_settings2 = {
    "host": "host",  # 或其他主機名稱/IP地址
    "port": "port",  # MySQL默認端口
    "user": "user",
    "password": "password",
    "db": "db"
}


# 建立連接
connection1 = pymysql.connect(charset='utf8mb4', **db_settings1)
cursor1 = connection1.cursor()

# 建立到第二個資料庫的連接
connection2 = pymysql.connect(charset='utf8mb4', **db_settings2)
cursor2 = connection2.cursor()


#登入及(抓取)處理任務
@app.route('/', methods=['GET', 'POST'])
def login():

    session.permanent = True

    user_id = None  # Initialize the user_id variable
    edit_tasks = []  # 初始化變量
    vetting_tasks = []  # 初始化變量
    checklist_tasks = []  # 初始化變量
    posting_tasks = []  # 初始化變量

    # 初始化 is_logged_in 變數
    is_logged_in = False

    if request.method == 'POST':
        data = request.get_json()  # Changed from request.form.get() because you're sending JSON data
        username = data['username']
        password = data['password']

        cursor1.execute('SELECT password FROM user WHERE username=%s', (username,))
        result = cursor1.fetchone()

        if result:
            print("您好呀")
            hashed_password = result[0]
            # Check if the password matches
            if check_password_hash(hashed_password, password):
                session['logged_in'] = True
                session['username'] = username
                cursor1.execute('SELECT user_id FROM user WHERE username=%s AND password=%s', (username, hashed_password,))
                user_record = cursor1.fetchone()
                if user_record:
                    session['user_id'] = user_record[0]
                    return jsonify(status="success", message="Logged in successfully")
            else:
                return jsonify(status="error", message="Password is incorrect")
        else:
            return jsonify(status="error", message="Username not found")
        
    # 檢查用戶是否已經登入
    if 'logged_in' in session and session['logged_in']:
        is_logged_in = True
        user_id = session.get('user_id')
        cursor1.execute("SELECT id, taskname, status, user_id FROM tasks WHERE user_id = %s", (user_id,))
        tasks = cursor1.fetchall()

        edit_tasks = [task for task in tasks if task[2] == "Edit"]
        vetting_tasks = [task for task in tasks if task[2] == "Vetting"]
        checklist_tasks = [task for task in tasks if task[2] == "Checklist"]
        posting_tasks = [task for task in tasks if task[2] == "Posting"]


    return render_template('login_homepage.html', edit_tasks=edit_tasks, vetting_tasks=vetting_tasks, checklist_tasks=checklist_tasks, posting_tasks=posting_tasks, is_logged_in=is_logged_in) 

#===============================================

#更新任務狀態
@app.route('/update-status', methods=['POST'])
def update_status():
    data = request.json
    task_id = data['task_id']
    new_status = data['status']

    cursor1.execute("UPDATE tasks SET status=%s WHERE id=%s", (new_status, task_id,))
    connection1.commit()
    
    return jsonify(status="success")

#==================================================

#登出
@app.route('/logout', methods=['GET'])
def logout():
    session.pop('logged_in', None)
    session.pop('username', None)
    return redirect(url_for('login'))

#===============================================


#註冊
@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        data = request.get_json()
        username = data['username']
        password = data['password']

        # Check if username already exists
        cursor1.execute('SELECT COUNT(*) FROM user WHERE username=%s', (username,))
        if cursor1.fetchone()[0] > 0:
            return jsonify(status="error", message="Username already exists")

        hashed_password = generate_password_hash(password)
        cursor1.execute('INSERT INTO user (username, password) VALUES (%s, %s)', (username, hashed_password,))
        connection1.commit()

        return jsonify(status="success", message="Registered successfully!")
    else:
        return render_template('register.html')
    

    
#===============================================


#編輯任務名
@app.route('/edit-task', methods=['POST'])
def edit_task():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify(status="error", message="User not logged in")
    
    data = request.get_json()
    taskId = data['taskId']
    newTaskName = data['newTaskName']

    try:
        cursor1.execute('UPDATE tasks SET taskname=%s WHERE id=%s AND user_id=%s', (newTaskName, taskId, user_id,))
        connection1.commit()
        return jsonify(status="success", message="Task updated successfully")
    except:
        return jsonify(status="error", message="Error updating task")



#===============================================


#刪除任務
@app.route('/delete_task', methods=['POST'])
def delete_task():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify(status="error", message="User not logged in")
    
    data = request.get_json()
    taskId = data['taskId']

    try:
        cursor1.execute('DELETE FROM tasks WHERE id=%s AND user_id=%s', (taskId, user_id,))
        connection1.commit()
        return jsonify(status="success", message="Task delete successfully")
    except  Exception as e:
        print(e)
        return jsonify(status="error", message="Error delete task")


#===============================================


#抓所有任務(總表格)

status_mapping = {
    "Edit": "待編輯",
    "Vetting": "主管審核中",
    "Checklist": "法尊審核中",
    "Posting": "已公告"
}


@app.route('/get_all_tasks', methods=['GET', 'POST'])
def get_all_tasks():
    
    try:
        # 使用LEFT JOIN確保即使某些任務沒有執行人也能被選中
        cursor1.execute('''
            SELECT tasks.*, user.username 
            FROM tasks 
            LEFT JOIN user ON tasks.user_id = user.user_id 
            ORDER BY user.username, tasks.status
        ''')
        tasks = cursor1.fetchall()
        tasks_list = []

        for task in tasks:
            username = task[-1] if task[-1] else "Unknown"  # 從查詢結果中獲取用戶名稱，如果為None則設置為"Unknown"
            status_description = status_mapping.get(task[5], "未知狀態")  # 使用get方法，如果找不到對應的key，則返回"未知狀態"

            task_dict = {
                'id': task[0],
                'name': task[6],
                'status': status_description,
                'executor': username,
                'editdate': task[7],
                'deadline': task[8]
            }
            tasks_list.append(task_dict)
        
        return jsonify(status="success", message="get all tasks data successfully", tasks=tasks_list)
    except  Exception as e:
        print(e)
        return jsonify(status="error", message="Error get task")
#===============================================


#儲存客群資訊
@app.route('/path/to/save/audience', methods=['POST'])
def save_audience_data():

    user_id = session.get('user_id')
    if not user_id:
        return jsonify(status="error", message="User not logged in")
    
    data = request.get_json()

    # 檢查是否已存在相同的 targetAudience, spaceTime, 和 otherFeature
    cursor1.execute(
        """
        SELECT * FROM audience 
        WHERE targetAudience = %s AND spaceTime = %s AND otherFeature = %s AND user_id = %s
        """, 
        (data['targetAudience'], data['spaceTime'], data['otherFeature'], user_id,)
    )
    existing_entry = cursor1.fetchone()


    # 把資料存入數據庫
    try:
        if existing_entry:
            cursor1.execute(
                """
                UPDATE audience SET age1 = %s, age2 = %s, salary1 = %s, salary2 = %s, gender = %s, 
                marriage = %s, child = %s, riskOverwhelming = %s, socialParticipate = %s
                WHERE targetAudience = %s AND spaceTime = %s AND otherFeature = %s AND user_id = %s
                """, 
                ( 
                data['age1'],
                data['age2'],
                data['salary1'], 
                data['salary2'], 
                data['gender'],
                data['marriage'],
                data['child'],
                data['riskOverwhelming'],
                data['socialParticipate'],
                data['targetAudience'],
                data['spaceTime'],
                data['otherFeature'],
                user_id
                )
            )
            connection1.commit()  # 這行是必要的，以確保更新被保存到數據庫中
            return jsonify(status="success", message="Audience data updated successfully")        
        else:
            # 如果不存在，則插入新的條目
            cursor1.execute(
                """
                INSERT INTO audience (targetAudience, age1, age2, salary1, salary2, gender, marriage, 
                child, spaceTime, riskOverwhelming, socialParticipate, otherFeature, user_id) 
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, 
                (
                    data['targetAudience'], 
                    data['age1'],
                    data['age2'],
                    data['salary1'], 
                    data['salary2'], 
                    data['gender'],
                    data['marriage'],
                    data['child'],
                    data['spaceTime'],
                    data['riskOverwhelming'],
                    data['socialParticipate'],
                    data['otherFeature'],
                    user_id
                )
            )

            connection1.commit()
            return jsonify(status="success", message="Audience data saved successfully")
        
    except Exception as e:
        return jsonify(status="error", message=str(e))



#===============================================



#儲存產品資訊
@app.route('/path/to/save/product', methods=['POST'])
def save_product_data():

    user_id = session.get('user_id')
    if not user_id:
        return jsonify(status="error", message="User not logged in")
    
    data = request.get_json()

    # 檢查是否已存在相同的 targetAudience, spaceTime, 和 otherFeature
    cursor1.execute(
        """
        SELECT * FROM product 
        WHERE productName = %s AND productType = %s AND productImage = %s AND user_id = %s
        """,
        (data['productName'], data['productType'], data['productImage'], user_id)
    )
    existing_entry = cursor1.fetchone()

    # 把資料存入數據庫
    try:
        if existing_entry:
            cursor1.execute(
                """
                UPDATE product SET productFeature = %s, discount = %s, activityMethod = %s, advantage = %s, disadvantage = %s, 
                productStory = %s, productDeadline = %s, afterService = %s, howToPurchase = %s, purchaseCondition= %s, numlimit= %s
                WHERE productName = %s AND productType = %s AND productImage = %s AND user_id = %s
                """,
                ( 
                data['productFeature'],
                data['discount'],
                data['activityMethod'], 
                data['advantage'], 
                data['disadvantage'],
                data['productStory'],
                data['productDeadline'],
                data['afterService'],
                data['howToPurchase'],
                data['purchaseCondition'],
                data['numlimit'],
                data['productName'],
                data['productType'],
                data['productImage'],
                user_id
                )
            )
            connection1.commit()  # 這行是必要的，以確保更新被保存到數據庫中
            return jsonify(status="success", message="Product data updated successfully")
        else:
            cursor1.execute(
            """
            INSERT INTO product 
            (productName, productType, productFeature, productImage, discount, 
            activityMethod, advantage, disadvantage, productStory, productDeadline, 
            afterService, howToPurchase, purchaseCondition, numlimit, user_id)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, 
            (
                data['productName'], #productName
                data['productType'], #productType
                data['productFeature'], #productFeature
                data['productImage'], #productImage
                data['productDiscount'], #discount
                data['activityMethod'], #activityMethod
                data['productAdvantage'], #advantage
                data['productDisadvantage'], #disadvantage
                data['productStory'], #productStory
                data['deadline'], #productDeadline
                data['afterservice'], #afterService
                data['productPurchase'], #howToPurchase
                data['purchaseRule'], #purchaseCondition
                data['numlimit'], #numlimit
                user_id
            )
        )
        connection1.commit()
        return jsonify(status="success", message="Product data saved successfully")
    
    except Exception as e:
        return jsonify(status="error", message=str(e))
    


#===============================================



#顯示modal客群資訊
@app.route('/showAudiences', methods=['POST'])
def showAudiences():
    user_id = session.get('user_id')
    showSample = request.args.get('showSample', default='false').lower() == 'true'

    

    try:
        if showSample:
            sql = """
            SELECT targetAudience, otherFeature, spaceTime
            FROM audience
            WHERE isSample = 1
            """
            cursor1.execute(sql)
        else:
            if not user_id:
                return jsonify(status="error", message="User not logged in")
            
            # Execute SQL
            sql = """
            SELECT targetAudience, otherFeature, spaceTime
            FROM audience
            WHERE user_id = %s
            """
            cursor1.execute(sql, (user_id,))

        # Fetch all rows
        result = cursor1.fetchall()
    
    
        return jsonify(status="success", data=result)
    
    except Exception as e:
        return jsonify(status="error", message=str(e))


#===============================================


#顯示product產品資訊
@app.route('/showProducts', methods=['POST'])
def showProducts():
    # 建立連接
    connection = pymysql.connect(charset='utf8mb4', **db_settings1)
    cursor = connection.cursor()
    
    user_id = session.get('user_id')
    if not user_id:
        return jsonify(status="error", message="User not logged in")
    

    try:
        # Execute SQL
        sql = """
        SELECT productName, productType, productImage
        FROM product
        WHERE user_id = %s
        """
        cursor.execute(sql, (user_id,))
        # Fetch all rows
        result = cursor.fetchall()
    
    
        return jsonify(status="success", data=result)
    
    except Exception as e:
        return jsonify(status="error", message=str(e))

    

#===============================================


#在主頁抓取先前輸入過的值(產出頁回到客群產品頁)
@app.route('/get_previous_data', methods=['POST'])
def get_previous_data():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify(status="error", message="User not logged in")

    data = request.get_json()
    taskId = data['taskId']

    # 從tasks表格中取得audience_id和product_id
    cursor1.execute('SELECT audience_id, product_id FROM tasks WHERE id=%s AND user_id=%s', (taskId, user_id))
    task_data = cursor1.fetchone()
    if not task_data:
        return jsonify(status="error", message="Task not found")

    audience_id = task_data[0]
    product_id = task_data[1]

    # 使用audience_id從資料庫中取得audience資料
    cursor1.execute('SELECT * FROM audience WHERE user_id=%s AND audience_id=%s', (user_id, audience_id))
    row = cursor1.fetchone()
    columns = [desc[0] for desc in cursor1.description]
    audience_data = dict(zip(columns, row))

    # 使用product_id從資料庫中取得product資料
    cursor1.execute('SELECT * FROM product WHERE user_id=%s AND product_id=%s', (user_id, product_id))
    row = cursor1.fetchone()
    columns = [desc[0] for desc in cursor1.description]
    product_data = dict(zip(columns, row))


    return jsonify(status="success", audience=audience_data, product=product_data)




#將所有客群貼至欄位
@app.route('/getFullAudienceRecord', methods=['POST'])
def getFullAudienceRecord():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify(status="error", message="User not logged in")
    

    data = request.get_json()
    targetAudience = data.get('targetAudience')
    otherFeature = data.get('otherFeature')
    spaceTime = data.get('spaceTime')

    try:
        sql = """
        SELECT * 
        FROM audience 
        WHERE targetAudience = %s AND otherFeature = %s AND spaceTime = %s AND (user_id = %s OR user_id IS NULL)
        """
        cursor1.execute(sql, (targetAudience, otherFeature, spaceTime, user_id))
        result = cursor1.fetchone()

        return jsonify(status="success", data=result)
    except Exception as e:
        return jsonify(status="error", message=str(e))
        


#===============================================


#刪除客群
@app.route('/deleteAudience', methods=['POST'])
def delete_audience():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify(status="error", message="User not logged in")
    
    audience_data = request.json
    
    try:        
        sql = """
        DELETE FROM audience
        WHERE targetAudience=%s AND otherFeature=%s AND spaceTime=%s AND user_id=%s
        """
        cursor1.execute(sql, (audience_data['targetAudience'], audience_data['otherFeature'], audience_data['spaceTime'], user_id))
        connection1.commit()
        return jsonify(status="success")
    
    except Exception as e:
        print(str(e))
        return jsonify(status="error", message=str(e))
    
    
#===============================================


#將所有產品貼至欄位
@app.route('/getFullProductRecord', methods=['POST'])
def getFullProductRecord():
    # 建立連接
    connection = pymysql.connect(charset='utf8mb4', **db_settings1)
    cursor = connection.cursor()

    user_id = session.get('user_id')
    if not user_id:
        return jsonify(status="error", message="User not logged in")
    

    data = request.get_json()
    productName = data.get('productName')
    productType = data.get('productType')
    productImage = data.get('productImage')
    try:
        sql = """
        SELECT * 
        FROM product 
        WHERE productName = %s AND productType = %s AND productImage = %s AND user_id = %s
        """
        cursor.execute(sql, (productName, productType, productImage, user_id))
        result = cursor.fetchone()

        return jsonify(status="success", productdata=result)
    except Exception as e:
        return jsonify(status="error", message=str(e))
    

#===============================================


#刪除產品
@app.route('/deleteProduct', methods=['POST'])
def delete_product():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify(status="error", message="User not logged in")

    product_data = request.json

    try:
        sql = """
        DELETE FROM product
        WHERE productName=%s AND productType=%s AND productImage=%s
        """
        cursor1.execute(sql, (product_data['productName'], product_data['productType'], product_data['productImage']))
        connection1.commit()
        return jsonify(status="success")
    
    except Exception as e:
        print(str(e))
        return jsonify(status="error", message=str(e))


#===============================================


#大btn做儲存
@app.route('/storeData', methods=['POST'])
def store_data():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify(status="error", message="User not logged in")
    
    data = request.json
    audienceData = data['audienceData']
    productData = data['productData']
    task_id = data.get('task_id')
    date = data.get('date')

    query1 = """
    SELECT COUNT(*) 
    FROM audience 
    WHERE user_id = %s
    AND targetAudience = %s 
    AND age1 = %s 
    AND age2 = %s 
    AND salary1 = %s 
    AND salary2 = %s 
    AND gender = %s 
    AND marriage = %s 
    AND child = %s 
    AND spaceTime = %s 
    AND riskOverwhelming = %s 
    AND socialParticipate = %s
    AND otherFeature = %s
    """
    cursor1.execute(query1, (user_id, audienceData['targetAudience'], audienceData['age1'], audienceData['age2'], audienceData['salary1'], audienceData['salary2'], audienceData['gender'], audienceData['marriage'], audienceData['child'], audienceData['spaceTime'], audienceData['riskOverwhelming'], audienceData['socialParticipate'] , audienceData['otherFeature']))
    count_audience = cursor1.fetchone()[0]

    # 檢查productData在ProductTable中是否存在
    query2 = """
    SELECT COUNT(*) 
    FROM product 
    WHERE user_id = %s
    AND productName = %s 
    AND productType = %s 
    AND productFeature = %s 
    AND productImage = %s 
    AND activityMethod = %s
    AND discount = %s 
    AND advantage = %s 
    AND disadvantage = %s 
    AND productStory = %s 
    AND productDeadline = %s 
    AND afterService = %s 
    AND howToPurchase = %s 
    AND purchaseCondition = %s 
    AND numLimit = %s   # 依此類推，加入你需要的所有欄位
    """

    cursor1.execute(query2, (user_id,
                            productData['productName'], 
                            productData['productType'], 
                            productData['productFeature'], 
                            productData['productImage'], 
                            productData['activityMethod'], 
                            productData['productDiscount'], 
                            productData['productAdvantage'], 
                            productData['productDisadvantage'], 
                            productData['productStory'], 
                            productData['deadline'], 
                            productData['afterservice'], 
                            productData['productPurchase'], 
                            productData['purchaseRule'], 
                            productData['numlimit']))
    count_product = cursor1.fetchone()[0]
    

    audience_id = None
    product_id = None

    if count_audience > 0:
        # 獲取現有的audience_id
        select_audience_id_query = """
        SELECT audience_id 
        FROM audience 
        WHERE user_id = %s
        AND targetAudience = %s 
        AND age1 = %s 
        AND age2 = %s 
        AND salary1 = %s 
        AND salary2 = %s 
        AND gender = %s 
        AND marriage = %s 
        AND child = %s 
        AND spaceTime = %s 
        AND riskOverwhelming = %s 
        AND socialParticipate = %s
        AND otherFeature = %s
        """
        cursor1.execute(select_audience_id_query, (user_id,
                                                  audienceData['targetAudience'], 
                                                  audienceData['age1'], 
                                                  audienceData['age2'], 
                                                  audienceData['salary1'], 
                                                  audienceData['salary2'], 
                                                  audienceData['gender'],
                                                  audienceData['marriage'],
                                                  audienceData['child'],
                                                  audienceData['spaceTime'],
                                                  audienceData['riskOverwhelming'],
                                                  audienceData['socialParticipate'],
                                                  audienceData['otherFeature'],
                                                  ))
        audience_id = cursor1.fetchone()[0]

    else:
        # 如果資料都不存在，插入它們
        insert_audience_query = """
        INSERT INTO audience (targetAudience, age1, age2, salary1, salary2, gender, 
        marriage, child, spaceTime, riskOverwhelming, socialParticipate, otherFeature, user_id) 
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        cursor1.execute(insert_audience_query, (audienceData['targetAudience'],
                                               audienceData['age1'],
                                               audienceData['age2'],
                                               audienceData['salary1'],
                                               audienceData['salary2'], 
                                               audienceData['gender'], 
                                               audienceData['marriage'],
                                               audienceData['child'],
                                               audienceData['spaceTime'],
                                               audienceData['riskOverwhelming'],
                                               audienceData['socialParticipate'], 
                                               audienceData['otherFeature'],
                                               user_id))
        audience_id = cursor1.lastrowid

    
    if count_product > 0:

        select_product_id_query = """
        SELECT product_id
        FROM product
        WHERE user_id = %s
        AND productName = %s
        AND productType = %s
        AND productFeature = %s
        AND productImage = %s
        AND activityMethod = %s
        AND discount = %s
        AND advantage = %s
        AND disadvantage = %s
        AND productStory = %s
        AND productDeadline = %s
        AND afterService = %s
        AND howToPurchase = %s
        AND purchaseCondition = %s
        AND numLimit = %s
        """
        cursor1.execute(select_product_id_query, (user_id, 
                                                 productData['productName'], 
                                                 productData['productType'],
                                                 productData['productFeature'], 
                                                 productData['productImage'], 
                                                 productData['activityMethod'], 
                                                 productData['productDiscount'], 
                                                 productData['productAdvantage'], 
                                                 productData['productDisadvantage'], 
                                                 productData['productStory'], 
                                                 productData['deadline'], 
                                                 productData['afterservice'], 
                                                 productData['productPurchase'], 
                                                 productData['purchaseRule'], 
                                                 productData['numlimit'],
                                                 ))
        product_id = cursor1.fetchone()[0]
        
    else:
        insert_product_query = """
        INSERT INTO product (productName, productType, productFeature, productImage, discount, 
        activityMethod, advantage, disadvantage, productStory, productDeadline, afterService, 
        howToPurchase, purchaseCondition, numLimit, user_id) 
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        cursor1.execute(insert_product_query, (productData['productName'], 
                                          productData['productType'],
                                          productData['productFeature'], 
                                          productData['productImage'], 
                                          productData['activityMethod'], 
                                          productData['productDiscount'], 
                                          productData['productAdvantage'], 
                                          productData['productDisadvantage'], 
                                          productData['productStory'], 
                                          productData['deadline'], 
                                          productData['afterservice'], 
                                          productData['productPurchase'], 
                                          productData['purchaseRule'], 
                                          productData['numlimit'], 
                                          user_id))
        product_id = cursor1.lastrowid

    if task_id:
        update_task_query = """
        UPDATE tasks SET audience_id = %s, product_id = %s, tasksdetetime = %s WHERE id = %s AND user_id = %s
        """
        cursor1.execute(update_task_query, (audience_id, product_id, date, task_id, user_id))
    else:
        # 此處加入插入到task表的代碼
        insert_task_query = """
        INSERT INTO tasks (user_id, audience_id, product_id, status, tasksdetetime) 
        VALUES (%s, %s, %s, 'Edit', %s)
        """
        cursor1.execute(insert_task_query, (user_id, audience_id, product_id, date))
        task_id = cursor1.lastrowid  # 這裡獲取資料庫自動生成的task_id
        

    session['task_id'] = task_id  # 儲存task_id到session中

    connection1.commit()
    return jsonify(status='success', audience_id=audience_id, product_id=product_id, task_id=task_id, date=date)


#===============================================


#儲存風格
@app.route('/save_style', methods=['POST'])
def save_style():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify(status="error", message="User not logged in")
    
    data = request.json
    task_id = data.get('task_id')
    style = data.get('style')
    keyword = data.get('keyword')
    contentstyle = data.get('contentstyle')
    selectedProposol = data.get('selectedProposol')
    # 檢查proposolContent是否為空或None，並設定為None如果它是
    proposolContent = data.get('proposolContent') or None
    selectedshowOutput = data.get('selectedshowOutput')



    try:
        insert_custom_value_query = """
        INSERT INTO customvalue (style, keyword, contentStyle, proposol, proposolContent, showOutput, user_id)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        cursor1.execute(insert_custom_value_query, (style, keyword, contentstyle, selectedProposol, proposolContent, selectedshowOutput, user_id))

        # 獲取最近插入的customValue_id
        cursor1.execute("SELECT LAST_INSERT_ID()")
        customValue_id = cursor1.fetchone()[0]
        
        # 更新tasks表中的相應task_id條目
        update_tasks_query = """
        UPDATE tasks
        SET customvalue_id = %s
        WHERE id = %s
        """
        cursor1.execute(update_tasks_query, (customValue_id, task_id))
        connection1.commit()
        return jsonify(status="success", message="風格已成功保存")
    
    except Exception as e:
        return jsonify(status="error", message=str(e))


#===============================================


#抓風格值
@app.route('/get_custom_value', methods=['POST'])
def get_user_customvalues():
    # 從request取得 user_id 和 task_id
    data = request.get_json()
    user_id = data.get('user_id')
    task_id = data.get('task_id')
    print('user_id',user_id)
    print('task_id',task_id)
    
    # 開始從資料庫取得資料
    connection = pymysql.connect(**db_settings1)
    try:
        with connection.cursor(pymysql.cursors.DictCursor) as cursor:
            # 首先根據 user_id 和 task_id 從 task 表格獲取 customvalue_id
            sql_task = """SELECT customvalue_id 
                          FROM tasks 
                          WHERE user_id=%s AND id=%s"""
            cursor.execute(sql_task, (user_id, task_id))
            task_result = cursor.fetchone()

            if task_result:
                customvalue_id = task_result.get('customvalue_id')

                # 接著使用 customvalue_id 從 customvalue 表格取得所需資料
                sql_customvalue = """SELECT style, keyword, contentStyle, proposol, showoutput 
                                    FROM customvalue
                                    WHERE customValue_id=%s"""
                cursor.execute(sql_customvalue, (customvalue_id,))
                result = cursor.fetchone()
                print('result:', result)
                return jsonify(status='success', data=result)
            else:
                return jsonify(status='error', message='No matching task found')
        
    except Exception as e:
        return jsonify(status='error', message=str(e))
        

#===============================================


#若為aida則呼叫此路由儲存產出結果
@app.route('/save_output_aida', methods=['POST'])
def save_output_aida():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify(status="error", message="User not logged in")

    data = request.json
    # 將 data 解析並存儲至資料庫
    taskId = data.get("taskId")
    showoutput = data.get("showOutput")
    investment = data.get('Investment')

    # 查詢當前的 times 值
    cursor1.execute("SELECT MAX(timess) FROM output WHERE user_id = %s AND task_id = %s", (user_id, taskId))
    current_times = cursor1.fetchone()[0]
    if current_times is None:
        times_value = 1
    else:
        times_value = current_times + 1

    # 針對aida的數據結構處理
    for key, steps_data in data.items():
        if key not in ["step1_2", "step3_4"]:
            continue
        
        
        for step, attributes in steps_data.items():
            if "Step" not in step:
                continue
            
            step_number = step
            main_list = attributes.get("Main_list", None)
            main_slogan = attributes.get("Main_slogan", None)
            point1 = attributes.get("Point1", None)
            point2 = attributes.get("Point2", None)
            point3 = attributes.get("Point3", None)
            point_desc1 = attributes.get("Point_desc1", None)
            point_desc2 = attributes.get("Point_desc2", None)
            point_desc3 = attributes.get("Point_desc3", None)
            preferential = attributes.get("Preferential", None)
            product = attributes.get("Product", None)
            extra = attributes.get("Extra information", None)
            content_1 = attributes.get("Content_1", None)
            content_2 = attributes.get("Content_2", None)
            content = attributes.get("Content", None)

            try:
                insert_output = """
                INSERT INTO output(step_number, Main_list, Main_slogan, Point1, Point2, Point3, Point_desc1, Point_desc2, Point_desc3, Preferential, Product, Extra_information, Content_1, Content_2, Content, user_id, timess, task_id, showoutput, investmentAlert) 
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"""

                cursor1.execute(insert_output, (step_number, main_list, main_slogan, point1, point2, point3, point_desc1, point_desc2, point_desc3, preferential, product, extra, content_1, content_2, content, user_id, times_value, taskId, showoutput, investment))
                connection1.commit()

            except Exception as e:
                print("Error:", str(e))
                return jsonify(status="error", message=str(e))
            
    return jsonify(status="success", message="輸出已成功保存")



#===============================================


#儲存產出結果
@app.route('/save_output', methods = ['POST'])
def save_output():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify(status="error", message="User not logged in")
    

    data = request.json
     # 將 data 解析並存儲至資料庫
    taskId = data.get("taskId")
    showoutput = data.get("showOutput")
    investment = data.get('Investment')


    # 查詢當前的 times 值
    cursor1.execute("SELECT MAX(timess) FROM output WHERE user_id = %s AND task_id = %s", (user_id, taskId))
    current_times = cursor1.fetchone()[0]
    if current_times is None:
        times_value = 1
    else:
        times_value = current_times + 1


    for step, attributes in data.items():
        if "Step" not in step:
            continue
        
        step_number = step
        main_list = attributes.get("Main_list", None)
        main_slogan = attributes.get("Main_slogan", None)
        point1 = attributes.get("Point1", None)
        point2 = attributes.get("Point2", None)
        point3 = attributes.get("Point3", None)
        point_desc1 = attributes.get("Point_desc1", None)
        point_desc2 = attributes.get("Point_desc2", None)
        point_desc3 = attributes.get("Point_desc3", None)
        preferential = attributes.get("Preferential", None)
        product = attributes.get("Product", None)
        extra = attributes.get("Extra information", attributes.get("Extra_information", None))
        content_1 = attributes.get("Content_1", None)
        content_2 = attributes.get("Content_2", None)
        content = attributes.get("Content", None)
        

        try:
            insert_output = """
            INSERT INTO  output(step_number, Main_list, Main_slogan, Point1, Point2, Point3, Point_desc1, Point_desc2, Point_desc3, Preferential, Product, Extra_information, Content_1, Content_2, Content, user_id, timess, task_id, showoutput, investmentAlert) 
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"""

            cursor1.execute(insert_output, (step_number, main_list, main_slogan, point1, point2, point3, point_desc1, point_desc2, point_desc3, preferential, product, extra, content_1, content_2, content, user_id, times_value, taskId, showoutput, investment))
            connection1.commit()
            
        except Exception as e:
            print("Error:", str(e))
            return jsonify(status="error", message=str(e))
        
    return jsonify(status="success", message="輸出已成功保存")



#===============================================


#抓當前使用者id(用在產出結果頁)
@app.route('/get-user-id', methods=['GET'])
def get_user_id():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify(status="error", message="User not logged in")
    
    return jsonify({"user_id": user_id})



#===============================================


#抓當前產出結果的版本(用在產出結果頁)
@app.route('/get_versions', methods=['POST'])
def get_versions():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify(status="error", message="User not logged in")
    
    data = request.json
    task_id = data['task_id']


    try:
        # 查詢所有不同的timess值
        sql = """
        SELECT DISTINCT timess, showoutput
        FROM output
        WHERE user_id = %s
        AND task_id = %s
        ORDER BY timess
        """
        cursor1.execute(sql, (user_id, task_id))
        result = cursor1.fetchall()

        # 提取所有的timess值和對應的showoutput值
        versions = [{"version": item[0], "showoutput": item[1]} for item in result]
        latest_version = versions[-1]['version'] if versions else 1
        return jsonify(status="success", versions=versions, latest_version=latest_version)
    
    except Exception as e:
        return jsonify(status="error", message=str(e))



#===============================================


#抓產出結果
@app.route('/get_output', methods = ['POST'])
def get_output():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify(status="error", message="User not logged in")
    
    data = request.json
    task_id = data['task_id']
    showoutput = data['showoutput']
    version = data['version']

    try:
        sql = """
        SELECT *
        FROM output
        WHERE user_id = %s
        AND task_id = %s
        AND timess = %s
        AND showoutput = %s
        """
        cursor1.execute(sql,(user_id, task_id, version, showoutput))
        result = cursor1.fetchall()

        return jsonify(status="success", data=result)
        
    except Exception as e:
        return jsonify(status="error", message=str(e))
    
    

#===============================================


#編輯產出結果
@app.route('/update_outputdata', methods = ['POST'])
def update_outputdata():
    data = request.json
    user_id = session.get('user_id')
    step = data.get('step')
    task_id = data.get('task_id')
    section = data.get('section')
    updated_data = data.get('data')
    imstep = 'Step '+ step
    timess = data.get('timess')


    if not user_id:
        return jsonify(status="error", message="User not logged in")

    try:
        with connection1.cursor() as cursor:
            cursor.execute("SET SQL_SAFE_UPDATES = 0;")
            # 根據部分來決定SQL語句
            if section == "EDM":
                sql = """
                UPDATE output
                SET Main_slogan = %s, Main_list = %s, Point1 = %s, Point2 = %s, Point3 = %s, Point_desc1 = %s, Point_desc2 = %s, Point_desc3 = %s, Preferential = %s, Product = %s
                WHERE user_id = %s AND step_number = %s AND task_id = %s AND timess = %s
                """
                values = (updated_data['edm_mainview'], updated_data['edm_mainlist'], updated_data['edm_point1'], updated_data['edm_point2'], updated_data['edm_point3'], updated_data['edm_disc1'], updated_data['edm_disc2'], updated_data['edm_disc3'], updated_data['edm_discount'], updated_data['edm_production'], user_id, imstep, task_id, timess)

            elif section == "LINE":
                sql = """
                UPDATE output
                SET Main_slogan = %s, Main_list = %s, Content_1 = %s, Content_2 = %s, Extra_information = %s
                WHERE user_id = %s AND step_number = %s AND task_id = %s AND timess = %s
                """
                values = (updated_data['line_mainview'], updated_data['line_mainpoint'], updated_data['line_content1'], updated_data['line_content2'], updated_data['line_extra'],user_id, imstep, task_id, timess)

            elif section == "MBN":
                sql = """
                UPDATE output
                SET Main_slogan = %s, Main_list = %s, Content = %s, Extra_information = %s
                WHERE user_id = %s AND step_number = %s AND task_id = %s AND timess = %s
                """
                values = (updated_data['mbn_mainview'], updated_data['mbn_mainlist'], updated_data['mbn_content'], updated_data['mbn_extra'], user_id, imstep, task_id, timess)
                
            cursor.execute(sql, values)
                
            cursor.execute("SET SQL_SAFE_UPDATES = 1;")   
            connection1.commit()

        return jsonify(status="success", message="Data updated successfully", data={"step": imstep})
    except Exception as e:
        return jsonify(status="error", message=str(e))



#===============================================

#


# 映射showOutput字串到具體的欄位名稱
OUTPUT_MAPPING = {
    "EDM": ["step_number", "Main_list", "Main_slogan", "Point1", "Point2", "Point3", "Point_desc1", "Point_desc2", "Point_desc3", "Preferential", "Product"],
    "LINE": ["step_number", "Main_list", "Main_slogan", "Content_1", "Content_2", "Extra_information"],
    "MBN": ["step_number", "Main_list", "Main_slogan", "Content", "Extra_information"]
}



#@app.route('/get_data_to_nextpage', methods = ['POST'])
#def get_data_to_nextpage():
#    data = request.json
#    user_id = data['user_id']
#    task_id = data['task_id']
#    timess = data['timess']
#    showoutput = data['showoutput']

    # 根據showOutput字串取得具體的欄位名稱
#    columns = OUTPUT_MAPPING.get(showoutput, [])

#    cursor = connection1.cursor(pymysql.cursors.DictCursor)

#    columns_str = ", ".join(columns)
#    sql = f"SELECT {columns_str} FROM output WHERE user_id=%s AND task_id=%s AND timess=%s ORDER BY step_number"
#    cursor.execute(sql, (user_id, task_id, timess))
#    results = cursor.fetchall()
#    print(type(results[0]))

    # 整理資料
#    text = ""
#    for row in results:

#        for column in columns:
#            text += f"{row[column]}\n"
#        text += "\n"

#    return text



#===============================================


#抓任務資料(用在editable)
@app.route('/get_task_data', methods=['POST'])
def get_task_data():
    data = request.json
    task_id = data.get('task_id')

    with connection1.cursor(pymysql.cursors.DictCursor) as cursor:
        # 從tasks表中獲取資料
        cursor.execute("SELECT * FROM tasks WHERE id=%s ", (task_id))
        task = cursor.fetchone()

        # 從其他表中獲取相關資料
        cursor.execute("SELECT * FROM audience WHERE audience_id=%s", (task['audience_id'],))
        audience = cursor.fetchone()

        cursor.execute("SELECT * FROM product WHERE product_id=%s", (task['product_id'],))
        product = cursor.fetchone()

        cursor.execute("SELECT * FROM customvalue WHERE customvalue_id=%s", (task['customvalue_id'],))
        customvalue = cursor.fetchone()

        cursor.execute("SELECT * FROM user WHERE user_id=%s", (task['user_id'],))
        user = cursor.fetchone()



        # 從output表中獲取屬於該user和task的所有版本的output
        cursor.execute("SELECT DISTINCT timess FROM output WHERE task_id=%s", (task_id))
        versions = cursor.fetchall()


        return jsonify({
        'audience': audience,
        'product': product,
        'customvalue': customvalue,
        'user': user,
        'task': task,
        'versions': [version['timess'] for version in versions]
    })


#===============================================


#抓版本的output(用在editable)
@app.route('/get_version_data', methods=['POST'])
def get_version_data():
    data = request.json
    task_id = data.get('task_id')
    version = data.get('version')
    user_id = session.get('user_id')

    steps = []


    with connection1.cursor(pymysql.cursors.DictCursor) as cursor:
        # 從tasks表格中獲取customvalue_id
        cursor.execute("SELECT customvalue_id FROM tasks WHERE id=%s", (task_id,))
        result = cursor.fetchone()
        customvalue_id = result['customvalue_id'] if result else None

        # 如果customvalue_id存在，從customvalue表格中查找相應的值
        customvalue_data = {}
        if customvalue_id:
            cursor.execute("SELECT * FROM customvalue WHERE customValue_id=%s", (customvalue_id,))
            customvalue_data = cursor.fetchone()



    with connection1.cursor(pymysql.cursors.DictCursor) as cursor:
        cursor.execute("SELECT * FROM output WHERE task_id=%s AND user_id=%s AND timess=%s", (task_id, user_id, version))
        outputs = cursor.fetchall()

        for output in outputs:
            step_content = ""
            for column in OUTPUT_MAPPING.get(output['showoutput'], []):
                value = output[column] or ""
                step_content += str(value) + "\n"
            steps.append(step_content.strip())

    return jsonify({
        'steps': steps,
        'customvalue_data': customvalue_data
    })

#===============================================

@app.route('/saving_editable', methods = ['POST'])
def saving_editable():
    data = request.json
    task_id = data.get('task_id')
    fileName = data.get('fileName')
    imdeadline = data.get('imdeadline')

    try:
        with connection1.cursor() as cursor:
            # Create a new record
            sql = "UPDATE `tasks` SET `taskname` = %s, `deadline` = %s WHERE `id` = %s"
            cursor.execute(sql, (fileName, imdeadline, task_id))
        
        # connection is not autocommit by default. So you must commit to save your changes.
        connection1.commit()

        return jsonify(status="success", message="Data saved successfully")
    except Exception as e:
        print(e)
        return jsonify(status="error", message="Error saving data")




# 读取数据到DataFrame
def read_mysql_data():
    from app import app_bp  
    sql = """
    SELECT q.question, q.ad_inf, 
    CONCAT(c.category_num, '、',  c.category_name) AS category, 
    CONCAT(q.category_num, '、',  q.question_num, '.') AS QN
    FROM question q
    INNER JOIN category c ON q.category_num = c.category_num
    """
    
    cursor2.execute(sql)  # 執行SQL查詢
    data = cursor2.fetchall()

    # 將查询结果转换为向量
    check_list = [row[0] for row in data]
    support_data = [row[1] if row[1] else "無" for row in data]
    class_list = [row[2] for row in data]
    QN_list = [row[3] for row in data]
    
    return check_list, support_data, class_list, QN_list




def number_to_chinese(num):
    # 單位的中文數字
    chinese_numerals = ["", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"]
    
    if 1 <= num <= 10:
        return chinese_numerals[num]
    # ***若預期超過十個類別，需要擴充這個功能***


#===============================================



#讀類別+題目
@app.route("/my-new-route")
def index():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify(status="error", message="User not logged in")
    
    # 檢查用戶是否已有選擇的問題
    cursor2.execute("SELECT COUNT(*) FROM selectedq WHERE user_id = %s", (user_id,))
    if cursor2.fetchone()[0] == 0:
        # 用戶沒有選擇的問題，為他們插入預設問題
        default_questions = [2, 3, 4, 5, 12, 13, 14, 15, 16, 18, 19, 20, 21, 22, 23, 24, 27, 29, 30, 31, 32, 33, 37]  # 這裡的數字是預設問題的ID，可以根據需要更改
        for question_id in default_questions:
            cursor2.execute("INSERT INTO selectedq (user_id, question_id, btnname) VALUES (%s, %s, '信託業務')", (user_id, question_id))

        # 提交更改
        connection2.commit()
    

    # 從數據庫獲取所有已選問題的ID
    cursor2.execute("SELECT question_id FROM selectedq WHERE btnname='信託業務' AND user_id = %s", (user_id,))
    selected_questions = [row[0] for row in cursor2.fetchall()]

    
    # 首先從類別表中獲取所有的大標題
    cursor2.execute("""
    SELECT * FROM category
    ORDER BY
    CASE 
        WHEN category_num = '一' THEN 1
        WHEN category_num = '二' THEN 2
        WHEN category_num = '三' THEN 3
        WHEN category_num = '四' THEN 4
        WHEN category_num = '五' THEN 5
        WHEN category_num = '六' THEN 6
        WHEN category_num = '七' THEN 7
        WHEN category_num = '八' THEN 8
        WHEN category_num = '九' THEN 9
        WHEN category_num = '十' THEN 10
        ELSE 9999
    END
    """)
    category = cursor2.fetchall()
    
    
    html_rows = ""
    
    for imcategory in category:
        category_num, category_name = imcategory

        # 增加大標題的行
        html_rows += f'''
        <tr class="title_tr" id="category{category_num}">
        <td></td>
        <td class="title_text">{category_num}、{category_name}</td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        </tr>
        '''
        
        # 接著獲取此大標題下的所有小標題
        cursor2.execute("""SELECT id_question, question, question_num FROM question 
                       WHERE category_num = %s
                       ORDER BY id_question""", (category_num,))
        question = cursor2.fetchall()
        
        for imquestion in question:
            
            id_question, question, question_num = imquestion
            data_question_value = f'{category_num}|{question_num}'

            # 檢查問題是否已選擇
            checked_str = 'checked' if id_question in selected_questions else ''
            
            html_rows += f'''
             <tr data-id="{id_question}">
                <td style="width: 50px; text-align: center;">
                    <a href="#" class="edit_link">編輯</a>
                </td>
                <td>{question_num}.{question}</td>
                <td>
                    <input type="checkbox" class="yesCheckbox" {checked_str}>是
                    <input type="checkbox" class="sourceCheckbox">依指定來源
                </td>
                <td>
                    <input type="file" class="adifInput" style="width: 120px;" disabled>
                </td>
                <td style="text-align: center">
                    <button class="uploadButton" data-question="{data_question_value}">上傳</button>
                </td>
                <td>
                    <input type="file" class="fileInput" style="width: 120px;">
                </td>
                <td style="text-align: center">
                    <button class="onepickButton" data-question="{data_question_value}">單題審核</button>
                </td>
            </tr>
        '''
            
    # 讀取類別選項供<select>使用
    categoriesInSelect = [(category_num, category_name) for category_num, category_name in category]
       

    # 使用render_template渲染您的模板並插入動態數據
    return render_template('checklist_onepick.html', html_rows=html_rows, categoriesInSelect=categoriesInSelect)



#===============================================



@app.route("/alter_table")
def alter_table():
    # 首先從類別表中獲取所有的大標題
    cursor2.execute("""
    SELECT * FROM category
    ORDER BY
    CASE 
        WHEN category_num = '一' THEN 1
        WHEN category_num = '二' THEN 2
        WHEN category_num = '三' THEN 3
        WHEN category_num = '四' THEN 4
        WHEN category_num = '五' THEN 5
        WHEN category_num = '六' THEN 6
        WHEN category_num = '七' THEN 7
        WHEN category_num = '八' THEN 8
        WHEN category_num = '九' THEN 9
        WHEN category_num = '十' THEN 10
        ELSE 9999
    END
    """)
    category = cursor2.fetchall()

    html_rows = ""

    for imcategory in category:
        category_num, category_name = imcategory

        # 增加大標題的行
        html_rows += f'''
        <tr>
            <th>{category_num}、{category_name}</th>
            <th></th>
        </tr>
        '''

        # 接著獲取此大標題下的所有小標題
        cursor2.execute("""SELECT id_question, question, question_num FROM question 
                       WHERE category_num = %s
                       ORDER BY id_question""", (category_num,))
        question = cursor2.fetchall()

        for imquestion in question:
            id_question, question, question_num = imquestion
            data_question_value = f'{category_num}|{question_num}'

            html_rows += f'''
            <tr>
                <td>{question_num}.{question}</td>
                <td class = "center_box">
                    <input type="checkbox" class = "checkbox">是
                    <input type="checkbox" class = "checkbox">不適用
                </td>
            </tr>
            '''

    return render_template('checklist_table.html', html_rows=html_rows)








def get_question(big_title, small_title):
    from app import app_bp  
    cursor2.execute("""SELECT question, ad_inf FROM question 
                    WHERE category_num = %s AND question_num = %s""", 
                    (big_title, small_title))
    result = cursor2.fetchall()
    return result



#===============================================

@app.route("/ad_if", methods=['POST'])
def ad_if():
    data = request.get_json()
    big_title = data['big_title']
    small_title = data['small_title']
    fileContent = data['fileContent']

    cursor2.execute("UPDATE question SET ad_inf = %s WHERE category_num = %s AND question_num = %s", (fileContent, big_title, small_title))
    connection2.commit()

    return jsonify(status='success')




#===============================================



#寫類別進資料庫
@app.route("/add-category", methods=['POST'])
def add_category():
    new_category = request.form.get('category_name')


    # 查詢現有的類別數量
    cursor2.execute("SELECT COUNT(*) FROM category")
    current_count = cursor2.fetchone()[0]

     # 生成新的"大標題題號"
    new_category_num = number_to_chinese(current_count + 1)


    # 這裡只是簡單地插入一個新類別，實際操作可能需要更多的考慮
    cursor2.execute("INSERT INTO category (category_num, category_name) VALUES (%s, %s)", (new_category_num, new_category,))
    connection2.commit()
    return jsonify(status="success")



#===============================================




@app.route('/add_question', methods=['POST'])
def add_question():
    category = request.form.get('category')
    question_content = request.form.get('question_content')

    try:
        with connection2.cursor() as cursor:
            # 根據category找到該類別目前的最大題目題號
            cursor.execute("SELECT MAX(question_num) FROM question WHERE category_num=%s", (category,))
            max_id = cursor.fetchone()[0]

            if max_id is None:
                new_question_id = 1
            else:
                new_question_id = int(max_id) + 1

            # 插入新資料
            cursor.execute("INSERT INTO question (category_num, question_num, question) VALUES (%s, %s, %s)",
                           (category, new_question_id, question_content))

        connection2.commit()

        return jsonify(success=True, message="問題已成功新增!")
    except Exception as e:
        return jsonify(success=False, message=str(e))



#===============================================



@app.route('/update_question', methods=['POST'])
def update_question():
    id_question = request.form.get('id_question')
    new_question = request.form.get('new_question')

    
    cursor2.execute("UPDATE question SET question = %s WHERE id_question = %s", (new_question, id_question))
    connection2.commit()

    return jsonify(status='success')



#===============================================



@app.route('/delete_question', methods=['POST'])
def delete_question():
    id_question = request.form.get('id')

    # 先獲取要刪除的問題的類別和題目號
    cursor2.execute('SELECT category_num, question_num FROM question WHERE id_question = %s', (id_question,))
    category_num, question_num = cursor2.fetchone()

    try:
        cursor2.execute('DELETE FROM question WHERE id_question = %s', (id_question))
        connection2.commit()

        # 更新後面的題目號
        cursor2.execute('UPDATE question SET question_num = question_num - 1 WHERE category_num = %s AND question_num > %s', (category_num, question_num))
        connection2.commit()

        
    except Exception as e:
        connection2.rollback()  # 如果出現錯誤，回滾事務
        print(e)  # 打印錯誤到控制台，或者你也可以將其記錄到日志
        return jsonify(success=False, message="Database Error")

    return jsonify(success=True)



#===============================================



@app.route('/save_selected_questions', methods=['POST'])
def save_selected_questions():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify(status="error", message="User not logged in")
    
    data = request.get_json()
    selected_question_ids = data.get('selectedQuestions', [])

    try:
        # 删除旧记录
        cursor2.execute("DELETE FROM selectedq WHERE btnname='信託業務' AND user_id = %s", (user_id,))
        connection2.commit()

        for question_id in selected_question_ids:
            cursor2.execute("INSERT INTO selectedq (user_id, question_id, btnname) VALUES (%s, %s, '信託業務')", (user_id, question_id))
        connection2.commit()
        return jsonify({'status' : 'success'})
    except Exception as e:
        print("Error:", e)  # 打印錯誤信息
        return jsonify({'status': 'error', 'message': str(e)})
    


@app.route('/get_selected_questions', methods=['GET'])
def get_selected_questions():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify(status="error", message="User not logged in")
    
    cursor2.execute("SELECT question_id FROM selectedq WHERE user_id = %s", (user_id,))
    selected_question_ids = [row[0] for row in cursor2.fetchall()]

    return jsonify({'selectedQuestions': selected_question_ids})




@app.route('/get_questions_by_btn', methods=['GET'])
def get_questions_by_btn():
    try:
        user_id = session.get('user_id')
        if not user_id:
            return jsonify(status="error", message="User not logged in")
        btnname = request.args.get('btnname')
        
        # Fetch questions from the database based on the button name
        cursor2.execute("""
                        SELECT q.question, q.ad_inf,
                        CONCAT(c.category_num, '、',  c.category_name) AS category,
                        CONCAT(q.category_num, '、',  q.question_num, '.') AS QN
                        FROM selectedq s 
                        INNER JOIN question q ON s.question_id = q.id_question
                        INNER JOIN category c ON q.category_num = c.category_num
                        WHERE s.btnname = %s AND s.user_id = %s""", (btnname, user_id))
        data  = cursor2.fetchall()
        
        # Convert the results to a list of questions
        data_list = [{"question": row[0], "ad_inf": row[1], "category": row[2], "QN": row[3]} for row in data]
        return jsonify({'data_list': data_list})
    except Exception as e:
        print(f"Error: {e}")  # Print the error to the console
        return jsonify(status="error", message="Internal Server Error"), 500

    

def chinese_to_int(chinese):
    chinese_numerals = {'一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9, '十': 10}
    if chinese in chinese_numerals:
        return chinese_numerals[chinese]
    elif '十' in chinese:
        if chinese.index('十') == 0:
            return 10 + chinese_numerals.get(chinese[1], 0)
        else:
            return chinese_numerals[chinese[0]] * 10 + chinese_numerals.get(chinese[2], 0)
    return 0


    
@app.route('/counting_questions', methods=['GET', 'POST'])
def counting_questions():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify(status="error", message="User not logged in")
    
    dic_Obj = {}  # 为 dic_Obj 提供一个默认值
    
    # 1. 取得題目分類
    cursor2.execute("SELECT category_num, category_name FROM category")
    categories = cursor2.fetchall()

    categories = sorted(categories, key=lambda x: chinese_to_int(x[0]))


    # 2. 計算總題數
    total_questions = {}
    for category in categories:
        cursor2.execute("SELECT COUNT(*) FROM question WHERE category_num=%s", (category[0],))
        total_questions[category[0]] = cursor2.fetchone()[0]
    

    # 3. 計算檢查題數
    cursor2.execute("SELECT question_id FROM selectedq WHERE btnname='信託業務' AND user_id = %s", (user_id,))
    selected_question_ids = [row[0] for row in cursor2.fetchall()]

    checked_questions = {}
    for category in categories:
        cursor2.execute("SELECT COUNT(*) FROM question WHERE category_num=%s AND id_question IN %s", (category[0], selected_question_ids))
        checked_questions[category[0]] = cursor2.fetchone()[0]

    # 4. 獲取未符合/ 不適用
    if request.method == 'POST':
        session['dic_Obj'] = request.get_json().get('data', {})
        
        
    dic_Obj = session.get('dic_Obj', {})


    # 結果輸出
    for category in categories:
        print(f"{category[0]}、{category[1]}:  檢查題數 {checked_questions[category[0]]} / 總題數 {total_questions[category[0]]}")
    
    print(dic_Obj)  # 检查dic_Obj的值
    print(categories)  # 检查categories的值


    return render_template('checklist_page2.html', categories=categories, checked_questions=checked_questions, total_questions=total_questions, dic_Obj=dic_Obj)
        
    



@app.route('/marketing_home.html')
def marketing_home():
    return render_template('marketing_home.html')

@app.route('/marketing_style.html')
def marketing_style():
    return render_template('marketing_style.html')

@app.route('/marketing_output.html')
def marketing_output():
    return render_template('marketing_output.html')

@app.route('/editable.html')
def edit():
    return render_template('editable.html')

@app.route('/checklist_index.html')
def checklist_index():
    return render_template('checklist_index.html')

@app.route('/checklist_onepick.html')
def checklist_onepick():
    return render_template('checklist_onepick.html')

@app.route('/checklist_page2.html')
def checklist_page2():
    return render_template('checklist_page2.html')

@app.route('/checklist_detail.html')
def detail():
    return render_template('checklist_detail.html')

@app.route('/checklist_table.html')
def checklist_table():
    return render_template('checklist_table.html')


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=80, debug=False)
