const Game = function() {
	return {
		settings: {
			size: [ 128, 128 ],
			backgroundColor: '#222222',
			firstScene: 0,
		},
		assets: [
			['person.png', 32, 32, 0, -16, -32 ],
			['ball.png', 32, 32, 0, -16, -31 ],
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
				],
				actions: [
					{
						if: { get:'mouse.down', },
						do: [
							{ set: ['lastClick.x', { get: 'mouse.x', clamp: [ { get:'limit.left'}, { get:'limit.right'} ] } ]},
							{ set: ['lastClick.y', { get: 'mouse.y', clamp: [ { get:'limit.top'}, { get:'limit.bottom'} ] } ]},
							{ set: ['lastClick.sprite', { get: 'hovered.name' } ]},
							{ if: { get: 'hovered.walkSpot' }, set: ['destination', { get: 'hovered.walkSpot' } ]},
							{ ifnot: { get: 'hovered.walkSpot' }, set: ['destination', { get: 'lastClick' } ]},
							{ set: ['flip', { desc: [ { get: 'person.x' }, { get: 'destination.x' } ]} ]},
							{ set: ['lastClick.flip', { desc: [ { get: 'person.x' }, { get: 'destination.x' } ]} ]},
						],
					},
					{
						ifnot: { get:'lastClick.sprite' },
						do: [
							{ move: [ 'person.x', { round: 'destination.x' }, { step: .5 } ] },
							{ move: [ 'person.y', { round: 'destination.y' }, { step: .5 } ] },
						],
					},
					{
						if: { get:'lastClick.sprite' },
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
						set: ['flip', { get:'destination.flip' } ],
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
					{ name: 'ball',
						x: 32,
						y: 95,
						walkSpot: {
							x: 35,
							y: 97,
							flip: true,
						},
					},
				],
			},
		],
	};
}();