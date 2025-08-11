class PuzzlesController < ApplicationController
  def show
    @puzzle = Puzzle.find(params[:id])
  end
end
