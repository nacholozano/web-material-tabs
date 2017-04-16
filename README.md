# Web Google Material Tabs

Web clone of [Google Material Tabs](https://material.io/guidelines/components/tabs.html). <br>
Made in VanillaJS with requestAnimationFrame and CSS 2D transforms. <br>
Built with ionic2 in mind so Better test touch events in mobile. <br>
At the moment is just plain js, not typescript or angular. <br>
Good performance in Android 5.0-Chrome 57. Same technology that android WebView. I Can't test it on iphone.<br>
Thinking of make more native app's behavior with web technologies.

### Table of contents 
1. [Preview](#preview)
2. [Demo](#demo)
3. [Features](#features)
4. [Install & run](#install--run)
5. [Usage](#usage)

# 1. Preview

[Working with many tabs and screen orintation change.](http://i.imgur.com/LQjH2uQ.gifv) <br>
[Or you can have tabs with same width.](http://i.imgur.com/ZOWYl2v.png) <br>

# 2. Demo

[Working demo](http://codepen.io/nacholozano/full/oWgJKo/) <br>

# 3. Features

- Change tab with touch event.
- Change tab in any moment.
- It works with mobile change orientation.
- The current and next/previous tab is always visible.
- Load tab data when tab is the current tab. <br>
  (No request cancellation and not refresh at the moment) 
- Two modes:
    - Many tabs with auto width and scrollable element. <br>
(This demo)
    - Few tabs with same with. <br>
    [See usage](https://github.com/nacholozano/web-google-material-tabs#usage).</a>
                  
# 4. Install & run

1. Install [yarn](https://yarnpkg.com/lang/en/)
2. Run `yarn install` from package.json path.
3. Run `yarn run dev` to start browser-sync server and watch sass files.

# 5. Usage

### Tabs with equal width.
Set `equalTabs = true` and use few tabs. 

### Auto with tabs that allow scroll if you have many tabs.
Set `equalTabs = false` and have all tabs you want.
