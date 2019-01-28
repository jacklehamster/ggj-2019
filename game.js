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
			['ball.png', 32, 32, null, -16, -31 ],
			['ball-empty.png', 32, 32, null, -16, -31 + BALLYSHIFT ],
			['ball-deflate.png', 32, 32, null, -16, -32 ],

			['audio/beep.mp3', 0.5],
			['audio/blorng.mp3', 0.5],
			['audio/soothing_tones_for_home1.mp3', 0.3, { loop: true}],
			['audio/soothing_tones_for_home2.mp3', 0.3, { loop: true}],
			['audio/power_charge.mp3', 0.5],
			['audio/power_down1.mp3', 0.5],
			['audio/power_down2.mp3', 0.5],
			['audio/power_down3.mp3', 0.5],
			['audio/door_whoosh.mp3', 0.3],
			['audio/tv_static_stutter.mp3', 0.3, { loop: true}],
			['protag-idle.png', 48, 64, null, -24, -60, { tip: 'resident' } ],
			['protag-idle-carry.png', 48, 64, null, -24, -60, { tip: 'resident' } ],
			['protag-animation-carrying.png', 48, 64, 0, -24, -60, { tip: 'resident'} ],
			['protag-animation-walking.png', 48, 64, null, -24, -60, { tip: 'resident' } ],
			['interior.png', null, null, null, null, null, { noHover: true }],
			['magnet.png', null, null, null, MAGNETXSHIFT, MAGNETYSHIFT],
			['magnet-outline.png', null, null, null, MAGNETXSHIFT, MAGNETYSHIFT],
			['dog-idle.png', 32, 25, null, -16, -25, { pingpong: true, tip: 'dog' } ],
			['dog-run.png', 32, 25, null, -16, -25, { pingpong: true, tip: 'dog' } ],
			['house-face.png', 16, 16, null, -8, -30, { noHover: true} ],
			['doorway.png', 34, 98, null, 0, -100, { noHover: true} ],
			['front-door.png', 22, 85, null, null, null, { reverse: true } ],
			['tv.png', 40, 62, null, -20, -62 ],
			['tv-busted.png', 40, 62, 3, -20, -62 ],
			['fridge.png', 64, 64, null, null, null, null ],
			['fridge-outlet.png', 16, 16, null, null, null, null ],
			['fridge-outlet-busted.png', 16, 32, 6, null, -16, null ],
			['fridge-paper.png', null, null, null, null, null, { tip: 'note' }],
			['heater.png', 64, 64, null, null, null, null ],
			['chair.png', 64, 64, null, null, null, null ],
			['bed.png', 64, 64, null, null, null, null ],
			['wardrobe.png', 64, 80, null, null, null, null ],
			['hanging-shirt.png', 32, 32, null, null, null, null ],
			['air-conditioner.png', 64, 64, null, null, null, null ],
			['kitchen-counter.png', 90, 48, null, null, null, null ],
			['front-door-overlay.png', 64, 144, null, 0, -128, { noHover: true} ]
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
						{ x: 70, y: 150, time: 14000, flip:true },
						{ x: 70, y: 150, time: 3000, flip:true },
						{ x: 50, y: 145, time: 1000, flip:true },
						{ x: 10, y: 130, time: 1000, flip:true },
						{ x: -20, y: 130, time: 10000, flip:true },
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
						if: { and: [ {asc: [9, {get:'dog.peeNeed'}] }, {not: {get:'fridge-down'} } ] },
						do: [
							{ set: ['dog.goal', {
								x: 310,
								y: 135,
							}]},
							{
								if: {get:'dog.onTarget'},
								do: [
									{set:['dog.cycleIndex', 1]},
									{set: ['fridge-down', {get:'now'} ]},
 									{playSound: 'power_down3'},
								],
							},
						],
					},
					{
						if: { and: [ {asc: [9, {get:'dog.peeNeed'}] }, {get:'fridge-down'}, {asc:[10000, {subtract:[{get:'now'},{get:'fridge-down'}]}]}   ]},
						do: [
							{ set: ['dog.goal', {
								x: 310,
								y: 135,
							}]},
							{
								if: {get:'dog.onTarget'},
								do: [
									{set: ['dog.peeNeed', 0 ]},
									{ set: ['dog.timeInCycle', {get:'now'} ]},
								],
							},
						],
					},					{
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
									{ set: ['destination.dialog', null]},
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
									{ set: ['destination.dialog', { get: 'hovered.dialog'}]},
									{ set: ['dialogStart', null ]},
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
						ifnot: { get: 'person.onTarget' },
						set: ['dialog', null],
					},
					{
						if: { get: 'person.onTarget' },
						do: [
							{ set: ['person.flip', { get:'destination.flip' } ] },
							{
								if: { and:[ {get: 'destination.dialog'}, {equal:[{get:'dialogStart'},null]}, {equal:[{get:'picked'},null]}]},
								do: [
									{ set: ['dialogStart', {get:'now'} ]},
									{ set: ['dialog', {get: 'destination.dialog'}]},
								],
							},
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
									{ playSound: 'blorng' },
								],
							},
							{
								if: { and:[ {equal:[{get:'destination.sprite'}, 'tv']}, {equal: [{get: 'destination.canInteract.item'}, { get:'picked'}]}, { get: 'picked' }] },
								do: [
									{ set: [ 'picked', null ] },
									{ set: [ { get: 'destination.canInteract.result' }, true ]},
									{ playSound: 'power_down1' },
									{ playSound: 'tv_static_stutter' },
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
						if: { and: [{asc: [ 110, { get: 'person.x' } ]}, {asc:[10, {get: 'dog.x'}, 100]}, {not:{ get: 'dogDoor.open' }}] },
						do : [
							{ set: [ 'dogDoor.shut', 0 ] },
							{ set: [ 'dogDoor.open', { get: 'now' } ] },
 							{ playSound: 'door_whoosh' },
						],
					},
					{
						if: { and: [{asc: [ 120, { get: 'dog.x' } ]}, {not:{ get: 'dogDoor.shut' }}] },
						do: [
							{ set: [ 'dogDoor.shut', { get: 'now' } ] },
							{ set: [ 'dogDoor.open', 0 ] },
							{ playSound: 'door_whoosh' },
						],
					},
					{
						if: { and: [{asc: [ { get: 'dog.x' }, 9 ]}, {not:{ get: 'dogDoor.shut' }}] },
						do: [
							{ set: [ 'dogDoor.shut', { get: 'now' } ] },
							{ set: [ 'dogDoor.open', 0 ] },
							{ playSound: 'door_whoosh' },
						],
					},
					{
						if: { and: [{asc: [ { get: 'person.x' }, 100 ]}, {not:{ get: 'dogDoor.shut' }}] },
						do: [
							{ set: [ 'dogDoor.shut', { get: 'now' } ] },
							{ set: [ 'dogDoor.open', 0 ] },
 							{ playSound: 'door_whoosh' },
						],
					},
                    {
						if: { and: [{ get: 'mouse.down' }, {not: { get: 'music.playing' }}, { get: 'music.playable'}] },
                        do: [
                            { set: [ 'music.playing', true ] },
                            { playSound: 'soothing_tones_for_home2' },
                            { log: 'Now Playing: Soothing Tones for Home track 2' },
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
						dialog: "Your Automatic Nutritional Slurry Dispenser. \nYou are not hungry right now."
					},
					{
						ifnot: { get: 'fridge-down' },
						name: 'fridge-outlet.0',
						x: 300,
						y: 92,
						walkSpot: {
							x: 298,
							y: 135,
							flip: false,
						},
						dialog: "Your Slurry Dispenser's power cord. \nIt's protected against unplugging."
					},
					{
						if: { get: 'fridge-down' },
						name: 'fridge-outlet-busted',
						x: 300,
						y: 92,
						walkSpot: {
							x: 298,
							y: 135,
							flip: false,
						},
						dialog: "..."
					},
					{
						name: 'kitchen-counter',
						x: 215,
						y: 83,
						walkSpot: {
							x: 230,
							y: 135,
							flip: false,
						},
						dialog: "This kitchen counter is for decoration only. \nI will dispense slurries you need directly into the Refrigerator"
					},
					{
						name: 'heater',
						x: 458,
						y: 59,
						dialog: "Your Auto-Thermo-Regulator 3000. \n It automatically adjusts the ambient temperature based on your comfort."
					},
					{
						name: 'chair',
						x: 58,
						y: 77,
						walkSpot: {
							x: 58,
							y: 140,
							flip: false,
						},
						dialog: "Please, sit in your ComFy Throne recliner and waste disposal system.\nYou have no reason to get up, your home will take care of all your needs."
					},
					{
						name: 'bed',
						x: 527,
						y: 95,
						dialog: "An archaic sleeping device used by Residents of a primitive past.\nYou can rest yourself at anytime on your ComFy Throne."
					},
					{
						name: 'wardrobe',
						x: 407,
						y: 34,
					},
					{
						name: 'hanging-shirt',
						x: 407,
						y: 53,
					},
					{
						name: 'hanging-shirt',
						x: 417,
						y: 53,
					},
					{
						name: 'hanging-shirt',
						x: 427,
						y: 53,
					},
						{
						name: 'hanging-shirt',
						x: 437,
						y: 53,
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
						name: 'front-door-overlay.0',
						x: 0,
						y: 159,
					},
					{
						ifnot:{get:'tv-down'},
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
						dialog: 'Your Emotion Controlled Television. No need to flip around,\na show will be selected that best suits your mood.',
					},
					{
						if:{get:'tv-down'},
						name: 'tv-busted',
						x: 166,
						y: 132,
						walkSpot: {
							x: 166 - 25,
							y: 132 + 5,
							flip: false,
						},
						dialog: '...',
					},
					{
						name: 'doorway',
						x: 360,
						y: 175,
					},
					//fridge-face
					{
						if: { get: 'fridge-down' } ,
						name: 'house-face.3',
						x: 333,
						y: 109,
					},
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
						flip:{get:'dog.goal.flip'},
					},
					{ name: 'dog-run',
						ifnot: { get: 'dog.onTarget' },
						x: {get:'dog.x'},
						y: {get:'dog.y'},
						flip:{get:'dog.goal.flip'},
					},
					{
						ifnot: { get: 'dialog' },
						type: 'text',
						text: { or: [{ get: 'tip' }, { tip: 'hovered.name' }] },
						x: 50,
						y: 190,
						color: 'silver',
						ignoreScroll: true,
					},


					{
						if: { get: 'dialog' },
						name: 'house-face.2',
						x: 35,
						y: 208,
						ignoreScroll: true,
					},
					{
						if: { get: 'dialog' },
						type: 'text',
						text: { progressive: [{ get: 'dialog' }, {subtract:[{get:'now'},{get:'dialogStart'}]} ]},
						x: 50,
						y: 195,
						color: '#2EA9BC',
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
