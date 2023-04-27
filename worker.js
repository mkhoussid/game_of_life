const getCanvas = () => document.getElementById(CONSTANTS.CANVAS_ID);
const getButton = () => document.getElementById(CONSTANTS.BUTTON_ID);
const getCanvasContext = () => getCanvas().getContext('2d');
const getIsGameActive = () => getCanvas().getAttribute('data-active') === 'true';
const setIsGameActive = ({ isActive }) => {
	const canvas = getCanvas();
	canvas.setAttribute('data-active', isActive);
};

class Cell {
	constructor({ posX, posY }) {
		this.context = getCanvasContext();
		this.posX = posX;
		this.posY = posY;
		this.isActive = Math.random() > 0.5;
	}

	render() {
		this.context.fillStyle = this.isActive ? CONSTANTS.COLORS.CELL.ACTIVE : CONSTANTS.COLORS.CELL.INACTIVE;
		this.context.fillRect(
			this.posX * CONSTANTS.CELL_WIDTH,
			this.posY * CONSTANTS.CELL_WIDTH,
			CONSTANTS.CELL_WIDTH,
			CONSTANTS.CELL_WIDTH,
		);
	}
}

class Control {
	constructor({ columns, rows }) {
		this.cells = [];
		this.rows = Math.ceil(rows / 10);
		this.columns = Math.ceil(columns / 10);

		this.context = getCanvasContext();
		this.renderCells();
		this.initiate();
	}

	renderCells() {
		for (let y = 0; y < this.rows; y++) {
			for (let x = 0; x < this.columns; x++) {
				this.cells.push(new Cell({ posX: x, posY: y }));
			}
		}
	}

	isActive(x, y) {
		if (x < 0 || x >= this.columns || y < 0 || y >= this.rows) {
			return false;
		}

		return this.cells[this.getGridPoint(x, y)].isActive ? 1 : 0;
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

				const centerIndex = this.getGridPoint(x, y);

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

	getGridPoint(x, y) {
		return x + y * this.columns;
	}

	initiate() {
		this.getNextActiveState();

		const canvas = getCanvas();
		this.context.clearRect(0, 0, canvas.width, canvas.height);

		for (let i = 0; i < this.cells.length; i++) {
			this.cells[i].render();
		}

		setTimeout(() => {
			window.requestAnimationFrame(() => this.initiate());
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
