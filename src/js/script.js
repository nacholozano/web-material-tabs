window.onload = function() {

var throttleTime = 300,
  throttleTimeOut = null,
  dom = {
    tabsContainer: document.getElementById('tabs-container'),
    tabs: document.getElementById('tabs-move'),
    tabsLink: document.getElementsByClassName('tabs-link')[0],
    tabsLinkArray: document.getElementsByClassName('tab-link'),
    indicator: document.getElementsByClassName('indicator')[0],
    indicatorHelper: document.getElementsByClassName('indicator-helper')[0]
  },
  touch = {
    startPosition: null,
    endPosition: null,
    move: null,
    offset: 40
  },
  tabsScroll = {
    speed: 10,
    requestAnimationFrameReference: null,
    tabManaged: null,
    equalTabs: false,
    equalWdith: null
  },
  tabsViews = {
    containerWdith: null,
    startTranslate: 0, // Traslación de la primera vista
    endTranslate: null, // Traslación de la última vista
    sliding: false, // Bandera para saber si estamos cambiando de vista
    distanceToChangeView: 150, // Distancia necesaria para cambiar de una vista a otra
    currentTab: 0,
    width: null,
  },
  tabsData = [];

initialize();

// Events
dom.tabs.addEventListener('touchend', touchUp);
dom.tabs.addEventListener('touchstart', touchDown);
dom.tabs.addEventListener('touchmove', touchMove);
dom.tabsLink.addEventListener('click', touchTab);
window.addEventListener('resize', onResize);

function onResize(){
  clearTimeout(throttleTimeOut);
  throttleTimeOut = setTimeout(function() {
      initialize();
  }, throttleTime);
}

function initialize(){
  tabsViews.containerWdith = dom.tabsContainer.clientWidth;
  if( tabsScroll.equalTabs ){
    tabsScroll.equalWdith = 100 / dom.tabsLinkArray.length;
  }else{
    dom.tabsLink.style.overflowX = 'auto';
  }
  prepareTabs();
  dom.tabs.style.transform = "translateX(" + tabsData[ tabsViews.currentTab ].translatePX + "px)";
  updateIndicator();
}

function prepareTabs(){
  tabsData = [];
  [].forEach.call( dom.tabsLinkArray, setData);
  tabsViews.endTranslate = tabsData[ tabsData.length-1 ].translatePX;
}

function setData( element, index ){
  element.setAttribute('data-id', index);
  if( tabsScroll.equalTabs ){
    element.style.width = tabsScroll.equalWdith+'%';
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
    tab.translatePX = -( tabsViews.containerWdith + Math.abs(tabsData[ index - 1 ].translatePX) );
  }else{
    tab.left = 0;
    tab.right = tab.width;
    tab.translatePX = 0;
  }
  
  tab.marginLeft = tab.left + tab.center;

  if( tabsData[index - 1] ){
    tab.previousTabScreenRatio = (tab.marginLeft - tabsData[index-1].marginLeft) / tabsViews.containerWdith;
  }

  tabsData.push(tab);
}

// Change width and position of indicator
function updateIndicator(){
  dom.indicator.style.transform =  "scaleX(" + tabsData[tabsViews.currentTab].width + ")";
  dom.indicatorHelper.style.transform = "translateX("+ tabsData[tabsViews.currentTab].marginLeft +"px)";
}

// Evento cuando pulsamos una pestaña
function touchTab(event){

  /* Comprobar que:
      - No estamos desplazando la vista
      - Hemos pulsado una pestaña
      - La pestaña que pulsamos no es la actual
  */
  if( tabsViews.sliding || event.target.className !== 'tab-link' || tabsViews.currentTab === parseInt(event.target.getAttribute('data-id')) ){ return; }

  /* Fijamos la transición
    Desmarcamos la pestaña actual
    Elegimos nueva pestaña
  */
  setTransition();
  dom.tabsLinkArray[tabsViews.currentTab].classList.remove('active');
  tabsViews.currentTab = parseInt(event.target.getAttribute('data-id'));

  manageTabs(tabsViews.currentTab);

  // Animamos la vista elegida, marcamos la pestaña activa y movemos el indicador
  dom.tabs.style.transform = "translateX(" + tabsData[ tabsViews.currentTab ].translatePX + "px)";
  dom.tabsLinkArray[tabsViews.currentTab].classList.add('active');
  updateIndicator();
  
}

/**
 * Control tab is visible.
 * @param {number} numTab 
 */

function manageTabs( numTab ){

  if( tabsScroll.equalTabs ){ return; }

  tabsScroll.tabManaged = numTab;

  cancelAnimationFrame(tabsScroll.requestAnimationFrameReference);

  if ( tabDesaparecePorLaIzquierda(numTab) ){
    tabsScroll.requestAnimationFrameReference = requestAnimationFrame( decreaseScroll );
  }else if( tabDesaparecePorLaDerecha(numTab) ){
    tabsScroll.requestAnimationFrameReference = requestAnimationFrame( increaseScroll );
  }

  if( numTab > 0 && tabDesaparecePorLaIzquierda( numTab-1 ) ){

    cancelAnimationFrame(tabsScroll.requestAnimationFrameReference)
    tabsScroll.tabManaged = numTab-1;

    tabsScroll.requestAnimationFrameReference = requestAnimationFrame( decreaseScroll );
    
  }else if( numTab < tabsData.length-1 && tabDesaparecePorLaDerecha( numTab+1 ) ){

    cancelAnimationFrame(tabsScroll.requestAnimationFrameReference)
    tabsScroll.tabManaged = numTab+1;

    tabsScroll.requestAnimationFrameReference = requestAnimationFrame( increaseScroll );
  }
}

/**
 * Left border of screen cuts tab 
 * @param {number} numTab 
 * @return {boolean} 
 */
function tabDesaparecePorLaIzquierda( numTab ){
  return tabsData[ numTab ].left < dom.tabsLink.scrollLeft;
}

/**
 * Right border of screen cuts tab 
 * @param {number} numTab 
 * @return {boolean} 
 */
function tabDesaparecePorLaDerecha( numTab ){
  return dom.tabsLink.clientWidth+dom.tabsLink.scrollLeft < tabsData[ numTab ].right
}

// Levantamos el dedo
function touchUp(event) {
  
  /**
   * Comprobamos que:
   * - El dedo se haya movido ( fijamos la endposition en cada movimiento del dedo )
   * - Nos hemos movido un mínimo de distancia para izquierda o derecha ( Esto es para evitar que cambiemos de vista 
   * sin querer al hacer scroll vertical en una vista )
   */
  if( !touch.endPosition || !( (touch.startPosition > touch.endPosition && touch.startPosition - touch.endPosition >= touch.offset) ||
      (touch.endPosition > touch.startPosition && touch.endPosition - touch.startPosition >= touch.offset) ) ){
        return;
  }

  // Fijamos transiciones
  setTransition();
  // Desmarcamos la pestaña activa
  dom.tabsLinkArray[tabsViews.currentTab].classList.remove('active');
  
  // Nos movemos a hacia una vista de la parte izquierda
  if ( moveToLeftView() ) {

    tabsViews.currentTab--;
    dom.tabs.style.transform = "translateX(" + tabsData[ tabsViews.currentTab ].translatePX + "px)";
    manageTabs( tabsViews.currentTab );

  // Nos movemos a hacia una vista de la parte derecha
  } else if ( moveToRightView() ) {

    //previousTab = tabsData[ tabsViews.currentTab ];
    tabsViews.currentTab++;
    dom.tabs.style.transform = "translateX(" + tabsData[ tabsViews.currentTab ].translatePX + "px)";
    manageTabs( tabsViews.currentTab );
  
  // Si no nos movemos una distancia mínima para cambiar de vista, volvemos a la vista actual
  } else {
    dom.tabs.style.transform = "translateX(" + tabsData[ tabsViews.currentTab ].translatePX + "px)";
  }

  // Marcamos vista actual y movemos el indicador
  dom.tabsLinkArray[tabsViews.currentTab].classList.add('active');
  updateIndicator();
}

/**
 * Animate tabs' scroll when specific tab is not visible
 */
function decreaseScroll( ){
  dom.tabsLink.scrollLeft = dom.tabsLink.scrollLeft - tabsScroll.speed;

  if( tabDesaparecePorLaIzquierda( tabsScroll.tabManaged ) ){
    requestAnimationFrame( decreaseScroll );
  }
}

function increaseScroll( ){
  dom.tabsLink.scrollLeft = dom.tabsLink.scrollLeft + tabsScroll.speed;

  if( tabDesaparecePorLaDerecha( tabsScroll.tabManaged ) ){
    requestAnimationFrame( increaseScroll );
  }
}

// El dedo toca la vista, aquí nos preparamos para mover la vista
function touchDown(event) {
  // Fijamos posición inicial
  touch.startPosition = event.touches[0].clientX;
  touch.endPosition = null;

  // Quitar transiciones para el indicador y las vistas
  dom.indicatorHelper.style.transition = "";
  removeTransition();
}

// El dedo se mueve
function touchMove(event){
  
  /**
   * Fijamos la posición final en cada momento, lo idóneo sería fijar este valor cuando levantes el dedo, pero este valor no existe en
   * el evento al levantar el dedo
   */
  touch.endPosition = event.touches[0].clientX;

  // Comprobamos si podemos ir hacia las vistas de la izquierda
  // y Comprobar si el dedo se mueve para la derecha de la pantalla 
  if ( !leftLimit() && (event.touches[0].clientX > touch.startPosition + touch.offset) ) {
    //Evitamos le scroll sobre la vista mientras cambiamos de vista
    event.preventDefault();

    // Actualizamos la posición translación de la vista y del indicador según el movimiento del dedo
    touch.move = event.touches[0].clientX - touch.offset - touch.startPosition;
    dom.tabs.style.transform = "translateX(" + Math.floor(tabsData[ tabsViews.currentTab ].translatePX + touch.move) + "px)";
    dom.indicatorHelper.style.transform = "translateX("+ Math.floor(tabsData[tabsViews.currentTab].marginLeft - (touch.move*tabsData[ tabsViews.currentTab ].previousTabScreenRatio) )+"px)";

    // Comprobamos si podemos ir hacia las vistas de la derecha
    // y si el dedo se mueve para la izquierda de la pantalla 
  } else if ( !rightLimit() && ( event.touches[0].clientX < touch.startPosition - touch.offset ) ) {
    
    //Evitamos le scroll sobre la vista mientras cambiamos de vista
    event.preventDefault();

    // Actualizamos la posición translación de la vista y del indicador según el movimiento del dedo
    touch.move = touch.startPosition - event.touches[0].clientX - touch.offset;
    dom.tabs.style.transform = "translateX(" + Math.floor(tabsData[ tabsViews.currentTab ].translatePX - touch.move) + "px)";
    dom.indicatorHelper.style.transform = "translateX("+ Math.floor(tabsData[tabsViews.currentTab].marginLeft + (touch.move*tabsData[ tabsViews.currentTab+1 ].previousTabScreenRatio) )+"px)";

  }

}

/**
 * Set transitions
 */
function setTransition(){
  dom.indicatorHelper.style.transition = "transform 0.3s";
  dom.tabs.style.transition = "transform 0.3s";
  dom.indicator.style.transition = "transform 0.3s";
}

/**
 * Remove transitions
 */
function removeTransition(){
  dom.indicatorHelper.style.transition = "";
  dom.tabs.style.transition = "";
  dom.indicator.style.transition = "";
}

/**
 * Check if current tab is the first one
 * @return {boolean}
 */
function leftLimit(){
  return tabsData[ tabsViews.currentTab ].translatePX === tabsViews.startTranslate;
}

/**
 * Check if current tab is the last one
 * @return {boolean}
 */
function rightLimit(){
  return tabsData[ tabsViews.currentTab ].translatePX === tabsViews.endTranslate;
}

function moveToRightView(){
  return !rightLimit() && 
    touch.startPosition > touch.endPosition &&
    touch.startPosition - touch.endPosition > tabsViews.distanceToChangeView;
}

function moveToLeftView(){
  return !leftLimit() &&
    touch.endPosition > touch.startPosition &&
    touch.endPosition - touch.startPosition > tabsViews.distanceToChangeView;
}

}
