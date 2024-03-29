/// <reference path="./commonTypes.ts" />
/// <reference path="./commonFunctions.ts" />
// noinspection JSUnusedLocalSymbols,JSIgnoredPromiseFromCall

export {};

declare global {
    var fileHelper: typeof FileHelper;
}

type FileRef = {
    id: string;
    dir: string;
    name: string;
    type: string;
}

//$.getScript('../engine-api/CAOS.js

const {FileHelper} = require('../render-helpers/file-helper.js');
const {flashError} = require('./flashError.js');
const ipcRenderer = require('electron').ipcRenderer;
const {getDoorPermeabilityColor} = require('./commonFunctions.js');

let closing = false;
ipcRenderer.on('request-close', async (event, store) => {
    if (closing) {
        return;
    }
    const result = await fileHelper.saveFileIfNeeded()
    if (!result.continue) {
        return;
    }
    closing = true;
    ipcRenderer.send('should-close', true);
});

ipcRenderer.on('request-action', async (event, action: string, data: any) => {
    console.log('action: ' + action);
    switch (action) {
        case 'file-new':
            return (await newFile());
        case 'file-save':
            return (await saveFile());
        case 'file-save-as':
            return (await saveAs());
        case 'file-open':
            return (await openFile());
        case 'zoom-in':
            return zoomByKeyboard(true);
        case 'zoom-out':
            return zoomByKeyboard(false);
        case 'zoom-reset':
            return oneToOneZoom();
        case 'undo':
            return undo();
        case 'redo':
            return redo();
    }
});

globalThis.fileHelper = new FileHelper(
    updateTitle,
    displayFiles,
    (type: string) => {
        switch (type) {
            case "json":
                return JSON.stringify(dataStructures.metaroomDisk!, null, " ")
                    .replace(/(\n|\r|\r\n)[\s]+/g, "\n");
            case "caos":
                let toReturn = parseMetaroomToCaos(dataStructures.metaroomDisk!);
                return toReturn;
        }
    },
    'cart'
);
globalThis.fileHelper.saveFile = saveFile;
const assert = require('assert');
const {clipboard} = require('electron');
const fs = require('fs/promises');
const crypto = require('crypto');
const path = require("path");

const {parseCaosForMetaroom, parseMetaroomToCaos} = require('./caos-to-metaroom-parser.js');
const {geometry} = require('./geometryHelper.js');
const {roomtypeRenderer} = require('./roomtype-renderer.js');
const {selectionRenderer} = require('./selectionRenderer.js');
const {selectionChecker} = require('./selectionChecker.js');
const {dataStructureFactory} = require('./dataStructureFactory.js');
const {potentialFactory} = require('./potentialFactory.js');
const {lineSegmentComparison} = require('./lineSegmentComparison.js');
const {updatePropertiesPanel, updateRoomtypePanel} = require('./properties-panel-updater.js');
// @ts-ignore
const {loadBackground, loadBackgroundAsPromise} = require('./loadBackground.js');
// @ts-ignore
const {getBLKDimensions} = require("./../hard-dependencies/NodeBLKLoader.js");
const {common} = require('./commonFunctions.js');

const displayBLKStatus = true;

let zoom = 1;
let keyboardZoomAmount = 0.3;
let posX = 0;
let posY = 0;

let zooomSettle = 1;

let zoomPanSettleMilliseconds = 80;
let zoomPanSettleTimestampLastChange: number | null;

let dataStructures: DataStructures = {
    metaroomDisk: undefined,
    backgroundFileAbsoluteWorking: undefined,
    points: {},
    walls: [],
    doorsDict: {},
    doorsArray: [],
    pointsSortedX: [],
    pointsSortedY: [],
};

let masterUiState: MasterUiState = {
    keys: {
        shiftKeyIsDown: false,
        ctrlKeyIsDown: false,
        spacebarIsDown: false,
    },

    dragging: {
        isMouseButtonDown: false,

        isDragging: false,
        whatDragging: "",
        idDragging: -1,

        startDragging: undefined,
        stopDragging: undefined,
    },

    state: {
        isViewingRoomType: false,
    },

    camera: {
        redraw: false,
        rezoom: false,
        reposition: false,
    }
};

let canvasHolder = document.getElementById('canvasHolder')!;

window.addEventListener('resize', () => {
    resizeOnscreenCanvasElements();
    masterUiState.camera.redraw = true;
});

/*
backgroundRenderCanvas
selectionUnderCanvas
roomRenderCanvas
potentialCanvas
pastiesRenderCanvas
selectionOverCanvas
*/
let onscreenCanvasElements: { [canvasName: string]: HTMLCanvasElement } = {
    background: document.getElementById("backgroundRenderCanvas") as HTMLCanvasElement,
    selectionUnder: document.getElementById("selectionUnderCanvas") as HTMLCanvasElement,
    room: document.getElementById("roomRenderCanvas") as HTMLCanvasElement,
    potential: document.getElementById("potentialCanvas") as HTMLCanvasElement,
    pasties: document.getElementById("pastiesRenderCanvas") as HTMLCanvasElement,
    selectionOver: document.getElementById("selectionOverCanvas") as HTMLCanvasElement,
};

let offscreenCanvasElements: { [canvasName: string]: HTMLCanvasElement } = {
    background: document.createElement('canvas') as HTMLCanvasElement,
    room: document.createElement('canvas') as HTMLCanvasElement,
    pasties: document.createElement('canvas') as HTMLCanvasElement,
};

let onscreenCanvasContexts: { [canvasName: string]: CanvasRenderingContext2D } = {};

let offscreenCanvasContexts: { [canvasName: string]: CanvasRenderingContext2D } = {};

function resizeOnscreenCanvasElements() {
    for (let key in onscreenCanvasElements) {
        onscreenCanvasElements[key].width = canvasHolder.clientWidth;
        onscreenCanvasElements[key].height = canvasHolder.clientHeight;
        onscreenCanvasContexts[key] = onscreenCanvasElements[key].getContext('2d')!;
    }
}

let roomSizeBlurFix = 2;

function resizeOffscreenCanvasElements(rectangle: { width: number, height: number }) {
    for (let key in offscreenCanvasElements) {
        let inContextRoomSizeBlurFix = roomSizeBlurFix;
        if (key === "background") {
            inContextRoomSizeBlurFix = 1;
        }
        offscreenCanvasElements[key].width = rectangle.width * inContextRoomSizeBlurFix;
        offscreenCanvasElements[key].height = rectangle.height * inContextRoomSizeBlurFix;
        offscreenCanvasContexts[key] = offscreenCanvasElements[key].getContext('2d')!;
    }
}

