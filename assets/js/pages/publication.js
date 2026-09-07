// publication.html 전용 스크립트 (초록 팝업 + 접기/펼치기)

function openModal(file) {
	document.getElementById('myModal').style.display = "block";
	document.getElementById('modal-body').innerHTML = '';

	fetch(file)
		.then(response => {
			if (!response.ok) throw new Error(response.status);
			return response.text();
		})
		.then(data => {
			// 받아온 초록 페이지에서 본문(#main)만 뽑아 넣는다.
			// 페이지 전체를 넣으면 팝업 안에 상단 메뉴와 footer 가 중복으로 그려진다.
			const doc = new DOMParser().parseFromString(data, 'text/html');
			const main = doc.querySelector('#main');
			document.getElementById('modal-body').innerHTML = main ? main.innerHTML : doc.body.innerHTML;
		})
		.catch(error => {
			document.getElementById('modal-body').innerHTML = '<h2>Failed to load content</h2>';
		});
}

function closeModal() {
	document.getElementById('myModal').style.display = "none";
}

// 팝업 바깥을 클릭하면 닫음
window.onclick = function(event) {
	if (event.target == document.getElementById('myModal')) {
		document.getElementById('myModal').style.display = "none";
	}
}

document.addEventListener("DOMContentLoaded", function() {
	var coll = document.getElementsByClassName("collapsible");
	for (var i = 0; i < coll.length; i++) {
		coll[i].addEventListener("click", function() {
			this.classList.toggle("active");
			var content = this.nextElementSibling;
			if (content.style.display === "block") {
				content.style.display = "none";
			} else {
				content.style.display = "block";
			}
		});
	}
});
