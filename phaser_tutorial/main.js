var groundHeight;

var player;
var platforms;
var cursors;

var stars;
var score = 0;
var scoreText;

var leftShockwave;
var rightShockwave;

var game = new Phaser.Game(800, 600, Phaser.AUTO, '', {
  preload: preload,
  create:  create,
  update:  update
});

function preload() {
  game.load.image('sky',       'assets/sky.png');
  game.load.image('ground',    'assets/platform.png');
  game.load.image('star',      'assets/star.png');
  game.load.image('shockwave', 'assets/shockwave.png');

  game.load.spritesheet('dude', 'assets/dude.png', 32, 48);
}

function create() {
  groundHeight = game.world.height - 64

  game.physics.startSystem(Phaser.Physics.ARCADE);
  game.add.sprite(0, 0, 'sky');

  // Score
  scoreText = game.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });

  // Platforms
  platforms = game.add.group();
  platforms.enableBody = true;

  var ground = platforms.create(0, groundHeight, 'ground');
  ground.scale.setTo(2, 2);
  ground.body.immovable = true;

  var ledge = platforms.create(400, 400, 'ground');
  ledge.body.immovable = true;

  ledge = platforms.create(-150, 250, 'ground');
  ledge.body.immovable = true;

  // Player
  player = game.add.sprite(32, game.world.height - 150, 'dude');
  game.physics.arcade.enable(player);

  player.state = 'rest';
  player.body.gravity.y = 300;
  player.body.collideWorldBounds = true;

  player.animations.add('left', [0, 1, 2, 3], 10, true);
  player.animations.add('right', [5, 6, 7, 8], 10, true);

  // Controls
  cursors = game.input.keyboard.createCursorKeys();

  // Stars
  stars = game.add.group();
  stars.enableBody = true;

  for (var i = 0; i < 12; i++) {
    var star = stars.create(i * 70, 0, 'star');
    star.body.gravity.y = 6;
    star.body.bounce.y = 0.7 + Math.random() * 0.2;
  }
}

function update() {
  game.physics.arcade.collide(player, platforms);
  game.physics.arcade.collide(stars, platforms);
  game.physics.arcade.collide(player, stars, collectStar, null, this);

  player.body.velocity.x = 0;

  if (cursors.left.isDown) {
    player.body.velocity.x = -150;
    player.animations.play('left');
  } else if (cursors.right.isDown) {
    player.body.velocity.x = 150;
    player.animations.play('right');
  } else {
    player.animations.stop();
    player.frame = 4;
  }

  if (cursors.up.isDown && player.body.touching.down) {
    player.body.velocity.y = -350;
  }

  if (player.state == 'slamming' && player.body.touching.down) {
    player.state = 'rest'

    var currentHeight = groundHeight - player.y;
    var shockwaveVelocity = (player._slamHeight - currentHeight);

    // slamming done, create a shockwave
    rightShockwave = game.add.sprite(player.x + 48, player.y + 48, 'shockwave');
    leftShockwave = game.add.sprite(player.x - 16, player.y + 48, 'shockwave');

    // we need physics for the shockwaves
    game.physics.arcade.enable(rightShockwave);
    game.physics.arcade.enable(leftShockwave);

    // kill when out of bounds
    leftShockwave.checkWorldBounds  = true;
    leftShockwave.outOfBoundsKill   = true;
    rightShockwave.checkWorldBounds = true;
    rightShockwave.outOfBoundsKill  = true;

    // anchor in the middle
    rightShockwave.anchor.setTo(0.5, 1);
    leftShockwave.anchor.setTo(0.5, 1);

    // flip the left shockwave
    leftShockwave.scale.x = 1;
    leftShockwave.scale.x = -1;

    // make shockwaves move
    rightShockwave.body.velocity.x = shockwaveVelocity;
    leftShockwave.body.velocity.x = -shockwaveVelocity;
  }

  if (leftShockwave) {
    if (leftShockwave.body.velocity.x >= 0) {
      leftShockwave.kill();
      leftShockwave = null;
    } else {
      leftShockwave.body.velocity.x += 10;
    }
  }

  if (rightShockwave) {
    if (rightShockwave.body.velocity.x <= 0) {
      rightShockwave.kill();
      rightShockwave = null;
    } else {
      rightShockwave.body.velocity.x -= 10;
    }
  }

  if (cursors.down.isDown && !player.body.touching.down && player.state != 'slamming') {
    // body slam!
    player.state = 'slamming';
    player.body.velocity.y = 1000;
    player._slamHeight = groundHeight - player.y;
  }
}

function collectStar(player, star) {
  star.kill();
  score += 10;
  scoreText.text = 'Score: ' + score;
}
