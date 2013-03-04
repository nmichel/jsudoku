define(
    ["app/sudoku"],
    function() {
        function SudokuSolver() {
            this.sodoku = null;
        }

        SudokuSolver.prototype = {};
        SudokuSolver.prototype.constructor = SudokuSolver;

        SudokuSolver.prototype.solve = function(model) {
            var cellCoords = model.getFreeCells(); // [[X0, Y0], [X1, Y1], ..., [Xn, Yn]]
            if (cellCoords.length == 0) {
                return; // <== Nothing to do because no free cells.
            }

            var stack = [];
            var currentCellId = 0;

            var coords = cellCoords[currentCellId];
            stack.push({
                cellCoords: coords,
                cellFreeValues: model.getFreeValuesForCell(coords[0], coords[1]), // [V1, V2, ... Vn]
                idxNextValue: 0
            });

            while (stack.length > 0) {
                var cellDesc = stack[stack.length-1];

                if (cellDesc.idxNextValue == cellDesc.cellFreeValues.length) {
                    var posX = cellDesc.cellCoords[0];
                    var posY = cellDesc.cellCoords[1];
                    model.resetCell(posX, posY);
                    stack.pop();
                    --currentCellId;
                    continue; // <== Current cell has no more free values to test.
                }

                var nextValue = cellDesc.cellFreeValues[cellDesc.idxNextValue];
                var posX = cellDesc.cellCoords[0];
                var posY = cellDesc.cellCoords[1];
                ++cellDesc.idxNextValue;

                var retValue = model.setCellValue(posX, posY, nextValue);
                if (retValue == nextValue) {
                    continue; // <== Value doesn't fit.
                }

                if (currentCellId == cellCoords.length-1) {
                    break; // <== Found a fitting value for the last cell. Grid solved !
                }

                // Stack the next free cell
                // 
                ++currentCellId;
                var coords = cellCoords[currentCellId];
                stack.push({
                    cellCoords: coords,
                    cellFreeValues: model.getFreeValuesForCell(coords[0], coords[1]),
                    idxNextValue: 0
                });
            }
        };


        return SudokuSolver;
    }
);
