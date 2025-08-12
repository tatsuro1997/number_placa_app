class PuzzlesController < ApplicationController
  def show
    @puzzle = Puzzle.find(params[:id])
  end

  def update
    @row = params[:row]
    @col = params[:col]
    @value = params[:value]

    respond_to do |format|
      format.turbo_stream
    end
  end
end
