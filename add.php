<?php
class LikeClass{

  public function __construct(){
  	
  	if ( isset($_REQUEST['table']) ) {
      $this->Create();
    }
  }
  
  private function Create(){
	if(!isset($_SESSION)) { session_start();}
  	
	require ("classes/UserClass.php");
  	$user = UserClass::getProfile('id');
  	
  	if ($user == '') {
	    $_SESSION['message'] = "Зарегестрируйтесь, чтобы добавлять в 'избранное' и 'закладки'!";
  		echo json_encode( array(
			'user' => 0
		));
  	}
  	else {
		require ('config/dbconnect.php');
		
		$id = $_REQUEST['id'];
		$table = $_REQUEST['table'];
		$action = $_REQUEST['action'];
	  	
	    $stmt = $conn->prepare("SELECT * FROM $action WHERE post = $id and user = $user and name_table = '$table'");
	    $stmt->execute();
			$like = $stmt->get_result();
			$like = mysqli_fetch_array ($like, MYSQLI_ASSOC);
			
	    if (isset($like)) {
	    	$stmt = $conn->prepare("UPDATE $action SET status = not status WHERE post = $id and user = $user and name_table = '$table'");
	    	$stmt->execute();
	    	$isLike = !$like['status'];
	    }
	    else {
	    	$stmt = $conn->prepare("INSERT INTO $action (status, user, name_table, post) VALUES (1, $user, '$table', $id)");
	    	$stmt->execute();
	    	$isLike = 1;
	    }
	    
	    $stmt = $conn->prepare("SELECT count(*) FROM $action WHERE post = $id and name_table = '$table' and status = 1");
	  	$stmt->execute();
		$count = $stmt->get_result();
			
	    $stmt->close();
	    
		echo json_encode( array(
			'status' => $isLike,
			'count' => mysqli_fetch_assoc($count)["count(*)"]
		));
  	}
  }
}
new LikeClass();
