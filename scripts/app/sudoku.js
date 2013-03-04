define(
    [],
    function() {
        function Cell(cluster, row, column) {
            this.cluster = cluster;
            this.row = row;
            this.column = column;
            this.value = Cell.NO_VALUE;
        }

        Cell.NO_VALUE = -1;

        Cell.prototype = {};
        Cell.prototype.constructor = Cell;

        Cell.prototype.getPos = function() {
            return [this.column.getId(), this.row.getId()];
        };

        Cell.prototype.getValue = function() {
            return this.value; // <== 
        };

        Cell.prototype.isFreeValue = function(value) {
            return (this.row.isAllowedValue(value)
                && this.column.isAllowedValue(value)
                && this.cluster.isAllowedValue(value));
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
            for (var iter = 1; iter <= 9; ++iter) {
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

        function Cluster() {
            CellSet.call(this);
        }

        Cluster.prototype = new CellSet();
        Cluster.prototype.constructor = Cluster;

        // -----

        function Row(id) {
            CellSet.call(this);
            this.id = id;
        };

        Row.prototype = new CellSet();
        Row.prototype.constructor = Row;

        Row.prototype.getId = function() {
            return this.id;
        };

        // -----

        function Column(id) {
            CellSet.call(this);
            this.id = id;
        };

        Column.prototype = new CellSet();
        Column.prototype.constructor = Column;

        Column.prototype.getId = function() {
            return this.id;
        };

        // -----

        function Grid() {
            this.cells = [];
            this.rows = [];
            this.columns = [];
            this.clusters = [];

            for (var iter = 0; iter < Grid.CLUSTER_NUMBER ; ++iter) {
                this.clusters.push(new Cluster());
            }

            for (var iter = 0; iter < Grid.SIDE_SIZE; ++iter) {
                this.columns.push(new Column(iter));
            }

            for (var iter = 0; iter < Grid.SIDE_SIZE; ++iter) {
                this.rows.push(new Row(iter));
            }

            for (var iter = 0; iter < Grid.SIDE_SIZE * Grid.SIDE_SIZE; ++iter) {
                var cellX = iter % Grid.SIDE_SIZE;
                var cellY = ~~(iter / Grid.SIDE_SIZE);

                var clusterX = ~~(cellX / Grid.CLUSTER_WIDTH);
                var clusterY = ~~(cellY / Grid.CLUSTER_HEIGHT);
                var clusterId = clusterY * ~~(Grid.SIDE_SIZE / Grid.CLUSTER_WIDTH) + clusterX;

                var cluster = this.clusters[clusterId];
                var row = this.rows[cellY];
                var column = this.columns[cellX];

                var cell = new Cell(cluster, row, column);

                this.cells.push(cell);
                cluster.addCell(cell);
                row.addCell(cell);
                column.addCell(cell);
            }
        };

        Grid.CLUSTER_WIDTH = 3;
        Grid.CLUSTER_HEIGHT = 3;
        Grid.SIDE_SIZE = Grid.CLUSTER_WIDTH * Grid.CLUSTER_HEIGHT; 
        Grid.CLUSTER_NUMBER = Grid.SIDE_SIZE; // = SIDE_SIZE/CLUSTER_WIDTH * SIDE_SIZE/CLUSTER_HEIGHT = SIDE_SIZE^2/(CLUSTER_WIDTH*CLUSTER_HEIGHT) = SIDE_SIZE

        Grid.prototype = {};
        Grid.prototype.constructor = Grid;

        Grid.prototype.getCellAtPos = function(posX, posY) {
            // TODO : check posX, posY

            return this.cells[posY*Grid.SIDE_SIZE+posX];
        };

        Grid.prototype.setCellValue = function(posX, posY, value) {
            // TODO : check posX, posY, value

            return this.getCellAtPos(posX, posY).setValue(value);
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

        function Sudoku() {
            this.grid = new Grid();
            this.observers = [];
        };

        Sudoku.prototype = {};
        Sudoku.prototype.constructor = Sudoku;

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
