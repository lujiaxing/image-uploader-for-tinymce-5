; (function (ImgPreview) {
    window.ImgPreview = new ImgPreview();
})(function () {
    this.minZindex = 1;
    this.aPos = [];
    this.images = [];

    this.getStyle = function (obj, attr) {//解决JS兼容问题获取正确的属性值
        return obj.currentStyle ? obj.currentStyle[attr] : getComputedStyle(obj, false)[attr];
    };


    this.detachEvents = function (tar) {
        tar.onmouseover = null;
        tar.onmousedown = null;
        tar.onmouseup = null;
    };

    this.startMove = function (obj, json, callback) {

        var _this = this;

        clearInterval(obj.timer);
        obj.timer = setInterval(function () {
            var isStop = true;
            for (var attr in json) {
                var iCur = 0;
                //判断运动的是不是透明度值
                if (attr == "opacity")
                    iCur = parseInt(parseFloat(_this.getStyle(obj, attr)) * 100);
                else
                    iCur = parseInt(_this.getStyle(obj, attr));

                var ispeed = (json[attr] - iCur) / 8;
                //运动速度如果大于0则向下取整，如果小于0想上取整；
                ispeed = ispeed > 0 ? Math.ceil(ispeed) : Math.floor(ispeed);
                //判断所有运动是否全部完成
                if (iCur != json[attr])
                    isStop = false;

                //运动开始
                if (attr == "opacity") {
                    obj.style.filter = "alpha:(opacity:" + (json[attr] + ispeed) + ")";
                    obj.style.opacity = (json[attr] + ispeed) / 100;
                } else {
                    obj.style[attr] = iCur + ispeed + "px";
                }
            }
            //判断是否全部完成
            if (isStop) {
                clearInterval(obj.timer);
                if (callback)
                    callback();
            }
        }, 30);
    };



    //拖拽
    this.setDrag = function (obj) {

        var _this = this;

        obj.onmouseover = function () {
            obj.style.cursor = "move";
        };

        obj.onmousedown = function (event) {
            var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
            var scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft;
            obj.style.zIndex = _this.minZindex++;
            //当鼠标按下时计算鼠标与拖拽对象的距离
            var disX = event.clientX + scrollLeft - obj.offsetLeft;
            var disY = event.clientY + scrollTop - obj.offsetTop;

            document.onmousemove = function (event) {
                //当鼠标拖动时计算div的位置
                var l = event.clientX - disX + scrollLeft;
                var t = event.clientY - disY + scrollTop;
                obj.style.left = l + "px";
                obj.style.top = t + "px";
                /*for(var i=0;i<aLi.length;i++){
                    aLi[i].className = "";
                    if(obj==aLi[i])continue;//如果是自己则跳过自己不加红色虚线
                    if(_this.colTest(obj,aLi[i])){
                        aLi[i].className = "active";
                    }
                }*/
                for (var i = 0; i < aLi.length; i++) {
                    aLi[i].className = "";
                }
                var oNear = _this.findMin.call(_this, obj);
                if (oNear) {
                    oNear.className = "active";
                }
            };

            document.onmouseup = function () {
                document.onmousemove = null;//当鼠标弹起时移出移动事件
                document.onmouseup = null;//移出up事件，清空内存
                //检测是否普碰上，在交换位置
                var oNear = _this.findMin.call(_this, obj);
                if (oNear) {
                    oNear.className = "";
                    oNear.style.zIndex = _this.minZindex++;
                    obj.style.zIndex = _this.minZindex++;
                    _this.startMove.call(_this, oNear, _this.aPos[obj.index]);
                    _this.startMove.call(_this, obj, _this.aPos[oNear.index]);

                    var oldNear = _this.images[oNear.index],
                        oldCurr = _this.images[obj.index];

                    _this.images[oNear.index] = (/^\[DELETED\]/gi.test(oldCurr) ? '[DELETED] ' : '') + obj.childNodes[0].getAttribute("src");
                    _this.images[obj.index] = (/^\[DELETED\]/gi.test(oldNear) ? '[DELETED] ' : '') + oNear.childNodes[0].getAttribute("src");
                    //交换index
                    oNear.index += obj.index;
                    obj.index = oNear.index - obj.index;
                    oNear.index = oNear.index - obj.index;
                } else {

                    _this.startMove.call(_this, obj, _this.aPos[obj.index]);
                }
            };

            clearInterval(obj.timer);
            return false;//低版本出现禁止符号
        };
    };


    //碰撞检测
    this.colTest = function (obj1, obj2) {
        var t1 = obj1.offsetTop;
        var r1 = obj1.offsetWidth + obj1.offsetLeft;
        var b1 = obj1.offsetHeight + obj1.offsetTop;
        var l1 = obj1.offsetLeft;

        var t2 = obj2.offsetTop;
        var r2 = obj2.offsetWidth + obj2.offsetLeft;
        var b2 = obj2.offsetHeight + obj2.offsetTop;
        var l2 = obj2.offsetLeft;

        if (t1 > b2 || r1 < l2 || b1 < t2 || l1 > r2) {
            return false;
        } else {
            return true;
        }
    };

    //勾股定理求距离
    this.getDis = function (obj1, obj2) {
        var a = obj1.offsetLeft - obj2.offsetLeft;
        var b = obj1.offsetTop - obj2.offsetTop;
        return Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
    };

    //找到距离最近的
    this.findMin = function (obj) {
        var minDis = 999999999;
        var minIndex = -1;
        for (var i = 0; i < aLi.length; i++) {

            if (obj == aLi[i])
                continue;

            if (this.colTest(obj, aLi[i])) {
                var dis = this.getDis(obj, aLi[i]);
                if (dis < minDis) {
                    minDis = dis;
                    minIndex = i;
                }
            }
        }
        if (minIndex == -1) {
            return null;
        } else {
            return aLi[minIndex];
        }
    };

    //获取排列后的图片
    this.getImages = function () {
        return this.images.filter(function (val, ind, arr) {
            return !(/^\[DELETED\]/gi.test(val));
        });
    };

    //初始化并生成可以拖动的图片
    this.init = function (imgs) {
        
        var _this = this;
        window.oUl = document.getElementById("ulImg");

        imgs.forEach(function (val, ind, arr) {
            var newLi = document.createElement("li");
            var newImg = document.createElement("img");
            var newDiv = document.createElement("div");
            newImg.setAttribute("src", val.url);
            newDiv.innerText = (val.name.length > 12 ? "..." : "") + val.name.substr(-12);
            newDiv.style.textAlign = "center";
            newDiv.style.fontSize = "8pt";
            newLi.appendChild(newImg);
            newLi.appendChild(newDiv);
            oUl.appendChild(newLi);


            _this.images.push(val.url);

            newImg.ondblclick = function () {
                var orgiIndex = _this.images.indexOf(val.url);
                _this.images[orgiIndex] = "[DELETED] " + _this.images[orgiIndex];
                newImg.style.opacity = "0.3";
                newDiv.style.textDecoration = "line-through";
                var cover = document.createElement("div");
                cover.setAttribute("style", "font-weight: bold; color: #333; position: absolute; left: 0; top: 0; width:100px; height:90px; z-index: 100; text-align: center; line-height: 90px;");
                cover.innerText = "已删除";
                newLi.appendChild(cover);
                _this.detachEvents(newLi);

                newImg.ondblclick = null;
            };
        });


        setTimeout(function () {
            window.aLi = oUl.getElementsByTagName("li");

            for (var i = 0; i < aLi.length; i++) {
                var t = aLi[i].offsetTop;
                var l = aLi[i].offsetLeft;
                aLi[i].style.top = t + "px";
                aLi[i].style.left = l + "px";
                _this.aPos[i] = { left: l, top: t };
                aLi[i].index = i;
            }
            for (var i = 0; i < aLi.length; i++) {
                aLi[i].style.position = "absolute";
                aLi[i].style.margin = 0;
                _this.setDrag.call(_this, aLi[i]);
            }
        }, 100);
    };

});







