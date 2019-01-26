const Engine = function(document, Game) {
	const { scenes, assets, settings, transformations } = Game; 

	let spriteFrameRate = settings.spriteFrameRate || 10;
	let ctx;
	let mainCanvas;
	let pixelSize = 1;
	setCanvas(document.createElement('canvas'));
	
	let scene = {};
	const stock = {
	};
	const mouse = { x:0, y:0, down:false };
	let sceneData = {
		mouse,
	};
	let sceneDataStored = {};
	let sceneTime = 0;

	let debugDiv = null;

	function onNewScene(scene) {
		sceneData = {
			mouse,
		};
		sceneDataStored = {};
		if(scene.init) {
			scene.init.forEach(action => renderAction(action, 0));
		}
	}

	function setCanvas(canvas) {
		removeInteraction(mainCanvas);
		mainCanvas = initCanvas(canvas);
		ctx = canvas.getContext('2d');
		addInteraction(canvas);
	}

	function initCanvas(canvas) {
		const [ width, height ] = settings.size;
		canvas.width = width;
		canvas.height = height;
		canvas.style.backgroundColor = settings.backgroundColor;
		resizeCanvas(canvas);
	}

	function addInteraction(canvas) {
		canvas.addEventListener('mousemove', onMouse);
		canvas.addEventListener('mousedown', onMouse);
		canvas.addEventListener('mouseup', onMouse);
	}

	function removeInteraction(canvas) {
		if(canvas) {
			canvas.removeEventListener('mousemove', onMouse);
			canvas.removeEventListener('mousedown', onMouse);
			canvas.removeEventListener('mouseup', onMouse);
		}
	}

	function onMouse(e) {
		mouse.x = e.clientX / pixelSize;
		mouse.y = e.clientY / pixelSize;
		mouse.down = e.buttons === 1;
	}

	function resizeCanvas(canvas) {
		pixelSize = Math.min(
			Math.max(1, Math.floor(window.innerWidth / canvas.width)),
			Math.max(1, Math.floor(window.innerHeight / canvas.height)),
		);
		canvas.style.width = `${canvas.width * pixelSize}px`;
		canvas.style.height = `${canvas.height * pixelSize}px`;
		return canvas;
	}

	function loadImage(src, width, height, count, offsetX, offsetY) {
		const img = new Image();
		img.addEventListener('load', e => {
			const { naturalWidth, naturalHeight } = img;
			if(!width) {
				width = naturalWidth;
			}
			if(!height) {
				height = naturalHeight;
			}
			const cols = Math.ceil(naturalWidth / width);
			const rows = Math.ceil(naturalHeight / height);
			if(!count) {
				count = cols * rows;
			}
			const tag = src.split("/").pop().split(".").slice(0, -1).join("");
			const sprites = [];
			for(let y=0; y<rows; y++) {
				for(let x=0; x<cols; x++) {
					const cropWidth = Math.min(width, naturalWidth - x * width + 1);
					const cropHeight = Math.min(height, naturalHeight - y * height + 1);
					const canvas = document.createElement('canvas');
					canvas.width = cropWidth;
					canvas.height = cropHeight;
					canvas.getContext('2d').drawImage(
						img, x * width, y * height, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight,
					);
					const index = y * cols + x;

					const subTag = tag + "." + index;
					sprite = {
						type: 'img',
						images: [canvas],
						offsetX,
						offsetY,
					};
					sprites.push(addStock(`${tag}.${index}`, sprite));
				}
			}
			addStock(tag, {
				type: 'img',
				images: sprites.map(sprite => sprite.images[0]),
				offsetX,
				offsetY,
			});
		});
		img.src = src;
	}

	function addStock(tag, sprite) {
		sprite.tag = tag;
		stock[tag] = sprite;
		return sprite;
	}

	function setScene(index) {
		sceneTime = new Date().getTime();
		let newScene;
		if(typeof(index) === 'string') {
			newScene = scenes.filter(s => s.name = index)[0];
		} else {
			newScene = scenes[index];
		}
		if(scene !== newScene) {
			scene = newScene;
			onNewScene(scene);
		}

		if(!scene) {
			error("No scene", index);
		}
	}

	function error(msg) {
		console.warn(msg);
	}

	function init() {
		window.addEventListener("resize", e => resizeCanvas(canvas));
		loadAssets(assets);
		initGame();
		requestAnimationFrame(refresh);
	}

	function initGame() {
		setScene(settings.firstScene || 0);
	}

	function loadAssets(assets) {
		assets.forEach(asset => {
			if(asset[0].split(".").pop()==='png') {
				const [ src, width, height, count, offsetX, offsetY ] = asset;
				loadImage(src, width || 0, height || 0, count || 0, offsetX || 0, offsetY || 0);
			}
		});
	}

	function clearCanvas() {
		ctx.fillStyle = settings.backgroundColor;
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	}

	function renderScene(scene, now) {
		clearCanvas(mainCanvas);
		const { actions, sprites } = scene;
		actions.forEach(action => renderAction(action, now));
		sprites.forEach(sprite => renderSprite(sprite, now, 0, 0));
		renderDebug(now);
	}

	function validateIf(element) {
		if(typeof(element.if) !== 'undefined' || typeof(element.ifnot) !== 'undefined') {
			const conditionMet = typeof(element.if) !== 'undefined' 
				? getValue(element.if)
				: !getValue(element.ifnot);
			if(!conditionMet) {
				return false;
			}
		}
		return true;
	}

	function renderAction(action, now) {
		if(!validateIf(action)) {
			if(action.else) {
				renderAction(action.else, now);
			}
			return;
		}
		if(action.do) {
			renderAction(action.do, now);
		}
		if(action.log) {
			console.log(action);
		}
		if(action.set) {
			const [ prop, value ] = action.set;
			setValue(prop, value, null);
		}
		if(action.length) {
			for(let i=0; i<action.length; i++) {
				const act = action[i];
				if(act) {
					renderAction(act, now);
				}
			}
		}
		if(action.move) {
			const [ prop, to, options ] = action.move;
			const step = options ? options.step||1 : 1;
			const currentValue = getPropValue(prop);
			const goalValue = getValue(to);
			if(currentValue < goalValue) {
				setValue(prop, Math.min(currentValue + step, goalValue));
			} else if(currentValue > goalValue) {
				setValue(prop, Math.max(currentValue - step, goalValue));
			}
		}
	}

	function renderSprite(sprite, now, offsetX, offsetY) {
		if(!validateIf(sprite)) {
			if(sprite.else) {
				renderSprite(sprite.else, now, offsetX, offsetY);
			}
			return;
		}
		if(sprite.length) {
			const sprites = sprite;
			for(let i = 0; i < sprite.length; i++) {
				renderSprite(sprites[i], now, offsetX, offsetY);
			}
			return;
		}

		const spriteDefinition = sprite.name ? stock[sprite.name] : sprite;
		if(spriteDefinition) {
			const { type } = spriteDefinition;
			switch(type) {
				case 'img':
					{
						const { x, y } = sprite;
						renderImage(spriteDefinition, getValue(x) + getValue(offsetX), getValue(y) + getValue(offsetY), now);
					}
					break;
				case 'rect':
					{
						const { x, y } = sprite;
						renderRect(spriteDefinition, getValue(x) + getValue(offsetX), getValue(y) + getValue(offsetY), now);
					}
					break;
			}
		}
	}

	function setValue(prop, obj, defaultValue) {
		const props = prop.split('.');
		let o = sceneData, lastProp = props.pop();
		for(let i=0; i<props.length; i++) {
			if(!o[props[i]]) {
				o[props[i]] = {};
			}
			o = o[props[i]];
		}
		o[lastProp] = getValue(obj);
	}

	function getPropValue(property) {
		const props = property.split('.');
		let o = sceneData, value = null;
		for(let i=0; i<props.length; i++) {
			if(!o) {
				return undefined;
			}
			value = o[props[i]];
			if(i < props.length - 1) {
				o = value;
			}
		}
		return value;
	}

	function checkEqual(elements) {
		const first = getValue(elements[0]);
		for(let i=1; i<elements.length; i++) {
			if(first != getValue(elements[i])) {
				return false;
			}
		}
		return true;
	}

	function performAdd(elements) {
		let value = getValue(elements[0]);
		for(let i=1; i<elements.length; i++) {
			value += getValue(elements[i]);
		}
		return value;		
	}

	function getValue(obj) {
		if(typeof(obj)!='object') {
			if(typeof(obj)==='undefined') {
				return 0;
			}
			return obj;
		}
		let returnValue = obj;
		if(obj.equal) {
			returnValue = checkEqual(obj.equal);
		}
		if(obj.add) {
			returnValue = performAdd(obj.add);
		}

		const property = obj.get || obj.floor || obj.round;
		if(property) {
			returnValue = getPropValue(property);
		}
		if(obj.and) {
			returnValue = returnValue && getValue(obj.and);
		}
		if(obj.or) {
			if(!returnValue) {
				returnValue = getValue(obj.or);
			}
		}
		if(obj.floor) {
			returnValue = Math.floor(returnValue);
		} else if(obj.round) {
			returnValue = Math.round(returnValue);
		}
		if(obj.clamp) {
			const [ min, max ] = obj.clamp;
			returnValue = Math.min(getValue(max), Math.max(getValue(min), returnValue));
		}
		return returnValue;
	}

	function renderImage(spriteDefinition, x, y, now) {
		const { images, offsetX, offsetY } = spriteDefinition;
		const frame = Math.floor(now / 1000 * spriteFrameRate);
		const img = images[frame % images.length];
		ctx.drawImage(img, Math.floor(x + getValue(offsetX)), Math.floor(y + getValue(offsetY)));
	}

	function renderRect(spriteDefinition, x, y, now) {
		const { color, width, height, offsetX, offsetY } = spriteDefinition;
		ctx.fillStyle = getValue(color) || 'black';
		ctx.fillRect(x + getValue(offsetX), y + getValue(offsetY), getValue(width), getValue(height));
	}

	function refresh() {
		const now = new Date().getTime() - sceneTime;
		renderScene(scene, now);
		requestAnimationFrame(refresh);
	}

	function setDebug(div) {
		debugDiv = div;
	}

	function renderDebug(now) {
		if(debugDiv) {
			debugDiv.innerText = JSON.stringify(sceneData, null, ' ');
		}
	}

	document.addEventListener("DOMContentLoaded", init);

	return {
		setCanvas,
		setDebug,
		getValue,
	};
}(document, Game);