function copyOffscreenCanvasesToScreen(keys: string[]) {
    if (
        offscreenCanvasElements.background.width !== 0
        && onscreenCanvasElements.selectionUnder.width !== 0
        && dataStructures?.metaroomDisk
    ) {
        for (let key of keys) {
            /*var imgurl= offscreenCanvasElements[key].toDataURL();
            const data = imgurl.replace(/^data:image\/\w+;base64,/, "");
            const buf = Buffer.from(data, "base64");
            fs.writeFile(key + ".png", buf);*/

            onscreenCanvasContexts[key].clearRect(
                0, 0,
                canvasHolder.clientWidth,
                canvasHolder.clientHeight
            );

            let inContextRoomSizeBlurFix = roomSizeBlurFix;
            if (key === "background") {
                inContextRoomSizeBlurFix = 1;
            }

            onscreenCanvasContexts[key].drawImage(
                offscreenCanvasElements[key],
                posX * inContextRoomSizeBlurFix,
                posY * inContextRoomSizeBlurFix,
                canvasHolder.clientWidth * zoom * inContextRoomSizeBlurFix,
                canvasHolder.clientHeight * zoom * inContextRoomSizeBlurFix,
                0,
                0,
                canvasHolder.clientWidth,
                canvasHolder.clientHeight
            );
        }
    }
}


let topCanvasElement = onscreenCanvasElements["selectionOver"];
topCanvasElement.onmousedown = handleMouseDown;
topCanvasElement.onmousemove = handleMouseMove;
topCanvasElement.onmouseup = handleMouseUp;
topCanvasElement.onmouseout = handleMouseOut;
topCanvasElement.onwheel = handleWheel;

window.onkeydown = userTextKeyDown;
window.onkeyup = userTextKeyUp;


window.onmousedown = windowHandleMouseDown;

function getSelectionCheckMargin() {
    return 6 * zoom;
}

function getSelectionSquareWidth() {
    return getSelectionCheckMargin() * 4 / 3;
}

function getRoomLineThickness() {
    const base = 5;
    return (base * zoom + (base / 2))
}

function getSelectionMultiplier() {
    return (masterUiState.keys.ctrlKeyIsDown) ? 1.375 : 1;
}

let _undoList: Command[] = [];
let _redoList: Command[] = [];

//type CommandArgs = { [argKey: string]: any };
type AbsoluteCommand = (arg0: any) => void;

class Command {

    _undo: AbsoluteCommand;
    _undoArgs: any;
    _redo: AbsoluteCommand;
    _redoArgs: any;

    constructor(
        undo: AbsoluteCommand,
        undoArgs: any,
        redo: AbsoluteCommand,
        redoArgs: any
    ) {
        this._undo = undo;
        this._undoArgs = undoArgs;
        this._redo = redo;
        this._redoArgs = redoArgs;
    }

    do() {
        this.redo();
    }

    redo() {
        this._redo(this._redoArgs);
        masterUiState.camera.redraw = true;
    }

    undo() {
        this._undo(this._undoArgs);
        masterUiState.camera.redraw = true;
    }
}

function buildMultiCommand(subcommands: Command[]) {
    let subcommandsForwards = subcommands;
    let subcommandsReversed = subcommands.slice();
    subcommandsReversed.reverse();
    return new Command(
        undoMultiCommand,
        {subcommands: subcommandsReversed},
        redoMultiCommand,
        {subcommands: subcommandsForwards},
    );
}

function undoMultiCommand({subcommands}: { subcommands: Command[] }) {
    for (let subcommand of subcommands) {
        subcommand.undo();
    }
}

function redoMultiCommand({subcommands}: { subcommands: Command[] }) {
    for (let subcommand of subcommands) {
        subcommand.redo();
    }
}

async function newFile() {
    await fileHelper.newFile();
    let backgroundFile = await fileHelper.selectBackgroundFile();
    if (backgroundFile == null) {
        return;
    }
    const isBlk = path.extname(backgroundFile)
        .toLowerCase() === '.blk';
    let width: number;
    let height: number;
    if (isBlk) {
        const {width: blkWidth, height: blkHeight} = getBLKDimensions(backgroundFile);
        width = blkWidth;
        height = blkHeight;
        reloadBackgroundFile(backgroundFile, false);
    } else {
        await reloadBackgroundFile(backgroundFile, true);
        width = img!.width
        height = img!.height
    }

    let fileContents =
        {
            id: crypto.randomUUID(),
            name: "",
            background: path.basename(backgroundFile),
            music: "",
            x: 0,
            y: 0,
            width: width,
            height: height,
            rooms: {},
            perms: {}
        };

    loadMetaroom(
        fileContents,
        backgroundFile
    );
    updateTitle();
    _undoList = [];
    _redoList = [];
    updateBarButtons();
    previousSelectionInstanceId = "uninitialized";
}

async function openFile() {
    await fileHelper.openCartFile();
    updateBarButtons()
}

async function saveFile() {
    let result = await fileHelper.saveCartFile();
    let workingBackgroundFile = dataStructures.backgroundFileAbsoluteWorking;
    let newImgPathAbsolute: string = "";
    if (workingBackgroundFile) {
        newImgPathAbsolute = path.join(
            path.dirname(fileHelper.getCurrentFileRef().path),
            dataStructures!.metaroomDisk!.background
        );
        await fs.copyFile(workingBackgroundFile, newImgPathAbsolute);
    }
    updateBarButtons();
    return result;
}

async function saveAs() {
    await fileHelper.saveCartFileAs();
    updateBarButtons();
}

async function saveCopy() {
    await fileHelper.saveCartFileCopy();
    updateBarButtons();
}

async function closeFile() {
    await fileHelper.closeFile();
    updateBarButtons();
}

async function importFromCaos() {
    await fileHelper.importCaosFile();
    updateBarButtons();
}

async function exportToCaos() {
    await fileHelper.exportToCaos();
    updateBarButtons();
}

async function viewEditRoomType() {
    if (masterUiState.state.isViewingRoomType) {
        masterUiState.state.isViewingRoomType = false;
        canvasHolder.style.cursor = "default";
        previousSelectionInstanceId = "uninitialized";
        previousHoverSelectionInstanceId = "uninitialized";
    } else {
        selectionChecker.setSelectionRoomtypeClick(null);
        masterUiState.state.isViewingRoomType = {
            isViewingPalette: false,
            isEditingRoomtype: false,
        }
    }
}

async function editRoomtypes() {
    let isViewingRoomType = masterUiState.state.isViewingRoomType as ViewingRoomTypeState;

    // assert(isViewingRoomType, "wut?");
    if (!isViewingRoomType) {
        console.error("ViewingRoomTypeState cannot be null");
        flashError();
        return;
    }
    if (isViewingRoomType.isViewingPalette) {
        isViewingRoomType.isViewingPalette = false;
        document.getElementById('roomtype-palette')!.style.height = "0";
        document.getElementById('roomtype-palette')!.style.display = "none";
    } else {
        isViewingRoomType.isViewingPalette = true;
        document.getElementById('roomtype-palette')!.style.height = "auto";
        document.getElementById('roomtype-palette')!.style.display = "initial";
    }
}

