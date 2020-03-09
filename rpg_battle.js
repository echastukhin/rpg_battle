
//
// rpg_battle.js
//

const readlineSync = require('readline-sync');


const monster = {
        maxHealth: 10,
        name: "Лютый",
        moves: [
            {
                "name": "Удар когтистой лапой",
                "physicalDmg": 3, // физический урон
                "magicDmg": 0,    // магический урон
                "physicArmorPercents": 20, // физическая броня
                "magicArmorPercents": 20,  // магическая броня
                "cooldown": 0     // ходов на восстановление
            },
            {
                "name": "Огненное дыхание",
                "physicalDmg": 0,
                "magicDmg": 4,
                "physicArmorPercents": 0,
                "magicArmorPercents": 0,
                "cooldown": 3
            },
            {
                "name": "Удар хвостом",
                "physicalDmg": 2,
                "magicDmg": 0,
                "physicArmorPercents": 50,
                "magicArmorPercents": 0,
                "cooldown": 2
            },
        ],
        disabledMovesQueue: [],
        updateDisabledMovesQueue(move) {
            for (let index = 0; index < this.disabledMovesQueue.length; index++) {
                if (this.disabledMovesQueue[index].cooldownCounter == 0) {
                    this.disabledMovesQueue.splice(index,1);
                } 
                else {
                    this.disabledMovesQueue[index].cooldownCounter-=1;
                }
            }
            if (move.cooldown > 0 && !this.isMoveDisabled(move.name)) {
                    this.disabledMovesQueue.push({'name': move.name, 'cooldownCounter': move.cooldown });
            }
        },
        isMoveDisabled(moveName){
            let answer = false;
            for (let disabledMove of this.disabledMovesQueue) {
                if (disabledMove.name == moveName){
                    answer = true;
                    break;
                }
            }
            return answer;
        }
}

const player = {
        maxHealth: 10,
        name: "Евстафий",
        moves: [
            {
                "name": "Удар боевым кадилом",
                "physicalDmg": 2,
                "magicDmg": 0,
                "physicArmorPercents": 0,
                "magicArmorPercents": 50,
                "cooldown": 0
            },
            {
                "name": "Вертушка левой пяткой",
                "physicalDmg": 4,
                "magicDmg": 0,
                "physicArmorPercents": 0,
                "magicArmorPercents": 0,
                "cooldown": 4
            },
            {
                "name": "Каноничный фаербол",
                "physicalDmg": 0,
                "magicDmg": 5,
                "physicArmorPercents": 0,
                "magicArmorPercents": 0,
                "cooldown": 3
            },
            {
                "name": "Магический блок",
                "physicalDmg": 0,
                "magicDmg": 0,
                "physicArmorPercents": 100,
                "magicArmorPercents": 100,
                "cooldown": 4
            },
        ],
        setMaxHealth(health) {
            this.maxHealth = health;
        },
        disabledMovesQueue: [],
        updateDisabledMovesQueue(move) {
            for (let index = 0; index < this.disabledMovesQueue.length; index++) {
                if (this.disabledMovesQueue[index].cooldownCounter == 0) {
                    this.disabledMovesQueue.splice(index,1);
                } 
                else {
                    this.disabledMovesQueue[index].cooldownCounter-=1;
                }
            }
            if (move.cooldown > 0 && !this.isMoveDisabled(move.name)) {
                    this.disabledMovesQueue.push({'name': move.name, 'cooldownCounter': move.cooldown });
            }
        },
        isMoveDisabled(moveName){
            let answer = false;
            for (let disabledMove of this.disabledMovesQueue) {
                if (disabledMove.name == moveName){
                    answer = true;
                    break;
                }
            }
            return answer;
        }
}

play();

function play() {
    printInitialMessage();
    initPlayer();
    printLevelInfo();
    do {
        let monsterMoveIndex = generateMonsterMove();
        let playerMoveIndex  = askPlayerMove();
        updatePlayersHealth(monsterMoveIndex, playerMoveIndex);
        printStepResults();
    } while (player.maxHealth > 0 && monster.maxHealth > 0)
    printGameResult();
}

function printInitialMessage() {
    console.log('======================================================================');
    console.log('                            RPG баттл');
    console.log('======================================================================\n');
}

function printLevelInfo() {
    console.log('----------------------------------------------------------------------');
    console.log(` ${player.name} (${player.maxHealth} здоровья)          против          ${monster.name} (${monster.maxHealth} здоровья)`);
    console.log('----------------------------------------------------------------------');
}

