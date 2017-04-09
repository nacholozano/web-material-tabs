// Code goes here
(function(window){

window.onload = function() {

var startPosition = null,
  endPosition = null,
  tabsContainer = document.getElementById('tabs-container'),
  tabs = document.getElementById('tabs-move'),
  numTabs = tabs.getElementsByClassName('tab').length - 1,
  tabsLink = document.getElementsByClassName('tabs-link')[0],
  tabsLinkArray = document.getElementsByClassName('tab-link'),
  startTranslate = 0,
  endTranslate = -100 * numTabs,
  currentTranslate = startTranslate,
  sliding = false,
  distanceToChangeView = 100,
  touchOffset = 50,
  currentTab = 0;

[].forEach.call( tabsLinkArray, function(element, index) {
  element.setAttribute('data-id', index);
} );

tabsLinkArray[currentTab].classList.add('active');

tabs.addEventListener('touchend', mouseUp);
tabs.addEventListener('touchstart', mouseDown);
tabs.addEventListener('touchmove', mouseMove);
tabsLink.addEventListener('click', tabLink);

function tabLink(event){
  setTransition();
  tabsLinkArray[currentTab].classList.remove('active');
  currentTab = event.target.getAttribute('data-id');
  currentTranslate = currentTab*-100;
  setTranslationPercen( currentTranslate );
  tabsLinkArray[currentTab].classList.add('active');
}

function mouseUp(event) {
  
  sliding = false;
  
  setTransition();
  tabsLinkArray[currentTab].classList.remove('active');
  
  if ( moveToLeftView() ) {
    currentTab--;
    calcTranslation();
    setTranslationPercen( currentTranslate );
    
    var currentTabLeftDistance = tabsLinkArray[ currentTab ].getBoundingClientRect().left;

    if( currentTabLeftDistance < 0 ){
      tabsLink.scrollLeft = tabsLink.scrollLeft + currentTabLeftDistance;
    }

  } else if ( moveToRightView() ) {
    currentTab++;
    calcTranslation();
    setTranslationPercen( currentTranslate );

    var currentTabRightDistance = tabsLinkArray[ currentTab ].getBoundingClientRect().right;

    if( tabsLink.clientWidth < currentTabRightDistance ){
      tabsLink.scrollLeft = tabsLink.scrollLeft + currentTabRightDistance - tabsLink.clientWidth;
    }
    
  } else if ( leftLimit() ) {
    setTranslationPercen( startTranslate );
    
  } else if ( rightLimit() ) {
    setTranslationPercen( endTranslate );
    
  } else {
    setTranslationPercen( currentTranslate );
  }
  
  tabsLinkArray[currentTab].classList.add('active');

}

function mouseDown(event) {
  sliding = true;
  startPosition = event.touches[0].clientX;
}

function mouseMove(event){
  
  if (!sliding) {
    return;
  }
  endPosition = event.touches[0].clientX;

  removeTransition();

  if ( toRight( event ) ) {
    setTranslation( "calc( " + (event.touches[0].clientX - touchOffset - startPosition) + "px + " + currentTranslate + "% )" );
  } else if ( toLeft( event ) ) {
    setTranslation( "calc( " + currentTranslate + "% - " + (startPosition - event.touches[0].clientX - touchOffset) + "px)" );
  }
}

function setTranslation( translation ){
  tabs.style.transform = "translateX(" + translation + ")";
}

function setTranslationPercen( translation ){
  setTranslation( translation+'%' );
}

function setTransition(){
  tabs.style.transition = "transform 0.2s ease-out";
}

function removeTransition(){
  tabs.style.transition = "";
}

function toLeft(event){
  return event.touches[0].clientX < startPosition - touchOffset;
}

function toRight(event){
  return event.touches[0].clientX > startPosition + touchOffset;
}

function leftLimit(){
  return currentTranslate === startTranslate;
}

function rightLimit(){
  return currentTranslate === endTranslate;
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

function calcTranslation(){
  currentTranslate = currentTab * -100;
}

}

})(window);