var myId=0;

var land;

var shadow;
var tank;
var turret;
var player;
var tanksList;
var explosions;
var health;
var tankSelect;
var myHealth;

var logo;


var cursors;

var bullets;
var fireRate = 100;
var nextFire = 0;

var ready = false;
var eurecaServer;


//this function will handle client communication with the server
var eurecaClientSetup = function() {
	//create an instance of eureca.io client
	var eurecaClient = new Eureca.Client();
	
	eurecaClient.ready(function (proxy) {		
		eurecaServer = proxy;
	});
	
	
	//methods defined under "exports" namespace become available in the server side
	
	eurecaClient.exports.setId = function(id) 
	{
		//create() is moved here to make sure nothing is created before uniq id assignation
		myId = id;
		create();
		eurecaServer.handshake();
		ready = true;
	}	
	
	eurecaClient.exports.kill = function(id)
	{	
		if (tanksList[id]) {
			tanksList[id].kill();
			console.log('killing ', id, tanksList[id]);
		}
	}	
	
	eurecaClient.exports.spawnEnemy = function(i, x, y)
	{
		
		if (i == myId) return; //this is me
		
		console.log('SPAWN');
		var tnk = new Tank(i, game, tank);
		tanksList[i] = tnk;
	}
	
		eurecaClient.exports.updateState = function(id, state)
	{
		if (tanksList[id])  {
			tanksList[id].cursor = state;
			if (tanksList[id].tank.x != state.x){
				tanksList[id].tank.x = state.x;	
			}
			if (tanksList[id].tank.y != state.y){
				tanksList[id].tank.y = state.y;	
			}
			if (tanksList[id].tank.angle != state.angle){
				tanksList[id].tank.angle = state.angle;	
			}
			if (tanksList[id].turret.angle != state.angle){
				tanksList[id].turret.angle = state.angle;	
			}
			if (tanksList[id].turret.rotation != state.rot){
				tanksList[id].turret.rotation = state.rot;	
			}		
			if (tanksList[id].turret.rotation != state.rot){
				tanksList[id].turret.rotation = state.rot;	
			}	
		}
	}
	
}


Tank = function (index, game, player) {
	this.cursor = {
		left:false,
		right:false,
		up:false,
		fire:false,
		takeDamage: false,
	}

	this.input = {
		left:false,
		right:false,
		up:false,
		fire:false,
		takeDamage: false
	}

    var x = 0;
    var y = 0;

    this.game = game;
    this.player = player;
    this.bullets = game.add.group();
    this.bullets.enableBody = true;
    this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
    this.bullets.createMultiple(20, 'bullet', 0, false);
    this.bullets.setAll('anchor.x', 0.5);
    this.bullets.setAll('anchor.y', 0.5);
    this.bullets.setAll('outOfBoundsKill', true);
    this.bullets.setAll('checkWorldBounds', true);	
	
	this.currentSpeed =0;
    this.fireRate = 500;
    this.nextFire = 0;
    this.alive = true;

    this.shadow = game.add.sprite(x, y, 'enemy', 'shadow');
    this.tank = game.add.sprite(x, y, 'enemy', 'tank1');
    this.turret = game.add.sprite(x, y, 'enemy', 'turret');

    this.shadow.anchor.set(0.5);
    this.tank.anchor.set(0.5);
    this.turret.anchor.set(0.3, 0.5);

    this.tank.id = index;
    game.physics.enable(this.tank, Phaser.Physics.ARCADE);
    this.tank.body.immovable = false;
    this.tank.body.collideWorldBounds = true;
    this.tank.body.bounce.setTo(0, 0);
	this.tank.health = 100;
	
    this.tank.angle = 0;
	
	
	if(this.tank.id ==myId){
		this.tank.myHealth = game.add.text(32, 550, "Health: " + this.tank.health, { font: "20px Arial", fill: "#ffffff", align: "left" });
		this.tank.myHealth.fixedToCamera = true;
	}

    game.physics.arcade.velocityFromRotation(this.tank.rotation, 0, this.tank.body.velocity);

};

