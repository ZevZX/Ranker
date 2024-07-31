let items = [];
let currentMatchup = null;

function addItem() {
    const input = document.getElementById('item-input');
    if (input.value) {
        items.push(input.value);
        updateItemList();
        input.value = '';
    }
}

function updateItemList() {
    const list = document.getElementById('item-list');
    list.innerHTML = '';
    items.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        list.appendChild(li);
    });
}

function handleFiles(files) {
    for (let file of files) {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                items.push(e.target.result);
                updateItemList();
            };
            reader.readAsDataURL(file);
        }
    }
}

function startRanking() {
    if (items.length < 2) {
        alert('Please add at least 2 items to rank.');
        return;
    }
    fetch('/add_items', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({items: items})
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById('input-section').style.display = 'none';
            document.getElementById('ranking-section').style.display = 'block';
            getNextMatchup();
        }
    });
}

function getNextMatchup() {
    fetch('/get_matchup')
    .then(response => response.json())
    .then(data => {
        if (data.matchup) {
            currentMatchup = data.matchup;
            document.getElementById('item1').textContent = data.matchup[0];
            document.getElementById('item2').textContent = data.matchup[1];
        } else {
            showResults();
        }
    });
}

function submitResult(winner) {
    const loser = currentMatchup.find(item => item !== winner);
    fetch('/submit_result', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({winner: winner, loser: loser})
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            getNextMatchup();
        }
    });
}

function showResults() {
    document.getElementById('ranking-section').style.display = 'none';
    document.getElementById('results-section').style.display = 'block';
    fetch('/get_results')
    .then(response => response.json())
    .then(data => {
        const list = document.getElementById('rankings-list');
        list.innerHTML = '';
        data.results.forEach(result => {
            const li = document.createElement('li');
            li.textContent = `${result.item}: ${result.wins} wins, ${result.losses} losses`;
            list.appendChild(li);
        });
    });
}

function showUpsets() {
    // Implement upset calculation and display logic here
}

function saveResults() {
    const filename = document.getElementById('save-filename').value;
    if (filename) {
        fetch('/save_results', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({filename: filename})
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Results saved successfully!');
            }
        });
    }
}

function loadResults() {
    const filename = document.getElementById('load-filename').value;
    if (filename) {
        fetch('/load_results', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({filename: filename})
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Results loaded successfully!');
                showResults();
            }
        });
    }
}

// Add drag and drop event listeners
const dropArea = document.getElementById('file-drop-area');

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, unhighlight, false);
});

function highlight(e) {
    dropArea.classList.add('highlight');
}

function unhighlight(e) {
    dropArea.classList.remove('highlight');
}

dropArea.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
}

// Add sound effect for matchups
const audio = new Audio('/static/matchup.mp3');
document.querySelectorAll('.matchup-item').forEach(item => {
    item.addEventListener('click', () => {
        audio.play();
    });
});
