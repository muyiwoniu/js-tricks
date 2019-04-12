var my2048,
    rows = 4, //设置游戏行数
    cols = 4, //设置游戏列数
    squareWidth = 60, //设置方块边长
    spacing = 12, //设置间隙大小
    boardSet = [], //初始面板方块集合
    squareSet = [], //带数字的小方块集合
    valueMap = [], //每个位置的方块的值
    colorMapping = {
        "0": "#ccc0b3",
        "2": "#eee4da",
        "4": "#ede0c8",
        "8": "#f2b179",
        "16": "#f59563",
        "32": "#f67e5f",
        "64": "#f65e3b",
        "128": "#edcf72",
        "256": "#edcc61",
        "512": "#9c0",
        "1024": "#33b5e5",
        "2048": "#09c"
    }, //每种数字的颜色
    directionEnum = {
        left: {
            key: "left"
        },
        right: {
            key: "left"
        },
        top: {
            key: "top"
        },
        down: {
            key: "top"
        }
    }, //方向枚举
    lock = true,
    isChange = false;

function move(direction) {
    if (isOver()) { //判断游戏是否已经结束
        alert("game over ~!");
        return;
    }
    var newSquareSet = analysisActions(direction); //根据按的方向键来推算新的方块位置
    //收尾(保证最终一致性)
    setTimeout(function () {
        refresh(newSquareSet); //根据算好的新的位置进行重绘
        if (isChange) { //判断是否产生变化
            randGenerateSquare(); //如果这次操作是有变化的，那么生成一个方块
        }
        lock = true; //解锁
        isChange = false; //将变化标记重置为false
    }, 300);
}

function analysisActions(direction) {
    var newSquareSet = generateNullMap(); //方块的新位置
    if (direction == directionEnum.left) { //向左
        for (var i = 0; i < squareSet.length; i++) { //按行遍历
            var temp = [];
            for (var j = 0; j < squareSet[i].length; j++) { //将每一行放入一个数组中
                if (squareSet[i][j] != null) {
                    temp.push(squareSet[i][j]);
                }
            }
            temp = getNewLocation(temp); //获取运动之后的新位置
            for (var k = 0; k < newSquareSet[i].length; k++) { //将新的位置依次赋值给新的集合
                if (temp[k]) {
                    newSquareSet[i][k] = temp[k];
                }
            }
        }
    } else if (direction == directionEnum.right) { //向右
        for (var i = 0; i < squareSet.length; i++) {
            var temp = [];
            for (var j = squareSet[i].length - 1; j >= 0; j--) { //向右移动，最右边的是第一个，所以倒着遍历
                if (squareSet[i][j] != null) {
                    temp.push(squareSet[i][j]);
                }
            }
            temp = getNewLocation(temp);
            for (var k = newSquareSet[i].length - 1; k >= 0; k--) {
                if (temp[newSquareSet[i].length - 1 - k]) {
                    newSquareSet[i][k] = temp[newSquareSet[i].length - 1 - k];
                }
            }
        }
    } else if (direction == directionEnum.top) { //向上
        for (var j = 0; j < squareSet[0].length; j++) { //向上移动，每列之间分开来看，所以以列数来进行运算
            var temp = [];
            for (var i = 0; i < squareSet.length; i++) { //首行是第一个元素
                if (squareSet[i][j] != null) {
                    temp.push(squareSet[i][j]);
                }
            }
            temp = getNewLocation(temp);
            for (var k = 0; k < newSquareSet.length; k++) {
                if (temp[k]) {
                    newSquareSet[k][j] = temp[k];
                }
            }
        }
    } else { //向下
        for (var j = 0; j < squareSet[0].length; j++) { //外层循环根据列进行循环
            var temp = [];
            for (var i = squareSet.length - 1; i >= 0; i--) { //内层循环根据行，倒着进行压入数组
                if (squareSet[i][j] != null) {
                    temp.push(squareSet[i][j]);
                }
            }
            temp = getNewLocation(temp);
            for (var k = newSquareSet.length - 1; k >= 0; k--) {
                if (temp[newSquareSet.length - 1 - k]) {
                    newSquareSet[k][j] = temp[newSquareSet.length - 1 - k];
                }
            }
        }
    }
    //动画，将每个方块进行移动，移动到最新计算出的位置
    for (var i = 0; i < newSquareSet.length; i++) {
        for (var j = 0; j < newSquareSet[i].length; j++) {
            if (newSquareSet[i][j] == null) {
                continue;
            }
            newSquareSet[i][j].style.transition = direction.key + " 0.3s"; //移动动画
            newSquareSet[i][j].style.left = (j + 1) * spacing + j * squareWidth + "px"; //j+1个间隙加上j个方块宽度
            newSquareSet[i][j].style.top = (i + 1) * spacing + i * squareWidth + "px";
            if (newSquareSet[i][j].nextSquare) { //存在两个方块叠加的情况
                newSquareSet[i][j].nextSquare.style.transition = direction.key + " 0.3s";
                newSquareSet[i][j].nextSquare.style.left = (j + 1) * spacing + j * squareWidth + "px";
                newSquareSet[i][j].nextSquare.style.top = (i + 1) * spacing + i * squareWidth + "px";
            }
        }
    }
    return newSquareSet;
}

