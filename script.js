let rows = 20;
let cols = 20;
let grid = [];
let start = null;
let end = null;
let currentMode = 'wall';
let isMouseDown = false;

const mazeContainer = document.getElementById('maze');

document.body.addEventListener('mouseup', () => isMouseDown = false);

function setMode(mode) {
  currentMode = mode;
}

function createGrid() {
  grid = [];
  mazeContainer.innerHTML = '';
  for (let row = 0; row < rows; row++) {
    grid[row] = [];
    for (let col = 0; col < cols; col++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.row = row;
      cell.dataset.col = col;

      cell.addEventListener('mousedown', () => {
        isMouseDown = true;
        handleCellClick(row, col);
      });

      cell.addEventListener('mouseover', () => {
        if (isMouseDown && (currentMode === 'wall' || currentMode === 'erase')) {
          handleCellClick(row, col);
        }
      });

      cell.addEventListener('mouseup', () => isMouseDown = false);

      mazeContainer.appendChild(cell);
      grid[row][col] = {
        type: 'empty',
        pathType: null,
        element: cell
      };
    }
  }
  updateMazeGridTemplate();
}

function handleCellClick(row, col) {
  const current = grid[row][col];
  const cell = current.element;

  if (currentMode === 'wall') {
    if (current.type !== 'start' && current.type !== 'end') {
      current.type = 'wall';
      cell.className = 'cell wall';
    }
  } else if (currentMode === 'start') {
    if (start) grid[start.row][start.col].element.className = 'cell';
    start = { row, col };
    current.type = 'start';
    cell.className = 'cell start';
  } else if (currentMode === 'end') {
    if (end) grid[end.row][end.col].element.className = 'cell';
    end = { row, col };
    current.type = 'end';
    cell.className = 'cell end';
  } else if (currentMode === 'erase') {
    if (current.type === 'start') start = null;
    if (current.type === 'end') end = null;
    current.type = 'empty';
    current.pathType = null;
    cell.className = 'cell';
  }
}

function getNeighbors(row, col) {
  const dirs = [[0,1],[1,0],[0,-1],[-1,0]];
  return dirs.map(([dx, dy]) => [row+dx, col+dy])
    .filter(([r, c]) => r >= 0 && r < rows && c >= 0 && c < cols && grid[r][c].type !== 'wall');
}

async function bfsSolve() {
  const queue = [{ row: start.row, col: start.col }];
  const visited = Array(rows).fill().map(() => Array(cols).fill(false));
  const prev = Array(rows).fill().map(() => Array(cols).fill(null));
  visited[start.row][start.col] = true;

  while (queue.length > 0) {
    const { row, col } = queue.shift();
    const cell = grid[row][col].element;
    if (grid[row][col].type !== 'start' && grid[row][col].type !== 'end') {
      cell.classList.add('visited');
      await delay(20);
    }

    if (row === end.row && col === end.col) break;

    for (const [r, c] of getNeighbors(row, col)) {
      if (!visited[r][c]) {
        visited[r][c] = true;
        prev[r][c] = [row, col];
        queue.push({ row: r, col: c });
      }
    }
  }

  let path = [];
  let [r, c] = [end.row, end.col];
  while (prev[r][c]) {
    path.push([r, c]);
    [r, c] = prev[r][c];
  }
  for (const [r, c] of path.reverse()) {
    const cell = grid[r][c];
    if (cell.type !== 'start' && cell.type !== 'end') {
      if (cell.pathType === 'dfs') {
        cell.pathType = 'mixed';
        cell.element.className = 'cell path-mixed';
      } else {
        cell.pathType = 'bfs';
        cell.element.className = 'cell path-bfs';
      }
      await delay(30);
    }
  }
}

async function dfsSolve() {
  const stack = [{ row: start.row, col: start.col }];
  const visited = Array(rows).fill().map(() => Array(cols).fill(false));
  const prev = Array(rows).fill().map(() => Array(cols).fill(null));

  while (stack.length > 0) {
    const { row, col } = stack.pop();
    if (visited[row][col]) continue;
    visited[row][col] = true;

    const cell = grid[row][col].element;
    if (grid[row][col].type !== 'start' && grid[row][col].type !== 'end') {
      cell.classList.add('visited');
      await delay(20);
    }

    if (row === end.row && col === end.col) break;

    for (const [r, c] of getNeighbors(row, col)) {
      if (!visited[r][c]) {
        prev[r][c] = [row, col];
        stack.push({ row: r, col: c });
      }
    }
  }

  let path = [];
  let [r, c] = [end.row, end.col];
  while (prev[r][c]) {
    path.push([r, c]);
    [r, c] = prev[r][c];
  }
  for (const [r, c] of path.reverse()) {
    const cell = grid[r][c];
    if (cell.type !== 'start' && cell.type !== 'end') {
      if (cell.pathType === 'bfs') {
        cell.pathType = 'mixed';
        cell.element.className = 'cell path-mixed';
      } else {
        cell.pathType = 'dfs';
        cell.element.className = 'cell path-dfs';
      }
      await delay(30);
    }
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function clearPaths() {
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const cell = grid[row][col];
        if (cell.type === 'empty') {
          cell.element.className = 'cell';
          cell.pathType = null;
        }
      }
    }
  }

function solveMaze() {
    if (!start || !end) {
      alert("Please set start and end points!");
      return;
    }
    clearPaths(); // 
    const algorithm = document.getElementById('algorithm').value;
    if (algorithm === 'bfs') bfsSolve();
    else dfsSolve();
  }

function resetMaze() {
  createGrid();
  start = null;
  end = null;
}

function updateGridSize() {
  const inputRows = parseInt(document.getElementById('input-rows').value);
  const inputCols = parseInt(document.getElementById('input-cols').value);
  if (inputRows >= 5 && inputCols >= 5 && inputRows <= 50 && inputCols <= 50) {
    rows = inputRows;
    cols = inputCols;
    resetMaze();
  } else {
    alert("Grid size must be between 5 and 50 for both rows and columns.");
  }
}

function updateMazeGridTemplate() {
  mazeContainer.style.gridTemplateColumns = `repeat(${cols}, 25px)`;
}

createGrid();
