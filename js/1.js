/**
 * Created by huise on 2016/12/30.
 */
var WIDTH = 480;                //canvas的宽度
var HEIGHT = 600;               //canvas的高度
var bulletSpeed = 10;           //控制子弹的速度 越大越快
var bulletRate = 3;             //控制子弹多久发射一颗 值越小越快   极限取值是1
var enemy1Speed = 6;            //控制小飞机下落的速度
var enemy2Speed = 4;            //控制中号飞机下落的速度
var enemy3Speed = 2;            //控制大飞机下落的速度
var difficulty = 150;            //控制游戏难度（值越大 生成的敌机越少）

var canvas = document.getElementById('c1');
canvas.width = WIDTH;
canvas.height = HEIGHT;
var ctx = canvas.getContext('2d');

//游戏的5个阶段
var PHASE_READY = 1;            //游戏的准备阶段
var PHASE_LOADING = 2;          //游戏的读取阶段
var PHASE_PLAY = 3;             //游戏运行阶段
var PHASE_PAUSE = 4;            //游戏暂停阶段
var PHASE_GAMEOVER = 5;         //游戏结束阶段
var curPhase = 0;                //游戏当前阶段
var heroLife = 3;               //英雄飞机的数量

/*游戏准备阶段*/
var bgImage = new Image();
bgImage.src = "img/background.png";
var logo = new Image();
logo.src = "img/start.png";

var sky = null;
bgImage.onload = function(){
    curPhase = PHASE_READY;         //当背景图片加载完的时候 进入准备阶段
    sky = new Sky(this);
}
function Sky(bgimg){
    this.x1 = 0;
    this.y1 = 0;
    this.x2 = 0;
    this.y2 = -bgimg.height;
    this.draw = function(){
        ctx.drawImage(bgimg,this.x1,this.y1);
        ctx.drawImage(bgimg,this.x2,this.y2);
    }
    this.move = function(){
        this.y1+=8;                 //控制背景图片下落的速度
        this.y2+=8;
        if(this.y1>=HEIGHT){
            this.y1 = -bgimg.height;
        }
        if(this.y2>=HEIGHT){
            this.y2=-bgimg.height;
        }
    }
}
/*准备阶段 结束*/

/*开始加载阶段*/
var loadingImgs = [];
loadingImgs[0] = new Image();
loadingImgs[0].src = 'img/game_loading1.png';
loadingImgs[1] = new Image();
loadingImgs[1].src = 'img/game_loading2.png';
loadingImgs[2] = new Image();
loadingImgs[2].src = 'img/game_loading3.png';

function Loading(imgs){
    this.index = 0;
    this.x = 0;                     //可有可无
    this.draw = function(){
        ctx.drawImage(imgs[this.index],this.x,HEIGHT-imgs[this.index].height);
    }
    this.moveCount = 0;
    this.move = function(){
        this.moveCount++;       //62毫秒加一次
        if(this.moveCount%3==0){            //62*3 = 186
            this.index++;
        }
        if(this.index>=imgs.length){
            curPhase = PHASE_PLAY;
        }
    }
}
var loading = new Loading(loadingImgs);
canvas.onclick = function(){
    if(curPhase==PHASE_READY){
        curPhase= PHASE_LOADING;
    }
}
/*准备阶段结束*/


/*游戏运行阶段*/
//绘制英雄飞机

var heroImgs = [];
heroImgs[0] = new Image();
heroImgs[0].src = 'img/hero1.png';
heroImgs[1] = new Image();
heroImgs[1].src = 'img/hero2.png';
heroImgs[2] = new Image();
heroImgs[2].src = 'img/hero_blowup_n1.png';
heroImgs[3] = new Image();
heroImgs[3].src = 'img/hero_blowup_n2.png';
heroImgs[4] = new Image();
heroImgs[4].src = 'img/hero_blowup_n3.png';
heroImgs[5] = new Image();
heroImgs[5].src = 'img/hero_blowup_n4.png';

