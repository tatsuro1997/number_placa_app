class Puzzle < ApplicationRecord
  def cells
    problem.chars.each_slice(9).to_a
  end
end
