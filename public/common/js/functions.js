function myFunction() {
    var x = document.getElementById("myTopnav");
    if (x.className === "topnav") {
        x.className += " responsive";
    } else {
        x.className = "topnav";
    }
}

function eraseText() {
    document.getElementById("submitArea").value = "";
}

function checkPassword() {
    var password = document.getElementById("newPassword"),
        confirm_password = document.getElementById("confirmPassword");
    if (password.value != confirm_password.value) {
        confirm_password.setCustomValidity("Passwords must match!");
    } else {
        confirm_password.setCustomValidity('');
    }
    password.onchange = checkPassword;
    confirm_password.onkeyup = checkPassword;
}

function checkPasswordRegister() {
    var password = document.getElementById("password"),
        confirm_password = document.getElementById("confirmPassword");
    if (password.value != confirm_password.value) {
        confirm_password.setCustomValidity("Passwords must match!");
    } else {
        confirm_password.setCustomValidity('');
    }
    password.onchange = checkPasswordRegister;
    confirm_password.onkeyup = checkPasswordRegister;
}