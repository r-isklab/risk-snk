const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");


// =====================================================
// CONFIGURACIÓN
// =====================================================

const CELL_SIZE = 40;
const BOARD_SIZE = canvas.width / CELL_SIZE;


// =====================================================
// PUNTUACIÓN
// =====================================================

let score = 0;

const scoreElement = document.getElementById("score");


// =====================================================
// SERPIENTE
// =====================================================

let snake = [
    { x: 6, y: 5 },  // Cabeza
    { x: 5, y: 5 },
    { x: 4, y: 5 },
    { x: 3, y: 5 }   // Cola
];

let direction = "right";
let gameRunning = true;
let gameOver = false;
let blinking = false;
let blinkUntil = 0;

// =====================================================
// ANIMACIÓN DE COMER
// =====================================================

let eating = false;

let eatingUntil = 0;


// =====================================================
// MANZANA
// =====================================================

let apple = {
    x: 8,
    y: 5
};


// =====================================================
// IMÁGENES
// =====================================================

const images = {};


// ---------- CABEZA ----------

images.headRight = new Image();
images.headRight.src = ASSETS.snake.head.right;

images.headLeft = new Image();
images.headLeft.src = ASSETS.snake.head.left;

images.headUp = new Image();
images.headUp.src = ASSETS.snake.head.up;

images.headDown = new Image();
images.headDown.src = ASSETS.snake.head.down;


// ---------- CABEZA - COMER ----------

images.headEatRight = new Image();
images.headEatRight.src = ASSETS.snake.headEat.right;

images.headEatLeft = new Image();
images.headEatLeft.src = ASSETS.snake.headEat.left;

images.headEatUp = new Image();
images.headEatUp.src = ASSETS.snake.headEat.up;

images.headEatDown = new Image();
images.headEatDown.src = ASSETS.snake.headEat.down;


// =====================================================
// CABEZA - BLINK
// =====================================================

images.headBlinkRight = new Image();
images.headBlinkRight.src = ASSETS.snake.headBlink.right;

images.headBlinkLeft = new Image();
images.headBlinkLeft.src = ASSETS.snake.headBlink.left;

images.headBlinkUp = new Image();
images.headBlinkUp.src = ASSETS.snake.headBlink.up;

images.headBlinkDown = new Image();
images.headBlinkDown.src = ASSETS.snake.headBlink.down;

// ---------- CUERPO ----------

images.bodyLR = new Image();
images.bodyLR.src = ASSETS.snake.body.horizontal;

images.bodyUD = new Image();
images.bodyUD.src = ASSETS.snake.body.vertical;


// ---------- ESQUINAS ----------

images.cornerUpRight = new Image();
images.cornerUpRight.src = ASSETS.snake.corners.upRight;

images.cornerUpLeft = new Image();
images.cornerUpLeft.src = ASSETS.snake.corners.upLeft;

images.cornerDownRight = new Image();
images.cornerDownRight.src = ASSETS.snake.corners.downRight;

images.cornerDownLeft = new Image();
images.cornerDownLeft.src = ASSETS.snake.corners.downLeft;


// ---------- COLA ----------

images.tailRight = new Image();
images.tailRight.src = ASSETS.snake.tail.right;

images.tailLeft = new Image();
images.tailLeft.src = ASSETS.snake.tail.left;

images.tailUp = new Image();
images.tailUp.src = ASSETS.snake.tail.up;

images.tailDown = new Image();
images.tailDown.src = ASSETS.snake.tail.down;


// ---------- MANZANA ----------

images.apple = new Image();
images.apple.src = ASSETS.food.apple;


// =====================================================
// DIRECCIÓN ENTRE DOS SEGMENTOS
// =====================================================

function getDirection(from, to) {

    const dx = to.x - from.x;
    const dy = to.y - from.y;


    if (dx === 1) {
        return "right";
    }

    if (dx === -1) {
        return "left";
    }

    if (dy === 1) {
        return "down";
    }

    if (dy === -1) {
        return "up";
    }


    return null;
}


// =====================================================
// CABEZA
// =====================================================

