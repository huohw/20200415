let cascadeFlowModule = (function () {
	let columns = Array.from(document.querySelectorAll('.column')),
		_data = [];

	// 从服务器获取数据
	let queryData = function queryData() {
		let xhr = new XMLHttpRequest;
		xhr.open('GET', 'json/data.json', false);
		xhr.onreadystatechange = () => {
			if (xhr.readyState === 4 && xhr.status === 200) {
				_data = JSON.parse(xhr.responseText);
			}
		};
		xhr.send(null);
	};

	// 数据绑定
	let bindHTML = function bindHTML() {
		_data = _data.map(item => {
			// 图片的宽高
			let w = item.width,
				h = item.height;
			// 真实渲染的高度
			h = 180*h/w;
			item.width = 180;
			item.height = h;
			return item;
		});
		//console.log(_data);

		// 三个一组进行循环
		for (let i = 0; i < _data.length; i += 3) {
			// 升序
			let group = _data.slice(i, i + 3);
			group.sort((a, b) => {
				return a.height - b.height;
			});
			// 降序
			columns.sort((a, b) => {
				return b.offsetHeight - a.offsetHeight;
			});

			// 循环每一项，创建一个CARD，把创建的CARD放到对应的列中
			group.forEach((item, index) => {
				let {
					pic,
					link,
					title,
					height
				} = item;
				let card = document.createElement('div');
				card.className = "card";
				card.innerHTML = `<a href="${link}">
					<div class="lazyImageBox" style="height:${height}px">
						<img src="" alt="" data-image="${pic}">
					</div>
					<p>${title}</p>
				</a>`;
				columns[index].appendChild(card);
			});
		}
	};

	// 延迟加载
	let lazyFunc = function lazyFunc() {
		let lazyImageBoxs = document.querySelectorAll('.lazyImageBox');
		[].forEach.call(lazyImageBoxs, lazyImageBox => {
			// 处理过之后不再重新处理
			let isLoad = lazyImageBox.getAttribute('isLoad');
			if (isLoad === "true") return;
			// 获取lazyImageBox一半的位置距离BODY顶端的距离
			// 获取浏览器底边距离BODY顶端的距离
			let B = utils.offset(lazyImageBox).top +
				lazyImageBox.offsetHeight / 2;
			let A = document.documentElement.clientHeight +
				document.documentElement.scrollTop;
			// 延迟加载
			if (B <= A) {
				lazyImg(lazyImageBox);
			}
		});
	};
	//单张图片延迟加载
	let lazyImg = function lazyImg(lazyImageBox) {
		let img = lazyImageBox.querySelector('img'),
			dataImage = img.getAttribute('data-image'),
			tempImage = new Image;
		tempImage.src = dataImage;
		tempImage.onload = () => {
			img.src = dataImage;
			utils.css(img, 'opacity', 1);
		};
		img.removeAttribute('data-image');
		tempImage = null;
		// 为已处理过的盒子加标识
		lazyImageBox.setAttribute('isLoad', 'true');
	};

	// 加载更多数据
	let isRender;
	let loadMoreData = function loadMoreData() {
		let HTML = document.documentElement;
		// 一屏幕的高度+卷去的高度+半屏幕高度 >= 真实高度  
		// 滚动到底部了
		if (HTML.clientHeight + HTML.clientHeight / 2 + HTML.scrollTop >= HTML.scrollHeight) {
			if (isRender) return;
			isRender = true;
			queryData();
			bindHTML();
			lazyFunc();
			isRender = false;
		}
	};

	return {
		init() {
			queryData();  
			bindHTML();   
			lazyFunc();
			window.onscroll = function () {
				lazyFunc();
				loadMoreData();
			};
		}
	}
})();
cascadeFlowModule.init();