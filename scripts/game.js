import { changeBalance, randElem, randInt, setBalanceField, shuffle } from "./functions.js"

setBalanceField()
let balance = document.querySelector('.balance')

let field = document.querySelector('.game')
let betAmount = document.querySelector('.bet_amount')
let minerCont = document.querySelector('.miner')
let miner = document.querySelector('.miner img')
let playButton = document.querySelector('.play_button')
let score = document.querySelector('.score')
let warning = document.querySelector('.warning')

let rewards = ['gold', 'rube', 'brill', 'chest']

let level = 1
let layers = 0
let playing = false
let ready = true

for (let levelButton of document.querySelectorAll('.level')) {
    levelButton.onclick = () => {
        if (playing) { return }

        for (let l of document.querySelectorAll('.level')) {
            l.classList.remove('chosen')
        }
        levelButton.classList.add('chosen')
        level = levelButton.firstElementChild.innerHTML
        setBombs()
    }
}

updateBonus()
createLayer()
createLayer()
setBombs()

for (let bonus of ['loupe', 'half']) {
    document.querySelector('.' + bonus).onclick = () => {
        if (!playing || !Number(localStorage.getItem(bonus + '_mine'))) { return }

        showBlocks(bonus)
        localStorage.setItem(bonus + '_mine', Number(localStorage.getItem(bonus + '_mine')) - 1)
        updateBonus()
    }
}

document.querySelector('.minus').onclick = () => {
    if (Number(betAmount.innerHTML) - 50 < 0 || playing) { return }
    betAmount.innerHTML = Number(betAmount.innerHTML) - 50
}

document.querySelector('.plus').onclick = () => {
    if (Number(betAmount.innerHTML) + 50 > Number(balance.innerHTML) || playing) { return }
    betAmount.innerHTML = Number(betAmount.innerHTML) + 50
}

document.querySelector('.min').onclick = () => {
    if (playing) { return }
    betAmount.innerHTML = 0
}

document.querySelector('.max').onclick = () => {
    if (playing) { return }
    betAmount.innerHTML = balance.innerHTML
}

playButton.onclick = () => {
    if (!playing) {
        if (!Number(betAmount.innerHTML) || Number(balance.innerHTML) < Number(betAmount.innerHTML)) { return }

        changeBalance(-Number(betAmount.innerHTML))
        playing = true
        playButton.firstElementChild.innerHTML = 'CASHOUT'
    } else {
        gameOver(true)
    }
}

document.querySelector('.again').onclick = () => {
    warning.style.left = '-50%'

    for (let div of field.querySelectorAll('div')) {
        if (!div.classList.contains('miner')) {
            div.remove()
        }
    }
    
    miner.src = '../png/miner.png'
    miner.classList.remove('dead')

    layers = 0
    createLayer()
    createLayer()
    setBombs()

    score.innerHTML = 'x1'

    playButton.firstElementChild.innerHTML = 'PLAY'
    playing = false
}

function createLayer() {
    let layerCont = document.createElement('div')
    layerCont.classList.add('layer_cont')

    layerCont.style.top = layers * 100 + '%'
    createReward(layers * 100 + 50)
    layers += 1

    for (let i = 0; i < 4; i++) {
        let block = document.createElement('div')
        block.classList.add('stone', 'block')

        block.onclick = async () => {
            if (Number(block.dataset.num) >= 4 || !playing || !ready) { return }

            ready = false

            await moveLeft(Number(block.dataset.num) * 25)
            await dig()

            if (block.dataset.type == 'empty') {
                block.classList.add('hidden')
                await fall()
                document.querySelector('.reward_cont').classList.add('hidden')
                createLayer()
                await nextLayer()
                setBombs()

                score.innerHTML = 'x' + (Number(score.innerHTML.replace('x', '')) * (1 + level / 2)).toFixed(2)
            } else {
                createBomb(Number(block.dataset.num) * 25 + 12.5)
                block.classList.add('hidden')
                await die()
                gameOver(false)
            }

            ready = true
        }

        layerCont.appendChild(block)
    }

    field.appendChild(layerCont)
}

function dig() {
    miner.src = '../png/work.gif'
    miner.classList.add('move')

    return new Promise(resolve => {
        setTimeout(() => {
            miner.src = '../png/miner.png'
            miner.classList.remove('move')
            resolve('ok')
        }, 2000);
    })
}

