define(
    [],
    function() {
        function Cell(coords) {
            this.value = Cell.NO_VALUE;
            this.coords = coords;
            this.groups = [];
        }

        Cell.NO_VALUE = -1;

        Cell.prototype = {};
        Cell.prototype.constructor = Cell;

        Cell.prototype.addToSet = function(cellSet) {
            this.groups.push(cellSet);
            cellSet.addCell(this);
        };

        Cell.prototype.getPos = function() {
            return this.coords;
        };

        Cell.prototype.getValue = function() {
            return this.value; // <== 
        };

        Cell.prototype.isFreeValue = function(value) {
            for (var iter = 0; iter < this.groups.length; ++iter) {
                if (! this.groups[iter].isAllowedValue(value)) {
                    return false; // <== 
                }
            }

            return true; // <== 
        };

        Cell.prototype.setValue = function(value) {
            if (this.value == value) {
                return value; // <== 
            }

            if (this.isFreeValue(value)) {
                var oldValue = this.value;
                this.value = value;
                return oldValue; // <== 
            }

            return value;
        };

        Cell.prototype.getFreeValues = function() {
            var res = [];
            // All groups share the same size
            for (var iter = 1; iter <= this.groups[0].getSize(); ++iter) {
                if (this.isFreeValue(iter)) {
                    res.push(iter);
                }
            }
            return res; // <== 
        };

        Cell.prototype.reset = function() {
            this.value = Cell.NO_VALUE;
        };

        // -----

        function CellSet() {
            this.cells = [];
        }

        CellSet.prototype = {};
        CellSet.prototype.constructor = CellSet;

        CellSet.prototype.getSize = function() {
            return this.cells.length; // <== 
        };

        CellSet.prototype.addCell = function(cell) {
            this.cells.push(cell);
        };

        CellSet.prototype.isAllowedValue = function(value) {
            for (var iter = 0; iter < this.cells.length; ++iter) {
                if (this.cells[iter].getValue() == value) {
                    return false; // <== 
                }
            }

            return true; // <== 
        };

        // -----

        function Grid(clusterWidth, clusterHeight) {
            this.clusterWidth = clusterWidth;
            this.clusterHeight = clusterHeight;
            this.sideSize = this.clusterWidth * this.clusterHeight;
            this.clusterNumber = this.sideSize; // = SIDE_SIZE/CLUSTER_WIDTH * SIDE_SIZE/CLUSTER_HEIGHT = SIDE_SIZE^2/(CLUSTER_WIDTH*CLUSTER_HEIGHT) = SIDE_SIZE

            this.cells = [];
            this.rows = [];
            this.columns = [];
            this.clusters = [];

            for (var iter = 0; iter < this.clusterNumber ; ++iter) {
                this.clusters.push(new CellSet());
            }

            for (var iter = 0; iter < this.sideSize; ++iter) {
                this.columns.push(new CellSet());
            }

            for (var iter = 0; iter < this.sideSize; ++iter) {
                this.rows.push(new CellSet());
            }

            for (var yter = 0; yter < this.sideSize; ++yter) {
                for (var xter = 0; xter < this.sideSize; ++xter) {
                    var cellX = xter;
                    var cellY = yter;

                    var clusterX = ~~(cellX / this.clusterWidth);
                    var clusterY = ~~(cellY / this.clusterHeight);
                    var clusterId = clusterY * ~~(this.sideSize / this.clusterWidth) + clusterX;

                    var cluster = this.clusters[clusterId];
                    var row = this.rows[cellY];
                    var column = this.columns[cellX];

                    var cell = new Cell([xter, yter]);
                    cell.addToSet(cluster);
                    cell.addToSet(row);
                    cell.addToSet(column);
                    this.cells.push(cell);
                }
            }
        };

        Grid.prototype = {};
        Grid.prototype.constructor = Grid;

        Grid.prototype.getSideSize = function() {
            return this.sideSize; // <== 
        };

        Grid.prototype.getCellAtPos = function(posX, posY) {
            // TODO : check posX, posY

            return this.cells[posY*this.sideSize+posX]; // <== 
        };

        Grid.prototype.setCellValue = function(posX, posY, value) {
            // TODO : check posX, posY, value

            return this.getCellAtPos(posX, posY).setValue(value); // <== 
        };

        Grid.prototype.getFreeCells = function() {
            var res = [];
            for (var iter = 0; iter < this.cells.length; ++iter) {
                var cell = this.cells[iter];
                if (cell.getValue() == Cell.NO_VALUE) {
                    res.push(cell);
                }
            }
            return res; // <== 
        };

        Grid.prototype.getFreeValuesForCell = function(posX, posY) {
            return this.getCellAtPos(posX, posY).getFreeValues();
        };

        Grid.prototype.resetCell = function(posX, posY) {
            this.getCellAtPos(posX, posY).reset();
        };

        // -----

        function Sudoku(clusterWidth, clusterHeight) {
            this.grid = new Grid(clusterWidth || Sudoku.DEFAULT_CLUSTER_WIDTH, clusterHeight || Sudoku.DEFAULT_CLUSTER_HEIGHT);
            this.observers = [];
        };

        Sudoku.DEFAULT_CLUSTER_WIDTH = 3;
        Sudoku.DEFAULT_CLUSTER_HEIGHT = 3;

        Sudoku.prototype = {};
        Sudoku.prototype.constructor = Sudoku;

        Sudoku.prototype.getSideSize = function() {
            return this.grid.getSideSize(); // <== 
        };

        Sudoku.prototype.addObserver = function(observer) {
            this.observers.push(observer);
        };

        Sudoku.prototype.setup = function(gridData) {
            for (var iter = 0; iter < gridData.length; ++iter) {
                var posX = gridData[iter][0];
                var posY = gridData[iter][1];
                var value = gridData[iter][2];
                this.setCellValue(posX, posY, value);
            }
        };

        Sudoku.prototype.setCellValue = function(posX, posY, value) {
            var res = this.grid.setCellValue(posX, posY, value);
            if (res != value) {
                this.observers.forEach(function(elt) {
                    elt.cellChanged(posX, posY, value);
                });
            }
            return res; // <== 
        };

        Sudoku.prototype.getFreeCells = function() {
            var freeCells = this.grid.getFreeCells();
            var res = [];
            for (var iter = 0; iter < freeCells.length; ++iter) {
                res.push(freeCells[iter].getPos());
            }
            return res; // <== 
        };

        Sudoku.prototype.getFreeValuesForCell = function(posX, posY) {
            return this.grid.getFreeValuesForCell(posX, posY); // <== 
        };
        
        Sudoku.prototype.resetCell = function(posX, posY) {
            this.grid.resetCell(posX, posY);
            this.observers.forEach(function(elt) {
                elt.cellChanged(posX, posY, Cell.NO_VALUE);
            });
        };

        return Sudoku;
    }
);
