# -*- coding: utf-8 -*-

import re
from datetime import datetime
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
#from config import OPEN_API_KEY, PINECONE_KEY, SERP_API_KEY
from langchain.chat_models import ChatOpenAI
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.llms import openai
import demoooo
import os
#from demoooo import initialize, get_my_agent
from werkzeug.utils import secure_filename
import time
import re
import openai
from flask import Blueprint
openai.api_key = "api_key"
openai.api_type = "api_type"
openai.api_base = "api_base"
openai.api_version = "api_version"



#embeddings = initialize()
#my_agent = get_my_agent()
#os.environ["OPENAI_API_KEY"] = "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"
app = Flask(__name__)
app_bp = Blueprint('app_bp', __name__)
CORS(app)

def extraction_output(output_text):

    output_dict = {}

    # 按"Step"关键字分割文本
    steps = re.split("Step|step", output_text)

    # 跳過第一個空元素
    for step in steps[1:]:

        step_content = step.strip()
        lines = step_content.split("\n")
        
        step_dict = {}
        current_key = ""
        for line in lines:
            if line.strip() == "":
                continue
            if "：" in line or ":" in line and len(line) > 3:
                split_line = re.split("\:|\：", line)
                if len(split_line) < 2:
                    continue
                key, value = split_line
                #print(key, value)
                current_key = key.strip()
                step_dict[current_key] = value.strip()
            else:
                #拼裝Main_list
                if current_key:
                    step_dict[current_key] += " " + line.strip()

        # 獲取Step
        step_number = "Step " + re.split("\:|\：", step)[0].strip()
        step_number = step_number.replace("_", "")
        # 字典包字典
        output_dict[step_number] = step_dict
        
        for step in output_dict:
            if 'Preferential' in output_dict[step]:
                output_dict[step]['Preferential'] = output_dict[step]['Preferential'].replace("—————-", "")
            if "Extra information" in output_dict[step]:
                output_dict[step]['Extra information'] = output_dict[step]['Extra information'].replace("—————-", "")
    return output_dict

def get_agent():
    embeddings = OpenAIEmbeddings()
    llm_chat = ChatOpenAI(temperature=0) #GPT-3.5-turbo 

    prompt_template = """
    #Assistant is a large language model in 富邦銀行. Always answer question with "Traditional Chinese"
    {query}
    """

    llm = ChatOpenAI(temperature=0, model_name="gpt-4")
    llm_chain = LLMChain(llm=llm, prompt=PromptTemplate.from_template(prompt_template))
    return llm_chain


