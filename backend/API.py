import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
app = Flask(__name__)
CORS(app)

def check_accuracy(df, columns):
    results = {}
    for col in columns:
        results[col] = df[col].apply(lambda x: isinstance(x, (int, float))).all()
    return results

def check_completeness(df, columns):
    return {col: df[col].notnull().all() for col in columns}

def check_reliability(df, columns):
    return {col: not df[col].duplicated().any() for col in columns}

def check_relevance(df, columns):
    return {col: df[col].notnull().any() for col in columns}

def check_timeliness(df, columns):
    import datetime
    now = datetime.datetime.now()
    one_year_ago = now - datetime.timedelta(days=365)
    results = {}
    for col in columns:
        if pd.api.types.is_datetime64_any_dtype(df[col]):
            results[col] = df[col].apply(lambda x: x >= one_year_ago if pd.notnull(x) else False).all()
        else:
            results[col] = False
    return results

def run_quality_checks(df, columns, checks):
    results = {}
    if 'accuracy' in checks:
        results['accuracy'] = check_accuracy(df, columns)
    if 'completeness' in checks:
        results['completeness'] = check_completeness(df, columns)
    if 'reliability' in checks:
        results['reliability'] = check_reliability(df, columns)
    if 'relevance' in checks:
        results['relevance'] = check_relevance(df, columns)
    if 'timeliness' in checks:
        results['timeliness'] = check_timeliness(df, columns)
    return results

@app.route('/api/run_quality_checks', methods=['POST'])
def run_quality_checks_api():
    data = request.get_json()  # mapping: {column: [checks]}
    df = pd.read_excel('your_file.xlsx')  # Load your Excel file

    results = {}
    print(data)  # Debugging line to see the input da
    for col, checks in data.items():
        results[col] = run_quality_checks(df, [col], checks)
    return jsonify(results)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)