(function(window){

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
  prevTab = {}, // Datos de la vista anterior a la actual
  nextTab = {}, // Datos de la vista siguiente a la actual
  containerWdith = tabsContainer.clientWidth, // Anchura del contenedor
  speed = 10; // Velocidad de la animación de scroll en las pestañas

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
  }else{
    tab.left = 0;
    tab.right = tab.width;
  }
  
  tab.marginLeft = tab.left + tab.center;

  if( tabsData[index - 1] ){
    tab.previousTabScreenRatio = (tab.marginLeft - tabsData[index-1].marginLeft) / containerWdith;
  }

  tabsData.push(tab);
}

var nextTab = tabsData[currentTab+1],
  previousTab = null;

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

  if( sliding || event.target.className !== 'tab-link' || currentTab === parseInt(event.target.getAttribute('data-id')) ){ return; }

  setTransition();
  tabsLinkArray[currentTab].classList.remove('active');
  currentTab = parseInt(event.target.getAttribute('data-id'));

  var currentTabDistance = tabsLinkArray[ currentTab ].getBoundingClientRect();
      currentTabLeftDistance = currentTabDistance.left,
      currentTabRightDistance = currentTabDistance.right;
  
    if( currentTabLeftDistance < 0 ){
      requestAnimationFrame(avanzar);
    }else if( tabsLink.clientWidth < currentTabRightDistance ){
      requestAnimationFrame(avanzar3);
    }

  if( currentTab > 0 && tabsLinkArray[ currentTab-1 ].getBoundingClientRect().left < 0 ){
    requestAnimationFrame(function(){
      avanzar( currentTab-1 );
    });
  }else if( currentTab < tabsLinkArray.length-1 && tabsLinkArray[ currentTab+1 ].getBoundingClientRect().right > tabsLink.clientWidth ){
    requestAnimationFrame(function(){
      avanzar3( currentTab+1 );
    });
  }

  nextTab = tabsData[ currentTab + 1 ] || null;
  previousTab = tabsData[ currentTab - 1 ] || null;

  setTranslationPercen( tabsData[ currentTab ].translate );
  tabsLinkArray[currentTab].classList.add('active');

  moveIndicator();
  
}

// Levantamos el dedo
function mouseUp(event) {
  
  if( !endPosition || !( (startPosition > endPosition && startPosition - endPosition >= touchOffset) ||
      (endPosition > startPosition && endPosition - startPosition >= touchOffset) ) ){
        return;
  }

  animatingIndicatorHelper = true;
  indicatorHelper.style.transition = "transform 0.3s";
  setTransition();
  tabsLinkArray[currentTab].classList.remove('active');
  
  if ( moveToLeftView() ) {

    nextTab = tabsData[ currentTab ];

    currentTab--;
    setTranslationPercen( tabsData[ currentTab ].translate );
    
    putTabInScreenLeft();

    previousTab = tabsData[ currentTab - 1 ] || null;

  } else if ( moveToRightView() ) {

    previousTab = tabsData[ currentTab ];

    currentTab++;
    setTranslationPercen( tabsData[ currentTab ].translate );

    putTabInScreenRight();

    nextTab = tabsData[ currentTab+1 ] || null;
    
  } else {
    setTranslationPercen( tabsData[ currentTab ].translate );
  }
  
  tabsLinkArray[currentTab].classList.add('active');
  moveIndicator();
  
}