function getHeadImage() {

    // =================================================
    // COMIENDO
    // =================================================

    if (
        eating &&
        Date.now() < eatingUntil
    ) {

        if (direction === "right") {
            return images.headEatRight;
        }

        if (direction === "left") {
            return images.headEatLeft;
        }

        if (direction === "up") {
            return images.headEatUp;
        }

        if (direction === "down") {
            return images.headEatDown;
        }

    }


    // =================================================
    // BLINK
    // =================================================

    if (
        blinking &&
        Date.now() < blinkUntil
    ) {

        if (direction === "right") {
            return images.headBlinkRight;
        }

        if (direction === "left") {
            return images.headBlinkLeft;
        }

        if (direction === "up") {
            return images.headBlinkUp;
        }

        if (direction === "down") {
            return images.headBlinkDown;
        }

    }


    // Si terminó el blink

    blinking = false;


    // =================================================
    // CABEZA NORMAL
    // =================================================

    if (direction === "right") {
        return images.headRight;
    }

    if (direction === "left") {
        return images.headLeft;
    }

    if (direction === "up") {
        return images.headUp;
    }

    if (direction === "down") {
        return images.headDown;
    }

}

function startBlink() {

    if (!gameRunning) {
        return;
    }

    blinking = true;

    // Duración del parpadeo
    blinkUntil = Date.now() + 180;


    // Programar el siguiente parpadeo
    const nextBlink =
        Math.random() * 4000 + 2000;

    setTimeout(
        startBlink,
        nextBlink
    );
}




// =====================================================
// CUERPO / ESQUINAS
// =====================================================

function getBodyImage(index) {

    const current = snake[index];

    const previous = snake[index - 1];

    const next = snake[index + 1];


    const directionToPrevious =
        getDirection(current, previous);

    const directionToNext =
        getDirection(current, next);


    // ---------------------------------------------
    // HORIZONTAL
    // ---------------------------------------------

    if (
        (directionToPrevious === "left" &&
         directionToNext === "right") ||

        (directionToPrevious === "right" &&
         directionToNext === "left")
    ) {

        return images.bodyLR;

    }


    // ---------------------------------------------
    // VERTICAL
    // ---------------------------------------------

    if (
        (directionToPrevious === "up" &&
         directionToNext === "down") ||

        (directionToPrevious === "down" &&
         directionToNext === "up")
    ) {

        return images.bodyUD;

    }


    // ---------------------------------------------
    // ESQUINA UP + RIGHT
    // ---------------------------------------------

    if (
        directionToPrevious === "up" &&
        directionToNext === "right" ||

        directionToPrevious === "right" &&
        directionToNext === "up"
    ) {

        return images.cornerUpRight;

    }


    // ---------------------------------------------
    // ESQUINA UP + LEFT
    // ---------------------------------------------

    if (
        directionToPrevious === "up" &&
        directionToNext === "left" ||

        directionToPrevious === "left" &&
        directionToNext === "up"
    ) {

        return images.cornerUpLeft;

    }


    // ---------------------------------------------
    // ESQUINA DOWN + RIGHT
    // ---------------------------------------------

    if (
        directionToPrevious === "down" &&
        directionToNext === "right" ||

        directionToPrevious === "right" &&
        directionToNext === "down"
    ) {

        return images.cornerDownRight;

    }


    // ---------------------------------------------
    // ESQUINA DOWN + LEFT
    // ---------------------------------------------

    if (
        directionToPrevious === "down" &&
        directionToNext === "left" ||

        directionToPrevious === "left" &&
        directionToNext === "down"
    ) {

        return images.cornerDownLeft;

    }


    return images.bodyLR;

}


// =====================================================
// COLA
// =====================================================

function getTailImage() {

    const tail =
        snake[snake.length - 1];

    const previous =
        snake[snake.length - 2];


    // Dirección desde la cola hacia el segmento anterior

    const tailDirection =
        getDirection(tail, previous);


    if (tailDirection === "right") {
        return images.tailRight;
    }

    if (tailDirection === "left") {
        return images.tailLeft;
    }

    if (tailDirection === "up") {
        return images.tailUp;
    }

    if (tailDirection === "down") {
        return images.tailDown;
    }

}


// =====================================================
// DIBUJAR SERPIENTE
// =====================================================

function drawSnake() {

    snake.forEach((segment, index) => {

        let image;


        // CABEZA

        if (index === 0) {

            image = getHeadImage();

        }


        // COLA

        else if (index === snake.length - 1) {

            image = getTailImage();

        }


        // CUERPO

        else {

            image = getBodyImage(index);

        }


        ctx.drawImage(
            image,
            segment.x * CELL_SIZE,
            segment.y * CELL_SIZE,
            CELL_SIZE,
            CELL_SIZE
        );

    });

}


// =====================================================
// DIBUJAR MANZANA
// =====================================================

function drawApple() {

    ctx.drawImage(
        images.apple,
        apple.x * CELL_SIZE,
        apple.y * CELL_SIZE,
        CELL_SIZE,
        CELL_SIZE
    );

}


