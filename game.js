// Create the state that will contain the whole game
// Much of this code was yanked from here: http://www.lessmilk.com/tutorial/2d-platformer-phaser
var mainState = {  
    preload: function() {  
        // Here we preload the assets
        game.load.image('player', 'assets/player.png');
        game.load.image('wall', 'assets/wall.png');
        game.load.image('coin', 'assets/coin.png');
        game.load.image('lava', 'assets/lava.png');
        game.load.image('door', 'assets/door.png');
        game.load.image('interaction', 'assets/interaction.png');
        game.load.spritesheet('identity', 'assets/identity.png', 20, 20, 5);
        //music generated with http://www.abundant-music.com/ seed 1990
        game.load.audio('music', 'assets/main.ogg');
    },

    create: function() {
        // Here we create the game
        music = game.add.audio('music');
        currentLevel = 'level1';
        interacting = false;

        music.loopFull();

        // Set the background color to blue
        game.stage.backgroundColor = '#000';

        // Start the Arcade physics system (for movements and collisions)
        game.physics.startSystem(Phaser.Physics.ARCADE);

        // Add the physics engine to all game objects
        game.world.enableBody = true;

        // Variable to store the arrow key and space bar pressed
        this.cursor = game.input.keyboard.createCursorKeys();
        this.spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

        // Create the player
        this.player = game.add.sprite(70,40, 'identity');
        var changeColor = this.player.animations.add('changeColor');
        this.player.animations.play('changeColor', .5, true);

        // Add gravity to make it fall
        this.player.body.gravity.y = 600;

        // Create 3 groups that will contain our objects
        this.walls = game.add.group();
        this.coins = game.add.group();
        this.lavas = game.add.group();
        this.doors = game.add.group();
        this.interactions = game.add.group();

        //switch levels WIP
        level = levelsCollection[currentLevel];
        // Create the level by going through the array
        for (var i = 0; i < level.length; i++) {
            for (var j = 0; j < level[i].length; j++) {

                // Create a wall and add it to the 'walls' group
                if (level[i][j] == 'x') {
                    var wall = game.add.sprite(30+20*j, 30+20*i, 'wall');
                    this.walls.add(wall);
                    wall.body.immovable = true; 
                }

                // Create a coin and add it to the 'coins' group
                else if (level[i][j] == 'o') {
                    var coin = game.add.sprite(30+20*j, 30+20*i, 'coin');
                    this.coins.add(coin);
                }

                // Create a lava and add it to the 'lava' group
                else if (level[i][j] == '!') {
                    var lava = game.add.sprite(30+20*j, 30+20*i, 'lava');
                    this.lavas.add(lava);
                }

                // Create a interaction and add it to the 'interaction' group
                else if (parseInt(level[i][j]) >= 0 && parseInt(level[i][j]) <= 9) {
                    var interaction = game.add.sprite(30+20*j, 30+20*i, 'interaction');
                    this.interactions.add(interaction);
                }

                // Create a interaction and add it to the 'interaction' group
                else if (level[i][j] == 'd') {
                    var door = game.add.sprite(30+20*j, 30+20*i, 'door');
                    this.doors.add(door);
                }
            }
        }

        var style = { font: "bold 20px monospace", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };

        //  The Text is positioned at 0, 100
        text = game.add.text(0, 0, "", style);
        text.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);

        //  We'll set the bounds to be from x0, y100 and be 800px wide by 100px high
        text.setTextBounds(0, 560, 800, 100);

        // game.time.events.loop(Phaser.Timer.SECOND * game.rnd.integerInRange(5, 10), this.changeColor);
    },

    update: function() {
        // Here we update the game 60 times per second

        // Make the player and the walls collide
        game.physics.arcade.collide(this.player, this.walls);

        // Call the 'takeCoin' function when the player takes a coin
        game.physics.arcade.overlap(this.player, this.coins, this.takeCoin, null, this);

        // Call the 'restart' function when the player touches the lava
        game.physics.arcade.overlap(this.player, this.lavas, this.restart, null, this);

        // Call the 'restart' function when the player touches the door
        game.physics.arcade.overlap(this.player, this.doors, this.restart, null, this);

        // Move the player when an arrow key is pressed
        if (this.cursor.left.isDown) 
            this.player.body.velocity.x = -200;
        else if (this.cursor.right.isDown) 
            this.player.body.velocity.x = 200;
        else 
            this.player.body.velocity.x = 0;

        // Make the player jump if he is touching the ground
        if (this.spaceKey.isDown && this.player.body.touching.down)
            this.player.body.velocity.y = -250;

        if (this.cursor.up.isDown && interacting == false) {
            for (c in Object.keys(this.interactions.children)) {
                if (game.physics.arcade.overlap(this.player, this.interactions.children[c], this.callbackFn, null, this) == true) {
                    interacting = true;
                    this.interactWith(c);
                }
            }
        }
    },

    // Function to kill a coin
    takeCoin: function(player, coin) {
        coin.kill();
    },

    interactWith: function(c) {
        text.setText(interactionsCollection[currentLevel][c]);
        //this.resetTextBox();
        // game.time.events.add(Phaser.Timer.SECOND * 4, this.resetTextBox(), this)
        interacting = false;
    },

    resetTextBox: function() {
        text.setText("");
    },

    // Function to restart the game
    restart: function() {
        music.destroy();
        game.state.start('main');
    }
};

// Initialize the game and start our state
var game = new Phaser.Game(800, 660);
game.state.add('main', mainState);
game.state.start('main');