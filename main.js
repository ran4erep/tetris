/*_____   _  _   
 |  __ \| || |     GOVNO
 | |__) | || |_       CODE
 |  _  /|__   _|        STUDIOS
 | | \ \   | |  
 |_|  \_\  |_|*/
 
 /*
	Список того что нужно сделать:
	   1). Рандомная генерация фигур ✅
	 	 2). Повороты фигур ✅
	   3). Управление свайпами  ✅
	   4). Функции для софтдропа  ✅
	 	 5). Функция для харддропа
	   6). Коллизия по бокам фигуры ✅
		 7). Начисление очков
		 8). Увеличение сложности по ходу игры
		 9). Стирание нижних рядов при заполнении
		 10). Доделать обесцвечивание закрепившихся блоков ✅
		 11). Сделать ghost pieces
 */
 
//Graphics
let block = new Image();
block.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAAXNSR0IArs4c6QAAAC1JREFUKFNjZGBg+M+ABzCCFMSH+2NVsnDlRga4AhAHGYA00VsBNlfC3YDPmwCq1SYB/MvrCgAAAABJRU5ErkJggg==";
let empty = new Image();
empty.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAAXNSR0IArs4c6QAAACJJREFUKFNj/H9m1X8GPIARpCCheylWJQtKoxmGjgJ83gQA/twtqU9deHcAAAAASUVORK5CYII=";
let ghost = new Image();
ghost.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAAXNSR0IArs4c6QAAACFJREFUKFNjZGBg+M+ABzCCFMSH+2NVsnDlRoahowCfNwFtuxoBXWlpLgAAAABJRU5ErkJggg==";

//Pieces creation
let pieceSpawnCenter = {
	"T" : -2,
	"O" : -1,
	"L" : -2,
	"J" : -1,
	"S" : -1,
	"Z" : -1,
	"I" : -2
};

pieces = {
  "T" : [
  		[0,0,0],
      [1,1,1],
      [0,1,0]
    ],
  "O": [
        [1, 1],
        [1, 1]
      ],
  "L": [
        [0, 1, 0],
        [0, 1, 0],
        [0, 1, 1]
      ],
  "J": [
        [0, 1, 0],
        [0, 1, 0],
        [1, 1, 0]
      ],
  "S": [
  			[0, 0, 0],
        [0, 1, 1],
        [1, 1, 0]
      ],
  "Z": [
  			[0, 0, 0],
        [1, 1, 0],
        [0, 1, 1]
      ],
  "I": [
        [0,1,0,0],
        [0,1,0,0],
        [0,1,0,0],
        [0,1,0,0]
      ],
};

//Initialization
let c = document.getElementById("canvas");
let ctx = c.getContext("2d");
let debug = document.getElementById("debug");
//Scaler
let gameScale = 2;
c.width = c.width * gameScale;
c.height = c.height * gameScale;
//c.width = window.innerWidth - 20;
//c.height = window.innerHeight -80;
ctx.imageSmoothingEnabled = false;
//Dimensions
let levelWidth = 10;
let levelHeight = 20;
let blockWidth = c.width / levelWidth;
let blockHeight = c.height / levelHeight;

let currentPiece = pickRandomPiece();
let nextPiece = pickRandomPiece();
let X = Math.floor((levelWidth/2)) + pieceSpawnCenter[currentPiece], Y = 0;
let ghostX = X, ghostY = levelHeight - pieces[currentPiece].length;
console.log(ghostY)

//Arena creation
let arena = [];
for (column = 0; column < levelHeight; column++) {
	arena[column] = [];
	for (row = 0; row < levelWidth; row++) {
		arena[column][row] = 0;
		if(column === levelHeight-1) {
			arena[column][row] = 2;
		}
	}
};

///Controls
buttonLeft.addEventListener("click", function(e) {
  if (X > 0)
	 X -= 1;
});

