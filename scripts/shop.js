import { setBalanceField, changeBalance, animateOnce } from './functions.js'

setBalanceField()
let balance = document.querySelector('.balance')

for (let button of document.querySelectorAll('.button')) {
    button.onclick = () => {
        if (Number(balance.innerHTML) < 500) {
            animateOnce('.balance')
            return
        } else {
            changeBalance(-500)
            localStorage.setItem(button.dataset.bonus + '_mine', Number(localStorage.getItem(button.dataset.bonus + '_mine')) + 1)
        }
    }
}