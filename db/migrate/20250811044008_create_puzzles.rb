class CreatePuzzles < ActiveRecord::Migration[8.0]
  def change
    create_table :puzzles do |t|
      t.text :problem
      t.text :solution
      t.integer :difficulty

      t.timestamps
    end
  end
end
