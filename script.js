// When it loads, run the game
window.addEventListener("load", function() {
    const canvas = document.getElementById("canvas1");
    const ctx = canvas.getContext("2d");
    canvas.width = 1200;
    canvas.height = 750;
    let enemies = [];
    let score = 0;  // set score
    let gameOver = false;

    // Handles input from player
    class InputHandler {
        constructor() {
            this.keys = [];
            window.addEventListener("keydown", e => {
                if ((   e.key === "ArrowDown" || 
                        e.key === "ArrowUp" ||
                        e.key === "ArrowLeft" ||
                        e.key === "ArrowRight") &&
                        this.keys.indexOf(e.key) === -1) {
                    this.keys.push(e.key);
                }
            });

            window.addEventListener("keyup", e => {
                if (e.key === "ArrowDown" || 
                    e.key === "ArrowUp" ||
                    e.key === "ArrowLeft" ||
                    e.key === "ArrowRight") {
                    this.keys.splice(this.keys.indexOf(e.key), 1);
                }
            });
        }
    }

    // Handles player 
    class Player {
        constructor(gameWidth, gameHeight) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.width = 170;
            this.height = 278;
            this.x = 0;
            this.y = this.gameHeight - this.height;
            this.image = document.getElementById("playerImage");
            this.frameX = 0;
            this.frameY = 0;
            this.maxFrame = 4;
            this.fps = 6;
            this.frameTimer = 0;
            this.frameInterval = 1000/this.fps;
            this.speed = 0;
            this.vy = 0;
            this.weight = 0.4;
        }

        draw(context) {
            /*
            context.strokeStyle = "white";
            context.strokeRect(this.x, this.y, this.width, this.height);
            // first three is where the image will be placed, the other three will be where it will be cropped (d)
            // image, sx, sy, sw, sh, desx, desy, desw, desh
            */
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

        update(input, deltaTime, enemies) {
             // collision detection
            enemies.forEach(enemy => {
                const dx = (enemy.x + enemy.width/ 2) - (this.x + this.width / 2); 
                const dy = (enemy.y + enemy.height/ 2) - (this.y + this.height / 2);
                const distance = Math.sqrt(dx * dx + dy * dy); // calculate distance between centers
                const combinedRadius = (enemy.width) / 2 + this.width / 2;

                // Check if the distance is less than or equal to the sum of their radii
                if (distance < combinedRadius) {
                    gameOver = true;
                }
            });

            // sprite animation
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
            // Horizontal movement
            this.x += this.speed;
            if (this.x < 0) {
                this.x = 0;
            }

            else if (this.x > this.gameWidth - this.width) {
                this.x = this.gameWidth - this.width;
            }

            // Vertical movement
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
    }

    // Handles the background
    class Background {
        constructor(gameWidth, gameHeight) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.image = document.getElementById("backgroundImage");
            this.tileImage = document.getElementById("tile"); // Load the tile image
            this.x = 0;
            this.y = 0;
            this.width = gameWidth;
            this.height = gameHeight;
            this.speed = 1.5;
            this.tileWidth = 2000; // Adjust the width of the tile as needed
            this.tileHeight = 230; // Adjust the height of the tile as needed
            this.tileX = 0; // Initial x position for the tile
            this.scale = 0.6;
            this.tileY = this.gameHeight - this.tileHeight  * this.scale; // Place the tile at the bottom
            this.tileSpeed = 2;
        }
        
        draw(context) {
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

        update() {
            this.x -= this.speed;

            // if screen scrolled away off screen
            if (this.x < 0 - this.width) {
                this.x = 0;
            }

            this.tileX -= this.tileSpeed;

            if (this.tileX < 0 - this.tileWidth * this.scale) {
                this.tileX = 0;
            }
        }
    }

    // Handles the enemy
    class Enemy {
        constructor(gameWidth, gameHeight) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.width = 125;
            this.height = 145;
            this.image = document.getElementById("enemy");
            this.x = this.gameWidth;
            // this.scale = 0.3;
            this.y = this.gameHeight - this.height;
            this.frameX = 0;
            // enemy sprite sheet
            this.maxFrame = 3;
            // affect enemy
            this.fps = 8;
            this.frameTimer = 0;
            this.frameInterval = 1000/this.fps
            this.speed = 3;
            this.markedForDeletion = false;
        }

        draw(context) {
            // hitbox
            /*
            context.strokeStyle = "white";
            context.strokeRect(this.x, this.y, this.width, this.height);
            context.beginPath();
            context.arc(
                this.x + this.width/2, 
                this.y + this.height/2, 
                this.width/2, 
                0, 
                Math.PI * 2
            );
            context.stroke();
            */

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

        update(deltaTime) {
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

            this.x -= this.speed;

            // if monster moved out of screen
            if (this.x < 0 - (this.width)) {
                this.markedForDeletion = true;
                score++;    // point increase
            }
        }
    }

    // Handles the enemies
    function handleEnemies(deltaTime) {
        if (enemyTimer > enemyInterval + randomEnemyInterval) {
            enemies.push(new Enemy(canvas.width, 610));
            console.log(enemies);
            randomEnemyInterval = Math.random() * 1000 + 500;
            enemyTimer = 0;
        }

        else {
            enemyTimer += deltaTime;
        }

        enemies.forEach(enemy => {
            enemy.draw(ctx);
            enemy.update(deltaTime);
        });

        // Check for each enemy if they are marked for deletion
        enemies = enemies.filter(enemy => !enemy.markedForDeletion);
    }

    function displayStatusText(context) {
        context.fillStyle = "white";
        context.font = "20px Helvetica";
        context.fillText("Score: " + score, 20, 50);    // 20 x coord, 50 y coord

        if (gameOver) {
            context.fillStyle = "rgba(255, 193, 225, 0.68)";
            context.fillRect(0, 0, canvas.width, canvas.height);

            context.textAlign = "center";
            context.fillStyle = "pink";
            context.fillText("GAME OVER, try again!", canvas.width/2 + 2, canvas.height/2 + 2);

            context.textAlign = "center";
            context.fillStyle = "white";
            context.fillText("GAME OVER, try again!", canvas.width/2, canvas.height/2);       
        }
    }

    const input = new InputHandler();
    const player = new Player(canvas.width, 600);
    const background = new Background(canvas.width, canvas.height);

    let lastTime = 0;
    let enemyTimer = 0;
    // Every 1000 a monster appear
    let enemyInterval = 1000;
    let randomEnemyInterval = Math.random() * 1000 + 500; 

    // Animates the player, enemies, and background
    function animate(timeStamp) {
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        background.draw(ctx);
        background.update(input);
        player.draw(ctx);
        player.update(input, deltaTime, enemies);
        handleEnemies(deltaTime);
        displayStatusText(ctx);

        if (!gameOver) {
            requestAnimationFrame(animate);
        } 
    }
    animate(0);
});

