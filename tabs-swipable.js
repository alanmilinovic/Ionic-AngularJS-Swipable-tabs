angular.module('ionic')
.directive('tabsSwipable', ['$ionicGesture', function ($ionicGesture) {
    return {
        restrict: 'A',
        require: 'ionTabs',
        link: function (scope, elm, attrs, tabsCtrl) {
            var swipeGesture = {};
            var swipeLoop = false;
            var disableSwipe = false;
            if (attrs.tabsSwipableLoop != undefined) {
                if (["true", "false"].indexOf(attrs.tabsSwipableLoop) == -1) {
                    console.error("tabsSwipable: tabsSwipableLoop value should be true or false, '" + attrs.tabsSwipableLoop + "' is given.");
                }
                else {
                    swipeLoop = (attrs.tabsSwipableLoop == "true");
                }
            }

            var onSwipeEnd = function (event) {
                var tabsHidden = document.querySelector("[tabs-swipable].tabs-item-hide");

                if (tabsHidden == null && !disableSwipe) {
                    document.contains(document.getElementById('ionTabsAnimatedStyle')) && document.getElementById('ionTabsAnimatedStyle').remove();
                    for (var i = 0; i < tabsCtrl.tabs.length; i++) {
                        ionView = angular.element(document.querySelector("ion-nav-view[name='" + tabsCtrl.tabs[i].navViewName + "']"));
                        ionView.css({ 'left': 'initial' })
                        if (i != tabsCtrl.selectedIndex()) {
                            ionView.attr("nav-view", "cached");
                        }
                    }
                    if ((event.gesture.distance > window.screen.width / 1.6) || (event.gesture.distance / (event.gesture.timeStamp - event.gesture.startEvent.timeStamp) > 0.1)
                    ) {
                        var nextTarget = tabsCtrl.selectedIndex();
                        event.gesture.direction == "right" && (nextTarget--);
                        event.gesture.direction == "left" && (nextTarget++);
                        if (nextTarget >= 0 && nextTarget < tabsCtrl.tabs.length) {
                            nextTarget != tabsCtrl.selectedIndex() && (scope.$apply(tabsCtrl.select(nextTarget)));
                        }
                        else if (swipeLoop) {
                            if (nextTarget == -1) {
                                nextTarget != tabsCtrl.selectedIndex() && (scope.$apply(tabsCtrl.select(tabsCtrl.tabs.length - 1)));
                            }
                            else if (nextTarget == tabsCtrl.tabs.length) {
                                nextTarget != tabsCtrl.selectedIndex() && (scope.$apply(tabsCtrl.select(0)));
                            }
                        }
                    }
                }
            };

            var onSwipe = function (event) {
                var target = nextTarget = tabsCtrl.selectedIndex();
                var ionTabView = angular.element(document.querySelector("ion-nav-view[name='" + tabsCtrl.tabs[target].navViewName + "']"));
                var nextIonNavView = null;

                var tabsHidden = document.querySelector("[tabs-swipable].tabs-item-hide");
                var activeTab = document.querySelector("[tabs-swipable] .tabs .tab-item.tab-item-active");

                if (tabsHidden == null && !disableSwipe) {
                    var activeTabWidth = activeTab.offsetWidth;
                    var styleTag = document.getElementById('ionTabsAnimatedStyle') || document.createElement("style");

                    styleTag.setAttribute("id", 'ionTabsAnimatedStyle');
                    styleTag.innerHTML = ".tab-item-active::after{position: absolute;width: " + activeTabWidth + "px;}";
                    styleTag.innerHTML += ".tab-item-active::after{transform: translateX( " + (-event.gesture.deltaX / 5) + "px);}"
                    if (target < 0) { return; }

                    event.gesture.direction == "right" && (nextTarget--);
                    event.gesture.direction == "left" && (nextTarget++);
                    if (nextTarget >= 0 && nextTarget < tabsCtrl.tabs.length) {
                        nextIonNavView = angular.element(document.querySelector("ion-nav-view[name='" + tabsCtrl.tabs[nextTarget].navViewName + "']"));
                    }
                    else if (swipeLoop) {
                        if (nextTarget == -1) {
                            nextIonNavView = angular.element(document.querySelector("ion-nav-view[name='" + tabsCtrl.tabs[tabsCtrl.tabs.length - 1].navViewName + "']"));
                        }
                        else if (nextTarget == tabsCtrl.tabs.length) {
                            nextIonNavView = angular.element(document.querySelector("ion-nav-view[name='" + tabsCtrl.tabs[0].navViewName + "']"));
                        }
                    }

                    if (swipeLoop || (event.gesture.direction == "right" && nextTarget >= 0) || (event.gesture.direction == "left" && nextTarget < tabsCtrl.tabs.length)) {
                        var style = {};
                        style["left"] = (event.gesture.deltaX) + "px";
                        ionTabView.css(style);

                        event.gesture.direction == "left" && (style["left"] = (window.screen.width + event.gesture.deltaX) + "px");
                        event.gesture.direction == "right" && (style["left"] = (event.gesture.deltaX - window.screen.width) + "px");

                        nextIonNavView.attr("nav-view", "active");
                        nextIonNavView.css(style);
                        document.getElementsByTagName('head')[0].append(styleTag);
                    }
                }
            };

            var onTouch = function (event) {
                disableSwipe = false;

                var sideMenuEdgeDragThreshold = document.querySelector("[edge-drag-threshold]");
                if (sideMenuEdgeDragThreshold) {
                    var sideMenuEdgeDragThresholdValue = sideMenuEdgeDragThreshold.getAttribute("edge-drag-threshold");
                    if (sideMenuEdgeDragThresholdValue) {
                        if (event.touches) {
                            if (event.touches.length > 0) {
                                if (event.touches[0].clientX <= sideMenuEdgeDragThresholdValue) {
                                    disableSwipe = true;
                                }
                            }
                        }
                    }
                }
            };

            swipeGesture.touchstart = $ionicGesture.on('mousedown touchstart', onTouch, elm);
            swipeGesture.drag = $ionicGesture.on('drag', onSwipe, elm);
            swipeGesture.dragend = $ionicGesture.on('dragend', onSwipeEnd, elm);

            scope.$on('$destroy', function () {
                $ionicGesture.off(swipeGesture.touchstart, 'mousedown touchstart', onTouch);
                $ionicGesture.off(swipeGesture.drag, 'drag', onSwipe);
                $ionicGesture.off(swipeGesture.dragend, 'dragend', onSwipeEnd);
            });
        }
    };
}]);
