# To run the app:
# 1. Make sure you have Flask installed (pip install flask)
# 2. Open a terminal/command prompt
# 3. Navigate to the directory containing this file
# 4. Run the command: python main.py
# 5. Open a web browser and go to http://127.0.0.1:5000

from flask import Flask, render_template, request, jsonify
import json
import random
import os

app = Flask(__name__)

items = []
matchups = []
results = {}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/add_items', methods=['POST'])
def add_items():
    global items
    new_items = request.json['items']
    items.extend(new_items)
    generate_matchups()
    return jsonify(success=True)

@app.route('/get_matchup')
def get_matchup():
    if matchups:
        return jsonify(matchup=matchups[0])
    else:
        return jsonify(matchup=None)

@app.route('/submit_result', methods=['POST'])
def submit_result():
    winner = request.json['winner']
    loser = request.json['loser']
    update_results(winner, loser)
    matchups.pop(0)
    return jsonify(success=True)

@app.route('/get_results')
def get_results():
    return jsonify(results=calculate_rankings())

def generate_matchups():
    global matchups
    matchups = [(a, b) for i, a in enumerate(items) for b in items[i+1:]]
    random.shuffle(matchups)

def update_results(winner, loser):
    if winner not in results:
        results[winner] = {'wins': 0, 'losses': 0}
    if loser not in results:
        results[loser] = {'wins': 0, 'losses': 0}
    results[winner]['wins'] += 1
    results[loser]['losses'] += 1

def calculate_rankings():
    sorted_items = sorted(results.items(), key=lambda x: (x[1]['wins'], -x[1]['losses']), reverse=True)
    return [{'item': item, 'wins': data['wins'], 'losses': data['losses']} for item, data in sorted_items]

@app.route('/save_results', methods=['POST'])
def save_results():
    filename = request.json['filename']
    with open(filename, 'w') as f:
        json.dump(results, f)
    return jsonify(success=True)

@app.route('/load_results', methods=['POST'])
def load_results():
    global results
    filename = request.json['filename']
    with open(filename, 'r') as f:
        results = json.load(f)
    return jsonify(success=True)

if __name__ == '__main__':
    app.run(debug=True)
