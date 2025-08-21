class Puzzle < ApplicationRecord
  def to_cells(string)
    string.chars.each_slice(9).to_a
  end

  def problem_cells
    to_cells(problem)
  end

  def solution_cells
    to_cells(solution)
  end

  def completed_with_inputs?(user_inputs)
    solution_cells == user_inputs
  end
end
