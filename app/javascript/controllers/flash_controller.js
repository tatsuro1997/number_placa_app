import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["message"]
  static values = {
    delay: { type: Number, default: 4000 },
    fadeDuration: { type: Number, default: 500 }
  }

  connect() {
    this.timer = setTimeout(() => {
      this.fadeOut()
    }, this.delayValue)
  }

  disconnect() {
    if (this.timer) {
      clearTimeout(this.timer)
    }
  }

  close(event) {
    event.preventDefault()
    this.fadeOut()
  }

  fadeOut() {
    this.element.style.transition = `opacity ${this.fadeDurationValue}ms ease-out`
    this.element.style.opacity = '0'

    setTimeout(() => {
      if (this.element.parentNode) {
        this.element.remove()
      }
    }, this.fadeDurationValue)
  }
}
