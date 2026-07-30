function Node(value) {
  this.value = Array.from(value);
  this.children = [];
  this.level = 0;
  this.parent = null;
  this.solution = false;
}

let decisionThree = null;
let pcSolutions = [];

let board = [
  ["", "", ""],
  ["", "", ""],
  ["", "", ""]
];

let currentTurn = "O"; 
let isGameActive = true;

function renderBoard() {
  const boardContainer = document.querySelector("#board");
  
  const html = board.map((row, rowIndex) => {
    const cells = row.map((cell, colIndex) => {
      return `<button class="cell" data-row="${rowIndex}" data-col="${colIndex}">${cell}</button>`;
    });
    return `<div class="row">${cells.join("")}</div>`;
  });

  boardContainer.innerHTML = html.join("");
}

function renderPlayer() {
  const playerDisplay = document.querySelector("#player");
  playerDisplay.textContent = `Turno actual: ${currentTurn === "O" ? "Jugador (O)" : "PC (X)"}`;
}

startGame();

function startGame() {
  renderBoard();
  currentTurn = Math.random() <= 0.5 ? "O" : "X";
  renderPlayer();

  if (currentTurn === "O") {
    playerPlays();
  } else {
    PCPlaysV2();
  }
}

function PCPlaysV2() {
  if (!isGameActive) return;
  
  const copy = JSON.parse(JSON.stringify(board));
  const root = new Node(copy);
  processNode(root, true, 0);

  let move = null;

  if (pcSolutions.length > 0) {
    let min = 100;
    for (let i = 0; i < pcSolutions.length; i++) {
      if (pcSolutions[i].level < min) {
        min = pcSolutions[i].level;
      }
    }
    pcSolutions = pcSolutions.filter((sol) => sol.level === min);
    const moveIndex = parseInt(Math.random() * pcSolutions.length);
    move = getRoot(pcSolutions[moveIndex]);
  } else {
    if (root.children.length > 0) {
      const moveIndex = parseInt(Math.random() * root.children.length);
      move = root.children[moveIndex];
    }
  }

  if (move) {
    decisionThree = move;
    board = JSON.parse(JSON.stringify(move.value));
    
    currentTurn = "O";
    renderBoard();
    
    const won = checkIfWinner();
    if (won === "none") {
      renderPlayer();
      pcSolutions = [];
      playerPlays();
    }
  }
}

function processNode(root, nturn, level) {
  if (level >= 9) return;

  for (let i = 0; i < root.value.length; i++) {
    for (let j = 0; j < root.value[i].length; j++) {
      if (root.value[i][j] === "") {
        root.children.push(createChild(root, i, j, nturn, level));
      }
    }
  }

  for (let i = 0; i < root.children.length; i++) {
    if (checkIfPCWinner(root.children[i].value)) {
      pcSolutions.push(root.children[i]);
    }
  }

  for (let i = 0; i < root.children.length; i++) {
    const item = root.children[i];
    if (!checkIfPCWinner(item.value)) {
      processNode(item, !nturn, level + 1);
    }
  }
}

function createChild(node, i, j, nturn, level) {
  const copy = JSON.parse(JSON.stringify(node.value));

  if (!nturn) {
    copy[i][j] = "O";
  } else {
    copy[i][j] = "X";
  }
  const newNode = new Node(copy);
  newNode.turn = nturn;
  newNode.level = level + 1;
  newNode.parent = node;
  return newNode;
}

function playerPlays() {
  document.querySelectorAll(".cell").forEach((buttonCell) => {
    buttonCell.addEventListener("click", () => {
      const row = parseInt(buttonCell.getAttribute("data-row"));
      const column = parseInt(buttonCell.getAttribute("data-col"));

      if (board[row][column] === "" && isGameActive) {
        board[row][column] = "O";
        buttonCell.textContent = "O";
        
        const won = checkIfWinner();
        if (won === "none") {
          PCPlaysV2();
        }
      }
    });
  });
}

function checkIfWinner() {
  const PCWon = [
    board[0][0] === "X" && board[1][1] === "X" && board[2][2] === "X",
    board[2][0] === "X" && board[1][1] === "X" && board[0][2] === "X",
    board[0][0] === "X" && board[1][0] === "X" && board[2][0] === "X",
    board[0][1] === "X" && board[1][1] === "X" && board[2][1] === "X",
    board[0][2] === "X" && board[1][2] === "X" && board[2][2] === "X",
    board[0][0] === "X" && board[0][1] === "X" && board[0][2] === "X",
    board[1][0] === "X" && board[1][1] === "X" && board[1][2] === "X",
    board[2][0] === "X" && board[2][1] === "X" && board[2][2] === "X",
  ];
  const playerWon = [
    board[0][0] === "O" && board[1][1] === "O" && board[2][2] === "O",
    board[2][0] === "O" && board[1][1] === "O" && board[0][2] === "O",
    board[0][0] === "O" && board[1][0] === "O" && board[2][0] === "O",
    board[0][1] === "O" && board[1][1] === "O" && board[2][1] === "O",
    board[0][2] === "O" && board[1][2] === "O" && board[2][2] === "O",
    board[0][0] === "O" && board[0][1] === "O" && board[0][2] === "O",
    board[1][0] === "O" && board[1][1] === "O" && board[1][2] === "O",
    board[2][0] === "O" && board[2][1] === "O" && board[2][2] === "O",
  ];

  if (PCWon.includes(true)) {
    isGameActive = false;
    document.querySelector("#player").textContent = "¡Ganó la PC (X)!";
    return "pcwon";
  }
  if (playerWon.includes(true)) {
    isGameActive = false;
    document.querySelector("#player").textContent = "¡Ganaste (O)!";
    return "playerwon";
  }

  const isDraw = board.every((row) => row.every((cell) => cell !== ""));
  if (isDraw) {
    isGameActive = false;
    document.querySelector("#player").textContent = "¡Empate!";
    return "draw";
  }

  return "none";
}

function checkIfPCWinner(arr) {
  const PCWon = [
    arr[0][0] === "X" && arr[1][1] === "X" && arr[2][2] === "X",
    arr[2][0] === "X" && arr[1][1] === "X" && arr[0][2] === "X",
    arr[0][0] === "X" && arr[1][0] === "X" && arr[2][0] === "X",
    arr[0][1] === "X" && arr[1][1] === "X" && arr[2][1] === "X",
    arr[0][2] === "X" && arr[1][2] === "X" && arr[2][2] === "X",
    arr[0][0] === "X" && arr[0][1] === "X" && arr[0][2] === "X",
    arr[1][0] === "X" && arr[1][1] === "X" && arr[1][2] === "X",
    arr[2][0] === "X" && arr[2][1] === "X" && arr[2][2] === "X",
  ];
  return PCWon.includes(true);
}

function checkIfPlayerCanWin(arr) {
  const PCWon = [
    arr[0][0] === "O" && arr[1][1] === "O",
    arr[2][0] === "O" && arr[1][1] === "O",
    arr[0][0] === "O" && arr[1][0] === "O",
    arr[0][1] === "O" && arr[1][1] === "O",
    arr[0][2] === "O" && arr[1][2] === "O",
    arr[0][0] === "O" && arr[0][1] === "O",
    arr[1][0] === "O" && arr[1][1] === "O",
    arr[2][0] === "O" && arr[2][1] === "O",
  ];
  return PCWon.includes(true);
}

function getRoot(node) {
  let n = node;
  while (n.parent && n.parent.parent != null) {
    n = n.parent;
  }
  return n;
}