function avanzar( currentTab ){
  tabsLink.scrollLeft = tabsLink.scrollLeft - speed;
  if( tabsLinkArray[ currentTab ].getBoundingClientRect().left < 0 ){
    requestAnimationFrame( function(){
      avanzar(currentTab);
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

function avanzar3( currentTab ){
  tabsLink.scrollLeft = tabsLink.scrollLeft + speed;
  if( tabsLink.clientWidth < tabsLinkArray[ currentTab ].getBoundingClientRect().right ){
    requestAnimationFrame( function(){
      avanzar3( currentTab );
    } );
  }
}

function avanzar4(){
  tabsLink.scrollLeft = tabsLink.scrollLeft - speed;
  if( tabsLinkArray[ currentTab ].getBoundingClientRect().left < 0 ){
    requestAnimationFrame( avanzar4 );
  }
}

function putTabInScreenLeft( x ){
  var currentTabDistance = tabsLinkArray[ currentTab ].getBoundingClientRect();
      currentTabLeftDistance = currentTabDistance.left,
      currentTabRightDistance = currentTabDistance.right;
  
    if( currentTabLeftDistance < 0 ){
      requestAnimationFrame(function(){
        avanzar( currentTab );
      });
    }else if ( currentTabDistance.right > tabsLink.clientWidth ){
      requestAnimationFrame(function(){
        avanzar2( currentTab );
      });
    }

    if( currentTab > 0 && tabsLinkArray[ currentTab-1 ].getBoundingClientRect().left < 0 ){
      requestAnimationFrame(function(){
        avanzar( currentTab-1 );
      });
    }

}

function putTabInScreenRight( x ){
  var currentTabDistance = tabsLinkArray[ currentTab ].getBoundingClientRect();
      currentTabLeftDistance = currentTabDistance.left,
      currentTabRightDistance = currentTabDistance.right;
  
    if( tabsLink.clientWidth < currentTabRightDistance ){
      requestAnimationFrame(function(){
        avanzar3( currentTab );
      });
    }else if( currentTabLeftDistance < 0 ){
      requestAnimationFrame(function(){
        avanzar4( currentTab );
      });
    }

    if( currentTab < tabsLinkArray.length-1 && tabsLinkArray[ currentTab+1 ].getBoundingClientRect().right > tabsLink.clientWidth ){
      requestAnimationFrame(function(){
        avanzar3( currentTab+1 );
      });
    }

}

// El dedo toca la vista
function mouseDown(event) {
  startPosition = event.touches[0].clientX;
  endPosition = null;
  animatingIndicatorHelper = false;
  indicatorHelper.style.transition = "";
}

// El dedo se mueve
function mouseMove(event){
  
  endPosition = event.touches[0].clientX;

  removeTransition();

  if ( toRight( event ) && !leftLimit() ) {
    event.preventDefault();

    var touchMove = event.touches[0].clientX - touchOffset - startPosition;

    setTranslation( "calc( " + touchMove + "px + " + tabsData[ currentTab ].translate + "% )" );

    var vistaRespectoPantalla = containerWdith / touchMove;
    
    var newPos = previousTab.width / vistaRespectoPantalla;
    
    indicator.style.transform =  "scaleX(" + tabsData[currentTab].width + ")";
    indicatorHelper.style.transform = "translateX("+ Math.floor(tabsData[currentTab].marginLeft - (touchMove*tabsData[ currentTab ].previousTabScreenRatio) )+"px)";

  } else if ( toLeft( event ) && !rightLimit() ) {
    event.preventDefault();

    var touchMove = startPosition - event.touches[0].clientX - touchOffset;

    setTranslation( "calc( " + tabsData[ currentTab ].translate + "% - " + touchMove + "px)" );
    var vistaRespectoPantalla = containerWdith / touchMove;

    var newPos = tabsData[ currentTab ].width / vistaRespectoPantalla;

    indicator.style.transform =  "scaleX(" + tabsData[currentTab].width + ")";
    indicatorHelper.style.transform = "translateX("+ Math.floor(tabsData[currentTab].marginLeft + (touchMove*tabsData[ currentTab+1 ].previousTabScreenRatio) )+"px)";

  }

}

// Fijar transición de las vistas
function setTranslation( translation ){
  tabs.style.transform = "translateX(" + translation + ")";
}

function setTranslationPercen( translation ){
  setTranslation( translation+'%' );
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

// Comprobar si el dedo se mueve para la izquierda de la pantalla 
function toLeft(event){
  return event.touches[0].clientX < startPosition - touchOffset;
}

// Comprobar si el dedo se mueve para la derecha de la pantalla 
function toRight(event){
  return event.touches[0].clientX > startPosition + touchOffset;
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
  return startPosition > endPosition&&
    startPosition - endPosition > distanceToChangeView &&
    !rightLimit();
}

function moveToLeftView(){
  return endPosition > startPosition &&
    endPosition - startPosition > distanceToChangeView &&
    !leftLimit();
}

}

})(window);