const TILE_SIZE = 175;
const TILE_BIAS = 30;

// Distance Squared
function sqDist(x, y, x2, y2) {
    return (x2-x)*(x2-x) + (y2-y)*(y2-y);
};

// Rectangle Rectangle
function rrCol(x, y, w, h, x2, y2, w2, h2) {
    return x < x2 + w2 && y < y2 + h2 && x > x2 - w && y > y2 - h;
};

// Sprites
var sprites = {
    logo: function() {
        fill(255);
        noStroke();
        rect(0, 50, 100, 150, 0, 0, 5, 5);
        fill(240);
        quad(0, 50, 100, 50, 90, 20, 10, 20);
        fill(230);
        rect(10, 0, 80, 20, 5, 5, 0, 0);
        fill(0, 200, 255);
        rect(0, 100, 100, 50);
        fill(255);
        textSize(40);
        textAlign(CENTER, CENTER);
        text("JG", 50, 125);
        return get(0, 0, 100, 200);
    },
    logosans: function() {
        fill(255);
        noStroke();
        rect(0, 50, 100, 150, 0, 0, 5, 5);
        fill(240);
        quad(0, 50, 100, 50, 90, 20, 10, 20);
        fill(230);
        rect(10, 0, 80, 20, 5, 5, 0, 0);
        fill(0, 200, 255);
        rect(0, 100, 100, 50);
        return get(0, 0, 100, 200);
    },
    fog: function() {
        strokeWeight(2);
        for(var i = 0; i < height/2; i += 1) {
            stroke(255, map(i, 0, height/2, 0, 100));
            line(0, i, width, i);
        }
        return get(0, 0, width, height);
    },
    shine: function() {
        strokeWeight(2);
        for(var i = 200; i < height; i += 1) {
            stroke(255, map(i, 200, height, 0, 50));
            line(0, i, width, i);
        }
        return get(0, 0, width, height);
    },
    init: function(key) {
        clear();
        this[key] = this[key]();
    },
};
var sn = ['logo', 'logosans', 'fog', 'shine'];
var s = 0;

// Constants
var d2r = Math.PI/180;
var SQRT2 = Math.sqrt(2);

// Globals
var keys = {},
keysr = {},
clicked = false,
shake = 0,
sceneAnim = 1,
scene = "intro";

// Logo variables {
const width = 600, height = 600;
var logotx = width / 2,
logoty = height * 0.3,
logoy = 0,
logoyvel = height / 11,
logo = 0,
logoinit = false;
// }
// Game variables {
var score = 0,
tilesHopped = 0,
chordCount = 0,
firstChord = true,
chordsFaded = false,
lastNote = -1,
high = localStorage.getItem("JentGent tiles hop high score") || 0,
bg = 190,
bgTo = bg,
bbg = bg,
mx = 0,
speed = 0.04,
loseImg,
btn = 0,
yFloor = 300;
// }

// Bush
var bushes = [];
var bs = 800;
var Bush = function() {
    bushes.push({
        x: ((round(random(1)) === 1) ? random(-2000, -700) : random(700, 2000)),
        y: yFloor,
        z: 10,
        x1: random(-bs/s, -100),
        x2: random(100, bs/s),
        time: 0,
        display: function() {
            var zp = (this.z + 10/this.time);
            this.time += 1;
            noStroke();
            fill(bg, 255, 75);
            push();
            translate((this.x + mx)/zp, (this.y)/zp);
            triangle(-bs/s/zp, 0,
                this.x1/zp, -200/zp,
                bs/s/zp, 0);
            triangle(-bs/s/zp, 0,
                bs/s/zp, 0,
                this.x2/zp, -200/zp);
            pop();
            this.z -= speed;
        },
    });
};

