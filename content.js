

function convertir_divisas(Q,data,target){
	//Convierte una cantidad X de dinero a la divisa objetivo.
	//la primera vez que se ejecuta esta función (al cargar la página), la divisa base será el ARS$.
	//En ese momento será considerado el USD como base.
	let currencies ={"ARS":data.last_update_usdt_rate,
		"BTC":data.BTC,
		"ETH":data.ETH,
	};

	if (target === "USD"){
		return Q*currencies.ARS;
	}else{
		return (Q)*(1/currencies[target]);

	}
}


let selector_precios={
	'precios_content':document.getElementsByClassName("price-tag-fraction"),
	'precios_footer':document.getElementsByClassName('price-fraction'),
	'precio_prublicacion':document.getElementsByClassName('andes-money-amount__fraction'),
	'precios_dinamicos': document.getElementsByClassName("dynamic-carousel__price")

};


//PRECIOS SELECTORS
const precios_content = document.getElementsByClassName("price-tag-fraction");
const precios_footer = document.getElementsByClassName('price-fraction');
const precio_prublicacion = document.getElementsByClassName('andes-money-amount__fraction')
const precios_dinamicos = document.getElementsByClassName("dynamic-carousel__price");

//LISTA CON TODOS LOS PRECIOS
const todos_precios =[ precios_content, precios_footer, precio_prublicacion, precios_dinamicos]

//TAGS
const precios_tag_publicacion = document.getElementsByClassName("andes-money-amount__currency-symbol")
const precios_tag_symbol = document.getElementsByClassName("price-symbol")
const precios_tag = document.getElementsByClassName("price-tag-symbol");

//LISTA CON TODOS LOS TAGS
const todos_tags = [precios_tag_publicacion, precios_tag_symbol, precios_tag]

	

//DATA
const API_KEY = "287F5216-0659-4BC2-893A-ED89D8786702";
const API = "https://rest.coinapi.io/v1/assets/"

var today = new Date();
var date = today.getFullYear()+"-"+(today.getMonth()+1)+"-"+today.getDate();
var time = today.getHours()+":"+today.getMinutes()+":"+today.getSeconds();

var asset_id = "BTC,ARS,ETH";
var target = "USD"

function price_cleaner(str, target){

	if (target==="USD"){
		return str.replace(".","").replace(" ","").replace("$","");
	}else{
		return str.replace(" ","").replace("$","");
	}
}

function price_update(elements, data, target){
	//Recibe el objeto a ser modificado y la cotización, realiza la conversión y la muestra

	if (target=="BTC"||target=="ETH"){
		var fixed_length = 6;
	}else{
		var fixed_length = 2;
	}
	for(let i=0; i<elements.length; i++){

		if (elements[i].childNodes.length < 1){
			var precio = parseInt(price_cleaner(elements[i].innerText,target));
			elements[i].innerText = convertir_divisas(precio,data,target).toFixed(fixed_length);

		}else{

			try{
				var precio = parseInt(price_cleaner(elements[i].firstChild,target));
				elements[i].innerText = "<span>"+convertir_divisas(precio,data,target).toFixed(fixed_length)+"</span>";
			}
			catch(e){

				if (elements[i].innerText!==null){
					var precio =parseInt(price_cleaner(elements[i].innerText,target));
					elements[i].innerText = convertir_divisas(precio,data,target).toFixed(fixed_length);
				}

				else{
					var precio =parseInt(price_cleaner(elements[i].firstChild.childNodes[0].nodeValue, target));
					elements[i].innerText = convertir_divisas(precio,data,target).toFixed(fixed_length);

				}

			};
			
		};
	};
}

function price_tag_update(price_tag_list,target){
	//Cambia todos los price tag del sitio
	for (let i=0; i<price_tag_list.length; i++){
		price_tag_list[i].innerText=target;

	}

}

function get_storaged_data(){
	//Trae del almacenamiento data necesaria para la ejecución.
	//"last_update_usdt_rate","last_update_date","last_update_time"

	return chrome.storage.local.get(["last_update_usdt_rate","last_update_date","last_update_time","ETH","BTC"]);
};

function update_all_prices(data, is_db_updated,target){
	/*Verifica si la DB posee una cotización actualizada (mismo día).Si la DB esta actualizada, actualiza los precios. 
	Si la DB no esta actualizada, la actualiza y luego modifica los precios.
	*/

	if (!is_db_updated) {
		update_currencies_rate()
	};

	for (let i=0; i<todos_precios.length; i++){
		price_update(todos_precios[i], data, target);
	}

	for (let i=0; i<todos_tags.length; i++){
		price_tag_update(todos_tags[i], target);
	}

}

function update_currencies_rate(){
	//Requests API's data and stores it into the local storage.
	//["last_update_date","last_update_time","last_update_usdt_rate"]

	var request = new XMLHttpRequest();
	request.onreadystatechange = function() {
	    if (this.readyState == 4 && this.status == 200) {

	       // Parsing request's response
	       var data = JSON.parse(request.responseText);

	       for (let i=0; i<data.length; i++){

	       	if(data[i].asset_id=="ARS"){
				var cotizacion=data[i].price_usd;
				//Storing the rate's data
				chrome.storage.local.set({'last_update_date':date.toString()});
				chrome.storage.local.set({'last_update_time':time.toString()});
				chrome.storage.local.set({'last_update_usdt_rate':cotizacion.toString()});
				console.log("Database updated.");
	       	}else{
	       		var asset_id = data[i].asset_id;
	       		var cotizacion = data[i].price_usd;
	       		chrome.storage.local.set({ [`${asset_id}`] : cotizacion.toString()})
	       	}
	       };



	   };
	};
	//excecuting the request
	request.open("GET",API + asset_id, true);
	request.setRequestHeader('X-CoinAPI-Key', API_KEY);
	request.send();

}

function changes_verificator(stored_data,target){
	//Recibe la data almacenada en la DB
	//Verifica si desde el backend se realizaron cambios sobre los cambios ya realizados.
	//Todos los queries relacionados a los tags, son verificados. Si el price tag ya no corresponde a ARS$:
	//Se ejecuta nuevamente la actualización de precios.

	if (is_correct > 2){
		clearInterval(repeat);
	}

	for (let i=0; i<todos_tags.length; i++){
		if (todos_tags[i].length>1 && todos_tags[i][0].innerText=="$"){
				update_all_prices(stored_data,true,target);
		};
	};

};


var is_correct = 0;

window.onload = function(){

	var current_stored_data= get_storaged_data();
	current_stored_data.then((stored_data)=>{




		if (stored_data.last_update_date == date){
			update_all_prices(stored_data,true,target);

			var repeat = setInterval(function(){
				changes_verificator(stored_data,target);
			}, 4000);

		}else{
			update_all_prices(stored_data,false,target);
			
			var repeat = setInterval(function(){
				changes_verificator(stored_data,target);
			}, 4000);

		}
	});


}




chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        var current_stored_data= get_storaged_data();
		current_stored_data.then((stored_data)=>{
			console.log("Updating to "+request.target)
			update_all_prices(stored_data,true,request.target);


		});
});


