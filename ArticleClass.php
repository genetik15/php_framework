<?php

class ArticleClass{
	public function __construct(){
	  	
	  	if (isset($_GET["edit"]) && isset($_POST["createArticle"])) {
			$this->Update();
	  	}
	  	
	  	else if (isset($_POST["createArticle"])) {
			$this->Create();
	    }
	  	else if (isset($_GET["delete"])) {
			$this->Delete();
	  	}
	}
	  
	public static function getById($id){
	  	require ('config/dbconnect.php');
	
	    $stmt = $conn->prepare("SELECT * FROM articles WHERE id = ? ORDER BY id DESC");
		$stmt->bind_param("s", $id);
		$stmt->execute();
		$article = $stmt->get_result();
		
		if ( mysqli_num_rows($article) > 0 ) {
			return mysqli_fetch_array($article, MYSQLI_ASSOC);
		}
		else {
			return NULL;
		}
	}
	  
	public static function getAll ($category = ""){
	  	require ('config/dbconnect.php');
	
		$sql = "SELECT * FROM articles ORDER BY id DESC";
		if  ($category <> "") $sql .= " WHERE category = $category";
		
	    $stmt = $conn->prepare($sql);
		$stmt->execute();
		$articles = $stmt->get_result();
		
		if ( mysqli_num_rows($articles) > 0 ) {
			return mysqli_fetch_all($articles, MYSQLI_ASSOC);
		}
		else {
			return array();
		}
	}
	  
	private function Update(){
	  
	    require ('config/dbconnect.php');
	    require ('config/message.php');
	    
	    $title = CoreClass::validateText($_POST['title']);  
	    $description = CoreClass::validateText($_POST['description']);
	    $text = $_POST['text'];
	    $category = $_POST['category'];
	    $id = $_GET["id"];
	
	    
	    if(!empty($title) && !empty($description) && !empty($text)){
	    	
			$date = date('Y-m-d H:i:s');
			$user = UserClass::getProfile('id');
			
			$stmt = $conn->prepare("UPDATE articles SET title=?, description=?, text=?, category=? WHERE id=$id");
			$stmt->bind_param("ssss", $title, $description, $text, $category );
			$stmt->execute();
			
			$stmt = $conn->prepare("DELETE FROM tags WHERE post=$id and name_table='articles'");
			$stmt->execute();
			$tags = explode( ",", trim($_POST['tags']) );
			foreach ($tags as $tag) {
				$tag = trim($tag);
		        $stmt = $conn->prepare("INSERT INTO tags (tag, post, name_table) VALUES (?,?,'articles')");
		        $stmt->bind_param("si", $tag, $id);
		        $stmt->execute();
			}
	      
			$stmt->close();
			
			header("Location: page_article.php?id=$id");
			$_SESSION['SuccessMessage'] = "Статья \"$title\" отрекдактирована!";
			exit();
	      
	    } else {
			header("Location: create_article.php?edit=1&id=$id");
			$_SESSION['message'] = 'Заполните все поля';
			exit();
	    }
	  }
	private function Create(){
	  
	    require ('config/dbconnect.php');
	    require ('config/message.php');
	    
	    $title = CoreClass::validateText($_POST['title']);  
	    $description = CoreClass::validateText($_POST['description']);
	    $text = trim($_POST['text']);
	    $category = $_POST['category'];
	
	    
	    if(!empty($title) && !empty($description) && !empty($text)){
	    	
		$date = date('Y-m-d H:i:s');
		$user = UserClass::getProfile('id');
		
		$stmt = $conn->prepare("INSERT INTO articles (title, description, text, date, dateupdate, author, category) VALUES (?,?,?,?,?,?,?)");
		$stmt->bind_param("sssssii", $title, $description, $text, $date, $date, $user, $category);
		$stmt->execute();
		
		$idArticle = $stmt->insert_id;
		if ($idArticle != 0) {
			$tags = explode( ",", trim($_POST['tags']) );
			foreach ($tags as $tag) {
				$tag = trim($tag);
				$stmt = $conn->prepare("INSERT INTO tags (tag, post, name_table) VALUES (?,?,'articles')");
				$stmt->bind_param("si", $tag, $idArticle);
				$stmt->execute();
			}
			
			$stmt->close();
			
			header('Location: create_article.php');
			$_SESSION['SuccessMessage'] = "Статья \"$title\" создана!";
			exit();
		}
		else {
			$stmt->close();
			header('Location: create_article.php');
			$_SESSION['message'] = "Статья \"$title\" не создана!";
			exit();
		}
	
	
	    }
	    else {
			header('Location: create_article.php');
			$_SESSION['message'] = 'Заполните все поля';
			exit();
	    }
	}
	  
