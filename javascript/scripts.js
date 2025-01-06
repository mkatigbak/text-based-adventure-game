// VARIABLE DECLARATION
const gameText = document.getElementById("game-text");
const heroType = document.getElementById("hero-type");
const healthPoints = document.getElementById("health");
const inventory = document.getElementById("inventory");
let weapon;
let currentLocation;
let combatStarted;
let currentHero;

// INITIALIZE CLASSES
class Character {
  constructor(name, health, attackPower) {
    this.name = name;
    this.health = health;
    this.attackPower = attackPower;
    this.inventory = [];
  }

  attack(target) {
    const message = `${this.name} attacks ${target.name} for ${this.attackPower} damage!`;
    target.takeDamage(this.attackPower);
    return message;
  }

  takeDamage(amount) {
    this.health -= amount;
    return `${this.name} takes ${amount} damage! Health is now ${this.health}.`;
  }

  pickUpItem(item) {
    this.inventory.push(item);
    return `${this.name} picked up ${item.name}.`;
  }

  viewInventory() {
    return `${this.name}'s Inventory: ${
      this.inventory.map((item) => item.name).join(", ") || "Empty"
    }`;
  }
}

class Item {
  constructor(name, type, value) {
    this.name = name;
    this.type = type;
    this.value = value;
    this.isPickedUp = false; // TRACK IF THE ITEM HAS BEEN PICKED UP
  }
}

class Location {
  constructor(name, description) {
    this.name = name;
    this.description = description;
    this.characters = [];
    this.items = [];
    this.connectedLocations = [];
  }

  enterLocation() {
    return `You have entered ${this.name}. ${this.description}`;
  }

  searchLocation() {
    return this.items.length > 0
      ? `You found: ${this.items.map((item) => item.name).join(", ")}`
      : "There are no items here.";
  }

  move(newLocation) {
    return this.connectedLocations.includes(newLocation)
      ? `Moving from ${this.name} to ${newLocation.name}.`
      : `You can't move to ${newLocation.name} from here.`;
  }
}

// CREATE CHARACTERS
const warrior = new Character("Warrior", 120, 30);
const goblin = new Character("Goblin", 150, 10);
const wizard = new Character("Wizard", 100, 50);

// CREATE ITEMS
const sword = new Item("Sword", "weapon", 10);
sword.isPickedUp = false; // TRACK IF THE SWORD HAS BEEN PICKED UP

const staff = new Item("Staff", "weapon", 10);
staff.isPickedUp = false; // TRACK IF THE STAFF HAS BEEN PICKED UP

const potion = new Item("Potion", "healing", 30);
potion.isPickedUp = false; // TRACK IF THE POTION HAS BEEN PICKED UP

// CREATE LOCATIONS
const home = new Location("home", "You take a rest and slowly restore health.");
const forest = new Location("the forest", "A place full of items.");
const cave = new Location("the cave", "The place is full of goblins.");

// INITIALIZATION
currentLocation = home.name;
combatStarted = false;
const currentCharacter = currentHero;

// GAME LOOP
function startGame() {
  $("#option-1").click(() => selectHero(warrior, "sword"));
  $("#option-2").click(() => selectHero(wizard, "staff"));
}

// CREATE SELECT HERO FUNCTION SO USER CAN CHANGE HERO
function selectHero(selectedHero, selectedWeapon) {
  currentHero = selectedHero; // STORE THE SELECTED HERO
  weapon = selectedWeapon;
  const text = `You selected the hero ${selectedHero.name}.<br /><br />You just woke up, what do you want to do?`;
  gameText.innerHTML = "";

  $(".option").prop("disabled", true); // DISABLE THE BUTTON

  typeText(text, 60, () => {
    $(".option").prop("disabled", false); // RE-ENABLE THE BUTTON WHEN DONE
    createNewButtons();
  });

  heroType.innerHTML = selectedHero.name;
  healthPoints.innerHTML = selectedHero.health;
  inventory.innerHTML = currentHero.viewInventory(); // SHOW INITIAL INVENTORY STATUS
}