Tank.prototype.update = function() {
		
	var inputChanged = (
		this.cursor.left != this.input.left ||
		this.cursor.right != this.input.right ||
		this.cursor.up != this.input.up ||
		this.cursor.fire != this.input.fire ||
		this.cursor.takeDamage != this.input.takeDamage
	);
	
	
	if (inputChanged)
	{
		//Handle input change here
		//send new values to the server		
		if (this.tank.id == myId)
		{
			// send latest valid state to the server
			this.input.x = this.tank.x;
			this.input.y = this.tank.y;
			this.input.angle = this.tank.angle;
			this.input.rot = this.turret.rotation;
			
			eurecaServer.handleKeys(this.input);
			
		}
	}
	
	
    if (this.cursor.left)
    {
        this.tank.angle -= 1;
    }
    else if (this.cursor.right)
    {
        this.tank.angle += 1;
    }	
    if (this.cursor.up)
    {
        //  The speed we'll travel at
        this.currentSpeed = 300;
    }
    else
    {
        if (this.currentSpeed > 0)
        {
            this.currentSpeed -= 4;
        }
    }
    if (this.cursor.fire)
    {	
		this.fire({x:this.cursor.tx, y:this.cursor.ty});
    }
	if (this.cursor.takeDamage){
		this.tank.health -= 10;
	}
    if (this.currentSpeed > 0)
    {
        game.physics.arcade.velocityFromRotation(this.tank.rotation, this.currentSpeed, this.tank.body.velocity);
    }	
	else
	{
		game.physics.arcade.velocityFromRotation(this.tank.rotation, 0, this.tank.body.velocity);
	}	
	
	if (this.tank.health == 0){
		this.kill();
		return;
	}
	
	
	
    this.shadow.x = this.tank.x;
    this.shadow.y = this.tank.y;
    this.shadow.rotation = this.tank.rotation;

    this.turret.x = this.tank.x;
    this.turret.y = this.tank.y;
	
	if (this.tank.id == myId){
		this.tank.myHealth.setText("Health: " + this.tank.health);
	}
};


Tank.prototype.fire = function(target) {
		if (!this.alive) return;
        if (this.game.time.now > this.nextFire && this.bullets.countDead() > 0)
        {
            this.nextFire = this.game.time.now + this.fireRate;
            var bullet = this.bullets.getFirstDead();
            bullet.reset(this.turret.x, this.turret.y);

			bullet.rotation = this.game.physics.arcade.moveToObject(bullet, target, 500);
        }
}


Tank.prototype.kill = function() {
	this.alive = false;
	this.tank.kill();
	this.turret.kill();
	this.shadow.kill();
}

//var game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-example', { preload: preload, create: eurecaClientSetup, update: update, render: render });
var game = new Phaser.Game(800,600,Phaser.AUTO, 'gameElement');

TankSelect = function(){};
TankSelect.prototype = {
	preload: function(){
		this.game.load.image('background', 'assets/background.jpg');
	},	
	create: function(){
		this.game.add.sprite(0,0,'background');
		var instructions = this.game.add.text(250,100,'Click here to play!', { font: "20px Arial", fill: "#ffffff", align: "left" });
		var tank1 = this.game.add.text(100,200,'Tanks is a competitive player versus player game', { font: "20px Arial", fill: "#ffffff", align: "left" });
		var tank2 = this.game.add.text(50,300,'Play with your friends and battle to find out who the greatest tank commander is!', { font: "20px Arial", fill: "#ffffff", align: "left" });
		var tank3 = this.game.add.text(100,400,'Use the arrow keys to move, and the mouse to rotate and fire the turret.', { font: "20px Arial", fill: "#ffffff", align: "left" });
		
		instructions.inputEnabled = true;
		
		instructions.events.onInputUp.add(startGame1);
		
		function startGame1(){
			game.state.start('Tanks');
		}
	}
};

