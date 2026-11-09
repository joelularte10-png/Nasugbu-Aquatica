$(document).ready(function(){
    console.log("Ajax Is working")

    $("#signupbtn").click(function(){

        $.ajax({
            url: "../auth.php",
            method: "POST",
            data: {
                username: $("#username").val(),
                role: $("#role").val(),
                password: $("#password").val()
            },
            success: function(response){
                console.log(response);
            }
        })

    })
    $("#loginbtn").click(function(){
        
        $.ajax({
            url: "../auth.php",
            method: "POST",
            data: {
                username: $("#username").val(),
                password: $("#password").val()
            },
        })
    })
})