// =====================================================
// GENERAR NUEVA MANZANA
// =====================================================

function generateApple() {

    let validPosition = false;


    while (!validPosition) {

        apple.x =
            Math.floor(Math.random() * BOARD_SIZE);

        apple.y =
            Math.floor(Math.random() * BOARD_SIZE);


        validPosition = true;


        // Comprobar que no aparezca
        // encima de la serpiente

        for (const segment of snake) {

            if (
                segment.x === apple.x &&
                segment.y === apple.y
            ) {

                validPosition = false;

                break;

            }

        }

    }

}


// =====================================================
// COMER MANZANA
// =====================================================

function eatApple() {

    score++;

    scoreElement.textContent =
        "Puntos: " + score;


    // Activar animación

    eating = true;

    eatingUntil =
        Date.now() + 300;


    // Nueva manzana

    generateApple();

}


// =====================================================
// MOVER SERPIENTE
// =====================================================

function checkCollision(position) {

    // =============================================
    // COLISIÓN CON LOS BORDES
    // =============================================

    if (
        position.x < 0 ||
        position.x >= BOARD_SIZE ||
        position.y < 0 ||
        position.y >= BOARD_SIZE
    ) {

        return true;

    }


    // =============================================
    // COLISIÓN CON EL CUERPO
    // =============================================

    for (let i = 0; i < snake.length; i++) {

        if (
            position.x === snake[i].x &&
            position.y === snake[i].y
        ) {

            return true;

        }

    }


    return false;
}

function moveSnake() {

    // Si el juego terminó,
    // no hacemos nada.

    if (!gameRunning) {
        return;
    }


    const head = snake[0];


    const newHead = {
        x: head.x,
        y: head.y
    };


    // =============================================
    // MOVIMIENTO
    // =============================================

    if (direction === "right") {
        newHead.x++;
    }

    if (direction === "left") {
        newHead.x--;
    }

    if (direction === "up") {
        newHead.y--;
    }

    if (direction === "down") {
        newHead.y++;
    }


    // =============================================
    // COLISIÓN
    // =============================================

    if (checkCollision(newHead)) {

        endGame();

        return;

    }


    // =============================================
    // AGREGAR NUEVA CABEZA
    // =============================================

    snake.unshift(newHead);


    // =============================================
    // COMER MANZANA
    // =============================================

    if (
        newHead.x === apple.x &&
        newHead.y === apple.y
    ) {

        eatApple();

        // No eliminamos la cola.
        // La serpiente crece.

    }

    else {

        snake.pop();

    }


    drawGame();

}

function endGame() {

    gameRunning = false;
    gameOver = true;


    // Dibujar una última vez

    drawGame();


    // Mostrar mensaje

    ctx.fillStyle = "rgba(0, 0, 0, 0.65)";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    ctx.fillStyle = "white";

    ctx.textAlign = "center";


    ctx.font = "bold 36px Arial";

    ctx.fillText(
        "perdiste :(",
        canvas.width / 2,
        canvas.height / 2 - 20
    );


    ctx.font = "18px Arial";

    ctx.fillText(
        "con enter reinicias",
        canvas.width / 2,
        canvas.height / 2 + 25
    );

}



// =====================================================
// DIBUJAR TODO
// =====================================================

function drawGame() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    drawApple();

    drawSnake();

}


// =====================================================
// CONTROLES
// =====================================================

document.addEventListener(
    "keydown",
    function(event) {


        if (
            event.key === "ArrowUp" &&
            direction !== "down"
        ) {

            direction = "up";

        }


        if (
            event.key === "ArrowDown" &&
            direction !== "up"
        ) {

            direction = "down";

        }


        if (
            event.key === "ArrowLeft" &&
            direction !== "right"
        ) {

            direction = "left";

        }


        if (
            event.key === "ArrowRight" &&
            direction !== "left"
        ) {

            direction = "right";

        }


        if (
            event.key === "Enter" &&
            gameOver
        ) {
        
            restartGame();
        
        }

    }
);


// =====================================================
// INICIAR
// =====================================================

generateApple();

drawGame();


// Movimiento cada 200 ms

setInterval(
    moveSnake,
    200
);

// ======================== RESTART =======================

function restartGame() {

    snake = [
        { x: 6, y: 5 },
        { x: 5, y: 5 },
        { x: 4, y: 5 },
        { x: 3, y: 5 }
    ];


    direction = "right";


    score = 0;

    scoreElement.textContent =
        "Puntos: 0";


    gameRunning = true;

    gameOver = false;


    generateApple();

    drawGame();

    setTimeout(
        startBlink,
        3000
    );

}
