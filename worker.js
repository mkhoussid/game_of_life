const getCanvas = () => document.getElementById(CONSTANTS.CANVAS_ID);
const getButton = () => document.getElementById(CONSTANTS.BUTTON_ID);
const getCanvasContext = () => getCanvas().getContext('2d');
const getIsGameActive = () => getCanvas().getAttribute('data-active') === 'true';
const setIsGameActive = ({ isActive }) => {
	const canvas = getCanvas();
	canvas.setAttribute('data-active', isActive);
};

class Cell {
	constructor(gridX, gridY) {
		this.context = getCanvasContext();
		this.gridX = gridX;
		this.gridY = gridY;
		this.isActive = Math.random() > 0.5;
	}

	render() {
		this.context.fillStyle = this.isActive ? CONSTANTS.COLORS.CELL.ACTIVE : CONSTANTS.COLORS.CELL.INACTIVE;
		this.context.fillRect(
			this.gridX * CONSTANTS.CELL_WIDTH,
			this.gridY * CONSTANTS.CELL_WIDTH,
			CONSTANTS.CELL_WIDTH,
			CONSTANTS.CELL_WIDTH,
		);
	}
}

class Control {
	constructor({ columns, rows }) {
		this.columns = Math.ceil(columns / 10);
		this.rows = Math.ceil(rows / 10);
		this.cells = [];

		this.context = getCanvasContext();
		this.drawCells();
		this.gameLoop();
	}

	drawCells() {
		for (let y = 0; y < this.rows; y++) {
			for (let x = 0; x < this.columns; x++) {
				this.cells.push(new Cell(x, y));
			}
		}
	}

	isActive(x, y) {
		if (x < 0 || x >= this.columns || y < 0 || y >= this.rows) {
			return false;
		}

		return this.cells[this.gridToIndex(x, y)].isActive ? 1 : 0;
	}

	gridToIndex(x, y) {
		return x + y * this.columns;
	}

	getNextActiveState() {
		for (let x = 0; x < this.columns; x++) {
			for (let y = 0; y < this.rows; y++) {
				const numAlive =
					this.isActive(x - 1, y - 1) +
					this.isActive(x, y - 1) +
					this.isActive(x + 1, y - 1) +
					this.isActive(x - 1, y) +
					this.isActive(x, y + 1) +
					this.isActive(x - 1, y + 1) +
					this.isActive(x + 1, y) +
					this.isActive(x + 1, y + 1);

				const centerIndex = this.gridToIndex(x, y);

				if (numAlive == 2) {
					this.cells[centerIndex].nextIsActive = this.cells[centerIndex].isActive;
				} else if (numAlive == 3) {
					this.cells[centerIndex].nextIsActive = true;
				} else {
					this.cells[centerIndex].nextIsActive = false;
				}
			}
		}

		for (let i = 0; i < this.cells.length; i++) {
			this.cells[i].isActive = this.cells[i].nextIsActive;
		}
	}

	gameLoop() {
		this.getNextActiveState();

		const canvas = getCanvas();
		this.context.clearRect(0, 0, canvas.width, canvas.height);

		for (let i = 0; i < this.cells.length; i++) {
			this.cells[i].render();
		}

		setTimeout(() => {
			window.requestAnimationFrame(() => this.gameLoop());
		}, 100);
	}
}

class Start {
	constructor(props) {
		this.initializeCanvas(props);
	}

	initializeCanvas(config) {
		this.createButton(config);
		this.createCanvas(config);
	}

	createButton({ rows, columns }) {
		const button = document.createElement('div');

		button.classList.add('start-button');
		button.setAttribute('id', CONSTANTS.BUTTON_ID);
		button.onclick = this.handleButtonClick({ rows, columns }).bind(this);
		button.textContent = 'Начать';

		document.body.appendChild(button);
	}

	createCanvas(config) {
		const canvas = document.createElement('canvas');

		this.styleCanvas({ canvas, ...config });
		this.canvas = canvas;

		document.body.appendChild(canvas);
	}

	handleButtonClick(config) {
		return function () {
			const button = getButton();
			const isGameActive = getIsGameActive();

			if (isGameActive) {
				button.textContent = 'Начать';
				const canvas = getCanvas();
				document.body.removeChild(canvas);
				this.createCanvas(config);
			} else {
				button.textContent = 'Остановить';
				setIsGameActive({ isActive: true });
				new Control(config);
			}
		};
	}

	styleCanvas({ canvas, rows, columns }) {
		[
			['id', CONSTANTS.CANVAS_ID],
			['width', columns],
			['height', rows],
		].forEach(([attributeName, attributeValue]) => {
			canvas.setAttribute(attributeName, attributeValue);
		});
	}
}

document.onreadystatechange = () => {
	if (document.readyState === 'complete') {
		// initializeCanvas({ rows: 400, columns: 1000 });
		new Start({ rows: 400, columns: 1000 });
	}
};
