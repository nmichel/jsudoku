define(
    // Despite it doesn't directly use it, "sukoku_view" depends on "sudoku" for
    // all class definitions to be loaded.
    // 
    ["app/sudoku", "jquery"],
    function(Sudoku, $) {
        function SudokuView(model, eltName) {
            this.model = model;

            this.$currentCell = null;

            var $elt = $("#" + eltName);
            var $grid = $("<div class='sudoku_grid'></div>");
            $elt.append($grid);

            var gridView = this;

            for (var iter = 1; iter <= 9*9; ++iter) {
                var cellId = iter;
                $grid.append("<div class='sudoku_grid_cell'><span id='cell" + iter + "'>?</span></div>");
            }

            $(".sudoku_grid_cell").click(function() {
                if (gridView.$currentCell != null) {
                    gridView.$currentCell.removeClass("cell_selected");
                }

                gridView.$currentCell = $(this);
                gridView.$currentCell.addClass("cell_selected");

                var val = parseInt($("input").val());
                var $span = $(this).children("span");
                var id = parseInt($span.attr("id").substr(4))-1; // -1 to shift origin to 0

                model.setCellValue(id%9, ~~(id/9), val);

                // $span.html(val);
            });
        }

        SudokuView.prototype = {};
        SudokuView.prototype.constructor = SudokuView;

        SudokuView.prototype.cellChanged = function(posX, posY, value) {
            $("#cell"+(posY*9+posX+1)).html(value);
        };

        return SudokuView;
    }
);
