module PuzzlesHelper
  def cell_classes(row_index, col_index, is_initial_value, has_user_input)
    classes = [ "flex items-center justify-center text-2xl bg-white border border-gray-300" ]

    classes << "border-t-2 border-t-gray-700" if border_top?(row_index)
    classes << "border-l-2 border-l-gray-700" if border_left?(col_index)

    classes << "font-semibold cursor-pointer" if is_initial_value
    classes << "text-gray-800 font-black" if has_user_input

    classes.join(" ")
  end

  private

  def border_top?(row_index)
    row_index % 3 == 0 && row_index.nonzero?
  end

  def border_left?(col_index)
    col_index % 3 == 0 && col_index.nonzero?
  end
end