function showClassOptions() {
  const buttonOptions = $("#button-options");
  buttonOptions.empty(); // CLEAR EXISTING BUTTONS

  const classOptions = [
    { id: 1, name: "WARRIOR", health: 120, attack: 30 },
    { id: 2, name: "WIZARD", health: 100, attack: 50 },
  ];

  classOptions.forEach((option) => {
    createButton(
      option.id,
      option.name,
      `<strong>${option.name}</strong><br /><br />Health Points: ${option.health}<br />Attack Power: ${option.attack}`,
      () => {
        selectHero(
          option.id === 1 ? warrior : wizard,
          option.id === 1 ? "sword" : "staff"
        );
      }
    );
  });
}

// CREATE FUNCTION TO CREATE BUTTON WHEN NEEDED
function createButton(id, name, html, onClick) {
  const button = $("<button>", {
    class: "option",
    id: `option-${id}`,
    html: html,
  }).click(onClick);

  $("#button-options").append(button);
}

// CREATE FUNCTION TO ADD DELAY ANIMATION TO TEXT
function typeText(text, delay, callback) {
  let index = 0;
  let currentText = "";

  // DISABLE BUTTONS WHEN TYPING STARTS
  $(".option").prop("disabled", true);

  function type() {
    if (index < text.length) {
      currentText += text.charAt(index);
      gameText.innerHTML = currentText;
      index++;
      setTimeout(type, delay);
    } else {
      // RE-ENABLE BUTTONS WHEN TYPING FINISHES
      $(".option").prop("disabled", false);
      if (callback) callback();
    }
  }

  type();
}

function createNewButtons() {
  const buttonOptions = $("#button-options");
  buttonOptions.empty(); // CLEAR EXISTING BUTTONS

  const options = [
    { id: 1, description: "Go to the forest." },
    { id: 2, description: "Go to the cave." },
    {
      id: 3,
      description: `Grab your ${currentHero === warrior ? "sword" : "staff"}.`,
    },
    { id: 4, description: "Select a different class." },
  ];

  options.forEach((option) => {
    const newButton = createButton(
      option.id,
      option.description,
      option.description,
      () => {
        switch (option.id) {
          case 4:
            showClassOptions(); // SHOW CLASS OPTIONS
            break;
          case 3:
            handlePickUpWeapon();
            break;
          case 2:
            moveToLocation(cave);
            break;
          default:
            moveToLocation(forest);
            break;
        }
      }
    );
  });
}

function handlePickUpWeapon() {
  const weaponItem = currentHero === warrior ? sword : staff; // CHECK BASED ON THE CURRENTHERO

  if (currentHero && weaponItem) {
    if (!weaponItem.isPickedUp) {
      const message = currentHero.pickUpItem(weaponItem);
      weaponItem.isPickedUp = true;
      gameText.innerHTML = message;
      typeText(gameText.innerHTML, 60);

      // UPDATE THE INVENTORY DISPLAY USING CURRENTHERO
      inventory.innerHTML = currentHero.viewInventory(); // REFRESH INVENTORY
    } else {
      gameText.innerHTML = `${weaponItem.name} has already been picked up.`;
      typeText(gameText.innerHTML, 60);
    }
  } else {
    inventory.innerHTML = `${currentHero.name}'s Inventory: Empty`; // IF NO ITEM PICKED UP
  }
}

// MOVE LOCATION FUNCTION
function moveToLocation(newLocation) {
  currentLocation = newLocation; // UPDATE THE CURRENT LOCATION
  const message = currentLocation.enterLocation(); // DISPLAY THE LOCATION DESCRIPTION
  gameText.innerHTML = message;

  typeText(gameText.innerHTML, 60, () => {
    if (currentLocation === home) {
      restoreHealth(); // CALL THE HEALTH RESTORATION FUNCTION
    } else if (currentLocation === cave) {
      createCaveOptions(); // CREATE OPTIONS FOR THE CAVE
    } else {
      createLocationOptions(); // CREATE OPTIONS FOR OTHER LOCATIONS
    }
  });
}

