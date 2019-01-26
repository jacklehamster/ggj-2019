const Game = function() {
	const BALLYSHIFT = 10;
	return {
		settings: {
			size: [ 128, 128 ],
			backgroundColor: '#222222',
			firstScene: 0,
		},
		assets: [
			['person.png', 32, 32, 0, -16, -32 ],
			['person-carrying-item.png', 32, 32, 0, -16, -32 ],
			['ball.png', 32, 32, 0, -16, -31 ],
			['ball-empty.png', 32, 32, 0, -16, -31 + BALLYSHIFT ],
		],
		scenes: [
			{
				init: [
					{ set: ['person.x', 60, ]},
					{ set: ['person.y', 100, ]},
					{ set: ['ground', {
						x:20, y:80, width:100, height:20,
					} ]},
					{ set: ['limit.left', { get: 'ground.x'} ]},
					{ set: ['limit.top', { get: 'ground.y'} ]},
					{ set: ['limit.right', { add: [{ get: 'ground.x'}, { get: 'ground.width'}]} ]},
					{ set: ['limit.bottom', { add: [{ get: 'ground.y'}, { get: 'ground.height'}]} ]},
					{ set: ['destination', { get: 'person' }]},
				],
				actions: [
					{
						if: { get:'mouse.down', },
						do: [
							{ set: ['lastClick.x', { get: 'mouse.x', clamp: [ { get:'limit.left'}, { get:'limit.right'} ] } ]},
							{ set: ['lastClick.y', { get: 'mouse.y', clamp: [ { get:'limit.top'}, { get:'limit.bottom'} ] } ]},
							{ if: { get: 'hovered.walkSpot' }, 
								do: [
									{ set: ['destination', { get: 'hovered.walkSpot' } ] },
									{ set: ['destination.sprite', { get: 'hovered.name' } ]},
									{ set: ['destination.canPick', { get: 'hovered.canPick'} ] },
									{ set: ['destination.canDrop', { get: 'hovered.canDrop'} ] },
								],
							},
							{ ifnot: { get: 'hovered.walkSpot' }, set: ['destination', { get: 'lastClick' } ]},
							{ set: ['flip', { desc: [ { get: 'person.x' }, { get: 'destination.x' } ]} ]},
							{ set: ['lastClick.flip', { desc: [ { get: 'person.x' }, { get: 'destination.x' } ]} ]},
						],
					},
					{
						do: [
							{ move: [ 'person.x', { round: 'destination.x' }, { step: .5 } ] },
							{ move: [ 'person.y', { round: 'destination.y' }, { step: .5 } ] },
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
								set: [ 'picked', { get: 'destination.sprite' } ] 
							},
							{ if: { equal: [{ get: 'destination.canDrop' }, { get:'picked'} ] },
								set: [ 'picked', null ],
							},
						],
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
							{ name: 'person', 
								x: { get:'person.x' },
								y: { get:'person.y' },
								ifnot: { get: 'onTarget' },
								flip: { get: 'flip' },
							},
							{ name: 'person.0', 
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
									{ if: { get: 'flip' }, add: [-10] },
									{ ifnot: { get: 'flip' }, add: [10] },
								] },
								y: { add: [{ get:'person.y' }, -10] },
							},
							{ name: 'person-carrying-item', 
								x: { get:'person.x' },
								y: { get:'person.y' },
								ifnot: { get: 'onTarget' },
								flip: { get: 'flip' },
							},
							{ name: 'person-carrying-item.0', 
								x: { get:'person.x' },
								y: { get:'person.y' },
								if: { get: 'onTarget' },
								flip: { get: 'flip' },
							},
						],
					},
					{ name: 'ball',
						ifnot: { equal: [ { get: 'picked' }, 'ball' ] },
						x: 32,
						y: 95,
						walkSpot: {
							x: 35,
							y: 97,
							flip: true,
						},
						canPick: true,
					},
					{ name: 'ball-empty',
						if: { equal: [ { get: 'picked' }, 'ball' ] },
						x: 32,
						y: 95 - BALLYSHIFT,
						walkSpot: {
							x: 35,
							y: 97,
							flip: true,
						},
						canDrop: 'ball',
					},
				],
			},
		],
	};
}();