// Tiles
var tiles = [];
var Tile = function() {
    var moving = random(10) < 3;
    if(moving) {
        tiles.push({
            x: 0,
            z: 10,
            hit: 0,
            time: 0,
            zOff: 0.5,
            theta: random(360),
            thetaAdd: random(0.5, 1),
            display: function() {
                this.theta += 1;
                this.x = -TILE_SIZE / 2 + Math.cos(this.theta * d2r) * (400 - TILE_SIZE / 2 - 5);
                this.time += this.thetaAdd;
                var zp = this.z;
                var yFall = 800;
                stroke(255);
                strokeWeight(10/zp);
                if(this.hit > 0) {
                    var hitOff = 40;
                    var zHitOff = 0.2;
                    this.hit += 1;
                    noFill();
                    quad(
                        (this.x + mx - hitOff + hitOff/this.hit)/(zp + zHitOff - zHitOff/this.hit), (yFloor - yFall/this.time)/(zp + zHitOff - zHitOff/this.hit),
                        (this.x + mx + TILE_SIZE + hitOff - hitOff/this.hit)/(zp + zHitOff - zHitOff/this.hit), (yFloor - yFall/this.time)/(zp + zHitOff - zHitOff/this.hit),
                        (this.x + mx + TILE_SIZE + hitOff - hitOff/this.hit)/(zp - this.zOff - zHitOff + zHitOff / this.hit), (yFloor - yFall/this.time)/(zp - this.zOff - zHitOff + zHitOff / this.hit),
                        (this.x + mx - hitOff + hitOff/this.hit)/(zp - this.zOff - zHitOff + zHitOff / this.hit), (yFloor - yFall/this.time)/(zp - this.zOff - zHitOff + zHitOff / this.hit)
                    );
                }
                fill(bg, 255, 255);
                quad(
                    (this.x + mx)/zp, (yFloor - yFall/this.time)/zp,
                    (this.x + mx + TILE_SIZE)/zp, (yFloor - yFall/this.time)/zp,
                    (this.x + mx + TILE_SIZE)/(zp - this.zOff), (yFloor - yFall/this.time)/(zp - this.zOff),
                    (this.x + mx)/(zp - this.zOff), (yFloor - yFall/this.time)/(zp - this.zOff)
                );
                if(this.hit > 0) {
                    fill(255);
                    quad(
                        (this.x + mx)/zp, (yFloor - yFall/this.time)/zp,
                        (this.x + mx + TILE_SIZE)/zp, (yFloor - yFall/this.time)/zp,
                        (this.x + mx + TILE_SIZE)/(zp - this.zOff), (yFloor - yFall/this.time)/(zp - this.zOff),
                        (this.x + mx)/(zp - this.zOff), (yFloor - yFall/this.time)/(zp - this.zOff)
                    );
                }
                this.z -= speed;
            },
        });
        return;
    }
    tiles.push({
        x: random(-400, 400 - TILE_SIZE),
        z: 10,
        hit: 0,
        time: 0,
        zOff: 0.5,
        display: function() {
            this.time += 1;
            var zp = this.z;
            var yFall = 800;
            stroke(255);
            strokeWeight(10/zp);
            if(this.hit > 0) {
                var hitOff = 40;
                var zHitOff = 0.2;
                this.hit += 1;
                noFill();
                quad(
                    (this.x + mx - hitOff + hitOff/this.hit)/(zp + zHitOff - zHitOff/this.hit), (yFloor - yFall/this.time)/(zp + zHitOff - zHitOff/this.hit),
                    (this.x + mx + TILE_SIZE + hitOff - hitOff/this.hit)/(zp + zHitOff - zHitOff/this.hit), (yFloor - yFall/this.time)/(zp + zHitOff - zHitOff/this.hit),
                    (this.x + mx + TILE_SIZE + hitOff - hitOff/this.hit)/(zp - this.zOff - zHitOff + zHitOff / this.hit), (yFloor - yFall/this.time)/(zp - this.zOff - zHitOff + zHitOff / this.hit),
                    (this.x + mx - hitOff + hitOff/this.hit)/(zp - this.zOff - zHitOff + zHitOff / this.hit), (yFloor - yFall/this.time)/(zp - this.zOff - zHitOff + zHitOff / this.hit)
                );
            }
            fill(bg, 255, 255);
            quad(
                (this.x + mx)/zp, (yFloor - yFall/this.time)/zp,
                (this.x + mx + TILE_SIZE)/zp, (yFloor - yFall/this.time)/zp,
                (this.x + mx + TILE_SIZE)/(zp - this.zOff), (yFloor - yFall/this.time)/(zp - this.zOff),
                (this.x + mx)/(zp - this.zOff), (yFloor - yFall/this.time)/(zp - this.zOff)
            );
            if(this.hit > 0) {
                fill(255);
                quad(
                    (this.x + mx)/zp, (yFloor - yFall/this.time)/zp,
                    (this.x + mx + TILE_SIZE)/zp, (yFloor - yFall/this.time)/zp,
                    (this.x + mx + TILE_SIZE)/(zp - this.zOff), (yFloor - yFall/this.time)/(zp - this.zOff),
                    (this.x + mx)/(zp - this.zOff), (yFloor - yFall/this.time)/(zp - this.zOff)
                );
            }
            this.z -= speed;
        },
    });
};

