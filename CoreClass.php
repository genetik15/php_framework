<?
$GLOBALS['STYLE'] = [];
$GLOBALS['CSS'] = [];
$GLOBALS['JS'] = [];
$GLOBALS['SCRIPT'] = [];
$GLOBALS['JS_LAZY'] = [];
$GLOBALS['SCRIPT_LAZY'] = [];

class CoreClass{
    
    /* __constructor()
     * Constructor will be called every time Login class is called ($login = new Login())
     */
    public function __construct(){ }
    
    public static function getW($url){
  		$path = 'http://'.$_SERVER['SERVER_NAME'].$url;
			return getimagesize($path)[0];
    }
    
    public static function getH($url){
  		$path = 'http://'.$_SERVER['SERVER_NAME'].$url;
			return getimagesize($path)[1];
    }
    
    
    public static function setClass($v1, $result){
    	return ($v1) ? $result : '';
    }
    
    public static function validateText($text){
    	$text = trim ($text);
    	$text = htmlspecialchars ($text);

		return str_replace("&quot;","&#039;",$text);
    }
    
    public static function component($component) {
		require_once("component/$component.php");
    }
    
    public static function css($css) {
		$GLOBALS['CSS'][] = $css;
	}
    public static function style($style) {
		$GLOBALS['STYLE'][] = $style;
	}
	public static function addCss() {
		$a = '';
		foreach ($GLOBALS['CSS'] as $css) {
			$a .= "<link rel=\"stylesheet\" href=\"css/$css.css\">";
		}
		foreach ($GLOBALS['STYLE'] as $style) {
			$a .= "<style>$style</style>\n";
		}
		return $a;
	}
	
    public static function js($js) {
		$GLOBALS['JS'][] = $js;
	}
    public static function script($script) {
		$GLOBALS['SCRIPT'][] = $script;
	}
	
	public static function addJs() {
		$scripts = '';
		foreach ($GLOBALS['JS'] as $js) {
			if (substr($js, -3, 3) != '.js') $js = "js/$js.js";
			$scripts .= "<script src=\"$js\"></script>";
		}
		foreach ($GLOBALS['SCRIPT'] as $script) {
			$scripts .= "$script\n";
		}
		return $scripts;
	}

    public static function jsLazy($js) {
		$GLOBALS['JS_LAZY'][] = $js;
	}
    public static function scriptLazy($script) {
		$GLOBALS['SCRIPT_LAZY'][] = $script;
	}
	public static function addJsLazy() {
		$scripts = '';
		foreach ($GLOBALS['JS_LAZY'] as $js) {
			if (substr($js, -3, 3) != '.js') $js = "js/$js.js";
			$scripts .= "<script src=\"$js\"></script>";
		}
		foreach ($GLOBALS['SCRIPT_LAZY'] as $script) {
			$scripts .= "$script\n";
		}
		return $scripts;
	}
}
?>