function Hero(imgs){
    this.index = 0;
    this.crashed = false;
    this.width = 99;
    this.height = 124;
    this.canDelete=false;
    this.x = (WIDTH-this.width)/2;
    //console.log(this.x);
    //console.log(this.x);
    this.y = HEIGHT-this.height;
   // console.log(imgs[this.index].height);
    this.draw = function(){
        if( !this.canDelete){
         ctx.drawImage(imgs[this.index],this.x, this.y);
       }
    }
    this.moveCount = 0;             //限制切换图片的速度
    this.move = function(){
        if(this.index==0){
            this.index=1;
        }else if(this.index==1){
            this.index=0;
        }

        this.moveCount++;
        if(this.moveCount%bulletRate ==0){               //设置一个变量 让玩家自己调节多久发射一颗子弹
            this.fire();
        }
        if(this.crashed){
            if(this.index==0||this.index==1){
                this.index=2;
            }else if(this.index>=imgs.length-1){
                this.canDelete=true;
                heroLife--;
                if(heroLife<=0){
                    curPhase=PHASE_GAMEOVER;
                }else{
                    hero = new Hero(heroImgs);
                }
            }else{
                this.index++;
            }
        }
    }
    this.fire = function(){                         //开火
        bulletList.list.push(                       //向bulletList的list当中 压入 Bullet对象
            new Bullet(bulletImg)
        );
    }
}
var  hero = new Hero(heroImgs);
canvas.onmousemove = function(e){
    if(curPhase == PHASE_PLAY){
        var x = e.offsetX;
        var y = e.offsetY;
        hero.x = x- hero.width/2;
        hero.y = y-hero.height/2;
    }
}

//绘制子弹
var bulletImg = new Image();
bulletImg.src = 'img/bullet.png';

function Bullet(img){                   //绘制一颗子弹的方法
    this.width = 9;
    this.height = 21;
    this.crashed = false;
    this.x = hero.x+(hero.width-this.width)/2;
    this.y = hero.y-this.height;
    this.draw = function(){
        ctx.drawImage(img,this.x,this.y);
    }
    this.canDelete = false;
    this.move = function(){
        this.y-= bulletSpeed;

        if(this.y<=-this.height||this.crashed){
            this.canDelete = true;
        }
    }
}
//绘制 子弹列表
function BulletList(){
    this.list = [];
    this.draw = function(){
        for(var i=0;i<this.list.length;i++){
            this.list[i].draw();                    //让每一颗子弹都执行自己的draw()方法
        }
    }
    this.move = function(){
        for(var i=0;i<this.list.length;i++){
            this.list[i].move();
            if(this.list[i].canDelete){
                this.list.splice(i,1);
                i--;                        //让下一颗子弹的下标 变成当前下标
            }
        }
    }
}
var bulletList = new BulletList();                      //实例化子弹列表

//绘制 敌机
var enemy1Img = [];
enemy1Img[0] = new Image();
enemy1Img[0].src = 'img/enemy1.png';
enemy1Img[1] = new Image();
enemy1Img[1].src = 'img/enemy1_down1.png';
enemy1Img[2] = new Image();
enemy1Img[2].src = 'img/enemy1_down2.png';
enemy1Img[3] = new Image();
enemy1Img[3].src = 'img/enemy1_down3.png';
enemy1Img[4] = new Image();
enemy1Img[4].src = 'img/enemy1_down4.png';


var enemy2Img = [];
enemy2Img[0] = new Image();
enemy2Img[0].src = 'img/enemy2.png';
enemy2Img[1] = new Image();
enemy2Img[1].src = 'img/enemy2_down1.png';
enemy2Img[2] = new Image();
enemy2Img[2].src = 'img/enemy2_down2.png';
enemy2Img[3] = new Image();
enemy2Img[3].src = 'img/enemy2_down3.png';
enemy2Img[4] = new Image();
enemy2Img[4].src = 'img/enemy2_down4.png';


var enemy3Img = [];
enemy3Img[0] = new Image();
enemy3Img[0].src = 'img/enemy3_n1.png';
enemy3Img[1] = new Image();
enemy3Img[1].src = 'img/enemy3_n2.png';
enemy3Img[2] = new Image();
enemy3Img[2].src = 'img/enemy3_hit.png';
enemy3Img[3] = new Image();
enemy3Img[3].src = 'img/enemy3_down1.png';
enemy3Img[4] = new Image();
enemy3Img[4].src = 'img/enemy3_down2.png';
enemy3Img[5] = new Image();
enemy3Img[5].src = 'img/enemy3_down3.png';
enemy3Img[6] = new Image();
enemy3Img[6].src = 'img/enemy3_down4.png';
enemy3Img[7] = new Image();
enemy3Img[7].src = 'img/enemy3_down5.png';
enemy3Img[8] = new Image();
enemy3Img[8].src = 'img/enemy3_down6.png';