function getNewLocation(arr) { //获取一组方块新的位置
    if (arr.length == 0) {
        return [];
    }
    var temp = [];
    temp.push(arr[0]); //第一个元素一定移动到最边上
    for (var i = 1; i < arr.length; i++) { //依次判断是否与前一元素数值相同
        if (arr[i].num == temp[temp.length - 1].num && (!temp[temp.length - 1].nextSquare || temp[temp.length - 1].nextSquare == null)) { //如果数值相同，且前一元素并无合并过，则进行挂在合并
            temp[temp.length - 1].nextSquare = arr[i];
        } else { //如果数值不同，则直接压入数组
            temp.push(arr[i]);
        }
    }
    return temp;
}

function generateNullMap() { //根据棋盘的宽高，生成一组空的二维数组
    var newValueMap = [];
    for (var i = 0; i < rows; i++) {
        newValueMap[i] = [];
        for (var j = 0; j < cols; j++) {
            newValueMap[i][j] = null;
        }
    }
    return newValueMap;
}

function isOver() { //判断是否结束
    for (var i = 0; i < squareSet.length; i++) {
        for (var j = 0; j < squareSet[i].length; j++) {
            if (squareSet[i][j] == null) { //如果有空位则不结束
                return false;
            }
            if (squareSet[i][j + 1] && squareSet[i][j].num == squareSet[i][j + 1].num || squareSet[i + 1] && squareSet[i + 1][j] && squareSet[i][j].num == squareSet[i + 1][j].num) { //如果无空位，则判断相邻是否有相同数值的
                return false;
            }
        }
    }
    return true;
}

function refresh(newSquareSet) { //纠正位图，保证最终一致性
    squareSet = generateNullMap();
    var newValueMap = generateNullMap();
    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < cols; j++) {
            //新的存在则添加
            if (newSquareSet[i][j]) { //新位图中存在内容
                if (newSquareSet[i][j].nextSquare) { //该位置存在重叠方块
                    var temp = createSquare(newSquareSet[i][j].num * 2, newSquareSet[i][j].offsetLeft, newSquareSet[i][j].offsetTop, i, j);
                    squareSet[i][j] = temp;
                    my2048.append(temp);
                    my2048.removeChild(newSquareSet[i][j].nextSquare);
                    my2048.removeChild(newSquareSet[i][j]);
                } else { //该位置不存在重叠方块
                    var temp = createSquare(newSquareSet[i][j].num, newSquareSet[i][j].offsetLeft, newSquareSet[i][j].offsetTop, i, j);
                    squareSet[i][j] = temp;
                    my2048.append(temp);
                    my2048.removeChild(newSquareSet[i][j]);
                }
                if (valueMap[i][j] != squareSet[i][j].num) { //判断是否有变化
                    isChange = true;
                }
                newValueMap[i][j] = squareSet[i][j].num;
            } else {
                newValueMap[i][j] = 0;
            }
        }
    }
    valueMap = newValueMap;
}

function randSquareNum() {
    return Math.random() >= 0.5 ? 4 : 2; //随机生成小方块为2和4，概率各占50%
}