@app_bp.route('/get_answer', methods=['POST'])
def process_input1():
    print("Entering /get_answer endpoint")
    prompt_query = request.get_json()['inputtext']
    print(prompt_query)
    """
    msg = [{"role": "user", "content": query}]
    response = openai.ChatCompletion.create(
            engine="gpt-35-turbo-16k",
            messages = msg,
            temperature=0.7,
            max_tokens=14000,
            top_p=0.95,
            frequency_penalty=0,
            presence_penalty=0,
            stop=None)
    #token=response["usage"]["total_tokens"]
    data = response["choices"][0]["message"]["content"].strip()    
    #query = request.get_json()['inputtext']
    #Ai_response = my_agent(query)
    #Ai_response = my_agent.run(user_input)
    """
    data1 = """Step 1:
    Main_slogan：職場新鮮人的投資困擾，我們來解決！
    Main_list：
    1. 物價上漲，生活壓力增加
    2. 投資知識不足，無法有效理財
    3. 薪水微薄，無法大筆投資
    4. 投資風險高，怕踩雷
    Point1：物價上漲的壓力
    Point_desc1：面對物價上漲，生活成本增加，你是否感到壓力山大？
    Point2：投資知識的匱乏
    Point_desc2：投資知識不足，讓你在理財路上如履薄冰，無法有效運用資金。
    Point3：薪水微薄的困擾
    Point_desc3：薪水微薄，無法大筆投資，你是否感到無力？
    Product：數位理財奈米投，你的理財好夥伴
    Preferential：只需1000元，即可投資10-15檔ETF，申購贖回免手續費，只收信託管理費。
    Content：奈米投讓您以小額資金開始投資，並由專家每日觀察市場變化，主動平衡投資組合，讓您輕鬆理財，無需花費大量時間。
    Extra information：想了解更多？點擊此網址了解詳情 --> {網址}
    Content_1：1. 只需1000元台幣，即可投資10-15檔ETF。 2. 申購贖回免手續費，只收信託管理費。 3. 專家每日觀察市場變化，主動平衡投資組合。 
    Content_2：奈米投的優勢在於，我們在2022年榮獲9項國內外獎項肯定，並且提供專家每日觀察市場變化的售後服務。 

    Step 2:
    Main_slogan：未來的壓力，讓我們一起面對！
    Main_list：
    1. 投資策略的選擇困難
    2. 市場變化的不確定性
    3. 投資風險的恐懼
    4. 資金運用的無助
    Point1：投資策略的選擇困難
    Point_desc1：面對眾多投資策略，你是否感到迷茫，不知所措？
    Point2：市場變化的不確定性
    Point_desc2：市場變化無常，你是否感到恐懼，不敢輕易投資？
    Point3：投資風險的恐懼
    Point_desc3：投資風險高，你是否感到害怕，不敢踏出第一步？
    Product：數位理財奈米投，讓你安心投資
    Preferential：專家每日觀察市場變化，主動平衡投資組合，讓你投資無憂。
    Content：奈米投的定時定額投資策略，讓您的小額資金積累成大財富。您可以自行選擇外債ETF、台灣股票ETF組合，並由專家每日觀察市場變化，主動平衡投資組合，避免市場波動影響投資。
    Extra information：立即行動，讓您的資金積少成多 --> {網址}
    Content_1：1. 可自行選擇外債ETF、台灣股票ETF組合，共4種組合。 2. 申購奈米投滿六個月且為負報酬者，可享六個月免信託管理費！ 3. 有富邦網路銀行帳號即可線上申購。 
    Content_2：奈米投的優勢在於，我們提供專家每日觀察市場變化的售後服務，並且基金投資免手續費且免信託管理費。 

    Step 3:
    Main_slogan：新鮮人的轉變，從數位理財奈米投開始！
    Main_list：
    1. 提供多種投資組合選擇
    2. 專家每日觀察市場變化
    3. 申購贖回免手續費
    4. 2022年榮獲9項國內外獎項肯定
    Point1：多種投資組合的選擇
    Point_desc1：數位理財奈米投提供多種投資組合，讓你根據自己的需求選擇。
    Point2：專家的市場觀察
    Point_desc2：專家每日觀察市場變化，主動平衡投資組合，讓你投資無憂。
    Point3：免手續費的優惠
    Point_desc3：申購贖回免手續費，只收信託管理費，讓你的投資更划算。
    Product：數位理財奈米投，你的理財轉變開始
    Preferential：申購奈米投滿六個月且為負報酬者，可享六個月免信託管理費！
    Content：奈米投以定時定額投資的方式，讓你的薪水升值，滿足你的投資需求。只要1000元台幣，就能投資10-15檔ETF，且申購贖回免手續費，只收信託管理費。我們的專家每日觀察市場變化，主動平衡投資組合，讓你的投資更有保障。選擇奈米投，就是選擇最佳的投資策略。
    Extra information：想了解更多奈米投的資訊，請前往我們的網站--> {網址}
    Content_1：1. 只需1000元台幣，即可投資10-15檔ETF。 2. 申購贖回免手續費，只收信託管理費。 3. 專家每日觀察市場變化，主動平衡投資組合。 
    Content_2：奈米投的優勢在於，我們在2022年榮獲9項國內外獎項肯定，並且我們的專家每日都會觀察市場變化，為您的投資組合做出最佳的調整。 
    
    """
    #result1 = get_agent()
    #output = result1.run(prompt_query)
    #print(output)
    #final_answer = extraction_output(data1)
    #print(final_answer)

    message=[{"role": "user", "content": prompt_query}]
    response = openai.ChatCompletion.create(
        engine="gpt-4-32k",
        messages = message,
        temperature=0.7,
        max_tokens=5000,
        frequency_penalty=0.0
    )

    output = response["choices"][0]["message"]["content"]
    print(output)
    final_answer = extraction_output(output)
    print(final_answer)
    return jsonify({'response': final_answer})


#獲取當前資料夾路徑
#current_script_path = os.getcwd()
#data_path = current_script_path + "\static" + "\data" + "\自評項目 - 低成本測試.csv"

#獲取資料庫資料
#check_list, support_data, class_list, QN_list =demoooo.read_csv_file(data_path)


