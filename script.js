// When it loads, run the game
window.addEventListener("load", function() {
    const canvas = document.getElementById("canvas1");
    const ctx = canvas.getContext("2d");
    canvas.width = 1200;
    canvas.height = 750;
    let enemies = [];   // Store enemies
    let score = 0;  // Set score
    let gameOver = false;

    // Handles input from player
    class InputHandler {
        constructor() {
            this.keys = [];

            // Window listens to user's input
            window.addEventListener("keydown", e => {
                if ((   e.key === "ArrowDown" || 
                        e.key === "ArrowUp" ||
                        e.key === "ArrowLeft" ||
                        e.key === "ArrowRight") &&
                        this.keys.indexOf(e.key) === -1) {  // Checks if the pressed key is not already in the keys array
                    this.keys.push(e.key);  // Add the key
                }
            });

            // Signals that the player has stopped pressing that key
            window.addEventListener("keyup", e => {
                if (e.key === "ArrowDown" || 
                    e.key === "ArrowUp" ||
                    e.key === "ArrowLeft" ||
                    e.key === "ArrowRight") {

                    // Finds the position (index) of the released key, removes the item from the keys
                    // array at the position of the found index
                    this.keys.splice(this.keys.indexOf(e.key), 1);
                }
            });
        }
    }

    // Handles player 
    class Player {
        constructor(gameWidth, gameHeight) {
            // Gets the player image
            this.image = document.getElementById("playerImage");

            // Dimensions of the game area
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;

            // The size of the player
            this.width = 170;
            this.height = 278;

            // Position of the background image
            this.x = 0;
            this.y = this.gameHeight - this.height;

            // Keep tracks of which frame of the sprite is shown
            this.frameX = 0;
            this.frameY = 0;

            // Sets how many frames the sprite animation has
            this.maxFrame = 4;

            this.fps = 6;   // Determines the animation speed
            this.frameTimer = 0;    // Keeps track

            // Calculates how much time should pass between each frame of the animation
            this.frameInterval = 1000/this.fps; 

            //  Controls how fast the player moves left or right
            this.speed = 0;

            // Vertical speed
            this.vy = 0;

            // Simulates gravity
            this.weight = 0.4;
        }

        // Draws the player on the screen using the image and animation frames
        draw(context) {
            context.drawImage(
                this.image, 
                this.frameX * this.width, 
                this.frameY * this.height, 
                this.width, 
                this.height, 
                this.x, 
                this.y, 
                this.width, 
                this.height
            );
        }

        // Handles what happens when the player moves or interacts with the enemy
        update(input, deltaTime, enemies) {
             // Collision detection
            enemies.forEach(enemy => {
                const dx = (enemy.x + enemy.width/ 2) - (this.x + this.width / 2); 
                const dy = (enemy.y + enemy.height/ 2) - (this.y + this.height / 2);

                // Calculate distance between centers
                const distance = Math.sqrt(dx * dx + dy * dy); 
                const combinedRadius = (enemy.width) / 2 + this.width / 2;

                // Check if the distance is less than or equal to the sum of their radius
                if (distance < combinedRadius) {
                    gameOver = true;
                }
            });

            // Sprite animation
            if (this.frameTimer > this.frameInterval) {
                if (this.frameX >= this.maxFrame) {
                    this.frameX = 0;
                }
    
                else {
                    this.frameX++;
                }

                this.frameTimer = 0;
            }

            else {
                this.frameTimer += deltaTime;
            }

            // Player moves the character fowards
            if (input.keys.indexOf("ArrowRight") > -1) {
                this.speed = 5;
            }

            // Player moves the character backwards
            else if (input.keys.indexOf("ArrowLeft") > -1) {
                this.speed = -5;
            }

            else if (input.keys.indexOf("ArrowUp") > -1 && this.onGround()) {
                this.vy -= 19;
            }

            else {
                this.speed = 0;
            }

            // Stops the player from moving out the game
            // Horizontal movement:
            this.x += this.speed;
            if (this.x < 0) {
                this.x = 0;
            }

            else if (this.x > this.gameWidth - this.width) {
                this.x = this.gameWidth - this.width;
            }

            // Vertical movement:
            this.y += this.vy;
            // If in air, add more weight (pushing player down)
            if (!this.onGround()) {
                this.vy += this.weight;
                this.maxFrame = 4;
            }

            // Player is back on ground
            else {
                // Reset velocity to 0 to stop vertical movement
                this.vy = 0;
                this.maxFrame = 4;
            }

            // Player can never be below the game
            if (this.y > this.gameHeight - this.height) {
                this.y = this.gameHeight - this.height;
            }
        }

        // Checks if player is on the ground
        onGround() {
            return this.y >= this.gameHeight - this.height;
        }

        // Resets the player's position and mvoement back to the starting state
        reset() {
            this.x = 0;
            this.y = this.gameHeight - this.height;
            this.frameX = 0;
            this.frameY = 0;
            this.speed = 0;
            this.vy = 0;
        }
    }

    // Handles the background
    class Background {
        constructor(gameWidth, gameHeight) {
            // Retrieve the background and tile images
            this.image = document.getElementById("backgroundImage");
            this.tileImage = document.getElementById("tile"); 
            
            // Dimensions of the game
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;

            // Posiiton of the backgrund
            this.x = 0;
            this.y = 0;

            // The size of the background
            this.width = gameWidth;
            this.height = gameHeight;
            this.speed = 1.5;

            // Set dimension of tile
            this.tileWidth = 2000; 
            this.tileHeight = 230; 

            // Shrinks the tile image to fit better
            this.scale = 0.6;

            // Position of the tile
            this.tileX = 0; 
            this.tileY = this.gameHeight - this.tileHeight  * this.scale;

            // Controls how fast the tile image moves
            this.tileSpeed = 2;
        }
        
        // Draws the background and tile on the screen, allowing continous background
        // Draws the image twice, one after the other, so when one part of the 
        // background scrolls out of view, the other part is already there
        draw(context) {
            // Allows seamless continuous background
            context.drawImage(
                this.image, 
                this.x, 
                this.y, 
                this.width, 
                this.height
            );

            context.drawImage(
                this.image, 
                this.x + this.width - this.speed, 
                this.y, 
                this.width, 
                this.height
            );

            // Allows seamless continuous tile
            context.drawImage(
                this.tileImage, 
                this.tileX, 
                this.tileY, 
                this.tileWidth * this.scale, 
                this.tileHeight * this.scale
            );

            context.drawImage(
                this.tileImage, 
                this.tileX + this.tileWidth * this.scale, 
                this.tileY, 
                this.tileWidth * this.scale, 
                this.tileHeight * this.scale
            );
        }

        // Moves the background and tile by adjusting x and tileX based on their speeds
        update() {
            this.x -= this.speed;

            // If the screen scrolled away off screen
            if (this.x < 0 - this.width) {
                this.x = 0;
            }

            this.tileX -= this.tileSpeed;

            if (this.tileX < 0 - this.tileWidth * this.scale) {
                this.tileX = 0;
            }
        }

        // Resets the background and tile positions to their starting points
        reset() {
            this.x = 0;

            // Initial x position for the tile
            this.tileX = 0; 
        }
    }

    // Handles the enemy
    class Enemy {
        constructor(gameWidth, gameHeight) {
            // Dimensions of the game area
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;

            // Sets dimensions of the background
            this.width = 125;
            this.height = 145;

            // Gets the image of the enemy
            this.image = document.getElementById("enemy");

            // Position the enenmy
            this.x = this.gameWidth;
            this.y = this.gameHeight - this.height; // Position the enemy to the bottom of the game

            // Keep track what animation frame is shown (x-coord)
            this.frameX = 0;

            // Sets how many frames the sprite animation has
            this.maxFrame = 3;

            // Determines the animation speed
            this.fps = 8;
            this.frameTimer = 0;    // Keeps track

            // Calculates how much time should pass between each frame of the animation
            this.frameInterval = 1000/this.fps

            //  Controls how fast the player moves left or right
            this.speed = 3;

            // Checks if the enemy needs to be deleted
            this.markedForDeletion = false;
        }

        // Draws the enemy
        draw(context) {
            context.drawImage(
                this.image, 
                this.frameX * this.width, 
                0, 
                this.width, 
                this.height, 
                this.x, 
                this.y, 
                this.width, 
                this.height
            );
        }

        // Handles what happen when the enemy moves or out the screen
        update(deltaTime) {
            // Checks if enough time has passed since the last frame was shown
            if (this.frameTimer > this.frameInterval) {
                // Checks if the current frame is the max frame
                if (this.frameX >= this.maxFrame) {
                    // Resets the frame to 0 to loop the animation
                    this.frameX = 0;
                }
                
                // If the current frame is not the max frame
                else {
                    this.frameX++;  // Increment the frame
                }

                // Resets the timer to 0 to start counting time for the next frame
                this.frameTimer = 0;
            }

            // If not enough time passed
            else {
                // Gradually increase the timer until it reaches frameInterval,
                // signalling it is time to switch to the next frame
                this.frameTimer += deltaTime;
            }

            // This moves the enemy to the left
            this.x -= this.speed;

            // If monster moved out of screen
            if (this.x < 0 - (this.width)) {
                this.markedForDeletion = true;
                score++;    // Increase score
            }
        }
    }

    // Handles the enemies
    function handleEnemies(deltaTime) {
        // Checks if enough time has passed to create a new enemy
        if (enemyTimer > enemyInterval + randomEnemyInterval) {
            // Creates a new Enemy object at the right edge of the game area
            enemies.push(new Enemy(canvas.width, 610));

            // Adds random variability to the interval, so enemies don't spawn too predictably
            randomEnemyInterval = Math.random() * 1000 + 500;

            // Resets the timer after enemy spawns, starting the countdown again
            enemyTimer = 0; 
        }

        // Not enough time passed
        else {
            // Increases the timer by delta time, counting up until the next enemy spawn
            enemyTimer += deltaTime;
        }

        // Loops through every enemy in the enemies array
        enemies.forEach(enemy => {
            // Draws each enemy
            enemy.draw(ctx);

            // Updates the enemy's position and animation
            enemy.update(deltaTime);
        });

        // Check for each enemy if they are marked for deletion
        enemies = enemies.filter(enemy => !enemy.markedForDeletion);
    }

    // Restarts the game
    function restartGame() {
        // Set everything to 0 and empty
        score = 0;
        gameOver = false;
        enemies = [];

        player.reset();
        background.reset();

        animate(0);
    }

    // Displays the score, game over texts and restart button
    function displayStatusText(context) {
        context.fillStyle = "white";
        context.font = "20px Varela Round";
        context.fillText("Score: " + score, 50, 50);

        // If the game is over
        if (gameOver) {
            const resetButton = document.createElement("button");
            resetButton.id = "resetButton";
            resetButton.textContent = "Restart";
            resetButton.style.fontSize = "16px";

            document.body.appendChild(resetButton);

            // When clicked, the gameOver status is set to false 
            // and it resets the game
            resetButton.addEventListener("click", () => {
                gameOver = false;
                document.body.removeChild(resetButton);
                restartGame();
            });

            context.fillStyle = "rgba(0, 0, 0, 0.46)";
            context.fillRect(0, 0, canvas.width, canvas.height);

            context.textAlign = "center";
            context.fillStyle = "white";
            context.fillText("GAME OVER!", ((canvas.width/2)), ((canvas.height/2) - 20));
        }
    }

    const input = new InputHandler();
    const player = new Player(canvas.width, 600);
    const background = new Background(canvas.width, canvas.height);

    let lastTime = 0;   // Tracks the time of the last frame
    let enemyTimer = 0; // Keep track of time for spawning new enemies

    // Every 1000 a monster appear
    let enemyInterval = 1000;
    let randomEnemyInterval = Math.random() * 1000 + 500; 

    // Animates the player, enenmy, and background
    function animate(timeStamp) {
        // Calculates the time difference between the current frame and the last frame
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;   // Updates lastTime to the current timeStamp
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draws the background and updates it
        background.draw(ctx);
        background.update(input);

        // Draws the player and updates its position and animation
        player.draw(ctx);
        player.update(input, deltaTime, enemies);

        // Manages enemy behavior
        handleEnemies(deltaTime);

        // Displays game-related info (like score)
        displayStatusText(ctx);

        // If the game is not over
        if (!gameOver) {
            // It requests the next animation frame, creating a loop
            requestAnimationFrame(animate);
        }
    }

    // Starts the animation loop
    animate(0);
});