import { AnimCtrl } from './easing_ctrl/easing_ctrl.js';

let slideCtrl = new AnimCtrl('#mySVG', '#slideRight', 10, 100);
slideCtrl.start();