// LOCATION OPTIONS FUNCTION
function createLocationOptions() {
  const buttonOptions = $("#button-options");
  buttonOptions.empty(); // CLEAR EXISTING BUTTONS

  let options;

  if (currentLocation === forest) {
    options = [
      { id: 1, description: "Search for hidden items." },
      { id: 2, description: "Go to the cave." },
      { id: 3, description: "Go back home." },
      { id: 4, description: "Explore further." },
    ];
  } else if (currentLocation === cave) {
    options = [
      { id: 1, description: `Fight the ${goblin.name}.` },
      { id: 2, description: "Sneak and look for a treasure." },
      { id: 3, description: "Go back home." },
      { id: 4, description: "Find an exit." },
    ];
  } else if (currentLocation === home) {
    // NEW SECTION FOR HOME
    options = [
      { id: 1, description: "Go to the forest." },
      { id: 2, description: "Go to the cave." },
      { id: 3, description: `Grab your ${weapon}.` },
    ];
  }

  options.forEach((option) => {
    createButton(option.id, option.description, option.description, () => {
      // HANDLE EACH OPTION'S ACTION
      if (currentLocation === forest) {
        handleForestOptions(option.id);
      } else if (currentLocation === cave) {
        handleCaveOptions(option.id);
      } else if (currentLocation === home) {
        // HANDLE HOME OPTIONS
        handleHomeOptions(option.id);
      }
    });
  });
}

// ADD NEW FUNCTION TO HANDLE HOME OPTIONS
function handleHomeOptions(optionId) {
  if (optionId === 1) {
    moveToLocation(forest); // GO TO THE FOREST
  } else if (optionId === 2) {
    moveToLocation(cave); // GO TO THE CAVE
  } else if (optionId === 3) {
    handlePickUpWeapon(); // GRAB THE WEAPON
  }
}

// FOREST OPTIONS FUNCTION
function handleForestOptions(optionId) {
  if (optionId === 1) {
    if (!potion.isPickedUp) {
      // CHECK IF THE POTION HAS ALREADY BEEN PICKED UP
      gameText.innerHTML =
        "You search the forest and find a potion. What do you want to do?";
      typeText(gameText.innerHTML, 60, () => {
        createPotionOptions(); // CALL TO CREATE OPTIONS FOR PICKING UP OR GOING BACK
      });
    } else {
      gameText.innerHTML = "You search the forest but the potion is gone.";
      typeText(gameText.innerHTML, 60);
    }
  } else if (optionId === 2) {
    // HANDLE ATTEMPT TO GO TO CAVE
    gameText.innerHTML = "You can't enter the cave from here.";
    typeText(gameText.innerHTML, 60);
  } else if (optionId === 3) {
    moveToLocation(home); // GO BACK HOME
  } else if (optionId === 4) {
    // EXPLORE FURTHER AND TAKE DAMAGE
    const damage = 10; // AMOUNT OF DAMAGE TAKEN
    const currentCharacter =
      weapon === "sword" ? warrior : weapon === "staff" ? wizard : null;

    currentCharacter.takeDamage(damage); // APPLY DAMAGE
    gameText.innerHTML = `You explore further into the forest.<br /><br />There was a thick fog of poison. You took ${damage} damage and ran back to the forest.`;

    // CHECK IF CHARACTER IS ALIVE
    if (currentCharacter.health <= 0) {
      gameText.innerHTML += `<br />${currentCharacter.name} has been defeated! Game Over.`;
      typeText(gameText.innerHTML, 60);
      // OPTIONALLY DISABLE FURTHER ACTIONS
      $(".option").prop("disabled", true);
    } else {
      // UPDATE HEALTH DISPLAY AND CONTINUE THE GAME
      healthPoints.innerHTML = currentCharacter.health;
      typeText(gameText.innerHTML, 60);
    }
  }
}

// FUNCTION TO CREATE POTION OPTIONS
function createPotionOptions() {
  const buttonOptions = $("#button-options");
  buttonOptions.empty(); // CLEAR EXISTING BUTTONS

  const options = [
    { id: 1, description: "Pick up the potion." },
    { id: 2, description: "Go back." },
  ];

  options.forEach((option) => {
    createButton(option.id, option.description, option.description, () => {
      if (option.id === 1) {
        if (!potion.isPickedUp) {
          // CHECK AGAIN TO ENSURE POTION ISN'T PICKED UP
          currentHero.pickUpItem(potion); // USE CURRENTHERO TO ADD THE POTION TO INVENTORY
          potion.isPickedUp = true; // MARK POTION AS PICKED UP
          inventory.innerHTML = currentHero.viewInventory(); // UPDATE INVENTORY DISPLAY
          gameText.innerHTML = `You picked up the ${potion.name}.`;
          typeText(gameText.innerHTML, 60);
        } else {
          gameText.innerHTML = `You have already picked up the ${potion.name}.`;
          typeText(gameText.innerHTML, 60);
        }
      } else {
        createLocationOptions(); // RETURN TO MAIN OPTIONS IN THE FOREST
      }
    });
  });
}

