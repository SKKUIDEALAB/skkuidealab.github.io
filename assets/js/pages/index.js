// index.html 전용 스크립트
//   1) 스크롤에 따라 상단 메뉴 모양 전환
//   2) 흔들리는 사진을 따라 연결선의 사진 쪽 끝점 이동

(function () {

	// ── 1. 상단 메뉴 ────────────────────────────────────────────────
	// 템플릿(assets/js/main.js)은 #banner 가 화면 밖으로 나가는 것을 감지해
	// 헤더의 alt(투명 오버레이) 클래스를 떼도록 되어 있다.
	// 이 페이지의 배너는 position:sticky 라 화면 위에 계속 붙어 있어
	// "밖으로 나감"이 감지되지 않으므로 스크롤 위치로 직접 판단한다.
	// alt 를 떼면 다른 페이지(advisor 등)와 같은 흰색 고정 메뉴가 된다.

	var header = document.getElementById('header');
	var banner = document.getElementById('banner');

	if (header && banner) {
		var updateHeader = function () {
			var trigger = banner.offsetHeight - header.offsetHeight - 10;

			if (window.pageYOffset > trigger) {
				header.classList.remove('alt');
				header.classList.add('reveal');
			} else {
				header.classList.add('alt');
				header.classList.remove('reveal');
			}
		};

		window.addEventListener('scroll', updateHeader, { passive: true });
		window.addEventListener('resize', updateHeader);
		updateHeader();
	}

	// ── 2. 연결선 끝점 따라가기 ─────────────────────────────────────
	// 선의 칩 쪽 끝(x2,y2)은 index.html 에 적힌 고정값 그대로 두고,
	// 사진 쪽 끝(x1,y1)만 사진의 현재 위치(중앙)로 매 프레임 갱신한다.
	// CSS 애니메이션이 transform 으로 사진을 움직이므로
	// getBoundingClientRect 로 실제 그려진 위치를 읽어야 한다.

	var stage = document.querySelector('.banner-stage');
	var svg = document.querySelector('.banner-lines');

	if (!stage || !svg) return;

	var VB_W = 960;   // svg viewBox 너비
	var VB_H = 291;   // svg viewBox 높이

	// 기준은 틀(figure) 전체다. 마우스를 올려 설명이 펼쳐지면 틀이 위로 자라므로
	// 연결 지점도 그만큼 위로 함께 올라간다.
	var lines = svg.querySelectorAll('line');
	var pairs = [
		{ el: document.querySelector('.callout-noc'), line: lines[0] },
		{ el: document.querySelector('.callout-ai'),  line: lines[1] },
		{ el: document.querySelector('.callout-pim'), line: lines[2] }
	].filter(function (p) { return p.el && p.line; });

	if (pairs.length === 0) return;

	var sync = function () {
		var sr = stage.getBoundingClientRect();
		if (sr.width === 0 || sr.height === 0) return;

		for (var i = 0; i < pairs.length; i++) {
			var r = pairs[i].el.getBoundingClientRect();

			// 사진 중앙을 배너 좌표계(viewBox)로 환산
			var cx = (r.left + r.width / 2 - sr.left) / sr.width * VB_W;
			var cy = (r.top + r.height / 2 - sr.top) / sr.height * VB_H;

			pairs[i].line.setAttribute('x1', cx.toFixed(1));
			pairs[i].line.setAttribute('y1', cy.toFixed(1));
		}
	};

	// 움직임을 원치 않는 사용자 설정이면 애니메이션이 멈춰 있으므로
	// 매 프레임 돌 필요 없이 위치가 바뀔 때만 한 번씩 맞춘다.
	var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	var running = false;
	var loop = function () {
		if (!running) return;
		sync();
		window.requestAnimationFrame(loop);
	};

	var start = function () {
		if (running || reduced) return;
		running = true;
		window.requestAnimationFrame(loop);
	};

	var stop = function () {
		running = false;
	};

	// 배너가 화면에 보일 때만 갱신한다. 스크롤로 배너가 가려지면 멈춘다.
	if ('IntersectionObserver' in window) {
		new IntersectionObserver(function (entries) {
			if (entries[0].isIntersecting) { start(); } else { stop(); }
		}, { threshold: 0 }).observe(banner || stage);
	} else {
		start();
	}

	window.addEventListener('resize', sync);
	window.addEventListener('load', sync);
	sync();

})();
