$(function () {
	var MAX_CARD = 45,
	gameSize,
	$first=null,
	$second = null,
	selected = null,
	nextSelected = null,
	cardColours= null,
	cardOrder = null,
	pairsLeft,
	pairs;
	
	function shuffle(o){
		for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
		return o;
	}
	
	$.wait = function(ms) {
		// timeout function
		var defer = $.Deferred();
		setTimeout(function() { defer.resolve(); }, ms);
		return defer;
	};
	
	function startClicked() {
	
		$('#startButton').removeClass('selected');
		gameSize = 16;
		pairsLeft = gameSize/2;
		pairs = pairsLeft;
		$('#menuContainer').hide();
		$('#game-over').hide();
		createBoard();
	}
	function createBoard() {
		// Get colour list
		cardColours = new Array();
		
		$.ajax({
			type: "GET",
			url: 'http://worktest.accedo.tv/colours.conf',
			success: function(data) {
				$( 'div.ajax-field' ).html( data.responseText );
				
				var text = $('div.ajax-field').html();
				var matches = text.match(/#\b[0-9A-F]{6}\b/gi);
				
				$.merge(cardColours, matches);
				
				// create the order of the pairs
		
				cardOrder = new Array();
		
				for(var i=0; i<8;i++) {
					cardOrder.push(cardColours[i]);
					cardOrder.push(cardColours[i]);
				}
		
				shuffle(cardOrder);
				
			}
		});

		// create html card elements
		for(var i=0;i<gameSize;i++) {
			$('#cardContainer').append("<a class='card' data-id='" + i + "'></a>");
		}
		
		$('.card').each( function() {
			$(this).css('background-image', 'url(Assets/CardBack.png)');
		
		});
		//visual game start
		$('#cardContainer').show();
		$('#menu').show();
		$("#currentScore").css('background-image', 'url(Assets/Numbers/num0.png)');
		$('#logo').show();

		//select card 1
		$('.card:first').addClass('selected');
		
		return this;
    };
	
	function endGame() {
		$('#game-over').show();
		$('#menu').hide();
		$('#logo').empty();
		$('#logo').hide();
		$('#cardContainer').html("");
		$('#cardContainer').hide();
		$('#menuContainer').show();
		$('#startButton').addClass('selected');
	}
	
	function cardClicked(card) {
		if(card.hasClass("paired") || (selected!=null&&nextSelected!=null)) {
			// do nothing
		} else {
			if(selected == null) {
				selected = card.data('id');
				$first = card;
				//$first.css('background-image', 'url(Assets/Cards/' + cardOrder[selected] + '.png)');
				$first.css('background-image', 'none');
				$first.html("<div class='square' style='background-color: "+ cardOrder[selected] +"'></div>");
			} else {
				if(!card.is($first)) {
					nextSelected = card.data('id');
					$second = card;
					$second.css('background-image', 'none');
					$second.html("<div class='square' style='background-color: "+ cardOrder[nextSelected] +"'></div>");
					if(cardOrder[nextSelected] == cardOrder[selected]) {
						pairsLeft--;
						$("#currentScore").css('background-image', 'url(Assets/Numbers/num' + (pairs-pairsLeft) + '.png)');
						$second.addClass("paired");
						$first.addClass("paired");
						selected = null;
						$first = null;
						nextSelected = null;
					} else {
						$.wait(2000).then(function(){
							$second.css('background-image', 'url(Assets/CardBack.png)');
							$second.html("");
							$first.css('background-image', 'url(Assets/CardBack.png)');
							$first.html("");
							selected = null;
							$first = null;
							nextSelected = null;
						});
					}
					if(pairsLeft == 0)
						endGame();
				}
			}
		}
	}
	
	$(document).ready(function() {
		// mouse handling
		$('input').click(function(){
			startClicked();
		});
		
		$(document).on('click','.card', function(){
			cardClicked($(this));
		});
	});
	
	$(document).keydown(function(e) {
    switch(e.which) {
		case 13: // enter
		if($('.card.selected').length) {
			cardClicked($('.card.selected'));
		}
		else if($('input.selected').length) {
			startClicked();
		}
		
		break;
		case 32: // space
		
		if($('.card.selected').length) {
			cardClicked($('.card.selected'));
		}
		else if($('input.selected').length) {
			startClicked();
		}
		
		
		break;
        case 37: // left
		$current = $('.card.selected');
		if($current.data('id') != 0) {
			var next = ($current.data('id') - 1);
			while($('.card[data-id="' + next + '"]').hasClass('paired')) {
				next--;
			}
			if(next>=0){
				$('.card[data-id="' + next + '"]').addClass('selected');
				$current.removeClass('selected');
			}
		}
        break;

        case 38: // up
		
		$current = $('.card.selected');
		if($current.data('id') >= 8) {
			var next =  ($current.data('id') - 8),
				move = false;
			if($('.card[data-id="' + next + '"]').hasClass('paired')) {
				// check only 2 closest lower cards
				var temp = next;
				if(next+1<16 && !$('.card[data-id="' + ++next + '"]').hasClass('paired')) {
					move = true;
				}
				else if(next-2>=0 && !$('.card[data-id="' + --temp + '"]').hasClass('paired')) {
					move = true;
					next = temp;
				}
			}
			else {
				move=true;
			}
			if(move == true) {
				$('.card[data-id="' + next + '"]').addClass('selected');
				$current.removeClass('selected');
			}
		}
        break;

        case 39: // right
		
		$current = $('.card.selected');
		if($current.data('id') != 15) {
			var next = ($current.data('id') + 1);
			while($('.card[data-id="' + next + '"]').hasClass('paired')) {
				next++;
			}
			if(next < 16) {
				$('.card[data-id="' + next + '"]').addClass('selected');
				$current.removeClass('selected');
			}
			
		}
        break;

        case 40: // down
		
		$current = $('.card.selected');
		if($current.data('id') < 8) {
			var next =  ($current.data('id') + 8),
				move = false;
			if($('.card[data-id="' + next + '"]').hasClass('paired')) {
			var temp=next;
				// check only 2 closest lower cards
				if(next+1<16 && !$('.card[data-id="' + ++next + '"]').hasClass('paired')) {
					move = true;
				}
				else if(next-2>=0 && !$('.card[data-id="' + --temp + '"]').hasClass('paired')) {
					move = true;
					next = temp;
				}
			} else {
				move=true;
			}
			if(move == true) {
				$('.card[data-id="' + next + '"]').addClass('selected');
				$current.removeClass('selected');
			}
		}
        break;

        default: return; // exit this handler for other keys
    }
    e.preventDefault(); // prevent the default action (scroll / move caret)
});
});