// FUNCTION TO CREATE CAVE OPTIONS
function createCaveOptions() {
  const buttonOptions = $("#button-options");
  buttonOptions.empty(); // CLEAR EXISTING BUTTONS

  const options = [
    { id: 1, description: `Fight the ${goblin.name}.` },
    { id: 2, description: "Sneak and look for a treasure." },
    { id: 3, description: "Go back home." },
  ];

  options.forEach((option) => {
    createButton(option.id, option.description, option.description, () => {
      handleCaveOptions(option.id);
    });
  });
}

// CAVE OPTIONS FUNCTION
function handleCaveOptions(optionId) {
  if (optionId === 1) {
    // FIGHT THE GOBLIN
    if (!combatStarted) {
      gameText.innerHTML = "You engage in battle with a goblin!";
      combatStarted = true; // SET COMBAT AS STARTED
      typeText(gameText.innerHTML, 60, createFightOptions); // CALL TO CREATE FIGHT OPTIONS
    } else {
      createFightOptions(); // JUST GO TO FIGHT OPTIONS IF COMBAT HAS ALREADY STARTED
    }
  } else if (optionId === 2) {
    // SNEAK FOR TREASURE
    gameText.innerHTML =
      "You sneak around looking for treasure, but the goblin catches you!";
    typeText(gameText.innerHTML, 60, createFightOptions); // CALL TO CREATE FIGHT OPTIONS AFTER BEING CAUGHT
  } else if (optionId === 3) {
    // GO BACK HOME
    moveToLocation(home); // GO BACK HOME
  }
}

function createFightOptions() {
  const buttonOptions = $("#button-options");
  buttonOptions.empty(); // CLEAR EXISTING BUTTONS

  const options = [
    { id: 1, description: "Attack the goblin." },
    { id: 2, description: "Heal yourself." },
    { id: 3, description: "Escape from the fight." },
  ];

  options.forEach((option) => {
    createButton(option.id, option.description, option.description, () => {
      handleFightOptions(option.id);
    });
  });
}

// FUNCTION TO HANDLE FIGHT OPTIONS
function handleFightOptions(optionId) {
  const currentCharacter =
    weapon === "sword" ? warrior : weapon === "staff" ? wizard : null;

  if (optionId === 1) {
    // ATTACK
    if (
      currentCharacter.inventory.includes(sword) ||
      currentCharacter.inventory.includes(staff)
    ) {
      const attackMessage = currentCharacter.attack(goblin); // ATTACK THE GOBLIN
      displayCombatMessage(attackMessage, () => {
        if (goblin.health > 0) {
          goblinAttack(); // GOBLIN ATTACKS BACK IF IT'S STILL ALIVE
        } else {
          checkGoblinHealth(); // CHECK IF GOBLIN IS DEFEATED
        }
      });
    } else {
      // USER HAS NO WEAPON
      displayCombatMessage(
        "You don't have any weapon to attack with!",
        goblinAttack
      ); // GOBLIN ATTACKS BACK
    }
  } else if (optionId === 2) {
    // HEAL
    if (currentCharacter.inventory.includes(potion)) {
      const initialHealth = currentCharacter.health; // STORE INITIAL HEALTH
      currentCharacter.health += potion.value; // RESTORE HEALTH WITH POTION

      // ENFORCE THE HEALTH LIMITS
      if (currentCharacter === wizard && currentCharacter.health > 100) {
        currentCharacter.health = 100; // CAP WIZARD'S HEALTH AT 100
      } else if (
        currentCharacter === warrior &&
        currentCharacter.health > 120
      ) {
        currentCharacter.health = 120; // CAP WARRIOR'S HEALTH AT 120
      }

      // REMOVE THE POTION FROM INVENTORY
      const potionIndex = currentCharacter.inventory.indexOf(potion);
      if (potionIndex > -1) {
        currentCharacter.inventory.splice(potionIndex, 1); // REMOVE POTION
        inventory.innerHTML = currentHero.viewInventory(); // UPDATE INVENTORY DISPLAY
      }

      displayCombatMessage(
        `You healed yourself for ${
          currentCharacter.health - initialHealth
        } health!`,
        goblinAttack
      ); // GOBLIN ATTACKS BACK AFTER HEALING
    } else {
      displayCombatMessage("You don't have any potions to heal!", goblinAttack); // GOBLIN ATTACKS BACK
    }
  } else if (optionId === 3) {
    // ESCAPE
    displayCombatMessage("You successfully escape the fight!", () => {
      combatStarted = false; // RESET COMBAT STATE ON ESCAPE
      moveToLocation(home); // OPTIONALLY MOVE BACK HOME
    });
  }
}

