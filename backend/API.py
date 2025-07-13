import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import datetime

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])

def check_accuracy(df, columns):
    return {col: bool(df[col].apply(lambda x: isinstance(x, (int, float))).all()) for col in columns}

def check_completeness(df, columns):
    return {col: bool(df[col].notnull().all()) for col in columns}

def check_reliability(df, columns):
    return {col: bool(not df[col].duplicated().any()) for col in columns}

def check_relevance(df, columns):
    return {col: bool(df[col].notnull().any()) for col in columns}

def check_timeliness(df, columns):
    now = datetime.datetime.now()
    one_year_ago = now - datetime.timedelta(days=365)
    results = {}
    for col in columns:
        if pd.api.types.is_datetime64_any_dtype(df[col]):
            results[col] = bool(df[col].apply(lambda x: x >= one_year_ago if pd.notnull(x) else False).all())
        else:
            results[col] = False
    return results

def run_quality_checks(df, columns, checks):
    results = {}
    for check in checks:
        if check == 'accuracy':
            check_result = check_accuracy(df, columns)
        elif check == 'completeness':
            check_result = check_completeness(df, columns)
        elif check == 'reliability':
            check_result = check_reliability(df, columns)
        elif check == 'relevance':
            check_result = check_relevance(df, columns)
        elif check == 'timeliness':
            check_result = check_timeliness(df, columns)
        else:
            continue
        # Flatten: store directly as results[col][check] = bool
        for col in columns:
            results.setdefault(col, {})[check] = check_result[col]
    return results

@app.route('/api/run_quality_checks', methods=['POST'])
def run_quality_checks_api():
    file = request.files['file']
    checks = json.loads(request.form['checks'])
    df = pd.read_excel(file)

    results = {}
    for col, check_list in checks.items():
        col_results = run_quality_checks(df, [col], check_list)
        results.update(col_results)
    return jsonify(results)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
