window.onload = function() {

var throttleTime = 300,
  throttleTimeOut = null,
  dom = {
    tabsContainer: document.getElementsByClassName('tabs-container')[0],
    tabsMoveContainer: document.getElementsByClassName('tabs-move-container')[0],
    tabsMove: document.getElementsByClassName('tabs-move')[0],
    tabsLink: document.getElementsByClassName('tabs-link')[0],
    tabsLinkArray: document.getElementsByClassName('tab-link'),
    tabsArray: document.getElementsByClassName('tab'),
    indicator: document.getElementsByClassName('indicator')[0],
    indicatorHelper: document.getElementsByClassName('indicator-helper')[0],
    //tabLoader: document.getElementsByClassName('tab-loader')[0],
    tabReloader: document.getElementsByClassName('tab-reloader')[0],
    tabReloaderContainer: document.getElementsByClassName('tab-reloader-container')[0],
    tabReloaderIcon: document.getElementsByClassName('tab-reloader-icon')[0]
  },
  touch = {
    startPosition: null, // Position when user touch screen
    endPosition: null, // Position when user stop touching the screen 
    move: null, // Distance traversed 
    offset: 40 // Minimum distance before start to slide views
  },
  tabsScroll = {
    speed: 10, // Scroll speed if tab is not fully visible
    requestAnimationFrameReference: null, // Reference to cancel raf
    tabManaged: null, // Checking if this tab is fully visible
    equalTabs: false, // All tabs have equal width
    equalWdith: null
  },
  tabsViews = {
    containerWdith: null,
    startTranslate: 0, // First view translation
    endTranslate: null, // Last view translation
    sliding: false, // Know if user is changing view
    distanceToChangeViewScreenRatio: 2.3,
    distanceToChangeView: null, // Minumum distance to change view
    currentTab: 0
  }
  requestForTab = {
    2: {
      received: false,
      url: 'https://jsonplaceholder.typicode.com/posts/1',
      success: function( data ){
        dom.tabsArray[2].innerText = data.body + data.body + data.body + 
          data.body + data.body + data.body +
          data.body + data.body + data.body +
          data.body + data.body + data.body + 
          data.body + data.body + data.body + 
          data.body + data.body + data.body + 
          data.body + data.body + data.body + 
          data.body + data.body + data.body;
      },
      error: function( data ){
        dom.tabsArray[2].innerText = 'Error Loading data.';
      }
    },
    3: {
      received: false,
      url: 'https://jsonplaceholder.typicode.com/posts/200000000',
      success: function( data ){
        dom.tabsArray[3].innerText = data.body;
      },
      error: function( data ){
        dom.tabsArray[3].innerText = 'Error Loading data. Continue reading next tab if you want to know what lorem ipsum say.';
      }
    } 
  },
  state = {
    refreshing: false,
    sliding: false
  },
  refresh = {
    startPoint: null,
    currentPoint: null
  }
  tabsData = [];

initialize();

/**
 * Events
 */
dom.tabsMoveContainer.addEventListener('touchstart', touchDown);
dom.tabsMoveContainer.addEventListener('touchmove', touchMove);
dom.tabsMoveContainer.addEventListener('touchend', touchUp);
dom.tabsMove.addEventListener("transitionend", transitionend);
dom.tabsLink.addEventListener('click', touchTab);

dom.tabsContainer.addEventListener('touchstart', startRefresh);
dom.tabsContainer.addEventListener('touchmove', moveRefresh);
dom.tabsContainer.addEventListener('touchend', finishRefresh);

window.addEventListener('resize', onResize);
document.getElementById('button-change-tab').addEventListener('click', function(){
  changeTab(1);
});

function startRefresh(e){
    dom.tabReloaderContainer.style.transition = "";
    dom.tabReloaderIcon.style.transition = "";
}
function finishRefresh(e){

  if( refresh.currentPoint > 90 ){
    requestForTab[tabsViews.currentTab].received = false;
    loadTabData( tabsViews.currentTab );
  }

  dom.tabReloaderContainer.style.transition = "transform 0.3s";
  dom.tabReloaderIcon.style.transition = "transform 0.3s";

  dom.tabReloaderContainer.style.transform = "translateY(0px)";
  dom.tabReloaderIcon.style.transform = "rotate(0deg)";
  dom.tabReloaderIcon.classList.remove('ready-for-reload');

  refresh.currentPoint = null;
  refresh.startPoint = null;
  state.refreshing = false;
}
function moveRefresh(e){

  if( !requestForTab[ tabsViews.currentTab ] || state.sliding ){
    return;
  }

  if( state.refreshing ){
    e.preventDefault();
  }

  if( dom.tabsArray[ tabsViews.currentTab ].scrollTop === 0 ){
    if( !refresh.startPoint ){
      refresh.startPoint = e.touches[0].clientY;
    }

    if( e.touches[0].clientY-refresh.startPoint <= 180 + touch.offset && 
        e.touches[0].clientY > refresh.startPoint + touch.offset ){

      e.preventDefault();
      state.refreshing = true;

      refresh.currentPoint = Math.floor(e.touches[0].clientY-refresh.startPoint - touch.offset);

      dom.tabReloaderContainer.style.transform = "translateY("+refresh.currentPoint+"px)";
      dom.tabReloaderIcon.style.transform = "rotate("+refresh.currentPoint*2+"deg)";

      if( refresh.currentPoint > 90 ){
        dom.tabReloaderIcon.classList.add('ready-for-reload');
      }else{
        dom.tabReloaderIcon.classList.remove('ready-for-reload');
      }

    }else{
      state.refreshing = false;
    }
  }else{
    refresh.startPoint = null;
    state.refreshing = false;
  }
}

/**
 * User touch the screen.
 * @param {object} event 
 */
function touchDown(event) {
  touch.startPosition = event.touches[0].clientX;
  touch.endPosition = null;
  removeTransition();
}

/**
 * User move the finger.
 * @param {object} event 
 */
function touchMove(event){
  
  if( state.refreshing ){
    return;
  }

  /**
   * 'touchend' would be the right event to set this variable. But it does not have 'clientX' property
   */
  touch.endPosition = event.touches[0].clientX;
 
  if ( !leftLimit() && (event.touches[0].clientX > touch.startPosition + touch.offset) ) {
    /**
     * Avoid view's scroll while sliding
     */
    event.preventDefault();
    state.sliding = true;

    touch.move = event.touches[0].clientX - touch.offset - touch.startPosition;
    dom.tabsMove.style.transform = "translateX(" + Math.floor(tabsData[ tabsViews.currentTab ].translatePX + touch.move) + "px)";
    dom.indicatorHelper.style.transform = "translateX("+ Math.floor(tabsData[tabsViews.currentTab].marginLeft - (touch.move*tabsData[ tabsViews.currentTab ].previousTabScreenRatio) )+"px)";

  } else if ( !rightLimit() && ( event.touches[0].clientX < touch.startPosition - touch.offset ) ) {
    event.preventDefault();
    state.sliding = true;

    touch.move = touch.startPosition - event.touches[0].clientX - touch.offset;
    dom.tabsMove.style.transform = "translateX(" + Math.floor(tabsData[ tabsViews.currentTab ].translatePX - touch.move) + "px)";
    dom.indicatorHelper.style.transform = "translateX("+ Math.floor(tabsData[tabsViews.currentTab].marginLeft + (touch.move*tabsData[ tabsViews.currentTab+1 ].previousTabScreenRatio) )+"px)";

  }

}

/**
 * User stop touching the screen.
 * @param {object} event 
 */
function touchUp(event) {
  
  /**
   * - User's finger has change position
   * - Enough distance has been traversed to change view
   */
  if( !touch.endPosition || 
     !( (touch.startPosition > touch.endPosition && 
        touch.startPosition - touch.endPosition >= touch.offset) ||
        (touch.endPosition > touch.startPosition && 
        touch.endPosition - touch.startPosition >= touch.offset) 
      ) ){
    return;
  }

  setTransition();
  dom.tabsLinkArray[tabsViews.currentTab].classList.remove('active');
  
  /**
   * See previous tab
   */
  if ( moveToLeftView() ) {
    tabsViews.currentTab--;
    dom.tabsMove.style.transform = "translateX(" + tabsData[ tabsViews.currentTab ].translatePX + "px)";
    manageTabs( tabsViews.currentTab );
    
  /**
   * See next tab
   */
  } else if ( moveToRightView() ) {
    tabsViews.currentTab++;
    dom.tabsMove.style.transform = "translateX(" + tabsData[ tabsViews.currentTab ].translatePX + "px)";
    manageTabs( tabsViews.currentTab );
    
  /**
   * Touch move is not enough to change view. Return to current tab.
   */
  } else {
    dom.tabsMove.style.transform = "translateX(" + tabsData[ tabsViews.currentTab ].translatePX + "px)";
  }

  dom.tabsLinkArray[tabsViews.currentTab].classList.add('active');
  updateIndicator();
  state.sliding = false;
}

/**
 * User tap a tab.
 * @param {object} event 
 */
function touchTab(event){

  if( event.target.className !== 'tab-link' ){ return; }

  changeTab( parseInt(event.target.getAttribute('data-id')) );
}

/**
 * Open tab programatically
 * @param {number} numTab 
 */
function changeTab( numTab ){

  if ( numTab !== 0 && !numTab || 
       tabsViews.currentTab === numTab ||
       tabsViews.sliding ){ return; }

  setTransition();
  dom.tabsLinkArray[ tabsViews.currentTab ].classList.remove('active');
  tabsViews.currentTab = numTab;
  manageTabs(tabsViews.currentTab);

  dom.tabsMove.style.transform = "translateX(" + tabsData[ tabsViews.currentTab ].translatePX + "px)";
  dom.tabsLinkArray[tabsViews.currentTab].classList.add('active');
  updateIndicator();
}

/**
 * Recalculate data on screen orientation change
 */
function onResize(){
  clearTimeout(throttleTimeOut);
  throttleTimeOut = setTimeout(function() {
      initialize();
      manageTabs( tabsViews.currentTab );
  }, throttleTime);
}

/**
 * Initialize data
 */
function initialize(){

  tabsViews.containerWdith = dom.tabsContainer.clientWidth;
  tabsViews.distanceToChangeView = tabsViews.containerWdith/tabsViews.distanceToChangeViewScreenRatio;
  
  if( tabsScroll.equalTabs ){
    tabsScroll.equalWdith = 100 / dom.tabsLinkArray.length;
     if( !dom.tabsLink.classList.contains('equal-tabs') ){
      dom.tabsLink.classList.add('equal-tabs');
    }
  }else{
    dom.tabsLink.style.overflowX = 'auto';
  }

  tabsData = [];
  [].forEach.call( dom.tabsLinkArray, setData);
  tabsViews.endTranslate = tabsData[ tabsData.length-1 ].translatePX;

  dom.tabsMove.style.transform = "translateX(" + tabsData[ tabsViews.currentTab ].translatePX + "px)";
  updateIndicator();
}

/**
 * Set data for each tab.
 * @param {object} element 
 * @param {number} index 
 */
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

/**
 * Change width and position of indicator.
 */ 
function updateIndicator(){
  dom.indicator.style.transform =  "scaleX(" + tabsData[tabsViews.currentTab].width + ")";
  dom.indicatorHelper.style.transform = "translateX("+ tabsData[tabsViews.currentTab].marginLeft +"px)";
}

/**
 * Control tab is visible.
 * @param {number} numTab 
 */
function manageTabs( numTab ){

  //alert('managetabs');

  if( tabsScroll.equalTabs ){ return; }

  tabsScroll.tabManaged = numTab;

  cancelAnimationFrame(tabsScroll.requestAnimationFrameReference);

  if ( tabHideLeftPart(numTab) ){
    tabsScroll.requestAnimationFrameReference = requestAnimationFrame( decreaseScroll );
  }else if( tabHideRigthPart(numTab) ){
    tabsScroll.requestAnimationFrameReference = requestAnimationFrame( increaseScroll );
  }

  if( numTab > 0 && tabHideLeftPart( numTab-1 ) ){

    cancelAnimationFrame(tabsScroll.requestAnimationFrameReference)
    tabsScroll.tabManaged = numTab-1;

    tabsScroll.requestAnimationFrameReference = requestAnimationFrame( decreaseScroll );
    
  }else if( numTab < tabsData.length-1 && tabHideRigthPart( numTab+1 ) ){

    cancelAnimationFrame(tabsScroll.requestAnimationFrameReference)
    tabsScroll.tabManaged = numTab+1;

    tabsScroll.requestAnimationFrameReference = requestAnimationFrame( increaseScroll );
  }
}

/**
 * Left border of screen cuts tab.
 * @param {number} numTab 
 * @return {boolean} 
 */
function tabHideLeftPart( numTab ){
  return tabsData[ numTab ].left < dom.tabsLink.scrollLeft;
}

/**
 * Right border of screen cuts tab.
 * @param {number} numTab 
 * @return {boolean} 
 */
function tabHideRigthPart( numTab ){
  return dom.tabsLink.clientWidth+dom.tabsLink.scrollLeft < tabsData[ numTab ].right
}

/**
 * Animate tabs' scroll and make the tab visible.
 */
function decreaseScroll( ){
  dom.tabsLink.scrollLeft = dom.tabsLink.scrollLeft - tabsScroll.speed;

  if( tabHideLeftPart( tabsScroll.tabManaged ) ){
    requestAnimationFrame( decreaseScroll );
  }
}

function increaseScroll( ){
  dom.tabsLink.scrollLeft = dom.tabsLink.scrollLeft + tabsScroll.speed;

  if( tabHideRigthPart( tabsScroll.tabManaged ) ){
    requestAnimationFrame( increaseScroll );
  }
}

/**
 * Set transitions.
 */
function setTransition(){
  dom.indicatorHelper.style.transition = "transform 0.3s";
  dom.tabsMove.style.transition = "transform 0.3s";
  dom.indicator.style.transition = "transform 0.3s";
}

/**
 * Remove transitions.
 */
function removeTransition(){
  dom.indicatorHelper.style.transition = "";
  dom.tabsMove.style.transition = "";
  dom.indicator.style.transition = "";
}

/**
 * Check if current tab is the first one.
 * @return {boolean}
 */
function leftLimit(){
  return tabsData[ tabsViews.currentTab ].translatePX === tabsViews.startTranslate;
}

/**
 * Check if current tab is the last one.
 * @return {boolean}
 */
function rightLimit(){
  return tabsData[ tabsViews.currentTab ].translatePX === tabsViews.endTranslate;
}

/**
 * User want see next view.
 * @return {boolean}
 */
function moveToRightView(){
  return !rightLimit() && 
    touch.startPosition > touch.endPosition &&
    touch.startPosition - touch.endPosition > tabsViews.distanceToChangeView;
}

/**
 * User want see previous view.
 * @return {boolean}
 */
function moveToLeftView(){
  return !leftLimit() &&
    touch.endPosition > touch.startPosition &&
    touch.endPosition - touch.startPosition > tabsViews.distanceToChangeView;
}

/**
 * Run code when transition between views has finished
 * @param {object} event 
 */
function transitionend(event) {
  loadTabData( tabsViews.currentTab );
}

/**
 * Load tab data if tab is empty
 * @param {number} numTab 
 */
function loadTabData( numTab ){
  if( !requestForTab[numTab] || requestForTab[numTab].received ){ return; }
   
  //dom.tabLoader.classList.remove('tab-loader-hide');
  dom.tabReloaderContainer.style.transition = "transform 0.3s";
  dom.tabReloaderContainer.classList.add('reloading');

  setTimeout(function(){
    makeTestRequest( numTab );
  }, 1000);
}

/**
 * Request fake data
 * @param {number} numTab 
 */
function makeTestRequest( numTab ){
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState === 4) {

      if( this.status === 200 && requestForTab[numTab].success ){
        requestForTab[numTab].success( JSON.parse(this.responseText) );

      }else if( requestForTab[numTab].error ){
        requestForTab[numTab].error( JSON.parse(this.responseText) );
      }

      //dom.tabLoader.classList.add('tab-loader-hide');
      dom.tabReloaderContainer.classList.remove('reloading');
      //dom.tabReloaderContainer.style.transition = "";
      requestForTab[numTab].received = true;
    }
  };
  xhttp.open("GET", requestForTab[numTab].url, true);
  xhttp.send();  
}

}