async function add(el, id, table = 'articles', action = 'likes') {
	
  let h = new Headers();
  let fd = new FormData();
  
  fd.append('id', id);
  fd.append('table', table);
  fd.append('action', action);

  let req = new Request(`./add.php`, {
    method: 'POST',
	cache  : 'no-cache',
    body: fd
  });
  
	await fetch(req)
		.then(res=>	res.json() ) 	
    	.then(commit=>{
			if (commit.user == 0) {
				document.location.href = "login.php"
			} else {	
				if (commit.status == 1) el.classList.remove('noactive')
				else el.classList.add('noactive')
				el.firstElementChild.innerText = commit.count
			}
  		})
    	.catch((err) =>{
			console.log('ERROR:', err.message);
		 })
}
