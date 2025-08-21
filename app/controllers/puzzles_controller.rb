class PuzzlesController < ApplicationController
  before_action :set_puzzle, only: %i[show update reset]
  before_action :initialize_puzzle_state_service, only: %i[show update reset]

  def show
    @user_inputs_array = @puzzle_state_service.user_inputs(@puzzle.id) || @puzzle.problem_cells
    @completion_info = @puzzle_state_service.completion_info(@puzzle.id)
  end

  def update
    @row = params[:row]
    @col = params[:col]
    @value = params[:value]

    @puzzle_state_service.save_input(@puzzle, @row, @col, @value)

    user_inputs = @puzzle_state_service.user_inputs(@puzzle.id)
    if user_inputs.any? { _1.exclude?("0") }
      return unless @puzzle.completed_with_inputs?(user_inputs)

      @puzzle_state_service.mark_completed(@puzzle.id, params[:time])
    end

    respond_to do |format|
      format.turbo_stream
    end
  end

  def reset
    @puzzle_state_service.reset_state(@puzzle.id)
    redirect_to puzzle_path(@puzzle), notice: "パズルをリセットしました"
  end

  private

  def set_puzzle
    @puzzle = Puzzle.find(params[:id])
  end

  def initialize_puzzle_state_service
    @puzzle_state_service = PuzzleStateService.new(cookies)
  end
end
