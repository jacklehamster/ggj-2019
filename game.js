const Game = function() {
	return {
		settings: {
			size: [ 128, 128 ],
			backgroundColor: '#222222',
			firstScene: 0,
		},
		assets: [
			['dude.png', 32, 32, 0, -16, -32 ],
			['ball.png', 32, 32, 0, -16, -31 ],
		],
		scenes: [
			{
				init: [
					{ set: ['dude.x', 60, ]},
					{ set: ['dude.y', 100, ]},
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
							{ set: ['lastClick.sprite', { get: 'hovered' } ]}
						],
					},
					{ move: [ 'dude.x', { round: 'lastClick.x' }, { step: .5 } ] },
					{ move: [ 'dude.y', { round: 'lastClick.y' }, { step: .5 } ] },
					{ set: [
							'onTarget',
							{ 
								equal: [ 
									{ get:'dude.x' }, 
									{ round: 'lastClick.x' } 
								],
								and: {
									equal: [
										{ get:'dude.y' }, 
										{ round: 'lastClick.y' } 
									],
								},
							},
						]
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
					{ name: 'dude', 
						x: { get:'dude.x' },
						y: { get:'dude.y' },
						ifnot: { get: 'onTarget' },
					},
					{ name: 'dude.0', 
						x: { get:'dude.x' },
						y: { get:'dude.y' },
						if: { get: 'onTarget' },
					},
					{ name: 'ball',
						x: 32,
						y: 95,
					},
				],
			},
		],
	};
}();