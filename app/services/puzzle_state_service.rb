class PuzzleStateService
  def initialize(cookies)
    @cookies = cookies
  end

  def get_state(puzzle_id)
    state_json = @cookies["puzzle_#{puzzle_id}"]
    return {} unless state_json
    JSON.parse(state_json)
  rescue JSON::ParserError
    {}
  end

  def save_input(puzzle, row, col, value)
    state = get_state(puzzle.id)
    state["user_inputs"] ||= puzzle.cells
    state["user_inputs"][row.to_i][col.to_i] = value

    state["last_played"] = Time.current.to_i
    save_state(puzzle.id, state)
  end

  def mark_completed(puzzle_id, completion_time)
    state = get_state(puzzle_id)
    state["completed"] = true
    state["completed_at"] = Time.current.to_i
    state["completion_time_seconds"] = completion_time
    save_state(puzzle_id, state)
  end

  def user_inputs(puzzle_id)
    state = get_state(puzzle_id)
    state["user_inputs"] || {}
  end

  def completion_info(puzzle_id)
    state = get_state(puzzle_id)
    return nil unless state["completed"]

    {
      completed_at: Time.at(state["completed_at"]),
      completion_time: state["completion_time_seconds"]
    }
  end

  def reset_state(puzzle_id)
    @cookies.delete("puzzle_#{puzzle_id}")
  end

  private

  def save_state(puzzle_id, state)
    @cookies["puzzle_#{puzzle_id}"] = {
      value: state.to_json,
      expires: 30.days.from_now
    }
  end
end
