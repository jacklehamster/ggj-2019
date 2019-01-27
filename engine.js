const Engine = function(document, Game) {
	const { scenes, assets, settings, transformations } = Game; 
	const debug = window.location.search.indexOf('debug') >= 0;

	let spriteFrameRate = settings.spriteFrameRate || 10;
	let ctx;
	let mainCanvas;
	let pixelSize = 1;
	setCanvas(document.createElement('canvas'));
	
	let scene = {};
	const stock = {
	};
	const mouse = { x:0, y:0, down:false };
	let sceneTime = 0;

	let visualScroll = 0;
	let sceneData = {
		mouse,
		scroll: 0,
		debug,
		now: 0,
	};

	let debugDiv = null;

	function onNewScene() {
		sceneData = {
			mouse,
			scroll: 0,
			debug,
			now: 0,
		};
		sceneTime = new Date().getTime();
		if(scene.init) {
			scene.init.forEach(action => renderAction(action, 0));
		}
	}

	function onNewFrame(now) {
		sceneData.now = now;
		sceneData.hovered = null;
		sceneData.tip = null;
		const diff = sceneData.scroll - visualScroll;
		if(Math.abs(diff) < 1) {
			visualScroll = sceneData.scroll;
			sceneData.notScrolling = true;
		} else {
			visualScroll += diff / 10;
			sceneData.notScrolling = false;
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

	function loadSound(src, vol, loop) {
		const audio = new Audio();
		audio.addEventListener('canplaythrough', e => {
			const tag = src.split("/").pop().split(".").slice(0, -1).join("");
            if(!loop) {
                loop = false;
            }
            if(!vol) {
                vol = 0.5;
            }
            audio.volume = vol;
            audio.loop = loop;
			addStock(tag, {
				type: 'audio',
				audio,
			});
		});
		audio.src = src;
	}

	function loadImage(src, width, height, count, offsetX, offsetY, option) {
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
					const index = y * cols + x;
					if(index >= count) {
						continue;
					}

					const cropWidth = Math.min(width, naturalWidth - x * width + 1);
					const cropHeight = Math.min(height, naturalHeight - y * height + 1);
					const canvas = document.createElement('canvas');
					canvas.width = cropWidth;
					canvas.height = cropHeight;
					const ctx = canvas.getContext('2d');
					ctx.drawImage(
						img, x * width, y * height, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight,
					);
					const flipCanvas = document.createElement('canvas');
					flipCanvas.width = cropWidth;
					flipCanvas.height = cropHeight;
					const flipCtx = flipCanvas.getContext('2d');
					flipCtx.translate(flipCanvas.width, 0);
					flipCtx.scale(-1, 1);
					flipCtx.drawImage(
						img, x * width, y * height, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight,
					);
					flipCtx.setTransform(1, 0, 0, 1, 0, 0);
					sprite = {
						type: 'img',
						images: [{
							canvas,
							flipCanvas,
							imgData: ctx.getImageData(0, 0, canvas.width, canvas.height),
							flipImgData: flipCtx.getImageData(0, 0, flipCanvas.width, flipCanvas.height),
						}],
						offsetX,
						offsetY,
						option,
					};
					sprites.push(addStock(`${tag}.${index}`, sprite));
				}
			}
			if(option.pingpong) {
				const totalCount = count * 2 - 1;
				for(let i = 0; i < totalCount - count; i++) {
					const index = count + i;
					const { type, images, offsetX, offsetY } = sprites[count - i - 1];
					const sprite = {
						type, images, offsetX, offsetY,
					};
					sprites.push(addStock(`${tag}.${index}`, sprite));
				}
			}
			addStock(tag, {
				type: 'img',
				images: sprites.map(sprite => sprite.images[0]),
				offsetX,
				offsetY,
				option,
			});
			if(option.reverse) {
				sprites.reverse();
				addStock(`${tag}.reverse`, {
					type: 'img',
					images: sprites.map(sprite => sprite.images[0]),
					offsetX,
					offsetY,
					option,
				});
				sprites.reverse();
			}			
		});
		img.src = src;
	}

	function addStock(tag, sprite) {
		sprite.tag = tag;
		stock[tag] = sprite;
		return sprite;
	}

	function setScene(index) {
		let newScene;
		if(typeof(index) === 'string') {
			newScene = scenes.filter(s => s.name = index)[0];
		} else {
			newScene = scenes[index];
		}
		if(scene !== newScene) {
			scene = newScene;
			onNewScene();
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
		assets.filter(asset => asset[0].split(".").pop()==='png')
			.forEach(asset => {
				const [ src, width, height, count, offsetX, offsetY, option ] = asset;
				loadImage(src, width || 0, height || 0, count || 0, offsetX || 0, offsetY || 0, option || {});
			});
		assets.filter(asset => asset[0].split(".").pop()==='mp3')
			.forEach(asset => {
				const [ src, vol, loop ] = asset;
				loadSound(src, vol, loop);
			});
	}

	function clearCanvas() {
		ctx.fillStyle = settings.backgroundColor;
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	}

	function getRenderedSprites(sprite, now, renderList) {
		if(!sprite || !validateIf(sprite)) {
			return;
		}
		if(sprite.group) {
			getRenderedSprites(sprite.group, now, renderList);
			return;
		}
		if(sprite.length) {
			const sprites = sprite;
			for(let i = 0; i < sprite.length; i++) {
				getRenderedSprites(sprites[i], now, renderList);
			}
			return;
		} else {
			renderList.push(sprite);
		}
	}

	function compareSprites(sprite1, sprite2) {
		return getValue(sprite1.y, sprite1) - getValue(sprite2.y, sprite2);
	}

	const renderList = [];
	function renderScene(scene, now) {
		onNewFrame(now);
		clearCanvas(mainCanvas);
		const { actions, sprites } = scene;
		renderList.length = 0;
		getRenderedSprites(sprites, now, renderList);
		renderList.sort(compareSprites);

		renderList.forEach(sprite => renderSprite(sprite, now, 0, 0));
		actions.forEach(action => renderAction(action, now));
		renderDebug(now);
	}

	function validateIf(element, context) {
		if(typeof(element.if) !== 'undefined' || typeof(element.ifnot) !== 'undefined') {
			const conditionMet = typeof(element.if) !== 'undefined' 
				? getValue(element.if, context)
				: !getValue(element.ifnot, context);
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
			console.log(getValue(action.log, action));
		}
		if(action.set) {
			const [ prop, value ] = action.set;
			setValue(prop, value, action);
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
			const step = options ? getValue(options.step, action)||1 : 1;
			const currentValue = getPropValue(prop, action);
			const goalValue = getValue(to, action);
			if(currentValue < goalValue) {
				setValue(prop, Math.min(currentValue + step, goalValue), action);
			} else if(currentValue > goalValue) {
				setValue(prop, Math.max(currentValue - step, goalValue), action);
			}
		}
		if(action.playSound) {
			const name = getValue(action.playSound, action);
			const audioDefinition = stock[name];
			if(audioDefinition) {
				audioDefinition.audio.play();
			}
		}
	}

	function renderSprite(sprite, now, offsetX, offsetY) {
		const name = getValue(sprite.name, sprite);
		const spriteDefinition = name ? stock[name] : sprite;
		if(spriteDefinition) {
			const { type } = spriteDefinition;
			switch(type) {
				case 'img':
					{
						const { x, y } = sprite;
						renderImage(sprite, spriteDefinition, getValue(x, sprite) + getValue(offsetX, sprite), getValue(y, sprite) + getValue(offsetY, sprite), now);
					}
					break;
				case 'rect':
					{
						const { x, y } = sprite;
						renderRect(sprite, spriteDefinition, getValue(x, sprite) + getValue(offsetX, sprite), getValue(y, sprite) + getValue(offsetY, sprite), now);
					}
					break;
				case 'text':
					{
						const { x, y } = sprite;
						renderText(sprite, spriteDefinition, getValue(x, sprite) + getValue(offsetX, sprite), getValue(y, sprite) + getValue(offsetY, sprite), now);
					}
					break;
			}
		}
	}

	function setValue(prop, obj, context) {
		const property = getValue(prop, context);
		if(!property) {
			return;
		}
		const props = property.split('.');
		let o = sceneData, lastProp = props.pop();
		for(let i=0; i<props.length; i++) {
			if(!o[props[i]]) {
				o[props[i]] = {};
			}
			o = o[props[i]];
		}
		o[lastProp] = getValue(obj, context);
	}

	function getPropValue(prop, context) {
		const property = getValue(prop);
		if(!property) {
			return undefined;
		}
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

	function checkEqual(elements, context) {
		const first = getValue(elements[0], context);
		for(let i=1; i<elements.length; i++) {
			if(first != getValue(elements[i], context)) {
				return false;
			}
		}
		return true;
	}

	function checkAnd(elements, context) {
		let value = getValue(elements[0], context);
		for(let i=1; i<elements.length; i++) {
			value = value && getValue(elements[i], context);
		}
		return value;		
	}

	function checkOr(elements, context) {
		let value = getValue(elements[0], context);
		for(let i=1; i<elements.length; i++) {
			value = value || getValue(elements[i], context);
		}
		return value;		
	}

	function performAdd(elements, context) {
		let value = getValue(elements[0], context);
		for(let i=1; i<elements.length; i++) {
			value += getValue(elements[i], context);
		}
		return value;		
	}

	function performSub(elements, context) {
		let value = getValue(elements[0], context);
		for(let i=1; i<elements.length; i++) {
			value -= getValue(elements[i], context);
		}
		return value;		
	}

	function checkSorted(elements, desc, context) {
		for(let i=1; i<elements.length; i++) {
			if(desc) {
				if(getValue(elements[i-1], context) < getValue(elements[i], context)) {
					return false;
				}
			} else {
				if(getValue(elements[i-1], context) > getValue(elements[i], context)) {
					return false;
				}
			}
		}
		return true;
	}

	function getValue(obj, context) {
		if(!obj || typeof(obj)!='object') {
			if(typeof(obj)==='undefined') {
				return 0;
			}
			return obj;
		}

		if(!validateIf(obj)) {
			return 0;
		}

		let returnValue = obj;
		if(obj.equal) {
			returnValue = checkEqual(obj.equal, context);
		}
		if(obj.asc) {
			returnValue = checkSorted(obj.asc, false, context);
		}
		if(obj.desc) {
			returnValue = checkSorted(obj.desc, true, context);			
		}
		if(obj.add) {
			returnValue = performAdd(obj.add, context);
		}
		if(obj.subtract) {
			returnValue = performSub(obj.subtract, context);
		}
		if(obj.mod) {
			const modVal = getValue(obj.mod[1], context);
			returnValue = (getValue(obj.mod[0], context) + modVal) % modVal;
		}

		const property = obj.get || obj.floor || obj.round || obj.tip;
		if(property) {
			returnValue = getPropValue(property, context);
		}
		if(obj.not) {
			returnValue = !getValue(obj.not, context);
		}
		if(obj.and) {
			returnValue = checkAnd(obj.and, context);
		}
		if(obj.or) {
			returnValue = checkOr(obj.or, context);
		}
		if(obj.floor) {
			returnValue = Math.floor(returnValue);
		} else if(obj.round) {
			returnValue = Math.round(returnValue);
		}
		if(obj.tip && returnValue) {
			returnValue = makeTip(returnValue);
		}
		if(obj.clamp) {
			const [ min, max ] = obj.clamp;
			returnValue = Math.min(getValue(max, context), Math.max(getValue(min, context), returnValue));
		}
		return returnValue;
	}

	function makeTip(name) {
		return name.split('.')[0].split('-').join(' ');
	}

	function renderImage(sprite, spriteDefinition, x, y, now) {
		const { images, offsetX, offsetY } = spriteDefinition;
		const timeStart = sprite.animationStart ? getValue(sprite.animationStart, sprite) : 0;
		let frame = Math.floor((now - timeStart) / 1000 * spriteFrameRate);
		if(sprite.repeat && frame >= sprite.repeat * images.length) {
			frame = images.length-1;
		}
		const img = images[frame % images.length];
		const xx = Math.floor(x + getValue(offsetX, sprite)) + Math.round(visualScroll);
		const yy = Math.floor(y + getValue(offsetY, sprite));
		const { canvas, imgData, flipCanvas, flipImgData } = img;
		const shouldFlip = getValue(sprite.flip, sprite);
		ctx.drawImage(shouldFlip ? flipCanvas : canvas, xx, yy);

		if(sprite && sprite.name && !sprite.noHover && !spriteDefinition.option.noHover) {
			const imgX = Math.floor(mouse.x - xx);
			const imgY = Math.floor(mouse.y - yy);
			if(0 <= imgX && imgX < canvas.width && 0 <= imgY && imgY < canvas.height) {
				const data = shouldFlip ? flipImgData.data : imgData.data;
				if (data[(imgX + imgY * canvas.width) * 4 + 3]>0) {
					sceneData.hovered = sprite;
					sceneData.tip = spriteDefinition.option.tip;
				}
			}
		}
	}

	function renderRect(sprite, spriteDefinition, x, y, now) {
		const { color, width, height, offsetX, offsetY } = spriteDefinition;
		ctx.fillStyle = getValue(color, sprite) || 'black';
		if(sprite.alpha) {
			ctx.globalAlpha = sprite.alpha;
		}
		ctx.fillRect(x + getValue(offsetX, sprite) + Math.round(visualScroll), y + getValue(offsetY, sprite), getValue(width, sprite), getValue(height, sprite));
		if(sprite.alpha) {
			ctx.globalAlpha = 1;
		}
		if(sprite && sprite.name && !sprite.noHover && !spriteDefinition.option.noHover) {
			sceneData.hovered = sprite;
			sceneData.tip = spriteDefinition.option.tip;
		}
	}

	function renderText(sprite, spriteDefinition, x, y, now) {
		const { color, width, height, offsetX, offsetY } = spriteDefinition;
		const text = getValue(sprite.text);
		if(text) {
			ctx.fillStyle = getValue(color, sprite) || 'black';
			if(sprite.alpha) {
				ctx.globalAlpha = sprite.alpha;
			}
			ctx.fillText(text, x + getValue(offsetX, sprite) + (sprite.ignoreScroll ? 0 : Math.round(visualScroll)), y + getValue(offsetY, sprite));
			if(sprite.alpha) {
				ctx.globalAlpha = 1;
			}
			if(sprite && sprite.name && !sprite.noHover && !spriteDefinition.option.noHover) {
				sceneData.hovered = sprite;
				sceneData.tip = spriteDefinition.option.tip;
			}
		}
	}

	function refresh() {
		const now = new Date().getTime() - sceneTime;
		renderScene(scene, now);
		requestAnimationFrame(refresh);
	}

	function setDebug(div) {
		debugDiv = div;
		if(!debug) {
			debugDiv.style.display = "none";
		}
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
		setValue,
		stock,
	};
}(document, Game);
