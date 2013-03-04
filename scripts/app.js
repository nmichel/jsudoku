requirejs.config({
    //By default load any module IDs from js/lib
    baseUrl: "scripts/lib",
    //except, if the module ID starts with "app",
    //load it from the js/app directory. paths
    //config is relative to the baseUrl, and
    //never includes a ".js" extension since
    //the paths config could be for a directory.
    paths: {
        "app": "../app"
    },
    // Explicit dependencies (e.g. modules defining dummy jquery extensions)
    shim: {
    }
});

require(["jquery", "app/sudoku", "app/sudoku_view", "app/sudoku_solver"], function($, Sudoku, SudokuView, SudokuSolver) {
    console.log("Sudoku loaded");
    var sudokuGrid = new Sudoku(2, 2);
    var sudokuView = new SudokuView(sudokuGrid, "sudoku_container");
    sudokuGrid.addObserver(sudokuView);
/*    sudokuGrid.setup(
        [[1, 0, 4],
         [2, 0, 3]]);*/
    $("#button_solve").click(function() {
        var sudokuSolver = new SudokuSolver();
        sudokuSolver.solve(sudokuGrid);
    });
});

require(["jquery"], function($) {
    console.log("jquery loaded");
});
