//TODO: No se por qué no funciona en ordenador, aunque no es su objetivo

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
  sliding = false, // Bandera para saber si estamos cambiando de vista
  distanceToChangeView = 150,
  touchOffset = 40,
  currentTab = 0, // ïndice de la vista actual
  containerWdith = null, // Anchura del contenedor
  speed = 10, // Velocidad de la animación de scroll en las pestañas

  touchMove = null,
  requestAnimationFrameReference = null
  throttleTime = 300
  throttleTimeOut = null,
  equalTabs = true;

// Obtener datos de las pestañas 
var tabsData = [ ];
// Anchura de las pestañas según el número de pestañas
var equalWdith = null;
// Traslación de la última vista
var endTranslate = null;

initialize();

window.addEventListener('resize', onResize);

function onResize(){
  clearTimeout(throttleTimeOut);
  throttleTimeOut = setTimeout(function() {
      initialize();
  }, throttleTime);
}

function initialize(){
  containerWdith = tabsContainer.clientWidth;
  if( equalTabs ){
    equalWdith = 100 / tabsLinkArray.length;
  }else{
    tabsLink.style.overflowX = 'auto';
  }
  prepareTabs();
  tabs.style.transform = "translateX(" + tabsData[ currentTab ].translatePX + "px)";
  moveIndicator();
}

function prepareTabs(){
  tabsData = [];
  [].forEach.call( tabsLinkArray, setData);
  endTranslate = tabsData[ tabsData.length -1 ].translatePX;
}

function setData( element, index ){
    element.setAttribute('data-id', index);
    if( equalTabs ){
      element.style.width = equalWdith+'%';
    }

    var tab = {
      id: index,
      width: Math.floor(element.getBoundingClientRect().width),
      translate: index * -100,
    };
    tab.center = Math.floor(tab.width/2);

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

//console.log( tabsData );

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

  manageTabs(currentTab);

  // Animamos la vista elegida, marcamos la pestaña activa y movemos el indicador
  tabs.style.transform = "translateX(" + tabsData[ currentTab ].translatePX + "px)";
  tabsLinkArray[currentTab].classList.add('active');
  moveIndicator();
  
}

function manageTabs( numTab ){

  if( equalWdith ){ return; }

  cancelAnimationFrame(requestAnimationFrameReference);

  if ( tabDesaparecePorLaIzquierda(numTab) ){
    requestAnimationFrameReference = requestAnimationFrame(function(){
      retrocederScroll( numTab );
    });
  }else if( tabDesaparecePorLaDerecha(numTab) ){
    requestAnimationFrameReference = requestAnimationFrame(function(){ 
      avanzarScroll( numTab );
    });
  }

  if( numTab > 0 && tabDesaparecePorLaIzquierda( numTab-1 ) ){
    requestAnimationFrameReference = requestAnimationFrame(function(){
      retrocederScroll( numTab-1 );
    });
  }else if( numTab < tabsData.length-1 && tabDesaparecePorLaDerecha( numTab+1 ) ){
    requestAnimationFrameReference = requestAnimationFrame(function(){
      avanzarScroll( numTab+1 );
    });
  }
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
  setTransition();
  // Desmarcamos la pestaña activa
  tabsLinkArray[currentTab].classList.remove('active');
  
  // Nos movemos a hacia una vista de la parte izquierda
  if ( moveToLeftView() ) {

    currentTab--;
    tabs.style.transform = "translateX(" + tabsData[ currentTab ].translatePX + "px)";
    manageTabs( currentTab );

  // Nos movemos a hacia una vista de la parte derecha
  } else if ( moveToRightView() ) {

    //previousTab = tabsData[ currentTab ];
    currentTab++;
    tabs.style.transform = "translateX(" + tabsData[ currentTab ].translatePX + "px)";
    manageTabs( currentTab );
  
  // Si no nos movemos una distancia mínima para cambiar de vista, volvemos a la vista actual
  } else {
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
function retrocederScroll( numTab ){
  tabsLink.scrollLeft = tabsLink.scrollLeft - speed;

  if( tabDesaparecePorLaIzquierda(numTab) ){
    requestAnimationFrame( function(){
      retrocederScroll(numTab);
    } );
  }
}

function avanzarScroll( numTab ){
  tabsLink.scrollLeft = tabsLink.scrollLeft + speed;
  if( tabDesaparecePorLaDerecha(numTab) ){
    requestAnimationFrame( function(){
      avanzarScroll( numTab );
    } );
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
  indicatorHelper.style.transition = "transform 0.3s";
  tabs.style.transition = "transform 0.3s";
  indicator.style.transition = "transform 0.3s";
}

// Quitar transición a las vista y al indicador mientras desplazamos con el dedo 
function removeTransition(){
  indicatorHelper.style.transition = "";
  tabs.style.transition = "";
  indicator.style.transition = "";
}

// Comprobar si estamos al principio
function leftLimit(){
  return tabsData[ currentTab ].translatePX === startTranslate;
}

// Comprobar si estamos al final
function rightLimit(){
  return tabsData[ currentTab ].translatePX === endTranslate;
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
