(function () {
  'use strict';

  const cvs = document.getElementById("canvas");
  const ctx = cvs.getContext("2d");
  let canvasPosition = {
    x: cvs.offsetLeft,
    y: cvs.offsetTop
  };

  // let this;
  const wheat = new Image();
  const seed = new Image();
  const chicken = new Image();
  const cow = new Image();
  const cowWithMilk = new Image();
  const chickenWithEgg = new Image();
  const canvasSideWidth = 640;
  const cellsInLine = 8;
  const cellSize = canvasSideWidth / cellsInLine;

  const guiControls = {
    moneyAmount: document.getElementById("money-amount"),
    milkAmount: document.getElementById("milk-amount"),
    eggsAmount: document.getElementById("eggs-amount"),
    wheatAmount: document.getElementById("wheat-amount"),
    startButton: document.getElementById("start-button"),
    endButton: document.getElementById("end-button"),
    sellEggsButton: document.getElementById("sell-eggs-button"),
    sellMilkButton: document.getElementById("sell-milk-button"),
    messageBar: document.getElementById("message-bar")
  };

  wheat.src = "img/wheat.png";
  seed.src = "img/seed.png";
  chicken.src = "img/chicken.gif";
  cow.src = "img/cow.gif";
  cowWithMilk.src = "img/cowWithMilk.png";
  chickenWithEgg.src = "img/chickenWithEgg.png";
  let currentPickedItem = undefined;
  let pickedWheat = false;

  const moneyValues = {
    startMoney: 240,
    seedPrice: 20,
    chickenPrice: 40,
    cowPrice: 60,
    milkPrice: 15,
    eggPrice: 5
  }

  const seedPrice = document.getElementById("seed-price");
  const chickenPrice = document.getElementById("chicken-price");
  const cowPrice = document.getElementById("cow-price");
  seedPrice.innerHTML = '$' + moneyValues.seedPrice;
  chickenPrice.innerHTML = '$' + moneyValues.chickenPrice;
  cowPrice.innerHTML = '$' + moneyValues.cowPrice;

  function addHandlers() {
    const chickenPick = document.getElementById("chicken");
    const cowPick = document.getElementById("cow");
    const seedPick = document.getElementById("seed");
    const wheatPick = document.getElementById("wheat");
    chickenPick.onclick = setCurrentPick;
    cowPick.onclick = setCurrentPick;
    seedPick.onclick = setCurrentPick;
    wheatPick.onclick = readyToFeed;
  };

  window.addEventListener('resize', function () {
    canvasPosition = {
      x: cvs.offsetLeft,
      y: cvs.offsetTop
    };
  });

  function setCurrentPick(e) {
    currentPickedItem = e.target.id;
  }

  function readyToFeed() {
    currentPickedItem = undefined;
    pickedWheat = true;
  }

  class Item {
    constructor(position) {
      this.position = {
        ...position
      };
    }
    drawItem() {
      ctx.drawImage(this.getIcon(), this.position.x, this.position.y, cellSize, cellSize);
    };
  }

  class Wheat extends Item {
    constructor(position) {
      super(position);
      this.name = "seed";
      this.price = 20;
      this.growTime = 10;
      this.growAge = 0;
    };
    getIcon() {
      if (this.growAge >= this.growTime) {
        return wheat;
      }
      return seed;
    }
    update() {
      this.growAge += 1;
    }
  }

  class Animal extends Item {
    constructor(position) {
      super(position);
    }
    update() {
      if (!this.isHungry && (this.activeReserve > 0)) {
        this.activeReserve -= 1;
        if ((this.activeReserve >= 0) && (this.prodAge < this.prodTime)) {
          this.prodAge += 1;
        }
      }
    }
  }

  class Chicken extends Animal {
    constructor(position) {
      super(position);
      this.name = "chicken";
      this.price = 40;
      this.isHungry = true;
      this.prodTime = 10;
      this.prodAge = 0;
      this.activeTime = 30;
      this.activeReserve = 0;
    }
    getIcon() {
      if (this.prodAge === this.prodTime) {
        return chickenWithEgg;
      }
      return chicken;
    }
  }

  class Cow extends Animal {
    constructor(position) {
      super(position);
      this.name = "cow";
      this.price = 60;
      this.isHungry = true;
      this.prodTime = 20;
      this.prodAge = 0;
      this.activeTime = 20;
      this.activeReserve = 0;
    }
    getIcon() {
      if (this.prodAge === this.prodTime) {
        return cowWithMilk;
      }
      return cow;
    }
  }

  const itemFabrique = (item, position) => {
    switch (item) {
      case 'seed':
        return new Wheat(position);
        break;
      case 'cow':
        return new Cow(position);
        break;
      case 'chicken':
        return new Chicken(position);
        break;
      default:
        alert('Buy item, please');
    }
  }

  class Game {
    constructor(startMoney) {
      if (typeof Game.instance === 'object') {
        return Game.instance;
      }
        this.gameObjects = [];
        this.stats = {
        milk: 0,
        eggs: 0,
        wheat: 0,
        money: startMoney,
      }
      this.onClickCell = this.onClickCell.bind(this);
      this.onSellEggs = this.onSellEggs.bind(this);
      this.onSellMilk = this.onSellMilk.bind(this);
      this.showMessage = this.showMessage.bind(this);
      Game.instance = this;
      return this;
      };
      // this.onClickCell = this.onClickCell.bind(this);
      // this.onSellEggs = this.onSellEggs.bind(this);
      // this.onSellMilk = this.onSellMilk.bind(this);
      // this.showMessage = this.showMessage.bind(this);

    getCellItem(clickedCell) {
      for (let item of this.gameObjects) {
        if (item.position.x === clickedCell.x && item.position.y === clickedCell.y) {
          return item;
        }
      }
      return undefined;
    }

    showMessage(message, color = 'rgb(159, 15, 15)') {
      guiControls.messageBar.style.color = color;
      guiControls.messageBar.innerHTML = message;
    }

    update() {
      for (let item of this.gameObjects) {
        item.update();
      }
    }

    render() {
      ctx.clearRect(0, 0, canvasSideWidth, canvasSideWidth);
      for (let item of this.gameObjects) {
        item.drawItem();
      }
    }

    onClickCell(e) {
      this.showMessage('');
      e.preventDefault();
      let mousePos = {
        x: e.pageX - canvasPosition.x,
        y: e.pageY - canvasPosition.y
      }
      const clickedCell = {
        x: mousePos.x - mousePos.x % cellSize,
        y: mousePos.y - mousePos.y % cellSize
      }

      const cellItem = this.getCellItem(clickedCell);

      if (pickedWheat && (!cellItem || cellItem.name === "seed")) {
        this.showMessage('❗️Feed Animal❗️');
        pickedWheat = false;
        return;
      }

      if (!currentPickedItem && !cellItem) {
        this.showMessage('❗️Choose Item❗️');
        return;
      }

      if (currentPickedItem && cellItem) {
        this.showMessage('❗️Choose free cell❗️');
        currentPickedItem = undefined;
        return;
      }

      if (currentPickedItem && !cellItem && !pickedWheat) {
        const newItem = itemFabrique(currentPickedItem, clickedCell);

        if (this.stats.money >= newItem.price) {
          newItem.drawItem(window[currentPickedItem]);
          this.gameObjects.push(newItem);
          currentPickedItem = undefined;
          this.stats.money = this.stats.money - newItem.price;
          guiControls.moneyAmount.value = "$" + this.stats.money;
          this.render();
        } else {
          currentPickedItem = undefined;
          pickedWheat = false;
          this.showMessage('❗️No enough money❗️');
        }
        return;
      }

      if (cellItem && (cellItem.name === "cow" || cellItem.name === "chicken") &&
        pickedWheat && this.stats.wheat > 0) {
        cellItem.activeReserve = cellItem.activeTime;
        cellItem.isHungry = false;
        this.stats.wheat -= 1;
        guiControls.wheatAmount.value = this.stats.wheat;
        this.render()
      } else if (cellItem && pickedWheat && this.stats.wheat === 0) {
        this.showMessage('❗️No enough wheat❗️');
      }

      if (cellItem.name === "chicken" && cellItem.prodAge >= cellItem.prodTime && !pickedWheat) {
        cellItem.prodAge = 0;
        this.render();
        this.stats.eggs += 1;
        guiControls.eggsAmount.value = this.stats.eggs;
      } else {
        pickedWheat = false;
      }

      if (cellItem.name === "cow" && cellItem.prodAge >= cellItem.prodTime && !pickedWheat) {
        cellItem.prodAge = 0;
        this.render();
        this.stats.milk += 1;
        guiControls.milkAmount.value = this.stats.milk;
      } else {
        pickedWheat = false;
      }

      if (!currentPickedItem && cellItem) {
        if (cellItem.name === "seed" && cellItem.growAge >= cellItem.growTime && !pickedWheat) {
          cellItem.growAge = 0;
          this.render();
          this.stats.wheat += 1;
          guiControls.wheatAmount.value = this.stats.wheat;
        }
        this.showInfo(cellItem);
      }
    }

    showInfo(cellItem) {
      switch (cellItem.name) {
        case 'seed':
          this.showMessage(`GROW PROGRESS: ${(cellItem.growAge/cellItem.growTime)*100}%`, 'green');
          break;
        case 'chicken':
          this.showMessage(`ACTIVE RESERVE: ${cellItem.activeReserve} 🕒 & EGG PROGRESS: ${(cellItem.prodAge/cellItem.prodTime)*100}%`, 'green');
          break;
        case 'cow':
          this.showMessage(`ACTIVE RESERVE: ${cellItem.activeReserve} & MILK PROGRESS: ${cellItem.prodAge}/${cellItem.prodTime}`, 'green');
          break;
      }
    }

    onSellEggs() {
      let eggsForSell = document.getElementById("eggs-for-sell").value;
      if (this.stats.eggs >= eggsForSell && eggsForSell > 0) {
        this.stats.money += eggsForSell * moneyValues.eggPrice;
        guiControls.moneyAmount.value = this.stats.money;
        this.stats.eggs -= eggsForSell;
        guiControls.eggsAmount.value = this.stats.eggs;
      }
      document.getElementById("eggs-for-sell").value = '0';
    }

    onSellMilk() {
      let milkForSell = document.getElementById("milk-for-sell").value;
      if (this.stats.milk >= milkForSell && milkForSell > 0) {
        this.stats.money += milkForSell * moneyValues.milkPrice;
        guiControls.moneyAmount.value = this.stats.money;
        this.stats.milk -= milkForSell;
        guiControls.milkAmount.value = this.stats.milk;
      }
      document.getElementById("milk-for-sell").value = '0';
    }

    start() {
      const game = this;

      game.update();
      game.render();

      setInterval(() => {
        game.update();
        game.render();
      }, 1000);
    }
  }

  function startGame() {
    const game = new Game(moneyValues.startMoney);
    cvs.addEventListener("click", game.onClickCell);
    guiControls.sellEggsButton.onclick = game.onSellEggs;
    guiControls.sellMilkButton.onclick = game.onSellMilk;
    guiControls.moneyAmount.value = "$" + game.stats.money;
    game.start();
  }

  guiControls.startButton.onclick = () => {
    addHandlers();
    // guiControls.startButton.disabled = true;
    // guiControls.endButton.disabled = false;
    startGame();
  }

  // guiControls.endButton.onclick = () => location.reload();

})();