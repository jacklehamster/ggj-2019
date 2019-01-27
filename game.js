const Game = function() {
	const BALLYSHIFT = 10;
	const MAGNETXSHIFT = -2, MAGNETYSHIFT = -10;
	const BALL_X = 52, BALL_Y = 170;
	const PERSON_X = 120, PERSON_Y = 150;
	const SPIKE_X = 150, SPIKE_Y = 170;
	const WALKSPEED = .7;
	const DOGSPEED = .8;
	return {
		settings: {
			size: [ 380, 200 ],
			backgroundColor: '#222222',
			firstScene: 0,
		},
		assets: [
			['person.png', 32, 32, null, -16, -32, { noHover: true }  ],
			['protag-animation-carrying.png', 48, 64, 0, -24, -60, { noHover: true} ],
			['ball.png', 32, 32, null, -16, -31 ],
			['ball-empty.png', 32, 32, null, -16, -31 + BALLYSHIFT ],
			['ball-deflate.png', 32, 32, null, -16, -32 ],
			['protag-idle.png', 48, 64, null, -24, -60 ],
			['protag-idle-carry.png', 48, 64, null, -24, -60 ],
			['protag-animation-walking.png', 48, 64, null, -24, -60 ],
			['audio/beep.mp3', 0.5],
			['audio/blorng.mp3', 0.5],
			['audio/soothing_tones_for_home1.mp3', 0.3, { loop: true}],
			['audio/soothing_tones_for_home2.mp3', 0.3, { loop: true}],
			['audio/power_charge.mp3'],
			['audio/power_down1.mp3'],
			['audio/power_down2.mp3'],
			['audio/power_down3.mp3'],
			['interior.png'],
			['fridge-paper.png'],
			['protag-idle.png', 48, 64, null, -24, -60, { noHover: true}  ],
			['protag-idle-carry.png', 48, 64, null, -24, -60, { noHover: true}  ],
			['protag-animation-walking.png', 48, 64, null, -24, -60, { noHover: true}  ],
			['interior.png', null, null, null, null, null, { noHover: true }],
			['fridge-paper.png', null, null, null, null, null, { tip: 'note' }],
			['magnet.png', null, null, null, MAGNETXSHIFT, MAGNETYSHIFT],
			['magnet-outline.png', null, null, null, MAGNETXSHIFT, MAGNETYSHIFT],
			['dog-idle.png', 32, 25, null, -16, -25, { pingpong: true, noHover: true } ],
			['dog-run.png', 32, 25, null, -16, -25, { pingpong: true, noHover: true } ],
			['house-face.png', 16, 16, null, -8, -30, { noHover: true} ],
			['doorway.png', 34, 98, null, 0, -100, { noHover: true} ],
			['front-door.png', 22, 85, null, null, null, { reverse: true } ],
			['tv.png', 40, 62, null, -20, -62 ],
			['fridge.png', 64, 64, null, null, null, null ],
			['heater.png', 64, 64, null, null, null, null ],
			['chair.png', 64, 64, null, null, null, null ],
			['bed.png', 64, 64, null, null, null, null ],
			['wardrobe.png', 64, 80, null, null, null, null ],
			['air-conditioner.png', 64, 64, null, null, null, null ],
			['kitchen-counter.png', 72, 32, null, null, null, null ],
			['front-door-overlay.png', 64, 144, null, 0, -128, null ]
		],
		scenes: [
			{
				init: [
					{ set: ['walkspeed', WALKSPEED]},
					{ set: ['person', {x:PERSON_X,y:PERSON_Y}] },
					{ set: ['ground', {
						x:55, y:150, width:520, height:20,
					} ]},
					{ set: ['limit.left', { get: 'ground.x'} ]},
					{ set: ['limit.top', { get: 'ground.y'} ]},
					{ set: ['limit.right', { add: [{ get: 'ground.x'}, { get: 'ground.width'}]} ]},
					{ set: ['limit.bottom', { add: [{ get: 'ground.y'}, { get: 'ground.height'}]} ]},
					{ set: ['destination.x', { get: 'person.x' }]},
					{ set: ['destination.y', { get: 'person.y' }]},
					{ set: ['dog', {x:180, y:170}] },
					{ set: ['dog.cycle', [
						{ x: 180, y: 170, time: 2000, flip:false },
						{ x: 250, y: 165, time: 5000, flip:false },
						{ x: 450, y: 160, time: 10000, flip: false },
						{ x: 70, y: 150, time: 15000, flip:true },
						{ x: 70, y: 150, time: 3000, flip:true },
						{ x: 50, y: 145, time: 1000, flip:true },
						{ x: 10, y: 130, time: 1000, flip:true },
						{ x: -20, y: 130, time: 8000, flip:true },
						{ x: 10, y: 130, time: 3000, flip:false },
						{ x: 30, y: 140, time: 1000, flip:false },
						{ x: 70, y: 145, time: 1000, flip:false },
						{ x: 70, y: 145, time: 5000, flip:false },
					]]},
					{ set: ['dog.cycleIndex', 0 ]},
					{ set: ['dog.peeNeed', 0 ]},
					{ set: [ 'dogDoor.shut', -1000 ] },
					{ set: [ 'dogDoor.open', 0 ] },
				],
				actions: [
					{
						if: { asc: [{get:'dog.peeNeed'} ,8] },
						do: [
							{ set: ['dog.idle', {subtract: [{get:'now'}, {get:'dog.timeInCycle'}]} ] },
							{
								if: { asc: [{get:'dog.goal.time'},{get:'dog.idle'}] },
								do: [
									{ set: ['dog.cycleIndex', {mod:[{add:[{get:'dog.cycleIndex'},1]}, {get:'dog.cycle.length'}]}] },
									{ set: ['dog.timeInCycle', {get:'now'} ]},
								],
							},
							{ set: ['dog.goal', {get: {add:['dog.cycle.',{get:'dog.cycleIndex'}]}}]},
							{
								if: { and:[{asc: [{get:"dog.goal.x"},45]}, {asc:[20,{get:"dog.x"},50]}, {get:"dogDoor.shut"}] },
								do: [
									{ set: ['dog.cycleIndex', {mod:[{subtract:[{get:'dog.cycleIndex'},2]}, {get:'dog.cycle.length'}]}] },
									{ set: ['dog.timeInCycle', {get:'now'} ]},
									{ set: ['dog.peeNeed', {add:[{get:'dog.peeNeed'},1]}]},
								],
							},
							{ set: ['dog.goal', {get: {add:['dog.cycle.',{get:'dog.cycleIndex'}]}}]},
							{
								if: { and:[{asc: [45, {get:"dog.goal.x"}]}, {asc:[0,{get:"dog.x"},20]}, {get:"dogDoor.shut"}] },
								do: [
									{ set: ['dog.cycleIndex', {mod:[{subtract:[{get:'dog.cycleIndex'},2]}, {get:'dog.cycle.length'}]}] },
									{ set: ['dog.timeInCycle', {get:'now'} ]},
								],
							},
							{
								if: {asc:[{get:"dog.x"},0] },
								set: ['dog.peeNeed', 0 ],
							},
						],
					},
					{
						if: { asc: [9, {get:'dog.peeNeed'}] },
						do: [
							{ set: ['dog.goal', {
								x: 310,
								y: 135,
							}]},
						],
					},
					{
						if: { and: [ { get:'mouse.down' }, { get:'notScrolling' } ] },
						do: [
							{ set: ['lastClick.x', { subtract: [{get: 'mouse.x'}, {get: 'scroll'}], clamp: [ { get:'limit.left'}, { get:'limit.right'} ] } ]},
							{ set: ['lastClick.y', { get: 'mouse.y', clamp: [ { get:'limit.top'}, { get:'limit.bottom'} ] } ]},
							{ ifnot: { get: 'hovered.walkSpot' },
								do: [
									{ set: ['destination.x', { get: 'lastClick.x' } ] },
									{ set: ['destination.y', { get: 'lastClick.y' } ] },
									{ set: ['destination.flip', { get: 'lastClick.flip' } ] },
									{ set: ['destination.sprite', null ]},
									{ set: ['destination.canPick', null ] },
									{ set: ['destination.canDrop', null ] },
									{ set: ['destination.canInteract', null ] },
								],
							},
							{ if: { get: 'hovered.walkSpot' },
								do: [
									{ set: ['destination.x', { get: 'hovered.walkSpot.x' } ] },
									{ set: ['destination.y', { get: 'hovered.walkSpot.y' } ] },
									{ set: ['destination.flip', { get: 'hovered.walkSpot.flip'}]},
									{ set: ['destination.sprite', { get: 'hovered.name' } ]},
									{ set: ['destination.canPick', { get: 'hovered.canPick'} ] },
									{ set: ['destination.canDrop', { get: 'hovered.canDrop'} ] },
									{ set: ['destination.canInteract', { get: 'hovered.canInteract'} ] },
								],
							},
							{ set: ['person.flip', { desc: [ { get: 'person.x' }, { get: 'destination.x' } ]} ]},
							{ set: ['lastClick.flip', { desc: [ { get: 'person.x' }, { get: 'destination.x' } ]} ]},
						],
					},
					{
						do: [
							{ move: [ 'person.x', { round: 'destination.x' }, { step: {get:'walkspeed'} } ] },
							{ move: [ 'person.y', { round: 'destination.y' }, { step: {get:'walkspeed'} } ] },
							{ move: [ 'dog.x', { round: 'dog.goal.x' }, { step: DOGSPEED } ] },
							{ move: [ 'dog.y', { round: 'dog.goal.y' }, { step: DOGSPEED } ] },
						],
					},
					{ set: [
							'person.onTarget',
							{
								and: [
									{ equal: [
										{ get:'person.x' },
										{ round: 'destination.x' }
										],
									},
									{
										equal: [
											{ get:'person.y' },
											{ round: 'destination.y' }
										],
									},
								],
							},
						]
					},
					{ set: [
							'dog.onTarget',
							{
								and: [
									{ equal: [
										{ get:'dog.x' },
										{ round: 'dog.goal.x' }
										],
									},
									{
										equal: [
											{ get:'dog.y' },
											{ round: 'dog.goal.y' }
										],
									},
								],
							},
						]
					},
					{
						if: { get: 'person.onTarget' },
						do: [
							{ set: ['person.flip', { get:'destination.flip' } ] },
							{
								if: { and:[ {get: 'destination.canInteract.noItem'}, {equal:[{get:'picked'},null]} ] },
								set: [ { get: 'destination.canInteract.result' }, true ],
							},
							{ if: { and:[ {get: 'destination.canPick'}, { equal: [ { get: 'picked'}, null ]} ] },
								do: [
									{ set: [ 'picked', { get: 'destination.canPick' } ] },
									{ set: [ { add:[ { get: 'picked' }, '-gone' ] }, true ] },
									{ playSound: 'blorng' },
								],
							},
							{ if: { and:[ {equal: [{ get: 'destination.canDrop' }, { get:'picked'}]}, { get:'picked' }] },
								do: [
									{ set: [ { add:[ { get: 'picked' }, '-gone' ] }, false ] },
									{ set: [ 'picked', null ] },
									{ playSound: 'beep' },
								],
							},
							{
								if: { and:[ {not:{equal:[{get:'destination.sprite'}, 'tv']}}, {equal: [{get: 'destination.canInteract.item'}, { get:'picked'}]}, { get: 'picked' }] },
								do: [
									{ set: [ 'picked', null ] },
									{ set: [ { get: 'destination.canInteract.result' }, true ]},
									{ playSound: 'soothing_tones_for_home1' },
								],
							},
							{
								if: { and:[ {equal:[{get:'destination.sprite'}, 'tv']}, {equal: [{get: 'destination.canInteract.item'}, { get:'picked'}]}, { get: 'picked' }] },
								do: [
									{ set: [ 'picked', null ] },
									{ set: [ { get: 'destination.canInteract.result' }, true ]},
									{ playSound: 'blorng' },
									{ log: "busted television" },
								],
							},
						],
					},
					{
						if: { asc: [ 0, { get: 'person.x' }, 270 ] },
						set: [ 'scroll', 0 ],
					},
					{
						if: { asc: [ 350, { get: 'person.x' } ] },
						set: [ 'scroll', -240 ],
					},
					{
						if: { and: [{asc: [ 110, { get: 'person.x' } ]}, {asc:[{get: 'dog.x'}, 100]}, {not:{ get: 'dogDoor.open' }}] },
						do : [
							{ set: [ 'dogDoor.shut', 0 ] },
							{ set: [ 'dogDoor.open', { get: 'now' } ] },
						],
					},
					{
						if: { and: [{asc: [ 120, { get: 'dog.x' } ]}, {not:{ get: 'dogDoor.shut' }}] },
						do: [
							{ set: [ 'dogDoor.shut', { get: 'now' } ] },
							{ set: [ 'dogDoor.open', 0 ] },
						],
					},
					{
						if: { and: [{asc: [ { get: 'person.x' }, 100 ]}, {not:{ get: 'dogDoor.shut' }}] },
						do: [
							{ set: [ 'dogDoor.shut', { get: 'now' } ] },
							{ set: [ 'dogDoor.open', 0 ] },
						],
					},
				],
				sprites: [
					{
						name: 'interior',
						x: 0,
						y: 0,
					},
					{
						name: 'fridge',
						x: 298,
						y: 62,
						walkSpot: {
							x: 298,
							y: 135,
							flip: false,
						},
					},
					{
						name: 'kitchen-counter',
						x: 230,
						y: 95,
					},
					{
						name: 'heater',
						x: 458,
						y: 59,
					},
					{
						name: 'chair',
						x: 58,
						y: 77,
					},
					{
						name: 'bed',
						x: 527,
						y: 95,
					},
					{
						name: 'wardrobe',
						x: 407,
						y: 34,
					},
					{
						name: 'air-conditioner',
						x: 105,
						y: 55,
					},
					{
						if: { get: 'dogDoor.open' },
						name: 'front-door',
						x: 29,
						y: 70,
						repeat: 1,
						animationStart: { get: 'dogDoor.open' },
					},
					{
						if: { get: 'dogDoor.shut' },
						name: 'front-door.reverse',
						x: 29,
						y: 70,
						repeat: 1,
						animationStart: { get: 'dogDoor.shut' },
					},
					{
						name: 'front-door-overlay',
						x: 0,
						y: 159,
					},
					{
						name: 'tv',
						x: 166,
						y: 132,
						walkSpot: {
							x: 166 - 25,
							y: 132 + 5,
							flip: false,
						},
						canInteract: {
							item: 'magnet',
							result: 'tv-down',
						},
					},
					{
						name: 'doorway',
						x: 360,
						y: 175,
					},
					//fridge-face
					{
						if: { and: [{asc: [ 0, { get: 'person.x'}, 300 ]}, { not: { get: 'fridge-down' } }] },
						name: 'house-face.1',
						x: 333,
						y: 109,
					},
					{
						if: { and: [{asc: [ 300, { get: 'person.x'}, 360 ]}, { not: { get: 'fridge-down' } }] },
						name: 'house-face.0',
						x: 333,
						y: 109,
					},
					{
						if: { and: [{asc: [ 360, { get: 'person.x'} ]}, { not: { get: 'fridge-down' } }] },
						name: 'house-face.2',
						x: 333,
						y: 109,
					},

					//tv face
					{
						if: { get: 'tv-down' } ,
						name: 'house-face.3',
						x: 163,
						y: 133,
					},
					{
						if: { and: [{asc: [ 0, { get: 'person.x'}, 130 ]}, { not: { get: 'tv-down' } }] },
						name: 'house-face.1',
						x: 163,
						y: 133,
					},
					{
						if: { and: [{asc: [ 130, { get: 'person.x'}, 200 ]}, { not: { get: 'tv-down' } }] },
						name: 'house-face.0',
						x: 163,
						y: 133,
					},
					{
						if: { and: [{asc: [ 200, { get: 'person.x'} ]}, { not: { get: 'tv-down' } }] },
						name: 'house-face.2',
						x: 163,
						y: 133,
					},

					//heater face
					{
						if: { and: [{asc: [ 0, { get: 'person.x'}, 450 ]}, { not: { get: 'heater-down' } }] },
						name: 'house-face.1',
						x: 489,
						y: 97,
					},
					{
						if: { and: [{asc: [ 450, { get: 'person.x'}, 530 ]}, { not: { get: 'heater-down' } }] },
						name: 'house-face.0',
						x: 489,
						y: 97,
					},
					{
						if: { and: [{asc: [ 530, { get: 'person.x'} ]}, { not: { get: 'heater-down' } }] },
						name: 'house-face.2',
						x: 489,
						y: 97,
					},

					{ type: 'rect',
						if: { get: 'debug' },
						color:'green',
						alpha: .2,
						x: { get:'ground.x'},
						y: { get:'ground.y'},
						width: { get:'ground.width'},
						height: { get:'ground.height'},
					},
					{
						ifnot: { get: 'fridge-paper-gone' },
						name: 'fridge-paper',
						x: 335,
						y: 104,
						canPick: "magnet",
						walkSpot: {
							x: 320,
							y: 135,
							flip: false,
						},
						canInteract: {
							noItem: true,
							result: 'fridge-paper-gone',
						},
					},
					{
						if: { get: 'magnet-gone' },
						name: 'magnet-outline',
						x: 336,
						y: 113,
						walkSpot: {
							x: 320,
							y: 150,
							flip: false,
						},
						canDrop: 'magnet',
					},
					{
						ifnot: { get: 'magnet-gone' },
						name: 'magnet',
						x: 336,
						y: 113,
						walkSpot: {
							x: 320,
							y: 135,
							flip: false,
						},
						canPick: "magnet",
						canInteract: {
							noItem: true,
							result: 'fridge-paper-gone',
						},
					},
					{
						ifnot: { get: 'picked' },
						group: [
							{ name: 'protag-animation-walking',
								x: { get:'person.x' },
								y: { get:'person.y' },
								ifnot: { get: 'person.onTarget' },
								flip: { get: 'person.flip' },
							},
							{ name: 'protag-idle',
								x: { get:'person.x' },
								y: { get:'person.y' },
								if: { get: 'person.onTarget' },
								flip: { get: 'person.flip' },
							},
						],
					},
					{
						if: { get: 'picked' },
						group: [
							{ name: { get: 'picked' },
								x: { add: [
									{ get:'person.x' },
									{ if: { get: 'person.flip' }, add: [-17] },
									{ ifnot: { get: 'person.flip' }, add: [15] },
								] },
								y: { add: [{ get:'person.y' }, -26] },
								flip: { get: 'person.flip' },
							},
							{ name: 'protag-animation-carrying',
								x: { get:'person.x' },
								y: { get:'person.y' },
								ifnot: { get: 'person.onTarget' },
								flip: { get: 'person.flip' },
							},
							{ name: 'protag-idle-carry',
								x: { get:'person.x' },
								y: { get:'person.y' },
								if: { get: 'person.onTarget' },
								flip: { get: 'person.flip' },
							},
						],
					},
					{ name: 'dog-idle',
						if: { get: 'dog.onTarget' },
						x: {get:'dog.x'},
						y: {get:'dog.y'},
						walkSpot: {
							x: {add:[{get:'dog.x'}, 20]},
							y: {add:[{get:'dog.y'}, -3]},
							flip: true,
						},
						flip:{get:'dog.goal.flip'},
					},
					{ name: 'dog-run',
						ifnot: { get: 'dog.onTarget' },
						x: {get:'dog.x'},
						y: {get:'dog.y'},
						walkSpot: {
							x: {add:[{get:'dog.x'}, 20]},
							y: {add:[{get:'dog.y'}, -3]},
							flip: true,
						},
						flip:{get:'dog.goal.flip'},
					},
					{
						type: 'text',
						text: { or: [{ get: 'tip' }, { tip: 'hovered.name' }] },
						x: 50,
						y: 190,
						color: 'silver',
						ignoreScroll: true,
					},

					{
						if: { get: 'debug' },
						group: [
							{ name: 'ball',
								ifnot: { get: 'ball-gone' },
								x: BALL_X,
								y: BALL_Y,
								walkSpot: {
									x: BALL_X + 10,
									y: BALL_Y + 3,
									flip: true,
								},
								canPick: "ball",
							},
							{ name: 'ball-empty',
								if: { get: 'ball-gone' },
								x: BALL_X,
								y: BALL_Y - BALLYSHIFT,
								walkSpot: {
									x: BALL_X + 10,
									y: BALL_Y + 3,
									flip: true,
								},
								canDrop: 'ball',
							},
							{ name: 'ball-deflate.0',
								ifnot: { get: 'ball-deflated' },
								x: SPIKE_X,
								y: SPIKE_Y,
								walkSpot: {
									x: SPIKE_X - 10,
									y: SPIKE_Y + 5,
									flip: false,
								},
								canInteract: {
									item: 'ball',
									result: 'ball-deflated',
								},
							},
							{ name: 'ball-deflate.1',
								if: { get: 'ball-deflated' },
								x: SPIKE_X,
								y: SPIKE_Y,
								walkSpot: {
									x: SPIKE_X - 10,
									y: SPIKE_Y + 5,
									flip: false,
								},
							},
						],
					},
				],
			},
		],
	};
}();