function randGenerateSquare() { //随机生成小方块
    for (;;) {
        var randRow = Math.floor(Math.random() * rows);
        var randCol = Math.floor(Math.random() * cols);
        if (valueMap[randRow][randCol] == 0) { //如果这个位置上没有方块，则生成，否则进入下一圈循环
            var temp = createSquare(randSquareNum(), randCol * squareWidth + (randCol + 1) * spacing, randRow * squareWidth + (randRow + 1) * spacing, randRow, randCol);
            valueMap[temp.row][temp.col] = temp.num;
            squareSet[temp.row][temp.col] = temp;
            my2048.appendChild(temp);
            return true;
        }
    }
}

function createSquare(value, left, top, row, col) { //创建小方块元素
    var temp = document.createElement("div");
    temp.style.width = squareWidth + "px";
    temp.style.height = squareWidth + "px";
    temp.style.left = left + "px";
    temp.style.top = top + "px";
    temp.style.background = colorMapping[value];
    temp.style.lineHeight = squareWidth + "px";
    temp.style.textAlign = "center";
    temp.style.fontSize = 0.4 * squareWidth + "px";
    temp.num = value;
    temp.row = row;
    temp.col = col;
    if (value > 0) {
        temp.innerHTML = "" + value;
    }
    return temp;
}

function initBoard() { //初始化面板
    my2048 = document.getElementById("my2048");
    my2048.style.width = cols * squareWidth + (cols + 1) * spacing + "px";
    my2048.style.height = rows * squareWidth + (rows + 1) * spacing + "px";
}

function init() {
    //初始化棋盘
    initBoard();
    for (var i = 0; i < rows; i++) {
        boardSet[i] = [];
        valueMap[i] = [];
        squareSet[i] = [];
        for (var j = 0; j < cols; j++) {
            valueMap[i][j] = 0;
            squareSet[i][j] = null;
            boardSet[i][j] = createSquare(0, j * squareWidth + (j + 1) * spacing, i * squareWidth + (i + 1) * spacing, i, j);
            my2048.appendChild(boardSet[i][j]);
        }
    }
    //初始化方块
    randGenerateSquare();
    randGenerateSquare();
    //添加事件
    document.addEventListener("keydown", function (e) {
        if (!lock) return;
        lock = false;
        switch (e.key) {
            case "ArrowUp":
                move(directionEnum.top);
                break;
            case "ArrowDown":
                move(directionEnum.down);
                break;
            case "ArrowLeft":
                move(directionEnum.left);
                break;
            case "ArrowRight":
                move(directionEnum.right);
                break;
            default:
                {
                    lock = true;
                }
        }
    })
}

window.onload = function () {
    init();
}

//添加手机端滑动事件
//返回角度
function GetSlideAngle(dx, dy) {
    return Math.atan2(dy, dx) * 180 / Math.PI;
}

//根据起点和终点返回方向 1：向上，2：向下，3：向左，4：向右,0：未滑动
function GetSlideDirection(startX, startY, endX, endY) {
    var dy = startY - endY;
    var dx = endX - startX;
    var result = 0;

    //如果滑动距离太短
    if (Math.abs(dx) < 2 && Math.abs(dy) < 2) {
        return result;
    }

    var angle = GetSlideAngle(dx, dy);
    if (angle >= -45 && angle < 45) {
        result = 4;
    } else if (angle >= 45 && angle < 135) {
        result = 1;
    } else if (angle >= -135 && angle < -45) {
        result = 2;
    } else if ((angle >= 135 && angle <= 180) || (angle >= -180 && angle < -135)) {
        result = 3;
    }

    return result;
}

//滑动处理
var startX, startY;
document.addEventListener('touchstart', function (e) {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
}, false);
document.addEventListener('touchend', function (e) {
    var endX, endY;
    endX = e.changedTouches[0].clientX;
    endY = e.changedTouches[0].clientY;
    var direction = GetSlideDirection(startX, startY, endX, endY);
    switch (direction) {
        case 0:
            console.log("没滑动");
            break;
        case 1:
            move(directionEnum.top);
            console.log("向上");
            break;
        case 2:
            move(directionEnum.down);
            console.log("向下");
            break;
        case 3:
            move(directionEnum.left);
            console.log("向左");
            break;
        case 4:
            move(directionEnum.right);
            console.log("向右");
            break;
        default:
    }
}, false);
