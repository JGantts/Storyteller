
// Flash error init
const animationName = 'flash-error-red-animation';
const flashErrorElement = createFlashErrorElement();


/**
 * Creates the flash error animation
 * This animation will run when a small error has occurred that has
 * resulted in a no-op
 */
function createFlashAnimation() {
    const styleName = animationName + '-generated-style';
    if (document.getElementById(styleName) != null) {
        return;
    }
    const style = document.createElement('style');
    style.setAttribute('id', styleName);
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
}

/**
 * Creates the flash error element
 * This element is responsible for flashing or displaying
 * to the user that a slight error has occurred
 */
function createFlashErrorElement(): HTMLElement {
    createFlashAnimation();
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
    flashErrorElement.style.animationName = animationName;
}


module.exports = {
    flashError
}