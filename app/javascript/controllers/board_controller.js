import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["form", "rowInput", "colInput", "valueInput", "numberModal", "timer"]
  static classes = ["selected", "error", "normal", "modal"]

  connect() {
    this.selectedCell = null;
    this.lastUpdatedCell = null;
    this.modalActive = false;
    this.firstMove = true;

    this.afterCellUpdateHandler = this.afterCellUpdate.bind(this);
    window.addEventListener('numberPlaca:cellUpdated', this.afterCellUpdateHandler);

    // モーダル外クリックで閉じる
    this.boundCloseModal = this.closeModalOnOutsideClick.bind(this);
    document.addEventListener('click', this.boundCloseModal);

    // キーボードショートカット
    this.boundHandleKeydown = this.handleKeydown.bind(this);
    document.addEventListener('keydown', this.boundHandleKeydown);
  }

  disconnect() {
    window.removeEventListener('numberPlaca:cellUpdated', this.afterCellUpdateHandler);
    document.removeEventListener('click', this.boundCloseModal);
    document.removeEventListener('keydown', this.boundHandleKeydown);
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

    this.showModal(cell);
  }

  isInitialValue(cell) {
    return cell.dataset.initial === 'true';
  }

  showModal(cell) {
    const modal = this.numberModalTarget;
    const rect = cell.getBoundingClientRect();

    let modalLeft = rect.left - 150;
    let modalTop = rect.top - 50;

    // 画面左端からはみ出る場合は右側に表示
    if (modalLeft < 0) {
      modalLeft = rect.right + 10;
    }

    modal.style.left = `${modalLeft}px`;
    modal.style.top = `${modalTop}px`;

    this.removeModalClass(modal);

    this.modalActive = true;
  }

  closeModal() {
    if (!this.modalActive) return;

    const modal = this.numberModalTarget;

    this.addModalClass(modal);
    this.clearSelection();

    this.modalActive = false;
  }

  closeModalOnOutsideClick(event) {
    if (!this.modalActive) return;

    // モーダル内のクリックは無視
    if (this.numberModalTarget.contains(event.target)) return;

    // 選択されたセル自体のクリックは無視（selectCellで処理）
    if (this.selectedCell && this.selectedCell.contains(event.target)) return;

    this.closeModal();
  }

  selectNumber(event) {
    if (!this.selectedCell) return;

    const value = event.currentTarget.dataset.value;
    this.processNumberInput(value);
    this.closeModal();
  }

  enterNumber(event) {
    if (!this.selectedCell) {
      alert("先に入力するマスを選択してください。");
      return;
    }

    const value = event.currentTarget.dataset.value;
    this.processNumberInput(value);
  }

  processNumberInput(value) {
    if (!this.selectedCell) return;

    if (this.firstMove) {
      this.startTimerIfExists();
      this.firstMove = false;
    }

    const row = this.selectedCell.dataset.row;
    const col = this.selectedCell.dataset.col;

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

  handleKeydown(event) {
    if (!this.selectedCell || !this.modalActive) return;

    // 数字キー (1-9)
    if (event.key >= '1' && event.key <= '9') {
      event.preventDefault();
      this.processNumberInput(event.key);
      this.closeModal();
    }
    // Deleteキー、Backspaceキー
    else if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault();
      this.processNumberInput('0');
      this.closeModal();
    }
    // Escapeキー
    else if (event.key === 'Escape') {
      event.preventDefault();
      this.closeModal();
    }
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
        if (cell.innerText.trim() === targetValue) {
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
        if (cell.innerText.trim() === targetValue) {
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
          if (cell.innerText.trim() === targetValue) {
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

  addModalClass(element) {
    if (this.hasModalClass) {
      element.classList.add(this.modalClass);
    }
  }

  removeModalClass(element) {
    if (this.hasModalClass) {
      element.classList.remove(this.modalClass);
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

  startTimerIfExists() {
    const timerController = this.application.getControllerForElementAndIdentifier(this.timerTarget, "timer")
    timerController?.start();
  }
}
