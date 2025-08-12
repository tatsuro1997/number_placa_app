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

    const value = event.currentTarget.dataset.value;
    const row = this.selectedCell.dataset.row;
    const col = this.selectedCell.dataset.col;

    this.rowInputTarget.value = row;
    this.colInputTarget.value = col;
    this.valueInputTarget.value = value;

    this.formTarget.requestSubmit();
  }
}
