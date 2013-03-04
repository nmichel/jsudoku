define(
    // Despite it doesn't directly use it, "sukoku_view" depends on "sudoku" for
    // all class definitions to be loaded.
    // 
    ["app/sudoku", "jquery"],
    function(Sudoku, $) {
        function SudokuView(model, eltName) {
            this.model = model;
            this.gridSideSize = model.getSideSize();

            this.$currentCell = null;

            var $elt = $("#" + eltName);
            var $grid = $("<div class='sudoku_grid'></div>");
            $elt.append($grid);

            var gridView = this;

            var cellId = 1;
            for (var iter = 0; iter < this.gridSideSize; ++iter) {
                for (var xter = 0; xter < this.gridSideSize; ++xter) {
                    $grid.append("<div class='sudoku_grid_cell'><span id='cell" + cellId + "'>?</span></div>");
                    ++cellId;
                }
                $grid.append("<div class='sudoku_grid_row_end'></div>");
            }

            var gridSideSize = this.gridSideSize;
            $(".sudoku_grid_cell").click(function() {
                if (gridView.$currentCell != null) {
                    gridView.$currentCell.removeClass("cell_selected");
                }

                gridView.$currentCell = $(this);
                gridView.$currentCell.addClass("cell_selected");

                var val = parseInt($("input").val());
                var $span = $(this).children("span");
                var id = parseInt($span.attr("id").substr(4))-1; // -1 to shift origin to 0

                model.setCellValue(id%gridSideSize, ~~(id/gridSideSize), val);

                // $span.html(val);
            });
        }

        SudokuView.prototype = {};
        SudokuView.prototype.constructor = SudokuView;

        SudokuView.prototype.cellChanged = function(posX, posY, value) {
            $("#cell"+(posY*this.gridSideSize+posX+1)).html(value);
        };

        return SudokuView;
    }
);