buttonRight.addEventListener("click", function(e) {
	if (X < levelWidth - pieces[currentPiece][0].length)
  	X += 1;
});
//Swipes
let swipeStartX = 0;
let swipeStartY = 0;
let swipeEndX = 0;
let swipeEndY = 0;
let swipeDuration = 0;
let swipedLeft = false, swipedRight = false;
c.addEventListener("touchstart", function(e) {
	swipeStartX = e.touches[0].clientX;
	swipeStartY = e.touches[0].clientY;
});
c.addEventListener("touchmove", function(e) {
	swipeEndX = e.touches[0].clientX;
	swipeEndY = e.touches[0].clientY;
	swipeDuration += 1;
});
c.addEventListener("touchend", function(e) {
	e.preventDefault();
	if (swipeEndX < swipeStartX-20 && swipeDuration> 1) {
		if (!pieceIsOutOfBounds()) {
			X -= 1;
			ghostX -= 1;
			if (collision() === "withPiece") {
				X += 1
				ghostX += 1;
			};
			swipeDuration = 0;
		}
	} else if(swipeEndX > swipeStartX+20 && swipeDuration > 1) {
		//Swipe right
		if (!pieceIsOutOfBounds()) {
			X += 1;
			ghostX += 1;
			if(collision() === "withPiece") {
				X -= 1
				ghostX -= 1;
			};
			swipeDuration = 0;
		}
		/*
		if (X < levelWidth - pieces[currentPiece][0].length && !rightCollision()) {
			X += 1;
			ghostX += 1;
			swipeDuration = 0;
		}*/
	}/* else if (swipeEndY < swipeStartY - 20 && swipeDuration > 1) {
		//Swipe up
		Y = 20-pieces[currentPiece].length;
		swipeDuration=0;
	}*/
	else if (swipeEndY > swipeStartY + 20 && swipeDuration > 1) {
		//Swipe down
		dropPiece();
		//timeStart = 0;
		swipeDuration=0;
	} else if (swipeDuration <= 1) {
		pieces[currentPiece] = rotate(pieces[currentPiece]);
		draw();
		swipeDuration = 0;
	}
});

//Functions
function draw() {
  //Clear screen
  ctx.clearRect(0, 0, c.width, c.height);
  //Rendering arena
  for (y = 0; y < levelHeight; y++) {
    for (x = 0; x < levelWidth; x++) {
    	if (arena[y][x] === 1) {
    		ctx.drawImage(block, x * blockWidth, y * blockHeight, blockWidth, blockHeight);
    			fadeBlock(x*blockWidth,y*blockHeight);
    		}
    	if (arena[y][x] === 0 ||
    			arena[y][x] === 2) {
    		ctx.drawImage(empty, x * blockWidth, y * blockHeight, blockWidth, blockHeight)
    	}
    }
  }
  //Rendering ghost piece
 /*for (i = 0; i < pieces[currentPiece].length; i++) {
  	for (j = 0; j < pieces[currentPiece][0].length; j++) {
  		if (pieces[currentPiece][i][j] !== 0) {
  			ctx.drawImage(ghost,
  				(ghostX * blockWidth) + (j * blockWidth),
  				(ghostY * blockHeight) + (i * blockHeight),
  				blockWidth, blockHeight);
  		}
  	}
  }*/
  //Rendering dropping piece
  for (i = 0; i < pieces[currentPiece].length; i++) {
    for (j = 0; j < pieces[currentPiece][0].length; j++) {
      if (pieces[currentPiece][i][j] !== 0) {
        ctx.drawImage(block,
        (X*blockWidth)  + (j*blockWidth),
        (Y*blockHeight) + (i*blockHeight),
        blockWidth, blockHeight);
      }
    }
  }
};

function random(min, max) {
	let rand = min + Math.random() * (max + 1 - min);
	rand = Math.floor(rand);
	return rand;
};

function pickRandomPiece() {
	let piece = "";
	let pieces = ["T","O","L","J","S","Z","I"];
	for (i = 0; i < pieces.length; i++) {
		piece = pieces[random(0,pieces.length-1)];
	}
	return piece;
};

