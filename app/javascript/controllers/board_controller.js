import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["form", "rowInput", "colInput", "valueInput"]
  static classes = ["selected", "error", "normal"]

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
    if (this.isInitialValue(cell)) {
      this.playErrorSound();

      return;
    }

    if (this.selectedCell) {
      this.removeSelectedClass(this.selectedCell);
    }

    this.selectedCell = cell;
    this.addSelectedClass(this.selectedCell);
  }

  isInitialValue(cell) {
    return cell.dataset.initial === 'false';
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
      this.removeSelectedClass(this.selectedCell);
      this.selectedCell = null;
    }
  }

  checkDuplicatesForCell(targetRow, targetCol, targetValue) {
    this.clearErrors();

    const duplicates = new Set();
    const targetCellId = `cell_${targetRow}_${targetCol}`;

    // 1. 同じ行をチェック
    for (let c = 0; c < 9; c++) {
      if (c !== targetCol) {
        const targetRowCellId = `cell_${targetRow}_${c}`;
        const cell = document.getElementById(targetRowCellId);
        if (cell.textContent.trim() === targetValue) {
          duplicates.add(targetRowCellId);
          duplicates.add(targetCellId); // 元のセルも追加
        }
      }
    }

    // 2. 同じ列をチェック
    for (let r = 0; r < 9; r++) {
      if (r !== targetRow) {
        const targetColCellId = `cell_${r}_${targetCol}`;
        const cell = document.getElementById(targetColCellId);
        if (cell.textContent.trim() === targetValue) {
          duplicates.add(targetColCellId);
          duplicates.add(targetCellId); // 元のセルも追加
        }
      }
    }

    // 3. 同じ3x3ブロックをチェック
    const blockRow = Math.floor(targetRow / 3) * 3;
    const blockCol = Math.floor(targetCol / 3) * 3;
    
    for (let r = blockRow; r < blockRow + 3; r++) {
      for (let c = blockCol; c < blockCol + 3; c++) {
        if (r !== targetRow || c !== targetCol) {
          const targetBlockCellId = `cell_${r}_${c}`;
          const cell = document.getElementById(targetBlockCellId);
          if (cell.textContent.trim() === targetValue) {
            duplicates.add(targetBlockCellId);
            duplicates.add(targetCellId); // 元のセルも追加
          }
        }
      }
    }

    // 重複があるセルを赤くハイライト
    duplicates.forEach(cellId => {
      const cell = document.getElementById(cellId);
      if (cell) {
        this.removeNormalClass(cell);
        this.addErrorClass(cell);
      }
    });
  }

  clearErrors() {
    const errorCells = document.querySelectorAll(`.${this.errorClass}`);
    errorCells.forEach(cell => {
      this.removeErrorClass(cell);
      this.addNormalClass(cell);
    });
  }

  // CSS Classes Helper Methods
  addSelectedClass(element) {
    if (this.hasSelectedClass) {
      element.classList.add(this.selectedClass);
    }
  }

  removeSelectedClass(element) {
    if (this.hasSelectedClass) {
      element.classList.remove(this.selectedClass);
    }
  }

  addErrorClass(element) {
    if (this.hasErrorClass) {
      this.removeNormalClass(element);
      element.classList.add(this.errorClass);
    }
  }

  removeErrorClass(element) {
    if (this.hasErrorClass) {
      element.classList.remove(this.errorClass);
      this.addNormalClass(element);
    }
  }

  addNormalClass(element) {
    if (this.hasNormalClass) {
      element.classList.add(this.normalClass);
    }
  }

  removeNormalClass(element) {
    if (this.hasNormalClass) {
      element.classList.remove(this.normalClass);
    }
  }

  playErrorSound() {
    // Web Audio API または単純なbeep音
    const audioContext = new (window.AudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 200; // エラー音: 低めの周波数
    gainNode.gain.value = 0.1;
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.1);
  }
}
