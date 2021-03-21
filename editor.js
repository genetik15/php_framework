class Y_Editor {
	constructor (id){
		this.list = document.querySelectorAll(".contenteditable")
		this.modal = false
		// this.storage = this.getStorage()
		this.initPost()
		this.id = id
		this.image = Y_Editor_image.html
	}
	clearStorage (){
		return `
		[{
			"tag":"p",
			"html": "Введите текст",
			"class":"contenteditable",
			"tabindex":"0",
			"contenteditable":""
		}]`
	}
	getStorage(){
		if (!localStorage.getItem('post')) {
			localStorage.setItem('post',  this.clearStorage())
		}
		let arr = JSON.parse(localStorage.getItem('post'))
		let post = this.parsePostJson(arr)
		document.querySelector("#form-contenteditable").innerHTML = post
		this.initPost()
	}
	parsePostJson(arr){
		let post = ''
		arr.forEach ( e => {
			let element = {
				'img':	 `<img class='${e.class}' src="${e.src}" alt="${e.alt}" onclick="Y_Editor.deleteImage(this)">`,
				'button': `<${e.tag} class='${e.class}' type='button'>${e.html}</${e.tag}>`
			};
			post += element[e.tag] || `<${e.tag} class='${e.class}'>${e.html}</${e.tag}>`
		})
		return post
	}
	initPost(){
		this.list = document.querySelectorAll(".contenteditable")
		this.list.forEach(elem => {
			elem.setAttribute('tabindex', '0')
			elem.setAttribute('contenteditable', '')
			this.addEvent(elem)
		});
	}
	addHighlighter(text) {
		var comments = [] // Тут собираем все каменты
		var strings = [] // Тут собираем все строки
		var res = [] // Тут собираем все RegExp
		var all = { 'C': comments, 'S': strings, 'R': res };
		return text.replace(/(<)/gi,'&lt;')
			.replace(/(>)/gi,'&gt;')
			//Убираем каменты
			.replace(/\/\*[\s\S]*\*\//g, function (m) {
				var l = comments.length
				comments.push(m)
				return '~~~C' + l + '~~~'
			})
			.replace(/([^\\])\/\/[^\n]*\n/g, function (m, f) {
				var l = comments.length
				comments.push(m)
				return f + '~~~C' + l + '~~~'
			})
			// Убираем строки
			.replace(/([^\\])((?:'(?:\\'|[^'])*')|(?:"(?:\\"|[^"])*"))/g, function (m, f, s) {
				var l = strings.length
				strings.push(s)
				return f + '~~~S' + l + '~~~'
			})
			// Возвращаем на место каменты, строки, RegExp
			.replace(/~~~([CSR])(\d+)~~~/g, function (m, t, i) {
				let valueTag = all[t][i];
				if (t == 'C') t = 'pre__comment';
				if (t == 'S' || t == 'R') t = 'pre__string';
				return '<span class="' + t + '">' + valueTag + '</span>'
			})
		
			.replace(/(classList|contains|remove|add|querySelector|document|tagName|innerText|innerHTML|preventDefault)([^a-z0-9$_])/gi, '<span class="pre__html">$1</span>$2')
			.replace(/(console|var|export|try|catch|const|let|function|typeof|new|return|if|for|in|while|break|do|continue|switch|case)([^a-z0-9$_])/gi, '<span class="pre__keyword">$1</span>$2')
			// Выделяем методы
			.replace(/(getElementById|preventDefault|innerHTML|findIndex|preventDefault|splice|setData|getData|appendChild|createElement|replace|forEach|map|reduce|split|length|log|search|includes|indexOf|push|find|filter)([^a-z0-9$_])/gi,'<span class="pre__method">$1</span>$2')
			// значения
			.replace(/(undefined|null|NaN|true|false)([^a-z0-9$_])/gi,'<span class="pre__number">$1</span>$2')
			// Выделяем ключевые слова this
			.replace(/(this)([^a-z0-9$_])/gi,'<span class="pre__keyword">$1</span>$2')
			// Выделяем скобки
			.replace(/(\{|\}|\]|\$|\[|\|)/gi,'<span class="pre__operator">$1</span>')
			// Выделяем имена функций
			// .replace(/([a-z\_\$][a-z0-9_]*)[\s]*\(/gi,'<span class="pre__method">$1</span>(')
			// Выделяем  цифры
			.replace(/([0-9])/gi, '<span class="pre__number">$1</span>')
			// Выделяем  знаки
			// .replace(/(\*|\+|\/|\%|-)/gi, '<span class="Zn">$1</span>')
			// =-|+|/`|/;|/,|/*|/%|/$)
	}
	removeSpans(elem) {
			const spans = elem.getElementsByTagName('span');
			for (var i = 0; i < spans.length; i++) {
					if (!spans[i].className) spans[i].outerHTML = spans[i].innerHTML;
			}
	}
	deleteElement(elem){
		if (this.list.length <= 1) return false
				if (elem.tagName == 'CITE') {
					alert('Нельзя удалить "подпись"')
					return false
				}
				if (elem.nextSibling != null && elem.nextSibling.tagName == 'CITE') elem.nextSibling.remove()
				let prev = elem.previousElementSibling || elem.nextSibling ||  elem.nextSibling.nextSibling
				this.addCursorInEnd(prev)
				elem.remove()
				this.list = document.querySelectorAll(".contenteditable")
	}
	addCursorInEnd(el){
		if (!el) return
		const range = document.createRange();
		range.selectNodeContents(el);
		range.collapse(false);
		const sel = window.getSelection();
		sel.removeAllRanges();
		sel.addRange(range);  
	}
	enableModal(){
		this.modal = true
		document.getElementById('modal').style.display = 'block'
	}
	disableModal(){
		this.modal = false
		document.getElementById('modal').style.display = 'none'
	}
	closeModal(elem = null){
		this.disableModal()
		this.addCursorInEnd(elem)
	}
	addElement(tag = 'p', html = '') {
		let elem = document.querySelector('.add__elem')
		if (elem.tagName == 'BLOCKQUOTE' || elem.tagName == 'IMG') elem = document.querySelector('.add__elem').nextSibling
		let div = document.createElement(tag);
		div.setAttribute('class', 'contenteditable');
		div.setAttribute('tabindex', '0');
		div.setAttribute('contenteditable', '');
		if (tag == 'blockquote') {
			let el = this.addElement('cite', 'Введите автора цитаты')
			el.classList.add('cite_blockquote')
		}	
		elem.after(div);
		
		let newElement = elem.nextElementSibling;
		this.disableModal()
		newElement.focus()
		newElement.innerHTML = html
		this.addEvent(newElement)
		this.list = document.querySelectorAll(".contenteditable");
		if (tag == 'button') {
				newElement.classList.add('spoiler')
				newElement.setAttribute('type', 'button');
		}
		if (elem.tagName == "PRE") {
			// elem.innerHTML = this.addHighlighter(elem.innerText);
			}
		return newElement;
	}
	pasteText(e, elem) {
		e.preventDefault();    
		var pastedData = (e.originalEvent || e).clipboardData.getData('text');
		var selection = window.getSelection().toString();
		if (e.target.tagName != "PRE") {
			document.execCommand('inserttext', false, pastedData.replace(/\r?\n/g, "")); 
						// text = text.replace(/\r?\n/g, "");
				} else {
					document.execCommand('inserttext', false, pastedData);
				}
				this.addCursorInEnd(elem);
	}
	addButtonForAddElement(elem){
		let form = `
		<div  id="editor__input" data-img='0' class="editor__modal row">
				<div class="icon" onclick="Y_Editor.addElement('p')" tabindex="0">
			<p> 1 </p>
			<i class="material-icons noactive"> format_align_left </i>
				</div>
				<div class="icon" onclick="Y_Editor.addElement('h2')">
			<p> 2 </p>
					<i class="material-icons noactive"> title </i>
				</div>
				<div class="icon" onclick="Y_Editor.addElement('h3')">
			<p> 3 </p>
					<i class="material-icons noactive"> title </i>
				</div>
				<div class="icon" onclick="Y_Editor.addElement('h4')">
			<p> 4 </p>
					<i class="material-icons noactive"> title </i>
				</div>
				<div class="icon" onclick="Y_Editor.addElement('blockquote')">
			<p> 5 </p>
					<i class="material-icons noactive"> comment </i>
				</div>
				<div class="icon" onclick="Y_Editor.addElement('li')">
			<p> 6 </p>
					<i class="material-icons noactive"> format_list_bulleted </i>
				</div>
				<div class="icon" onclick="Y_Editor.openModalImg()">
			<p> 7 </p>
					<i class="material-icons noactive"> insert_photo </i>
				</div>
				<div class="icon" onclick="Y_Editor.addElement('pre')">
			<p> 8 </p>
					<i class="material-icons noactive"> code </i>
				</div>
				<div class="icon" onclick="Y_Editor.addElement('button')">
			<p> 9 </p>
					<i class="material-icons noactive"> queue </i>
				</div>
				<div class="icon" onclick="Y_Editor.closeModal()">
			<p> ESC </p>
					<i class="material-icons noactive"> highlight_off </i>
				</div>
			</div>
		`
		let add__elem= document.querySelectorAll('.add__elem')
		// удаляем класс add__img у всех элементов во избежании конфликтов
		for (var i = 0; i < add__elem.length; i++) {
					add__elem[i].classList.remove('add__elem')
			}
		
		elem.classList.add('add__elem')
		
		var modal = document.getElementById("modal")
		var captionText = document.getElementById("modal__caption")
		
		modal.style.backgroundColor='#fff'
		modal__caption.style.color='#333'
		modal__caption.style.textAlign='left'
		captionText.innerHTML = form
		this.enableModal()
		modal.focus()
		
	}
	saveStorage(elem) {
		localStorage.setItem('post', JSON.stringify(this.toJsonStorage()));
	}
	toJsonStorage() {
			let post = [];
			
		this.list.forEach( (elem, id) => {
			let attr = {};
					for (let a of elem.attributes) {
								attr[a.name] = a.value;
					}
					post.push({
							'tag': elem.tagName.toLowerCase(),
							'html': elem.innerHTML,
							...attr
					});
		});
		return post
	}
	addEvent(elem) {
		elem.addEventListener("DOMNodeInserted", e => {
				this.removeSpans(elem);
			},false);
			
				elem.addEventListener('paste', e => {
					this.pasteText(e, elem);
			});
						
			elem.addEventListener('keydown', e => {
				
				if (this.modal) {
					e.preventDefault()
					if (e.which == 13) {
						console.log(elem.tagName)
						if (elem.tagName != 'CITE')
							this.addElement(e.target.tagName.toLowerCase())
						else this.addElement('p')
					}
					else if (e.which == 32) this.addElement('p')
					else if (e.which == 49) this.addElement('p')
					else if (e.which == 50) this.addElement('h2')
					else if (e.which == 51) this.addElement('h3')
					else if (e.which == 52) this.addElement('h4')
					else if (e.which == 53) this.addElement('blockquote')
					else if (e.which == 54) this.addElement('li')
					else if (e.which == 55) this.openModalImg()
					else if (e.which == 56) this.addElement('pre')
					else if (e.which == 57) this.addElement('button')
					else if (e.which == 27) this.disableModal()
				}
			else if (e.which === 32){
				
					if (elem.tagName == "BUTTON") {
						e.preventDefault()
						document.execCommand('insertHTML', false, '&nbsp')	
					}
				if (elem.tagName == "PRE") {
					// elem.innerHTML = this.addHighlighter(elem.innerText)
							this.addCursorInEnd(elem)
					}
			}
			
			else if ( e.which === 186 || e.which === 187 || e.which === 192 ||e.which == 56 || e.which == 57 || e.which === 222 || e.which === 190 || e.which === 189 || e.which === 188 || e.which === 219 || e.which === 221) {
				if (elem.tagName == "PRE") {
					// elem.innerHTML = this.addHighlighter(elem.innerText)
							this.addCursorInEnd(elem)
					}
			}
			else if (e.which === 13) {
				e.preventDefault()
				if (elem.tagName == "PRE") {
					e.preventDefault()
					elem.innerHTML = this.addHighlighter(elem.innerText)
							this.addCursorInEnd(elem)
					}
				this.addButtonForAddElement(elem)
			}
			else if (e.shiftKey && e.ctrlKey) {
						if (e.which == 8) {
							this.deleteElement(elem)
				}
				else if (e.which == 81)
					document.execCommand('unlink', false, document.getSelection().toString());
				else if (e.which == 69)
					document.execCommand('removeFormat', false, document.getSelection().toString());
				else if (e.which == 83)
					document.execCommand('insertHTML', false, `<kbd>${document.getSelection().toString()}</kbd>`)
				else if (e.which == 67)
					document.execCommand('insertHTML', false, `<samp>${document.getSelection().toString()}</samp>`)
				else if (e.which == 65) {
					var sLnk = prompt('Введите ссылку', 'http:\/\/');
					if (sLnk && sLnk !== '' && sLnk !== 'http://') {
						// rel="nofollow"
							let a = document.execCommand('createLink', false, sLnk);
							console.log(a);
					}
				}
			}
			});
	}
	savePost(f){
		this.toTextarea(this.id)
		f.submit();
	}
	toTextarea(id) {
		let post = this.toJson()
		document.getElementById(id).innerHTML = JSON.stringify(post, null, 4)
	}
	toJson() {
			let post = [];
			
		this.list.forEach( (elem, id) => {
				elem.removeAttribute('contenteditable');
				elem.removeAttribute('tabindex');
			let attr = {};
					for (let a of elem.attributes) {
							 attr[a.name] = (a.name == 'class')
								? a.value.replace('contenteditable', '')
								: a.value;
					}
					post.push({
							'tag': elem.tagName.toLowerCase(),
							'html': elem.innerHTML,
							...attr
					});
		});
		return post
	}
	openModalImg() {
		let elem = document.querySelector('.add__elem')
		document.getElementById("modal__caption").innerHTML = this.image
		document.getElementById("editor__input__img").focus()
		
		Y_Editor_image.addEvent()
	}
	deleteImage(el) {
		if (confirm('Удалить картинку?')) {
			this.deleteElement(el)
		}
	}
		
	loadImage(data) {
		console.log(data)
		let elem = document.querySelector('.add__elem')
		let img = document.createElement('img');
		img.setAttribute('class', 'contenteditable');
		img.setAttribute('onclick', 'Y_Editor.deleteImage(this)');
		img.setAttribute('tabindex', '0');
		img.setAttribute('src', '/' + data.src);
				img.setAttribute('alt', data.alt);
		let cite = this.addElement('cite', data.alt)

		elem.after(img);
		
		this.addEvent(elem.nextElementSibling)
		this.list = document.querySelectorAll(".contenteditable");
		
		cite.focus()
		this.addCursorInEnd(cite)
		this.disableModal()
	}
}
