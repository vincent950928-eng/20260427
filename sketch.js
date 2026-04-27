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
}

function drawHandLines(offX, offY, vW, vH) {
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

    for (let segment of segments) {
      for (let j = 0; j < segment.length - 1; j++) {
        let pt1 = hand.keypoints[segment[j]];
        let pt2 = hand.keypoints[segment[j + 1]];

        // 將座標從原始影片尺寸 (640x480) 映射到螢幕上顯示的區域 (displayW x displayH)
        let x1 = map(pt1.x, 0, video.width, offX, offX + vW);
        let y1 = map(pt1.y, 0, video.height, offY, offY + vH);
        let x2 = map(pt2.x, 0, video.width, offX, offX + vW);
        let y2 = map(pt2.y, 0, video.height, offY, offY + vH);

        line(x1, y1, x2, y2);
      }
    }
  }
}
