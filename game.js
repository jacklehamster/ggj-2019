const Game = function() {
	const BALLYSHIFT = 10;
	const MAGNETXSHIFT = -2, MAGNETYSHIFT = -10;
	const BALL_X = 52, BALL_Y = 170;
	const PERSON_X = 100, PERSON_Y = 150;
	const SPIKE_X = 150, SPIKE_Y = 170;
	const WALKSPEED = 2;//.7;
	return {
		settings: {
			size: [ 380, 200 ],
			backgroundColor: '#222222',
			firstScene: 0,
		},
		assets: [
			['person.png', 32, 32, null, -16, -32 ],
			['protag-animation-carrying.png', 48, 64, 0, -24, -60 ],
			['ball.png', 32, 32, null, -16, -31 ],
			['ball-empty.png', 32, 32, null, -16, -31 + BALLYSHIFT ],
			['ball-deflate.png', 32, 32, null, -16, -32 ],
			['protag-idle.png', 48, 64, null, -24, -60 ],
			['protag-idle-carry.png', 48, 64, null, -24, -60 ],
			['protag-animation-walking.png', 48, 64, null, -24, -60 ],
			['blorng.mp3'],
			['interior.png'],
			['fridge-paper.png'],
			['magnet.png', null, null, null, MAGNETXSHIFT, MAGNETYSHIFT],
			['magnet-outline.png', null, null, null, MAGNETXSHIFT, MAGNETYSHIFT],
			['dog-idle.png', 32, 25, null, -16, -25, { pingpong: true } ],
			['dog-run.png', 32, 25, null, -16, -25, { pingpong: true } ],
			['house-face.png', 16, 16 ],
		],
		scenes: [
			{
				init: [
					{ set: ['walkspeed', WALKSPEED]},
					{ set: ['person', {x:PERSON_X,y:PERSON_Y}] },
					{ set: ['ground', {
						x:55, y:140, width:520, height:30,
					} ]},
					{ set: ['limit.left', { get: 'ground.x'} ]},
					{ set: ['limit.top', { get: 'ground.y'} ]},
					{ set: ['limit.right', { add: [{ get: 'ground.x'}, { get: 'ground.width'}]} ]},
					{ set: ['limit.bottom', { add: [{ get: 'ground.y'}, { get: 'ground.height'}]} ]},
					{ set: ['destination.x', { get: 'person.x' }]},
					{ set: ['destination.y', { get: 'person.y' }]},
				],
				actions: [
					{
						if: { get:'mouse.down', and: { get:'notScrolling' } },
						do: [
							{ set: ['lastClick.x', { subtract: [{get: 'mouse.x'}, {get: 'scroll'}], clamp: [ { get:'limit.left'}, { get:'limit.right'} ] } ]},
							{ set: ['lastClick.y', { get: 'mouse.y', clamp: [ { get:'limit.top'}, { get:'limit.bottom'} ] } ]},
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
							{ ifnot: { get: 'hovered.walkSpot' }, set: ['destination', { get: 'lastClick' } ]},
							{ set: ['flip', { desc: [ { get: 'person.x' }, { get: 'destination.x' } ]} ]},
							{ set: ['lastClick.flip', { desc: [ { get: 'person.x' }, { get: 'destination.x' } ]} ]},
						],
					},
					{
						do: [
							{ move: [ 'person.x', { round: 'destination.x' }, { step: {get:'walkspeed'} } ] },
							{ move: [ 'person.y', { round: 'destination.y' }, { step: {get:'walkspeed'} } ] },
						],
					},
					{ set: [
							'onTarget',
							{ 
								equal: [ 
									{ get:'person.x' }, 
									{ round: 'destination.x' } 
								],
								and: {
									equal: [
										{ get:'person.y' }, 
										{ round: 'destination.y' } 
									],
								},
							},
						]
					},
					{
						if: { get: 'onTarget' },
						do: [
							{ set: ['flip', { get:'destination.flip' } ] },
							{
								if: { get: 'destination.canInteract.noItem', and: { equal: [ { get: 'picked' }, null ] } },
								set: [ { get: 'destination.canInteract.result' }, true ],
							},
							{ if: { get: 'destination.canPick', and: { equal: [ { get: 'picked'}, null ] } },
								do: [
									{ set: [ 'picked', { get: 'destination.sprite' } ] },
									{ set: [ { add:[ { get: 'picked' }, '-gone' ] }, true ] },
									{ playSound: 'blorng' },
								],
							},
							{ if: { equal: [{ get: 'destination.canDrop' }, { get:'picked'} ], and: { get:'picked' } },
								do: [
									{ set: [ { add:[ { get: 'picked' }, '-gone' ] }, false ] },
									{ set: [ 'picked', null ] },
									{ playSound: 'blorng' },
								],
							},
							{ 
								if: { equal: [ {get: 'destination.canInteract.item'}, { get:'picked'} ], and: { get: 'picked' } },
								do: [
									{ set: [ 'picked', null ] },
									{ set: [ { get: 'destination.canInteract.result' }, true ]},
									{ playSound: 'blorng' },
								],
							},
						],
					},
					{
						if: { asc: [ 0, { get: 'person.x' }, 270 ] },
						set: [ 'scroll', 0 ],
					},
					{
						if: { asc: [ 340, { get: 'person.x' } ] },
						set: [ 'scroll', -240 ],
					},
				],
				sprites: [
					{
						name: 'interior',
						x: 0,
						y: 0,
					},
					{
						if: { asc: [ 0, { get: 'person.x'}, 129 ] },
						name: 'house-face.1',
						x: 155,
						y: 102,
					},
					{
						if: { asc: [ 130, { get: 'person.x'}, 200 ] },
						name: 'house-face.0',
						x: 155,
						y: 102,
					},
					{
						if: { asc: [ 200, { get: 'person.x'} ] },
						name: 'house-face.2',
						x: 155,
						y: 102,
					},
					{ type: 'rect',
						color:'green',
						alpha: .5,
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
					},					
					{
						if: { get: 'magnet-gone' },
						name: 'magnet-outline',
						x: 336,
						y: 113,
						walkSpot: {
							x: 335,
							y: 150,
							flip: true,
						},
						canDrop: 'magnet',
					},
					{
						ifnot: { get: 'magnet-gone' },
						name: 'magnet',
						x: 336,
						y: 113,
						walkSpot: {
							x: 335,
							y: 150,
							flip: true,
						},
						canPick: true,
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
								ifnot: { get: 'onTarget' },
								flip: { get: 'flip' },
							},
							{ name: 'protag-idle', 
								x: { get:'person.x' },
								y: { get:'person.y' },
								if: { get: 'onTarget' },
								flip: { get: 'flip' },
							},
						],
					},
					{
						if: { get: 'picked' },
						group: [
							{ name: { get: 'picked' },
								x: { add: [
									{ get:'person.x' },
									{ if: { get: 'flip' }, add: [-15] },
									{ ifnot: { get: 'flip' }, add: [15] },
								] },
								y: { add: [{ get:'person.y' }, -25] },
							},
							{ name: 'protag-animation-carrying', 
								x: { get:'person.x' },
								y: { get:'person.y' },
								ifnot: { get: 'onTarget' },
								flip: { get: 'flip' },
							},
							{ name: 'protag-idle-carry', 
								x: { get:'person.x' },
								y: { get:'person.y' },
								if: { get: 'onTarget' },
								flip: { get: 'flip' },
							},
						],
					},
					{ name: 'dog-idle',
						x: SPIKE_X,
						y: SPIKE_Y,
						walkSpot: {
							x: SPIKE_X - 10,
							y: SPIKE_Y + 5,
							flip: false,
						},
					},

					// { name: 'ball',
					// 	ifnot: { get: 'ball-gone' },
					// 	x: BALL_X,
					// 	y: BALL_Y,
					// 	walkSpot: {
					// 		x: BALL_X + 10,
					// 		y: BALL_Y + 3,
					// 		flip: true,
					// 	},
					// 	canPick: true,
					// },
					// { name: 'ball-empty',
					// 	if: { get: 'ball-gone' },
					// 	x: BALL_X,
					// 	y: BALL_Y - BALLYSHIFT,
					// 	walkSpot: {
					// 		x: BALL_X + 10,
					// 		y: BALL_Y + 3,
					// 		flip: true,
					// 	},
					// 	canDrop: 'ball',
					// },
					// { name: 'ball-deflate.0',
					// 	ifnot: { get: 'ball-deflated' },
					// 	x: SPIKE_X,
					// 	y: SPIKE_Y,
					// 	walkSpot: {
					// 		x: SPIKE_X - 10,
					// 		y: SPIKE_Y + 5,
					// 		flip: false,
					// 	},
					// 	canInteract: {
					// 		item: 'ball',
					// 		result: 'ball-deflated',
					// 	},
					// },
					// { name: 'ball-deflate.1',
					// 	if: { get: 'ball-deflated' },
					// 	x: SPIKE_X,
					// 	y: SPIKE_Y,
					// 	walkSpot: {
					// 		x: SPIKE_X - 10,
					// 		y: SPIKE_Y + 5,
					// 		flip: false,
					// 	},
					// 	canInteract: {
					// 		item: 'ball',
					// 		result: 'ball-deflated',
					// 	},
					// },
				],
			},
		],
	};
}();