function pad2(number: number) {
    return (number < 10 ? '0' : '') + number;
}

async function editingRoomtype(param1: string) {
    let isViewingRoomType = masterUiState.state.isViewingRoomType as ViewingRoomTypeState;
    // assert(isViewingRoomType, "wut?");
    if (!isViewingRoomType) {
        console.error("ViewingRoomTypeState cannot be null");
        flashError();
        return;
    }
    let roomtype = parseFloat(param1.slice(-2));

    let img = document.getElementById(`rooomtype-button-img-${pad2(roomtype)}`)!;

    for (let element of document.getElementsByClassName("editor-button")) {
        (element as HTMLElement).style.animation = "none";
        (element as HTMLElement).style.borderRadius = "8px";
    }

    if (isViewingRoomType.isEditingRoomtype
        && selectionChecker.getSelectionRoomtypeClick() === roomtype
    ) {
        selectionChecker.setSelectionRoomtypeClick(null);
        isViewingRoomType.isEditingRoomtype = false;
        canvasHolder.style.cursor = "default";
    } else {
        selectionChecker.setSelectionRoomtypeClick(roomtype);
        isViewingRoomType.isEditingRoomtype = {
            pickedRoomtype: roomtype,
        };
        canvasHolder.style.cursor = "url('./icons/bucket.png') 6 30, default";
        img.style.animation = "pulse-border 2s linear 0s infinite alternate";
        img.style.borderRadius = "32px";
    }
}

async function permChange(newPerm: number) {
    let door_refA = dataStructures.doorsDict[selectionChecker.getSelectionClick().selectedId]!;
    let door_refB = dataStructures.metaroomDisk!.perms[common.getSortedId(door_refA.roomKeys[0], door_refA.roomKeys[1])]!;
    door_refA.permeability = Math.min(Math.max(newPerm, 0), 100);
    door_refB.permeability = Math.min(Math.max(newPerm, 0), 100);
    masterUiState.camera.redraw = true;
    redrawMetaroom();
}

async function xChange(value: number) {
    dataStructures.metaroomDisk!.x = value;
}

async function yChange(value: number) {
    dataStructures.metaroomDisk!.y = value;
}

async function musicChange(id: string, value: string) {
    switch (id) {
        case "property-metaroom-music":
            dataStructures.metaroomDisk!.music = value;
            break;
        case "property-room-music":
            let room = dataStructures.metaroomDisk!.rooms[selectionChecker.getSelectionClick().selectedId];
            room.music = value;
            break;
        default:
            console.log("internal error");
            break;
    }
}

async function roomtypeButtonMouseOver(param1: string) {
    selectionChecker.setSelectionRoomtypeHover(parseFloat(param1.slice(-2)));
}

async function roomtypeButtonMouseOut() {
    selectionChecker.setSelectionRoomtypeHover(null);
}

function displayFiles(files: { fileRef: FileRef; contents: string }[]) {
    if (!files) {
        return;
    }
    if (files.length === 0) {
        return;
    }
    zoom = 1.0;
    posX = 0;
    posY = 0;
    let file = files[0];
    //for(file in files) {
    let fileContents = null;
    switch (file.fileRef?.type) {
        case "":
            fileContents = "";
            break;
        case ".cart":
            fileContents = file.contents;
            break;
        case ".cos":
            fileContents = parseCaosForMetaroom(file.contents);
            break;
        default:
            throw new Error(`Unknown file type: ${JSON.stringify(file.fileRef)}`);
    }

    loadMetaroom(fileContents);
    updateTitle();
    _undoList = [];
    _redoList = [];
    updateBarButtons();
    masterUiState.camera.redraw = true;
    //}
}

function updateTitle() {
    let title = '';
    if ( fileHelper.hasFile() ) {
        title += fileHelper.getCurrentFileName();
        if (fileHelper.getCurrentFileNeedsSaving()) {
            title += '* ';
        }
        title += '- ';
    }
    title += 'Cartographer\'s Table';
    document.title = title;
    updateBarButtons();
}

function updateBarButtons() {
    let currentFile = fileHelper.getCurrentFileRef();
    if (!currentFile || !fileHelper.getCurrentFileNeedsSaving()) {
        $('#save-file-img')
            .css('opacity', '0.4')
    } else {
        $('#save-file-img')
            .css('opacity', '1')
    }
    if (!currentFile) {
        $('#save-as-img')
            .css('opacity', '0.4')
    } else {
        $('#save-as-img')
            .css('opacity', '1')
    }
    if (!currentFile) {
        $('#save-copy-img')
            .css('opacity', '0.4')
    } else {
        $('#save-copy-img')
            .css('opacity', '1')
    }
    if (!currentFile) {
        $('#export-caos-img')
            .css('opacity', '0.4')
    } else {
        $('#export-caos-img')
            .css('opacity', '1')
    }
    if (_undoList.length === 0) {
        $('#undo-button-img')
            .css('opacity', '0.4')
    } else {
        $('#undo-button-img')
            .css('opacity', '1')
    }
    if (_redoList.length === 0) {
        $('#redo-button-img')
            .css('opacity', '0.4')
    } else {
        $('#redo-button-img')
            .css('opacity', '1')
    }
    if (!currentFile) {
        $('#view-edit-room-type-img')
            .css('opacity', '0.4')
    } else {
        $('#view-edit-room-type-img')
            .css('opacity', '1')
    }
    if (!currentFile || zoom === 1) {
        $('#one-to-one-zoom-img')
            .css('opacity', '0.4')
    } else {
        $('#one-to-one-zoom-img')
            .css('opacity', '1')
    }
}

function oneToOneZoom() {
    let zoomInitial = zoom;
    zoom = 1;
    zooomSettle = 1;
    constrainPositionZoom();
    let zoomFinal = zoom;
    masterUiState.camera.rezoom = true;

    posX += (canvasHolder.clientWidth / 2) * (zoomInitial / zoomFinal - 1);
    posY += (canvasHolder.clientHeight / 2) * (zoomInitial / zoomFinal - 1);
    constrainPositionZoom();
}

function undo() {
    let command = _undoList.pop();
    if (!command) {
        return;
    }
    command.undo()
    _redoList.push(command);
    fileHelper.fileModified();
    rebuildRooms();
    redrawRooms(
        offscreenCanvasContexts.room,
        offscreenCanvasContexts.pasties,
        [...dataStructures.doorsArray, ...dataStructures.walls],
        dataStructures.points,
        dataStructures.metaroomDisk!);
    selectionChecker.resetSelection();
    updateBarButtons();
}