	public static function Delete(){
	    require ('config/dbconnect.php');
	    $id = $_GET['id'];
	
	    $stmt = $conn->prepare("DELETE FROM articles WHERE id=$id");
		$stmt->execute();
	    $stmt = $conn->prepare("DELETE FROM tags WHERE post=$id and name_table='articles'");
		$stmt->execute();
		$stmt->close();
	
	    header('Location: /');
	    $_SESSION['SuccessMessage'] = "Заметка удалена!";
	    exit();
	}
		
	public static function getContent($content) {
	  	$html = '';
	  	$arr = json_decode($content);
	  	$preventTag = '';
	  	
	  	foreach ($arr as $key=>$v) {
	  		
	  		$tag = $v-> tag;
	  		$class = $v-> class;
	  		$text = $v-> html;
	  		
	  		if ($tag == 'li' && $preventTag != 'li') {
	  			$html .= "<ul>\n<$tag class='$class'>$text</$tag>";
	  		}
	  		else {
	  			if ($preventTag == 'li' && $tag != 'li') {
	    			$html .= "\n</ul>\n";
	    		}
	    		if ($tag == 'img') {
	    			if ($key == 0) {
	    			}
	    			else {
			    		$src = $v-> src;
			    		$alt = $v-> alt;
			    		$path = 'http://'.$_SERVER['SERVER_NAME'].$src;
		    			$w = getimagesize($path)[0];
		    			$h = getimagesize($path)[1];
			  			$ratio = $w/$h;
			  			
		    			$html .= "<img src=\"/img/static/post_template.png\" data-src=\"$src\" onclick=\"openImg(event)\" data-ratio=\"$ratio\" alt=\"$alt\">";
		    			// $html .= "<img src=\"/img/static/post_template.png\" data-src=\"$src\" onclick=\"openImg(event)\" alt=\"$alt\" width=\"$w\" height=\"$h\">";
	    			}
	    		}
	    		else if ($tag == 'button') {
	    			$html .= "<$tag class='$class' type='button'>$text</$tag>";
	    		}
	    		else if ($tag == 'cite' && $key == 1) {
	    			
	    		} else {
		    		$html .= "<$tag class='$class'>$text</$tag>";
	    		}
	  		}
	  		$preventTag = $tag;
	  	}
	  	return $html;
	}
	  
	public static function getContentEdit($content) {
	  	$html = '';
	  	$arr = json_decode($content);
	  	
	  	foreach ($arr as $v) {
	  		
	  		$tag = $v-> tag;
	  		$class = $v-> class;
	  		$text = $v-> html;
	  		
	  		if ($tag == 'img') {
	    		$src = $v-> src;
	    		$alt = $v-> alt;
	    		$path = 'http://'.$_SERVER['SERVER_NAME'].$src;
	  			$w = getimagesize($path)[0];
	  			$h = getimagesize($path)[1];
	  			$html .= "<img src=\"/img/static/post_template.png\" data-src=\"$src\" class='contenteditable $class' onclick=\"Y_Editor.deleteImage(this)\" alt=\"$alt\" tabindex=\"0\" contenteditable=\"\">";
	  		}
	  		else if ($tag == 'button') {
	  			$html .= "<$tag class='contenteditable' type='button' tabindex=\"0\" contenteditable=\"\">$text</$tag>";
	  		}
	  		else {
	    		$html .= "<$tag class='contenteditable $class' tabindex=\"0\" contenteditable=\"\">$text</$tag>";
	  		}
	  	}
	  	return $html;
	}
}