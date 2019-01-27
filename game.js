const Game = function() {
	const BALLYSHIFT = 10;
	const BALL_X = 32, BALL_Y = 195;
	return {
		settings: {
			size: [ 320, 256 ],
			backgroundColor: '#222222',
			firstScene: 0,
		},
		assets: [
			['person.png', 32, 32, 0, -16, -32 ],
			['protag-animation-carrying.png', 48, 64, 0, -24, -60 ],
			['ball.png', 32, 32, 0, -16, -31 ],
			['ball-empty.png', 32, 32, 0, -16, -31 + BALLYSHIFT ],
			['ball-deflate.png', 32, 32, 0, -16, -32 ],
			['protag-idle.png', 48, 64, 0, -24, -60 ],
			['protag-idle-carry.png', 48, 64, 0, -24, -60 ],
			['protag-animation-walking.png', 48, 64, 0, -24, -60 ],
		],
		scenes: [
			{
				init: [
					{ set: ['walkspeed', .7]},
					{ set: ['person', {x:100,y:200}] },
					{ set: ['ground', {
						x:20, y:180, width:300, height:50,
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
						if: { get:'mouse.down', },
						do: [
							{ set: ['lastClick.x', { get: 'mouse.x', clamp: [ { get:'limit.left'}, { get:'limit.right'} ] } ]},
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
							{ if: { get: 'destination.canPick' },
								do: [
									{ set: [ 'picked', { get: 'destination.sprite' } ] },
									{ set: [ { add:[ { get: 'picked' }, '-gone' ] }, true ] },
								],
							},
							{ if: { equal: [{ get: 'destination.canDrop' }, { get:'picked'} ], and: { get:'picked' } },
								do: [
									{ set: [ { add:[ { get: 'picked' }, '-gone' ] }, false ] },
									{ set: [ 'picked', null ] },
								],
							},
							{ 
								if: { equal: [ {get: 'destination.canInteract.item'}, { get:'picked'} ] },
								and: { get: 'picked' },
								do: [
									{ set: [ 'picked', null ] },
									{ set: [ { get: 'destination.canInteract.result' }, true ]}
								],
							},
						],
					},
					{
						if: { desc: [ { get: 'person.x' }, 200 ] },
						set: [ 'scroll', -100 ],
					},
					{
						if: { asc: [ { get: 'person.x' }, 180 ] },
						set: [ 'scroll', 0 ],
					},
				],
				sprites: [
					{ type: 'rect',
						color:'green',
						x: { get:'ground.x'},
						y: { get:'ground.y'},
						width: { get:'ground.width'},
						height: { get:'ground.height'},
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
					{ name: 'ball',
						ifnot: { get: 'ball-gone' },
						x: BALL_X,
						y: BALL_Y,
						walkSpot: {
							x: BALL_X + 10,
							y: BALL_Y + 3,
							flip: true,
						},
						canPick: true,
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
						x: 200,
						y: 190,
						walkSpot: {
							x: 190,
							y: 195,
							flip: false,
						},
						canInteract: {
							item: 'ball',
							result: 'ball-deflated',
						},
					},
					{ name: 'ball-deflate.1',
						if: { get: 'ball-deflated' },
						x: 200,
						y: 190,
						walkSpot: {
							x: 190,
							y: 195,
							flip: false,
						},
						canInteract: {
							item: 'ball',
							result: 'ball-deflated',
						},
					},
				],
			},
		],
	};
}();