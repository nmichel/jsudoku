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
    var sudokuGrid = new Sudoku(4, 4);
    var sudokuView = new SudokuView(sudokuGrid, "sudoku_container");
    sudokuGrid.addObserver(sudokuView);
/*    sudokuGrid.setup(
        [[1, 0, 4],
         [2, 0, 3]]);*/

/*
    var rawSolve = function() {
        var sudokuSolver = new SudokuSolver();
        sudokuSolver.solveStart(sudokuGrid);
        while (true) {
            var cont = sudokuSolver.solveStep();
            if (cont) {
                continue; // <== 
            }
            break; // <== 
        }
    };
*/

    $("#button_solve").click(function() {
        var sudokuSolver = new SudokuSolver();
        sudokuSolver.solveStart(sudokuGrid, {shuffle: false});
        var stepCount = 1;
        var solveStep = function() {
            var cont = sudokuSolver.solveStep();
            if (cont) {
                $("#step_count").html(stepCount++);
                setTimeout(solveStep, 1);
            }
        };
        setTimeout(solveStep, 1); // Boostrap
    });
});

require(["jquery"], function($) {
    console.log("jquery loaded");
});