function Enemy1(imgs){              //小飞机
    this.life = 1;
    this.crashed = false;
    this.index = 0;
    this.width = 57;
    this.height =51;
    this.x = Math.random()*(WIDTH-this.width);
    this.y = -this.height;
    this.draw = function(){
        ctx.drawImage(imgs[this.index],this.x,this.y);
    }
    this.canDelete = false;
    this.move = function(){
        this.y+= enemy1Speed;
        if(this.y>=HEIGHT){
            this.canDelete = true;
        }
        if(this.crashed){
            if(this.index==0){                              //判断是否还是好着的 如果是好着的 让他开始播放撞击动画
                this.index=1;
            }else if(this.index>=imgs.length-1){           //图片全部播放结束 敌机可以消除
                this.canDelete = true;
            }else{                                          //如果 已经是撞击的一套动画 那就继续播放
                this.index++;
            }
        }
    }
    this.hit= function(target){
        if((this.x+this.width>=target.x)                        //从左侧撞击
            &&(target.x+target.width>=this.x)                   //从右侧撞击
           &&(this.y+this.height>=target.y)                     //从上方撞击
           &&(target.y+target.height>=this.y)                   //从下方撞击
        ){
            target.crashed = true;                              //子弹/英雄飞机撞击后 也同样变成删除
            this.life--;
            if(this.life<=0){
                this.crashed = true;
            }
        }
    }
}
//var enemy1 = new Enemy1(enemy1Img);
function Enemy2(imgs){                          //中飞机
    this.life = 5;
    this.index = 0;
    this.width = 69;
    this.height =95;
    this.x = Math.random()*(WIDTH-this.width);
    this.y = -this.height;
    this.draw = function(){
        ctx.drawImage(imgs[this.index],this.x,this.y);
    }
    this.canDelete = false;
    this.move = function(){
        this.y+= enemy2Speed;
        if(this.y>=HEIGHT){
            this.canDelete = true;
        }
        if(this.crashed){
            if(this.index==0){                              //判断是否还是好着的 如果是好着的 让他开始播放撞击动画
                this.index=1;
            }else if(this.index>=imgs.length-1){           //图片全部播放结束 敌机可以消除
                this.canDelete = true;
            }else{                                          //如果 已经是撞击的一套动画 那就继续播放
                this.index++;
            }
        }
    }
    this.hit= function(target){
        if((this.x+this.width>=target.x)                        //从左侧撞击
            &&(target.x+target.width>=this.x)                   //从右侧撞击
            &&(this.y+this.height>=target.y)                     //从上方撞击
            &&(target.y+target.height>=this.y)                   //从下方撞击
        ){
            target.crashed = true;
            this.life--;
            if(this.life<=0){
                this.crashed = true;
            }
        }
    }
}

//var enemy2 = new Enemy2(enemy2Img);
function Enemy3(imgs){              //大飞机
    this.life = 15;
    this.crashed=false;
    this.index = 0;
    this.width = 169;
    this.height =258;
    this.canDelete = false;
    this.x = Math.random()*(WIDTH-this.width);
    this.y = -this.height;
    this.draw = function(){
        ctx.drawImage(imgs[this.index],this.x,this.y);
    }

    this.move = function(){
        this.y+= enemy3Speed;
        /*this.index = this.index == 0 ? 1:0;*/




        if(this.index==0){
            this.index=1;
        }else if(this.index==1){
            this.index=0;
        }

        if(this.y>=HEIGHT){
            this.canDelete = true;
        }
        if(this.crashed){
            if(this.index==0||this.index==1){                              //判断是否还是好着的 如果是好着的 让他开始播放撞击动画
                this.index=2;
            }else if(this.index>=imgs.length-1){           //图片全部播放结束 敌机可以消除
                this.canDelete = true;
            }else{                                          //如果 已经是撞击的一套动画 那就继续播放
                this.index++;
            }
        }
    }
    this.hit= function(target){
        if((this.x+this.width>=target.x)                        //从左侧撞击
            &&(target.x+target.width>=this.x)                   //从右侧撞击
            &&(this.y+this.height>=target.y)                     //从上方撞击
            &&(target.y+target.height>=this.y)                   //从下方撞击
        ){
            target.crashed = true;
            this.life--;
            if(this.life<=0){
                this.crashed = true;
            }
        }
    }
}
//var enemy3 = new Enemy3(enemy3Img);

