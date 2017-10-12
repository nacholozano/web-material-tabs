# Web Material Tabs

Angular repo --> https://github.com/nacholozano/ionic-shell

Web clone of [Google Material Tabs](https://material.io/guidelines/components/tabs.html). <br>
Made in VanillaJS with requestAnimationFrame and CSS 2D transforms. <br>
Built with Ionic 2 in mind so better test touch events in mobile. <br>
Good performance in Android 5.0-Chrome 57. Same technology that android's WebView. I can't test it on iPhone.<br>

### Table of contents 
1. [Preview](#preview)
2. [Demo](#demo)
3. [Features](#features)
4. [Install & run](#install--run)
5. [Usage](#usage)

# 1. Preview

[GIF] [Working with many tabs and screen orintation change.](http://i.imgur.com/LQjH2uQ.gifv) <br>
[IMG] [Or you can have tabs with same width.](http://i.imgur.com/ZOWYl2v.png) <br>

# 2. Demo

[Web version] [Working demo](http://codepen.io/nacholozano/full/oWgJKo/) <br>
[APK] You can find a quick ionic wrapping in 'demo' folder

# 3. Features

- Swipe to cahnge tab. It works with a fast and short swipe or swiping 1/3 of screen.
- Change tab using the buttons.
- It works with screen orientation change.
- The current and next/previous tab is always visible.
- Load tab data when user changes tab.
- Pull to refresh current tab's data.
- Ninja header.
- Two modes:
    - Many tabs with auto width and scrollable container. (This demo) <br>
    - Few tabs with same with. [See usage](https://github.com/nacholozano/web-google-material-tabs#usage. <br>
                  
# 4. Install & run

1. Install [yarn](https://yarnpkg.com/lang/en/)
2. Run `yarn install` from package.json path.
3. Run `yarn run dev` to start browser-sync server and watch sass files.

# 5. Usage

### Tabs with equal width.
Set `equalTabs = true` and use few tabs. 

### Auto with tabs that allow scroll if you have many tabs.
Set `equalTabs = false` and have all tabs you want.