function moveLeft(percent) {
    minerCont.style.left = percent + '%'
    return new Promise(resolve => {
        setTimeout(() => {
            resolve('ok')
        }, 350);
    })
}

function fall() {
    minerCont.style.top = '100%'
    return new Promise(resolve => {
        setTimeout(() => {
            resolve('ok')
        }, 600);
    })
}

function die() {
    miner.classList.add('fall')
    miner.src = '../png/fall.gif'

    return new Promise(resolve => {
        setTimeout(() => {
            miner.src = '../png/dead_miner.png'
            miner.classList.replace('fall', 'dead')
            resolve('ok')
        }, 500);
    })
}

function nextLayer() {

    return new Promise(resolve => {
        setTimeout(async () => {
            minerCont.style.top = '0%'

            let layerConts = document.querySelectorAll('.layer_cont')
            for (let layer of layerConts) {
                layer.style.top = Number(layer.style.top.replace('%', '')) - 100 + '%'
            }

            for (let reward of document.querySelectorAll('.reward_cont')) {
                reward.style.top = Number(reward.style.top.replace('%', '')) - 100 + '%'
            }

            await removeFirstLayer()
            layers -= 1
            resolve('ok')
        }, 50);
    })
}

function removeFirstLayer() {
    document.querySelector('.layer_cont').classList.add('hidden')
    document.querySelector('.reward_cont').classList.add('hidden')

    return new Promise(resolve => {
        setTimeout(() => {
            document.querySelector('.layer_cont').remove()
            document.querySelector('.reward_cont').remove()
            resolve('ok')
        }, 350);
    })
}

function setBombs() {
    let blocks = document.querySelectorAll('.stone')

    let i = 0
    for (let block of blocks) {
        block.dataset.type = 'empty'
        block.dataset.num = i
        i++
    }

    let inds = shuffle([0, 1, 2, 3]).slice(0, level)
    for (let ind of inds) {
        blocks[ind].dataset.type = 'bomb'
    }
}

function createBomb(percent) {
    let bombCont = document.createElement('div')

    let bomb = document.createElement('img')
    bomb.src = '../png/bomb.png'
    bomb.classList.add('bomb', 'hidden')
    bomb.style.left = percent + '%'

    bombCont.appendChild(bomb)
    field.appendChild(bombCont)

    setTimeout(() => {
        bomb.classList.remove('hidden')
    }, 50);
}

function createReward(percent) {
    let rewardCont = document.createElement('div')
    rewardCont.classList.add('reward_cont', 'block')
    rewardCont.style.top = percent + '%'

    let reward = document.createElement('img')
    reward.src = '../png/' + randElem(rewards) + '.png'
    rewardCont.appendChild(reward)

    field.appendChild(rewardCont)
}

function gameOver(win) {
    if (win) {
        let prize = Math.round(Number(betAmount.innerHTML) * Number(score.innerHTML.replace('x', '')))
        warning.querySelector('.text').innerHTML = 'Congrats!<br>You have won<br>' + prize
        warning.style.left = '50%'
        changeBalance(prize)
    } else {
        warning.querySelector('.text').innerHTML = 'No way!<br>Try again right now<br>'
        warning.style.left = '50%'
    }
}

function updateBonus() {
    for (let bonus of ['half', 'loupe']) {
        if (Number(localStorage.getItem(bonus + '_mine'))) {
            document.querySelector('.' + bonus).classList.add('abled')
        } else {
            document.querySelector('.' + bonus).classList.add('disabled')
        }
    }
}

function showBlocks(bonus) {
    let nums = bonus == 'loupe' ? [randElem([0, 1, 2, 3])] : shuffle([0, 1, 2, 3]).slice(0, 2)

    for (let num of nums) {
        let block = field.querySelector('.stone[data-num="' + num + '"]')
        if (block.dataset.type == 'bomb') {
            createBomb(num * 25 + 12.5)
        }
        block.classList.add('hidden')

        setTimeout(() => {
            block.classList.remove('hidden')
        }, 500)
    }

    for (let bomb of document.querySelectorAll('.bomb')) {
        bomb.classList.add('hidden')

        setTimeout(() => {
            bomb.remove()
        }, 500);
    }
}