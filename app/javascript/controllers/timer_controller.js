import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["display", "startBtn", "pauseBtn", "resetBtn"]
  static classes = ["hidden", "visible"] // よりシンプルな命名

  connect() {
    this.totalSeconds = 0;
    this.intervalId = null;
    this.isRunning = false;
    this.updateDisplay();
    this.updateButtonStates();
  }

  disconnect() {
    this.pause();
  }

  start() {
    if (this.isRunning) return;

    this.isRunning = true;
    this.intervalId = setInterval(() => {
      this.totalSeconds++;
      this.updateDisplay();
    }, 1000);

    this.updateButtonStates();
  }

  pause() {
    if (!this.isRunning) return;

    this.isRunning = false;
    clearInterval(this.intervalId);
    this.intervalId = null;

    this.updateButtonStates();
  }

  reset() {
    this.pause();
    this.totalSeconds = 0;
    this.updateDisplay();
    this.updateButtonStates();
  }

  updateButtonStates() {
    if (this.isRunning) {
      this.hideElement(this.startBtnTarget);
      this.showElement(this.pauseBtnTarget);
    } else {
      this.showElement(this.startBtnTarget);
      this.hideElement(this.pauseBtnTarget);
    }
  }

  showElement(element) {
    if (this.hasHiddenClass) {
      element.classList.remove(this.hiddenClass);
    }
    if (this.hasVisibleClass) {
      element.classList.add(this.visibleClass);
    }
  }

  hideElement(element) {
    if (this.hasVisibleClass) {
      element.classList.remove(this.visibleClass);
    }
    if (this.hasHiddenClass) {
      element.classList.add(this.hiddenClass);
    }
  }

  updateDisplay() {
    const minutes = Math.floor(this.totalSeconds / 60);
    const seconds = this.totalSeconds % 60;
    
    const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    this.displayTarget.textContent = formattedTime;
  }

  getCurrentTime() {
    return {
      totalSeconds: this.totalSeconds,
      minutes: Math.floor(this.totalSeconds / 60),
      seconds: this.totalSeconds % 60,
      formatted: this.displayTarget.textContent
    };
  }

  setTime(seconds) {
    const wasRunning = this.isRunning;
    this.pause();
    this.totalSeconds = seconds;
    this.updateDisplay();
    
    if (wasRunning) {
      this.start();
    }
  }
}
