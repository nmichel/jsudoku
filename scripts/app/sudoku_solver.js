// Credit goes to http://sedition.com/perl/javascript-fy.html
// 
function fisherYates ( myArray ) {
  var i = myArray.length, j, tempi, tempj;
  if ( i == 0 ) return false;
  while ( --i ) {
     j = Math.floor( Math.random() * ( i + 1 ) );
     tempi = myArray[i];
     tempj = myArray[j];
     myArray[i] = tempj;
     myArray[j] = tempi;
   }
}

define(
    ["app/sudoku"],
    function() {
        function SudokuSolver() {
            this.model = null;
        }

        SudokuSolver.prototype = {};
        SudokuSolver.prototype.constructor = SudokuSolver;

        SudokuSolver.prototype.solveStart = function(model, options) {
            var shuffle = (options && options.shuffle) || false; // Yes, I known, '|| false' should be omitted.

            this.model = model;
            this.stack = [];
            this.currentCellId = 0;
            this.cellCoords = model.getFreeCells(); // [[X0, Y0], [X1, Y1], ..., [Xn, Yn]]
            if (this.cellCoords.length == 0) {
                return; // <== Nothing to do because no free cells.
            }

            if (shuffle) {
                fisherYates(this.cellCoords);
            }

            var coords = this.cellCoords[this.currentCellId];
            this.stack.push({
                cellCoords: coords,
                cellFreeValues: this.model.getFreeValuesForCell(coords[0], coords[1]), // [V1, V2, ... Vn]
                idxNextValue: 0
            });

        }

        SudokuSolver.prototype.solveStep = function() {
            if (this.stack.length == 0) {
                return false; // <== 
            }

            var cellDesc = this.stack[this.stack.length-1];

            if (cellDesc.idxNextValue == cellDesc.cellFreeValues.length) {
                var posX = cellDesc.cellCoords[0];
                var posY = cellDesc.cellCoords[1];
                this.model.resetCell(posX, posY);
                this.stack.pop();
                --this.currentCellId;
                return true; // <== Current cell has no more free values to test.
            }

            var nextValue = cellDesc.cellFreeValues[cellDesc.idxNextValue];
            var posX = cellDesc.cellCoords[0];
            var posY = cellDesc.cellCoords[1];
            ++cellDesc.idxNextValue;

            var retValue = this.model.setCellValue(posX, posY, nextValue);
            if (retValue == nextValue) {
                return true; // <== Value doesn't fit.
            }

            if (this.currentCellId == this.cellCoords.length-1) {
                return false; // <== Found a fitting value for the last cell. Grid solved !
            }

            // Stack the next free cell
            // 
            ++this.currentCellId;
            var coords = this.cellCoords[this.currentCellId];
            this.stack.push({
                cellCoords: coords,
                cellFreeValues: this.model.getFreeValuesForCell(coords[0], coords[1]),
                idxNextValue: 0
            });

            return true; // <== 
        };


        return SudokuSolver;
    }
);
