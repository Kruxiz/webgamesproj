<?php
$con=mysqli_connect("localhost","root","","tanksdb");
// Check connection
if (mysqli_connect_errno())
  {
  echo "Failed to connect to MySQL: " . mysqli_connect_error();
  }

if (isset($_POST['json'])) {
        // use json_decode() transform to array
        $request_json = json_decode($_POST['json'], true);
        $theuser = $request_json['user'];
		$thescore = $request_json['thescore'];
		$hitstaken = $request_json['hitstaken'];
		echo "This is a message from PHP. The user:".$theuser." have stored his score : ".$thescore."with damage taken: ".$hitstaken;
        
		$sql="INSERT INTO score_tbl (userid,userscore,userhits) VALUES ('".$theuser."',".$thescore.",".$hitstaken.")";
		mysqli_query($con,$sql);
		mysqli_close($con);
}
?>