

//PRECIOS
const precios_content=document.getElementsByClassName("price-tag-fraction");
const precios_footer= document.getElementsByClassName('price-fraction');
const precio_prublicacion= document.getElementsByClassName('andes-money-amount__fraction')
const precios_tag=document.getElementsByClassName("price-tag-symbol");

//TAGS
const precios_tag_publicacion=document.getElementsByClassName("andes-money-amount__currency-symbol")


const API_KEY="287F5216-0659-4BC2-893A-ED89D8786702";
const API ="https://rest.coinapi.io/v1/assets/"
var asset_id="ARS";
const delayInMilliseconds=7000;

function price_update(elements, cotizacion){
		for(let i=0; i<elements.length; i++){
		var precio = parseInt(elements[i].innerText.replace(".",""));
		try{
			elements[i].innerText = (precio*cotizacion).toFixed(2)					
		}
		catch(e){
			console.log(e)
		};
		};
}

function price_tag_update(price_tag_list){
	for (let i=0; i<price_tag_list.length; i++){
		price_tag_list[i].innerText="U$D"

	}

}


window.onload = function(){

	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
	    if (this.readyState == 4 && this.status == 200) {
	       // When the response is ready:
	       var data = JSON.parse(xhttp.responseText);

	       console.log(data);
	       var cotizacion = data[0].price_usd



			price_update(precios_content, cotizacion);
			price_update(precios_footer, cotizacion);
			price_update(precio_prublicacion, cotizacion);
			price_tag_update(precios_tag);
			price_tag_update(precios_tag_publicacion);

	    }
	};
	xhttp.open("GET",API+asset_id, true);
	xhttp.setRequestHeader('X-CoinAPI-Key', API_KEY);
	xhttp.send();


}





