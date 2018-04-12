var main = function(){
};
	main.prototype = {
		preload: function(){
			game.load.image('background', 'assets/tanks/background.jpg');
		},
		create: function(){
			game.add.sprite(0,0,'background');
			var mainText = game.add.text(250,100,'Welcome to tanks!', { font: "20px Arial", fill: "#ffffff", align: "left" });
			var mainText2 = game.add.text(250,200,'Click here to start!', { font: "20px Arial", fill: "#ffffff", align: "left" });
			
			mainText2.inputEnabled = true;
			
			mainText2.events.onInputUp.add(startGame);
			
			function startGame(){
				game.state.start('gameFile');
			}
		}
	};