function redo() {
    let command = _redoList.pop();
    if (!command) {
        return;
    }
    command.redo()
    _undoList.push(command);
    fileHelper.fileModified();
    rebuildRooms();
    redrawRooms(
        offscreenCanvasContexts.room,
        offscreenCanvasContexts.pasties,
        [...dataStructures.doorsArray, ...dataStructures.walls],
        dataStructures.points,
        dataStructures.metaroomDisk!);
    selectionChecker.resetSelection();
    updateBarButtons();
}

let lastDownTarget: any = null;

function userTextKeyDown(event: any) {
    if (lastDownTarget !== topCanvasElement) {
        return;
    }

    if (event.defaultPrevented) {
        return; // Do nothing if the event was already processed
    }

    let handled: boolean = false;

    if (event.key === "Shift") {
        shiftKeyDown(event);
    } else if (event.key === "Control") {
        controlKeyDown(event);
    } else if (event.altKey || event.ctrlKey || event.metaKey) {
        handled = controlKeyComboDown(event);
    } else if (event.shiftKey) {
        shiftKeyComboDown(event);
    } else {
        switch (event.key) {
            case 'Backspace':
            case 'Delete':
                editingKeyDown(event);
                return;

            case 'Escape':
                selectionChecker.resetSelection();
                break;

            case ' ':
                spacebarDown(event);
                handled = true;
                break;

            default:
                return;
        }
    }
    if (!handled) {
        return event;
    }
    event.preventDefault();
    return false;
}

function userTextKeyUp(event: any) {
    if (event.defaultPrevented) {
        return; // Do nothing if the event was already processed
    }
    event.preventDefault();
    if (event.key === "Shift") {
        shiftKeyUp(event);
    } else if (event.key === "Control") {
        controlKeyUp(event);
    } else if (event.key === " ") {
        spacebarUp(event);
    }
}

function editingKeyDown(event: any) {
    switch (event.key) {
        case 'Backspace':
        case 'Delete':
            if (tryDelete()) {
                event.preventDefault();
            }
            break;
    }
}


function shiftKeyDown(event: any) {
    masterUiState.keys.shiftKeyIsDown = true;
}

function controlKeyDown(event: any) {
    masterUiState.keys.ctrlKeyIsDown = true;
}

function spacebarDown(event: any) {
    masterUiState.keys.spacebarIsDown = true;
}


function controlKeyComboDown(event: any): boolean {
    if (event.key === 'z' && !event.shiftKey) {
        undo();
        return true;
    } else if (
        event.key === 'y'
        || (event.key === 'z' && event.shiftKey)
    ) {
        redo();
        return true;
    }
    return false;
}

function tryDelete() {
    let selection = selectionChecker.getSelectionClick();
    if (selection.selectedType === "wall") {
        Function.prototype();
    } else if (
        selection.selectedType === "point"
        || selection.selectedType === "corner"
    ) {
        Function.prototype();
    } else if (selection.selectedType === "room") {
        deleteRoom(selection.selectedId);
        selectionChecker.resetSelection();
        return true;
    }
}


function deleteRoom(id: string) {
    let permsStorageCommand = makePermsStorageCommand([id]);
    let deleteCommand = makeDeleteRoomCommand(id);
    let finalCommand = buildMultiCommand([permsStorageCommand, deleteCommand]);
    _undoList.push(finalCommand);
    finalCommand.do();
    _redoList = [];
    fileHelper.fileModified();
    rebuildRooms();
    redrawRooms(
        offscreenCanvasContexts.room,
        offscreenCanvasContexts.pasties,
        [...dataStructures.doorsArray, ...dataStructures.walls],
        dataStructures.points,
        dataStructures.metaroomDisk!);
    selectionChecker.resetSelection();
    updateBarButtons();
}

function controlKeyUp(event: any) {
    if (masterUiState.keys.ctrlKeyIsDown) {
        masterUiState.keys.ctrlKeyIsDown = false;

        if (masterUiState.dragging.isDragging) {
            masterUiState.dragging = {
                isMouseButtonDown: false,

                isDragging: false,
                whatDragging: "",
                idDragging: -1,

                startDragging: undefined,
                stopDragging: undefined,
            }
        }
    }
}

function shiftKeyComboDown(event: any) {
    if (event.key === "Shift") {
        masterUiState.keys.shiftKeyIsDown = true;
    }
}

function shiftKeyUp(event: any) {
    if (masterUiState.keys.shiftKeyIsDown) {
        masterUiState.keys.shiftKeyIsDown = false;

        if (masterUiState.dragging.isDragging) {
            masterUiState.dragging = {
                isMouseButtonDown: false,

                isDragging: false,
                whatDragging: "",
                idDragging: -1,

                startDragging: undefined,
                stopDragging: undefined,
            }
        }
    }
}

function spacebarUp(event: any) {
    if (masterUiState.keys.spacebarIsDown) {
        masterUiState.keys.spacebarIsDown = false;

        if (masterUiState.dragging.isDragging) {
            masterUiState.dragging = {
                isMouseButtonDown: false,

                isDragging: false,
                whatDragging: "",
                idDragging: -1,

                startDragging: undefined,
                stopDragging: undefined,
            }
        }
    }
}

function windowHandleMouseDown(event: any) {
    lastDownTarget = event.target;
}

function handleMouseDown(event: any) {
    if (dataStructures?.metaroomDisk == null) {
        return;
    }
    // tell the browser we're handling this event
    event.preventDefault();
    event.stopPropagation();
    lastDownTarget = event.target;
    masterUiState.dragging.isMouseButtonDown = true;
    let startX = (parseInt(event.offsetX) + (posX / zoom)) * zoom;
    let startY = (parseInt(event.offsetY) + (posY / zoom)) * zoom;

    let isViewingRoomType = masterUiState.state.isViewingRoomType as ViewingRoomTypeState;

    if (isViewingRoomType) {
        selectionChecker.checkSelectionRoomtypeClick(startX, startY, dataStructures);
        if (isViewingRoomType.isEditingRoomtype) {
            let clicked: string = selectionChecker.getSelectionRoomtypeClick().selectedId;
            retypeRoom(clicked, isViewingRoomType.isEditingRoomtype.pickedRoomtype);
        }
    } else {
        selectionChecker.checkSelectionClick(startX, startY, dataStructures);
    }
}

