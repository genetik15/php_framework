<?
CoreClass::component('message');
CoreClass::component('form');
CoreClass::component('editor');
CoreClass::component('button');

function CreateArticle() {
	$get = "create_article.php";
	$text_v = "<p class=\"contenteditable add__elem\" tabindex=\"0\" contenteditable=\"\">Введите текст</p>";
	if (isset($_GET["edit"])) {
		$id = $_GET["id"];
		$get = "create_article.php?edit=1&id=$id";
		$item = ArticleClass::getById($id);
		$date = $item['date'];
		$title_v = $item['title'];
		$description_v = $item['description'];
		$text_v = ArticleClass::getContentEdit($item['text']);
		$categories_v = CategoryClass::getById($item['category']);
		$tags_v = implode(
			",",
			array_map('current', TagClass::getTagsByIdArticle($id, 'articles'))
		);
	}
	
	$title = Input ('title', 'Название', 'required autofocus', false, false, $title_v);
	$description = Input ('description', 'Описание', 'required', false, false,$description_v);
	$text = Textarea ('text', 'Текст', '', 'hiden');
	$editor = Editor('text', $text_v);
	$categories = Select ('category', 'Категория', 'required', '', CategoryClass::getListCategory(), $categories_v);
	$tags = Input ('tags', 'Тэги (добавить через запятую)', 'required', false, false, $tags_v);
	$submit = Input ('createArticle', 'Пароль', '', 'submit', 'btn-bgc', 'Создать');
	$message = Message();
	$saveStorage = Button('Сохранить черновик', 'onclick="Y_Editor.saveStorage()"');
	$getStorage = Button('Открыть черновик', 'onclick="Y_Editor.getStorage()"');
	
  return "
<div class=\"container\">
	<h2 class=\"border-top\">Создать статью</h2>
	<div class=\"loginForm\">
	    <form  action=\"$get\" name=\"createArticleForm\" class=\"form-login\" method=\"post\" onsubmit=\"Y_Editor.savePost(this)\">
			$title
			$description
			$categories
			$tags
			$saveStorage
			$getStorage
			$editor
			$text
			$message
			$submit
	    </form>
	    <br>
	</div>
</div>
	";
}
CoreClass::css('pre');
CoreClass::style("

");