/*
 * Global variables.
 */
const chars = [
    "sp", "!", "\"", "#", "$", "%", "&", "'", "(", ")", "*", "+", ",", "-", ".", "/", "0", "1", "2", "3", "4",
    "5", "6", "7", "8", "9", ":", ";", "<", "=", ">", "?", "@", "A", "B", "C", "D", "E", "F", "G", "H", "I",
    "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "[", "\\",
    "]", "^", "_", "`", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n",
    "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "{", "|", "}", "~"
]

let numRows = 14;
let numCols = 16;
let padTop = 1;
let padBottom = 3;
let padLeft = 1;
let padRight = 9;
let isMouseDown = false;
let bitmapStrings = new Array(chars.length);

/*
 * Creates all the UI elements.
 */
function init() {
    createInputFields();
    createButtons();
    createOutputField();
    initAllTables();
}

/*
 * Print the final bitmap array in the output field.
 */
function outputBitmaps() {
    let outputField = document.getElementById("outputField");
    outputField.value = "";

    outputField.value +=
        `static const uint16_t Font${numCols - padLeft - padRight}x${numRows} [] = {\n`;

    generateCharBitmaps();

    for (var i = 0; i < bitmapStrings.length; i++) {
        outputField.value += "    ";
        outputField.value += bitmapStrings[i];
    }

    outputField.value += `};`

    outputFieldRefreshDims();
}

/*
 * Loops over each character table and generates 
 * a string of bitmaps for each character. 
 */
function generateCharBitmaps() {
    for (var t_i = 0; t_i < chars.length; t_i++) {
        var table = document.getElementById(`charTable${t_i}`);
        var charBitmap = "";
        for (var i = 0, row; row = table.rows[i]; i++) {
            let bitString = "";

            for (var j = 0, col; col = row.cells[j]; j++) {
                bitString += getBit(col);
            }

            let hexString = "0x" + parseInt(bitString, 2).toString(16).padStart(4, '0').toUpperCase();
            charBitmap += hexString + ", ";
        }
        charBitmap += `/* ${chars[t_i]} */\n`;
        bitmapStrings[t_i] = charBitmap;
    }
}

/*
 * Returns the state of a cell based on its color.
 *   White/Gray  "0"
 *   Black       "1"
 */
function getBit(td) {
    switch (td.style.backgroundColor) {
        case "white":
        case "gray":
            return "0";
            break;
        case "black":
            return "1";
            break;
    }
}

/*
 * Colors a cell black (i.e. sets that bit to 1).
 */
function selectCell(td) {
    if (td.style.backgroundColor == "gray") return;
    td.style.backgroundColor = "black";
}

/*
 * Colors a cell white (i.e. sets that bit to 0).
 */
function deselectCell(td) {
    if (td.style.backgroundColor == "gray") return;
    td.style.backgroundColor = "white"
}

/*
 * Creates the main table for the whole character set
 * and the individual tables for each character.
 */
function initAllTables() {
    console.log(chars.length);
    var tablesDiv = document.getElementById("tablesDiv");

    var tbl = document.createElement('table');
    tbl.className = "charTables";

    var tbdy = document.createElement('tbody');

    for (var row = 0; row < chars.length / 5; row++) {
        var tr = document.createElement('tr');
        tr.className = "charTablesRow";

        for (var j = 0; j < 5; j++) {
            var tdChar = document.createElement('td');
            tdChar.className = "charTablesCellChar";
            tdChar.innerHTML += chars[j + row * 5];
            var tdTable = document.createElement('td');
            tdTable.className = "charTablesCellTable";
            var tdTableContents = initCharTable();
            tdTableContents.id = `charTable${j + row * 5}`;
            tdTable.appendChild(tdTableContents);
            tr.appendChild(tdChar);
            tr.appendChild(tdTable);
        }
        tbdy.appendChild(tr);

    }
    tbl.appendChild(tbdy);
    tablesDiv.appendChild(tbl);
}


/*
 * Creates a table for a single character.
 */
function initCharTable() {
    var tbl = document.createElement('table');
    tbl.addEventListener("mouseleave", eventCellMouseOut, false);
    tbl.addEventListener("mousedown", eventCellMouseDown, false);
    tbl.addEventListener("mouseup", eventCellMouseUp, false);
    tbl.addEventListener("mouseover", eventCellMouseOver, false);

    var tbdy = document.createElement('tbody');

    for (row = 0; row < numRows; row++) {
        var tr = document.createElement('tr');
        tr.className = "tableRow";
        tr.id = `${row}`;
        for (var col = 0; col < numCols; col++) {
            var td = document.createElement('td');
            td.className = "tableCell";
            td.id = `${row},${col}`;
            if (row < padTop || row >= numRows - padBottom || col <
                padLeft || col >= numCols - padRight) {
                td.style.backgroundColor = "gray";
            } else {
                td.style.backgroundColor = "white";
            }
            tr.appendChild(td);
        }

        tbdy.appendChild(tr);
    }
    tbl.appendChild(tbdy);
    return tbl;
}

/*
 * Creates the two buttons, "Create Tables" and "Generate".
 * Create Tables create a new set of tables with the selected options.
 * Generate generate bitmap strings from the character tables.
 */
function createButtons() {
    let genBtnDiv = document.getElementById("genBtnDiv");
    let optionsFoot = document.getElementById("optionsFoot");

    let genBtn = document.createElement("button");
    genBtn.innerHTML = "Generate";
    genBtn.addEventListener("click", eventClickBtnGenerate, false);
    genBtnDiv.appendChild(genBtn);

    let optionsBtn = document.createElement("button");
    optionsBtn.innerHTML = "Create Tables";
    optionsBtn.addEventListener("click", eventClickBtnCreateTables, false);
    optionsFoot.appendChild(optionsBtn);
}

/*
 * Creates input fields for the options.
 * Rows Number of 16-bit words in each bitmap (i.e. char height).
 * Cols Number of bits per word. Should be 16 for the SSD1306 library.
 * Pad Top How many rows from the top to zero out (i.e. make undrawable).
 * Pad Bottom How many rows from the bottom to zero out.
 * Pad Left How many rows from the left to zero out.
 * Pad Right How many rows from the right to zero out.
 *
 * The fonts that come with the library seem to always have quite a bit of
 * padding on the bottom and right. See the built-in bitmaps for an example
 * of how to best adjust padding.
 */
function createInputFields() {
    let inputDiv = document.getElementById("inputDiv");
    let br = document.createElement('br');

    let inputRows = document.createElement("input");
    let inputCols = document.createElement("input");
    let inputPadTop = document.createElement("input");
    let inputPadBottom = document.createElement("input");
    let inputPadLeft = document.createElement("input");
    let inputPadRight = document.createElement("input");

    let inputs = [inputRows, inputCols, inputPadTop, inputPadBottom, inputPadLeft, inputPadRight];

    for (var i = 0; i < inputs.length; i++) {
        inputs[i].type = "text";
        inputs[i].className = "inputField";
    }
    inputRows.id = "inputRows";
    inputRows.defaultValue = numRows;
    inputCols.id = "inputCols";
    inputCols.defaultValue = numCols;
    inputPadTop.id = "inputPadTop";
    inputPadTop.defaultValue = padTop;
    inputPadBottom.id = "inputPadBottom";
    inputPadBottom.defaultValue = padBottom;
    inputPadLeft.id = "inputPadLeft";
    inputPadLeft.defaultValue = padLeft;
    inputPadRight.id = "inputPadRight";
    inputPadRight.defaultValue = padRight;
    for (var i = 0; i < inputs.length; i++) {
        var td = document.getElementById(`tdIn${i}`);
        td.appendChild(inputs[i]);
    }
}

/* 
 * Creates the output field for the bitmaps. 
 */
function createOutputField() {
    var outputDiv = document.getElementById("outputDiv");
    var input = document.createElement("textarea");
    input.rows = numRows +
        1;
    input.id = "outputField";
    outputDiv.appendChild(input);
}

/* 
 * Scales the output field to fit its text contents. */
function outputFieldRefreshDims() {
    document.getElementById("outputField").style.height = document.getElementById("outputField").scrollHeight + 5 + 'px';
}

/*
 * Event click function for the "Create Tables" button.
 * Generates a new set of tables based on the options
 * and clears the output field.
 */
function eventClickBtnCreateTables(e) {
    document.getElementById("outputField").value = "";
    outputFieldRefreshDims();
    document.getElementById("tablesDiv").innerHTML = "";

    numRows = parseInt(document.getElementById("inputRows").value, 10);
    numCols = parseInt(document.getElementById("inputCols").value, 10);
    padTop = parseInt(document.getElementById("inputPadTop").value, 10);
    padBottom = parseInt(document.getElementById("inputPadBottom").value, 10);
    padLeft = parseInt(document.getElementById("inputPadLeft").value, 10);
    padRight = parseInt(document.getElementById("inputPadRight").value, 10);

    initAllTables();
}

/*
 * Event click handler for the "Generate" button.
 *
 * Generates bitmaps for every character and displays
 * it in the textarea.
 */
function eventClickBtnGenerate() {
    outputBitmaps();
}

/*
 * Event MouseDown function that turns cells on if a cell is 
 * left-clicked and off if a cell is right-clicked. 
 * 
 * Also sets the global isMouseDown flag used for click + drag actions. 
 */
function eventCellMouseDown(e) {
    e.preventDefault();
    isMouseDown = true;

    var td = event.target;
    while (td !== this && !td.matches("td")) {
        td = td.parentNode;
    }
    if (td !== this) {
        if (e.which === 1) {
            selectCell(td);
        } else if (e.which === 3) {
            deselectCell(td);
        }
    }
}

/*
 * Event MouseUp function that unsets the isMouseDown flag
 * to stop cell drawing actions. 
 */
function eventCellMouseUp(e) {
    e.preventDefault();
    isMouseDown = false;
}

/*
 * Event MouseOver function that allows for click + drag editing.
 * LMB Click + Drag  Set cell
 * RMB Click + Drag  Unset cell
 */
function eventCellMouseOver(e) {
    e.preventDefault();

    var td = event.target;
    while (td !== this && !td.matches("td")) {
        td = td.parentNode;
    }
    if (td !== this && isMouseDown) {
        if (e.which === 1) {
            selectCell(td);
        } else if (e.which === 3) {
            deselectCell(td);
        }
    }
}

/*
 * Event MouseOut function which unsets the flag indicating
 * if the mouse button is down to cut off cell editing if
 * the mouse leaves the cell area.
 */
function eventCellMouseOut(e) {
    e.preventDefault();
    isMouseDown = false;
}

// Want to use RMB to delete cells
window.addEventListener("contextmenu", e => e.preventDefault());

init();