function handleMouseUp(event: any) {
    window.focus();
    if (dataStructures?.metaroomDisk == null) {
        return;
    }
    event.preventDefault();
    event.stopPropagation();
    masterUiState.dragging.isMouseButtonDown = false;

    tryCreateRoom();

    masterUiState.dragging = {
        isMouseButtonDown: false,

        isDragging: false,
        whatDragging: "",
        idDragging: -1,

        startDragging: undefined,
        stopDragging: undefined,
    }
}

function handleMouseOut(event: any) {
    masterUiState.keys.shiftKeyIsDown = false;
    // return if we're not dragging
    /*masterUiState.dragging.isMouseButtonDown = false;

    isDragging = false;
    whatDragging = "";
    idDragging = -1;
    startDragging = null;
    stopDragging = null;*/
}

function handleMouseMove(event: any) {
    // tell the browser we're handling this event
    event.preventDefault();
    event.stopPropagation();
    // calculate the current mouse position
    let currX = parseInt(event.offsetX + (posX / zoom)) * zoom;
    let currY = parseInt(event.offsetY + (posY / zoom)) * zoom;

    if (!dataStructures.metaroomDisk!) {
        return;
    }

    let isViewingRoomType = masterUiState.state.isViewingRoomType as ViewingRoomTypeState;

    if (!masterUiState.dragging.isDragging) {
        if (isViewingRoomType) {
            selectionChecker.checkSelectionRoomtypeHover(currX, currY, dataStructures);
        } else {
            selectionChecker.checkSelectionHover(currX, currY, dataStructures);
        }
    }

    /*console.log({
      isMouseButtonDown: masterUiState.dragging.isMouseButtonDown,
      isDragging: isDragging,
      "selected.selectedType": selected.selectedType,
    });*/

    if (masterUiState.dragging.isMouseButtonDown) {
        if (masterUiState.keys.spacebarIsDown) {
            posX -= event.movementX;
            posY -= event.movementY;
            masterUiState.camera.reposition = true;
            constrainPositionZoom();
        } else {
            let selection = selectionChecker.getSelectionClick();
            if (!masterUiState.dragging.isDragging) {
                if (selection.selectedType === "wall"
                    || selection.selectedType === "door"
                ) {
                    masterUiState.dragging = {
                        isMouseButtonDown: true,

                        isDragging: true,
                        whatDragging: selection.selectedType,
                        idDragging: selection.selectedId,

                        startDragging: {x: currX, y: currY},
                        stopDragging: {x: currX, y: currY},
                    }
                } else if (selection.selectedType === "point") {
                    masterUiState.dragging = {
                        isMouseButtonDown: true,

                        isDragging: true,
                        whatDragging: selection.selectedType,
                        idDragging: selection.selectedId,

                        startDragging: dataStructures.points[selection.selectedId],
                        stopDragging: {x: currX, y: currY},
                    }
                } else if (selection.selectedType === "corner") {
                    masterUiState.dragging = {
                        isMouseButtonDown: true,

                        isDragging: true,
                        whatDragging: selection.selectedType,
                        idDragging: selection.selectedId,

                        startDragging: dataStructures.points[selection.selectedId],
                        stopDragging: {x: currX, y: currY},
                    }
                } else if (selection.selectedType === "side") {
                    masterUiState.dragging = {
                        isMouseButtonDown: true,

                        isDragging: true,
                        whatDragging: selection.selectedType,
                        idDragging: selection.selectedId,

                        startDragging: {x: currX, y: currY},
                        stopDragging: {x: currX, y: currY},
                    }
                } else {
                    masterUiState.dragging = {
                        isMouseButtonDown: true,

                        isDragging: true,
                        whatDragging: "cursor_point",
                        idDragging: undefined,

                        startDragging: {x: Math.round(currX), y: Math.round(currY)},
                        stopDragging: {x: currX, y: currY},
                    }
                }
            }
        }
        if (masterUiState.dragging.isDragging) {
            masterUiState.dragging.stopDragging = {x: currX, y: currY};
        }
    }


    //checkSelection(startX, startY);
}

function handleWheel(event: any) {
    event.preventDefault();

    if (event.ctrlKey) {
        const zoomAmount = event.deltaY * 0.0025;
        const offsetX = event.offsetX;
        const offsetY = event.offsetY;
        zoomBy(zoomAmount, offsetX, offsetY);
    } else {
        if (event.altKey) {
            posX += event.deltaY * 2;
        } else {
            posX += event.deltaX * 2;
            posY += event.deltaY * 2;
        }
        masterUiState.camera.reposition = true;
    }
    constrainPositionZoom();
}

function zoomByKeyboard(zoomIn: boolean) {
    const zoomAmount = keyboardZoomAmount * (zoomIn ? -1 : 1);
    const offsetX = (canvasHolder.clientWidth / 2);
    const offsetY = (canvasHolder.clientHeight / 2);
    zoomBy(zoomAmount, offsetX, offsetY);
}

function zoomBy(zoomAmount: number, offsetX: number, offsetY: number) {
    let zoomInitial = zoom;
    zoom += zoomAmount;
    constrainPositionZoom();
    let zoomFinal = zoom;
    masterUiState.camera.rezoom = true;

    posX += offsetX * (zoomInitial / zoomFinal - 1);
    posY += offsetY * (zoomInitial / zoomFinal - 1);
}

function constrainPositionZoom() {
    if (dataStructures.metaroomDisk == null) {
        posX = 0;
        posY = 0;
        return;
    }
    zoom = Math.min(zoom, 2);
    zoom = Math.max(zoom, 1 / roomSizeBlurFix);

    const maxX = dataStructures.metaroomDisk.width - (canvasHolder.clientWidth * zoom);
    posX = Math.min(posX, maxX);
    posX = Math.max(posX, 0);
    const maxY = dataStructures.metaroomDisk.height - (canvasHolder.clientHeight * zoom);
    posY = Math.min(posY, maxY);
    posY = Math.max(posY, 0);
}

function tryCreateRoom() {
    let selection = selectionChecker.getSelectionHover();
    if (selection.selectedType === "") {
        selection = selectionChecker.getSelectionClick();
    }
    let _shiftKeyIsDown = masterUiState.keys.shiftKeyIsDown;
    let _ctrlKeyIsDown = masterUiState.keys.ctrlKeyIsDown;
    let newRooms = potentialFactory.getPotentialRooms
    (
        masterUiState,
        selection,
        dataStructures
    );
    if (!newRooms || newRooms.length === 0) {
        return;
    }
    let commands = [];
    if (_shiftKeyIsDown || _ctrlKeyIsDown) {
        for (let index in newRooms) {
            let room = newRooms[index];
            room.id = crypto.randomUUID();
            let addCommand = makeAddRoomCommand(room.id, room);
            commands.push(addCommand);
        }
    } else {
        let permsStorageCommand = makePermsStorageCommand(newRooms.map((newRoom: Room) => newRoom.id));
        commands.push(permsStorageCommand);
        for (let index in newRooms) {
            let room = newRooms[index];
            let addCommand = makeAddRoomCommand(room.id, room);
            let deleteCommand = makeDeleteRoomCommand(room.id);
            commands.push(permsStorageCommand);
            commands.push(deleteCommand);
            commands.push(addCommand);
            commands.push(permsStorageCommand);
        }
        commands.push(permsStorageCommand);
    }
    let finalCommand = buildMultiCommand(commands);
    _undoList.push(finalCommand);
    finalCommand.do();
    _redoList = [];
    fileHelper.fileModified();
    rebuildRooms();
    redrawRooms(
        offscreenCanvasContexts.room,
        offscreenCanvasContexts.pasties,
        [...dataStructures.doorsArray, ...dataStructures.walls],
        dataStructures.points,
        dataStructures.metaroomDisk!);
    selectionChecker.resetSelection();
    updateBarButtons();
}