// Player
var player = {
    x: 0,
    y: yFloor,
    z: 1.5,
    yVel: -20,
    jumpTimer: 0,
    trail: [],
    xVel: 0,
    display: function() {
        var zp = this.z;
        noStroke();
        fill(255);
        ellipse((this.x + mx) / zp, this.y / zp, 100/zp, 100/zp);
        fill(255, 10);
        for(var i = 0; i < this.trail.length; i += 1) {
            var t = this.trail[i];
            ellipse((t[0] + mx) / t[2], t[1] / t[2], 40 / t[2], 40 / t[2]);
            t[2] -= speed;
            if(t[2] <= 0) {
                this.trail.splice(i, 1);
            }
        }
        this.trail.push([this.x, this.y, this.z]);
        if(keys[LEFT] || keys.a) {
            this.xVel -= 5;
        }
        if(keys[RIGHT] || keys.d) {
            this.xVel += 5;
        }
        this.xVel = constrain(this.xVel, -15, 15);
        if(!keys[RIGHT] && !keys[LEFT] && !keys.a && !keys.d) {
            this.xVel *= 0.8;
        }
        this.x += this.xVel;
        if(mouseIsPressed) {
            this.x += (mouseX - pmouseX) * 800 / (450 - 150);
            // this.x = map(mouseX, 150, 450, -400, 400);
        }
        this.x = constrain(this.x, -400, 400);
        this.jumpTimer += 1;
        this.y += this.yVel;
        this.yVel += 1;
        if(this.y > yFloor) {
            this.yVel = -20;
            this.y = yFloor;
            this.jumpTimer = 0;
            var hit = false;
            for(var i = 0; i < tiles.length; i += 1) {
                if(hit) {
                    continue;
                }
                var t = tiles[i];
                if(this.x < t.x - TILE_BIAS || this.x > t.x + TILE_SIZE + TILE_BIAS || this.z > t.z || this.z < t.z - t.zOff) {
                    continue;
                }
                hit = true;
                t.hit = 1;

                lastNote = nextNote(score ? lastNote : 0);
                notes[lastNote].play();
                if(this.x !== 0) {
                    if(!chordCount) {
                        const chordIndex = firstChord ? 0 : random(chords.length) | 0;
                        firstChord = false;
                        chords[chordIndex].volume(0.6);
                        chords[chordIndex].play();
                        chordCount = 8;
                    }
                    chordCount -= 1;
                    score = max(score, 1);
                    tilesHopped += 1;
                }
                break;
            }
            if(!hit && score > 0) {
                scene = "lose";
                sceneAnim = 0;
            }
        }
    },
};

// Fader
function Fader() {
    this.color = color(0, 0, 0);
    this.opacity = 0;
    this.fading = false;
    this.speed = 0;
    this.screen = 0;
    this.fade = function(speed, col, screen) {
        if(!this.fading) {
            this.speed = speed;
            this.color = col;
            this.screen = screen;
            this.opacity = 0;
            this.fading = true;
        }
    };
    this.display = function() {
        fill(red(this.color), green(this.color), blue(this.color), this.opacity);
        if(this.fading) {
            if(this.opacity >= 255) {
                this.speed = -abs(this.speed);
                scene = this.screen;
                sceneAnim = 1;
                score = 0;
                tilesHopped = 0;
                tiles = [];
                bushes = [];
                player.x = 0;
                player.xVel = 0;
                player.y = yFloor;
                player.yVel = -20;
                player.trail = [];
            }
            if(this.opacity < 0) {
                this.speed = 0;
                this.opacity = 0;
                this.fading = false;
            }
            this.opacity += this.speed;
        }
        noStroke();
        rect(-1, -1, width + 2, height + 2);
    };
};

