class Puzzle < ApplicationRecord
  def cells
    problem.chars.each_slice(9).to_a
  end

  def completed_with_inputs?(user_inputs)
    puts user_inputs.inspect
    solution == user_inputs
  end
end