function makeAddRoomCommand(id: string, room: Room) {
    return new Command(
        deleteRoomAbsolute,
        {id},
        addRoomAbsolute,
        {id, room},
    );
}

function addRoomAbsolute({id, room}: { id: string, room: Room }) {

    // assert(id && id !== "", `Instead of UUID, found ${id}`);
    if (!id || id === "") {
        console.error(`Room id is not UUID, found ${id}`);
        flashError();
        return;
    }
    // assert(room, `Instead of room, found ${room}`);
    if (!room) {
        console.error(`Instead of room, found ${room}`);
        flashError();
        return;
    }
    // assert(room.leftX != room.rightX, `Instead of room, found ${JSON.stringify(room)}`);
    if (room.leftX === room.rightX) {
        console.error(`Instead of room, found ${JSON.stringify(room)}`);
        flashError();
        return;
    }
    let newPerms = dataStructureFactory.getPermsFromRoomPotential(room, dataStructures);
    dataStructures.metaroomDisk!.rooms[id] = room;

    for (const permKey in newPerms) {
        dataStructures.metaroomDisk!.perms[newPerms[permKey].id] = newPerms[permKey];
    }
}

function retypeRoom(id: string, type: number) {
    let myCommand = makeRetypeRoomCommand(id, type);
    if (myCommand == null) {
        return;
    }
    _undoList.push(myCommand);
    myCommand.do();
    _redoList = [];
    fileHelper.fileModified();
    rebuildRooms();
    redrawRooms(
        offscreenCanvasContexts.room,
        offscreenCanvasContexts.pasties,
        [...dataStructures.doorsArray, ...dataStructures.walls],
        dataStructures.points,
        dataStructures.metaroomDisk!);
    selectionChecker.resetSelection();
    updateBarButtons();
}

function makeRetypeRoomCommand(id: string, type: number) {
    let roomOriginal = dataStructures.metaroomDisk!.rooms[id];
    // assert(roomOriginal, "");
    if (!roomOriginal) {
        console.error("Cannot retype room. Original is undefined");
        flashError();
        return null;
    }
    return new Command(
        retypeRoomAbsolute,
        {id, type: roomOriginal.roomType},
        retypeRoomAbsolute,
        {id, type: type},
    );
}

function retypeRoomAbsolute({id, type}: { id: string, type: number }) {
    dataStructures.metaroomDisk!.rooms[id].roomType = type;
}

function makeRepermDoorsCommand(id: string, permeability: number) {
    let roomOriginal = dataStructures.metaroomDisk!.rooms[id];
    // assert(roomOriginal, "");
    if (!roomOriginal) {
        console.error("Cannot re-perm room. Original is undefined");
        flashError();
        return null;
    }
    return new Command(
        repermDoorsAbsolute,
        {id, perm: dataStructures.doorsDict[id].permeability},
        repermDoorsAbsolute,
        {id, prem: permeability},
    );
}

function repermDoorsAbsolute({id, perm}: { id: string, perm: number }) {
    dataStructures.doorsDict[id].permeability = perm;
    //dataStructures.metaroomDisk.
}

function makeDeleteRoomCommand(id: string) {
    let roomOriginal = dataStructures.metaroomDisk!.rooms[id];
    let room = {
        id: roomOriginal.id,
        leftX: roomOriginal.leftX,
        rightX: roomOriginal.rightX,
        leftCeilingY: roomOriginal.leftCeilingY,
        rightCeilingY: roomOriginal.rightCeilingY,
        leftFloorY: roomOriginal.leftFloorY,
        rightFloorY: roomOriginal.rightFloorY,
        roomType: roomOriginal.roomType,
    }
    return new Command(
        addRoomAbsolute,
        {id, room},
        deleteRoomAbsolute,
        {id},
    );
}

function deleteRoomAbsolute({id}: { id: string }) {
    delete dataStructures.metaroomDisk!.rooms[id];
    for (let permKey in dataStructures.metaroomDisk!.perms) {
        let perm = dataStructures.metaroomDisk!.perms[permKey];
        if (perm.rooms.a === id || perm.rooms.b === id) {
            delete dataStructures.metaroomDisk!.perms[permKey];
        }
    }
}

function makePermsStorageCommand(ids: string[]) {
    let toStore: { [keys: string]: Perm } = {};
    for (let permKey in dataStructures.metaroomDisk!.perms) {
        let perm = dataStructures.metaroomDisk!.perms[permKey];
        if (ids.some(id =>
            (id === perm.rooms.a
                || id === perm.rooms.b)
        )) {
            toStore[perm.id] = perm;
        }
    }
    return new Command(
        permsStorageAbsolute,
        {toStore},
        permsStorageAbsolute,
        {toStore},
    );
}

function permsStorageAbsolute({toStore}: any) {
    for (let storedKey in toStore) {
        let stored = toStore[storedKey];
        let existing = dataStructures.metaroomDisk!.perms[stored.id];
        if (existing) {
            existing.permeability = stored.permeability;
        }
    }
}

