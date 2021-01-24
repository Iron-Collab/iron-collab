// AUTH
const signUpButton = document.getElementById('signUp');
const logInButton = document.getElementById('logIn');
const authContainer = document.getElementById('auth-container');

signUpButton.addEventListener('click', () => {
  console.log(signUpButton)
	authContainer.classList.add("right-panel-active");
});

logInButton.addEventListener('click', () => {
  console.log(logInButton)
	authContainer.classList.remove("right-panel-active");
});