// FUNCTION FOR GOBLIN ATTACK
function goblinAttack() {
  const currentCharacter =
    weapon === "sword" ? warrior : weapon === "staff" ? wizard : null;
  const goblinDamage = goblin.attackPower; // GOBLIN'S ATTACK POWER
  const damageMessage = goblin.attack(currentCharacter); // GOBLIN ATTACKS BACK
  displayCombatMessage(damageMessage, () => {
    healthPoints.innerHTML = currentCharacter.health; // UPDATE HEALTH DISPLAY

    // CHECK IF THE CURRENT CHARACTER IS ALIVE
    if (currentCharacter.health <= 0) {
      displayCombatMessage(
        `${currentCharacter.name} has been defeated! Game Over. You lost.`,
        () => {
          combatStarted = false; // RESET COMBAT STATE ON DEFEAT
          showRestartOption(); // SHOW RESTART OPTION
        }
      );
    } else {
      createFightOptions(); // SHOW FIGHT OPTIONS AGAIN
    }
  });
}

function checkGoblinHealth() {
  if (goblin.health <= 0) {
    gameText.innerHTML += `<br />You defeated the ${goblin.name}! Congratulations!`;
    typeText(gameText.innerHTML, 60, () => {
      combatStarted = false; // RESET COMBAT STATE ON VICTORY
      showRestartOption(); // SHOW RESTART OPTION
    });
  } else {
    // GOBLIN RETALIATES
    goblinAttack(); // DIRECTLY CALL GOBLINATTACK TO KEEP IT SIMPLE
  }
}

function displayCombatMessage(message, callback) {
  gameText.innerHTML += `<br />${message}`; // APPEND THE MESSAGE
  typeText(gameText.innerHTML, 60, callback); // USE THE TYPING EFFECT
}

// FUNCTION TO SHOW RESTART OPTION
function showRestartOption() {
  const buttonOptions = $("#button-options");
  buttonOptions.empty(); // CLEAR EXISTING BUTTONS
  createButton(1, "Restart Game", "Restart the game.", restartGame);
}

// FUNCTION TO RESTART THE GAME
function restartGame() {
  location.reload(); // REFRESHES THE PAGE TO RESTART THE GAME
}

// RESTORE HEALTH FUNCTION EVERYTIME YOU GO BACK HOME
function restoreHealth() {
  const currentCharacter =
    weapon === "sword" ? warrior : weapon === "staff" ? wizard : null;

  // SET THE MAXIMUM HEALTH BASED ON THE CHARACTER
  const maxHealth = currentCharacter === warrior ? 120 : 100;

  function incrementHealth() {
    if (currentCharacter.health < maxHealth) {
      currentCharacter.health += 10;
      healthPoints.innerHTML = currentCharacter.health;
      gameText.innerHTML = `${currentCharacter.name}'s health is now ${currentCharacter.health}.`;
      typeText(gameText.innerHTML, 60, () => {
        setTimeout(incrementHealth, 1000); // DELAY OF 1 SECOND BEFORE THE NEXT INCREMENT
      });
    } else {
      gameText.innerHTML = `${currentCharacter.name}'s health is fully restored!`;
      typeText(gameText.innerHTML, 60, () => {
        createLocationOptions(); // CREATE OPTIONS AFTER HEALTH RESTORATION IS COMPLETE
      });
    }
  }

  incrementHealth(); // START THE HEALTH RESTORATION PROCESS
}

// START THE GAME LOOP
startGame();