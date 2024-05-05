import React, { useState, useEffect } from 'react';
import './Game.css';

const numRows = 6;
const numCols = 7;
const empty = 'white';
const players = ['red', 'yellow'];
const playerValues = { white: 0, red: 1, yellow: 2 };

function Game() {
  const initBoard = () => Array.from({ length: numRows }, () => Array(numCols).fill(empty));
  const [board, setBoard] = useState(initBoard());
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    if (!winner && currentPlayer === 0) {
      makeAiMove();
    }
  }, [currentPlayer, winner]);

  const incrementWinCount = async (winType) => {
    try {
      await fetch('https://connect-4-classifier-bf899f31858b.herokuapp.com/increment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ win_type: winType })
      });
    } catch (error) {
      console.error("Failed to increment win count:", error);
    }
  };

  const checkForWin = (newBoard, row, col) => {
    const color = players[currentPlayer];

    let count = 0;
    for (let j = 0; j < numCols; j++) {
      count = (newBoard[row][j] === color) ? count + 1 : 0;
      if (count >= 4) return true;
    }

    count = 0;
    for (let i = 0; i < numRows; i++) {
      count = (newBoard[i][col] === color) ? count + 1 : 0;
      if (count >= 4) return true;
    }

    count = 0;
    let startRow = row + col >= numCols ? row - (numCols - col - 1) : row - Math.min(row, col);
    let startCol = row + col >= numCols ? numCols - 1 : col + Math.min(row, col);
    for (let i = startRow, j = startCol; i < numRows && j >= 0; i++, j--) {
      count = (newBoard[i][j] === color) ? count + 1 : 0;
      if (count >= 4) return true;
    }

    count = 0;
    startRow = row >= col ? row - col : 0;
    startCol = row >= col ? 0 : col - row;
    for (let i = startRow, j = startCol; i < numRows && j < numCols; i++, j++) {
      count = (newBoard[i][j] === color) ? count + 1 : 0;
      if (count >= 4) return true;
    }

    return false;
  };

  const isFull = (col) => {
    return board[0][col] !== empty;
};

const randomAvailCol = () => {
    const availableCols = [];
    for (let col = 0; col < numCols; col++) {
        if (!isFull(col)) {
            availableCols.push(col);
        }
    }
    return availableCols[Math.floor(Math.random() * availableCols.length)];
};

const makeAiMove = async () => {
  if (!winner) {
    const numericBoard = board.map(row => row.map(cell => playerValues[cell]));
    try {
      const response = await fetch(process.env.REACT_APP_SERVER_ADDRESS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ board: numericBoard })
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (!winner) {
        if (isFull(data.column)) {
          data.column = randomAvailCol()
        } 
        dropDisc(data.column);
      }
    } catch (error) {
      console.error("Failed to make AI move:", error);
      alert("Failed to communicate with AI service. Please try again later.");
    }
  }
};

const dropDisc = (col) => {
  if (!winner) {
    for (let row = numRows - 1; row >= 0; row--) {
      if (board[row][col] === empty) {
        const newBoard = board.map(row => [...row]);
        newBoard[row][col] = players[currentPlayer];
        if (checkForWin(newBoard, row, col)) {
          setWinner(players[currentPlayer]);
          setBoard(newBoard);
          const winType = players[currentPlayer] === 'red' ? 'ai_wins' : 'player_wins';
          incrementWinCount(winType);
          return;
        }
        setBoard(newBoard);
        setCurrentPlayer(1 - currentPlayer);
        break;
      }
    }
  }
};

const restartGame = () => {
  setBoard(initBoard());
  setCurrentPlayer(0);
  setWinner(null);
};

return (
  <div className="game-container">
    <h1 className="game-header">Connect Four</h1>
    <div className="game-board">
      {board.map((row, rowIndex) => (
        <div key={rowIndex} className="game-row">
          {row.map((cell, colIndex) => (
            <div key={colIndex} onClick={() => !winner && currentPlayer === 1 && dropDisc(colIndex)} className={`game-cell ${cell}`}>
            </div>
          ))}
        </div>
      ))}
    </div>
    {winner && (
      <div className="winner-message">
        <span className="winner-message">{`${winner === 'red' ? 'AI' : 'Player'} Wins!`}</span>
        <button className="restart-button" onClick={restartGame}>Restart</button>
      </div>
    )}
  </div>
);
}

export default Game;