function rebuildRooms() {
    let wallsOverreach = dataStructureFactory.getWallsFromRooms(dataStructures.metaroomDisk!.rooms)
        .filter((val: any) => {
            return val
        });
    //console.log(dataStructures.metaroomDisk.perms);
    let doorsArray =
        dataStructureFactory
            .getDoorsFromRooms(dataStructures.metaroomDisk!.rooms, dataStructures.metaroomDisk!.perms)
            .filter((val?: Door) => {
                return val
            })
            .filter((val: Door) => {
                return (
                    val.start.x !== val.end.x ||
                    val.start.y !== val.end.y
                );
            });
    let walls = dataStructureFactory.subtractSegmentsFromSegments(wallsOverreach, doorsArray)
        .filter((val: any) => {
            return val
        });
    let points = dataStructureFactory.getPointsFromRooms(dataStructures.metaroomDisk!.rooms);
    let pointsSortedX = Object.values(points);
    pointsSortedX = pointsSortedX.sort((a: any, b: any) => a.x - b.x);
    let pointsSortedY = Object.values(points);
    pointsSortedY = pointsSortedY.sort((a: any, b: any) => a.y - b.y);

    let doorsDict: { [key: string]: Door } = {};
    for (let door of doorsArray) {
        doorsDict[door.id] = door;
    }

    dataStructures = {
        metaroomDisk: dataStructures.metaroomDisk,
        backgroundFileAbsoluteWorking: dataStructures.backgroundFileAbsoluteWorking,
        points,
        walls,
        doorsDict,
        doorsArray,
        pointsSortedX: (pointsSortedX as Point[]),
        pointsSortedY: (pointsSortedY as Point[])
    };
}

let blankRoom: Metaroom = {
    id: "",
    name: "",
    background: "",
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    music: "",
    rooms: {},
    perms: {},
};

function loadMetaroom(metaroomIn: string | Metaroom, additionalBackground?: string) {

    let metaroom: Metaroom;
    if (typeof metaroomIn === "string") {
        if (metaroomIn !== "") {
            metaroom = JSON.parse(metaroomIn);
        } else {
            metaroom = blankRoom;
        }
    } else if (metaroomIn) {
        metaroom = metaroomIn
    } else {
        metaroom = blankRoom;
    }


    dataStructures = {
        metaroomDisk: metaroom,
        backgroundFileAbsoluteWorking: undefined,
        points: {},
        walls: [],
        doorsDict: {},
        doorsArray: [],
        pointsSortedX: [],
        pointsSortedY: [],
    } as DataStructures;

    if (additionalBackground) {
        dataStructures.backgroundFileAbsoluteWorking = additionalBackground;
    } else {
        //set img to null to re-trigger its loading
        img = null;
    }

    resizeOffscreenCanvasElements(dataStructures.metaroomDisk!);
    rebuildRooms();
    redrawMetaroom();
}

let imgPathRel = "";
let img: (null | ImageData | HTMLImageElement);

async function reloadBackgroundFile(backgroundFileAbsoluteWorking?: string, synchronous: Boolean = false) {
    let imgPathAbsolute =
        backgroundFileAbsoluteWorking
        ?? path.join(
            fileHelper.getCurrentFileRef().dir,
            dataStructures.metaroomDisk!.background
        );

    switch (path.extname(imgPathAbsolute)
        .toLowerCase()) {

        case ".blk":
            img = null;
            if (synchronous) {
                await loadBackgroundAsPromise(imgPathAbsolute, displayBLKStatus, (image: BlkData) => {
                    img = image;
                    masterUiState.camera.redraw = true;
                });
            } else {
                // Loads image in background thread if possible
                loadBackground(imgPathAbsolute, displayBLKStatus, (image: BlkData) => {
                    img = image;
                    masterUiState.camera.redraw = true;
                    redrawMetaroom();
                });
            }
            return
        case ".jpg":
        case ".png":
        case ".bmp":
            img = new Image;
            img.src = imgPathAbsolute;
            await img.decode();
            break;

        default:
            console.log(`Unsupported file type: ${path.extname(imgPathAbsolute)}`);
            break;
    }
    masterUiState.camera.redraw = true;
}


async function redrawMetaroom() {
    redrawRooms(
        offscreenCanvasContexts.room,
        offscreenCanvasContexts.pasties,
        [...dataStructures.doorsArray, ...dataStructures.walls],
        dataStructures.points,
        dataStructures.metaroomDisk!);
    offscreenCanvasContexts.background.clearRect(0, 0, dataStructures.metaroomDisk!.width * roomSizeBlurFix, dataStructures.metaroomDisk!.height * roomSizeBlurFix);
    if (dataStructures.metaroomDisk!.background) {
        if (!img) {
            await reloadBackgroundFile();
        }
        if (img) {
            if (img instanceof Image) {
                offscreenCanvasContexts.background.moveTo(0, 0);
                offscreenCanvasContexts.background.drawImage(img as HTMLImageElement, 0, 0);
            } else if (img instanceof ImageData) {
                offscreenCanvasContexts.background.putImageData(img as ImageData, 0, 0);
            } else {
                // @ts-ignore
                console.log(`Unsupported file type: ${img.constructor.name}${path.extname(dataStructures.metaroomDisk!.background)}`);
            }
        }
    }
}

async function redrawRoomsDefault() {
    redrawRooms(
        offscreenCanvasContexts.room,
        offscreenCanvasContexts.pasties,
        [...dataStructures.doorsArray, ...dataStructures.walls],
        dataStructures.points,
        dataStructures.metaroomDisk!);
}

async function redrawRooms(
    roomCtx: CanvasRenderingContext2D,
    pastiesCtx: CanvasRenderingContext2D,
    lines: Door[],
    points: { [key: string]: Point; },
    metaroom: Metaroom
) {

    roomCtx.clearRect(0, 0, metaroom.width * roomSizeBlurFix, metaroom.height * roomSizeBlurFix);
    pastiesCtx.clearRect(0, 0, metaroom.width * roomSizeBlurFix, metaroom.height * roomSizeBlurFix);
    roomCtx.lineWidth = getRoomLineThickness();
    lines
        .forEach((line, i) => {
            roomCtx.strokeStyle = getDoorPermeabilityColor(line.permeability);
            roomCtx.beginPath();
            roomCtx.moveTo(line.start.x * roomSizeBlurFix, line.start.y * roomSizeBlurFix);
            roomCtx.lineTo(line.end.x * roomSizeBlurFix, line.end.y * roomSizeBlurFix);
            roomCtx.stroke();
        });
    redrawPasties(pastiesCtx, points, metaroom);
    //redrawSelection();
}

async function redrawPasties(
    pastiesCtx: CanvasRenderingContext2D,
    points: { [key: string]: Point; },
    metaroom: Metaroom
) {
    //console.log(points);
    //console.log(new Error().stack);
    pastiesCtx.lineWidth = getRoomLineThickness();
    pastiesCtx.fillStyle = 'rgb(255, 255, 255)';
    for (const key in points) {
        pastiesCtx.beginPath();
        pastiesCtx.arc(points[key].x * roomSizeBlurFix, points[key].y * roomSizeBlurFix, getRoomLineThickness() * 1.2, 0, 2 * Math.PI, true);
        pastiesCtx.fill();
    }
}

