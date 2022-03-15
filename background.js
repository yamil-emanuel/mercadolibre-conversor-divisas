
/*
input.addEventListener("click", function(){
	chrome.runtime.sendMessage("HOLA");	
})
*/


function cambiar_target (target){
	console.log(target);

}



window.onload = function(){
	const selectElement = document.querySelector('.user_input');

	selectElement.addEventListener('change', (event) => {

		document.getElementById("inputDivisa").onclick = function() {

		  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		        chrome.tabs.sendMessage(tabs[0].id, {'target' : event.target.value}, function(response) {
		        });
		    });
		}



	});
};
