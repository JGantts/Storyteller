
const animationName = 'flash-error-red-animation';

const style = document.createElement('style');
style.innerText = `
    @keyframes ${animationName} {
        0% {
            opacity: 0;
        }
        15% {
            opacity: 1;
        }
        
        30% {
            opacity: 0
        }
        
        45% {
            opacity: 1;
        }
        
        60% {
            opacity: 0
        }
        
        75% {
            opacity: 1;
        }
        
        90% {
            opacity: 0
        }
    }
</style>`

document.head.appendChild(style)

const holder = createHolder();


function createHolder(): HTMLElement {
    const element = document.createElement('div');
    element.setAttribute('id', 'flash-error-border');
    element.style.top = "0";
    element.style.left = "0";
    element.style.right = "100%"
    element.style.bottom = "100%";
    element.style.width = "100%";
    element.style.height = "100%";
    element.style.position = "fixed";
    element.style.pointerEvents = "none";
    element.style.zIndex = "10000";
    element.style.border = "4px solid #F00";
    element.style.opacity = "0";
    element.style.animationDuration = "1000ms";
    element.addEventListener('animationend', () => {
        element.style.animationName = '';
    });
    document.body.prepend(element);
    return element;
}

export function flashError() {
    holder.style.animationName = animationName;
}

module.exports = {
    flashError
}