// Mouse
function mousePressed() {
    clicked = true;
};

// Keyboard
function keyPressed() {
    keys[keyCode] = true;
    keys[key.toString()] = true;
};
function keyReleased() {
    keys[keyCode] = false;
    keys[key.toString()] = false;
    keysr[keyCode] = true;
    keysr[key.toString()] = true;
};

// Draw
function draw() {
    if(s < sn.length) {
        sprites.init(sn[s]);
        s ++;
        background(0);
        if(s === sn.length) {
            colorMode(HSB, 255, 255, 255, 255);
        }
        return;
    }
    sceneAnim += 1;
    background(255);
    push();
    translate(random(-shake, shake), random(-shake, shake));
    shake = max(shake - 1, 0);
    cursor(ARROW);
    switch(scene) {
        case "intro":
            // Intro {
            background(0);
            if(!logoinit) {
                logotx = width / 2;
                logoty = height * 0.3;
                logoy = 0;
                logoyvel = height / 11;
                logo = 0;
                frameCount = 0;
                logoinit = true;
            }
            if(frameCount > 25 && frameCount < 100) {
                logotx *= 0.9;
                logoty *= 0.8;
                image(sprites.logosans, width / 2 - map(sprites.logo.width, 0, 600, 0, width) / 2 - (100 - frameCount) * 30, height * 0.7 - map(sprites.logo.height, 0, 600, 0, height) / 2, map(sprites.logo.width, 0, 600, 0, width), map(sprites.logo.height, 0, 600, 0, height));
                fill(255);
                textAlign(CENTER, CENTER);
                textSize(map(30, 0, 600, 0, width));
                push();
                translate(width / 2 - logotx - textWidth("J") / 0.9, height * 0.75 + logoty);
                rotate(logotx);
                scale(2 - logotx / height * 4, 2 - logoty / height * 4);
                text("J", 0, 0);
                pop();
                push();
                translate(width / 2 + logotx + textWidth("G") / 0.9, height * 0.75 + logoty);
                rotate(logotx);
                scale(2 - logotx / height * 4, 2 - logoty / height * 0.4);
                text("G", 0, 0);
                pop();
            }
            else if(frameCount > 100) {
                if(frameCount < 120) {
                    background((120 - frameCount) * 255/20);
                }
                
                logo = constrain(logo + 5, 0, 180);
                push();
                translate(width / 2 + cos(logo - 90) * 100, height * 0.7);
                rotate(cos(logo - 90) * 25);
                image(sprites.logo, -map(sprites.logo.width, 0, 600, 0, width) / 2, -map(sprites.logo.height, 0, 600, 0, width) / 2, map(sprites.logo.width, 0, 600, 0, width), map(sprites.logo.height, 0, 600, 0, height));
                pop();
                
                if(frameCount > 125) {
                    logoy += logoyvel;
                    logoyvel *= 0.9;
                    
                    textAlign(CENTER, CENTER);
                    textSize(map(30, 0, 600, 0, width));
                    fill(255);
                    text("J E N T A C U L A R   G E N T", width / 2, logoy / 3.4 - 2);
                    textSize(map(15, 0, 600, 0, width));
                    text("presents ...", width / 2, logoy / 3.4 + 40);
                    fill(0, 0, 0);
                    noStroke();
                    rect(0, 0, width, height / 6);
                    if(frameCount >= 250) {
                        fader.fade(10, color(0, 0, 0), "menu");
                    }
                }
            }
            // }
        break;
        case "menu":
            scene = "game";
        break;
        case "game":
            mx = -(player.x) * 1.2;
            background(bg, 255, 200);
            noStroke();
            fill(255);
            ellipse(300, 246, 200, 200);
            fill(bg, 255, 150);
            triangle(-100, 300, 100, 146, 300, 300);
            fill(bg, 255, 170);
            triangle(399, 300, 541, 170, 772, 300);
            fill(bg, 255, 200);
            triangle(200, 300, 400, 218, 600, 300);
            image(sprites.fog, 0, 0, width, height);
            
            push();
            translate(0, 50);
            fill(bg, 255, 50);
            rect(0, 250, width, height);
            triangle(0, 240, 300, 250, 0, 250);
            triangle(500, 240, 300, 250, 600, 250);
            pop();
            
            push();
            translate(width/2, height/2);
            fill(255, 20);
            triangle(0, 0, (-400 + mx), yFloor, (400 + mx), yFloor);
            if(bushes.length < 10 && random(10) < 1) {
                Bush();
            }
            for(var i = bushes.length - 1; i >= 0; i -= 1) {
                var b = bushes[i];
                b.display();
                if(b.z <= 0) {
                    b.x = ((round(random(1)) === 1) ? random(-2000, -700) : random(700, 2000));
                    b.y = yFloor;
                    b.z = 10;
                    b.x1 = random(-bs/s, -100);
                    b.x2 = random(100, bs/s);
                    b.time = 0;
                    bushes.splice(i, 1);
                }
            }
            if(player.jumpTimer === 0) {
                Tile();
            }
            for(var i = tiles.length - 1; i >= 0; i -= 1) {
                var t = tiles[i];
                t.display();
                if(t.z <= t.zOff + 0.2) {
                    tiles.splice(i, 1);
                }
            }
            player.display();
            if(sceneAnim % 200 === 0) {
                bgTo += 30;
            }
            bbg += (bgTo - bbg) * 0.01;
            bg = bbg % 255;
            pop();
            
            if(score > 0) {
                score += 1;
            }
            fill(255);
            textAlign(LEFT, TOP);
            textSize(50);
            noStroke();
            text(tilesHopped, 10, 10);
            
            if(score > 0) {
                textAlign(CENTER, CENTER);
                textSize(100);
                fill(0);
                text("tiles\nhop", width/2 + 5, 250 - 600 + 600 / map(score, 1, 2, 1, 1.1) + 5);
                fill(255);
                text("tiles\nhop", width/2, 250 - 600 + 600 / map(score, 1, 2, 1, 1.1));
            }
            else {
                textAlign(CENTER, CENTER);
                textSize(100);
                fill(0);
                text("tiles\nhop", width/2 + 5, 250 - 600/sceneAnim + 5);
                fill(255);
                text("tiles\nhop", width/2, 250 - 600/sceneAnim);
                // stroke(255);
                // strokeWeight(5);
                // line(200, 430, 400, 430);
                // strokeWeight(20);
                // point(300 + cos(frameCount * 2) * 100, 430);
                noStroke();
                fill(255);
                textAlign(LEFT, BOTTOM);
                textSize(30);
                text("high score: " + high, 10, height - 5);
            }
            high = max(tilesHopped, high);
            
            image(sprites.shine, 0, 1, width, height);
            if(scene === "lose") {
                localStorage.setItem("JentGent tiles hop high score", high);
                chordsFaded = false;
                loseImg = get(0, 0, width, height);
            }
        break;
        case "lose":
            image(loseImg, 0, 0, width, height);
            noStroke();
            fill(0, 50);
            rect(-1, -1, width + 2, height + 2);
            fill(255);
            textAlign(CENTER, CENTER);
            textSize(80);
            text("oops!", width/2, height/3 - 600/sceneAnim);
            textSize(60);
            text("score:\n" + tilesHopped, width/2, 380 + 600/sceneAnim);
            textSize(40 + btn);
            if(!chordsFaded) {
                for(const chord of chords) {
                    if(chord.playing()) {
                        chord.fade(0.6, 0, 100);
                    }
                }
                chordsFaded = true;
            }
            if(rrCol(mouseX, mouseY, 0, 0, 0, 500 - 20, width, 40)) {
                cursor(HAND);
                btn += (10 - btn) * 0.5;
                if(clicked) {
                    chordCount = 0;
                    firstChord = true;
                    fader.fade(10, color(0), "game");
                }
            }
            else {
                btn *= 0.5;
            }
            text("Retry", width/2, 500 + 100/sceneAnim);
    }
    noStroke();
    pop();
    fader.display();
    clicked = false;
    keysr = {};
};