function merge() {
	for (i = 0; i < pieces[currentPiece].length; i++) {
		for (j = 0; j < pieces[currentPiece][0].length; j++) {
			if (pieces[currentPiece][i][j] === 1) {
				arena[Y+i][X+j] = 1;
			}
		}
	}
	/*
  for (x = 0; x < levelWidth; x++) {
    for (y = 0; y < levelHeight; y++) {
      if (x === X && y === Y) {
        for (i = 0; i < pieces[currentPiece][0].length; i++) {
          for (j = 0; j < pieces[currentPiece].length; j++) {
          	if(arena[y + j][x + i] === 0 ||
          		arena[y+j][x+i] === 2)
            arena[y + j][x + i] = pieces[currentPiece][j][i];
          }
        }
      }
    }
  }*/
};

function collision() {
	for (i = 0; i < pieces[currentPiece].length; i++) {
		for (j = 0; j < pieces[currentPiece][0].length; j++) {
			if (pieces[currentPiece][i][j] === 1) {
				if (arena[Y + i][(X + j)] === 1) {
					return "withPiece";
				}
				if (arena[Y + i][(X + j)] === 2) {
					return "withBottom";
				}
			}
		}
	}
};

function pieceIsOutOfBounds() {
	for (i = 0; i < pieces[currentPiece].length; i++) {
		for (j = 0; j < pieces[currentPiece][0].length; j++) {
			if (pieces[currentPiece][i][j] === 1) {
				if(arena[Y+i][(X+j)+1] === undefined) {
					break;
					return true;
				} else return false;
			}
		}
	}
};

function dropPiece() {
	Y += 1;
	if(collision() === "withPiece") {
		Y -= 1;
		merge();
		clearLines();
		currentPiece = nextPiece;
		nextPiece = pickRandomPiece();
		Y = 0;
	}
	if (collision() === "withBottom") {
		merge();
		clearLines();
		currentPiece = nextPiece;
		nextPiece = pickRandomPiece();
		Y = 0;
		X = 5;
	}
};

function ghostPiece() {
	if(collision() ) {
		ghostY = ghostY-pieces[currentPiece].length;
	} else {
		ghostY = levelHeight - pieces[currentPiece].length;
	}
};

function fadeBlock(x, y) {
	let buffer = ctx.getImageData(x, y, blockHeight, blockWidth);
	let data = buffer.data;

	for (var i = 0; i < data.length; i += 4) {
		data[i] = data[i] -30; // red
		data[i + 1] = data[i + 1] -30; // green
		data[i + 2] = data[i + 2] -30; // blue
	}
	ctx.putImageData(buffer, x, y);
};

function rotate(matrix) {
	const N = matrix.length - 1;
	const result = matrix.map((row, i) =>
		row.map((val, j) => matrix[N - j][i])
	);
	return result;
};

function clearLines() {
	let lines = [];
	
	for (var y = levelHeight-1; y >= 0; y--) {
		let numberOfBlocks = 0;
		
		for (var x = 0; x < levelWidth; x++) {
			if(arena[y][x] !== 0 && arena[y][x] !== 2) {
				numberOfBlocks += 1;
			}
		}
		
		if (numberOfBlocks === 0) {
			break;
		} else if (numberOfBlocks < levelWidth) {
			continue;
		} else if (numberOfBlocks === levelWidth) {
			lines.unshift(y);
		}
	}
	
	for (let index of lines) {
		arena.splice(index,1);
		arena.unshift(new Array(levelWidth).fill(0));
	}
	
	for (x = 0; x < levelWidth; x++) {
		if(arena[levelHeight-1][x] === 0)
			arena[levelHeight-1][x] = 2;
	}
};

//Main game loop
let timeStart = 0;	
function update(timestamp) {
  if (timestamp - timeStart >= 500) {
    
   //draw();
  dropPiece();
  //checkRow();
  //ghostPiece()
  draw();
  timeStart = timestamp;
  }
  requestAnimationFrame(update);
};

update();