async function redrawPotentialRooms(
    roomCtx: CanvasRenderingContext2D,
    pastiesCtx: CanvasRenderingContext2D,
    lines: Door[],
    points: SimplePoint[],
    metaroom: Metaroom
) {

    roomCtx.clearRect(0, 0, canvasHolder.clientWidth, canvasHolder.clientHeight);
    pastiesCtx.clearRect(0, 0, canvasHolder.clientWidth, canvasHolder.clientHeight);
    const zoomMod = 1 / zoom;
    // Not sure why these lines render so much thicker than everywhere else
    roomCtx.lineWidth = (getRoomLineThickness() * 0.75) * zoomMod;
    lines
        .forEach((line, i) => {
            roomCtx.strokeStyle = getDoorPermeabilityColor(line.permeability);
            roomCtx.beginPath();
            roomCtx.moveTo((line.start.x - posX) * zoomMod, (line.start.y - posY) * zoomMod);
            roomCtx.lineTo((line.end.x - posX) * zoomMod, (line.end.y - posY) * zoomMod);
            roomCtx.stroke();
        });
    redrawPotentialPasties(pastiesCtx, points, metaroom);
    //redrawSelection();
}

async function redrawPotentialPasties(
    pastiesCtx: CanvasRenderingContext2D,
    points: SimplePoint[],
    metaroom: Metaroom
) {
    const zoomMod = 1 / zoom;
    //console.log(points);
    //console.log(new Error().stack);
    pastiesCtx.lineWidth = getRoomLineThickness() / zoomMod;
    pastiesCtx.fillStyle = 'rgb(255, 255, 255)';
    for (const key in points) {
        pastiesCtx.beginPath();
        pastiesCtx.arc((points[key].x - posX) * zoomMod, (points[key].y - posY) * zoomMod, getRoomLineThickness() * 0.8 * zoomMod, 0, 2 * Math.PI, true);
        pastiesCtx.fill();
    }
}

let secondsPassed: number;
let oldTimestamp: number;
let fps: number;
let frameIndex = -1;

let previousHoverSelectionInstanceId = "uninitialized";
let previousSelectionInstanceId = "uninitialized";

async function redrawSelection(timestamp: number) {
    frameIndex += 1;
    if (frameIndex % 3 === 0) {
        if (!oldTimestamp) {
            oldTimestamp = timestamp;
            fps = 0;
        } else {
            secondsPassed = (timestamp - oldTimestamp) / 1000;
            oldTimestamp = timestamp;
            fps = Math.round(1 / secondsPassed);
            // console.log(fps)
        }

        if (dataStructures?.metaroomDisk) {

            if (zoomPanSettleTimestampLastChange
                && (timestamp - zoomPanSettleTimestampLastChange) > zoomPanSettleMilliseconds) {
                zoomPanSettleTimestampLastChange = null;
                zooomSettle = zoom;
            }

            if (masterUiState.state.isViewingRoomType) {
                if (true || zoomPanSettleTimestampLastChange === null) {
                    let selection = selectionChecker.getSelectionRoomtypeHover();
                    if (selection.selectedType === "") {
                        selection = selectionChecker.getSelectionRoomtypeClick();
                    }

                    if (previousHoverSelectionInstanceId !== selection.selectionInstancedId
                        || previousHoverSelectionInstanceId === "uninitialized") {
                        previousHoverSelectionInstanceId = selection.selectionInstancedId;
                        updateRoomtypePanel(
                            document.getElementById("properties-panel"),
                            selection,
                            dataStructures);
                    }

                    onscreenCanvasContexts.selectionUnder.clearRect(0, 0, canvasHolder.clientWidth, canvasHolder.clientHeight);
                    roomtypeRenderer.redrawRoomtypes(onscreenCanvasContexts.selectionUnder, dataStructures);
                }
            } else {
                let selection = selectionChecker.getSelectionHover();
                if (selection.selectedType === "") {
                    selection = selectionChecker.getSelectionClick();
                }

                if (previousSelectionInstanceId !== selection.selectionInstancedId
                    || previousSelectionInstanceId === "uninitialized"
                ) {
                    previousSelectionInstanceId = selection.selectionInstancedId;
                    updatePropertiesPanel(
                        document.getElementById("properties-panel"),
                        selection,
                        dataStructures);
                }

                let potentialRooms = potentialFactory.getPotentialRooms
                (
                    masterUiState,
                    selection,
                    dataStructures
                );
                if (masterUiState.camera.rezoom) {
                    redrawRoomsDefault();
                }
                redrawPotential(potentialRooms, dataStructures);
                onscreenCanvasContexts.selectionUnder.clearRect(0, 0, dataStructures.metaroomDisk!.width * roomSizeBlurFix, dataStructures.metaroomDisk!.height * roomSizeBlurFix);
                onscreenCanvasContexts.selectionOver.clearRect(0, 0, dataStructures.metaroomDisk!.width * roomSizeBlurFix, dataStructures.metaroomDisk!.height * roomSizeBlurFix);
                selectionRenderer.redrawSelection(onscreenCanvasContexts.selectionUnder, onscreenCanvasContexts.selectionOver, dataStructures, selection);
            }

            masterUiState.camera.redraw =
                masterUiState.camera.redraw ||
                masterUiState.camera.rezoom ||
                masterUiState.camera.reposition;

            if (
                masterUiState.camera.rezoom ||
                masterUiState.camera.reposition
            ) {
                zoomPanSettleTimestampLastChange = timestamp;
            }

            if (masterUiState.camera.rezoom) {
                updateBarButtons();
            }

            if (masterUiState.camera.redraw) {
                copyOffscreenCanvasesToScreen(
                    [
                        "background",
                        "room",
                        "pasties",
                    ]
                );
            }
            masterUiState.camera.redraw = false;
            masterUiState.camera.rezoom = false;
            masterUiState.camera.reposition = false;
        }
    }
    window.requestAnimationFrame(redrawSelection);
}

function redrawPotential(
    potentialRooms: Room[],
    dataStructures: DataStructures
) {
    onscreenCanvasContexts.potential.clearRect(
        0, 0,
        dataStructures.metaroomDisk!.width * roomSizeBlurFix,
        dataStructures.metaroomDisk!.height * roomSizeBlurFix);
    if (potentialRooms.length != 0) {
        let doorsWalls: Door[] = [];
        for (let potentialRoom of potentialRooms) {
            doorsWalls = doorsWalls.concat(dataStructureFactory.getDoorsWallsPotentialFromRoomPotential(potentialRoom, dataStructures));
        }
        let points = dataStructureFactory.getPointsFromRooms(potentialRooms);
        redrawPotentialRooms(onscreenCanvasContexts.potential, onscreenCanvasContexts.potential, doorsWalls, points, dataStructures.metaroomDisk!);
    }
}

resizeOnscreenCanvasElements();
resizeOffscreenCanvasElements({width: 100, height: 100});
//newFile();
window.requestAnimationFrame(redrawSelection);
