// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
ml5 Example
PoseNet example using p5.js
=== */

let video;
let handPose;
let hands = [];
let bubbles = []; // 存放所有水泡

function setup() {
  // 1. 建立全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  video = createCapture(VIDEO);
  video.size(640, 480);

  // 建立 handPose 手勢偵測模型 (ml5 v1.0.0+)
  handPose = ml5.handPose(video, modelReady);
  // 持續偵測手部並更新結果
  handPose.detectStart(video, results => {
    hands = results;
  });
  // Hide the video element, and just show the canvas
  video.hide();
}

// 視窗大小改變時，重新調整畫布
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function modelReady() {
  select('#status').html('Model Loaded');
}

function draw() {
  // 2. 設定畫布背景顏色
  background('#e7c6ff');

  // 3. 計算 50% 的影像寬高
  let displayW = width * 0.5;
  let displayH = height * 0.5;

  // 4. 計算置中位置
  let x = (width - displayW) / 2;
  let y = (height - displayH) / 2;

  // 5. 繪製影像於畫面中央
  image(video, x, y, displayW, displayH);

  // 6. 繪製手部線條
  drawHandLines(x, y, displayW, displayH);

  // 7. 更新與繪製水泡
  for (let i = bubbles.length - 1; i >= 0; i--) {
    bubbles[i].update();
    bubbles[i].display();
    if (bubbles[i].isBroken()) {
      bubbles.splice(i, 1);
    }
  }

  // 8. 在畫布正中間顯示文字
  drawCenterText();
}

function drawCenterText() {
  push();
  fill(0); // 文字顏色設為黑色
  noStroke();
  textSize(32);
  textAlign(CENTER, CENTER);
  text('414730969陳威成', width / 2, height / 2);
  pop();
}

function drawHandLines(offX, offY, vW, vH) {
  // 指定要產生水泡的關鍵點編號：4 (拇指), 8 (食指), 12 (中指), 20 (小指)
  let bubblePoints = [4, 8, 12, 20];

  for (let i = 0; i < hands.length; i++) {
    let hand = hands[i];
    
    // 根據需求定義的手指關鍵點群組
    let segments = [
      [0, 1, 2, 3, 4],     // 拇指
      [5, 6, 7, 8],        // 食指
      [9, 10, 11, 12],     // 中指
      [13, 14, 15, 16],    // 無名指
      [17, 18, 19, 20]     // 小指
    ];

    stroke(255, 0, 0); // 設定線條顏色為紅色
    strokeWeight(3);   // 設定線條粗細

    // 繪製手指連線
    for (let segment of segments) {
      for (let j = 0; j < segment.length - 1; j++) {
        let pt1 = hand.keypoints[segment[j]];
        let pt2 = hand.keypoints[segment[j + 1]];

        let x1 = map(pt1.x, 0, video.width, offX, offX + vW);
        let y1 = map(pt1.y, 0, video.height, offY, offY + vH);
        let x2 = map(pt2.x, 0, video.width, offX, offX + vW);
        let y2 = map(pt2.y, 0, video.height, offY, offY + vH);

        line(x1, y1, x2, y2);
      }
    }

    // 繪製關鍵點上的小圓圈，並在指定點產生水泡
    for (let k = 0; k < hand.keypoints.length; k++) {
      let kp = hand.keypoints[k];
      let kX = map(kp.x, 0, video.width, offX, offX + vW);
      let kY = map(kp.y, 0, video.height, offY, offY + vH);

      fill(255, 0, 0);
      noStroke();
      circle(kX, kY, 8); // 繪製小圓圈

      // 如果是指定點，則每隔幾幀產生一個新水泡
      if (bubblePoints.includes(k) && frameCount % 10 === 0) {
        bubbles.push(new Bubble(kX, kY));
      }
    }
  }
}

// 水泡類別
class Bubble {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.initialY = y;
    this.size = random(10, 25);
    this.speed = random(1, 4);
    this.noiseOffset = random(1000);
    this.opacity = 180;
  }

  update() {
    this.y -= this.speed; // 往上飘
    // 產生左右搖擺的效果
    this.x += map(noise(this.noiseOffset), 0, 1, -1.5, 1.5);
    this.noiseOffset += 0.05;
    this.opacity -= 0.5; // 隨時間變淡
  }

  display() {
    push();
    stroke(255, this.opacity);
    strokeWeight(1.5);
    noFill();
    circle(this.x, this.y, this.size);
    // 增加一個反光點，讓它看起來更像水泡
    fill(255, this.opacity * 0.4);
    noStroke();
    circle(this.x - this.size * 0.2, this.y - this.size * 0.2, this.size * 0.3);
    pop();
  }

  isBroken() {
    // 當上升距離超過 150 像素，或飘出螢幕時破掉
    return (this.initialY - this.y > 150) || (this.y < -this.size);
  }
}
