import React, { useState } from 'react';

const numRows = 6;
const numCols = 7;
const empty = 'white'; // Empty cells are white
const players = ['red', 'yellow']; // Player 1 is red, Player 2 is yellow

function Game() {
  const [board, setBoard] = useState(Array(numRows).fill(Array(numCols).fill(empty)));
  const [currentPlayer, setCurrentPlayer] = useState(0);

  const dropDisc = (col) => {
    // Find the first empty spot in the column
    for (let row = numRows - 1; row >= 0; row--) {
      if (board[row][col] === empty) {
        const newBoard = board.map(row => [...row]);
        newBoard[row][col] = players[currentPlayer];
        setBoard(newBoard);
        // Switch to the other player
        setCurrentPlayer(1 - currentPlayer);
        break;
      }
    }
  };

  return (
    <div>
      <h2>Connect Four - Player {currentPlayer + 1}'s Turn</h2>
      {board.map((row, rowIndex) => (
        <div key={rowIndex} style={{ display: 'flex' }}>
          {row.map((cell, colIndex) => (
            <div key={colIndex} onClick={() => dropDisc(colIndex)} style={{
              width: '50px',
              height: '50px',
              backgroundColor: cell,
              border: '1px solid black',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default Game;
