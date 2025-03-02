class ColorPalette {
  constructor(element) {
    this.element = element;
    this.softColors = ["#E6E6FA", "#ADD8E6", "#FFDAB9", "#98FF98", "#FFC0CB"];
    this.hardColors = ["#DC143C", "#4169E1", "#4B0082", "#006400", "#000000"];
    this.colors = [...this.hardColors, ...this.softColors];

    this.fillColors();
    this.element.addEventListener("click", (e) => this.storeColor(e));

    this.colorPicker = document.querySelector(".color-picker");
    this.colorPicker.addEventListener("input", (e) => this.pickCustomColor(e));
  }

  fillColors() {
    const colorElements = this.element.querySelectorAll(".color");
    colorElements.forEach((color, index) => {
      color.style.backgroundColor = this.colors[index % this.colors.length];
    });
  }

  storeColor(event) {
    if (event.target.classList.contains("color")) {
      paint.currentSelection.color = getComputedStyle(
        event.target
      ).backgroundColor;
      console.log("Selected Color:", paint.currentSelection.color);
    }
  }

  pickCustomColor(event) {
    paint.currentSelection.color = event.target.value;
    console.log("Customised Color:", paint.currentSelection.color);
  }
}

class ShapePalette {
  constructor(element) {
    this.element = element;
    this.element.addEventListener("click", (e) => this.storeShape(e));
  }

  storeShape(event) {
    if (event.target.classList.contains("shape")) {
      paint.currentSelection.shape = event.target.dataset.shape;
      console.log("Selected Shape:", paint.currentSelection.shape);
    }
  }
}

class CanvasDrawer {
  constructor(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d");
    this.isDrawing = false;
    this.startX = 0;
    this.startY = 0;
    this.initEvents();
  }

  drawTriangle(x, y) {
    this.context.beginPath();
    this.context.moveTo(x, y - 40);
    this.context.lineTo(x - 35, y + 30);
    this.context.lineTo(x + 35, y + 30);
    this.context.closePath();
    this.context.fill();
  }

  drawCircle(x, y) {
    this.context.beginPath();
    this.context.arc(x, y, 40, 0, Math.PI * 2);
    this.context.fill();
  }

  drawRectangle(x, y) {
    this.context.fillRect(x - 30, y - 20, 60, 40);
  }

  drawFreehand(startX, startY) {
    this.context.beginPath();
    this.context.moveTo(startX, startY);
  }

  getToolProperties() {
    const tools = {
      pen: { strokeStyle: paint.currentSelection.color, lineWidth: 9 },
      eraser: { strokeStyle: "white", lineWidth: 15 },
    };
    return tools[paint.currentSelection.tool];
  }

  drawShape(x, y) {
    this.context.fillStyle = paint.currentSelection.color;
    this.context.strokeStyle = paint.currentSelection.color;
    this.context.lineWidth = 5;

    const shapeFunctions = {
      circle: () => this.drawCircle(x, y),
      rectangle: () => this.drawRectangle(x, y),
      freehand: () => this.drawFreehand(x, y),
      triangle: () => this.drawTriangle(x, y),
    };

    shapeFunctions[paint.currentSelection.shape]();
  }

  downloadCanvas() {
    const link = document.createElement("a");
    link.href = this.canvas.toDataURL("image/png");
    link.download = "drawing.png";
    link.click();
  }

  clearCanvas() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  initEvents() {
    this.canvas.addEventListener("mousedown", (event) => {
      this.startX = event.offsetX;
      this.startY = event.offsetY;
      this.isDrawing = true;
      Object.assign(this.context, this.getToolProperties());
      this.drawShape(this.startX, this.startY);
    });

    this.canvas.addEventListener("mousemove", (event) => {
      if (!this.isDrawing || paint.currentSelection.shape !== "freehand")
        return;
      this.context.lineTo(event.offsetX, event.offsetY);
      this.context.stroke();
    });

    this.canvas.addEventListener("mouseup", () => {
      this.isDrawing = false;
      this.context.closePath();
    });

    this.canvas.addEventListener("mouseleave", () => {
      this.isDrawing = false;
    });

    document.getElementById("clearCanvas").addEventListener("click", () => {
      this.clearCanvas();
    });

    document.getElementById("downloadCanvas").addEventListener("click", () => {
      this.downloadCanvas();
    });
  }
}

class ToolPalette {
  constructor(element) {
    this.element = element;
    this.element.addEventListener("click", (e) => this.storeTool(e));
  }

  storeTool(event) {
    if (event.target.classList.contains("tool")) {
      paint.currentSelection.tool = event.target.dataset.tool;
      paint.currentSelection.recentTool = paint.currentSelection.tool;
      paint.currentSelection.recentColor = paint.currentSelection.color;
      console.log("selected tool ", paint.currentSelection.tool);
      const props = {
        eraser: this.eraser,
      };

      const { color } = props[paint.currentSelection.tool]();
      paint.currentSelection.color = color;
    }
  }

  eraser() {
    return { color: "white" };
  }
}

class paint {
  static currentSelection = {
    shape: "freehand",
    color: "black",
    recentTool: "pen",
    tool: "pen",
    recentColor: "black",
  };

  static init() {
    const colorPaletteElement = document.querySelector(".color-palette");
    const shapePaletteElement = document.querySelector(".shape-palette");
    const canvasElement = document.querySelector("canvas");
    const freehandElement = document.querySelector(".freehand");
    const toolElement = document.querySelector(".tools");

    new ColorPalette(colorPaletteElement);
    new ShapePalette(shapePaletteElement);
    new ShapePalette(freehandElement);
    new CanvasDrawer(canvasElement);
    new ToolPalette(toolElement);
  }
}

window.onload = paint.init;
