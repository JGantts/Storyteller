import {flashError} from "./flashError";

const footerStatusId = 'status-footer';
const footerStatusClass = 'footer-status-item';
let mParent: Nullable<HTMLElement> = null;
let mLeftStatusItem: Nullable<HTMLElement> = null;
let mRightStatusItem: Nullable<HTMLElement> = null;

function injectFooterStatusStyle() {
    const id = 'footer-status-style';
    if (document.getElementById(id)) {
        return;
    }
    const style = document.createElement('style');
    style.setAttribute('id', id);
    style.innerHTML = `
    #${footerStatusId} {
            position: fixed;
            display: flex;
            bottom: 0;
            left: 0;
            width: calc(100% - 175px);
            margin-right: 175px;
            height: 1.8em;
            pointer-events: none;
            z-index: 7;
        }
        .footer-status-item {
            height: 100%;
            opacity: 0;
            color: #FFFFFF;
            background: #3F2933;
            padding: 0.3em 0.3em 0.3em 0.5em;;
        }
    `
    document.head.appendChild(style);
}

/**
 *
 */
function getStatusElementParent(): Nullable<HTMLElement> {
    
    // Return cached result if any
    if (mParent != null) {
        return mParent;
    }
    
    // Get sibling element
    let sibling: Nullable<HTMLElement> = null;
    try {
        sibling = document.getElementById('canvasHolder') as HTMLElement;
    } catch (e) {
        // ignore error
    }
    
    // Get fallback sibling if desired sibling does not exist
    if (sibling == null) {
        sibling = document.body.firstElementChild as HTMLElement;
    }
    if (sibling == null) {
        console.error("Status element parent could not be created");
        return null;
    }
    // Ensure status style has been added to DOM
    injectFooterStatusStyle();
    
    // Create the parent element
    const parentElement = document.createElement('div');
    parentElement.setAttribute('id', footerStatusId);
    
    // Actually append to dom
    sibling.parentElement!!.append(parentElement);
    
    // Cache result
    mParent = parentElement;
    
    return parentElement;
}

/**
 * Create a child element
 * @param suffix
 */
function createStatusFooterChild(suffix: string): Nullable<HTMLElement> {
    const id = 'status-footer-' + suffix;
    let element: Nullable<HTMLElement> = null;
    try {
        element = document.getElementById(id);
        if (element != null) {
            return element;
        }
    } catch (e) {
    
    }
    // Ensure parent exists
    const parent = getStatusElementParent();
    if (parent == null) {
        return null;
    }
    
    // Create and initialize element
    element = document.createElement('div');
    element.setAttribute('id', id);
    element.classList.add(footerStatusClass);
    
    // Add to DOM and return
    parent.append(element);
    return element;
}


/**
 * Get left status item, creating if it does not exist
 */
function getLeftStatusItem(): Nullable<HTMLElement> {
    if (mLeftStatusItem != null) {
        return mLeftStatusItem;
    }
    // Get left footer status item
    let item: HTMLElement = createStatusFooterChild('left') as HTMLElement;
    if (item == null) {
        return null;
    }
    mLeftStatusItem = item;
    item.style.flex = "1 1 auto";
    return item;
}


/**
 * Get right element, creating if it does not exist
 */
function getRightStatusItem(): Nullable<HTMLElement> {
    if (mRightStatusItem != null) {
        return mRightStatusItem;
    }
    
    // Must create left item to ensure that right item is properly placed.
    if (getLeftStatusItem() == null) {
        return null;
    }
    // Get left footer status item
    let item: HTMLElement = createStatusFooterChild('right') as HTMLElement;
    if (item == null) {
        return null;
    }
    mRightStatusItem = item;
    return item;
}


/**
 * Sets generically the status text for a footer status item
 * @param element
 * @param message
 */
function setStatusItemText(element: HTMLElement, message: string) {
    if (!element.classList.contains(footerStatusClass)) {
        console.error("Cannot clear status element that does not have footer status class");
        return;
    }
    element.innerText = message;
    element.style.opacity = "1";
}

/**
 * Clears generically the status text for a footer status item
 * @param element
 */
function clearStatusItem(element: HTMLElement) {
    if (!element.classList.contains(footerStatusClass)) {
        console.error("Cannot clear status element that does not have footer status class");
        return;
    }
    element.innerText = "";
    element.style.opacity = "0";
}

/**
 * Clears left status item if it exists
 */
function clearStatusLeft() {
    const leftStatusElement = mLeftStatusItem;
    if (leftStatusElement == null) {
        return;
    }
    clearStatusItem(leftStatusElement);
}

/**
 * Sets left status item, creating if it does not exist
 * @param message
 */
function setStatusLeft(message: Nullable<string>) {
    if (message == null || message.length < 1) {
        clearStatusLeft();
    } else {
        const leftStatusElement = getLeftStatusItem();
        if (leftStatusElement == null) {
            return;
        }
        setStatusItemText(leftStatusElement, message);
    }
}

/**
 * Clears right status item if it exists
 */
function clearStatusRight() {
    const rightStatusElement = mRightStatusItem;
    if (rightStatusElement == null) {
        return;
    }
    clearStatusItem(rightStatusElement);
}

/**
 * Sets right status item, creating if it does not exist
 * @param message
 */
function setStatusRight(message: Nullable<string>) {
    if (message == null || message.length < 1) {
        clearStatusRight();
    } else {
        const rightStatusElement = getRightStatusItem();
        if (rightStatusElement == null) {
            return;
        }
        setStatusItemText(rightStatusElement, message);
    }
}

module.exports = {
    setStatusLeft,
    clearStatusLeft,
    setStatusRight,
    clearStatusRight
}