//TODO: No se por qué no funciona en ordenador, aunque no es su objetivo
//(function(window){

window.onload = function() {

var startPosition = null, // Posición de inicio al tocar la vista
  endPosition = null, // Posición de fin al dejar de tocar la vista
 
  // DOM elements
  tabsContainer = document.getElementById('tabs-container'),
  tabs = document.getElementById('tabs-move'),
  lastTab = tabs.getElementsByClassName('tab').length - 1,
  tabsLink = document.getElementsByClassName('tabs-link')[0],
  tabsLinkArray = document.getElementsByClassName('tab-link'),
  indicator = document.getElementsByClassName('indicator')[0],
  indicatorHelper = document.getElementsByClassName('indicator-helper')[0],

  startTranslate = 0, // Traslación de la primera vista
  endTranslate = -100 * lastTab, // Traslación de la última vista
  sliding = false, // Bandera para saber si estamos cambiando de vista
  distanceToChangeView = 150,
  touchOffset = 30,
  currentTab = 0, // ïndice de la vista actual
  containerWdith = tabsContainer.clientWidth, // Anchura del contenedor
  speed = 10, // Velocidad de la animación de scroll en las pestañas

  touchMove = null;

// Obtener datos de las pestañas  
var tabsData = [ ]; 

[].forEach.call( tabsLinkArray, setData);

function setData( element, index ){
  element.setAttribute('data-id', index);

  var tab = {
    id: index,
    width: element.getBoundingClientRect().width,
    translate: index * -100,
  };
  tab.center = tab.width/2;

  if( index ){
    tab.left = tabsData[index-1].right;
    tab.right = tab.left + tab.width;
    tab.translatePX = -( containerWdith + Math.abs(tabsData[ index - 1 ].translatePX) );
  }else{
    tab.left = 0;
    tab.right = tab.width;
    tab.translatePX = 0;
  }
  
  tab.marginLeft = tab.left + tab.center;

  if( tabsData[index - 1] ){
    tab.previousTabScreenRatio = (tab.marginLeft - tabsData[index-1].marginLeft) / containerWdith;
  }

  tabsData.push(tab);
}

console.log( tabsData );

// Eventos
tabs.addEventListener('touchend', mouseUp);
tabs.addEventListener('touchstart', mouseDown);
tabs.addEventListener('touchmove', mouseMove);
tabsLink.addEventListener('click', tabLink);

moveIndicator();

// Cambiar anchura y posición del indicador según la vista actual
function moveIndicator(){
  indicator.style.transform =  "scaleX(" + tabsData[currentTab].width + ")";
  indicatorHelper.style.transform = "translateX("+ tabsData[currentTab].marginLeft +"px)";
}

// Evento cuando pulsamos una pestaña
function tabLink(event){

  /* Comprobar que:
      - No estamos desplazando la vista
      - Hemos pulsado una pestaña
      - La pestaña que pulsamos no es la actual
  */
  if( sliding || event.target.className !== 'tab-link' || currentTab === parseInt(event.target.getAttribute('data-id')) ){ return; }

  /* Fijamos la transición
    Desmarcamos la pestaña actual
    Elegimos nueva pestaña
  */
  setTransition();
  tabsLinkArray[currentTab].classList.remove('active');
  currentTab = parseInt(event.target.getAttribute('data-id'));

  // Animación para que la pestaña elegida y la siguiente (o anterior) entren en la pantalla
  // TODO: refactorizar
  var currentTabDistance = tabsLinkArray[ currentTab ].getBoundingClientRect();
      currentTabLeftDistance = currentTabDistance.left,
      currentTabRightDistance = currentTabDistance.right;
  
  if ( tabDesaparecePorLaIzquierda(currentTab) ){
    requestAnimationFrame(function(){
      avanzar( currentTab );
    });
  }else if( tabDesaparecePorLaDerecha(currentTab) ){
    requestAnimationFrame(function(){ 
      avanzar3( currentTab );
    });
  }

  if( currentTab > 0 && tabDesaparecePorLaIzquierda( currentTab-1 ) ){
    requestAnimationFrame(function(){
      avanzar( currentTab-1 );
    });
  }else if( currentTab < tabsData.length-1 && tabDesaparecePorLaDerecha( currentTab+1 ) ){
    requestAnimationFrame(function(){
      avanzar3( currentTab+1 );
    });
  }

  // Animamos la vista elegida, marcamos la pestaña activa y movemos el indicador
  tabs.style.transform = "translateX(" + tabsData[ currentTab ].translatePX + "px)";
  tabsLinkArray[currentTab].classList.add('active');
  moveIndicator();
  
}

function tabDesaparecePorLaIzquierda( numTab ){
  return tabsData[ numTab ].left < tabsLink.scrollLeft;
}

function tabDesaparecePorLaDerecha( numTab ){
  return tabsLink.clientWidth+tabsLink.scrollLeft < tabsData[ numTab ].right
}

// Levantamos el dedo
function mouseUp(event) {
  
  /**
   * Comprobamos que:
   * - El dedo se haya movido ( fijamos la endposition en cada movimiento del dedo )
   * - Nos hemos movido un mínimo de distancia para izquierda o derecha ( Esto es para evitar que cambiemos de vista 
   * sin querer al hacer scroll vertical en una vista )
   */
  if( !endPosition || !( (startPosition > endPosition && startPosition - endPosition >= touchOffset) ||
      (endPosition > startPosition && endPosition - startPosition >= touchOffset) ) ){
        return;
  }

  // Fijamos transiciones
  indicatorHelper.style.transition = "transform 0.3s";
  setTransition();
  // Desmarcamos la pestaña activa
  tabsLinkArray[currentTab].classList.remove('active');
  
  // Nos movemos a hacia una vista de la parte izquierda
  if ( moveToLeftView() ) {

    //nextTab = tabsData[ currentTab ];
    currentTab--;
    tabs.style.transform = "translateX(" + tabsData[ currentTab ].translatePX + "px)";
    putTabInScreenLeft();
    //previousTab = tabsData[ currentTab - 1 ] || null;

  // Nos movemos a hacia una vista de la parte derecha
  } else if ( moveToRightView() ) {

    //previousTab = tabsData[ currentTab ];
    currentTab++;
    //setTranslationPercen( tabsData[ currentTab ].translate );
    tabs.style.transform = "translateX(" + tabsData[ currentTab ].translatePX + "px)";
    putTabInScreenRight();
    //nextTab = tabsData[ currentTab+1 ] || null;
  
  // Si no nos movemos una distancia mínima para cambiar de vista, volvemos a la vista actual
  } else {
    //setTranslationPercen( tabsData[ currentTab ].translate );
    tabs.style.transform = "translateX(" + tabsData[ currentTab ].translatePX + "px)";
  }

  // Marcamos vista actual y movemos el indicador
  tabsLinkArray[currentTab].classList.add('active');
  moveIndicator();
}

/**
 * Animar el scroll en las pestañas
 * TODO: Hay casos que se pueden reutilizar
 */
function avanzar( numTab ){
  tabsLink.scrollLeft = tabsLink.scrollLeft - speed;
  //if( tabsLinkArray[ numTab ].getBoundingClientRect().left < 0 ){
  if( tabDesaparecePorLaIzquierda(numTab) ){
    requestAnimationFrame( function(){
      avanzar(numTab);
    } );
  }
}
function avanzar2(){
  tabsLink.scrollLeft = tabsLink.scrollLeft + speed;
  var b = tabsLinkArray[ currentTab ].getBoundingClientRect().right;
  if( b  > tabsLink.clientWidth ){
    requestAnimationFrame( avanzar2 );
  }
}

function avanzar3( numTab ){
  tabsLink.scrollLeft = tabsLink.scrollLeft + speed;
  if( tabDesaparecePorLaDerecha(numTab) ){
    requestAnimationFrame( function(){
      avanzar3( numTab );
    } );
  }
}

function avanzar4(){
  tabsLink.scrollLeft = tabsLink.scrollLeft - speed;
  if( tabsLinkArray[ currentTab ].getBoundingClientRect().left < 0 ){
    requestAnimationFrame( avanzar4 );
  }
}

// TODO: Hay casos que se pueden reutilizar
// Controlar la posición de pestañas en la parte izquierda
function putTabInScreenLeft( x ){

  var currentTabDistance = tabsLinkArray[ currentTab ].getBoundingClientRect();
      currentTabLeftDistance = currentTabDistance.left,
      currentTabRightDistance = currentTabDistance.right;
    
  /**
   * Cuando la pestaña actual aparece en la pantalla pero se corta por la parte izquierda
   */
  //if( currentTabLeftDistance < 0 ){
  if( tabDesaparecePorLaDerecha( currentTab ) ){
    requestAnimationFrame(function(){
      avanzar3( currentTab );
    });

  /**
   * El siguiente es el mismo comentario que más abajo, en este caso es lo mismo pero por el otro lado
   * 
   * Si las pestañas se mueven hacia la derecha y la parte izquierda de la pestaña actual está fuera al aizquierda de la pantalla
   * Ej: estoy en la primera pestaña, hago scroll hasta el final y desplazo una vista, ahora la pestaña queda a la izquierda de la pantalla
   * y no se ve
   */
  }
  /*else if ( currentTabDistance.right > tabsLink.clientWidth ){
    requestAnimationFrame(function(){
      avanzar2( currentTab );
    });
  }*/

  /**
   * Mostrar también la pestaña anterior de la elegida. Es la elegida !!!
   */
  //if( currentTab > 0 && tabsLinkArray[ currentTab-1 ].getBoundingClientRect().left < 0 ){
  if( currentTab > 0 && tabDesaparecePorLaDerecha( currentTab-1 ) ){
    requestAnimationFrame(function(){
      avanzar3( currentTab-1 );
    });
  }

}

// Controlar la posición de pestañas en la parte derecha
function putTabInScreenRight( x ){
  var currentTabDistance = tabsLinkArray[ currentTab ].getBoundingClientRect();
      currentTabLeftDistance = currentTabDistance.left,
      currentTabRightDistance = currentTabDistance.right;
    
  /**
   * Si la pestaña está en la pantalla pero se corta por la parte derecha
   */
  //if( tabsLink.clientWidth < currentTabRightDistance ){
  if( tabDesaparecePorLaIzquierda( currentTab ) ){
    requestAnimationFrame(function(){
      avanzar( currentTab );
    });
  /**
   * Si las pestañas se mueven hacia la derecha y la parte izquierda de la pestaña actual está fuera al aizquierda de la pantalla
   * Ej: estoy en la primera pestaña, hago scroll hasta el final y desplazo una vista, ahora la pestaña queda a la izquierda de la pantalla
   * y no se ve
   */
  }
  /*else if( currentTabLeftDistance < 0 ){
    requestAnimationFrame(function(){
      avanzar4( currentTab );
    });
  }*/

  /**
   * Mostrar también la pestaña siguiente de la elegida. Es la elegida !!!
   */
  //if( currentTab < tabsLinkArray.length-1 && tabsLinkArray[ currentTab+1 ].getBoundingClientRect().right > tabsLink.clientWidth ){
  if( currentTab < tabsLinkArray.length-1 && tabDesaparecePorLaIzquierda(currentTab+1) ){
    requestAnimationFrame(function(){
      avanzar( currentTab+1 );
    });
  }

}

// El dedo toca la vista, aquí nos preparamos para mover la vista
function mouseDown(event) {
  // Fijamos posición inicial
  startPosition = event.touches[0].clientX;
  endPosition = null;

  // Quitar transiciones para el indicador y las vistas
  indicatorHelper.style.transition = "";
  removeTransition();
}

// El dedo se mueve
function mouseMove(event){
  
  /**
   * Fijamos la posición final en cada momento, lo idóneo sería fijar este valor cuando levantes el dedo, pero este valor no existe en
   * el evento al levantar el dedo
   */
  endPosition = event.touches[0].clientX;

  // Comprobamos si podemos ir hacia las vistas de la izquierda
  // y Comprobar si el dedo se mueve para la derecha de la pantalla 
  if ( !leftLimit() && (event.touches[0].clientX > startPosition + touchOffset) ) {
    //Evitamos le scroll sobre la vista mientras cambiamos de vista
    event.preventDefault();

    // Actualizamos la posición translación de la vista y del indicador según el movimiento del dedo
    touchMove = event.touches[0].clientX - touchOffset - startPosition;
    tabs.style.transform = "translateX(" + Math.floor(tabsData[ currentTab ].translatePX + touchMove) + "px)";
    indicatorHelper.style.transform = "translateX("+ Math.floor(tabsData[currentTab].marginLeft - (touchMove*tabsData[ currentTab ].previousTabScreenRatio) )+"px)";

    // Comprobamos si podemos ir hacia las vistas de la derecha
    // y si el dedo se mueve para la izquierda de la pantalla 
  } else if ( !rightLimit() && ( event.touches[0].clientX < startPosition - touchOffset ) ) {
    
    //Evitamos le scroll sobre la vista mientras cambiamos de vista
    event.preventDefault();

    // Actualizamos la posición translación de la vista y del indicador según el movimiento del dedo
    touchMove = startPosition - event.touches[0].clientX - touchOffset;
    tabs.style.transform = "translateX(" + Math.floor(tabsData[ currentTab ].translatePX - touchMove) + "px)";
    indicatorHelper.style.transform = "translateX("+ Math.floor(tabsData[currentTab].marginLeft + (touchMove*tabsData[ currentTab+1 ].previousTabScreenRatio) )+"px)";

  }

}

// Poner transición a las vista y al indicador cuando no nos desplazamos con el dedo
function setTransition(){
  tabs.style.transition = "transform 0.3s";
  indicator.style.transition = "transform 0.3s";
}

// Quitar transición a las vista y al indicador mientras desplazamos con el dedo 
function removeTransition(){
  tabs.style.transition = "";
  indicator.style.transition = "";
}

// Comprobar si estamos al principio
function leftLimit(){
  return tabsData[ currentTab ].translate === startTranslate;
}

// Comprobar si estamos al final
function rightLimit(){
  return tabsData[ currentTab ].translate === endTranslate;
}

function moveToRightView(){
  return !rightLimit() && 
    startPosition > endPosition &&
    startPosition - endPosition > distanceToChangeView;
}

function moveToLeftView(){
  return !leftLimit() &&
    endPosition > startPosition &&
    endPosition - startPosition > distanceToChangeView;
}

}

//})(window);