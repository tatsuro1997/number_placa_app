import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["form", "rowInput", "colInput", "valueInput"]

  connect() {
    this.selectedCell = null;
    this.lastUpdatedCell = null;

    this.afterCellUpdateHandler = this.afterCellUpdate.bind(this);
    window.addEventListener('numberPlaca:cellUpdated', this.afterCellUpdateHandler);
  }

  disconnect() {
    window.removeEventListener('numberPlaca:cellUpdated', this.afterCellUpdateHandler);
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

    const row = this.selectedCell.dataset.row;
    const col = this.selectedCell.dataset.col;
    const value = event.currentTarget.dataset.value;

    this.lastUpdatedCell = {
      row: parseInt(row),
      col: parseInt(col),
      value: value
    };

    this.rowInputTarget.value = row;
    this.colInputTarget.value = col;
    this.valueInputTarget.value = value;

    this.formTarget.requestSubmit();
  }

  afterCellUpdate() {
    this.clearSelection();

    if (this.lastUpdatedCell) {
      this.checkDuplicatesForCell(this.lastUpdatedCell.row, this.lastUpdatedCell.col, this.lastUpdatedCell.value);
    }
  }

  clearSelection() {
    if (this.selectedCell) {
      this.selectedCell.classList.remove("bg-yellow-200");
      this.selectedCell = null;
    }
  }

  checkDuplicatesForCell(targetRow, targetCol, targetValue) {
    this.clearErrors();

    const duplicates = new Set();

    // 1. 同じ行をチェック
    for (let c = 0; c < 9; c++) {
      if (c !== targetCol) {
        const cell = document.getElementById(`cell_${targetRow}_${c}`);
        if (cell.textContent.trim() === targetValue) {
          duplicates.add(`cell_${targetRow}_${c}`);
          duplicates.add(`cell_${targetRow}_${targetCol}`); // 元のセルも追加
        }
      }
    }

    // 2. 同じ列をチェック
    for (let r = 0; r < 9; r++) {
      if (r !== targetRow) {
        const cell = document.getElementById(`cell_${r}_${targetCol}`);
        if (cell.textContent.trim() === targetValue) {
          duplicates.add(`cell_${r}_${targetCol}`);
          duplicates.add(`cell_${targetRow}_${targetCol}`); // 元のセルも追加
        }
      }
    }

    // 3. 同じ3x3ブロックをチェック
    const blockRow = Math.floor(targetRow / 3) * 3;
    const blockCol = Math.floor(targetCol / 3) * 3;
    
    for (let r = blockRow; r < blockRow + 3; r++) {
      for (let c = blockCol; c < blockCol + 3; c++) {
        if (r !== targetRow || c !== targetCol) {
          const cell = document.getElementById(`cell_${r}_${c}`);
          if (cell.textContent.trim() === targetValue) {
            duplicates.add(`cell_${r}_${c}`);
            duplicates.add(`cell_${targetRow}_${targetCol}`); // 元のセルも追加
          }
        }
      }
    }

    // 重複があるセルを赤くハイライト
    duplicates.forEach(cellId => {
      const cell = document.getElementById(cellId);
      if (cell) {
        cell.classList.remove("bg-white");
        cell.classList.add("bg-red-200", "border-red-400");
      }
    });
  }

  clearErrors() {
    const errorCells = document.querySelectorAll('.bg-red-200, .border-red-400');
    errorCells.forEach(cell => {
      cell.classList.remove("bg-red-200", "border-red-400");
      cell.classList.add("bg-white");
    });
  }
}
