class Layer {
    constructor(image, speedModifier) {
        this.x = 0;
        this.y = 0;
        this.width = 2400;
        this.height = 700;
        this.image = image;
        this.speedModifier = speedModifier;
        this.speed = gameSpeed * this.speedModifier;
    }

    update() {
        this.speed = gameSpeed * this.speedModifier;
        // If the x coordinate is less than the width of the image
        if (this.x <= -this.width) {
            this.x = 0;
        }

        // Subtract the x coord to the speed of game
        this.x = this.x - this.speed;
    }

    draw () {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        ctx.drawImage(this.image, this.x + this.width, this.y, this.width, this.height);

    }

    const layer1 = new Layer(backgroundLayer1, 0.2);
    
    const gameObjects = [layer1];

    // Animate loop
    function animate() {
        // Clears the designated area
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
        // Draws the image where it will be drawn
        // image, x coordinate, y coordinate
        // ctx.drawImage(playerImage, sx, sy, sw, sh, dx, dy, dw, dh)
        // Cropping outimage from top left corner
        ctx.drawImage(playerImage, frameX * spriteWidth, frameY, spriteWidth, spriteHeight, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
        // Changes the speed of the animation
        /*
        if (gameFrame % staggerFrames == 0) {
            if (frameX < 4) {
                frameX++;
            } 
            else {
                frameX = 0;
            } 
        }
    
        gameFrame++;
        */
    
        gameObjects.forEach(object => {
            object.update();
            object.draw();
        });
    
        gameFrame++;
    
        // Animates the square
        requestAnimationFrame(animate);
};