@app_bp.route('/get_check_answer', methods=['POST'])
def process_input2():
    #from connect_login import read_mysql_data
    requestData = request.get_json()
    actual_data = requestData.get('check_inputtext', {})
    prompt = actual_data.get('check_inputtext', '')
    dataList = actual_data.get('dataList', [])
    check_list = []
    support_data = []
    class_list = []
    QN_list = []
    # 拆分 dataList
    for data in dataList:
        check_list.append(data["question"])
        support_data.append(data["ad_inf"])
        class_list.append(data["category"])
        QN_list.append(data["QN"])
    #prompt = request.get_json()['check_inputtext']
    #print("220行：", prompt)
    #check_list, support_data, class_list, QN_list = read_mysql_data()

    from demoooo import check_list_chain, retrieve_output_dic, spilit_text
    #整個結果
    output_list = check_list_chain(prompt, check_list, support_data)

    #page2
    retrieve_dic = retrieve_output_dic(class_list, output_list)
    print(retrieve_dic)

    #切割字串
    result_list, word_list, reason_list = spilit_text(output_list)

    #page3、page4
    page3_reason_list = []
    page4_text_dic = {}
    page3_keyword_list = []   #切完為無序集合
    page3_check_list = []
    page3_dic = {}

    print(QN_list)
    for index, keyword in enumerate(word_list):
        if result_list[index] == "否":
            page3_keyword_list.extend(word_list[index].split("、"))
            page3_reason_list.append(reason_list[index])
            page3_check_list.append(QN_list[index] + check_list[index])
            page3_dic[check_list[index]] = keyword.split("、")
            page4_text_dic[QN_list[index] + check_list[index]] = result_list[index] + "\n" + word_list[index] + "\n" + reason_list[index]
        else:
            page4_text_dic[QN_list[index] + check_list[index]] = result_list[index]
    
    #for index, keyword in enumerate(word_list):
        #if keyword != "無":
            #page3_dic[check_list[index]] = keyword.split("、")
            
    page4_text_dic = list(page4_text_dic.items())
       
    return jsonify({'response': output_list,
                    "retrieve_dic": retrieve_dic,
                    "page3_keyword": page3_keyword_list,
                    "page3_checklist": page3_check_list,
                    "page3_reason": page3_reason_list,
                    "page3_dic":page3_dic,
                    "page4_text": page4_text_dic
                })


@app_bp.route('/onepick', methods=['POST'])
def onepick():
    from connect_login import get_question

    data = request.get_json()
    big_title = data['big_title']
    small_title = data['small_title']
    fileContent = data['fileContent']

    if fileContent:
        if not os.path.exists('uploads'):
            os.makedirs('uploads')
        file_path = os.path.join("uploads", str(time.time()) + ".txt")
        with open(file_path, 'w', encoding='utf-8') as file:
            file.write(fileContent)
        
        onepick_question = get_question(big_title, small_title)
        question, ad_inf = onepick_question[0]

        example_prompt ="""
        你是法令遵循部的小助手，先幫我抓錯字，再幫我判斷文本是否適用我提供的規範，如果不適用就說「不適用」; 如果適用且符合規範就說「是」，不符合就說「否」，並且所有錯誤或模糊接近錯誤都列出，請針對指定的規範作回應，不相關則不要做回應(不要糾正日期格式)。
        
        規範: {rule}
        以繁體中文依照以下格式輸出，只要答案就好，絕對不要額外補充說明：
        ---
        是否符合規定：是/否/不適用
        不符合字詞或敘述：錯誤
        不符合的原因：錯誤會造成什麼後果 50個字上限
        ---
        以下是廣告文本：
        {fileContent}
        ---
        規範補充資料:
        {additional_inf}
        ---
        規範: {rule}
        以繁體中文依照以下格式輸出，只要答案就好，絕對不要額外補充說明：
        ---
        是否符合規定：是/否/不適用
        不符合字詞或敘述：錯誤
        不符合的原因：錯誤會造成什麼後果 50個字上限
        ---  
        """

        from demoooo import onepick_answer 
        onepick_result = onepick_answer(example_prompt.format(rule=question, fileContent=fileContent, additional_inf=ad_inf), question, ad_inf)
        print('example_prompt'+ example_prompt)
        print('onepick_result'+ onepick_result)
        return jsonify({'response': onepick_result})

    else:
        return jsonify({'error': 'File content missing'}), 400


 
#@app.route('/')
#def index():
#    return render_template('home.html')

#@app.route('/checklist_onepick.html')
#def checklist_onepick():
#    return render_template('checklist_onepick.html')

#@app.route('/checklist_page2.html')
#def checklist_page2():
#    return render_template('checklist_page2.html')

#@app.route('/checklist_detail.html')
#def detail():
#    return render_template('checklist_detail.html')

#@app.route('/checklist_table.html')
#def checklist_table():
#    return render_template('checklist_table.html')
#. .venv/bin/activate  
#python -m flask run
#if __name__ == '__main__': 
#    app.run(host='10.0.0.4', port=8080)