function printStepResults() {
    console.log('----------------------------------------------------------------------');
    console.log(` ${player.name} (${player.maxHealth} здоровья)                          ${monster.name} (${monster.maxHealth} здоровья)`);
    console.log('----------------------------------------------------------------------');    
}

function askGameLevel() {
    let gameLevel = readlineSync.question(`Выберите уровень игры 1-3 [1]: `);
    if ( isNaN(gameLevel) || (gameLevel != '3' && gameLevel != '2') )
        gameLevel = '1'
    return gameLevel;
}

function getInitialHealth(gameLevel) {
    let health = 10;
    switch(gameLevel) {
        case '2': 
            health = 7;           
            break;
        case '3':
            health = 5;
    }
    return health;
}

function initPlayer() {
    let gameLevel = askGameLevel();
    let initialPlayerHealth = getInitialHealth(gameLevel);
    player.setMaxHealth(initialPlayerHealth);
}

function generateMonsterMove() {
    let movesCount = monster.moves.length;
    let randomMoveIndex = Math.floor(Math.random() * movesCount);
    randomMoveIndex = makeCorrectionAccordingCooldown(monster, randomMoveIndex);
    console.log(`>> Монстр ${monster.name} атакует приемом "${monster.moves[randomMoveIndex].name}"`);
    monster.updateDisabledMovesQueue(monster.moves[randomMoveIndex]);
    return randomMoveIndex;
}

function makeCorrectionAccordingCooldown(playerObject, randomMoveIndex) {
    let movesCount = playerObject.moves.length;
    while (playerObject.isMoveDisabled(playerObject.moves[randomMoveIndex].name)) 
    {
        randomMoveIndex = (randomMoveIndex + 1) % movesCount; //Зацикливание индекса в пределах размера доступных шагов
    } 
    return randomMoveIndex;
}


function askPlayerMove() {
    console.log(`--- Вам ${player.name}, доступны следующие ответные действия:`);
    let userDefaultMoveIndex = -1;
    let userMoveIndex = -1;

    for (let move of player.moves) {
        if (!player.isMoveDisabled(move.name)) {
            if (userDefaultMoveIndex == -1) {            
                userDefaultMoveIndex = player.moves.indexOf(move);
            }
            console.log(`--- [${player.moves.indexOf(move)}] "${move.name}"`);
        } 
    }
    let userAnswer = readlineSync.question(`--- Выберите один из вариантов [${userDefaultMoveIndex}]: `);
    if (userAnswer == '') {
        userAnswer = userDefaultMoveIndex;
    }
    if (isNaN(userAnswer) || userAnswer < 0 || userAnswer >= player.moves.length || player.isMoveDisabled(player.moves[userAnswer].name)) {
        userMoveIndex = userDefaultMoveIndex;
    } else {
        userMoveIndex = userAnswer;
    }
    console.log(`>> Вы ответили приемом "${player.moves[userMoveIndex].name}"\n`)
    player.updateDisabledMovesQueue(player.moves[userMoveIndex]);
    return userMoveIndex;
}

function updatePlayersHealth(monsterMoveIndex, playerMoveIndex) {
    monster.maxHealth -= (player.moves[playerMoveIndex].physicalDmg - (monster.moves[playerMoveIndex].physicalDmg) * (monster.moves[monsterMoveIndex].physicArmorPercents/100)) + (player.moves[playerMoveIndex].magicDmg - (player.moves[playerMoveIndex].magicDmg) * (monster.moves[monsterMoveIndex].magicArmorPercents/100)); 
    player.maxHealth -= (monster.moves[monsterMoveIndex].physicalDmg - (monster.moves[monsterMoveIndex].physicalDmg) * (player.moves[playerMoveIndex].physicArmorPercents/100)) + (monster.moves[monsterMoveIndex].magicDmg - (monster.moves[monsterMoveIndex].magicDmg) * (player.moves[playerMoveIndex].magicArmorPercents/100)); 
}

function printGameResult() {
    console.log('======================================================================');
    console.log('                            Игра закончена');
    console.log('--------------------------------------------------------------------\n');
    if ( player.maxHealth <= 0 && monster.maxHealth <= 0 )
        console.log('Результат:  Взаимное уничтожение');
    else if (player.maxHealth > 0)
        console.log(`Результат:  Выиграл ${player.name}`);
    else
        console.log(`Результат:  Выиграл ${monster.name}`);
    console.log('======================================================================\n');
}