tanks = function(){};

tanks.prototype = {
	preload: preload,
	create:eurecaClientSetup,
	update: update
}

game.state.add('TankSelect', TankSelect);
game.state.add('Tanks', tanks);

game.state.start('TankSelect');

function preload () {

    game.load.atlas('tank', 'assets/tanks.png', 'assets/tanks.json');
    game.load.atlas('enemy', 'assets/enemy-tanks.png', 'assets/tanks.json');
    game.load.image('logo', 'assets/logo.png');
    game.load.image('bullet', 'assets/bullet.png');
    game.load.image('earth', 'assets/scorched_earth.png');
    game.load.spritesheet('kaboom', 'assets/explosion.png', 64, 64, 23);
    
}

function create () {

	game.physics.startSystem(Phaser.Physics.ARCADE);
    //  Resize our game world to be a 2000 x 2000 square
    game.world.setBounds(-1000, -1000, 2000, 2000);
	game.stage.disableVisibilityChange  = true;
	
    //  Our tiled scrolling background
    land = game.add.tileSprite(0, 0, 800, 600, 'earth');
    land.fixedToCamera = true;
    
    tanksList = {};
	
	player = new Tank(myId, game, tank, tankSelect);
	tanksList[myId] = player;
	tank = player.tank;
	turret = player.turret;
	tank.x=0;
	tank.y=0;
	bullets = player.bullets;
	shadow = player.shadow;	

    //  Explosion pool
    explosions = game.add.group();

    for (var i = 0; i < 10; i++)
    {
        var explosionAnimation = explosions.create(0, 0, 'kaboom', [0], false);
        explosionAnimation.anchor.setTo(0.5, 0.5);
        explosionAnimation.animations.add('kaboom');
    }

    tank.bringToTop();
    turret.bringToTop();
		
    logo = game.add.sprite(0, 200, 'logo');
    logo.fixedToCamera = true;

    game.input.onDown.add(removeLogo, this);

    game.camera.follow(tank);
    game.camera.deadzone = new Phaser.Rectangle(150, 150, 500, 300);
    game.camera.focusOnXY(0, 0);

    cursors = game.input.keyboard.createCursorKeys();
	
	setTimeout(removeLogo, 1000);
	
}

function removeLogo () {
    game.input.onDown.remove(removeLogo, this);
    logo.kill();
}

function update () {
	//do not update if client not ready
	if (!ready) return;
	
	player.input.left = cursors.left.isDown;
	player.input.right = cursors.right.isDown;
	player.input.up = cursors.up.isDown;
	player.input.fire = game.input.activePointer.isDown;
	player.input.tx = game.input.x+ game.camera.x;
	player.input.ty = game.input.y+ game.camera.y;
	player.input.takeDamage = false;
	
	
	
	turret.rotation = game.physics.arcade.angleToPointer(turret);	
    land.tilePosition.x = -game.camera.x;
    land.tilePosition.y = -game.camera.y;

    	
	//Cycling through all tanks to find tank hit
    for (var i in tanksList)
    {
		if (!tanksList[i]) continue;
		var curBullets = tanksList[i].bullets;
		var curTank = tanksList[i].tank;
		for (var j in tanksList)
		{
			if (!tanksList[j]) continue;
			if (j!=i) 
			{			
				var targetTank = tanksList[j].tank;
				
				if (game.physics.arcade.overlap(curBullets, targetTank, bulletHitPlayer, null, this) == true){
					tanksList[j].input.takeDamage = true;
				}
				//game.physics.arcade.overlap(curBullets, targetTank, bulletHitPlayer, null, this);
			}
			if (tanksList[j].alive)
			{
				tanksList[j].update();
			}			
		}
    }
}


function bulletHitPlayer (tank, bullet) {

	//tank.health -= 100;
    bullet.kill();
}

function render () {}