//敌机列表
function EnemyList(){
    this.list = [];                         //将所有飞机 压入此数组中
    this.draw = function(){
        RandNum();
        for(var i =0; i<this.list.length;i++){
            this.list[i].draw();
        }
    }
    this.move = function(){
        for(var i = 0;i<this.list.length;i++){
            this.list[i].move();
            for(var j =0;j<bulletList.list.length;j++){
                var b = bulletList.list[j];
                this.list[i].hit(b);
            }
            this.list[i].hit(hero);
            if(this.list[i].canDelete){
                this.list.splice(i,1);
                i--;
            }
        }
    }
}

function RandNum(){
    //如果 num == 1 生成一个大飞机
    //如果 num ==2 3 4 生成一个中飞机
    //如果 num == 5 6 7 8 9 10 生成一个小飞机
    var num = Math.floor(Math.random()*difficulty);
    if(num==1){
        enemyList.list.push( new  Enemy3(enemy3Img) );
    }else if(num >=2 && num<=4){
        enemyList.list.push( new  Enemy2(enemy2Img) );
    }else if(num >=5 && num<=10){
       enemyList.list.push( new  Enemy1(enemy1Img) );
    }
}
var enemyList = new EnemyList();


//敌机的碰撞
//给每一种敌机 添加一个 life属性  来定义 每一种飞机可以被碰撞几次
//给每一种敌机 添加一个 crashed布尔值  如果撞击此处为true

//给每一个飞机 添加一个 hit方法 添加碰撞原理 判断 敌机是否碰撞

//飞机每次移动的时候 都需要判断 是否碰撞  如果life <=0 执行碰撞图片的动画 动画结束  从敌机列表中删除

//英雄的碰撞..............





//右上角 写生命值
function drawLife(){
    ctx.font = "25px SimHei";
    var text = "LIFE:"+heroLife;
    ctx.textBaseline = "top";
    ctx.textAlign = "right";
    ctx.fillText(text,WIDTH-10,10);
}


//暂停
canvas.onmouseout = function(){
    if(curPhase==PHASE_PLAY){
        curPhase=PHASE_PAUSE;
    }
}
canvas.onmouseover = function(){
    if(curPhase==PHASE_PAUSE){
        curPhase=PHASE_PLAY;
    }
}
var drawPauseImg = new Image();
drawPauseImg.src = 'img/game_pause_nor.png';
function drawPause(){
    ctx.drawImage(drawPauseImg,(WIDTH-drawPauseImg.width)/2,(HEIGHT-drawPauseImg.height)/2);
}

//游戏结束
function drawGameover(){
    var txt = "GAME OVER";
    ctx.font = "bold 60px SimHei";
    ctx.textBaseline = "top";
    ctx.textAlign = "center";

    ctx.fillText(txt,WIDTH/2,(HEIGHT-60)/2);

}


var timer = setInterval(function(){
    sky.draw();
    sky.move();
    switch (curPhase){
        case PHASE_READY:
            ctx.drawImage(logo,(WIDTH-logo.width)/2,(HEIGHT-logo.height)/2);
            break;
        case PHASE_LOADING :
            loading.draw();
            loading.move();

            break;
        case PHASE_PLAY:
            hero.draw();
            hero.move();

            bulletList.draw();
            bulletList.move();
           //enemy3.draw();
            //enemy3.move();
            enemyList.draw();
            enemyList.move();
           // butted.draw();
            //butted.move();
            drawLife();

            break;
        case PHASE_PAUSE:
            hero.draw();
            bulletList.draw();
            enemyList.draw();
            drawPause();
            drawLife();

            break;
        case PHASE_GAMEOVER:
            drawGameover();
            drawLife();
            break;
    }
},62);







