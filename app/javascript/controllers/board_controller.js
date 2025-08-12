import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["form", "rowInput", "colInput", "valueInput"]

  connect() {
    this.selectedCell = null;
  }

  selectCell(event) {
    const cell = event.currentTarget;
    if (this.selectedCell) {
      this.selectedCell.classList.remove("bg-yellow-200");
    }

    this.selectedCell = cell;
    this.selectedCell.classList.add("bg-yellow-200");
  }

  enterNumber(event) {
    if (!this.selectedCell) {
      alert("先に入力するマスを選択してください。");
      return;
    }

    this.rowInputTarget.value = this.selectedCell.dataset.row;
    this.colInputTarget.value = this.selectedCell.dataset.col;
    this.valueInputTarget.value = event.currentTarget.dataset.value;

    this.formTarget.requestSubmit();
  }
}
